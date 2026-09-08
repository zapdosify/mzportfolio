import { Fragment } from "react";
import styles from "./SplitWords.module.css";

/**
 * Splits a line into per-word masks so the words can be lifted into place.
 *
 * The spaces between words are real text nodes, so the element's accessible
 * name is still the ordinary unsplit sentence — a screen reader announces
 * "Turning complexity into clear decisions.", not the word soup you get when
 * inline-block spans swallow the whitespace. That also keeps selection and
 * copy/paste intact, which is why there is no duplicated visually-hidden
 * copy of the text here.
 *
 * Nothing is animated by this component. It only prepares the marks; the
 * caller animates `[data-word]`, and the CSS resting state is the finished
 * state, so if that animation never runs the line simply reads normally.
 *
 * Shared by both worlds — the business portfolio's headings and the design
 * portfolio's interior pages — so the two use one kinetic-type grammar.
 */
export default function SplitWords({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(" ").filter(Boolean);

  return (
    <span className={className}>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span className={styles.mask}>
            <span className={styles.word} data-word="">
              {w}
            </span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
