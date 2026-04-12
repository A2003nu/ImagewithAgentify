import { useEffect, useState } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
}

export default function StarBackground() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2,
      speed: Math.random() * 0.5 + 0.2,
    }));
    setStars(generated);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full opacity-70"
          style={{
            width: star.size,
            height: star.size,
            left: star.x,
            top: star.y,
            animation: `moveStar ${10 + star.speed * 20}s linear infinite`,
          }}
        />
      ))}

      <style>
        {`
        @keyframes moveStar {
          from { transform: translateY(0px); }
          to { transform: translateY(-100vh); }
        }
        `}
      </style>
    </div>
  );
}