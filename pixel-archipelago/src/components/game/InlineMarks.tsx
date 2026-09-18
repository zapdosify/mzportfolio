import { Fragment, type ReactNode } from "react";

/**
 * The three inline marks the game case-study copy uses: `**strong**`,
 * `*emphasis*` and `[[K]]` for a key. Everything else stays plain text —
 * the copy is data, so no markup is ever injected as HTML.
 */
const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|\[\[[^\]]+\]\])/g;

export default function InlineMarks({ text, kbdClass }: { text: string; kbdClass?: string }) {
  const parts: ReactNode[] = text.split(TOKEN).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("[[") && part.endsWith("]]"))
      return (
        <kbd key={i} className={kbdClass}>
          {part.slice(2, -2)}
        </kbd>
      );
    if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
    return <Fragment key={i}>{part}</Fragment>;
  });
  return <>{parts}</>;
}
