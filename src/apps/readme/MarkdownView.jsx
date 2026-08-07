const HEADING_CLASSES = {
  1: 'font-display text-[15px] text-os-ink mt-1',
  2: 'font-display text-[12px] text-os-ink mt-4',
  3: 'font-display text-[10px] text-os-ink-soft mt-3',
};

function Spans({ spans }) {
  return spans.map((span, i) => {
    if (span.href) {
      return (
        <a
          key={i}
          href={span.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-os-accent underline decoration-dotted hover:opacity-80"
        >
          {span.text}
        </a>
      );
    }
    if (span.code) {
      return (
        <code key={i} className="rounded bg-os-surface-2 px-1 py-0.5 font-mono text-[12px] text-os-ink">
          {span.text}
        </code>
      );
    }
    let content = span.text;
    if (span.bold) content = <strong key={i}>{content}</strong>;
    if (span.italic) content = <em key={i}>{content}</em>;
    return <span key={i}>{content}</span>;
  });
}

export default function MarkdownView({ blocks }) {
  return (
    <div className="flex flex-col gap-2 text-[13px] leading-relaxed text-os-ink">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <h1 key={i} className={HEADING_CLASSES[block.level]}>
                <Spans spans={block.spans} />
              </h1>
            );
          case 'paragraph':
            return (
              <p key={i} className="text-os-ink-soft">
                <Spans spans={block.spans} />
              </p>
            );
          case 'list':
            return (
              <ul key={i} className="ml-1 flex flex-col gap-1">
                {block.items.map((spans, j) => (
                  <li key={j} className="flex gap-2 text-os-ink-soft">
                    <span className="text-os-accent">▹</span>
                    <span>
                      <Spans spans={spans} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          case 'code':
            return (
              <pre
                key={i}
                className="overflow-x-auto rounded-lg border-2 border-os-border bg-os-surface-2 p-2.5 font-mono text-[12px] text-os-ink"
              >
                {block.text}
              </pre>
            );
          case 'rule':
            return <hr key={i} className="border-os-border" />;
          default:
            return null;
        }
      })}
    </div>
  );
}
