# Narrated visualization videos

Every visualization can be watched or downloaded as a narrated MP4 (1920×1080,
H.264 + AAC). The videos and their poster images live in `public/videos/` and are listed in
`components/visualizer/videos.json`, which the site reads to show the
**Video** button. Regenerate them after changing a visualization's steps or
messages.

## How they're made

1. `capture.mjs` opens the hidden `/render/<id>` page, which draws each step as
   a 1280×720 frame (title card, every step with its caption, closing card), and
   screenshots every slide at 1.5× scale. It also saves the narration text for
   each slide (the same text the in-browser narration speaks).
2. `build_videos.py` speaks each slide's text with [Kokoro](https://github.com/thewh1teagle/kokoro-onnx),
   an open-weight (Apache-2.0) text-to-speech model that runs locally on the CPU,
   keeps each slide on screen for as long as its narration plus a short pause,
   and encodes the MP4 with ffmpeg. No API keys or paid services are involved.

## One-time setup

```bash
# ffmpeg (with libx264) on your PATH, e.g. `sudo apt install ffmpeg` or `brew install ffmpeg`
python3 -m venv .venv-video
.venv-video/bin/pip install kokoro-onnx soundfile

mkdir -p .video-models
BASE=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
curl -L -o .video-models/kokoro-v1.0.int8.onnx $BASE/kokoro-v1.0.int8.onnx
curl -L -o .video-models/voices-v1.0.bin $BASE/voices-v1.0.bin

npx playwright install chromium   # or set CHROMIUM_PATH to an existing Chromium
```

## Regenerating

```bash
npm run build && npm start            # in one terminal (serves http://localhost:3000)

npm run videos:capture                # all visualizations, or: npm run videos:capture -- two-sum-sorted
.venv-video/bin/python scripts/video/build_videos.py --models .video-models
```

Options for `build_videos.py`: `--voice` (default `af_heart`; others include
`af_bella`, `am_michael`, `bf_emma`), `--speed` (default `1.0`), and a list of
ids to rebuild only some videos.

### Troubleshooting

On some Linux machines the `espeakng-loader` package looks for its data in a
hard-coded path and fails with `Error processing file '/home/runner/work/...phontab'`.
Link that path to the bundled data:

```bash
DATA=$(.venv-video/bin/python -c "import espeakng_loader; print(espeakng_loader.get_data_path())")
sudo mkdir -p /home/runner/work/espeakng-loader/espeakng-loader/espeak-ng/_dynamic/share
sudo ln -sfn "$DATA" /home/runner/work/espeakng-loader/espeakng-loader/espeak-ng/_dynamic/share/espeak-ng-data
```
