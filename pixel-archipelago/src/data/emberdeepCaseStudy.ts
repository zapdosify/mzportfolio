import type { GameCaseStudy, PlayableGame } from "./types";

// EMBERDEEP — the case study and the playable build.
// Copy is verbatim from the game repo's web/portfolio/CASE_STUDY.md, approved
// by the owner on 2026-09-17. Alt text comes from that repo's review page.

const IMG = "/media/images/emberdeep";
const GAME = "/games/emberdeep/v1";

export const emberdeepPlay: PlayableGame = {
  src: `${GAME}/index.html`,
  sprites: `${GAME}/character`,
  title: "EMBERDEEP, playable",
  poster: `${IMG}/poster.webp`,
  posterAlt:
    "Ilva's bedroom at night: a desk under the window, a four-poster bed, a travel chest and a runner rug on the landing.",
  size: "About 130 MB",
  controls: [
    [["WASD", "↑↓←→"], "walk"],
    [["Shift"], "run"],
    [["E"], "use"],
    [["Space"], "jump"],
    [["T"], "day/night"],
  ],
  tip: "Tip: go through the door ([[→]]+[[↓]]) and off the landing's open edge.",
};

export const emberdeepCaseStudy: GameCaseStudy = {
  quote: {
    text: "I'll never complain about another video game ever again, because after trying to get just this one room to work, I have nothing but respect for game developers.",
    source: "— me, around day three",
  },
  sections: [
    {
      number: "01",
      title: "The plan, and the other plan",
      blocks: [
        {
          kind: "prose",
          paragraphs: [
            "The first version was a whole inn: five rooms, a forge, a kitchen, and people in them. It looked great in screenshots. Then I tried to make one character sit on one chair, and it quietly became a game about **one room**.",
            "So the scope went from “an inn” to “a bedroom”, and the bedroom went from a flat painting to a real 3D room with a 2D heroine standing inside it. Each step below took most of a day.",
          ],
        },
        {
          kind: "timeline",
          items: [
            {
              src: `${IMG}/evolution-1-inn.webp`,
              alt: "An early top-down pixel inn with several rooms and characters.",
              caption: "14 Sep · A whole inn. Ambitious.",
            },
            {
              src: `${IMG}/evolution-2-painted.webp`,
              alt: "A single painted bedroom with a hooded character.",
              caption: "15 Sep · One painted room. Flat as a postcard.",
            },
            {
              src: `${IMG}/evolution-3-box.webp`,
              alt: "An empty dark 3D box with a tiny figure inside.",
              caption: "15 Sep, evening · The first 3D room. A box.",
            },
            {
              src: `${IMG}/evolution-4-furnished.webp`,
              alt: "The 3D room furnished, with a painted white-robed heroine.",
              caption: "15 Sep, half an hour later · Furniture, and Ilva.",
            },
            {
              src: `${IMG}/evolution-5-pixel.webp`,
              alt: "The room with the new pixel-art heroine and 3D furniture.",
              caption: "16 Sep · New pixel Ilva, lighting redone.",
            },
            {
              src: `${IMG}/evolution-6-final.webp`,
              alt: "The finished room at night.",
              caption: "16 Sep, late · The one you can play.",
            },
          ],
        },
      ],
    },
    {
      number: "02",
      title: "From SpriteCook to Godot",
      blocks: [
        {
          kind: "prose",
          paragraphs: [
            "Ilva is a flipbook: every step is a drawn frame. SpriteCook drew the frames. The hard part was making a flat drawing behave like she's standing *in* a 3D room instead of stuck to the screen.",
          ],
        },
        {
          kind: "pipeline",
          steps: [
            ["Design", "One pixel-art design sheet, the reference for everything."],
            ["Animate", "SpriteCook turns it into walk and idle strips for 8 directions, and runs for 4."],
            ["Register", "A script lines every frame up on her feet and packs even sheets, so she doesn't slide around inside her own animation."],
            ["Light", "Generated normal maps let the room's candles and moon shade her."],
            ["Stand her up", "In Godot she's an upright sprite whose depth is taken from her feet, so furniture in front of her covers her and furniture behind her doesn't."],
            ["Walk", "Frames advance by distance walked, not by time. No moonwalking."],
          ],
        },
        {
          kind: "figures",
          columns: 2,
          items: [
            {
              src: `${IMG}/pipeline-design.webp`,
              alt: "The pixel-art design sheet of Ilva from several angles.",
              caption: "The design sheet.",
              pixel: true,
            },
            {
              src: `${IMG}/pipeline-in-room.webp`,
              alt: "Ilva standing in the room next to the chest, holding a torch.",
              caption: "…and her, standing in the room with her torch lighting the chest.",
            },
          ],
        },
        {
          kind: "figures",
          columns: 1,
          items: [
            {
              src: `${IMG}/pipeline-raw-walk.webp`,
              alt: "Eight raw walking frames from SpriteCook.",
              caption: "SpriteCook's walk, straight out of the oven. Eight frames, facing south-east.",
              pixel: true,
            },
          ],
        },
      ],
    },
    {
      number: "03",
      title: "Things that went wrong (a selection)",
      blocks: [
        {
          kind: "compare",
          items: [
            {
              before: { src: `${IMG}/bed-render.webp`, alt: "The bed as a 3D model render.", pixel: true },
              after: { src: `${IMG}/bed-painting.webp`, alt: "The same bed as a pixel-art painting.", pixel: true },
              beforeLabel: "3D model",
              afterLabel: "Painting",
              label: "Compare the 3D bed and the painted bed",
              caption:
                "The 3D bed looked plasticky next to a pixel heroine. I rendered it from the game's camera, had Codex repaint it as pixel art, and gave the painting the model's depth so she can still walk behind it.",
            },
            {
              before: { src: `${IMG}/before-3d-furniture.webp`, alt: "The room with 3D furniture and an empty window." },
              after: { src: `${IMG}/final-night.webp`, alt: "The room with painted furniture and a night sky in the window." },
              beforeLabel: "Before",
              afterLabel: "After",
              label: "Compare the room before and after the furniture and window changes",
              caption:
                "Same camera, a few hours apart: painted bed, chest and chair, and a window that finally has a sky behind it.",
            },
          ],
        },
        {
          kind: "figures",
          columns: 1,
          items: [
            {
              src: `${IMG}/fix-blanket-motion.webp`,
              alt: "Two views of Ilva asleep; on the left most of the bed is marked red as moving, on the right only her face and the torch flame.",
              caption:
                "“Why is the blanket shaking?” SpriteCook redrew the quilt a little differently in every frame of the sleep loop. Red is everything that changed. Now only her face and the flame move.",
            },
          ],
        },
        {
          kind: "problems",
          items: [
            {
              title: "She sank into the bed",
              why: "a flat sprite tilted back with the camera, so her head went through the mattress.",
              fix: "stand the sprite upright and correct its height for the camera angle.",
            },
            {
              title: "The furniture cut off her legs",
              why: "the whole sprite was sorted as if it were one point.",
              fix: "a shader that takes her depth from her feet.",
            },
            {
              title: "She vanished behind things",
              fix: "a see-through silhouette whenever the room hides her. Walls stay solid.",
            },
            {
              title: "She teleported onto chairs",
              why: "the walk ended in one place and the sitting animation started in another.",
              fix: "she now walks to the exact spot the animation begins.",
            },
            {
              title: "The painting flickered",
              why: "two pictures sat in exactly the same plane and took turns winning.",
              fix: "four millimetres apart.",
            },
            {
              title: "Her own torch bleached her",
              why: "the light sat 12 cm from a white robe.",
              fix: "35 cm. Glowing, not glaring.",
            },
            {
              title: "Half a character on the web",
              why: "the browser renderer counts depth differently, so only her ghost showed up.",
              fix: "a depth remap for that renderer.",
            },
          ],
        },
        {
          kind: "figures",
          columns: 1,
          items: [
            {
              src: `${IMG}/fix-ghost.webp`,
              alt: "Five close-ups of Ilva's translucent silhouette showing through furniture.",
              caption: "The see-through silhouette, in five places she likes to hide.",
            },
          ],
        },
      ],
    },
    {
      number: "04",
      title: "Things I tried and threw away",
      blocks: [
        {
          kind: "figures",
          columns: 2,
          items: [
            {
              src: `${IMG}/fail-mesh.webp`,
              alt: "A 3D model of Ilva from four angles.",
              caption:
                "A 3D Ilva to animate with a skeleton. The auto-rigger said no: the torch was fused to her hand and the long robe merged her legs.",
            },
            {
              src: `${IMG}/fail-paper-doll.webp`,
              alt: "Ilva split into parts; one version is missing her head and clothes.",
              caption: "Cutting her into paper-doll parts. The parts did not agree on where her body was.",
            },
            {
              src: `${IMG}/fail-invented-chest.webp`,
              alt: "Eight frames of Ilva kneeling as a barrel-like chest slides in.",
              caption:
                "Asked to open a chest, SpriteCook invented its own chest and slid it into frame. The room already had one.",
              pixel: true,
            },
            {
              src: `${IMG}/fail-light-shaft.webp`,
              alt: "The room with a strong beam of light through the window on a blue background.",
              caption: "A dramatic light shaft. It made the room look like a stage set, so it went.",
            },
          ],
        },
        {
          kind: "prose",
          paragraphs: [
            "Also retired: a bendy mesh rig (it looked wrong, and I said so), and Spine, which I didn't buy after reading the licence.",
          ],
        },
      ],
    },
    {
      number: "05",
      title: "Homework",
      blocks: [
        {
          kind: "prose",
          paragraphs: [
            "Before each fix came some reading: how other games sort 2D characters in 3D worlds, fade walls out of the way, light sprites, and time walk cycles. It all went into one playbook, with a \"problem → name → fix\" table that the fixes above came from.",
          ],
        },
        {
          kind: "stats",
          items: [
            ["6", "research passes"],
            ["1,462", "lines of notes"],
            ["59", "commits for one room"],
            ["8", "directions she can face"],
            ["29% → 5%", "of the sleep loop that moves"],
          ],
        },
      ],
    },
    {
      number: "06",
      title: "Taking her for a walk",
      blocks: [
        {
          kind: "aside",
          paragraphs: [
            "This page runs the real game. When Ilva walks off the landing's open edge, the game hands her to the page: the same frame, the same spot, still walking in the same direction. Arrow keys keep working, the page scrolls to follow her, and walking back onto that edge puts her back in the room.",
            "Some things on this page react when she walks over them. Press [[E]] to use them.",
          ],
          figure: {
            src: `${IMG}/final-day.webp`,
            alt: "The finished room in daylight.",
            caption: "Press T in the game for the daytime version.",
          },
        },
      ],
    },
  ],
};
