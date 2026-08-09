import ReactMarkdown from "react-markdown";

type Props = {
  markdown: string;
  className?: string;
};

export function MarkdownBody({ markdown, className = "prose" }: Props) {
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          img: ({ src, alt }) =>
            src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={typeof src === "string" ? src : ""} alt={alt || ""} />
            ) : null,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
