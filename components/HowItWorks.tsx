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

function StepCard({ item, delay, visible, index, activeStep }: { item: StepItem; delay: number; visible: boolean; index: number; activeStep: number }) {
  const isActive = index === activeStep

  return (
    <div
      className={`relative transform transition-all duration-700 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className={`relative p-6 rounded-xl border backdrop-blur-lg 
        transition-all duration-500 cursor-pointer
        ${
          isActive
            ? "bg-purple-500/20 border-purple-400 scale-105 shadow-[0_0_30px_rgba(168,85,247,0.6)]"
            : "bg-white/5 border-white/10"
        }`}
      >
        {/* Step label */}
        <p
          className={`text-sm mb-2 ${
            isActive ? "text-purple-300" : "text-purple-400"
          }`}
        >
          {item.step}
        </p>

        {/* Title */}
        <h3
          className={`text-lg font-semibold mb-3 transition ${
            isActive ? "text-white" : "text-gray-200"
          }`}
        >
          {item.title}
        </h3>

        {/* Desc */}
        <p className="text-gray-400 text-sm leading-relaxed">
          {item.desc}
        </p>

        {/* Active pulse */}
        {isActive && (
          <div className="absolute inset-0 rounded-xl border border-purple-400 animate-ping opacity-20"></div>
        )}
      </div>
    </div>
  )
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

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

  useEffect(() => {
    if (!visible) return

    let step = 0

    const interval = setInterval(() => {
      setActiveStep(step)
      step++

      if (step >= steps.length) {
        step = 0
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [visible])

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
        {/* Base line */}
        <div className="h-[2px] bg-white/10 w-full"></div>

        {/* Flowing animated line */}
        <div
          className={`absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_100%] ${
            visible ? "animate-flow" : ""
          }`}
        ></div>
      </div>

      {/* Steps */}
      <div className="grid md:grid-cols-4 gap-10 max-w-6xl mx-auto mt-16">
        {steps.map((item, i) => (
          <StepCard 
            key={i} 
            item={item} 
            index={i}
            activeStep={activeStep}
            delay={i * 200} 
            visible={visible} 
          />
        ))}
      </div>
    </section>
  )
}