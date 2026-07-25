// Site-level content: identity, About, Contact. Migrated from the previous portfolio.

export const identity = {
  name: "Mohammed Zaabi Noor",
  role: "Design Portfolio",
  tagline: "Multidisciplinary designer — visual storytelling across platforms.",
  intro:
    "Adept at blending artistic vision with technical prowess, I am a designer who crafts immersive and captivating experiences across various multimedia platforms. With a keen eye for detail and an unwavering commitment to innovation, I have honed my design expertise through a diverse range of projects — from interactive web experiences, graphic design, and user experience design to captivating motion graphics.",
};

export const socials = {
  email: "mznoor@asu.edu",
  linkedin: "https://www.linkedin.com/in/mzaabi/",
  deviantart: "https://www.deviantart.com/zapdosify",
};

export const about = {
  headline: "A few words about me",
  bio: "I'm Mohammed Zaabi, a multidisciplinary designer who believes in the power of visual storytelling. I specialize in creating meaningful and enjoyable user experiences.",
  services: [
    "Animation",
    "Illustration",
    "3D Lettering",
    "Typography",
    "Video Production",
    "Creative Direction",
    "UX Design",
    "Editorial and Advertising",
    "Photography",
  ],
  tools: [
    "After Effects",
    "Premiere Pro",
    "Illustrator",
    "Lightroom",
    "Blender",
    "Figma",
    "Unreal Engine",
    "Aero",
    "TouchDesigner",
    "InDesign",
    "Google SketchUp",
  ],
  location: "Phoenix, Arizona",
  publicity: [
    {
      year: "2019",
      title: "British Solutions Award — Gold Winner",
      detail: "Earth Island. Hosted at Café De Paris, London.",
      href: "https://www.dmu.ac.uk/about-dmu/news/2020/february/flying-start-at-dmu-earns-student-national-award.aspx",
    },
  ],
  // Career history (migrated from résumé, 2026).
  experience: [
    {
      role: "Presentation Designer",
      org: "RR Donnelley / White & Case Law Firm",
      location: "Phoenix, AZ",
      period: "Sep 2023 — Present",
      current: true,
      points: [
        "Design and refine 100+ pitch books and client presentations for leading law firms — precise, consistent, brand-aligned materials delivered under tight deadlines.",
        "Improved project-completion efficiency by 20% through workload prioritization, assignment coordination, and disciplined tracking, while maintaining strict confidentiality.",
        "Strengthened quality-control and team-training practices, contributing to a 15% rise in client satisfaction and a 10% reduction in turnaround time.",
      ],
    },
    {
      role: "Graphic Designer",
      org: "Herberger Institute for Design and the Arts",
      location: "Phoenix, AZ",
      period: "Jul 2023 — Sep 2023",
      points: [
        "Led a rebranding initiative across video, animation, and web assets using Adobe Creative Suite, increasing user interaction by 35%.",
        "Directed cross-functional print, digital, and motion-design projects, expanding content reach by 40% while maintaining brand consistency.",
      ],
    },
    {
      role: "Instructional Designer",
      org: "Ed Plus at Arizona State University",
      location: "Tempe, AZ",
      period: "Aug 2021 — May 2023",
      points: [
        "Maintained and updated technology-integrated learning assets using research-based instructional practices and departmental standards.",
        "Built web-based courses from standardized templates, partnering with faculty to create consistent learning experiences that supported student success.",
      ],
    },
    {
      role: "Instructional Design Specialist",
      org: "T-Mobile Headquarters",
      location: "Bellevue, WA",
      period: "May 2022 — Aug 2022",
      points: [
        "Developed e-learning content, instructor materials, job aids, and reinforcement resources using instructional-design principles.",
        "Led a team of 15 instructional designers in gamifying B2B seller training, increasing use of web-based learning tools by 75%.",
      ],
    },
  ],
  education: [
    {
      school: "Trine University",
      degree: "M.S. Business Analytics",
      period: "Jun 2026",
      note: "GPA 3.7 / 4.0",
    },
    {
      school: "Arizona State University",
      degree: "Master of Visual Communication and Design",
      period: "May 2023",
      note: "GPA 3.6 / 4.0",
    },
    {
      school: "De Montfort University, Leicester",
      degree: "BA (Hons) Visual Communication (Communication Arts)",
      period: "Jun 2021",
      note: "GPA 3.4 / 4.0 · British National Sustainability Award",
    },
  ],
  skills: [
    { group: "Design & Presentation", items: "PowerPoint · Photoshop · Illustrator · InDesign · Premiere Pro · After Effects · Figma" },
    { group: "3D & Interactive", items: "Blender 3D · SketchUp · Unreal Engine · TouchDesigner · Adobe Aero" },
    { group: "Learning & Content", items: "Adobe Captivate · Articulate Rise · Camtasia · Vyond" },
    { group: "Business & Analytics", items: "Word · Excel · Data visualization" },
  ],
  portraitImage: "/images/about/New_Headshot.jpg" as string | undefined,
  resumeFile: "/Mohammed-Zaabi-Noor-Resume-2026.docx" as string | undefined,
};

export const contact = {
  heading: "Get in touch — let's collaborate",
  address: ["Phoenix, Arizona"],
  formFields: ["First Name", "Last Name", "Email", "Subject", "Message"],
};

export const footerFlourish = "CRAFTED WITH INTENTION · BUILT IN PIXELS";
