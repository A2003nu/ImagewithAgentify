import { useEffect, useState } from "react";

export default function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-50 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl transition-all duration-75"
      style={{
        left: position.x - 80,
        top: position.y - 80,
      }}
    />
  );
}