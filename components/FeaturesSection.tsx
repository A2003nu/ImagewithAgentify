"use client"

import { useRef, MouseEvent } from "react"

const features = [
  {
    title: "Visual Workflow Builder",
    desc: "Drag and drop AI agents onto a live canvas. Connect them with edges. Watch your logic come alive.",
    gradient: "from-purple-500 to-blue-500",
  },
  {
    title: "Multi-Agent Orchestration",
    desc: "Chain specialized agents together — intent detector, extractor, generator, formatter.",
    gradient: "from-pink-500 to-purple-500",
  },
  {
    title: "Image Generation",
    desc: "Describe → generate → continue the pipeline using Pollinations API.",
    gradient: "from-orange-400 to-pink-500",
  },
  {
    title: "Real-Time News Research",
    desc: "Pull live news. Agents summarize, filter, and format instantly.",
    gradient: "from-blue-400 to-cyan-400",
  },
  {
    title: "Export to Python",
    desc: "Download production-ready code: workflow.py, requirements.txt, README.",
    gradient: "from-green-400 to-teal-500",
  },
  {
    title: "Resume Screening",
    desc: "Score, rank, and format candidates automatically.",
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    title: "Email Campaigns",
    desc: "Generate subject lines, body copy, and CTAs in your brand voice.",
    gradient: "from-pink-500 to-red-500",
  },
  {
    title: "Reel Script Generator",
    desc: "Generate viral scripts with hooks, body, and CTA.",
    gradient: "from-indigo-500 to-purple-500",
  },
]

interface Feature {
  title: string
  desc: string
  gradient: string
}

function FeatureCard({ feature }: { feature: Feature }) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = ref.current
    if (!card) return

    const rect = card.getBoundingClientRect()

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const rotateX = (y / rect.height - 0.5) * 10
    const rotateY = (x / rect.width - 0.5) * -10

    card.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.03)
    `
  }

  const handleMouseLeave = () => {
    if (ref.current) {
      ref.current.style.transform =
        "perspective(1000px) rotateX(0) rotateY(0) scale(1)"
    }
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative p-8 rounded-2xl border border-white/10 
      bg-white/5 backdrop-blur-xl 
      transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Glow effect */}
      <div
        className={`absolute inset-0 opacity-0 hover:opacity-30 transition duration-300 bg-gradient-to-r ${feature.gradient}`}
      ></div>

      {/* Content */}
      <h3 className="text-xl font-semibold mb-4 relative z-10">
        {feature.title}
      </h3>

      <p className="text-gray-300 relative z-10 leading-relaxed">
        {feature.desc}
      </p>

      {/* Border glow */}
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition duration-300 pointer-events-none border border-transparent bg-gradient-to-r ${feature.gradient} [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude]`}
      ></div>
    </div>
  )
}

export default function FeaturesSection() {
  return (
    <section className="relative py-24 px-6">
      {/* Title */}
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
        Powerful Features
      </h2>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
        {features.map((feature, i) => (
          <FeatureCard key={i} feature={feature} />
        ))}
      </div>
    </section>
  )
}