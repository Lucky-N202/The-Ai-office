import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose-content space-y-4 leading-relaxed text-[var(--color-muted)]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // Strips any raw HTML down to a safe allowlist — matters here since
        // article content can come from the AI-drafted weekly digest, not
        // just hand-typed admin input.
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: (props) => <h2 className="mt-8 mb-3 text-2xl font-bold text-[var(--color-foreground)]" {...props} />,
          h2: (props) => <h3 className="mt-6 mb-2 text-xl font-semibold text-[var(--color-foreground)]" {...props} />,
          h3: (props) => <h4 className="mt-5 mb-2 text-lg font-semibold text-[var(--color-foreground)]" {...props} />,
          a: (props) => <a className="text-[var(--color-primary)]" target="_blank" rel="noopener noreferrer" {...props} />,
          code: (props) => <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-sm text-[var(--color-foreground)]" {...props} />,
          ul: (props) => <ul className="list-disc space-y-1 pl-5" {...props} />,
          ol: (props) => <ol className="list-decimal space-y-1 pl-5" {...props} />,
          blockquote: (props) => <blockquote className="border-l-2 border-[var(--color-primary)] pl-4 italic" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
