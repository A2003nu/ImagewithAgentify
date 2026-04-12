import { useEffect, useState } from "react";

const steps = [
  { id: 1, label: "Start" },
  { id: 2, label: "Detect Intent" },
  { id: 3, label: "Process" },
  { id: 4, label: "Output" },
];

export default function WorkflowPreview() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-4">
          
          {/* Node */}
          <div
            className={`px-4 py-2 rounded-xl border transition-all duration-500 ${
              index === activeStep
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/40 scale-110"
                : "bg-white/5 text-gray-300 border-gray-600"
            }`}
          >
            {step.label}
          </div>

          {/* Line */}
          {index < steps.length - 1 && (
            <div
              className={`w-10 h-[2px] transition-all duration-500 ${
                index < activeStep ? "bg-purple-400" : "bg-gray-600"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}