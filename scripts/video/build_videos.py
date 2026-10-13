"""Turns captured slides into narrated MP4 videos.

    python scripts/video/build_videos.py --models <dir with Kokoro files> [--work .video-build]
        [--out public/videos] [--voice af_heart] [--speed 1.0] [id ...]

For each visualization captured by capture.mjs, every slide's narration is
spoken with the open-weight Kokoro TTS model, each slide stays on screen for
as long as its narration (plus a short pause), and ffmpeg encodes the result
as H.264 video with AAC audio. A manifest with each video's duration and size
is written to components/visualizer/videos.json for the site's video button.

Requirements: ffmpeg on PATH, and `pip install kokoro-onnx soundfile` with
kokoro-v1.0.int8.onnx and voices-v1.0.bin downloaded into --models
(https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0).
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

LEAD_IN = 0.3        # silence before the first word, seconds
PAUSE_AFTER = 0.6    # pause after each slide's narration
TITLE_HOLD = 0.8     # extra time on the title card
OUTRO_HOLD = 1.5     # extra time on the closing card


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("ids", nargs="*", help="visualization ids (default: everything in --work)")
    parser.add_argument("--work", default=".video-build", help="directory written by capture.mjs")
    parser.add_argument("--out", default="public/videos", help="where to write the MP4 files")
    parser.add_argument("--models", required=True, help="directory with the Kokoro model files")
    parser.add_argument("--voice", default="af_heart")
    parser.add_argument("--speed", type=float, default=1.0)
    parser.add_argument("--manifest", default="components/visualizer/videos.json")
    args = parser.parse_args()

    from kokoro_onnx import Kokoro  # imported here so --help works without the package

    models = Path(args.models)
    kokoro = Kokoro(str(models / "kokoro-v1.0.int8.onnx"), str(models / "voices-v1.0.bin"))
    work, out = Path(args.work), Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    ids = args.ids or sorted(p.name for p in work.iterdir() if (p / "script.json").exists())
    manifest_path = Path(args.manifest)
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}

    for vid in ids:
        duration = build_one(kokoro, work / vid, out / f"{vid}.mp4", args.voice, args.speed)
        size = (out / f"{vid}.mp4").stat().st_size
        manifest[vid] = {"duration": round(duration, 1), "bytes": size}
        print(f"{vid}: {duration:.1f}s, {size / 1_000_000:.2f} MB")

    manifest_path.write_text(json.dumps(dict(sorted(manifest.items())), indent=2) + "\n")


def build_one(kokoro, folder: Path, target: Path, voice: str, speed: float) -> float:
    script = json.loads((folder / "script.json").read_text())
    slides = sorted(folder.glob("slide-*.png"))
    narration = script["narration"]
    if len(slides) != len(narration):
        sys.exit(f"{folder.name}: {len(slides)} slides but {len(narration)} narration lines")

    sample_rate = 24000
    track = [np.zeros(int(LEAD_IN * sample_rate), dtype=np.float32)]
    durations = []
    for i, text in enumerate(narration):
        audio, sample_rate = kokoro.create(text, voice=voice, speed=speed, lang="en-us")
        hold = PAUSE_AFTER + (TITLE_HOLD if i == 0 else 0) + (OUTRO_HOLD if i == len(narration) - 1 else 0)
        segment = np.concatenate([audio.astype(np.float32), np.zeros(int(hold * sample_rate), dtype=np.float32)])
        if i == 0:
            segment = np.concatenate([track.pop(), segment])  # the lead-in belongs to the title card
        track.append(segment)
        durations.append(len(segment) / sample_rate)

    audio_path = folder / "narration.wav"
    sf.write(audio_path, np.concatenate(track), sample_rate)

    # ffmpeg's concat demuxer shows each image for its duration; the last
    # image is listed twice so its duration is honoured.
    concat = folder / "slides.txt"
    lines = []
    for slide, seconds in zip(slides, durations):
        lines += [f"file '{slide.resolve()}'", f"duration {seconds:.3f}"]
    lines.append(f"file '{slides[-1].resolve()}'")
    concat.write_text("\n".join(lines) + "\n")

    subprocess.run(
        [
            "ffmpeg", "-y", "-loglevel", "error",
            "-f", "concat", "-safe", "0", "-i", str(concat),
            "-i", str(audio_path),
            "-vf", "fps=30,format=yuv420p",
            "-c:v", "libx264", "-preset", "slow", "-tune", "stillimage", "-crf", "24",
            "-c:a", "aac", "-b:a", "96k", "-ac", "1",
            "-shortest", "-movflags", "+faststart",
            str(target),
        ],
        check=True,
    )
    return sum(durations)


if __name__ == "__main__":
    main()
