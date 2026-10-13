import { Children, isValidElement, type ReactNode } from "react";
import { CodeTabsClient } from "./CodeTabsClient";

// Finds the language rehype-pretty-code put on the rendered code block.
function findLanguage(node: ReactNode): string | null {
  if (!isValidElement(node)) return null;
  const props = node.props as Record<string, unknown>;
  if (typeof props["data-language"] === "string") return props["data-language"];
  for (const child of Children.toArray(props.children as ReactNode)) {
    const language = findLanguage(child);
    if (language) return language;
  }
  return null;
}

// Wraps several fenced code blocks (one per language) into a tabbed view:
//
// <CodeTabs>
// ```python
// ...
// ```
// ```java
// ...
// ```
// </CodeTabs>
export function CodeTabs({ children }: { children: ReactNode }) {
  const blocks = Children.toArray(children).filter(isValidElement);
  const languages = blocks.map((block) => findLanguage(block) ?? "text");
  return <CodeTabsClient languages={languages}>{blocks}</CodeTabsClient>;
}
