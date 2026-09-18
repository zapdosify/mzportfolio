import type { Project, ProjectMedia } from "./types";
import { solarpunkStory } from "./solarpunkStory";
import { manifestoBook } from "./manifestoBook";
import { avengersExhibition } from "./avengersExhibition";
import { emberdeepCaseStudy, emberdeepPlay } from "./emberdeepCaseStudy";

// ---------------------------------------------------------------------------
// Media helpers. Content migrated verbatim from the previous portfolio.
// Unknown fields (year, client, collaborators) are omitted — never invented.
// ---------------------------------------------------------------------------
const IMG = "/media/images";
const VID = "/media/videos";

const im = (
  folder: string,
  file: string,
  alt: string,
  ratio?: ProjectMedia["ratio"],
  caption?: string,
): ProjectMedia => ({ type: "image", src: `${IMG}/${folder}/${file}`, alt, ratio, caption });

// Aspect is derived from each asset's measured dimensions (see mediaDimensions.ts),
// so `ratio` is only passed when a layout deliberately overrides the real file.
const vid = (
  folder: string,
  file: string,
  posterFolder: string,
  posterFile: string,
  alt: string,
  caption?: string,
): ProjectMedia => ({
  type: "video",
  src: `${VID}/${folder}/${file}`,
  poster: `${IMG}/${posterFolder}/${posterFile}`,
  alt,
  caption,
});

/**
 * An animated Manifesto chapter card. Each was authored as a moving version of
 * the printed chapter spread, so it replaces that spread in the deck; the loops
 * are crossfaded at the seam, so playback has no visible cut.
 */
const chapterLoop = (n: number, title: string): ProjectMedia => ({
  type: "video",
  src: `${VID}/design-manifesto/chapter-${n}.mp4`,
  poster: `${IMG}/design-manifesto/chapter-${n}-poster.webp`,
  alt: `Chapter ${title}`,
});

