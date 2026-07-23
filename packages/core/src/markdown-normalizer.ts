/**
 * Simple Markdown & GFM Alert Normalizer to HTML tags
 */
export const normalizeMarkdownToHtml = (rawText: string): string => {
  if (!rawText) return '';

  let html = rawText;

  // 1. GFM Alerts (> [!NOTE], > [!WARNING], > [!SUCCESS], > [!CRITICAL], > [!INFO])
  html = html.replace(
    /^>\s*\[!(NOTE|WARNING|SUCCESS|CRITICAL|INFO|IMPORTANT|CAUTION)\]\s*\n((?:^>.*(?:\n|$))*)/gim,
    (_, tone, body) => {
      const cleanTone = tone.toLowerCase();
      const cleanBody = body.replace(/^>\s?/gm, '').trim();
      return `<blockquote data-tone="${cleanTone}"><strong>${tone}</strong><p>${cleanBody}</p></blockquote>\n`;
    }
  );

  // 2. Markdown Tables (| Col 1 | Col 2 |)
  const markdownTableRegex = /((?:\|[^\n]+\|\n)+)/g;
  html = html.replace(markdownTableRegex, (match) => {
    const lines = match.trim().split('\n').map((l) => l.trim());
    if (lines.length < 2) return match;

    const headers = lines[0]
      .split('|')
      .map((c) => c.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

    // Skip separator line (e.g. |---|---|)
    const startIndex = lines[1].includes('---') ? 2 : 1;
    const rows = lines.slice(startIndex).map((line) =>
      line
        .split('|')
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
    );

    const ths = headers.map((h) => `<th>${h}</th>`).join('');
    const trs = rows
      .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
      .join('');

    return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>\n`;
  });

  // 3. Simple Headings (### Header)
  html = html.replace(/^(#{1,4})\s+(.+)$/gm, (_, hashes, title) => {
    const level = hashes.length;
    return `<h${level}>${title.trim()}</h${level}>`;
  });

  // 4. Wrap unwrapped lines in paragraph tags if no block tags present
  if (!/<(p|h[1-6]|ul|ol|table|blockquote|pre|dl|figure|hr)/i.test(html)) {
    html = html
      .split(/\n\n+/)
      .map((p) => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`)
      .join('');
  }

  return html;
};
