"use client";

interface ProgressBarProps {
  percentComplete: number;
}

export function ProgressBar({ percentComplete }: ProgressBarProps) {
  return (
    <div className="w-full bg-brand-purple/20 rounded-full h-3 mb-4 overflow-hidden">
      <div
        className="bg-accent-coral h-3 rounded-full transition-all duration-500 ease-out relative"
        style={{ width: `${percentComplete}%` }}
      >
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-white">
          {percentComplete}%
        </span>
      </div>
    </div>
  );
}
