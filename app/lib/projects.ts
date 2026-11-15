export type Section =
    | { type: 'brief';        content: string }
    | { type: 'contribution'; items: string[] }
    | { type: 'architecture'; items: { title: string; desc: string }[] }
    | { type: 'features';     items: { title: string; desc: string }[] }
    | { type: 'challenges';   items: { title: string; desc: string }[] }
    | { type: 'takeaways';    content: string }
    | { type: 'retro';        items: string[] }   // built from Project.retro, never listed in `sections`

export interface Project {
  slug:     string
  tag:      string
  title:    string
  desc:     string
  tags:     string[]
  role:     string
  tech:     string[]
  github?:  string
  liveUrl?: string
  /** A direct download link (e.g. a packaged game build), separate from
   *  liveUrl (a hosted/playable page) and github (source). */
  downloadUrl?: string
  /** A direct download link for a write-up/paper (e.g. a research PDF),
   *  distinct from downloadUrl (a runnable build) and github (source). */
  paperUrl?: string
  sections: Section[]
  /** One headline detail, surfaced on the project card so it isn't buried
   *  behind a click. Kept to verifiable facts — no invented benchmarks. */
  stat?: string
  /** A filename-style label shown in the project card's device-frame title
   *  bar — a small bit of personality (e.g. "foundyou.py"). */
  filename?: string
  /** A YouTube demo shown on the project page. Paste any YouTube link (watch?v=…, youtu.be/…, with or
   *  without ?t=). Leave it out or '' and the demo block simply doesn't render. */
  youtube?: string
  /** One short line for the "Next project" card and similar previews. */
  tagline?: string
  /** "At a glance": 3–4 tiles shown near the top of the project page. Only verifiable facts —
   *  swap in real accuracy / latency / FPS / user numbers here whenever you have them. */
  results?: { value: string; label: string }[]
  /** "What I'd do differently": a few honest, first-person lines. The section only appears when this is filled in. */
  retro?: string[]
}

