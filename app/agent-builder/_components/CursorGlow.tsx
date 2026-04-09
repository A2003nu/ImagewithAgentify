"use client"

import { useEffect, useState } from "react"

export default function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX,
        y: e.clientY,
      })
    }

    window.addEventListener("mousemove", handleMove)

    return () => {
      window.removeEventListener("mousemove", handleMove)
    }
  }, [])

  return (
    <div
      style={{
  position: "fixed",
  top: position.y - 150,
  left: position.x - 150,
  width: 350,
  height: 350,
  pointerEvents: "none",
  background:
    "radial-gradient(circle, rgba(236,72,153,0.35) 0%, rgba(139,92,246,0.25) 40%, transparent 70%)",
  filter: "blur(90px)",
  zIndex: 0,
}}
    />
  )
}