import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { Visualizer } from "@/components/visualizer/Visualizer";
import { Callout } from "./Callout";
import { Complexity, Difficulty, Problem } from "./Problem";

const components = {
  Callout,
  Complexity,
  Difficulty,
  Problem,
  Visualizer,
};

export function MDXContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [rehypePrettyCode, { theme: { light: "github-light", dark: "github-dark" }, keepBackground: false }],
          ],
        },
      }}
    />
  );
}
