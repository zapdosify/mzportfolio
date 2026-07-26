import { Fragment, useMemo } from "react";
import type { BookBlock } from "../../data/types";
import { dimensionsFor } from "../../data/mediaDimensions";
import LoopVideo from "../media/LoopVideo";
import { useStaggerReveal } from "../../hooks/useStaggerReveal";
import s from "./BookScroll.module.css";

/**
 * A printed book read as a page.
 *
 * The Manifesto's spreads were flat 4K images of type — unsearchable,
 * unselectable, unreadable to a screen reader, and illegible on a phone. This
 * sets the same words as real DOM in the site's own voice (mono for structure,
 * Inter for the prose) while the artwork spreads and the animated chapter cards
 * stay as media in the same sequence, so the book still reads as a book.
 */

/** Wraps any phrase the book set as a link, without touching the wording. */
function linkify(text: string, links: Record<string, string>) {
  const phrases = Object.keys(links).sort((a, b) => b.length - a.length);
  if (!phrases.length) return text;
  const escaped = phrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(re);
  return parts.map((part, i) => {
    const key = phrases.find((p) => p.toLowerCase() === part.toLowerCase());
    if (!key) return <Fragment key={i}>{part}</Fragment>;
    return (
      <a key={i} className={s.ref} href={links[key]} target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    );
  });
}

function Chapter({ block }: { block: Extract<BookBlock, { kind: "chapter" }> }) {
  const dims = dimensionsFor(block.poster);
  return (
    <section className={s.chapter} aria-label={`Chapter ${block.title}`}>
      <div
        className={s.chapterArt}
        style={dims ? { aspectRatio: `${dims[0]} / ${dims[1]}` } : undefined}
      >
        <LoopVideo video={{ src: block.src, poster: block.poster, caption: block.title }} />
      </div>
      <h3 className={s.chapterTitle}>
        {block.number > 0 && (
          <span className={s.chapterNum}>
            Chapter {String(block.number).padStart(2, "0")}
          </span>
        )}
        <span className={s.chapterName}>{block.title}</span>
      </h3>
    </section>
  );
}

export default function BookScroll({
  blocks,
  links = {},
}: {
  blocks: BookBlock[];
  links?: Record<string, string>;
}) {
  const rootRef = useStaggerReveal<HTMLDivElement>([blocks.length]);
  // Rebuilding the phrase regex per paragraph would be wasteful on a book.
  const link = useMemo(() => (t: string) => linkify(t, links), [links]);

  return (
    <div className={s.book} ref={rootRef}>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "plate":
            return (
              <figure key={i} className={s.plate}>
                <img src={b.src} alt={b.alt} loading="lazy" decoding="async" />
              </figure>
            );

          case "chapter":
            return <Chapter key={i} block={b} />;

          case "lead":
            return (
              <p key={i} className={s.lead}>
                {link(b.text)}
              </p>
            );

          case "prose":
            return (
              <div key={i} className={s.prose}>
                {b.paragraphs.map((p, j) => (
                  <p key={j}>{link(p)}</p>
                ))}
              </div>
            );

          case "pull":
            return (
              <p key={i} className={s.pull}>
                {link(b.text)}
              </p>
            );

          case "epigraph":
            return (
              <figure key={i} className={s.epigraph}>
                <blockquote>{b.text}</blockquote>
                <figcaption>{b.source}</figcaption>
              </figure>
            );

          case "verse":
            return (
              <p key={i} className={s.verse}>
                {b.lines.map((l, j) => (
                  <span key={j}>{l}</span>
                ))}
              </p>
            );

          case "list":
            return (
              <div key={i} className={s.listBlock}>
                {b.title && <h4 className={s.listTitle}>{b.title}</h4>}
                <dl className={s.list}>
                  {b.items.map(([term, text], j) => (
                    <div key={j} className={s.listRow}>
                      <dt>{term}</dt>
                      <dd>{text}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            );

          case "aside":
            return (
              <aside key={i} className={s.aside}>
                {b.title && <h4 className={s.asideTitle}>{b.title}</h4>}
                {b.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </aside>
            );

          case "closing":
            return (
              <div key={i} className={s.closing}>
                {b.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
                {b.signoff && <p className={s.signoff}>{b.signoff}</p>}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
