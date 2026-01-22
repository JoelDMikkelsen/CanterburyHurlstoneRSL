"use client";

interface SaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
}

export function SaveIndicator({ isSaving, lastSaved }: SaveIndicatorProps) {
  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-muted bg-neutral-bg px-3 py-1.5 rounded-full">
        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-neutral-muted border-t-transparent"></div>
        <span>Saving...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
        <span className="text-green-600 font-semibold">✓</span>
        <span>Saved</span>
      </div>
    );
  }

  return null;
}
