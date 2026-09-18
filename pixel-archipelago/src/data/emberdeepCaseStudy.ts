import type { GameCaseStudy, PlayableGame } from "./types";

// EMBERDEEP — the case study and the playable build.
// Copy is verbatim from the game repo's web/portfolio/CASE_STUDY.md, which
// follows web/portfolio/PORTFOLIO_EDITORIAL_REVISION.md: the work is presented
// as directed, not as produced; no dates, durations or productivity statistics
// appear. Every claim traces to that repo's notes/EVIDENCE.md, and the alt text
// comes from its reviewed page.

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
  sections: [
    {
      number: "01",
      title: "Finding the right focus",
      blocks: [
        {
          kind: "prose",
          paragraphs: [
            "EMBERDEEP began as a broader RPG concept. As I explored the world, the inn became the part I most wanted to develop: a place where the character could pause, prepare and feel at home.",
            "I chose to focus the showcase on the hero's room. That gave me a clear design goal: make one small space convincing through its composition, atmosphere and interactions. The bed, desk, chest and telescope became opportunities to express who lives here, rather than simply fill the floor.",
            "This was also a decision about quality. I wanted the final piece to communicate a coherent experience that visitors could explore for themselves.",
          ],
        },
        {
          kind: "timeline",
          items: [
            {
              src: `${IMG}/evolution-1-inn.webp`,
              alt: "An early top-down pixel inn with several rooms and characters.",
              caption: "Early world exploration — establishing the fantasy setting.",
            },
            {
              src: `${IMG}/evolution-2-painted.webp`,
              alt: "A single painted bedroom with a hooded character.",
              caption: "Painted-room study — testing composition and mood.",
            },
            {
              src: `${IMG}/evolution-3-box.webp`,
              alt: "An empty dark 3D box with a tiny figure inside.",
              caption: "Spatial prototype — introducing depth and movement.",
            },
            {
              src: `${IMG}/evolution-4-furnished.webp`,
              alt: "The 3D room furnished, with a painted white-robed heroine.",
              caption:
                "Furnishing pass — refining scale, placement and circulation, with the earlier painted heroine still in the room.",
            },
            {
              src: `${IMG}/evolution-5-pixel.webp`,
              alt: "The room with the new pixel-art heroine and 3D furniture.",
              caption:
                "Character integration — the pixel design in her place, bringing the visual styles together.",
            },
            {
              src: `${IMG}/evolution-6-final.webp`,
              alt: "The finished room at night.",
              caption: "Interactive showcase — connecting atmosphere with action.",
            },
          ],
        },
      ],
    },
    {
      number: "02",
      title: "Designing a room that feels inhabited",
      blocks: [
        {
          kind: "prose",
          paragraphs: [
            "I wanted this to feel like a priestess's private retreat. Warm wood, teal textiles, books and plants establish comfort; celestial details and restrained magical light suggest the world beyond the window.",
            "I refined the furniture placement and decorative layers around recognizable activities: rest at the bed, study at the desk, prepare at the chest and observe through the telescope. These groupings give the room purpose while leaving space for the character to move.",
            "The references helped me judge more than style. I used them to question proportion, empty space and relationships between objects. When furniture felt scattered or shelves looked too flat, I pushed for another pass. The aim was a room that felt furnished with intention.",
          ],
        },
        {
          kind: "figures",
          columns: 1,
          items: [
            {
              src: `${IMG}/final-night.webp`,
              alt: "The finished room at night: bed, writing desk, travel chest and telescope.",
              caption:
                "Four activities give the room its shape: rest at the bed, which turns night into morning; study at the desk, where the runes, the quill and the orb answer her; prepare at the travel chest, which opens into her pack; and observe through the telescope, which raises a constellation and a line of memory.",
            },
          ],
        },
      ],
    },
    {
      number: "03",
      title: "Making two dimensions belong in three",
      blocks: [
        {
          kind: "prose",
          paragraphs: [
            "The central challenge was preserving the charm of illustrated assets while making the room behave as a navigable space. A convincing still image did not automatically produce convincing movement: characters could overlap furniture, change apparent scale or jump into an interaction.",
            "I directed a hybrid approach, using 3D structure where spatial depth mattered and 2D artwork where it better supported the character and the intended style. I also asked for connected decorative arrangements, such as the furnished shelves, to be treated as complete assets where separate parts would add unnecessary complexity.",
            "When the bed, chest and chair did not match their animated interactions, I asked for the visual and the animation to be designed together. Matching the room's camera, scale and position became more important than keeping every object in the same medium.",
          ],
        },
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
                "The same bed, translated from a 3D render into painted artwork. The decision was about visual consistency while retaining the spatial information needed for character overlap.",
            },
            {
              before: {
                src: `${IMG}/before-3d-furniture.webp`,
                alt: "The room with 3D furniture and an empty window.",
              },
              after: {
                src: `${IMG}/final-night.webp`,
                alt: "The room with painted furniture and a night sky in the window.",
              },
              beforeLabel: "Before",
              afterLabel: "After",
              label: "Compare the room before and after the furniture and window changes",
              caption:
                "The same camera before and after the change: painted bed, chest and chair, and a window with a sky behind it.",
            },
          ],
        },
        {
          kind: "prose",
          paragraphs: [
            "**Redrawing the character to belong to the room.** The heroine went through the same question. Her first version was a painted, near-realistic figure, and at the size the camera actually shows her she read as an illustration placed on top of the room rather than someone standing in it: her detail competed with the furniture, and her silhouette lost definition against it.",
            "I redrew her as a single pixel-art design sheet with chibi proportions. Fewer, larger pixels give her a silhouette that stays readable at this camera distance, the drawing style now belongs to the same family as the painted furniture, and the expression that carries the room's warmth survives at her actual on-screen size. Keeping her as drawn frames rather than a rig was part of the same decision: every frame stays whole and intentionally composed.",
            "Deliberately, she is not scaled realistically against the room. The furniture keeps real-world proportions so it stays recognizable, and she is smaller than a real figure would be — a readability choice, not an accident. Everything derived from her size was then recalibrated to her: walking speed and stride length, the space she occupies on the floor, the reach of her torchlight and the contact shadow that keeps her feet on the boards.",
          ],
        },
        {
          kind: "figures",
          columns: 2,
          items: [
            {
              src: `${IMG}/pipeline-design.webp`,
              alt: "The pixel-art design sheet of Ilva from several angles.",
              caption:
                "Chosen direction — the design sheet the whole character is built from. One drawing decides her silhouette, palette and proportions in every direction.",
              pixel: true,
            },
            {
              src: `${IMG}/pipeline-in-room.webp`,
              alt: "Ilva standing in the room next to the chest, holding a torch.",
              caption:
                "In context — how she reads at the room's scale, lit by the room and casting her own light onto what she stands next to.",
            },
          ],
        },
      ],
    },
    {
      number: "04",
      title: "Turning visible problems into design decisions",
      blocks: [
        {
          kind: "prose",
          paragraphs: [
            "I reviewed the experience through the moments where it stopped feeling believable. Each issue became a specific question for research, implementation and another visual check.",
            "**Can the character move behind furniture convincingly?** Incorrect overlap made Ilva appear to stand on objects instead of beside them. The implementation addressed sprite orientation and depth, with an occlusion silhouette to keep her location readable when furniture hides her. The design requirement was simple: preserve the room's depth without losing the player.",
            "**Does an interaction begin where movement ends?** Sitting and resting needed to connect to the actual furniture. Matching the approach position, the sprite anchor and the animation placement helped the action read as one continuous movement rather than a jump between two states.",
            "**Does animation support the atmosphere?** The sleep sequence exposed a different problem: generated frames changed parts of the bedding that should remain still. Restricting movement to the intended animated details made the scene calmer. More motion was not always the better result.",
            "**Does the character share the room's mood?** Lighting, material appearance and character scale needed to work together. I asked for a softer magical ambience and reviewed effects against the room's cozy character, including rejecting a dramatic light beam that felt too theatrical.",
          ],
        },
        {
          // Both of these are wide strips — a before/after pair and a row of
          // five close-ups — so each takes the full width rather than being
          // squeezed into a column beside the other.
          kind: "figures",
          columns: 1,
          items: [
            {
              src: `${IMG}/fix-blanket-motion.webp`,
              alt: "Two views of Ilva asleep; on the left most of the bed is marked red as moving, on the right only her face and the torch flame.",
              caption:
                "The sleep loop, before and after. Red marks everything that changes between frames; restricting it to her face and the flame made the scene rest.",
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
              caption: "The occlusion silhouette, in five places the room would otherwise hide her.",
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
              fix: "separate the coplanar surfaces so one is always in front.",
            },
            {
              title: "Her own torch bleached her",
              why: "the light sat too close to a white robe.",
              fix: "move it back. Glowing, not glaring.",
            },
            {
              title: "Half a character on the web",
              why: "the browser renderer counts depth differently, so only her ghost showed up.",
              fix: "a depth remap for that renderer.",
            },
            {
              title: "She changed height when she turned",
              why: "her size was measured from the whole drawing, and a raised torch made some directions taller.",
              fix: "measure her by the head instead, so every facing agrees.",
            },
          ],
        },
      ],
    },
    {
      number: "05",
      title: "Directing an AI-assisted process",
      blocks: [
        {
          kind: "prose",
          paragraphs: [
            "I used AI tools as part of a directed creative process. My contribution was defining the experience, selecting references, shaping the layout, reviewing generated assets and deciding what needed to change. Claude and Codex supported research and implementation; SpriteCook and Meshy supported asset generation.",
            "Outputs were starting points for review. I questioned inconsistent proportions, mismatched animation and objects that did not fit the composition. Research into isometric scenes and 2D characters in 3D environments helped turn those observations into practical implementation tasks.",
          ],
        },
        {
          kind: "pipeline",
          steps: [
            ["Design", "One drawing decides her silhouette, palette and proportions."],
            ["Animate", "SpriteCook draws her walk, idle and run frames from that sheet."],
            [
              "Register",
              "A builder lines every frame up on her feet and measures her height, so she never slides or changes size.",
            ],
            ["Light", "Generated normal maps let the room's candles and moonlight shade a flat drawing."],
            ["Assemble", "Godot holds the room: 3D where depth matters, painted pieces where the style does."],
            ["Ship", "One export, played in the page — and a character who can step out of it."],
          ],
        },
        {
          kind: "prose",
          paragraphs: [
            "Every stage is reviewed by eye and by a check written for the problem it once had; nothing reaches the room simply because a tool produced it.",
            "**The playbook behind the fixes.** Each visible problem sent me to research before it sent me to an implementation: how other games sort a 2D character inside a 3D room, fade what stands in front of them, light a flat drawing, and time a walk so the feet hold the floor. The answers were collected into one playbook — problem, cause, fix, and the check that proves it — and the work was made against that rather than by trial and error. It is also why the same mistake did not come back twice.",
            "Some approaches were explored and set aside, including character rigging and separated sprite parts. Those experiments helped clarify what the project needed: a workflow that served the final view and its interactions reliably, with manageable complexity.",
          ],
        },
        {
          kind: "figures",
          columns: 2,
          items: [
            {
              src: `${IMG}/fail-mesh.webp`,
              alt: "A 3D model of Ilva from four angles.",
              caption:
                "A 3D version of Ilva, prepared for skeletal animation. The rig could not separate the torch from her hand or the robe from her legs, so the direction changed to drawn frames.",
            },
            {
              src: `${IMG}/fail-paper-doll.webp`,
              alt: "Ilva split into parts; one version is missing her head and clothes.",
              caption:
                "The same character separated into parts. The parts disagreed about where her body was, which is why the final workflow keeps every frame whole.",
            },
          ],
        },
      ],
    },
    {
      number: "06",
      title: "Letting the work speak through interaction",
      blocks: [
        {
          kind: "aside",
          paragraphs: [
            "The result is a focused room showcase: a space to walk through, inspect and inhabit. Visitors can discover its details through the character's everyday actions and see how the atmosphere changes between day and night.",
            "This page also extends the experience beyond the game window: Ilva can step onto the page and return to her room. It connects the project to my explorable portfolio and makes the presentation part of the experience. Some things on this page react when she walks over them — press [[E]] to use them.",
            "Building EMBERDEEP changed how I look at interactive environments. A shelf, a chair and a walking animation can each look right on their own; the design work is making them feel as though they belong together.",
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
