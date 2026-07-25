// "Worldbuilding Through Solarpunk" — the progressive story.
//
// Every passage below is Mohammed's own writing, taken from the masters
// symposium speech ("Final speech done and duster.pdf") and matched to the
// illustration that carries it in the printed publication (Publication.pdf,
// 6 spreads). Handwritten margin notes from the spreads are kept as `aside`
// — they are Mia's diary voice and part of the piece's design.
//
// Nothing here is invented. Where the speech and the publication differ in
// wording, the publication (the finished artifact) wins.

import type { StoryBeat } from "./types";

const IMG = "/media/images/solarpunk-worldbuilding";
const im = (file: string, alt: string) => ({ src: `${IMG}/${file}`, alt });

export const solarpunkStory: StoryBeat[] = [
  // ---------------------------------------------------------------- Act I
  {
    chapter: "The Invitation",
    title: "A world many might consider utopian",
    text: [
      "Imagine a world that many might consider utopian — a world free of profit-driven corporations, where humanity's focus is directed towards sustainability, social justice, and a harmonious blend of nature and technology.",
      "I invite you all to embark on this journey with me, as we explore how prefigurative politics, degrowth, conviviality, and solarpunk can contribute to the realization of this vision.",
    ],
    aside: "Sustainability · Social Justice · Nature and Technology",
    images: [im("04-ark-garden.jpg", "A vessel carrying a garden, drawn in yellow and green ink")],
  },
  {
    chapter: "The Cost",
    title: "Land as a community to which we belong",
    text: [
      "Our current global economic system is characterized by relentless growth, consumerism, and a persistent pursuit of profit. However, this has come at a steep cost — environmental degradation, social inequality, economical downfall and a loss of community.",
    ],
    quote: {
      text: "We abuse land because we regard it as a commodity belonging to us. When we see land as a community to which we belong, we may begin to use it with love and respect.",
      source: "Aldo Leopold, 1949",
    },
    images: [im("03-rooted-tree.jpg", "Pencil study of a tree with exposed roots on an eroding cliff")],
  },
  {
    chapter: "Prefigurative Politics",
    title: "Being the change you wish to see",
    text: [
      "The first concept I would like to discuss is prefigurative politics. It is a political philosophy that emphasizes the importance of embodying the values and structures of the society we wish to create in our current actions and relationships (Maeckelbergh, 2011).",
      "In essence, it is the practice of “being the change you wish to see in the world.” By adopting prefigurative politics, we can begin to nurture a society that is more equitable, compassionate, and environmentally responsible.",
    ],
    aside: "Empower · Act · Encourage",
    images: [im("01-planting.jpg", "Figures gathered around a plinth from which a tree is growing")],
  },
  {
    chapter: "Degrowth & Conviviality",
    title: "Tools that empower communities",
    text: [
      "Degrowth challenges the prevailing notion that economic growth is inherently good. It posits that a reduction in production and consumption can lead to environmental sustainability, social well-being, and a more equitable distribution of resources (Kallis, 2018). By embracing degrowth, we prioritize the well-being of both people and the planet over the accumulation of wealth.",
      "Conviviality, a term popularized by the social critic Ivan Illich, emphasizes the importance of social interaction, cooperation, and mutual aid within communities (Illich, 1973). A convivial society is one where people come together to address local issues, share resources, and foster a sense of belonging.",
    ],
    aside: "Emphasize · Celebrate · Harmonize",
    images: [im("02-assembly.jpg", "Ink drawing of a dense crowd of stylised faces")],
  },

  // --------------------------------------------------------------- Act II
  {
    chapter: "The Search",
    title: "Cities reimagined through green technology",
    text: [
      "My journey into the world of solarpunk and sustainability began as a creative exploration. I was inspired by the city of Curitiba, Brazil, which serves as a prime example of sustainable development, combining innovative public transportation systems, extensive green spaces, and social inclusion initiatives.",
      "I started with sketches of iconic cities like Seattle and New York reimagined through the lens of green technologies and harmonious integration with nature. These initial illustrations sparked my curiosity and passion for the solarpunk ethos, leading me to question how I could showcase the transformative potential of these principles in a more tangible and impactful way.",
    ],
    images: [
      im("05-seattle.jpg", "Watercolour of Seattle overgrown with forest and waterways"),
      im("06-new-york.jpg", "Watercolour of New York towers wrapped in dense green canopy"),
    ],
  },
  {
    chapter: "The Proposition",
    title: "Greater Phoenix — Solaris",
    text: [
      "It was then that I conceived the idea of reimagining Phoenix, Arizona, into a solarpunk city called Greater Phoenix — Solaris. By transforming a city situated in an arid, sun-drenched environment, I could demonstrate the resilience and adaptability inherent in solarpunk design.",
    ],
    aside: "Nature · Humanity · Technology",
    images: [im("07-solaris-mark.jpg", "The Solaris emblem — a green solar disc over a city skyline")],
  },

  // -------------------------------------------------------------- Act III
  {
    chapter: "The City",
    title: "Welcome to Solaris",
    text: [
      "Welcome to Greater Phoenix — Solaris, a visionary solarpunk city that embraces a harmonious blend of nature, technology, and sustainability. In this eco-friendly urban paradise, cutting-edge solar architecture meets verdant green spaces, fostering a thriving, environmentally conscious community.",
      "A massive solar-disc hovers above the city, capturing sunlight to power the metropolis below. This megastructure not only generates clean energy but also creates a visually stunning and iconic symbol of the city's commitment to sustainability, and serves as a major public transit hub.",
    ],
    aside: "My City My Love",
    images: [im("08-solaris-aerial.jpg", "Aerial view of Solaris with the vast solar disc above the desert city")],
  },
  {
    chapter: "Green Infrastructure",
    title: "Living walls and rooftop gardens",
    text: [
      "Green infrastructure is the cornerstone of Solaris, with buildings and streets adorned with verdant vegetation. Living walls and rooftop gardens soften the urban landscape, improving air quality and promoting biodiversity.",
    ],
    images: [im("09-green-street.jpg", "Pencil perspective sketch of a Solaris street lined with planting")],
  },
  {
    chapter: "Inside the Disc",
    title: "Eco-transport and shaded walkways",
    text: [
      "This view is the interior of the solar disc, which boasts eco-transport such as solar-powered public transportation options including high-speed sun rails, reducing pollution. It also has a pedestrian network with shaded walkways and bike lanes promoting sustainable mobility, making the city interconnected and accessible from one end to the other.",
      "Another view of the interior showcases a multi-level gardening system allowing for life to thrive alongside us even in the busiest of days — a prime example of how we can learn to co-exist with nature and embody the values of solarpunk and convivial living.",
    ],
    aside: "Interiors so beautiful I could stay here all day",
    images: [
      im("10-disc-atrium.jpg", "Interior of the solar disc with a great tree at its centre"),
      im("11-disc-gardens.jpg", "Multi-level gardens and transit lines inside the solar disc"),
    ],
  },

  // --------------------------------------------------------------- Act IV
  {
    chapter: "Macro to Micro",
    title: "Mia Greenfield, 29",
    text: [
      "Let us talk about an individual experiencing life in a sector of Solaris. As we narrow down to a week in the life of this individual, we can better see the bigger picture when we transition from macro to micro.",
      "Mia Greenfield, age 29, Urban Agriculture Specialist. Mia was born and raised in Greater Phoenix — Solaris. Her parents were early adopters of the solarpunk movement and instilled in her a deep appreciation for the environment and sustainable living. She is passionate about fostering a harmonious relationship between nature and urban living.",
    ],
    aside: "Mia xoxo",
    images: [im("12-mia-sheet.jpg", "Character sheet for Mia Greenfield with three costume studies")],
  },
  {
    chapter: "Monday",
    title: "Home, and a garden on the terrace",
    text: [
      "Mia Greenfield begins her day by waking up in her solar-powered apartment, filled with natural light and vibrant greenery. She steps into her open space living room, where the warm morning sun illuminates the eco-friendly decor and thoughtful solarpunk design elements.",
      "Mia then heads to her kitchen to prepare breakfast, selecting fresh fruits harvested from her vertical garden that grows lushly on her terrace. The garden is a testament to sustainable living, maximizing space while providing fresh, organic produce right at her fingertips.",
    ],
    aside: "Home Sweet Home",
    images: [
      im("13-mia-home.jpg", "Isometric cutaway of Mia's solar-powered apartment"),
      im("14-living-room.jpg", "Interior sketch of the open-plan living room"),
      im("15-kitchen.jpg", "Interior sketch of the kitchen with plants on every shelf"),
    ],
  },
  {
    chapter: "Monday",
    title: "The ride to work",
    text: [
      "After enjoying a nutritious meal, Mia hops on her electric solar-powered bike and sets off for work. This ease of interconnectedness that Solaris has been built upon can be seen in Vauban in Freiburg, Germany. Vauban has been designed as a sustainable, eco-friendly community, where cars are largely unnecessary, and public transportation, walking, and cycling are prioritized (Freytag, Löw, & Röhle, 2016).",
    ],
    aside: "I love my bike. I think I will name her Luna",
    images: [im("16-mia-bike.jpg", "Mia cycling through a sunlit Solaris street")],
  },
  {
    chapter: "The Districts",
    title: "Water, energy, canopy",
    text: [
      "She then passes through three distinct neighborhoods, each showcasing unique aspects of solarpunk, degrowth and convivial living. The first showcases water harvesting technology that is effective in combatting drought and making Solaris a self-replenishing water source, with every resident carrying the torch of degrowth. Water scarcity is a trouble of the past.",
      "In the second neighborhood, houses can be seen integrated with solar panels, and wind turbines span across the horizon utilizing wind energy to its maximum potential. An example of this being implemented today can be seen in Costa Rica, which has been able to generate more than 98% of its electricity from renewable sources in recent years (IRENA, 2018).",
    ],
    aside: "Oh how I love this city",
    images: [
      im("17-water-district.jpg", "The water-harvesting district rendered in ink and watercolour"),
      im("18-energy-district.jpg", "The energy district with solar roofs and distant wind turbines"),
    ],
  },
  {
    chapter: "The Canopy District",
    title: "As if each home is a living, breathing entity",
    text: [
      "In the third neighborhood, renowned for its distinctive integration of lush greenery and imaginative urban design, the Canopy District is often hailed as the epitome of solarpunk living. The houses, each uniquely designed, are adorned with vibrant vertical gardens, cascading vines, and rooftop gardens teeming with life. It's as if each home is a living, breathing entity, coexisting with the surrounding flora and fauna.",
      "In the heart of the Canopy District, Mia comes across a quaint café that serves locally sourced, organic food. The café's terrace and walls are enveloped in fragrant jasmine and vibrant bougainvillea, creating an intimate atmosphere that encourages conversation and connection among its patrons, fostering conviviality.",
    ],
    aside: "When can I move here · I can smell the jasmine",
    images: [
      im("19-canopy-district.jpg", "The Canopy District, homes wrapped in vertical gardens"),
      im("20-verdant-cafe.jpg", "The Verdant Haven Café, its walls covered in flowering vines"),
    ],
  },
  {
    chapter: "Tuesday",
    title: "Decisions actually get made",
    text: [
      "Mia attends a community meeting at the Solaris Community Center, a space designed to promote civic engagement and encourage local participation in shaping the city's future. The citizens of Greater Phoenix — Solaris are eager to embody prefigurative politics, enacting the changes they wish to see in their society by directly participating in decision-making processes and grassroots initiatives.",
      "The center is a marvel of sustainable design, with its geodesic dome, solar panels, and walls adorned with plants that capture the spirit of the solarpunk movement. One proposal during this meeting suggests expanding the city's network of vertical gardens, providing workshops and resources for residents to create green spaces on their balconies and rooftops.",
    ],
    aside: "I love that decisions actually get made",
    images: [im("21-community-center.jpg", "The Solaris Community Center under its geodesic dome")],
  },
  {
    chapter: "Wednesday",
    title: "These children are the future",
    text: [
      "Mia spends her day at the local urban farm, where she teaches school children about sustainable agriculture and the importance of a balanced ecosystem. The farm, powered by solar energy, features diverse crops, aquaponics systems, and pollinator habitats, all in a space-saving vertical design.",
      "In this context, education plays a crucial role in Solaris, equipping individuals with the knowledge and skills needed to drive change. As they raise the new generation, they prioritize ecological literacy, creative problem-solving, and empathy.",
    ],
    aside: "These children are the future",
    images: [im("22-urban-farm.jpg", "The vertical urban farm with its angled solar glasshouse")],
  },
  {
    chapter: "Thursday",
    title: "The biodome",
    text: [
      "Mia visits the Phoenix Solaris Botanical Gardens to research new plant species that can be incorporated into the city's urban farms and green spaces. The gardens boast a biodome powered by solar energy and a mix of desert flora and exotic plants, all thriving in harmony.",
    ],
    aside: "Work couldn't get any better",
    images: [im("23-botanical.jpg", "The botanical gardens' solar-powered biodomes in the desert")],
  },
  {
    chapter: "Friday",
    title: "Music under the solar stage",
    text: [
      "Mia and her friends attend a concert at the Solaris Amphitheater, an open-air venue that harnesses solar energy to power the stage and light displays. The concert promotes local musicians who create music inspired by the solarpunk movement, blending traditional instruments with innovative technology.",
    ],
    aside: "My favorite place",
    images: [im("24-amphitheater.jpg", "A crowd at the open-air Solaris Amphitheater at dusk")],
  },
  {
    chapter: "Saturday",
    title: "The community kitchen and the art walk",
    text: [
      "Mia participates in a neighborhood community kitchen, where people come together and socialize, enriching their livelihood and building a sense of community which showcases the concepts of degrowth and convivial living. A community that works together, survives together — this ensures there are plenty of resources available for everyone.",
      "She visits the Solaris Art Walk in the evening, where local artists showcase their solarpunk-inspired creations made from recycled and sustainable materials.",
    ],
    aside: "Everyone here is so nice · Couldn't think of a better place to relax",
    images: [
      im("25-community-kitchen.jpg", "Cutaway of the neighbourhood community kitchen"),
      im("26-art-walk.jpg", "The Solaris Art Walk lit up at night"),
    ],
  },
  {
    chapter: "Sunday",
    title: "No comment",
    text: [
      "Unfortunately, Mia refused to offer any further comments as to what she does on a Sunday, as those are her days off. Can you imagine having a whole day off in the future to recharge yourself?",
    ],
    aside: "Sundays? Sundazed. I need a nap",
    images: [im("27-sunday.jpg", "A figure resting on a sofa under the word Sundays")],
  },

  // ---------------------------------------------------------------- Act V
  {
    chapter: "The Call",
    title: "Courage, conviction, power",
    text: [
      "By examining these case studies tying back to life in Solaris, we can gain valuable insights into the practical application of solarpunk principles and their potential to transform our world for the better. The journey towards a solarpunk future will not be without its challenges, but the potential rewards are immeasurable.",
      "As designers, educators, and global citizens, we have a unique opportunity to contribute to this vision, using our skills, expertise, and passion to shape a more just and sustainable world.",
      "Together, we can build a future that is rooted in sustainability, social justice, and the harmonious blend of nature and technology — a future where the values of prefigurative politics, degrowth, conviviality, and solarpunk guide our actions and decisions, and where designers play a crucial role in shaping the material culture and built environment that surrounds us.",
    ],
    quote: {
      text: "Never doubt that a small group of thoughtful, committed citizens can change the world; indeed, it's the only thing that ever has.",
      source: "Margaret Mead",
    },
    aside: "Thank you, and let us embark on this journey together.",
    images: [],
  },
];
