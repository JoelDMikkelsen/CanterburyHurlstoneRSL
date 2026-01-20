"use client";

interface SaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
}

export function SaveIndicator({ isSaving, lastSaved }: SaveIndicatorProps) {
  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
        <span>Saving...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <span>✓</span>
        <span>Saved</span>
      </div>
    );
  }

  return null;
}
