import { useEffect, useRef, useState, MouseEvent } from "react";

const features = [
  {
    title: "AI Agents",
    desc: "Create intelligent agents that process and automate tasks.",
  },
  {
    title: "Visual Workflow",
    desc: "Design workflows using nodes and connections.",
  },
  {
    title: "Export Code",
    desc: "Convert workflows into real Python code.",
  },
  {
    title: "Share Instantly",
    desc: "Generate links and share workflows easily.",
  },
];

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = -(y / rect.height - 0.5) * 10;
    const rotateY = (x / rect.width - 0.5) * 10;

    e.currentTarget.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "rotateX(0) rotateY(0) scale(1)";
  };

  return (
    <div
      id="features"
      ref={ref}
      className="min-h-screen flex flex-col items-center justify-center px-6 text-white"
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
        Powerful Features
      </h2>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl">
        {features.map((f, i) => (
          <div
            key={i}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg transition-all duration-300 transform-gpu ${
              visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
            <p className="text-gray-300">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}