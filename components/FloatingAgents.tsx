export default function FloatingAgents() {
  const agents = ["🤖", "🧠", "⚙️", "✨"];

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {agents.map((icon, i) => (
        <div
          key={i}
          className="absolute text-2xl animate-float"
          style={{
            left: `${20 + i * 20}%`,
            top: `${30 + i * 10}%`,
            animationDelay: `${i * 2}s`,
          }}
        >
          {icon}
        </div>
      ))}

      <style>
        {`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        `}
      </style>
    </div>
  );
}