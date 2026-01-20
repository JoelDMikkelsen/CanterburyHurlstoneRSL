"use client";

import { Section } from "@/types";
import { sections } from "@/lib/questions";
import clsx from "clsx";

interface SectionNavigationProps {
  currentSectionId: string;
  sectionStates: { [key: string]: { completed: boolean } };
  onSectionClick: (sectionId: string) => void;
}

export function SectionNavigation({
  currentSectionId,
  sectionStates,
  onSectionClick,
}: SectionNavigationProps) {
  return (
    <nav className="space-y-2">
      {sections.map((section, index) => {
        const state = sectionStates[section.id];
        const isCurrent = section.id === currentSectionId;
        const isCompleted = state?.completed || false;

        return (
          <button
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            className={clsx(
              "w-full text-left px-4 py-2 rounded-lg transition-colors",
              isCurrent
                ? "bg-primary-100 text-primary-900 font-semibold"
                : "hover:bg-gray-100 text-gray-700",
              isCompleted && !isCurrent && "text-green-700"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {index + 1}. {section.name}
              </span>
              {isCompleted && (
                <span className="text-green-600">✓</span>
              )}
            </div>
          </button>
        );
      })}
    </nav>
  );
}
