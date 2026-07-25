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
  gallery?: ProjectMedia[];
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
