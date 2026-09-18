import { useMemo, useState } from "react";
import type { CaseFigure, GameCaseBlock, GameCaseStudy as Study, ProjectMedia } from "../../data/types";
import { dimensionsFor } from "../../data/mediaDimensions";
import Lightbox from "../gallery/Lightbox";
import SectionHead from "../motion/SectionHead";
import InlineMarks from "./InlineMarks";
import s from "../../styles/interior.module.css";
import g from "./GameCaseStudy.module.css";

/**
 * A game's case study: the owner's quote, then numbered sections built from a
 * small set of blocks — a dated timeline, a pipeline, before/after sliders,
 * problem cards and a stats row.
 *
 * It keeps to the site's own grammar: SectionHead for every heading, the
 * interior prose measure, thin-bordered frames at each image's measured
 * aspect, mono captions. Every image in the study opens in one shared
 * Lightbox, in reading order, like the exhibit does.
 *
 * Things marked `data-ilva-interact` react when the game's heroine walks
 * over them on the page and the visitor presses E (character-layer.ts).
 */
export default function GameCaseStudy({ study }: { study: Study }) {
  // Every figure in reading order, for the shared Lightbox.
  const figures = useMemo(() => {
    const all: CaseFigure[] = [];
    for (const section of study.sections) {
      for (const block of section.blocks) {
        if (block.kind === "timeline" || block.kind === "figures") all.push(...block.items);
        if (block.kind === "compare") for (const c of block.items) all.push(c.before, c.after);
        if (block.kind === "aside") all.push(block.figure);
      }
    }
    return all;
  }, [study]);
  const media: ProjectMedia[] = useMemo(
    () => figures.map((f) => ({ type: "image", src: f.src, alt: f.alt, caption: f.caption })),
    [figures],
  );
  const [open, setOpen] = useState<number | null>(null);
  const openFigure = (f: CaseFigure) => setOpen(figures.indexOf(f));

  return (
    <>
      {study.quote && (
        <blockquote className={g.quote} data-reveal="">
          <p>“{study.quote.text}”</p>
          <cite>{study.quote.source}</cite>
        </blockquote>
      )}

      {study.sections.map((section) => (
        <section
          key={section.number}
          className={s.section}
          aria-labelledby={`case-${section.number}`}
        >
          <SectionHead id={`case-${section.number}`} title={section.title} meta={section.number} />
          <div className={g.blocks}>
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} onOpen={openFigure} />
            ))}
          </div>
        </section>
      ))}

      {open !== null && (
        <Lightbox items={media} index={open} onClose={() => setOpen(null)} onNavigate={setOpen} />
      )}
    </>
  );
}

