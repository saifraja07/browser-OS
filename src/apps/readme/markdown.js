/**
 * Parses Markdown text into a flat array of block descriptors:
 *   { type: 'heading', level, spans }
 *   { type: 'paragraph', spans }
 *   { type: 'list', items: spans[][] }
 *   { type: 'code', text }
 *   { type: 'rule' }
 *
 * `spans` are inline-formatted fragments: { text, bold?, italic?, code?, href? }
 * This is intentionally not a full CommonMark implementation — just enough
 * for READMEs, which is all this app needs, so we don't pull in a markdown
 * dependency for one lightweight viewer.
 */
export function parseMarkdown(source) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i += 1;
      continue;
    }

    // Fenced code block
    if (line.trim().startsWith('```')) {
      const codeLines = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1; // skip closing fence
      blocks.push({ type: 'code', text: codeLines.join('\n') });
      continue;
    }

    // Horizontal rule
    if (/^-{3,}$/.test(line.trim())) {
      blocks.push({ type: 'rule' });
      i += 1;
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        spans: parseInline(headingMatch[2]),
      });
      i += 1;
      continue;
    }

    // List (consecutive "- " / "* " lines)
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^[-*]\s+/, '')));
        i += 1;
      }
      blocks.push({ type: 'list', items });
      continue;
    }

    // Paragraph: collect consecutive non-blank, non-special lines
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,3})\s+/.test(lines[i]) &&
      !/^[-*]\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith('```') &&
      !/^-{3,}$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: 'paragraph', spans: parseInline(paraLines.join(' ')) });
  }

  return blocks;
}

/** Parses inline formatting (**bold**, *italic*, `code`, [text](url)) into ordered spans. */
export function parseInline(text) {
  const spans = [];
  // Order matters: links first, then code, then bold, then italic.
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_/g;

  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      spans.push({ text: text.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) spans.push({ text: match[1], href: match[2] });
    else if (match[3] !== undefined) spans.push({ text: match[3], code: true });
    else if (match[4] !== undefined) spans.push({ text: match[4], bold: true });
    else if (match[5] !== undefined) spans.push({ text: match[5], italic: true });
    else if (match[6] !== undefined) spans.push({ text: match[6], italic: true });
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) spans.push({ text: text.slice(lastIndex) });

  return spans;
}
