"use client";

import { useState, useEffect } from "react";

interface PriorityRankingProps {
  value: string[] | null;
  onChange: (value: string[]) => void;
}

const criteria = [
  { key: "functionalFit", label: "Functional fit" },
  { key: "integrationFit", label: "Integration fit" },
  { key: "multiEntity", label: "Multi-entity & consolidation" },
  { key: "controlsAudit", label: "Controls & audit" },
  { key: "implementationSpeed", label: "Implementation speed" },
  { key: "tco5Year", label: "5-year TCO" },
  { key: "partnerDelivery", label: "Partner delivery confidence" },
];

export function PriorityRanking({ value, onChange }: PriorityRankingProps) {
  // Initialize with default order if no value exists
  const defaultOrder = criteria.map((c) => c.key);
  
  // Handle migration from old numeric format to new array format
  const normalizeValue = (val: any): string[] => {
    if (!val) {
      return defaultOrder;
    }
    
    // If it's already an array, validate and use it
    if (Array.isArray(val)) {
      const allKeys = criteria.map((c) => c.key);
      const hasAllKeys = allKeys.every((key) => val.includes(key));
      if (hasAllKeys && val.length === allKeys.length) {
        return val;
      }
      // If incomplete, merge with defaults (preserve order, add missing at end)
      const missing = allKeys.filter((k) => !val.includes(k));
      return [...val, ...missing];
    }
    
    // If it's the old numeric format (object with numeric values), convert to order
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      const numericWeights = val as Record<string, number>;
      const sorted = criteria
        .map((c) => ({
          key: c.key,
          weight: numericWeights[c.key] || 0,
        }))
        .sort((a, b) => b.weight - a.weight)
        .map((item) => item.key);
      return sorted;
    }
    
    return defaultOrder;
  };

  const normalizedValue = normalizeValue(value);
  const [items, setItems] = useState<string[]>(normalizedValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize on mount: set default order if no value, or migrate old format
  useEffect(() => {
    if (!isInitialized) {
      const normalized = normalizeValue(value);
      
      // If no value exists, set default order
      if (!value) {
        setItems(defaultOrder);
        onChange(defaultOrder);
      } 
      // If old numeric format, migrate and save
      else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        setItems(normalized);
        onChange(normalized);
      }
      // If array format, just set it
      else {
        setItems(normalized);
      }
      
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync with external value changes (but avoid loops)
  useEffect(() => {
    if (isInitialized) {
      const normalized = normalizeValue(value);
      if (JSON.stringify(normalized) !== JSON.stringify(items)) {
        setItems(normalized);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isInitialized]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
    onChange(newItems);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);
    onChange(newItems);
  };

  return (
    <div className="space-y-3">
      {items.map((itemKey, index) => {
        const criterion = criteria.find((c) => c.key === itemKey);
        if (!criterion) return null;
        
        return (
          <div
            key={itemKey}
            className="bg-white border-2 border-neutral-border rounded-xl p-4 flex items-center gap-3 shadow-card hover:shadow-card-hover transition-all duration-200"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-purple text-white flex items-center justify-center font-bold text-sm">
              {index + 1}
            </div>
            <span className="flex-1 text-neutral-text font-medium">{criterion.label}</span>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="px-3 py-1 text-xs font-semibold rounded-lg border-2 border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-brand-purple"
                aria-label={`Move ${criterion.label} up`}
              >
                ↑ Move Up
              </button>
              <button
                type="button"
                onClick={() => moveDown(index)}
                disabled={index === items.length - 1}
                className="px-3 py-1 text-xs font-semibold rounded-lg border-2 border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-brand-purple"
                aria-label={`Move ${criterion.label} down`}
              >
                ↓ Move Down
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