function Block({ block, onOpen }: { block: GameCaseBlock; onOpen: (f: CaseFigure) => void }) {
  switch (block.kind) {
    case "prose":
      return (
        <div className={s.prose} data-reveal="">
          {block.paragraphs.map((p, i) => (
            <p key={i}>
              <InlineMarks text={p} kbdClass={g.kbd} />
            </p>
          ))}
        </div>
      );

    case "timeline":
      return (
        <ol className={g.timeline} data-stagger="">
          {block.items.map((f) => (
            <li key={f.src}>
              <Figure figure={f} onOpen={onOpen} />
            </li>
          ))}
        </ol>
      );

    case "pipeline":
      return (
        <ol className={g.pipeline} data-stagger="">
          {block.steps.map(([title, text]) => (
            <li key={title} className={g.step}>
              <span className={g.stepTitle}>{title}</span>
              <span className={g.stepText}>{text}</span>
            </li>
          ))}
        </ol>
      );

    case "figures":
      return (
        <div
          className={block.columns === 2 ? g.twoUp : g.oneUp}
          data-stagger={block.items.length > 1 ? "" : undefined}
          data-reveal={block.items.length > 1 ? undefined : ""}
        >
          {block.items.map((f) => (
            <Figure key={f.src} figure={f} onOpen={onOpen} />
          ))}
        </div>
      );

    case "compare":
      return (
        <div className={g.twoUp} data-stagger="">
          {block.items.map((c) => (
            <Compare key={c.before.src} item={c} onOpen={onOpen} />
          ))}
        </div>
      );

    case "problems":
      return (
        <ul className={g.problems} data-stagger="">
          {block.items.map((p) => (
            <Problem key={p.title} {...p} />
          ))}
        </ul>
      );

    case "stats":
      return (
        <dl className={g.stats} data-reveal="">
          {block.items.map(([value, label]) => (
            <div key={label} className={g.stat}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      );

    case "aside":
      return (
        <div className={g.aside}>
          <div className={s.prose} data-reveal="">
            {block.paragraphs.map((p, i) => (
              <p key={i}>
                <InlineMarks text={p} kbdClass={g.kbd} />
              </p>
            ))}
          </div>
          <div data-reveal="">
            <Figure figure={block.figure} onOpen={onOpen} />
          </div>
        </div>
      );
  }
}

/** An image at its measured aspect, in the site's thin frame. Opens large. */
function Figure({ figure, onOpen }: { figure: CaseFigure; onOpen: (f: CaseFigure) => void }) {
  const dims = dimensionsFor(figure.src);
  return (
    <figure className={g.figure}>
      <button
        type="button"
        className={g.frame}
        style={dims ? { aspectRatio: `${dims[0]} / ${dims[1]}` } : undefined}
        onClick={() => onOpen(figure)}
        aria-label={`Enlarge: ${figure.alt}`}
        data-ilva-interact="Look"
      >
        <img
          src={figure.src}
          alt={figure.alt}
          width={dims?.[0]}
          height={dims?.[1]}
          loading="lazy"
          decoding="async"
          className={figure.pixel ? g.pixel : undefined}
        />
      </button>
      {figure.caption && <figcaption className={g.caption}>{figure.caption}</figcaption>}
    </figure>
  );
}

/** Before/after with a draggable split. The range input IS the control, so
 *  it works by drag, click, and arrow keys with no extra handlers. */
function Compare({
  item,
  onOpen,
}: {
  item: Extract<GameCaseBlock, { kind: "compare" }>["items"][number];
  onOpen: (f: CaseFigure) => void;
}) {
  const [split, setSplit] = useState(50);
  const dims = dimensionsFor(item.before.src);
  return (
    <figure className={g.figure}>
      <div
        className={g.compare}
        style={{
          ["--split" as string]: `${split}%`,
          ...(dims ? { aspectRatio: `${dims[0]} / ${dims[1]}` } : {}),
        }}
      >
        <img
          src={item.before.src}
          alt={item.before.alt}
          width={dims?.[0]}
          height={dims?.[1]}
          loading="lazy"
          decoding="async"
          className={item.before.pixel ? g.pixel : undefined}
        />
        <div className={g.after}>
          <img
            src={item.after.src}
            alt={item.after.alt}
            loading="lazy"
            decoding="async"
            className={item.after.pixel ? g.pixel : undefined}
          />
        </div>
        <span className={`${g.tag} ${g.tagBefore}`} aria-hidden="true">
          {item.beforeLabel}
        </span>
        <span className={`${g.tag} ${g.tagAfter}`} aria-hidden="true">
          {item.afterLabel}
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={split}
          onChange={(e) => setSplit(Number(e.currentTarget.value))}
          aria-label={item.label}
          aria-valuetext={`${split}% ${item.beforeLabel}, ${100 - split}% ${item.afterLabel}`}
          data-ilva-interact="Swap"
          // Pressing E while Ilva stands on it flips the split end to end.
          onClick={(e) => {
            if (e.detail === 0) setSplit((v) => (v < 50 ? 100 : 0));
          }}
        />
        <div className={g.handle} aria-hidden="true" />
      </div>
      <figcaption className={g.caption}>
        {item.caption}{" "}
        <button type="button" className={g.enlarge} onClick={() => onOpen(item.before)}>
          View large
        </button>
      </figcaption>
    </figure>
  );
}

/** One thing that went wrong. Ilva can "read" it; the card remembers. */
function Problem({ title, why, fix }: { title: string; why?: string; fix: string }) {
  const [read, setRead] = useState(false);
  return (
    <li
      className={g.problem}
      data-ilva-interact={read ? "Read again" : "Read"}
      data-read={read || undefined}
      // Only Ilva's E press counts: the layer's click() arrives with no
      // pointer behind it (detail 0), a visitor's own click does not.
      onClick={(e) => {
        if (e.detail === 0) setRead(true);
      }}
    >
      <h3 className={g.problemTitle}>{title}</h3>
      {why && (
        <p>
          <b>Why:</b> {why}
        </p>
      )}
      <p>
        <b>Fix:</b> {fix}
      </p>
      {read && (
        <span className={g.readMark} aria-hidden="true">
          ✓ Read by Ilva
        </span>
      )}
    </li>
  );
}
