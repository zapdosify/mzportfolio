import type { BookBlock } from "./types";

// ---------------------------------------------------------------------------
// "Manifesto of Awakening" — read as a book.
//
// Every word is Mohammed's, transcribed from the printed spreads in
// images/design-manifesto/. The spreads are the source of truth: the draft
// manuscript (tools/manifesto-docx-extract.txt) is an EARLIER version — chapter
// six opens differently there, chapters seven and eight are reworded, and
// chapter four's closing paragraph was cut from the book. It is kept only for
// cross-checking shared passages word for word. See MANIFESTO-TRANSCRIPT.md.
//
// Printed slips are silently corrected (spelling, doubled words, agreement,
// the pronoun "I"); the voice — second person, rhetorical questions, long
// cumulative sentences — is left exactly as written.
// ---------------------------------------------------------------------------

const IMG = "/media/images/design-manifesto";
const VID = "/media/videos/design-manifesto";

/**
 * Phrases the printed book sets as links into its reference list. Written once
 * here and matched inside prose, so the wording stays in the paragraph text.
 */
export const manifestoLinks: Record<string, string> = {
  "authoritarian tyranny":
    "https://www.indexoncensorship.org/2017/10/jodie-ginsberg-art-authoritarianism/",
  "Dunning-Kruger":
    "https://www.verywellmind.com/an-overview-of-the-dunning-kruger-effect-4160740",
  archetype:
    "https://conorneill.com/2018/04/21/understanding-personality-the-12-jungian-archetypes/",
  phenomenology:
    "https://link.springer.com/article/10.1007/s40037-019-0509-2",
  "dictated by the medium":
    "http://webservices.itcs.umich.edu/mediawiki/DigitalRhetoricCollaborative/index.php/%22Medium_is_the_Message%22",
  "détournement": "https://www.marxists.org/reference/archive/debord/society.htm",
};

const art = (file: string, alt: string): BookBlock => ({
  kind: "plate",
  src: `${IMG}/${file}`,
  alt,
});

const chapter = (n: number, title: string): BookBlock => ({
  kind: "chapter",
  number: n,
  title,
  src: `${VID}/chapter-${n}.mp4`,
  poster: `${IMG}/chapter-${n}-poster.jpg`,
});

