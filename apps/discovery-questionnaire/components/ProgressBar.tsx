"use client";

interface ProgressBarProps {
  percentComplete: number;
}

export function ProgressBar({ percentComplete }: ProgressBarProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
      <div
        className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${percentComplete}%` }}
      ></div>
    </div>
  );
}
