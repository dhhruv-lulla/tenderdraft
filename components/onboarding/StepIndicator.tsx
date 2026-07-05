import { Check } from "lucide-react";

interface Props {
  steps: string[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: Props) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((label, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? "bg-gradient-to-b from-gold-light to-gold text-navy shadow-[0_4px_12px_-2px_rgba(201,168,76,0.5)]"
                    : isCurrent
                      ? "bg-gold/10 text-gold ring-4 ring-gold/20"
                      : "bg-white/5 text-white/30 ring-1 ring-white/10"
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`hidden text-xs font-medium sm:block ${
                  isCurrent ? "text-white" : "text-white/35"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-3 mb-6 h-px w-10 transition-colors duration-500 sm:w-20 ${
                  isCompleted ? "bg-gold" : "bg-white/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
