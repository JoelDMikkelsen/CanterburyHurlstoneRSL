"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

function SortableItem({
  id,
  label,
  index,
}: {
  id: string;
  label: string;
  index: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border-2 border-neutral-border rounded-xl p-4 flex items-center gap-3 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-grab active:cursor-grabbing"
    >
      <div
        {...attributes}
        {...listeners}
        className="text-neutral-muted hover:text-brand-purple transition-colors touch-none cursor-grab active:cursor-grabbing"
        aria-label="Drag handle"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9h16M8 15h16M4 9h.01M4 15h.01"
          />
        </svg>
      </div>
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-purple text-white flex items-center justify-center font-bold text-sm">
          {index + 1}
        </div>
        <span className="text-neutral-text font-medium">{label}</span>
      </div>
    </div>
  );
}

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newItems = arrayMove(items, oldIndex, newIndex);
        onChange(newItems);
        return newItems;
      });
    }
  };

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((itemKey, index) => {
              const criterion = criteria.find((c) => c.key === itemKey);
              if (!criterion) return null;
              return (
                <SortableItem
                  key={itemKey}
                  id={itemKey}
                  label={criterion.label}
                  index={index}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