export const PROJECTS: Project[] = [
  {
    slug: 'glyphscholar',
    youtube: 'https://www.youtube.com/watch?v=RB-LChJjC3U',
    tag: 'PYTHON | MULTIMODAL RAG',
    title: 'GlyphScholar',
    desc: 'A **multimodal RAG** system that reads a PDF properly — text, tables, formulas, and page images together — and is built to answer with a **citation back to the exact page**, not a hallucination in a nice font. Live and taking questions right now.',
    tags: ['python', 'ai/ml', 'genai', 'web'],
    role: 'Full-Stack AI Engineer',
    tech: ['Python', 'FastAPI', 'Chainlit', 'Next.js', 'PostgreSQL', 'pgvector', 'Supabase', 'Neon', 'Modal', 'Ollama', 'MinerU', 'Opik', 'Render', 'Vercel'],
    github: 'https://github.com/durgeshgowdac/GlyphScholar',
    liveUrl: 'https://glyphscholar.vercel.app/',
    stat: 'Every model, GPU, and database in the stack runs on a free tier',
    filename: 'retrieve.py',
    tagline: 'Multimodal RAG that cites the exact page',
    results: [
      { value: '3', label: 'retrieval paths per question: dense, BM25 and image' },
      { value: 'Page-level', label: 'citations: answers are built to name the exact page they came from' },
      { value: '$0', label: 'in paid services: every part of the stack runs on a free tier' },
      { value: 'Live', label: 'taking questions at glyphscholar.vercel.app' },
    ],
    sections: [
      {
        type: 'brief',
        content: `A PDF is where good information goes into hiding. **Ctrl+F finds a word, never an idea**; a copied table arrives as one long unreadable string; and the one diagram that actually explains the finding is invisible to almost every RAG pipeline ever built, because most of them were designed to **read words, not pages**.\n\nGlyphScholar exists to make that someone else's problem — specifically, a machine's. It parses a document the way an attentive reader would: layout, OCR, tables, formulas, and page imagery, all at once. Everything gets indexed, and a plain question comes back with an answer **traceable to the exact page it came from**, rather than a confident-sounding guess.\n\nA [Chainlit](https://chainlit.io) interface handles the conversation, mounted inside a [FastAPI](https://fastapi.tiangolo.com) backend, with a [Next.js](https://nextjs.org) portal quietly taking care of the parts every app needs and nobody particularly enjoys building twice — auth, the landing page, that sort of thing. It's live at [glyphscholar.vercel.app](https://glyphscholar.vercel.app/), and at any given moment is probably fielding more questions than its author has actually asked it.`,
      },
      {
        type: 'contribution',
        items: [
          'Built the **ingestion pipeline end to end**: PDFs go through [MinerU](https://github.com/opendatalab/MinerU) for layout-aware parsing — the difference between recognizing a real table and three paragraphs pretending to be one — splitting into text chunks and visual crops (figures, tables, equations).',
          'Added a **caption-fallback step** for crops MinerU leaves uncaptioned, generating one via Qwen3-VL rather than shipping a mute image into the index.',
          'Designed the retrieval layer to fire **three paths per question** — dense vector search, BM25 sparse, and pixel/image retrieval — on the premise that no single retrieval method is right 100% of the time, then reranks the merged candidates before anything reaches the model.',
          'Wired a **raster fallback** into the query path: when reranked page coverage still looks ambiguous, the pipeline renders the full page rather than answering from a guess about which chunk mattered.',
          'Made the **inference backend swappable** on purpose — [Ollama](https://ollama.com) for local development, [Modal](https://modal.com)’s serverless GPUs for actually serving people — so testing a one-line prompt fix doesn’t require waiting on a cold GPU start.',
          'Instrumented the whole request path with [Opik](https://github.com/comet-ml/opik) tracing, so a wrong answer is something you can actually go inspect, not a shrug.',
          'Shipped the entire thing — portal, backend, retrieval, inference — **without a single paid line item**. Every service in the stack has a free tier generous enough to actually launch on, which turned out to be less of a budget constraint and more of a personal challenge.',
        ],
      },
      {
        type: 'architecture',
        items: [
          { title: 'Portal',      desc: 'The Next.js frontend — auth, landing page, the part with buttons.' },
          { title: 'Backend',     desc: 'A FastAPI app mounting the Chainlit app, handling auth, uploads, and ingestion.' },
          { title: 'Chainlit app', desc: 'The chat itself, with session history kept in the app’s own Postgres (Neon in production) while Supabase minds the logins.' },
          { title: 'Ingestion',   desc: 'MinerU parsing → text chunks + visual crops → embeddings (Ollama locally, Modal in production) → Postgres/[pgvector](https://github.com/pgvector/pgvector).' },
          { title: 'Retrieval',   desc: '**Dense + BM25 + pixel retrieval**, merged and reranked before a single token reaches the answer model.' },
          { title: 'Modal services', desc: 'Embedding, reranking, and answer models deployed as serverless GPU functions — **scale to zero** when nobody’s asking questions.' },
        ],
      },
      {
        type: 'challenges',
        items: [
          { title: 'One retrieval method isn’t enough', desc: 'Dense vector search alone misses lexical matches; BM25 alone misses semantic ones; neither sees a diagram. **Running all three in parallel and reranking the merged set** was the only way to stop losing whichever kind of match a single method is bad at.' },
          { title: 'Captionless crops going mute',          desc: 'A table or figure with no generated caption is invisible to text-based retrieval no matter how good the image embedding is. Solved with a **Qwen3-VL caption-fallback step** at ingestion time, so nothing enters the index silently.' },
          { title: 'Dev-cost vs. production-latency',        desc: 'Running everything on Modal’s GPUs during development would work, but burns through the free compute tier fast on typo fixes. Keeping Ollama as a **local, no-GPU-bill inference path** let iteration stay cheap without touching the production path.' },
        ],
      },
      {
        type: 'takeaways',
        content: `The embedding model and the reranker are both well-understood, mostly-trustworthy-out-of-the-box components. **The genuinely hard part was everything built around them** — deciding when a caption needs generating, when page coverage is too thin to trust, when to burst to a GPU rather than wait on a local one. RAG gets pitched as "embed it, retrieve it, done"; the distance between that pitch and an answer actually worth trusting turned out to be **almost entirely fallback logic**.\n\nThe repo also keeps a public, unglamorous roadmap — tests not yet written, no CI, a setup process that's currently more "Homebrew and prayer" than one-command install — on the theory that a project **honest about what it doesn't do yet** is more trustworthy than one quietly pretending to be finished. Software rarely is; it just reaches a point where it's willing to say what's next.`,
      },
    ],
  },
  {
    slug: 'foundyou',
    youtube: 'https://www.youtube.com/watch?v=WSCJvNlLEN4',
    tag: 'PYTHON | COMPUTER VISION',
    title: 'FoundYou',
    desc: '**Real-time multi-camera person re-identification** — **one global ID** follows each person across every camera, occlusion, and doorway exit, so the system never has to ask "wait, is that the same guy?" twice.',
    tags: ['python', 'ai/ml', 'cv'],
    role: 'ML Engineer',
    tech: ['Python', 'PyTorch', 'Ultralytics YOLO26', 'ByteTrack', 'OSNet-512', 'FAISS', 'OpenCV', 'InsightFace'],
    github: 'https://github.com/durgeshgowdac/foundyou',
    paperUrl: '/downloads/foundyou-research-paper.pdf',
    stat: 'Runtime SWAP / DUPLICATE / UNSTABLE ID validation',
    filename: 'foundyou.py',
    tagline: 'One global ID across every camera',
    results: [
      { value: '0.93', label: 'MOTA on a synthetic two-camera benchmark (IDF1 0.89, 18–24 fps on an M1 laptop)' },
      { value: '3', label: 'runtime ID failure modes flagged: SWAP, DUPLICATE, UNSTABLE' },
      { value: '12+', label: 'evaluation metrics, from MOTA and IDF1 to CMC, mAP and throughput' },
      { value: '512', label: 'OSNet-512 appearance embeddings, FAISS-searched' },
    ],
    sections: [
      {
        type: 'brief',
        content: `Picture a mall with twenty cameras and zero coordination between them: someone walks past Camera 3, ducks behind a pillar, and reappears on Camera 7 two seconds later — and as far as the system is concerned, that's a brand-new person. FoundYou is the fix. It tracks people across an arbitrary number of camera feeds and gives each one a **persistent global ID** that survives camera handoffs, temporary occlusion, and leaving the frame entirely. Each camera runs YOLO26 + [ByteTrack](https://github.com/ifzhang/ByteTrack) independently in its own thread; a central GlobalReIDManager resolves those per-camera local tracks into global identities using [OSNet-512](https://github.com/KaiyangZhou/deep-person-reid) appearance embeddings.\n\nIdentity resolution runs as a **three-step cascade** per new tracklet: match against currently active global tracks, attempt [FAISS](https://github.com/facebookresearch/faiss)-accelerated reacquisition against archived tracks, or spawn a new global ID if neither succeeds — in that order, because guessing wrong here means **confidently tracking the wrong person**.`,
      },
      {
        type: 'contribution',
        items: [
          'Designed and built the **full pipeline solo**: per-camera YOLO26 + ByteTrack workers, the OSNet-512 embedding extractor, and the GlobalReIDManager that ties them together.',
          'Implemented a **robust gallery-distance metric** — median cosine distance per camera, averaged across cameras — instead of nearest-frame matching, so one blurry or anomalous frame can no longer trigger a false match.',
          'Added an **optional face-detection pre-filter** (OpenCV DNN, batched across all crops in a single forward pass) that vetoes body-embedding matches when face distance disagrees, with an InsightFace/dlib embedding path for sharper ranking when available.',
          'Built a **post-hoc merge pass** that periodically collapses two active tracks that are really the same person — the case where ByteTrack drops an ID before a track has enough frames to be matched on first appearance.',
          'Wrote a runtime **IDValidator**, a read-only watchdog that flags three failure modes on a rolling streak basis: SWAP (two tracks on different cameras that are probably one person wearing two IDs), DUPLICATE (fragmentation the merge pass hasn’t caught yet), and UNSTABLE (a gallery contaminated by more than one person).',
          'Built a **full offline evaluation harness** (MOTA, MOTP, IDF1, Rank-k, mAP, CMC, throughput) plus a synthetic benchmark mode that needs no camera or GPU, so the matching thresholds can be tuned by ablation rather than guesswork.',
        ],
      },
      {
        type: 'architecture',
        items: [
          { title: 'Per-camera workers',   desc: 'Each CameraWorker runs YOLO26 + ByteTrack in its own thread, producing local (camera, track_id) pairs and batched OSNet + face features.' },
          { title: 'Step A — match active',  desc: 'A new tracklet is first compared against all currently active global tracks via **robust gallery distance**, with an optional face-distance veto.' },
          { title: 'Step B — reacquire',      desc: 'On no match, FAISS runs a coarse inner-product search over archived (no-longer-visible) tracks, then verifies with the full robust-distance check — **this is how someone who left and came back gets their old ID**.' },
          { title: 'Step C — new track',       desc: 'If both steps fail, a fresh GlobalTrack and global ID are created.' },
          { title: 'Maintenance loop',      desc: 'A periodic pass archives idle tracks, runs the merge pass on fragmented duplicates, rebuilds the FAISS index, and sweeps the IDValidator for SWAP/DUPLICATE/UNSTABLE issues.' },
        ],
      },
      {
        type: 'challenges',
        items: [
          { title: 'Single-frame false matches', desc: 'Matching against the single nearest stored frame is vulnerable to one blurry or coincidentally-similar frame. Solved with the **median-distance-per-camera metric**, which is far more resistant to outliers than a min() over the gallery.' },
          { title: 'Cold-start fragmentation',    desc: 'A person’s gallery is too small to match reliably in their first few frames, so if ByteTrack drops the local ID in that window, two global tracks get created for one person. The periodic **merge pass** reconciles this once both galleries are mature enough to compare.' },
          { title: 'Thread-safety of cv2.dnn',    desc: 'OpenCV’s DNN module isn’t thread-safe, so each CameraWorker instantiates **its own FaceDetector** rather than sharing one across threads.' },
        ],
      },
      {
        type: 'takeaways',
        content: `The hardest part of FoundYou wasn't the detector or the embedding network — both are well-understood off-the-shelf components you can mostly trust out of the box. It was **the identity-resolution logic sitting between them**: deciding, under noise and occlusion, whether two observations are the same person without ever being able to check the ground truth at runtime. Building the **IDValidator** (a read-only watchdog that flags trouble instead of hiding it) — rather than tuning the thresholds once and hoping — was the single change that turned "seems to work in the demo" into **a system I'd actually stand behind**.`,
      },
    ],
  },
  {
    slug: 'mlxnarrator',
    youtube: 'https://www.youtube.com/watch?v=76SKzSDh-gs',
    tag: 'PYTHON | ON-DEVICE SPEECH',
    title: 'MLXnarrator',
    desc: 'Give a silent screen recording a voice — **offline, on a Mac**. Write a plain-text script; a local Kokoro text-to-speech model speaks it, Whisper writes the subtitles, and ffmpeg renders the finished MP4. **No cloud, no API keys.**',
    tags: ['python', 'ai/ml', 'tts', 'tools'],
    role: 'Creator',
    tech: ['Python', 'MLX', 'Kokoro-82M', 'whisper.cpp', 'FFmpeg', 'spaCy', 'Bash'],
    github: 'https://github.com/durgeshgowdac/MLXnarrator',
    stat: 'Runs 100% offline — no cloud, no API keys, no per-minute fees',
    filename: 'narrate.py',
    tagline: 'Give screen recordings a voice, offline on a Mac',
    results: [
      { value: '100%', label: 'offline: no cloud, no API keys, no per-minute fees' },
      { value: '82M',  label: 'Kokoro voice model, running locally on Apple Silicon' },
      { value: '1.30×', label: 'speed-up ceiling before the narration is flagged as rushed' },
      { value: '2',    label: 'render modes: burned-in subtitles, or none with no re-encode' },
    ],
    sections: [
      {
        type: 'brief',
        content: `Every demo video has the same problem: it's twelve seconds of you clicking things and eleven seconds of you wishing you had said something clever.\n\nMLXnarrator fixes that. You write what you want to say in **a plain text file**. It speaks the script with a local text-to-speech model, fits the narration to your video, listens to itself with [Whisper](https://github.com/openai/whisper) to produce subtitles, and renders a finished MP4 with [ffmpeg](https://ffmpeg.org) — on an Apple Silicon Mac, with **no cloud, no API keys**, and no “your free trial has ended” email.`,
      },
      {
        type: 'contribution',
        items: [
          'Built the **whole pipeline**: script → [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) speech (running through [MLX](https://github.com/ml-explore/mlx) on Apple Silicon) → fit to the video’s length → [whisper.cpp](https://github.com/ggml-org/whisper.cpp) subtitles → an ffmpeg render.',
          'Made the narration fit the video by **speeding it up, never slowing it down**, and having the tool warn (default threshold 1.30×) when it starts sounding like an auctioneer.',
          'Generated subtitles **from the final audio** rather than from the script, so the timing is never a guess — then left them as a plain .srt you can proofread. **Re-rendering never overwrites your edits**, and any existing SRT is backed up with a timestamp before it can be regenerated.',
          'Added **two render modes**: burned-in subtitles, or none at all — the fast mode copies the video stream, so it finishes in seconds with no quality loss, with an optional H.264 re-encode.',
          '**Cleaned the script automatically** before speech — Markdown headings and rules, timestamp section markers, bold/italic markers, backticks, and link URLs are all stripped so the text file can stay tidy.',
          '**Wrapped every step twice** — as a terminal script and as a double-click Finder launcher — so it works for people who never open a terminal, and added a voice-listing helper, an LLM prompt pack for drafting narration, and docs for setup and troubleshooting.',
        ],
      },
      {
        type: 'architecture',
        items: [
          { title: 'Kokoro TTS (MLX)', desc: 'src/narrate.py reads the cleaned script and speaks it with Kokoro-82M, which runs on Apple Silicon through MLX. **A small model with a surprisingly human voice**; the voice and speed are one-line settings.' },
          { title: 'Fit to the video', desc: 'The narration is time-stretched with ffmpeg’s atempo filter to match the video length (never slowed), with a configurable warning above 1.30× and a short silent tail left at the end. Output: narration-fit.wav.' },
          { title: 'whisper.cpp subtitles', desc: 'whisper.cpp transcribes the final, fitted audio into narration.srt — **a plain file you proofread before rendering**, with line length capped at 60 characters.' },
          { title: 'ffmpeg render', desc: 'Renders output/demo-final.mp4 with burned-in subtitles (via an ffmpeg build with libass), or a no-subtitles version that **copies the video stream**. Any audio already on the recording is kept quietly underneath the voice.' },
          { title: 'Scripts and launchers', desc: 'Each step is a shell script in bin/ with a matching double-click .command launcher, plus a run-everything shortcut. Settings live in the scripts, so there is **only one place to edit**.' },
        ],
      },
      {
        type: 'challenges',
        items: [
          { title: 'Burning subtitles needs libass', desc: 'Homebrew’s plain ffmpeg can’t burn subtitles, so the project uses the **keg-only ffmpeg-full build**, which the scripts find automatically — while the plain ffmpeg still handles the no-subtitles render.' },
          { title: 'Narration that outruns the video', desc: 'A script that’s too long for the footage has to be sped up. The tool speeds up but never slows down, and flags anything beyond 1.30× **so you shorten the script instead of shipping a rushed read**.' },
          { title: 'Double-click launchers on macOS', desc: 'Finder launchers can be blocked by quarantine flags and start with a different PATH than the terminal. The docs cover the **chmod / xattr fixes** and initialising Homebrew for login shells.' },
        ],
      },
      {
        type: 'takeaways',
        content: `Most of the design is about **keeping the human in control**: every stage leaves a plain file you can inspect or fix — the script, the audio, the subtitles — and **nothing you edit is silently overwritten**. The model does the speaking; **you still decide what gets said**, and how it reads.`,
      },
    ],
  },
  {
    slug: 'rolesense',
    youtube: 'https://www.youtube.com/watch?v=ezANFsRjH2g',
    tag: 'PYTHON | NLP / RESUME AI',
    title: 'RoleSense',
    desc: 'An AI resume screener that **classifies resumes into 40+ job categories** and **matches them to a job description** — built for recruiters buried under applications (hi, if that’s you reading this).',
    tags: ['python', 'ai/ml', 'nlp', 'web'],
    role: 'ML Engineer',
    tech: ['Python', 'Streamlit', 'scikit-learn', 'TF-IDF', 'Random Forest', 'pandas', 'plotly'],
    github: 'https://github.com/durgeshgowdac/RoleSense',
    liveUrl: 'https://rolesense.streamlit.app/',
    stat: '~82% accuracy across 43 job categories',
    filename: 'app.py',
    tagline: 'An AI resume screener across 40+ job categories',
    results: [
      { value: '~82%', label: 'accuracy classifying resumes (Random Forest)' },
      { value: '43', label: 'job categories' },
      { value: '5', label: 'classifiers trained and compared' },
      { value: '3', label: 'resume formats accepted: PDF, DOCX, TXT' },
    ],
    sections: [
      {
        type: 'brief',
        content: `RoleSense is the tool on the other side of every resume submission: upload a batch of resumes (PDF, DOCX, or TXT) and a job description, and it scores each candidate two ways — a trained classifier sorts them into one of **40+ job categories**, while a separate **TF-IDF/cosine-similarity engine** measures how closely their resume text actually matches the job description. A **hybrid score** blends both into a single pass/fail call with a confidence score, batch-processed and exported to CSV.\n\nBuilt it half as an ML exercise, half because I was curious **what my own resume looks like from the other side of the pipeline**.`,
      },
      {
        type: 'contribution',
        items: [
          '**Cleaned a labeled resume dataset** (sourced from HuggingFace’s resume-atlas) — stripping emails/phones/URLs, normalizing category names, and dropping short or duplicate entries.',
          'Engineered **handcrafted NLP features** on top of TF-IDF/count vectorization — education, experience, and skill-keyword counts — to give the classifier more than raw word frequency to work with.',
          '**Trained and compared five classifiers** — Naive Bayes, Logistic Regression, SVM, Random Forest, and KNN — and kept the best performer (**Random Forest, ~82% accuracy in local testing**) rather than assuming the fanciest model would win.',
          'Built the **hybrid scoring layer**: a configurable α/β weighting between the classifier’s category confidence and the TF-IDF/cosine similarity score against the job description.',
          'Built the [Streamlit](https://streamlit.io) UI end to end — batch upload, adjustable pass/fail thresholds, per-resume drill-down, and Plotly visualizations — plus PDF/DOCX/TXT text extraction so it accepts resumes as people actually send them.',
        ],
      },
      {
        type: 'features',
        items: [
          { title: '40+ job categories',   desc: 'Resumes are automatically classified into one of **40+ categories** rather than treated as one generic bucket.' },
          { title: 'Hybrid scoring',        desc: 'Classifier confidence and TF-IDF/cosine similarity to the job description are blended into **one adjustable score**, not just a single metric.' },
          { title: 'Batch processing',      desc: '**Screen a stack of resumes at once** instead of one at a time, with exportable CSV results.' },
          { title: 'Format-agnostic input', desc: 'Accepts PDF, DOCX, and TXT resumes directly — **no manual copy-pasting into a text box**.' },
        ],
      },
      {
        type: 'takeaways',
        content: `**The classifier was the easy 80%.** The genuinely hard part was **the hybrid scoring** — a resume can be a perfect category match and a mediocre fit for one specific job description, or vice versa, and collapsing that into one number without losing the nuance took more tuning than the model training did. Also: building a resume screener while job-hunting is a **slightly surreal form of dogfooding**.`,
      },
    ],
  },
  {
    slug: 'art-attack',
    youtube: 'https://www.youtube.com/watch?v=grN9gfeNoC0',
    tag: 'UNITY | GAME DEV',
    title: 'ArtAttack',
    desc: 'A **satirical first-person art-gallery vandalism simulator** built in Unity — pick a colour, size your brush, and splatter paint across a pristine gallery. There’s no security and nobody to stop you; **the only thing in your way is your conscience**.',
    tags: ['c#', 'unity', 'game-dev', 'games'],
    role: 'Lead Developer & Game Designer',
    tech: ['Unity 6', 'C#', 'URP', 'TextMeshPro', 'Mesh Decals'],
    github: 'https://github.com/durgeshgowdac/ArtAttack',
    liveUrl: 'https://durgeshgowdac.itch.io/artattack',
    downloadUrl: 'https://github.com/durgeshgowdac/ArtAttack/releases/download/v1.0.0/ArtAttack.app.zip',
    stat: 'Bilingual UI: English and 简体中文 in the macOS build',
    filename: 'ArtAttack.unity',
    tagline: 'A satirical first-person art-gallery vandalism sim',
    results: [
      { value: '2', label: 'UI languages: English and Simplified Chinese' },
      { value: '3', label: 'scenes: main menu, gameplay, game over' },
      { value: '2', label: 'release channels: GitHub Releases and itch.io' },
    ],
    sections: [
      {
        type: 'brief',
        content: `ArtAttack is exactly what it sounds like: you're alone in a pristine, high-end art gallery with a bucket of paint and an uncontrollable urge to make things messier. There’s no security to worry about — just you, the walls, and nobody stopping you, which is the joke. Its tagline says it best: "Creativity isn't a crime… but it does make a mess." The look borrows the stark, monochrome charcoal world of artist Lee Bae, then adds colour and lets you ruin it — all around a **real-time decal-painting system** and a first-person walk through the exhibit.\n\nPick a colour from the palette, size your brush, and splatter paint straight onto the gallery walls. Quit, and a Game Over screen hands down one of **14 randomized, arrest-themed one-liners** — "Arrested for excessive style" among them — so the consequences arrive only as punchlines.`,
      },
      {
        type: 'contribution',
        items: [
          'Built the **paint system** — raycast detection of paintable surfaces, real-time decal spawning for the splatter effect, and a colour-palette plus brush-size UI with a live preview — **chosen over runtime texture painting for performance** on 3D gallery surfaces.',
          'Set up **first-person movement and camera** (WASD / arrow keys, hold-to-crouch, hold-to-sprint, scroll-wheel zoom, mouse look) on top of a third-party first-person controller, with walking audio feedback.',
          'Built the **gallery itself**: several rooms to explore, dynamic lighting, and interactive paintings and sculptures to vandalize.',
          'Designed the **three scenes** (MainMenu, GamePlay, GameOver) with an animated, typewriter-effect main menu and smooth UI transitions.',
          'Added **14 randomized, arrest-themed Game Over one-liners** that give the vandalism its punchline.',
          'Localized the macOS build into **English and Simplified Chinese**.',
          'Shipped the macOS build through [GitHub Releases](https://github.com/durgeshgowdac/ArtAttack/releases) and [itch.io](https://durgeshgowdac.itch.io/artattack), and wrote the repo docs — developer setup, controls, project structure, known issues and roadmap — so others can build and contribute.',
        ],
      },
      {
        type: 'features',
        items: [
          { title: 'Decal paint system',     desc: 'Paint lands on gallery surfaces in real time as **decal meshes** spawned at the raycast hit, rather than baked into textures, with a colour palette, adjustable brush size and a quick brush toggle.' },
          { title: 'A gallery to wreck',      desc: 'A stylized, dynamically lit gallery with multiple rooms, plus interactive paintings and sculptures — all explored in first person.' },
          { title: 'Satire with a punchline', desc: 'Fourteen randomized, arrest-themed Game Over one-liners **keep it funny without being mean-spirited** — and give teachers an easy way into art, ethics and property.' },
          { title: 'Speaks two languages', desc: 'The macOS build ships with **English and Simplified Chinese UI text**, so the vandalism is multilingual.' },
          { title: 'Polished UI motion',      desc: 'An animated, **typewriter-text main menu** and smooth transitions rather than static menu screens.' },
        ],
      },
      {
        type: 'challenges',
        items: [
          { title: 'Paint without the cost',       desc: 'Painting directly on 3D surfaces gets expensive fast. **Spawning decals keeps it efficient**, but it is still the part that struggles on integrated graphics (and may on WebGL) — optimization on older hardware is the main open item on the roadmap.' },
          { title: 'Keeping the satire funny',     desc: 'A game about vandalism can easily turn mean or irresponsible. The tone — down to the wording of the Game Over one-liners — had to be **designed as carefully as the paint system itself**.' },
          { title: 'No undo (yet)',                desc: 'Decals are easy to add and hard to take back: **there is no eraser or undo/redo yet**, so every splatter is permanent. A paint history is the next planned feature.' },
          { title: 'One platform, for now',        desc: 'ArtAttack ships as a **macOS build only**, which needs a right-click → Open to get past Gatekeeper. Windows, Linux and WebGL builds are possible from the Unity project and are **the top roadmap priority**.' },
        ],
      },
      {
        type: 'takeaways',
        content: `**The tone was the hardest design constraint, not the code** — keeping ArtAttack funny rather than mean-spirited shaped decisions all the way down to the wording of the Game Over lines. Technically, the **decal-based paint system was the most transferable lesson**: real-time surface painting on arbitrary 3D geometry is a much better fit for decals than for runtime texture manipulation.\n\nWhat's next is mostly about **letting players undo their mistakes** — and then make new ones: an undo/redo system, more brush types (spray, markers, chalk), a photo mode to capture the damage, and builds for more platforms.`,
      },
    ],
  },
  {
    slug: 'newton-gravity',
    youtube: 'https://www.youtube.com/watch?v=4bjBL3LipFc',
    tag: 'C++ | OPENGL',
    title: 'Newton-Gravity',
    desc: `A **from-scratch OpenGL/C++ recreation** of Newton's apple — **hand-coded inverse-square-law physics**, a **procedurally grown apple tree**, and a camera you actually control (the scene’s Newton just sits there, as history demands).`,
    tags: ['c++', 'opengl', 'physics', 'games'],
    role: 'Graphics Programmer',
    tech: ['C++', 'OpenGL', 'GLUT', 'CMake'],
    github: 'https://github.com/durgeshgowdac/Newton-Gravity',
    stat: 'Custom gravity physics: F = Gm₁m₂/r²',
    filename: 'newton.cpp',
    tagline: 'Newton’s apple, from-scratch OpenGL physics',
    results: [
      { value: '0', label: 'physics libraries: the engine is written from scratch' },
      { value: 'F = Gm₁m₂/r²', label: 'the inverse-square law that drives the apple' },
      { value: '3', label: 'ways to move the camera: WASD, arrow keys, mouse drag' },
    ],
    sections: [
      {
        type: 'brief',
        content: `The story of Newton and the apple is probably apocryphal, definitely oversimplified, and yet still the reason most people can recite the concept of gravity on command — so I rebuilt the moment as a real-time 3D scene, from scratch, in C++ and OpenGL. An apple falls from a tree under a custom implementation of [Newton's law of universal gravitation](https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation) (**no physics engine doing the work behind the curtain**), in a fully textured environment — a procedurally grown tree, Newton himself, ground, sky — with free camera movement and an in-scene menu system.`,
      },
      {
        type: 'contribution',
        items: [
          'Implemented the **physics engine from scratch** — no physics library — applying F = G·(m₁·m₂)/r² to drive the apple’s fall each frame, plus a damped bounce and a rolling stop.',
          'Built the **OpenGL/GLUT rendering pipeline**: textured primitives for the apple, a procedurally generated tree, Newton, the ground, and the sky, plus a custom TextureLoader for BMP assets.',
          'Wrote the **camera and input system** — WASD/arrow-key/mouse-drag rotation and zoom — and an on-screen menu and message-display system for simulation feedback.',
          'Set up [CMake](https://cmake.org) as the cross-platform build system alongside native Xcode/CLion project support for macOS development.',
        ],
      },
      {
        type: 'architecture',
        items: [
          { title: 'Physics core', desc: 'apple.cpp owns **the gravitational force calculation** (F = G·m₁m₂/r²), the damped bounce and the rolling stop, with every constant gathered in constants.h.' },
          { title: 'Object modules',  desc: 'Separate apple, tree, Newton-figure, and environment modules each own their own geometry, texture, and render call.' },
          { title: 'Texture loader',  desc: 'A **custom TextureLoader** reads BMP assets for cross-platform compatibility **without relying on an image library**.' },
          { title: 'Menu & messaging', desc: 'A lightweight in-scene menu and message-display system handle simulation controls and on-screen feedback **without a full UI framework**.' },
        ],
      },
      {
        type: 'takeaways',
        content: `**Building the physics from the actual inverse-square law** — rather than faking a plausible-looking fall — was the point of the exercise. It's a small simulation, but implementing F = Gm₁m₂/r² by hand against a real OpenGL scene **made the law concrete in a way that reading it in a textbook never did**. No apples were harmed; one CMake config nearly didn't survive.`,
      },
    ],
  },
  {
    slug: 'avl-visualizer',
    youtube: 'https://www.youtube.com/watch?v=Z-1l-arMyq4',
    tag: 'JAVA | DATA STRUCTURES',
    title: 'AVL Tree Visualizer',
    desc: 'An educational Java/Swing GUI that **animates every AVL rotation frame by frame**, at whatever speed keeps a confused Data Structures student from crying — adjustable, no judgment.',
    tags: ['java', 'dsa', 'gui', 'tools'],
    role: 'Software Developer',
    tech: ['Java', 'Java Swing'],
    github: 'https://github.com/durgeshgowdac/avl-tree-visualization',
    stat: 'All 4 rotation types, animated step-by-step',
    filename: 'AVLTreeDemo.java',
    tagline: 'Every AVL rotation, animated frame by frame',
    results: [
      { value: '4', label: 'rotation types, each animated step by step' },
      { value: '3', label: 'traversal orders shown beside the tree: pre-, in- and post-order' },
      { value: '0', label: 'external dependencies' },
    ],
    sections: [
      {
        type: 'brief',
        content: `Every CS student learns the same way that [AVL trees](https://en.wikipedia.org/wiki/AVL_tree) "self-balance," and almost none of them see it actually happen — the textbook shows a before-and-after diagram and expects you to believe the rotation in between. AVL Tree Visualizer is **my objection to that**. It's a small Swing desktop app that makes self-balancing binary search trees tangible instead of abstract: keys are inserted one at a time, and whenever a rotation is needed to restore balance, the GUI **animates it rather than just redrawing the final tree**, so you can actually watch an **LL, RR, LR, or RL rotation** happen.`,
      },
      {
        type: 'contribution',
        items: [
          'Implemented the **AVL tree itself** — AVLNode, AVLTree, and the interface separating the data structure from the GUI — including **all four rotation cases**.',
          'Built AVLTreeVisualizer to render the current tree state (nodes, edges, and balance factors) and **animate transitions between states** at a **user-selectable speed (Slow / Normal / Fast)**.',
          'Added pre-order, in-order, and post-order traversal output alongside the tree view, and **a detailed log of every rotation** performed during an insertion.',
          'Made the demo key sequence configurable in AVLTreeDemo, and added **a restart control** so a session can be replayed without relaunching the app.',
        ],
      },
      {
        type: 'features',
        items: [
          { title: 'Animated rotations',   desc: 'Every LL, RR, LR, and RL rotation is animated, not just redrawn — the point of the whole project is **making the mechanism visible**.' },
          { title: 'Adjustable speed',      desc: 'Playback speed (Slow / Normal / Fast) **can be changed mid-run** to slow down and study a specific rotation.' },
          { title: 'Traversal output',      desc: 'Pre-order, in-order, and post-order results **update live alongside the visual tree**.' },
          { title: 'No external dependencies', desc: '**Pure Java + Swing** — just a recent JDK (22 or newer) is enough to compile and run it.' },
        ],
      },
      {
        type: 'takeaways',
        content: `Building the animator forced me to be **precise about exactly where every node starts and ends up** for each of the four rotation cases — a level of precision that's suspiciously easy to skip when you already "understand" the algorithm on paper. I've since used this exact tool, unprompted, to **win a whiteboard argument about AVL rotations**. Worth the weekend.`,
      },
    ],
  },
  {
    slug: 'sams',
    youtube: '', // placeholder: paste a YouTube link to show a demo
    tag: 'DJANGO | FULL-STACK',
    title: 'Student Attendance Management System',
    desc: 'A Django attendance system with **role-based dashboards** for admins, teachers, and students, spanning the **full academic hierarchy** down to individual class sessions — built with two teammates, **Akash M** and **Harish Murti**, and, refreshingly, **an actual test suite**.',
    tags: ['python', 'django', 'web'],
    role: 'Full-Stack Developer (team of 3)',
    tech: ['Python', 'Django 5.2', 'SQLite', 'Bootstrap'],
    github: 'https://github.com/durgeshgowdac/Student-Attendance-Management-System',
    stat: '3 role-based portals, 1 codebase',
    filename: 'sams/manage.py',
    tagline: 'Role-based attendance management in Django',
    results: [
      { value: '3', label: 'role-based portals: admin, teacher, student' },
      { value: '3', label: 'developers: me, Akash M and Harish Murti' },
      { value: '130+', label: 'test functions across models, forms, views, integration and widgets' },
    ],
    sections: [
      {
        type: 'brief',
        content: `Every school claims to track attendance; most of them mean a spreadsheet someone forgets to update. SAMS is a [Django](https://www.djangoproject.com) web app that **actually models the problem properly** — departments, programs, batches, academic years, semesters, and courses, each a real relation rather than a flat table — with **distinct dashboards** for administrators, teachers, and students. Built with two teammates, **Akash M** and **Harish Murti**, as a **full CRUD system rather than a toy demo**, because "attendance app" is deceptively one of the easiest ideas to underbuild.`,
      },
      {
        type: 'contribution',
        items: [
          'Built the **Django data model** — custom User with role-based access, StudentProfile, Department, Program, Batch, AcademicYear, Semester, Course, TeacherCourse, StudentCourse, AttendanceSession, and Attendance.',
          'Implemented the **admin workflow**: department/program/batch/course setup, bulk student enrollment, teacher-to-course assignment, and generated attendance reports.',
          'Built the **teacher and student dashboards** — session-based attendance marking for teachers, and per-course attendance statistics for students.',
          'Wrote the **test suite** (models, forms, views, integration, and custom widgets) with a coverage-analysis run mode.',
        ],
      },
      {
        type: 'features',
        items: [
          { title: 'Role-based access',   desc: 'Django’s built-in auth extended with a custom User model **gates every view by role** — admin, teacher, or student.' },
          { title: 'Full academic hierarchy', desc: 'Departments → programs → batches → academic years → semesters → courses, modeled as **real relational data** rather than flat tables.' },
          { title: 'Attendance sessions', desc: 'Teachers create a session per class meeting and mark **present / absent / late per student**, feeding both teacher- and student-side statistics.' },
          { title: 'Test coverage',       desc: 'Dedicated test files for models, forms, views, widgets, and integration flows, **runnable individually or with coverage analysis**.' },
        ],
      },
      {
        type: 'takeaways',
        content: `**Most of the real complexity here was in the data model, not the views** — getting the academic hierarchy (department → program → batch → year → semester → course) right up front saved a lot of rework later. Working on this with **Akash M** and **Harish Murti** was also **a good forcing function for actually writing tests**, since three people editing the same models file without a test suite is a recipe for silent regressions.`,
      },
    ],
  },
  {
    slug: 'twitter-bot-eda',
    youtube: '', // placeholder: paste a YouTube link to show a demo
    tag: 'PYTHON | DATA SCIENCE',
    title: 'Twitter Bot Detection EDA',
    desc: 'Exploratory analysis hunting for the **statistical tells that separate bot accounts from real ones** — follower ratios, tweet frequency, and account-creation hours, visualized **before any model gets to guess**.',
    tags: ['python', 'ai/ml', 'data-science', 'eda'],
    role: 'Data Analyst',
    tech: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Jupyter'],
    github: 'https://github.com/durgeshgowdac/Twitter_Bot_Detection_EDA',
    liveUrl: 'https://colab.research.google.com/drive/1buVfeKxvulN_IBEMLuzfMOj3Dwyl7u2Z?usp=sharing',
    filename: 'bot_eda.ipynb',
    tagline: 'The statistical tells that separate bots from people',
    results: [
      { value: '37k+', label: 'labeled Twitter accounts analyzed' },
      { value: '3', label: 'signal families studied: follower dynamics, tweet frequency, account-creation hour' },
    ],
    stat: '37k+ Twitter accounts analyzed for bot signals',
    sections: [
      {
        type: 'brief',
        content: `Somewhere on Twitter, an account is tweeting every four minutes, following 8,000 people, and followed by roughly none of them. [This notebook](https://colab.research.google.com/drive/1buVfeKxvulN_IBEMLuzfMOj3Dwyl7u2Z?usp=sharing) goes looking for exactly that kind of statistical tell across **37,000+ labeled accounts** — account metadata, tweeting rates, creation hours, follower dynamics — visualized to build intuition for what separates a bot from a human before any model gets to make a guess.`,
      },
      {
        type: 'contribution',
        items: [
          'Cleaned and explored a labeled **bot-vs-human account dataset in Pandas**.',
          'Analyzed **follower/following ratios, tweet frequency, and account-creation hour** as candidate bot signals, adding log transforms and derived features such as follower-acquisition rate and “network size” to tame the skew.',
          'Built **visualizations** (distribution plots, correlation views) to communicate which features actually separate the two classes.',
          'Started from a public **Kaggle bot-vs-human dataset** of 37,000+ accounts, credited in the repo, because good analysts cite their sources.',
        ],
      },
      {
        type: 'takeaways',
        content: `The recurring lesson across every EDA project I've done is the same one: **the visualization phase is where you actually find the signal**, and the modeling step afterward is often just **confirming what the plots already showed you**.`,
      },
    ],
  },
  {
    slug: 'loan-data-processing',
    youtube: '', // placeholder: paste a YouTube link to show a demo
    tag: 'PYTHON | DATA SCIENCE',
    title: 'Loan Dataset Cleaning',
    desc: 'A pandas/NumPy pipeline that takes a **genuinely messy loan-applicant dataset** — duplicates, typos, and all — through **7 concrete cleaning steps** to **something a model could actually trust**.',
    tags: ['python', 'pandas', 'data-science', 'ai/ml'],
    role: 'Data Analyst',
    tech: ['Python', 'Pandas', 'NumPy', 'Jupyter Notebook'],
    github: 'https://github.com/durgeshgowdac/loan_data_processing',
    liveUrl: 'https://colab.research.google.com/drive/11RdQgL_Kr88n-PSHamHqaoPmxZ0eTzRD?usp=sharing',
    stat: '7-step cleaning pipeline, outlier-capped at p10/p90',
    filename: 'loan.ipynb',
    tagline: 'Seven concrete steps from messy data to model-ready',
    results: [
      { value: '7', label: 'cleaning steps' },
      { value: '13', label: 'columns in the dataset' },
      { value: '615 → 535', label: 'rows before and after cleaning' },
      { value: 'p10/p90', label: 'outliers capped at these percentiles instead of dropping rows' },
    ],
    sections: [
      {
        type: 'brief',
        content: `A loan-applicant dataset (13 columns — marital status, dependents, income, loan amount, term, credit score, approval status, and more) arrives the way real data always does: duplicated rows, inconsistent formatting, missing values, and a few outliers that make you question the data-entry process. [This notebook](https://colab.research.google.com/drive/11RdQgL_Kr88n-PSHamHqaoPmxZ0eTzRD?usp=sharing) walks it, step by step, into something actually safe to analyze or model: **615 rows in, 535 out**, and **every departure accounted for**.`,
      },
      {
        type: 'contribution',
        items: [
          '**Dropped duplicate rows**, both across the full row and specifically on the UID column.',
          '**Standardized string fields** — uppercased marital status, and normalized the Sex column’s ‘M’/’F’ shorthand into ‘Male’/’Female’.',
          '**Corrected invalid records** — replaced impossible Age values (anything below 1, negatives included) with a minimum valid age of 20.',
          '**Handled missing values**: mean-imputed Loan_amount, Term_months, and Age; filled missing Is_graduate with ‘Graduate’; dropped rows with any remaining gaps.',
          'Converted Marital_status, Sex, and Is_graduate to **categorical dtypes** and Income to float.',
          '**Capped Income outliers at the 10th and 90th percentiles** rather than dropping them.',
          '**Dropped the irrelevant Hobby column** before finalizing the dataset.',
        ],
      },
      {
        type: 'takeaways',
        content: `Cleaning a real dataset column-by-column like this is a good reminder of **how much judgment is hidden in** "just clean the data" — **whether to cap or drop outliers**, whether missing Is_graduate should default to Graduate or Not Graduate, changes the dataset in ways a model will absolutely pick up on.`,
      },
    ],
  },
]

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find(p => p.slug === slug)
}