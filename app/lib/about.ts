/**
 * About-page content as data: the page (app/about/page.tsx) renders these lists, so updating a role, result
 * or profile stat is an edit here, not in the JSX.
 *
 * Strings may wrap terms in **double asterisks** to emphasise them; the page renders those as <strong>.
 */

export const EXPERIENCE = [
  {
    date: '10/2025 – 12/2025',
    title: 'AI/ML Engineer Intern',
    org: 'Indian Navy — INICAI',
    desc: 'Built a real-time **multi-camera person tracking & re-identification** system that keeps a **consistent ID** on someone across CCTV feeds — the same core problem FoundYou solves, this time for the Navy.',
  },
  {
    date: '02/2023 – 07/2023',
    title: 'AI/ML Project Intern',
    org: 'ISRO — ISTRAC',
    desc: 'Wired **Whisper** and a fine-tuned **RoBERTa** into voice/text command systems for mission control, then built a **Whoosh + spaCy** semantic search engine that got scientists to satellite telemetry data **10 times faster**.',
  },
]

// Open-source work, kept out of EXPERIENCE so it has its own card (with a link straight to the commit history).
export const OPEN_SOURCE = [
  {
    name: 'Simple Icons',
    role: 'Open Source Contributor',
    date: '01/2024 – Present',
    desc: 'Contributed several **brand icons and updates** to a widely used open-source icon library, keeping every change **JSON-schema compliant** through standard GitHub PRs.',
    url: 'https://github.com/simple-icons/simple-icons/commits?author=durgeshgowdac',
  },
]

// Communities from the BTech years and the teaching-assistant role from the MTech — grouped by stage, shown as pills.
export const COMMUNITIES = [
  {
    stage: 'BTech · 2019 – 2023',
    items: ['Google Developer Student Club (GDSC)', 'Microsoft Learn Student Ambassadors (MLSA)', 'Science Club', 'CodeChef Community'],
  },
  {
    stage: 'MTech',
    items: ['Invigilation Teaching Assistant'],
  },
]

// `project` is the headline (shown big); `team` is the team name; `desc` is the short description under it.
// `stat` is the big headline figure on the Ch.02 card and `statNote` its small caption; `result` is the same outcome as one line; `role` is a badge.
export const HACKATHONS = [
  {
    event: 'CIDECODE Cyber Hackathon',
    org: 'Karnataka Police CID × PES University',
    year: '2025',
    team: 'DeepFried',
    project: 'NoFakeAI',
    desc: 'Built an AI-driven deepfake detection system using computer vision (TensorFlow, EfficientNetB4, OpenCV, Grad-CAM). Achieved real-time detection with explainability.',
    role: 'Team Lead',
    result: '6th / 341 teams · Top 40 nationally',
    stat: '6th',
    statNote: 'of 341 teams · top 40 nationally',
  },
  {
    event: 'TexPedition Hackathon',
    org: 'Epsilon × Hack2Skill',
    year: '2025',
    team: 'Code Bandits',
    project: 'AdComply',
    desc: 'Developed an AI-driven advertisement compliance system using OpenCV, NLP and rule-based pipelines. Automated ad screening for real-time violation detection and reporting.',
    role: 'Team Lead',
    result: 'Finalist',
    stat: 'Finalist',
    statNote: null,
  },
  {
    event: 'Smart India Hackathon',
    org: 'Ministry of Education',
    year: '2025',
    team: 'Six Pints of Wisdom',
    project: 'FixMyNagara',
    desc: 'Built a civic issue reporting and resolution system: citizens flag problems in their neighbourhood, and the issues are tracked through to resolution.',
    role: 'Team Lead',
    result: 'Selected',
    stat: 'Selected',
    statNote: null,
  },
  {
    event: 'Tata Elxsi TELIPORT Season 3',
    org: 'Tata Elxsi × Grad Partners',
    year: '2026',
    team: 'Code Bunnies',
    project: 'DoxShip',
    desc: 'Mentored the team behind DoxShip, a prompt-to-package sandbox that turns a plain prompt into a tested, dockerized zip, ready to ship. The team cleared 2 rounds.',
    role: 'Mentor',
    result: 'Mentored team cleared 2 rounds',
    stat: '2 rounds',
    statNote: 'cleared by the team I mentored',
  },
]

// Verified directly from the public profile pages — only figures that were
// actually visible without signing in are listed here. Credly and TryHackMe
// profiles exist but sit behind a login wall, so no specific numbers are
// claimed for them — they're linked as profiles only.
export const CODING_PROFILES = [
  { name: 'LeetCode', stat: 'Rank **102,297** · **650** Java problems solved · **18** badges', url: 'https://leetcode.com/u/durgeshgowdac/' },
  { name: 'Hyperskill (JetBrains Academy)', stat: '**787** topics · **6,701** problems solved · **461-day** streak', url: 'https://hyperskill.org/my-learning/522832266' },
  { name: 'Google Cloud Skills Boost', stat: '**Diamond League** · **84,700** points · **80+** skill badges since 2021', url: 'https://www.skills.google/public_profiles/a29e1763-e992-4503-a3cd-c0428f387d0e' },
  { name: 'Credly', stat: null, url: 'https://www.credly.com/users/durgeshgowdac' },
  { name: 'Stack Overflow', stat: null, url: 'https://stackoverflow.com/users/23294653' },
  { name: 'TryHackMe', stat: null, url: 'https://tryhackme.com/p/durgeshgowdac' },
]

