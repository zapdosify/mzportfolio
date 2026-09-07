import type { ExhibitScene } from "./types";

const A = "/media/images/avengers-exhibition";

/**
 * Avengers Exhibition Design, read as a walk rather than a grid.
 *
 * The source is a 22-page project book plus the Unreal Engine renders, the
 * printed collateral and the poster series — 35 assets in all. Everything
 * written here is taken from the book's own pages (the venue history, the
 * palette names and hex values, the material schedule, the render labels)
 * or from Mohammed's existing write-up of the prompt. Nothing is invented:
 * the year, client and collaborators were not recorded and are left out.
 *
 * Scene order follows the book's own five parts — Venue, Introduction,
 * Research, Marketing, Exhibition — resequenced so the spatial renders build
 * to a climax and the printed pieces close it out.
 */
export const avengersExhibition: ExhibitScene[] = [
  // ---------------------------------------------------------------- opening
  {
    kind: "full",
    label: "Project book — front and back cover",
    image: {
      src: `${A}/book-01-cover.webp`,
      alt: "The project book's cover and back cover: the Avengers 'A' mark over intersecting blue, red and green planes, with the S.T.A.T.I.O.N. wordmark",
    },
  },
  {
    kind: "split",
    side: "right",
    title: "A book in five parts",
    text: [
      "The whole project was documented as a single bound book, opening on a dedication to Stan Lee and a contents page that sets out five parts: Venue, Introduction, Research, Marketing and Exhibition. The order below follows those parts.",
      "The book is the deliverable as much as the space is. It carries the reasoning — why this venue, which typefaces, which colours, what the walls are actually made of — that a set of renders on their own would leave unsaid.",
    ],
    image: {
      src: `${A}/book-02-contents.webp`,
      alt: "Dedication spread: a portrait of Stan Lee in a burst of colour, 1922–2018, 'Excelsior', facing a contents page listing Venue, Introduction, Research, Marketing and Exhibition",
      caption: "Dedication and contents",
    },
  },

  // ------------------------------------------------------------- 01 · venue
  {
    kind: "marker",
    number: "01",
    title: "The Venue",
    text: "The exhibit was sited in a real building, and the plan was drawn to its constraints rather than to an empty rectangle.",
  },
  {
    kind: "split",
    side: "left",
    title: "Arizona Science Center",
    text: [
      "Arizona Science Center sits in Heritage and Science Park in downtown Phoenix. It holds more than 350 permanent exhibits, draws around 400,000 visitors a year, and regularly hosts nationally touring exhibitions alongside the Dorrance Planetarium and a five-storey giant-screen IMAX theatre.",
      "It opened in 1984 as a 10,000-square-foot storefront on the parking-garage level of the downtown Phoenix Hyatt, and took 87,000 visitors in its first year. A touring Marvel exhibit is exactly the kind of show the Center's programme was built to take — which is what made it a useful brief rather than an arbitrary one.",
    ],
    image: {
      src: `${A}/book-03-venue.webp`,
      alt: "Venue spread: two columns of text on the history of Arizona Science Center beside a photograph of the building's angular concrete and glass exterior",
      caption: "Venue — pages 1–2",
    },
  },

  // ------------------------------------------------------- 02 · the recruit
  {
    kind: "marker",
    number: "02",
    title: "The Recruit",
    text: "The framing device: you do not buy a ticket to an exhibition, you are inducted into a network.",
  },
  {
    kind: "split",
    side: "right",
    title: "S.T.A.T.I.O.N.",
    text: [
      "The exhibit takes its name from the Scientific Training And Tactical Intelligence Operative Network — the fictional support division that trains and equips the Avengers. Visitors enter as new recruits and work through the history, science, engineering and genetics behind each character.",
      "That single decision drives everything downstream. It is why the entry document is a clearance pass rather than a ticket stub, why the wall panels are laid out as case files, and why the wayfinding reads as signage inside a facility instead of labels inside a museum.",
      "The introduction spread shows the campaign sited on the street: a Hall of Fame billboard in a city panel, photographed in daylight and again in the wet.",
    ],
    image: {
      src: `${A}/book-04-introduction.webp`,
      alt: "Introduction spread: two columns of recruitment copy beside two photographic mockups of an Avengers Hall of Fame billboard mounted on a city street",
      caption: "Introduction — pages 3–4",
    },
  },
  {
    kind: "full",
    label: "Wayfinding graphic",
    image: {
      src: `${A}/avengers-assemble.webp`,
      alt: "A wide graphic panel: 'AVENGERS' in heavy condensed capitals with 'ASSEMBLE' beneath, a silver star and a red rule above, on a flat blue textured field",
    },
  },

  // ---------------------------------------------------------- 03 · research
  {
    kind: "marker",
    number: "03",
    title: "Research",
    text: "Typeface, palette and precedent — settled on paper before anything was modelled.",
  },
  {
    kind: "split",
    side: "left",
    title: "Type and colour",
    text: [
      "SK Modernist Bold carries the headings, set against a monospaced face for the technical and label copy. The pairing does the same job the naming device does: one voice for the institution, one for the equipment.",
      "The palette is six saturated colours, each named and specified in hex, RGB and CMYK. They are not decoration — each maps to a character zone, which is how a visitor knows they have crossed from one Avenger's segment into the next without reading a single sign.",
    ],
    image: {
      src: `${A}/book-05-research-type-colour.webp`,
      alt: "Research spread: large ghosted letterforms demonstrating SK Modernist Bold and a monospaced face, beside six colour swatches annotated with names and colour values",
      caption: "Research — pages 5–6",
    },
  },
  {
    kind: "facts",
    title: "The palette, as specified",
    items: [
      ["Crayola's Blue", "#266EF6"],
      ["Electric Purple", "#BF00FF"],
      ["American Orange", "#FF8B00"],
      ["Boston University Red", "#C60404"],
      ["Cyber Yellow", "#FFD300"],
      ["American Green", "#35B535"],
    ],
  },
  {
    kind: "full",
    label: "Precedent study — lighting, sightlines and case density in existing installations",
    image: {
      src: `${A}/book-06-research-reference.webp`,
      alt: "Research spread: twelve photographs of existing Avengers exhibition installations — lit costume cases, a Hulkbuster armour, blue-lit corridors of interactive panels and a curved console hall",
      caption: "Research — pages 7–8",
    },
  },

  // -------------------------------------------------------------- 04 · space
  {
    kind: "marker",
    number: "04",
    title: "The Space",
    text: "An L-shaped floor plate, divided into character segments, then built and lit in Unreal Engine.",
  },
  {
    kind: "note",
    text: [
      "The constraint was the shape of the room. An L gives you two runs and a corner, which means a visitor cannot see the whole show at once — so the plan treats the corner as the turn in the story rather than as a problem to design around.",
      "Each segment carries one Avenger's history, weapons, equipment, background and props, with a themed souvenir point of its own. Modelling it in a game engine rather than a CAD viewport was the point: dynamic lighting, real materials and a walkable camera let the sequence be judged as a visitor experiences it, in order, at eye height.",
    ],
  },
  {
    kind: "full",
    label: "Top overview and wireframe",
    image: {
      src: `${A}/book-10-exhibition-plan.webp`,
      alt: "Exhibition spread: two columns of text beside a grey top-down render of the exhibit volume and a cyan wireframe of the same plan on a dark grid",
      caption: "Exhibition — pages 15–16",
    },
  },
  {
    kind: "full",
    label: "Side-view layout, and the same structure through a day and night cycle",
    image: {
      src: `${A}/book-11-side-view-day-night.webp`,
      alt: "Spread of four renders: two grey side-elevation layouts of the exhibit structure, and the same building exterior lit at dusk and again at night with the Avengers roundel glowing on its facade",
      caption: "Exhibition — pages 17–18",
    },
  },
  {
    kind: "full",
    label: "Entrance and first panel, then the walkthrough beyond",
    image: {
      src: `${A}/book-12-entrance-walkthrough.webp`,
      alt: "Spread of four interior renders: the dark exhibit entrance lit by a single blue floor wash, a curved corridor of lit character cases, an artefact on a plinth between two armour displays, and the Captain America segment under a blue and white wall",
      caption: "Exhibition — pages 19–20",
    },
  },
  {
    kind: "full",
    label: "Items showcase, the main hall, and the exit",
    image: {
      src: `${A}/book-13-hall-and-exit.webp`,
      alt: "Spread of four interior renders: a showcase of artefacts under directional light, a lit central plinth with the assembled figures, a coloured character line-up on a raised stage, and a wide overhead view of the hall toward the exit sign",
      caption: "Exhibition — pages 21–22",
    },
  },
  {
    kind: "split",
    side: "right",
    title: "Materials",
    text: [
      "The material schedule is specified rather than implied. Signature models are aluminium; armour is finished in brushed brass, with chrome brushing reserved for the Iron Man collection. Wall panels are acoustic mesh, floors take a ceramic coating, and door frames repeat the same aluminium as the models.",
      "Every display piece sits behind secure tempered glass. Naming the materials is what lets the renders be read as a buildable proposal instead of a picture of one.",
    ],
    image: {
      src: `${A}/book-14-materials.webp`,
      alt: "Materials spread: a column of specification text beside five rendered material spheres — plain white ceramic, aluminium, brushed brass, chrome, and a tiled acoustic mesh panel",
      caption: "Materials",
    },
  },
  {
    kind: "facts",
    title: "Material schedule",
    items: [
      ["Signature models", "Metal aluminium"],
      ["Armour brushing", "Metal brass brushed"],
      ["Iron Man collection", "Metal chrome"],
      ["Wall panels", "Acoustic mesh"],
      ["Floors", "Ceramic plain white"],
      ["Display cases", "Secure tempered glass"],
    ],
  },

  // ---------------------------------------------------------- 05 · marketing
  {
    kind: "marker",
    number: "05",
    title: "Marketing",
    text: "The printed programme — posters, tickets, magazine, pass and bookmarks.",
  },
  {
    kind: "split",
    side: "left",
    title: "Ten posters at 18 × 24",
    text: [
      "Each Avenger gets one poster, and each poster gets one word. Iron Man rises above; Captain America is worthy; Black Widow stings unseen; Hawkeye is precision. Thanos gets the only punchline in the set.",
      "They are built the same way throughout — a flat textured field, a single silhouette, one accent of light, and the character's name set small in the bottom corner. Holding to that formula is what makes ten separate posters read as one exhibition.",
    ],
    image: {
      src: `${A}/book-07-marketing-posters.webp`,
      alt: "Marketing spread: two columns of text with a ghosted '18X24' behind them, beside four poster designs — Iron Man, Captain America, Spider-Man and Thor",
      caption: "Marketing — pages 9–10",
    },
  },
  {
    kind: "full",
    label: "The remaining posters, and the ticket",
    image: {
      src: `${A}/book-08-posters-tickets.webp`,
      alt: "Spread showing four more posters — Black Panther, Doctor Strange, Hulk and Thanos — beside a dark page headed 'Tickets' with three overlapping ticket designs",
      caption: "Marketing — pages 11–12",
    },
  },
  {
    kind: "details",
    title: "The pieces a visitor is handed",
    items: [
      {
        src: `${A}/tickets.webp`,
        alt: "Three deep-green admission tickets on a dark ground, each set with 'Avengers Exhibition — Arizona Science Center', a S.H.I.E.L.D. roundel and a perforated white barcode stub",
        caption: "Admission ticket",
      },
      {
        src: `${A}/exhibit-pass.webp`,
        alt: "A dark exhibition pass on a red lanyard, printed with a gold S.H.I.E.L.D. roundel, 'Exhibition Clearance, Level 1 — Visitor', and a barcode",
        caption: "Exhibition clearance pass",
      },
    ],
  },
  {
    kind: "split",
    side: "right",
    title: "Magazine and pass",
    text: [
      "The magazine reprints the research section as a takeaway, so the type study and the palette leave the building with the visitor. It is shown open on a warm ground — the one place in the whole system where the background is not black.",
      "The pass is the induction made physical. Level 1 clearance, a barcode, a lanyard: the same fiction as the entrance, sized to hang around a neck.",
    ],
    image: {
      src: `${A}/book-09-magazine-pass.webp`,
      alt: "Spread headed 'Magazine | Exhibit Pass': the open magazine and its folded covers photographed on a pale pink ground, beside the lanyard pass on deep navy",
      caption: "Marketing — pages 13–14",
    },
  },
  {
    kind: "details",
    title: "Bookmarks — one per character",
    items: [
      {
        src: `${A}/bookmark-iron-man.webp`,
        alt: "Tall bookmark: the Iron Man helmet roundel in black at the top of a gold-to-red gradient on textured stock",
        caption: "Iron Man",
      },
      {
        src: `${A}/bookmark-captain-america.webp`,
        alt: "Tall bookmark: Captain America's shield roundel in black at the top of a blue-to-red gradient on textured stock",
        caption: "Captain America",
      },
      {
        src: `${A}/bookmark-hulk.webp`,
        alt: "Tall bookmark: the Hulk fist roundel in black at the top of a bright-to-dark green gradient on textured stock",
        caption: "Hulk",
      },
      {
        src: `${A}/bookmark-spider-man.webp`,
        alt: "Tall bookmark: the Spider-Man spider mark in black at the top of a red gradient on textured stock",
        caption: "Spider-Man",
      },
      {
        src: `${A}/bookmark-black-widow.webp`,
        alt: "Tall bookmark: the Black Widow hourglass mark in red at the top of a black-to-red gradient on textured stock",
        caption: "Black Widow",
      },
      {
        src: `${A}/bookmark-black-panther.webp`,
        alt: "Tall bookmark: the Black Panther mask in black at the top of a purple gradient on textured stock",
        caption: "Black Panther",
      },
    ],
  },
  {
    kind: "full",
    label: "The bookmarks as laid out in the book",
    image: {
      src: `${A}/book-15-bookmarks.webp`,
      alt: "Spread headed 'Bookmarks': six tall gradient bookmarks laid out in two groups of three across facing black pages",
      caption: "Bookmarks",
    },
  },

  // ---------------------------------------------------------- final gallery
  {
    kind: "plates",
    title: "The poster series",
    items: [
      {
        src: `${A}/poster-iron-man.webp`,
        alt: "Poster: a black Iron Man silhouette flying across a gold disc on deep red, with vapour trails and 'RISE ABOVE' above",
        caption: "Rise Above — Iron Man",
      },
      {
        src: `${A}/poster-captain-america.webp`,
        alt: "Poster: a black Captain America silhouette holding Mjolnir wreathed in cyan lightning above his shield, on blue with white stripes, headed 'WORTHY'",
        caption: "Worthy — Captain America",
      },
      {
        src: `${A}/poster-spider-man.webp`,
        alt: "Poster: a black Spider-Man silhouette swinging from a white web line across a flat red field with a single grey vertical band",
        caption: "Spider-Man",
      },
      {
        src: `${A}/poster-thor.webp`,
        alt: "Poster: a black Thor silhouette standing on a white disc, raising Mjolnir into a burst of cyan lightning on teal",
        caption: "Thor",
      },
      {
        src: `${A}/poster-hulk.webp`,
        alt: "Poster: a black Hulk silhouette braced inside a cracked green field, headed 'HULK SMASH'",
        caption: "Hulk Smash",
      },
      {
        src: `${A}/poster-black-panther.webp`,
        alt: "Poster: a black Black Panther silhouette rising in front of a large grey moon on a purple field",
        caption: "Black Panther",
      },
      {
        src: `${A}/poster-doctor-strange.webp`,
        alt: "Poster: a black Doctor Strange silhouette between a flame and a water sigil, cloak flaring, on dusty rose with a white diagonal",
        caption: "Doctor Strange",
      },
      {
        src: `${A}/poster-thanos.webp`,
        alt: "Poster: the Infinity Gauntlet in black beneath a lightning-wrapped ring, on a blue-to-red gradient, headed 'OH SNAP!'",
        caption: "Oh Snap! — Thanos",
      },
      {
        src: `${A}/poster-black-widow.webp`,
        alt: "Poster: a black widow spider over a gold disc on near-black, with a small figure held in the hourglass mark and 'STING UNSEEN' above",
        caption: "Sting Unseen — Black Widow",
      },
      {
        src: `${A}/poster-hawkeye.webp`,
        alt: "Poster: a hawk's head inside a stylised eye on a purple disc, cut by violet motion streaks, headed 'PRECISION.'",
        caption: "Precision — Hawkeye",
      },
    ],
  },

  // ---------------------------------------------------------------- closing
  {
    kind: "full",
    image: {
      src: `${A}/shield-emblem.webp`,
      alt: "The S.H.I.E.L.D. eagle roundel embossed almost invisibly in near-black, closing the book",
    },
  },
];