export const manifestoBook: BookBlock[] = [
  art("1.jpg", "Emblem — may your flame burn forever"),

  {
    kind: "chapter",
    number: 0,
    title: "Manifesto of Awakening",
    src: `${VID}/intro-loop.mp4`,
    poster: `${IMG}/intro-loop-poster.jpg`,
  },

  {
    kind: "epigraph",
    text: "The object of art is not to reproduce reality, but to create a reality of the same intensity.",
    source: "Alberto Giacometti",
  },
  {
    kind: "verse",
    lines: [
      "This journey has a beginning and the destination is the light at the end of the tunnel.",
      "Your own journey is an interpretation of how you see the world and perceive it.",
      "This is my journey, perhaps, our journey.",
    ],
  },

  art("5.jpg", "Prologue"),

  {
    kind: "prose",
    paragraphs: [
      "Art is neither a luxury nor an embellishment of civilization; rather, it is an essential part of the human experience. I think it's a necessary thing to do. It is one of the primary goals of human culture. Keep reminding yourself that your life can be transformed by the power of creativity.",
      "Greetings to you, my fellow dreamer, my striving artist, my beloved reader. When do you start to notice what's going on around you? It was as if the world had become more deadly as your knowledge of it grew. There was a lot of personal experience and choices that lead you to this point in time when you are torn between wanting to give the world you once knew a second opportunity and not. That opportunity and change can only be given by us as designers, as artists, as believers, and as peacekeepers. Modern-day shamans, artists are the last line of defense against authoritarian tyranny. They express their ideas to the public via art. Guardians of our small rays of light forever. The artist's connection to the source rejects what is bad inside the human soul. Even though all other lights have gone out, the artist steadfastly holds on to his torch of truth despite the gloom. Don't be afraid to put your faith in the fundamental worth of doing what you love, even if it's difficult at times. Take a step back and accept the process in a world of instant gratification and performance pressure. Make use of what you've learned from your new creative endeavor in other aspects of your life. Apply it.",
      "In the face of frustration and disappointment, have you been able to maintain your composure? Allow others to do the same. How much more patient with yourself have you been because of learning something new, such as cello or painting? Incorporate this into your everyday routine. Have your artistic endeavors helped you discover a new level of happiness within yourself? Make sure to spread the joy with your loved ones. It's been a long time since you've felt grounded in your body. Thank your body for enabling you to participate in this event. We may fully experience the joyful and therapeutic consequences of being creative if we shift our emphasis away from the finished result and back to the process. Whatever the purpose for your creative endeavor, whether it be for a second profession, to bring more joy into your life, to reinvent yourself, or to express various parts of yourself, keep conscious of what elements of the process you love and what the process provides you.",
      "We need to stop promoting the notion that creativity diminishes with age.",
      "If the pendulum swings and signals degrade, a new message is required to replace the old one's inertness, the artist's visions are what define an era. It is imperative that a fresh strategy be conceived with enough emotional impetus to launch an incipient vision into existence and propel us out of the gravitational pull of frozen ideology.",
      "You may see the world from an entirely new viewpoint through art, and it's this shift in perspective, coupled with the artist's conscious awareness tuned into a specific vibratory frequency that shakes apart inertia, devastates and illuminates broken institutions, and inspires new ideas. Artistic creativity is fueled by the ability to deduce, feel, and empathize with a wide range of emotional states. To be a true artist, you must live in a world that is both open and private, esoteric, and pure. In a semi-lucid state of alchemical flow, high-level conscious interfaces interpret and connect meta understandings together, consolidating a vast range of ideas into an aesthetically beautiful simplicity.",
      "It is the artist's choice of medium that sets the stage for an array of mental copulations that attract and repel each other. An unblinking mosaic of thoughts and concepts is fused together until a cohesive mind construct that consists of many things but is also unique in its own right is born.",
      "There has been an absence of an incubation time that would have allowed a more complete work to emerge. This is not a new problem for Western society, but the pace has sped up significantly as a result of the overcrowded smart phone era; hence, much of what we receive are fragments of hastily churned out notions or minimally altered retellings of better-told tales. There is rarely a moment of isolation if one follows the prescribed road put forth by parents, instructors, and institutions. There's never a chance to clear your head and think clearly. There will never be a time when an idea can mature, and minds will never be able to think and clear themselves of the ego's lies that cloud the field of vision.",
      "In today's hyper-competitive capitalist society, arrogance is praised as a good sense of extroversion and aggressiveness. The Dunning-Kruger effect is at work here, with trophies, prizes, honors, degrees, and the panoply of compliments to inflate plutocrats. All the self-serving haughtiness espoused by capitalist culture is out of date and only serves to inflate egos rather than calm them down. To those who seek the transient pleasure of worldly gain, the egotistical parade of it's all about me-ism may appeal, but it is death to art and harms us all.",
      "In a fast-paced world, artistic messages are hindered both when they are being created and when they are being absorbed. The artist's most effective weapon is vision, and the narrower and more constrained the waking awareness, the more limited the creative effort will be. A terrified panicked mind that needs to pay the bills cannot see beyond itself. Audiences, on the other hand, are unable to comprehend a work of art when they are distracted by their daily concerns and are unable to fully immerse themselves in it.",
      "People will continue to plunge into increasingly basic thought patterns as capitalists continue to modify art to sell to ever more crowded brains, resulting in an ever-decreasing circle of dumbed-down, hurried art, which is then only partially understood by today's cluttered minds. Symbolically, this cycle depicts the gradual demise of rationality, wisdom, and spirituality, all of which are slowly suffocated by greed.",
    ],
  },
  {
    kind: "pull",
    text: "Remove any notions of excess or deficit from your mind, don't let them define you.",
  },
  {
    kind: "prose",
    paragraphs: [
      "Before all journeys commence, such as this one, we must reflect on where we stand, our personal goals, our journeys, our dreams, what did it take for us to get here? How many odds did you overcome that may have diminished with memory, how powerful do you feel at this stage in your life to be able to speak to the world through your visual prowess? are you the soul that guided itself or held the torch for others as a beacon?",
    ],
  },

  chapter(1, "The Torch"),
  {
    kind: "lead",
    text: "This is a personal piece of how I came to be, a peek into the way I view the world, this is my flame.",
  },
  {
    kind: "prose",
    paragraphs: [
      "The torch represents my spark; despite all odds, we all had that starting point; it may have been the most amazing idea that began with nothing more than a scribbling on the back of an old notebook, an idea that you crumpled up and put away, never to look back at it again. What if, regardless of age, it was the only pure vision the world needed to be aware of? Were you surrounded by folks who congratulated you on what you did? Or, as the saying goes, “an idle mind is the devil's factory.”",
      "Exposure to negativity at an early age leads to the belief that this is the way of the world and how it operates. Your birth determines your future. In my area of the globe, you are hailed as a doctor, engineer, or IT professional from the minute you are born. I thought that's what I wanted to be because that's all I thought mattered. The media bolstered these views by depicting day and night the great exploits and triumphs attained by engaging in these professions; you practically win at life, they asserted.",
      "There I was, staring at my unsharpened pencil and crumpled up paper, wondering if these few written sentences had the capacity to gain the world's admiration. What if I wanted to be different? It couldn't be that this is what everyone is meant for. Personally, there was always a dark figure towering over my creative dreams; the figure symbolized expectations, expectations to live in accordance with what others wanted, societal expectations. You may have arrived on the life spectrum where you were certain of what you wanted to be, and then there's the spectrum where you're holding on to the slightest piece of thought, the invisible silver thread, just maybe, just maybe I'm supposed to be this visionary in my own way. But these were merely the folly of an immature intellect, and I had no choice but to reject them and be drawn into the blackhole of becoming what was advertised. I was conscious, but it was drowned out by the white noise of the world; little did I realize that my future would be filled with upheaval until I was eventually satisfied with where I wanted to be.",
    ],
  },

  chapter(2, "The Bonfire"),
  {
    kind: "prose",
    paragraphs: [
      "Thank you for sticking with me at this point in the journey; perhaps we share something in common; this is the point where we gather and reflect our thoughts; the bonfire has its own special significance; it provides you with heat and comfort on the coldest of nights; it attracts and catches the attention of any likeminded wandering souls or perhaps some simply seeking refuge from the harsh environment. However, it is a haven of rest where no one is condemned and where everyone is equal in the eyes of the flame. Now, as we all sit here, I'd want to ask you: what is your archetype in this journey? Are you more of a doer, a dreamer, or a believer? they believe it is critical to define who you are before embarking on this voyage of self-discovery. We believe in the notion of being led and then leading others once we comprehend the gravity of leadership; we read about and understand the experiences of others; this is the concept of phenomenology created by Edmund Husserl. We can relate and grasp this journey via the idea of learning, rather than through real experiences, because the more you gain knowledge, the more it genuinely opens up numerous doors.",
    ],
  },
  {
    kind: "list",
    title: "The archetypes",
    items: [
      ["To be innocent", "is to be happy and to be innocent is to be young. In search of relationships and belonging; supportive, faithful, and down to earth."],
      ["The Hero", "is a brave, daring, and inspiring person on a quest to improve the world."],
      ["The Rebel", "Challenges authority and norms; desires revolt and revolution."],
      ["The Traveler", "Finds inspiration in adventure, danger, and new experiences."],
      ["The Creator", "Imaginative and determined to create lasting value."],
      ["The Ruler", "Brings order to chaos, is strict, yet responsible and ordered."],
      ["The Magician", "The Magician is a visionary and spiritual being who wishes to create something exceptional."],
      ["The Lover", "Inspires love, passion, romance, and dedication. The Caregiver is sympathetic, nurturing, and kind."],
      ["The Jester", "Spreads delight via comedy, irreverence, and mischief."],
      ["The Sage", "is a wise mentor or counselor who is dedicated to helping the world attain deeper insight and knowledge."],
    ],
  },
  {
    kind: "epigraph",
    text: "I had to philosophize. Otherwise, I could not live in this world.",
    source: "Edmund Husserl",
  },
  {
    kind: "aside",
    title: "Phenomenology",
    paragraphs: [
      "Phenomenology is an experience-based philosophy. The ultimate source of all meaning and value, according to phenomenology, is human lived experience. All philosophical systems, scientific theories, and aesthetic judgements are abstractions from the experienced world's ebb and flow. According to phenomenology, the goal of the philosopher is to characterize the structures of experience, including awareness, imagination, relationships with other people, and the situatedness of the human subject in society and history. Phenomenological theories of literature see works of art as mediators between the author's and the reader's consciousnesses, or as efforts to reveal elements of human being and their worlds.",
      "The modern originator of phenomenology is the German philosopher Edmund Husserl (1859–1938), who wanted to transform philosophy into a “rigorous science” by returning its focus “to the objects themselves” (zu den Sachen selbst). He does not want for philosophy to become empirical, as if “facts” could be discovered objectively and totally. Rather, in quest of foundations on which philosophers can base their knowledge with confidence, Husserl suggests that reflection set aside any unprovable assumptions (such as those concerning the existence of objects or ideal or metaphysical entities) and characterize what is provided in experience.",
      "He claims that the path to a presuppositionless philosophy begins with suspending the “natural attitude” of daily knowledge, which presupposes that things just exist in the external world. Philosophers should “bracket” the object-world and, in a process he calls epoché, or “reduction,” focus their attention on what is immanent in consciousness itself, without making any assumptions about its origins or supports. Husserl thinks that a pure account of the events presented in consciousness would provide philosophers with a basis of necessary, certain knowledge, so justifying philosophy's claim to be more radical and all-encompassing than other disciplines.",
    ],
  },

  chapter(3, "The Journey"),
  {
    kind: "prose",
    paragraphs: [
      "I've deduced that everything worthwhile requires stepping outside of your comfort zone. Establishing new relationships or ending old ones, starting a new business, or acquiring a new skill are all possibilities. That everything comes to those who work hard and spend time doing difficult tasks. Another problem is that they aren't necessary. You'll be OK if you stay in your comfort zone. All's fine, but that's about it. By becoming someone who likes pain, you can go from 'just OK' to 'well,' all on your own. A person who takes great pleasure in it. When it occurs, you get a steady stream of the reward you're seeking, which keeps you going until the end.",
      "One of the most significant changes in my life was realizing the importance of discomfort and putting in the effort to become someone who enjoys working in that environment. In business, the capacity to remain uncomfortable, often known as 'grit,' is a major component in achieving great success. Journeys are always the hardest bit, when you have finally set out in the unknown with nothing but a small bundle of hope on your back and the ragged scarf of motivation shielding you from the harsh winds. You feel exposed and vulnerable because of the sheer vastness of the task you have undertaken, you dared to be different, you dared to dream.",
      "I would like to think of this manifesto as a sequential experience. Everyone who reads this piece will follow the same predetermined sequence of a beginning, middle, and end. Over the course of the timeline, we see an individual's journey and tale end. This concept has been central to the manifesto's conception and development since its inception. Regardless of the message, all of this is dictated by the medium.",
    ],
  },
  {
    kind: "epigraph",
    text: "It is now perfectly plain to me that all media are environments, all media have the effects that geographers and biologists have associated with environments in the past. … The medium is the message because the environment transforms our perceptions governing the areas of attention and neglect alike.",
    source: "Marshall McLuhan",
  },

  chapter(4, "The Oasis"),
  {
    kind: "prose",
    paragraphs: [
      "During all journeys you are faced with many challenges and stops, the oasis seemingly beautiful but treacherous, what you once thought was beautiful turned out to be non-existent as you got closer to it, the world in this case run by the spectacle, this was when I realized what was truly at stake, what it meant to be an artist, to view the world with a third eye, how overwhelming was this realization that it made you want to go back to being oblivious?",
    ],
  },
  {
    kind: "epigraph",
    text: "The reigning economic system is a vicious circle of isolation. Its technologies are based on isolation, and they contribute to that same isolation. From automobiles to television, the goods that the spectacular system chooses to produce also serve it as weapons for constantly reinforcing the conditions that engender “lonely crowds.”",
    source: "Guy Debord, The Society of the Spectacle",
  },
  {
    kind: "epigraph",
    text: "The conscious and intelligent manipulation of the organized habits and opinions of the masses is an important element in democratic society. Those who manipulate this unseen mechanism of society constitute an invisible government which is the true ruling power of our country. We are governed, our minds are molded, our tastes formed, our ideas suggested, largely by men we have never heard of. This is a logical result of the way in which our democratic society is organized. Vast numbers of human beings must cooperate in this manner if they are to live together as a smoothly functioning society.",
    source: "Edward Bernays, Propaganda",
  },
  {
    kind: "prose",
    paragraphs: [
      "Guy Debord's “Society of the Spectacle” contends that alienation is a result of modern society's economic, political, and cultural conditions. While many people's working conditions improved after WWII, alienation did not. Rather, it expanded from the workplace to the marketplace and is now appearing as a social order in which everyone is compelled to live in accordance with production cycles rather than living for themselves. Images of imperialism and capital bombard us on a daily basis. It is tenacious. Our thoughts have grown into a marketplace as well as a commodity that can be traded. And it's a profitable industry, as evidenced by Facebook and Google. Their data collection and surveillance represent the union of the state and the capitalist economy, and they have carved out devious new places in the human brain to coerce self-censorship and cooperation with the prevailing consumerist global order.",
      "We are constantly bombarded with images of those who have achieved fame and fortune in the modern world. We're taught that if we want to look like them, we have to buy their clothes. This social training is a process that must be widely accepted. Edward Bernays, the well-known business publicist and “father of public relations,” recognized this. Manipulation of the many strata of the human psyche takes time, particularly when working with large populations. However, history is riddled with tragic examples of powerful interests successfully carrying it out. Today, those interests are squarely with capital and empire, but the consequences are the same: distraction, censorship, alienation, coercion, compliance with status quo practices, and numbing of our mental process.",
      "This may persuade us to assume that our social standing is meaningless, because the goal is not to be a worker or anything else—it is to become famous and wealthy. As a result, in order to avoid social alienation, we must all recognize what is genuinely important in life: our own social positions within society.",
      "Unplugging from any of this is not always easy or virtuous, but there are ways to escape from its social effect, both personally and collectively. There are also ways to use it that put its current algorithms to the test. Détournement, which translates as rerouting or hijacking in French, is one of these approaches. This entails reversing capital and empire's imagery or messages in order to illustrate and even exacerbate their deception. It has a lengthy track record of successfully changing the prevalent narrative to reflect reality.",
    ],
  },

  chapter(5, "The Stray Path"),
  {
    kind: "prose",
    paragraphs: [
      "The perfect example of the stray path can be tied back to the many interpretations of the poem by Robert Frost's “The road not taken”. The stray path throws our journey into a bind. There are two roads presented, probably because of the one road splitting, and there is nothing to do except select one of the roads and continue life's journey.",
      "The core theme is that we are frequently confronted with options in life. When choosing a choice, one must make a decision. When we consider an option as a fork in the road, it becomes evident that we must select one or the other, but not both. Frost did not say if the path he picked was the right one in “The Road Not Taken.” Regardless, that is where he is now, and where he ends up, for better or worse, is the product of his decision.",
      "This poem is not about traveling the route less traveled, about originality, or about being one-of-a-kind. To be clear, this poem is about the path taken as well as the road not taken, not always the road less traveled. Anyone who has made a significant decision would agree that it is human nature to wonder, “What if…” had you taken the option you did not make. The fundamental theme of the stray path is considering the alternative life one may have had if they had done something differently.",
      "The speaker chooses the other route at random and proclaims himself glad once there since it has more grass and not many people have gone down it. In any case, he could always go back and attempt the 'original' path again. Is it a possibility? Perhaps not since life has a way of making one thing lead to another until going backwards is no longer an option.",
      "But who knows what the future will bring? The speaker indicates that when he gets older, he will reflect on this pivotal moment in his life, the morning he chose the path less traveled, because adopting that route profoundly transformed his way of being. This was the path I had taken, the route which led me to who I am today, it was indeed the decisive moment for the kid with the immature intellect pursuing his decision to become a visionary. The stray path would have only led you back to where you began, there is still time for me to continue down this path and reflect on it but wanting to embrace creativity wholeheartedly, this fork in the road does not make me wonder “what if”, without a speck of a doubt, I did not want to look back.",
    ],
  },

  chapter(6, "The Weary Traveler"),
  {
    kind: "prose",
    paragraphs: [
      "The events that almost made me give up, the continual battering of the winds of social, parental, and peer pressure were taking their toll, and at one point, everything went from carrying an Olympic torch like a brave athlete to becoming a weary traveler.",
      "Knowledge may be daunting, and at this time in life, many variables can wear you down, including the weight of wanting to prove yourself and the weight of being able to make a difference in this world. It makes you wonder if all the work is actually worth it, the terrifying possibility that the peak would be riddled with more hurdles, rendering the entire journey pointless. You always look back and realize why you started in the first place.",
      "You choose to flee something, its claws may extend far and wide and still have an impact over you, the dark figure looming over you while you held the torch is still watching you from the distance, this time further away but waiting for you to make the same mistake. The error of wanting you to pursue your aspirations. You will get stronger if you persevere. You will be able to resist everything life throws at you. You will develop the type of soft skills that will make others marvel how you do it. The longer you continue, the more determined you are to finish the endeavor. On an intellectual level, we all realize that it is about the trip rather than the goal; nevertheless, the biggest reality is that it is about both. The trip is for fun, but the goal is for learning. After all, isn't this what makes us human beings resilient?",
    ],
  },

  chapter(7, "The Final Ascent"),
  {
    kind: "prose",
    paragraphs: [
      "After almost giving up, when all looked lost, there it was. The finish was in sight, a dazzling shining beacon on the summit of the mountain, was it a haven to finally lay all of this to rest? Or was it someone else opening the way for me, another human who had already walked the route I dreaded, who offered me hope? It was too late to turn back; the decisions that set this entire journey in motion rested on your will not to give up. You set out to be that creative person against all odds, choosing sense of satisfaction over money, passion over expectations. Will you eventually learn to live with the world's terrible ways, or will you submit to its rules? There is too much within you that has to be expressed, and the flame is now brighter than ever.",
      "The flame has been your constant companion; you set out with it and nurtured it with experiences. Rise above all odds. Prove to yourself that you are finally going to be the visionary you set out to be. Be Yourself — your finest advantage in this world is being who you are, true and free of any outside limitations. You may be that person in your head, and it will spread to the rest of the world. It doesn't matter how lengthy or difficult your path to self-discovery is — what counts is that you get there.",
      "Before you start with discipline and discovery, I hope you can start by conquering yourself. Because a positive perspective, rather than a negative one, is more conducive to self-control and willpower. This my dear reader, is the symbolism of the universe, the signifier and the signified, every thought, action, feeling sets forth events in motion far beyond any of us can comprehend, this is the power we hold.",
    ],
  },

  chapter(8, "Enlightenment"),
  {
    kind: "prose",
    paragraphs: [
      "This is the stage to which we all aspire; it was here that I recognized I was the magician; the magician is wise, thoughtful, introspective, healing, contemplative, and transforming. This is relating back to all I've been through in our journey. It was a longer stray path, it conformed to one that you control.",
      "The obstacles were never intended to stop me or you from growing; rather, they were designed to help us learn and grow, conquer, and adapt. A fresh perspective and clarity with the universe on our side, ready to take on obstacles and make a difference in the world with the most powerful non-lethal weapon we have — our artistic and creative minds. Knowing that we are the backbone and framework of the foundations of the world, much like the principles of design, we have now joined the ranks of the shamans who carry the light.",
      "And while I type my personal manifesto, I feel more in control of my surroundings, more conscious of my own existence and ideas; does any of this make me feel powerless? Certainly not. What began as a spark has now erupted into a full-fledged flame that cannot be extinguished; it is only capable of lighting the torch for others around me in the hopes that we can carry on this legacy for everyone around us. This is who I am, and this is what my journey has made me.",
      "I hope that my personal experiences have directed you towards being the person you want to be; if you have resonated with my path, then this is only the beginning.",
    ],
  },

  art("23b.jpg", "Epilogue"),

  {
    kind: "epigraph",
    text: "…that each affects the other and the other affects the next, and the world is full of stories, but the stories are all one.",
    source: "The Five People You Meet in Heaven by Mitch Albom",
  },
  {
    kind: "closing",
    paragraphs: [
      "We are nothing but a speck in this universe but that doesn't mean each speck does not have its own importance to keep the world running like clockwork.",
      "I will inspire others and never forget the power of my voice, I will laugh at myself and help others experience joy, I will act on my passions and honor my commitments. I will continually improve myself and help make the world a better place and be grateful every day that I am alive, breathing and strong enough to carve my own path.",
    ],
    signoff: "May you be the best version of yourself",
  },
];
