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
    <nav className="space-y-1.5">
      {sections.map((section, index) => {
        const state = sectionStates[section.id];
        const isCurrent = section.id === currentSectionId;
        const isCompleted = state?.completed || false;

        return (
          <button
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            className={clsx(
              "w-full text-left px-4 py-3 rounded-xl transition-all duration-200 relative",
              "flex items-center justify-between group",
              isCurrent
                ? "bg-white text-brand-purple font-semibold shadow-card"
                : "text-white/90 hover:text-white hover:bg-brand-purpleLight",
              isCompleted && !isCurrent && "text-white/80"
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {isCurrent && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-coral rounded-r-full" />
              )}
              <span className="text-sm font-medium flex-shrink-0">
                {index + 1}.
              </span>
              <span className="text-sm font-medium truncate">
                {section.name}
              </span>
            </div>
            {isCompleted && (
              <span className={clsx(
                "flex-shrink-0 ml-2 text-base",
                isCurrent ? "text-accent-coral" : "text-white/70"
              )}>
                ✓
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