export const projects: Project[] = [
  // ========================= APP DESIGN =========================
  {
    id: "bookbabies",
    slug: "bookbabies",
    title: "BookBabies",
    subtitle: "Sleep tracking and audiobooks",
    categoryId: "app-design",
    role: "Product / UX & UI Designer",
    tools: ["Figma", "Illustrator", "Photoshop"],
    featured: true,
    summary:
      "A sleep-tracking app that combines technology and relaxation — high-quality audiobooks and soundscapes that help users fall asleep, with sleep insights to improve rest.",
    body: [
      "Introducing a sleep tracking app that combines the best of two worlds - technology and relaxation. This app, designed with the user's comfort in mind, has been helping thousands of people fall asleep every night with its high-quality audiobooks and relaxing soundscapes. The app's sleep tracking feature monitors the user's sleep patterns and provides insights on how to improve their sleep quality. The user can choose from a wide selection of audiobooks, including best-selling novels, classic literature, and even bedtime stories for children. The soundscapes range from the soothing sounds of nature to ambient music, providing a peaceful and calming atmosphere to help the user fall asleep. Whether the user is having trouble sleeping or just wants to unwind before bed, this app provides a personalized experience to help them get a good night's sleep.",
      "The design process for the sleep tracking app, aptly named \"BookBabies,\" began with a clear vision: to create a seamless integration of technology and relaxation, providing users with an intuitive, user-friendly tool to monitor and improve their sleep habits.",
    ],
    process: [
      { title: "Research and Discovery", description: "Surveys, interviews, and focus groups to gather user insights and identify pain points; competitor analysis to pinpoint areas of improvement and differentiators for BookBabies." },
      { title: "User Personas & Journeys", description: "Detailed personas representing the primary audience, and mapped user journeys visualizing touchpoints for smooth, intuitive navigation." },
      { title: "Ideation & Concept Development", description: "Brainstorming concepts drawing from technology and relaxation; refined through iterative sketches, wireframes, and low-fidelity prototypes." },
      { title: "Mood Board & Visual Style", description: "A mood board encapsulating tranquility and sophistication informed the app's design language for consistency and harmony." },
      { title: "High-Fidelity Design & Prototyping", description: "Polished mockups of key screens and interactions, built into an interactive prototype to test and validate the user experience." },
    ],
    coverImage: `${IMG}/bookbabies-app/01_A.webp`,
    // Presentation boards — read full width in sequence, as they were designed.
    galleryVariant: "boards",
    gallery: Array.from({ length: 22 }, (_, i) => {
      const n = String(i + 1).padStart(2, "0");
      const letter = String.fromCharCode(65 + i); // A..V
      return im("bookbabies-app", `${n}_${letter}.webp`, `BookBabies UI screen ${letter}`);
    }),
    relatedProjectIds: ["hodl", "frontline-readiness"],
    sourceUrl: "https://mznoor8.wixsite.com/portfolio/appdesign",
  },
  {
    id: "hodl",
    slug: "hodl",
    title: "HODL",
    subtitle: "Crypto asset management",
    categoryId: "app-design",
    role: "Product / UX & UI Designer",
    tools: ["Figma", "Illustrator"],
    featured: true,
    // The card used to fall through to the first gallery asset, which is the
    // white sitemap diagram — a blank rectangle beside its neighbours. This is
    // the project's own title card. Detail-page hero is unaffected.
    // The web copy is pre-cropped to the tile's 4:3 (left-anchored, see
    // scratchpad/hodl_card2.py), so `cover` here is a no-op and it fills the
    // tile edge-to-edge like its neighbours. Cropping to 4:3 in the browser
    // instead would centre the crop and slice "Welcome" mid-word.
    cardImage: `${IMG}/hodl-crypto-app/hodl-card.webp`,
    summary:
      "An innovative crypto-asset management solution unifying technology and community — manage NFTs and cryptocurrencies in a single interface, with education and a supportive community.",
    body: [
      "An innovative crypto-asset management solution that unifies the worlds of technology and community. HODL equips users with a comprehensive platform to manage their digital assets, including NFTs and cryptocurrencies, in a single, unified interface. This streamlines the process of tracking investments and making informed trading decisions.",
      "One of the standout features of HODL is its dedication to onboarding new users to the world of cryptocurrency trading. The app features a comprehensive library of educational resources, from introductory guides to advanced strategies, to empower users to build their knowledge and skills. Additionally, the HODL community provides a supportive environment for users to connect with one another, exchange information, and receive assistance.",
      "With regards to design, HODL prioritizes the user experience. The app features a clean and intuitive interface that facilitates easy navigation and access to all features and functionalities. The dashboard presents a clear and concise overview of a user's investments, including real-time market data, making it effortless to stay on top of one's portfolio.",
      "Security is a paramount concern, and HODL implements industry-standard security measures to safeguard user assets — two-factor authentication, encrypted storage, and regular security audits. Furthermore, HODL empowers users to manage their private keys, granting them full control over their assets at all times.",
    ],
    process: [
      { title: "Creating Detailed Personas", description: "Three primary personas defined to ground the product in real user needs." },
      { title: "User Storyboards", description: "Storyboards mapping key flows and interactions across the app." },
      { title: "App Showcase", description: "Final high-fidelity interface across dashboard, portfolio, and community." },
    ],
    coverImage: `${IMG}/hodl-crypto-app/01_NFT_APP.webp`,
    heroVideo: {
      src: `${VID}/hodl-crypto-app/hodl-loop.mp4`,
      poster: `${IMG}/hodl-crypto-app/hodl-loop-poster.webp`,
      caption: "HODL Watch OS — title sequence",
    },
    // Personas and full app-flow sheets — legible only at full width.
    galleryVariant: "boards",
    gallery: [
      im("hodl-crypto-app", "01_NFT_APP.webp", "HODL app cover"),
      im("hodl-crypto-app", "02_persona_1.webp", "Persona 1"),
      im("hodl-crypto-app", "03_Persona_2.webp", "Persona 2"),
      im("hodl-crypto-app", "04_Persona_3.webp", "Persona 3"),
      im("hodl-crypto-app", "05_User_storyboards.webp", "User storyboards"),
      im("hodl-crypto-app", "06_Group_188-min.webp", "App showcase 1"),
      im("hodl-crypto-app", "07_Group_189-min.webp", "App showcase 2"),
    ],
    relatedProjectIds: ["bookbabies", "frontline-readiness"],
    sourceUrl: "https://mznoor8.wixsite.com/portfolio/project-2",
  },
  {
    id: "frontline-readiness",
    slug: "frontline-readiness",
    title: "Sales Frontline Readiness App",
    subtitle: "T-Mobile for Business — concept",
    categoryId: "app-design",
    context: "T-Mobile for Business (concept)",
    role: "UX Designer",
    tools: ["Figma"],
    summary:
      "A sales frontline readiness learning app concept for T-Mobile for Business, helping sellers and new-hires learn and organize their trainings through an intuitive, gamified platform.",
    body: [
      "A sales frontline readiness learning app concept for the T-Mobile for Business department. This app has been specifically designed to help existing sellers and new-hires learn and organize their trainings, ensuring they are fully prepared to succeed in their roles. The app offers a comprehensive and intuitive platform for learning, with a variety of modules and resources aimed at improving the user's sales skills, product knowledge, and overall performance.",
      "The app's intuitive interface makes it easy to navigate, with clear categorization of training materials and resources. Users can track their progress and receive feedback on their performance, allowing them to identify areas for improvement. The app also provides a centralized platform for organizing and accessing all relevant training materials — product guides, sales scripts, and customer service tools.",
      "The app features gamification elements, such as rewards and badges, to encourage users to engage with the content and make learning a fun and enjoyable experience. With its focus on learning and development, this app could revolutionize the way T-Mobile for Business sellers approach their training and development.",
    ],
    coverImage: `${IMG}/frontline-readiness-app/03_1-min.webp`,
    // Full app-flow sheets — legible only at full width.
    galleryVariant: "boards",
    gallery: [
      im("frontline-readiness-app", "01_T-Mobile_logo.webp", "T-Mobile logo"),
      im("frontline-readiness-app", "03_1-min.webp", "Frontline app screen 1"),
      im("frontline-readiness-app", "02_2-min.webp", "Frontline app screen 2"),
      im("frontline-readiness-app", "04_3-min.webp", "Frontline app screen 3"),
      im("frontline-readiness-app", "05_4-min.webp", "Frontline app screen 4"),
      im("frontline-readiness-app", "06_5.webp", "Frontline app screen 5"),
    ],
    relatedProjectIds: ["magenta-moves", "hodl"],
    sourceUrl: "https://mznoor8.wixsite.com/portfolio/project-3",
  },

  // ========================= WEBSITE DESIGN =========================
  {
    id: "ripple",
    slug: "ripple",
    title: "Ripple — Symposium Website",
    subtitle: "Masters of Visual Communication and Design",
    categoryId: "website-design",
    role: "Web / UX Designer (collaborative team project)",
    featured: true,
    ambientVideo: {
      src: `${VID}/ripple-symposium-website/ripple-motion.mp4`,
      poster: `${IMG}/ripple-symposium-website/ripple-motion-poster.webp`,
      caption: "Ripple — identity in motion",
    },
    summary:
      "A website for Ripple, a hybrid graduate symposium showcasing the next generation of innovative projects — designed collaboratively across teams for both in-person and virtual attendees.",
    body: [
      "Designing a website for a symposium is a challenging and exciting process, and the website for Ripple was no exception. This symposium was designed to showcase graduate projects in the form of a hybrid event, and was created in collaboration with different teams responsible for areas such as hybrid symposium management, publicity and fundraising, and publication.",
      "We worked closely within teams to develop a clear understanding of the target audience, the purpose of the event, and the message we wanted to convey. This information was used to inform the design of the website, ensuring that it aligned with the overall vision of the symposium.",
      "Since Ripple is a hybrid event, we had to design the website with both in-person and virtual attendees in mind. This included designing the website to be responsive across different devices, providing information on how to attend the event in person or online, and creating interactive features such as chat rooms and virtual breakout rooms to promote networking and community-building.",
      "The Ripple project not only allowed me to exercise my creative and technical skills but also served as a valuable lesson in the power of collaboration. By working in unison with diverse teams, I discovered how harmonizing different talents and visions could generate a more cohesive, innovative, and successful design outcome.",
    ],
    // No website screenshots exist; the symposium wordmark stands in on the card.
    cardImage: `${IMG}/ripple-symposium-website/ripple-wordmark.webp`,
    cardImageFit: "contain",
    relatedProjectIds: ["solarpunk", "bookbabies"],
    sourceUrl: "https://mznoor8.wixsite.com/portfolio/website-design",
  },
  {
    id: "emberdeep",
    slug: "emberdeep",
    title: "EMBERDEEP — A Night at Cinder Inn",
    subtitle: "A small room with a world behind it",
    heading: { title: "EMBERDEEP", subtitle: "A small room with a world behind it" },
    categoryId: "website-design",
    year: "2026",
    role: "Creative direction · environment and interaction design",
    tools: ["Godot", "SpriteCook", "Meshy", "Claude and Codex"],
    details: [
      { label: "Role", value: "Creative direction · environment and interaction design · iterative review" },
      { label: "Format", value: "Playable room showcase" },
      { label: "Made with", value: "Godot · SpriteCook · Meshy · Claude and Codex" },
    ],
    summary:
      "An interactive fantasy room designed to feel personal, lived-in and quietly magical. I shaped its visual direction, layout and interactions, using an AI-assisted workflow to bring a pixel-art heroine into a three-dimensional space.",
    cardImage: `${IMG}/emberdeep/card.webp`,
    play: emberdeepPlay,
    gameCaseStudy: emberdeepCaseStudy,
    relatedProjectIds: ["ripple"],
  },

  // ========================= VISUAL ARTWORK =========================
  {
    id: "digital-painting",
    slug: "digital-painting",
    title: "Digital Painting",
    subtitle: "Visual Artwork",
    categoryId: "visual-artwork",
    role: "Artist",
    tools: ["Adobe Photoshop", "Affinity Designer"],
    featured: true,
    summary:
      "A series of digital paintings melding diverse brushes and contrasting themes — the natural and the abstract, the serene and the energetic — into visually captivating compositions.",
    body: [
      "In my ever-evolving artistic journey, I relish exploring new avenues of creativity to push the boundaries of visual expression. By harnessing the power of Adobe Photoshop and Affinity Designer, I crafted multiple pieces of digital artwork that meld diverse digital brushes and themes to create visually captivating compositions.",
      "Experimenting with an array of brushes, ranging from textural strokes to painterly flourishes, allowed me to weave a rich tapestry of styles that evoke a sense of depth and dynamism. Simultaneously, I embraced the challenge of blending contrasting themes — the natural and the abstract, the serene and the energetic — to forge a harmonious and visually compelling narrative.",
    ],
    coverImage: `${IMG}/visual-artwork-digital-painting/01_artwork.webp`,
    gallery: Array.from({ length: 10 }, (_, i) => {
      const n = String(i + 1).padStart(2, "0");
      return im("visual-artwork-digital-painting", `${n}_artwork.webp`, `Digital painting ${i + 1}`);
    }),
    relatedProjectIds: ["poster-design", "3d-lettering"],
    sourceUrl: "https://mznoor8.wixsite.com/portfolio/visualartwork",
  },

  // ========================= MANIFESTO DESIGN =========================
  {
    id: "design-manifesto",
    slug: "design-manifesto",
    title: "Design Manifesto",
    categoryId: "manifesto-design",
    role: "Designer / Author",
    featured: true,
    summary:
      "A deeply personal manifesto weaving literature and art into chapters that chart an artistic journey — drawing on design ideologies from phenomenology to \"the medium is the message.\"",
    body: [
      "Embarking on a deeply personal and introspective journey, I set out to create a manifesto that would serve as a testament to my evolution as an artist and a reflection of the myriad experiences and design ideologies that have shaped my creative identity. Infusing the timeless beauty of literature with the evocative power of art, I crafted a narrative that weaves together chapters representing the different struggles, triumphs, and revelations that have defined my artistic journey.",
      "In the pursuit of authenticity and self-discovery, my manifesto explores the intricate relationship between art and the human experience, drawing inspiration from design ideologies such as authoritarianism and the Dunning-Kruger effect. I also delve into the importance of not allowing external factors to define our identities, emphasizing the need for introspection and self-reliance in the quest for artistic fulfillment.",
      "By exploring the concept of archetypes and phenomenology, I celebrate the universal threads that connect us all, transcending cultural and historical boundaries. As I navigate this rich tapestry of ideas and experiences, I am continually reminded of Marshall McLuhan's poignant maxim, \"the medium is the message,\" underscoring the profound impact of artistic expression on the world around us.",
    ],
    coverImage: `${IMG}/design-manifesto/01_1.webp`,
    // "Manifesto of Awakening" is read as a book, not viewed as a gallery: the
    // text spreads are set as real DOM text, while the artwork spreads and the
    // animated chapter cards stay as media inside the same sequence.
    book: manifestoBook,
    galleryVariant: "boards",
    gallery: [
      im("design-manifesto", "1.webp", "Emblem — may your flame burn forever"),
      {
        type: "video",
        src: `${VID}/design-manifesto/intro-loop.mp4`,
        poster: `${IMG}/design-manifesto/intro-loop-poster.webp`,
        alt: "Manifesto of Awakening — title spread",
      },
      im("design-manifesto", "3.webp", "Giacometti epigraph"),
      im("design-manifesto", "4.webp", "This is my journey, perhaps our journey"),
      im("design-manifesto", "5.webp", "Prologue"),
      im("design-manifesto", "6.webp", "Prologue, continued"),
      im("design-manifesto", "7.webp", "Prologue, continued"),
      im("design-manifesto", "8.webp", "Prologue, continued"),
      chapterLoop(1, "One — The Torch"),
      im("design-manifesto", "10.webp", "Chapter One — The Torch, text"),
      chapterLoop(2, "Two — The Bonfire"),
      im("design-manifesto", "12.webp", "Chapter Two — The Bonfire, text"),
      chapterLoop(3, "Three — The Journey"),
      im("design-manifesto", "14.webp", "Chapter Three — The Journey, text"),
      chapterLoop(4, "Four — The Oasis"),
      im("design-manifesto", "16.webp", "Chapter Four — The Oasis, text"),
      chapterLoop(5, "Five — The Stray Path"),
      im("design-manifesto", "18.webp", "Chapter Five — The Stray Path, text"),
      chapterLoop(6, "Six — The Weary Traveller"),
      im("design-manifesto", "20.webp", "Chapter Six — The Weary Traveller, text"),
      chapterLoop(7, "Seven — The Final Ascent"),
      im("design-manifesto", "21a.webp", "Chapter Seven — The Final Ascent, text"),
      chapterLoop(8, "Eight — Enlightenment"),
      im("design-manifesto", "23a.webp", "Chapter Eight — Enlightenment, text"),
      im("design-manifesto", "23b.webp", "Epilogue"),
      im("design-manifesto", "23c.webp", "The Five People You Meet in Heaven epigraph"),
      im("design-manifesto", "24.webp", "May you be the best version of yourself"),
    ],
    externalLinks: [
      { label: "Manifesto website", note: "Referenced on the original site; URL not recoverable." },
      { label: "Flipbook", note: "Referenced on the original site; URL not recoverable." },
    ],
    relatedProjectIds: ["solarpunk", "poster-design"],
    sourceUrl: "https://mznoor8.wixsite.com/portfolio/manifesto",
  },
  {
    id: "solarpunk",
    slug: "solarpunk",
    title: "Worldbuilding Through Solarpunk",
    subtitle: "Final masters project · Ripple Symposium, 2023",
    categoryId: "manifesto-design",
    year: "2023",
    context:
      "Master of Visual Communication and Design, Arizona State University — presented at the Ripple graduate symposium",
    role: "Designer, Author & Worldbuilder",
    tools: ["Adobe Illustrator", "Adobe Photoshop", "InDesign", "After Effects"],
    featured: true,
    summary:
      "A speculative design thesis that reimagines Phoenix, Arizona as Greater Phoenix — Solaris: a solarpunk city built on prefigurative politics, degrowth and conviviality. Delivered as a printed publication, an illustrated world, and a symposium address.",
    body: [
      "Worldbuilding Through Solarpunk asks what a city looks like when it is designed around sustainability, social justice, and a harmonious blend of nature and technology rather than around growth. Rather than argue the case abstractly, the project builds the place: Greater Phoenix — Solaris, an arid, sun-drenched metropolis reorganised beneath a vast solar disc.",
      "The argument runs through four ideas — prefigurative politics (embodying now the society we want), degrowth (that less production and consumption can mean more wellbeing), conviviality (Illich's tools that empower communities instead of bureaucracies), and solarpunk itself as an optimistic aesthetic and ethic.",
      "To make the vision tangible it is narrowed from macro to micro: a week in the life of Mia Greenfield, an urban agriculture specialist, moving through Solaris' water, energy and canopy districts. Each speculative scene is anchored to a real precedent — Curitiba's transit and green space, Vauban's car-free streets, Costa Rica's renewable grid.",
      "The work was published as a printed publication of six illustrated spreads and presented as the closing address of the Ripple graduate symposium. Both are gathered below: the film of the talk, and the publication read as a progressive story.",
    ],
    coverImage: `${IMG}/solarpunk-worldbuilding/solarpunk-talk-poster.webp`,
    videos: [
      vid(
        "solarpunk-worldbuilding",
        "worldbuilding-through-solarpunk.mp4",
        "solarpunk-worldbuilding",
        "solarpunk-talk-poster.webp",
        "Worldbuilding Through Solarpunk — the symposium presentation",
        "The full symposium address, envisioning Greater Phoenix — Solaris.",
      ),
    ],
    story: solarpunkStory,
    // The six printed spreads, shown whole and in page order above the
    // address (they are a designed artifact — read as designed, not cropped).
    storySpreads: Array.from({ length: 6 }, (_, i) =>
      im(
        "solarpunk-worldbuilding",
        `spread-${i + 1}.webp`,
        `Publication spread ${i + 1} of 6`,
        undefined,
        `Spread ${i + 1} of 6`,
      ),
    ),
    relatedProjectIds: ["ripple", "design-manifesto"],
  },

  // ========================= EXHIBITION DESIGN =========================
  {
    id: "exhibit-design",
    slug: "exhibit-design",
    title: "Exhibit Design",
    categoryId: "exhibition-design",
    role: "Exhibition / Spatial Designer",
    tools: ["Google SketchUp", "Adobe After Effects", "Unreal Engine"],
    featured: true,
    summary:
      "Three exhibition studies — a physical/digital geometric model, a transportable BMX pop-up retail stand, and an immersive Avengers museum built in Unreal Engine.",
    body: [
      "These projects were done to gain a better understanding of how to design comprehensive project books, work effectively within groups, organize space and flow, and create visual elements for exhibitions — designing graphic solutions within a three-dimensional space.",
    ],
    subProjects: [
      {
        title: "Geometric Harmony: A Fusion of Digital and Physical Design",
        body: [
          "Embracing the challenge of transforming conceptual ideas into tangible reality, I embarked on a project that required the fusion of both digital and physical design methods. This venture entailed the creation of a 3D rendering and physical model of three geometric shapes — a sphere, a triangle, and a rectangle — using precise measurements and an array of tools and techniques. The process began with the development of simple models, drawings, and SketchUp files to capture the essence of each shape.",
          "With the digital groundwork laid, I delved into the physical creation of the model, meticulously crafting each geometric shape using foam, cardboard, and paint. This hands-on approach demanded precision, patience, and a keen eye for detail. The final result — a striking physical model that seamlessly embodies the digital design — stands as a testament to merging traditional craftsmanship with cutting-edge technology.",
        ],
      },
      {
        title: "Exhibition Design Prompt 1 — BMX Pop-Up Stand (Flipbook)",
        body: [
          "Embarking on the challenge of creating a pop-up retail space for a BMX bike rental and purchase stand, I envisioned a versatile and transportable solution in the form of a modified shipping container. The concept was inspired by the inherent mobility and adaptability of shipping containers, making them ideal for a retail space that could be easily relocated to remote locations.",
          "Using Google SketchUp I created a detailed model of the shipping container, meticulously planning the interior and exterior layout — storage solutions, display areas, and rental stations — for a user-friendly and inviting environment. I then turned to Adobe After Effects to bring the pop-up stand to life through dynamic 3D renderings that captured the bold use of color, branding, and functional layout.",
        ],
      },
      {
        title: "Exhibition Design Prompt 2 — Avengers Museum Exhibit (Flipbook)",
        body: [
          "Creating an immersive museum experience dedicated to the iconic Avengers, I set out to design a captivating space that pays homage to each character while engaging visitors in a unique journey. Given the constraint of an L-shaped exhibit area, I divided the exhibit into distinct segments showcasing the history, weapons, equipment, background story, contributions, and props associated with each Avenger, with themed souvenir sections in each.",
          "With a solid design concept in place, I turned to Unreal Engine to bring the museum to life. This game engine provided the ideal platform for an immersive, interactive 3D environment — dynamic lighting, realistic textures, and engaging animations that draw visitors into each character's world. The final result stands as a testament to innovative design thinking and cutting-edge technology transforming spatial constraints into opportunities for creative expression.",
        ],
      },
    ],
    coverImage: `${IMG}/exhibition-design/01_Slide_1.webp`,
    gallery: [
      im("exhibition-design", "01_Slide_1.webp", "Geometric Harmony slide 1"),
      im("exhibition-design", "02_slide_2.webp", "Geometric Harmony slide 2"),
      im("exhibition-design", "03_1.webp", "BMX pop-up stand 1"),
      im("exhibition-design", "04_2.webp", "BMX pop-up stand 2"),
      im("exhibition-design", "05_7.webp", "BMX pop-up stand 3"),
      im("exhibition-design", "06_8.webp", "BMX pop-up stand 4"),
      im("exhibition-design", "07_1_b.webp", "Avengers museum exhibit 1"),
      im("exhibition-design", "08_2_b.webp", "Avengers museum exhibit 2"),
      im("exhibition-design", "09_ScreenShot00015.webp", "Avengers museum Unreal render 1"),
      im("exhibition-design", "10_HighresScreenshot00000.webp", "Avengers museum Unreal render 2"),
    ],
    relatedProjectIds: ["renders"],
    sourceUrl: "https://mznoor8.wixsite.com/portfolio/exhibitiondesign",
  },
  {
    id: "avengers-exhibition",
    slug: "avengers-exhibition",
    title: "Avengers Exhibition Design",
    subtitle: "Avengers S.T.A.T.I.O.N. at Arizona Science Center",
    categoryId: "exhibition-design",
    context: "Academic brief — exhibition design",
    role: "Exhibition / Spatial & Graphic Designer",
    tools: ["Unreal Engine", "Illustrator", "Photoshop", "InDesign"],
    featured: true,
    summary:
      "An immersive Marvel museum exhibit for a real Phoenix venue — an L-shaped floor plate divided into character segments, modelled and lit in Unreal Engine, and documented as a full project book with its own type, palette, material schedule and printed programme.",
    body: [
      "Avengers S.T.A.T.I.O.N. — the Scientific Training And Tactical Intelligence Operative Network — is the fictional division that trains and equips the Avengers. The brief was to site that fiction inside a real building, Arizona Science Center in downtown Phoenix, and design the whole visit: the route through the rooms, what the walls are made of, and everything the visitor is handed on the way in and out.",
      "The framing decision was to treat admission as induction. A visitor is not a ticket holder but a recruit, which is why the entry document is a clearance pass, the wall panels are laid out as case files, and the wayfinding reads as signage inside a facility rather than labels inside a museum.",
      "The room itself is an L. That shape means the whole show can never be seen at once, so the plan uses the corner as the turn in the story instead of designing around it. Each run is divided into character segments carrying one Avenger's history, weapons, equipment, background and props, each with its own souvenir point. Building it in a game engine rather than a CAD viewport was the point: dynamic lighting, specified materials and a walkable camera let the sequence be judged the way a visitor meets it — in order, at eye height.",
    ],
    coverImage: `${IMG}/avengers-exhibition/book-01-cover.webp`,
    cardImage: `${IMG}/avengers-exhibition/book-12-entrance-walkthrough.webp`,
    exhibit: avengersExhibition,
    credits: [
      "An unaffiliated academic concept. Marvel, the Avengers and S.H.I.E.L.D. are trademarks of Marvel Characters, Inc.; Arizona Science Center is named as the brief's venue. Neither commissioned or endorsed this work.",
    ],
    relatedProjectIds: ["exhibit-design", "renders"],
  },

  // ========================= POSTER DESIGN =========================
  {
    id: "poster-design",
    slug: "poster-design",
    title: "Poster Design",
    subtitle: "Design ideologies series",
    categoryId: "poster-design",
    role: "Graphic Designer",
    featured: true,
    summary:
      "A poster series exploring influential design ideologies — Society of the Spectacle, Postmodernism, The Medium is the Message — with three variations each demonstrating how subtle changes reshape meaning.",
    body: [
      "In my recent poster series, I embarked on a mission to explore the expressive power of visual design by delving into popular design ideologies that shape our understanding of the world. With themes centered around influential concepts such as the Society of the Spectacle, Postmodernism, and The Medium is the Message, I crafted a thought-provoking collection of posters that capture the essence of each ideology while challenging viewers to reflect on the underlying messages and values.",
      "For each theme, I created three distinct variations, showcasing the versatility and adaptability of visual design in conveying meaning through diverse visuals. These variations allowed me to experiment with color, typography, composition, and imagery — ultimately demonstrating how subtle changes can significantly impact the interpretation and perception of the poster.",
    ],
    // The series titles as listed on the original site (individual title→image mapping not confirmed).
    credits: [
      "Series titles: Gallery of Infinite · Awakening · Balance · Collective Consciousness · Essence of Time · Call to Reality · Détournement · The Medium Is The Message · Media · The Study Of Signs And Symbols",
    ],
    coverImage: `${IMG}/poster-design/05_poster-6.webp`,
    gallery: [2, 3, 4, 5, 6, 7, 8, 9, 10].map((num, i) =>
      im("poster-design", `${String(i + 1).padStart(2, "0")}_poster-${num}.webp`, `Poster ${num}`),
    ),
    relatedProjectIds: ["digital-painting", "design-manifesto"],
    sourceUrl: "https://mznoor8.wixsite.com/portfolio/posters",
  },

  // ========================= ANIMATION =========================
  {
    id: "animated-shorts",
    slug: "animated-shorts",
    title: "Animated Shorts",
    categoryId: "animation",
    role: "Animator / Motion Designer",
    tools: ["Adobe Illustrator", "Adobe After Effects (Element 3D)"],
    featured: true,
    summary:
      "An ambitious project merging 2D drawings with 3D environments to create an immersive, novel visual aesthetic — from refined vector illustration to fully rendered 3D scenes.",
    body: [
      "In my quest to push the boundaries of visual design and explore the full potential of the Adobe Suite, I embarked on an ambitious project to merge 2D drawings with 3D environments, creating an immersive and novel visual experience. This innovative endeavor challenged both my creativity and technical prowess.",
    ],
    process: [
      { title: "Concept Development & Sketching", description: "Envisioning the fusion of 2D and 3D, then rough drafts experimenting with compositions and perspectives for optimal integration." },
      { title: "Adobe Illustrator — Refining 2D Illustrations", description: "Transforming sketches into clean vector illustrations with depth and dimensionality, prepared for integration into 3D." },
      { title: "Adobe After Effects — Building the 3D Environment", description: "Constructing detailed 3D scenes with the Element 3D plugin — experimenting with shapes, materials, and lighting to complement the 2D work." },
    ],
    videos: [
      vid("animation-animated-shorts", "01_b0eba2c1f3.mp4", "animation-animated-shorts", "01_53ff1d_b0eba2c1f3b84a6a91366755fbe572acf000.webp", "Animated short 1"),
      vid("animation-animated-shorts", "02_329c98fc64.mp4", "animation-animated-shorts", "02_53ff1d_329c98fc64264ea8896bec0a97b90302f000.webp", "Animated short 2"),
      vid("animation-animated-shorts", "03_c568b7816c.mp4", "animation-animated-shorts", "03_53ff1d_c568b7816c2d4c08b601550835c15f29f000.webp", "Original trailer concept for animated TV series"),
    ],
    relatedProjectIds: ["social-pandemic", "renders"],
    sourceUrl: "https://mznoor8.wixsite.com/portfolio/animation",
  },

  // ========================= DOCUMENTARY =========================
  {
    id: "social-pandemic",
    slug: "social-pandemic",
    title: "The Social Pandemic",
    categoryId: "documentary",
    year: "2021",
    role: "Filmmaker, Editor & Motion Graphics Producer",
    context: "De Montfort University — event trailer featured on the Design Building",
    summary:
      "A documentary confronting the impact of social media on mental health — especially on children — combining filming, editing, and motion-graphics into a thought-provoking whole.",
    body: [
      "Choosing the topic \"The Social Pandemic\" tackles a very important issue for the digital age. As much as social media has its positives, there is a need to weigh its cons to establish a healthy balance and understanding of different perspectives. It is starting to have a severe impact on mental health for the current generation and future generations if it is not tackled. Children in the digitalized era are vulnerable and are reaching maturity early by being exposed to social media, developing their own perspective of how the world should be. 'Children have left their childhoods for social media' — a powerful strapline to begin with.",
      "As the filmmaker, editor, and motion graphics producer, I was responsible for bringing our vision to life and ensuring the final product was engaging, impactful, and thought-provoking. I worked closely with my classmates to plan and execute a series of interviews with experts in social media and child protection, and filmed b-roll to provide visual context.",
      "As editor, I crafted the story we wanted to tell, ensuring interviews, b-roll, and motion graphics came together seamlessly with attention to pacing and rhythm. For motion graphics, I created animations and infographics that illustrated the issues — from the impact of social media on children's mental health to explanations of complex concepts.",
      "In the end, I am incredibly proud of the final product. \"The Social Pandemic\" is a powerful and thought-provoking documentary that effectively communicates the dangers and risks children face on social media, and I am confident it will help raise awareness about this important issue.",
    ],
    coverImage: `${IMG}/documentary-social-pandemic/02_53ff1d_78c63e40fd2048539f279c81e9410fdef000.webp`,
    embeds: [
      {
        provider: "youtube",
        id: "SwhkFe3__Ps",
        title: "The Social Pandemic — full documentary",
        caption:
          "The complete film, hosted on YouTube. Click to load the player.",
      },
    ],
    gallery: [im("documentary-social-pandemic", "01_pngegg.webp", "Introduction logo")],
    videos: [
      vid("documentary-social-pandemic", "01_78c63e40fd.mp4", "documentary-social-pandemic", "02_53ff1d_78c63e40fd2048539f279c81e9410fdef000.webp", "Motion graphics news reel 1"),
      vid("documentary-social-pandemic", "02_e99ccdaf21.mp4", "documentary-social-pandemic", "03_53ff1d_e99ccdaf214a46adb4e2641dd0b121aaf000.webp", "Motion graphics news reel 2"),
      vid("documentary-social-pandemic", "03_6c8124d78f.mp4", "documentary-social-pandemic", "04_53ff1d_6c8124d78feb459aabdea19f9f8929caf000.webp", "Motion graphics news reel 3"),
      vid("documentary-social-pandemic", "04_9bcd06ea8f.mp4", "documentary-social-pandemic", "05_53ff1d_9bcd06ea8ff9438985590664f32f88a4f000.webp", "Motion graphics news reel 4"),
    ],
    externalLinks: [
      { label: "Live stream event", note: "Referenced on the original site; URL not recoverable." },
      { label: "Event trailer", note: "Featured on the De Montfort University Design Building; URL not recoverable." },
    ],
    relatedProjectIds: ["animated-shorts"],
    sourceUrl: "https://mznoor8.wixsite.com/portfolio/documentary",
  },

  // ========================= RENDERS =========================
  {
    id: "renders",
    slug: "renders",
    title: "3D Animation — Renders",
    categoryId: "renders",
    role: "3D Artist",
    tools: ["Element 3D (Adobe After Effects)"],
    featured: true,
    summary:
      "Miniature 3D environments and product visualizations rendered with Element 3D — from a Tesla Roadster reveal to recreations from Interstellar.",
    body: [
      "These projects were done in order to better understand the concept of 3D spaces and creating miniature environments. The scenes were rendered using the Element 3D plugin for Adobe After Effects. I am enamored with the art of 3D animation as it opens up a world of endless creative possibilities — the ability to craft and bring to life intricate worlds, characters, and scenes that captivate and enthrall.",
      "Each project presents a new challenge and an opportunity to stretch my skills, pushing the limits of what can be achieved through 3D animation. The journey from concept to final render is a thrilling one, filled with endless opportunities for exploration, experimentation, and innovation.",
    ],
    credits: [
      "Pieces: Tesla Roadster Reveal · Talespin Harbor · Made it to Mars first · Quiet Night · Muscle Car Showcase · Lamborghini Huracán EVO launch trailer · Recreations from Interstellar",
    ],
    videos: [
      vid("renders-3d-animation", "01_27dc6fad64.mp4", "renders-3d-animation", "01_53ff1d_27dc6fad649c401d9662655e17fe2e2cf000.webp", "Render 1"),
      vid("renders-3d-animation", "02_b59e63f665.mp4", "renders-3d-animation", "02_53ff1d_b59e63f66586490eabf90ff6b31a2d41f001.webp", "Render 2"),
      vid("renders-3d-animation", "03_2af2ed2f9d.mp4", "renders-3d-animation", "03_53ff1d_2af2ed2f9db943ad812186077bbf1e66f000.webp", "Render 3"),
      vid("renders-3d-animation", "04_b9c6d54a2b.mp4", "renders-3d-animation", "04_53ff1d_b9c6d54a2bba41ec9b29934f6086b564f000.webp", "Render 4"),
      vid("renders-3d-animation", "05_85e1966985.mp4", "renders-3d-animation", "05_53ff1d_85e19669859b4d4eb2de8a42c0ab8d0af000.webp", "Render 5"),
    ],
    relatedProjectIds: ["3d-lettering", "animated-shorts"],
    sourceUrl: "https://mznoor8.wixsite.com/portfolio/renders",
  },

  // ========================= 3D LETTERING =========================
  {
    id: "3d-lettering",
    slug: "3d-lettering",
    title: "3D Lettering",
    categoryId: "3d-lettering",
    role: "3D / Motion Typographer",
    tools: ["Adobe Suite", "Blender"],
    featured: true,
    summary:
      "Animated 3D typography built in Blender and the Adobe Suite — bringing text to life with depth, dimension, and movement across logo animations and typographic sequences.",
    body: [
      "These personal projects were done using a variety of 3D software to create animated text, built using the Adobe Suite and Blender. With 3D lettering, I am able to bring text to life in ways that are not possible with traditional 2D typography. The ability to add depth, dimension, and movement to text animations creates a truly engaging and immersive experience for viewers.",
      "I appreciate the challenge that comes with creating 3D lettering and the opportunity to constantly push the boundaries of what is possible with this art form. Whether it's a bold and impactful logo animation or a mesmerizing 3D typographical sequence, I find immense joy and satisfaction in creating dynamic and engaging 3D text animations.",
    ],
    videos: [
      vid("3d-lettering", "01_0372be1e98.mp4", "3d-lettering", "01_53ff1d_0372be1e984844498112f91f292c7b36f000.webp", "Serenity logo with fluid simulation"),
      vid("3d-lettering", "02_b499e1c376.mp4", "3d-lettering", "02_53ff1d_b499e1c376484cea9bd8c05daa3c9bfaf000.webp", "Porsche logo concept art"),
      vid("3d-lettering", "03_88fc8abd93.mp4", "3d-lettering", "03_53ff1d_88fc8abd93934f42abd7137f182a7e4ff000.webp", "Netflix promo concept art"),
      vid("3d-lettering", "04_7330f78424.mp4", "3d-lettering", "04_53ff1d_7330f78424114a279eea66e2994836c2f000.webp", "Activision logo concept"),
    ],
    relatedProjectIds: ["renders", "digital-painting"],
    sourceUrl: "https://mznoor8.wixsite.com/portfolio/3dlettering",
  },

  // ========================= T-MOBILE =========================
  {
    id: "magenta-moves",
    slug: "magenta-moves",
    title: "Magenta Moves",
    subtitle: "\"Meeting in a Box\" — T-Mobile for Business",
    categoryId: "t-mobile",
    year: "2023",
    client: "T-Mobile for Business",
    role: "Instructional Designer",
    tools: ["Illustrator", "InDesign", "Photoshop"],
    featured: true,
    summary:
      "A gamified \"Meeting in a Box\" learning solution for T-Mobile's sales team — a portable kit of instructional cards, games, and multimedia that made training engaging, interactive, and fun.",
    body: [
      "As an instructional designer at T-Mobile for Business, I embarked on an exciting and unique project — the creation of a \"Meeting in a Box\" solution aimed at gamifying the learning experience for our sales team. The goal was to provide an engaging, interactive, and fun way for our sellers to increase their skills and knowledge, ultimately driving better performance and results.",
      "The design process started with a deep dive into understanding the needs and preferences of the sales team. I conducted interviews and focus groups with team members and collaborated closely with sales managers and subject matter experts. This research allowed me to gain valuable insights into the specific challenges faced by the team and the most effective ways to engage them in learning.",
      "I envisioned a portable, easily accessible kit containing a variety of tools and activities designed to promote learning, collaboration, and skill development. I utilized my graphic design skills to create visually appealing, informative materials aligned with T-Mobile's brand identity for a cohesive and professional look throughout the kit.",
      "The solution included a mix of physical and digital components — instructional cards, interactive games, role-playing scenarios, and multimedia presentations. A deck of illustrated flashcards reinforced product knowledge, while an interactive board game encouraged practicing negotiation and problem-solving in a fun, engaging way. I worked closely with vendors to produce high-quality materials, then collaborated with sales managers to integrate the solution into their regular team meetings.",
      "This project was a unique and innovative approach to sales training that combined instructional design, graphic design, and project management. By creating an engaging and interactive learning experience, we equipped the sales team with the tools and knowledge to excel — a testament to the power of creative, out-of-the-box thinking in instructional design.",
    ],
    coverImage: `${IMG}/internship-t-mobile/03_Project_Presentation.webp`,
    // Presentation slides and kit photography — read full width in sequence.
    galleryVariant: "boards",
    gallery: [
      im("internship-t-mobile", "01_photo_2023-03-16_14-50-52.webp", "Physical box photo 1"),
      im("internship-t-mobile", "02_photo_2023-05-03_11-03-47_(2).webp", "Physical box photo 2"),
      im("internship-t-mobile", "03_Project_Presentation.webp", "Project presentation"),
      ...[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((_n, i) => {
        const files = ["04_7.webp", "05_8.webp", "06_9.webp", "07_10.webp", "08_11.webp", "09_12.webp", "10_13.webp", "11_15.webp", "12_16.webp", "13_17.webp", "14_18.webp", "15_19.webp", "16_20.webp", "17_22.webp", "18_23.webp", "19_25.webp", "20_26.webp"];
        return im("internship-t-mobile", files[i], `Meeting in a Box design ${i + 1}`);
      }),
    ],
    relatedProjectIds: ["frontline-readiness"],
    sourceUrl: "https://mznoor8.wixsite.com/portfolio/t-mobile",
  },
];

export const projectById = (id: string) => projects.find((p) => p.id === id);
export const projectsByCategory = (categoryId: string) =>
  projects.filter((p) => p.categoryId === categoryId);
export const projectBySlug = (categoryId: string, slug: string) =>
  projects.find((p) => p.categoryId === categoryId && p.slug === slug);
