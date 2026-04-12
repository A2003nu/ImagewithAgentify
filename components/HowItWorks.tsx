"use client"

import { useEffect, useRef, useState } from "react"

const steps = [
  {
    step: "STEP 01",
    title: "Describe your goal",
    desc: "Type what you want to build — the system detects the right workflow automatically.",
  },
  {
    step: "STEP 02",
    title: "Workflow generates",
    desc: "A full multi-agent pipeline appears on your canvas with all steps pre-configured.",
  },
  {
    step: "STEP 03",
    title: "Run it live",
    desc: "Execute and watch each agent run in real-time with logs and outputs.",
  },
  {
    step: "STEP 04",
    title: "Export & ship",
    desc: "Download production-ready Python code and deploy anywhere.",
  },
]

interface StepItem {
  step: string
  title: string
  desc: string
}

function StepCard({ item, delay, visible }: { item: StepItem; delay: number; visible: boolean }) {
  return (
    <div
      className={`transform transition-all duration-700 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className="group p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg 
        hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden"
      >
        {/* Step label */}
        <p className="text-sm text-purple-400 mb-2">{item.step}</p>

        {/* Title */}
        <h3 className="text-lg font-semibold mb-3 group-hover:text-purple-300 transition">
          {item.title}
        </h3>

        {/* Desc */}
        <p className="text-gray-400 text-sm leading-relaxed">
          {item.desc}
        </p>

        {/* Glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-purple-500 to-pink-500 blur-xl transition"></div>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-28 px-6">
      
      {/* Badge */}
      <div className="flex justify-center mb-6">
        <span className="px-4 py-1 text-sm rounded-full border border-yellow-500/30 text-yellow-400 bg-yellow-500/10">
          ⚡ HOW IT WORKS
        </span>
      </div>

      {/* Heading */}
      <h2 className="text-4xl md:text-6xl font-bold text-center leading-tight">
        From idea to running agent
        <br />
        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          in under a minute
        </span>
      </h2>

      {/* Line */}
      <div className="relative max-w-6xl mx-auto mt-16">
        <div className="h-[2px] bg-white/10 w-full"></div>

        {/* Animated progress line */}
        <div
          className={`absolute top-0 left-0 h-[2px] bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-[2000ms] ${
            visible ? "w-full" : "w-0"
          }`}
        ></div>
      </div>

      {/* Steps */}
      <div className="grid md:grid-cols-4 gap-10 max-w-6xl mx-auto mt-16">
        {steps.map((item, i) => (
          <StepCard key={i} item={item} delay={i * 200} visible={visible} />
        ))}
      </div>
    </section>
  )
}