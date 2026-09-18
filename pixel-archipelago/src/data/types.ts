// Content data model for the Pixel Archipelago portfolio.
// All portfolio content lives in typed data — never hardcoded into components.

export type MediaType = "image" | "video" | "embed";

export interface ProjectMedia {
  type: MediaType;
  src: string;
  poster?: string; // poster frame for videos
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  /** intrinsic aspect for layout: 'portrait' | 'landscape' | 'square' | 'cinematic' */
  ratio?: "portrait" | "landscape" | "square" | "cinematic";
}

/** One chapter of a progressive scroll narrative. */
export interface StoryBeat {
  /** short mono/uppercase chapter label shown in the rail */
  chapter: string;
  title: string;
  /** narrative text, in the author's own words */
  text: string[];
  /** pull-quote with attribution, if the passage cites one */
  quote?: { text: string; source: string };
  /** the publication's handwritten margin note for this scene */
  aside?: string;
}

/**
 * One block of a printed book read as a page. The Manifesto's spreads were flat
 * images of text; these are the same words as real, selectable, searchable DOM.
 * Artwork spreads and the animated chapter cards stay as media (`plate`,
 * `chapter`) and sit in the same sequence.
 */
export type BookBlock =
  | { kind: "plate"; src: string; alt: string }
  | { kind: "chapter"; number: number; title: string; src: string; poster: string }
  | { kind: "prose"; paragraphs: string[] }
  /** the book's opening line for a chapter, set larger than the body */
  | { kind: "lead"; text: string }
  /** a quotation from someone else, with attribution */
  | { kind: "epigraph"; text: string; source: string }
  /** the author's own line, pulled out of the flow and set large */
  | { kind: "pull"; text: string }
  /** short centred lines, as on the "this journey has a beginning" spread */
  | { kind: "verse"; lines: string[] }
  | { kind: "list"; title?: string; items: [string, string][] }
  /** supporting explainer that sat in a margin column of the spread */
  | { kind: "aside"; title?: string; paragraphs: string[] }
  | { kind: "closing"; paragraphs: string[]; signoff?: string };

/** One image inside an exhibit scene. Aspect comes from mediaDimensions. */
export interface ExhibitImage {
  src: string;
  alt: string;
  /** short mono line set under the image */
  caption?: string;
}

/**
 * A scripted walk through a spatial project, read as a scroll.
 *
 * A gallery answers "what did you make"; an exhibition has to answer "what was
 * it like to walk through it". These blocks are the beats of that walk — a
 * sequence, not a grid — so the page paces the work instead of tiling it.
 * Every image keeps its true aspect and its own colour; the interface around
 * them stays monochrome.
 */
export type ExhibitScene =
  /** chapter divider: mono number + title, optionally a standfirst */
  | { kind: "marker"; number: string; title: string; text?: string }
  /** one image edge-to-edge, the cinematic beats (always drifts on scroll) */
  | { kind: "full"; image: ExhibitImage; label?: string }
  /** image and prose side by side; `side` is the side the image takes */
  | {
      kind: "split";
      side: "left" | "right";
      image: ExhibitImage;
      title: string;
      text: string[];
    }
  /** prose alone, at reading measure */
  | { kind: "note"; title?: string; text: string[] }
  /** close-ups shown together, each at its own true aspect */
  | { kind: "details"; title?: string; items: ExhibitImage[] }
  /** a spec strip of label/value pairs (palette, type, materials) */
  | { kind: "facts"; title: string; items: [string, string][] }
  /** the closing gallery */
  | { kind: "plates"; title?: string; items: ExhibitImage[] };

/** A looping, muted ambient video used as a project's opening motion piece. */
export interface AmbientVideo {
  src: string;
  poster?: string;
  caption?: string;
}

/** An externally hosted video (YouTube), embedded rather than self-served. */
export interface VideoEmbed {
  provider: "youtube";
  /** the watch?v= id */
  id: string;
  title: string;
  caption?: string;
}

/**
 * A game playable on the project page, in a same-origin iframe loaded on
 * request. `sprites` is the character layer's folder (manifest.json + sheets):
 * the character can walk out of the game and onto the page.
 */
export interface PlayableGame {
  /** the web export's page, served from this site */
  src: string;
  sprites: string;
  /** accessible name for the iframe */
  title: string;
  poster: string;
  posterAlt: string;
  /** download size, set under the Play button: "About 130 MB" */
  size: string;
  /** key groups and what they do: [["WASD", "↑↓←→"], "walk"] */
  controls: [keys: string[], action: string][];
  /** one-line tip; `[[K]]` renders K as a key */
  tip?: string;
}

/** An image in a game case study. `pixel` keeps pixel art crisp when scaled. */
export interface CaseFigure {
  src: string;
  alt: string;
  caption?: string;
  pixel?: boolean;
}