export const SKILLS = [
  { group: 'Languages',          items: ['Python', 'C++', 'Java', 'Bash'] },
  { group: 'AI / ML / DL',       items: ['PyTorch', 'TensorFlow', 'HuggingFace Transformers', 'Scikit-learn', 'OpenCV', 'FAISS', 'YOLO'] },
  { group: 'GenAI & Cloud AI',   items: ['Gemini API', 'Vertex AI', 'Multimodal RAG', 'BigQuery ML'] },
  { group: 'Infrastructure & Backend', items: ['Docker', 'GCP', 'FastAPI', 'PostgreSQL', 'MongoDB', 'MySQL', 'SQLite'] },
  { group: 'Tools',              items: ['Git', 'GitHub', 'Linux', 'Postman'] },
]

// Prof. CNR Rao Scholar merit distinction, unpacked into one line the
// Education block can carry without needing a footnote.
const CNR_RAO_AWARD = 'Merit Certificate + **40% tuition-fee refund**, awarded to the **top 20%** of students by SGPA.'

export const ACHIEVEMENTS = [
  {
    title: 'Prof. CNR Rao Scholar',
    detail: `${CNR_RAO_AWARD} Named for India's own Bharat Ratna chemist — not a bad namesake to share a merit list with.`,
  },
]

// Attended, not presented at — kept distinct from the hackathon list,
// which is all things I actually built and shipped under a countdown timer.
export const CONFERENCES = [
  {
    name: 'International Conference on Spacecraft Mission Operations (SMOPS-2023)',
    year: '2023',
    blurb: 'A close-up look at how real missions plan and run spacecraft operations — attended during my **ISRO ISTRAC** internship, which made the mission-ops talks land less like theory and more like the building next door.',
  },
  {
    name: 'Guidewire DEVSummit 2025',
    year: '2025',
    blurb: 'A developer-focused deep dive into Guidewire’s insurance-platform engineering — a good reminder that "boring" industries like insurance run on genuinely hard distributed-systems problems.',
  },
  {
    name: 'OpenAI DevDay Exchange Bengaluru 2026',
    year: '2026',
    blurb: 'OpenAI’s first DevDay Exchange in India — a front-row look at agentic AI, from **GPT-6.1 Sol** and **Codex** to the **Agents API**. Left convinced software is less "write every line" and more "delegate it well."',
  },
]

// Not an exhaustive list — flagged in the design as editable, so this is
// a solid starting shelf across build-things-that-work, AI/ML, and physics.
export const INSPIRATIONS = [
  { name: 'Aaron Swartz',      field: 'Open Access & Internet Freedom', note: 'Built RSS at 14, then spent his life arguing that knowledge shouldn’t need a paywall. A reminder that code can be an act of principle, not just a job.' },
  { name: 'Kevin Mitnick',     field: 'Security & Curiosity',            note: 'Proof that the most interesting vulnerabilities are rarely in the code — they’re in the assumptions everyone else stopped questioning.' },
  { name: 'Steve Jobs',        field: 'Product & Taste',                 note: 'Obsessive about the gap between "it works" and "it feels right" — the same gap I chase between a notebook model and something people can actually rely on.' },
  { name: 'Alan Turing',       field: 'Computer Science',                note: 'Asked whether machines could think before "machine learning" was a phrase anyone used — the original ask-the-obvious-uncomfortable-question move.' },
  { name: 'Geoffrey Hinton',   field: 'AI / Deep Learning',              note: 'Kept betting on neural networks through decades where that bet looked unfashionable. Conviction, backed by math, eventually wins.' },
  { name: 'Isaac Newton',      field: 'Physics',                         note: 'An apple, a law, and centuries of engineers still building on top of it — also the entire reason the Newton-Gravity project exists.' },
  { name: 'Nikola Tesla',      field: 'Engineering & Invention',         note: 'Thought in systems decades ahead of the hardware needed to build them. Vision without the ability to execute is still worth something.' },
  { name: 'Marie Curie',       field: 'Science & Perseverance',          note: 'Did field-defining work with a fraction of the resources and none of the institutional goodwill her male peers had. Rigor as the great equalizer.' },
]

// Kept separate from "Skills" on purpose — discipline off the keyboard is
// still discipline, and it’s where a lot of the patience for debugging
// comes from.
export const SPORTS = [
  { title: 'Taekwondo',  detail: 'Trained as a Taekwondo player — the kind of discipline where "practice the fundamentals until they’re boring" turns out to be the actual secret, same as with code.' },
  { title: 'Cricket',    detail: 'A lifelong cricket fan and player, for the same reason debugging is oddly satisfying: most of the game is patient observation, then one sharp decisive moment.' },
  { title: 'Volleyball', detail: 'Plays volleyball for the forced teamwork — no single player wins a rally alone, which is a healthy thing to remember after too many solo side projects.' },
]