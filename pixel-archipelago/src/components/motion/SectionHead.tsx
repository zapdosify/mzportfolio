import SplitWords from "./SplitWords";
import s from "../../styles/interior.module.css";

/**
 * The interior pages' section header — an uppercase title with an optional
 * count or note to its right.
 *
 * Pulled out of the pages because the pattern repeats a dozen times across
 * ProjectDetail alone, and every one of them needs the same three motion
 * hooks attached in the same way. One component means a heading can never
 * pick up the reveal but miss the word split, or vice versa.
 *
 * The heading keeps a real `id` so the section's `aria-labelledby` still
 * resolves, and SplitWords preserves the unsplit accessible name.
 */
export default function SectionHead({
  id,
  title,
  meta,
}: {
  id?: string;
  title: string;
  meta?: string;
}) {
  return (
    <div className={s.sectionHead} data-reveal="">
      <h2 id={id} className={s.sectionTitle} data-reveal-title="">
        <SplitWords text={title} />
      </h2>
      {meta && <span className={s.sectionMeta}>{meta}</span>}
    </div>
  );
}