/**
 * The blocks of a game case study, in reading order. Prose supports three
 * inline marks: `**strong**`, `*emphasis*` and `[[K]]` for a key.
 */
export type GameCaseBlock =
  | { kind: "prose"; paragraphs: string[] }
  /** dated steps of the project, read left to right */
  | { kind: "timeline"; items: CaseFigure[] }
  | { kind: "pipeline"; steps: [title: string, text: string][] }
  | { kind: "figures"; columns: 1 | 2; items: CaseFigure[] }
  /** before/after pairs with a draggable split */
  | {
      kind: "compare";
      items: {
        before: CaseFigure;
        after: CaseFigure;
        beforeLabel: string;
        afterLabel: string;
        /** accessible name for the slider */
        label: string;
        caption: string;
      }[];
    }
  | { kind: "problems"; items: { title: string; why?: string; fix: string }[] }
  | { kind: "stats"; items: [value: string, label: string][] }
  /** prose beside one figure */
  | { kind: "aside"; paragraphs: string[]; figure: CaseFigure };

export interface GameCaseSection {
  number: string;
  title: string;
  blocks: GameCaseBlock[];
}

export interface GameCaseStudy {
  /**
   * The owner's own line, set large before the first section. Optional: a study
   * that opens straight into its first section simply omits it.
   */
  quote?: { text: string; source: string };
  sections: GameCaseSection[];
}

export interface ProcessStage {
  title: string;
  description?: string;
  media?: ProjectMedia[];
}

export interface ExternalLink {
  label: string;
  href?: string; // undefined => referenced on old site but no real URL was recoverable
  note?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  /**
   * The detail page's own title and subtitle, when they should differ from
   * the card's (a short h1 under a longer card title).
   */
  heading?: { title: string; subtitle?: string };
  /** replaces the hero's generated Year/Role/Tools row with these pairs */
  details?: { label: string; value: string }[];
  categoryId: string;
  year?: string; // omit when unknown — never invented
  client?: string;
  context?: string;
  role?: string;
  collaborators?: string[];
  tools?: string[];
  summary?: string;
  /** Long-form body paragraphs, in order. Preserves the original writing. */
  body?: string[];
  challenge?: string;
  outcome?: string;
  credits?: string[];
  coverImage?: string;
  /** looping title sequence shown in the hero art slot instead of coverImage */
  heroVideo?: AmbientVideo;
  /** thumbnail override — used by ProjectCard only, never by the detail hero */
  cardImage?: string;
  /** logos/wordmarks must not be cropped: fit them inside the 4:3 tile instead */
  cardImageFit?: "cover" | "contain";
  gallery?: ProjectMedia[];
  /**
   * How the gallery is presented. `boards` is for design decks and app-flow
   * sheets that were made to be read full width, one after another; omit it
   * and the category's default (thumbnail grid) applies.
   */
  galleryVariant?: "grid" | "posters" | "boards";
  process?: ProcessStage[];
  videos?: ProjectMedia[];
  /** looping muted motion piece shown directly under the hero */
  ambientVideo?: AmbientVideo;
  /** externally hosted films (YouTube) */
  embeds?: VideoEmbed[];
  /** progressive scroll narrative built from a publication + its speech */
  story?: StoryBeat[];
  /** the printed spreads the story is read from, in page order */
  storySpreads?: ProjectMedia[];
  /** a printed book set as real text — replaces the gallery when present */
  book?: BookBlock[];
  /** a scripted scroll through a spatial project — replaces the gallery */
  exhibit?: ExhibitScene[];
  /** a game, playable on the page, directly under the hero */
  play?: PlayableGame;
  /** a game's case study — replaces the gallery */
  gameCaseStudy?: GameCaseStudy;
  externalLinks?: ExternalLink[];
  /** sub-cases inside one project (e.g. Exhibition Design's three prompts) */
  subProjects?: SubProject[];
  relatedProjectIds?: string[];
  featured?: boolean;
  /** flags a project whose imagery is intentionally incomplete (marked, not faked) */
  imageryPending?: boolean;
  sourceUrl?: string;
}

export interface SubProject {
  title: string;
  body: string[];
}

export interface WorldPosition {
  /** normalized percentage of the world canvas (0–100) */
  x: number;
  y: number;
}

export interface Category {
  id: string;
  index: number; // 1–13, matches the world map numbering
  title: string;
  route: string;
  /** one-line description shown on island proximity + page hero */
  description: string;
  /** short tagline used in interiors */
  tagline?: string;
  landmarkImage: string;
  pagePreviewImage?: string;
  worldPosition: WorldPosition;
  activationRadius: number; // % of world width
  projectIds: string[];
  /** categories reachable as "related work" */
  relatedCategoryIds?: string[];
  kind: "projects" | "page"; // About/Contact are page-kind
}
