// The agent ends a reply with a line like:
// [actions] Run a work cycle | Save this as a rule
// We hide that line and turn each item into a clickable button.
const RE = /^\s*\[actions\][ \t]*(.+)$/im;

export function parseSuggestions(content = '') {
  const match = content.match(RE);
  if (!match) return { text: content, suggestions: [] };
  return {
    text: content.replace(match[0], '').trimEnd(),
    suggestions: match[1]
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4),
  };
}