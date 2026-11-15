'use client'

// A continuous-scroll strip — the fresher pattern the tech/tool list deserves
// instead of another row of static pills (those still live on the About page
// as the full, accessible skill list; this is a decorative homepage rhythm).
const TOOLS = [
  'Python', 'PyTorch', 'TensorFlow', 'Hugging Face', 'Computer Vision',
  'YOLO', 'ByteTrack', 'OpenCV', 'DeepStream', 'FAISS',
  'Multimodal RAG', 'LLMs', 'NLP', 'Whisper', 'Kokoro TTS',
  'MLX', 'FFmpeg', 'FastAPI', 'Docker', 'GCP',
]

export default function TechMarquee() {
  const items = [...TOOLS, ...TOOLS] // duplicated once for a seamless -50% loop

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {items.map((tool, i) => (
          <span className="marquee-item" key={i}>
            {tool}
            <span className="marquee-dot">•</span>
          </span>
        ))}
      </div>
    </div>
  )
}
