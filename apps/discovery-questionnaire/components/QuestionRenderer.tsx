"use client";

import { Question } from "@/types";
import { useState } from "react";
import { PriorityRanking } from "./PriorityRanking";

interface QuestionRendererProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  error,
}: QuestionRendererProps) {
  const yesNoValue = question.type === "yes-no-followup" 
    ? (typeof value === "object" ? value?.value : value)
    : null;
  const [showFollowup, setShowFollowup] = useState(
    question.type === "yes-no-followup" && (yesNoValue === true || (typeof value === "object" && value?.value === true))
  );

  const renderQuestion = () => {
    switch (question.type) {
      case "multiple-choice":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-center p-4 border-2 border-neutral-border rounded-xl cursor-pointer hover:border-accent-coral hover:bg-accent-coral/5 transition-all duration-200"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => {
                    onChange(e.target.value);
                    if (question.followupQuestion) {
                      setShowFollowup(e.target.value !== "");
                    }
                  }}
                  className="mr-3 w-4 h-4 text-accent-coral focus:ring-2 focus:ring-accent-coral focus:ring-offset-2"
                />
                <span className="text-neutral-text">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case "multiple-select":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const selectedValues = Array.isArray(value) ? value : [];
              const isChecked = selectedValues.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={`
                    flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                    ${isChecked 
                      ? 'border-accent-coral bg-accent-coral/10' 
                      : 'border-neutral-border hover:border-accent-coral hover:bg-accent-coral/5'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const current = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        onChange([...current, option.value]);
                      } else {
                        onChange(current.filter((v) => v !== option.value));
                      }
                    }}
                    className="mr-3 w-4 h-4 text-accent-coral focus:ring-2 focus:ring-accent-coral focus:ring-offset-2 rounded"
                  />
                  <span className="text-neutral-text">{option.label}</span>
                </label>
              );
            })}
          </div>
        );

      case "yes-no-followup":
        const yesNoValue = typeof value === "object" ? value?.value : value;
        const followupValue = typeof value === "object" ? value?.followup : undefined;
        const shouldShowFollowup = yesNoValue === true || (typeof value === "object" && value?.value === true);
        
        return (
          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center p-4 border-2 border-neutral-border rounded-xl cursor-pointer hover:border-accent-coral hover:bg-accent-coral/5 transition-all duration-200 flex-1">
                <input
                  type="radio"
                  name={question.id}
                  checked={yesNoValue === true}
                  onChange={() => {
                    onChange({ value: true, followup: followupValue });
                    setShowFollowup(true);
                  }}
                  className="mr-3 w-4 h-4 text-accent-coral focus:ring-2 focus:ring-accent-coral focus:ring-offset-2"
                />
                <span className="text-neutral-text font-medium">Yes</span>
              </label>
              <label className="flex items-center p-4 border-2 border-neutral-border rounded-xl cursor-pointer hover:border-accent-coral hover:bg-accent-coral/5 transition-all duration-200 flex-1">
                <input
                  type="radio"
                  name={question.id}
                  checked={yesNoValue === false}
                  onChange={() => {
                    onChange(false);
                    setShowFollowup(false);
                  }}
                  className="mr-3 w-4 h-4 text-accent-coral focus:ring-2 focus:ring-accent-coral focus:ring-offset-2"
                />
                <span className="text-neutral-text font-medium">No</span>
              </label>
            </div>
            {question.followupQuestion && shouldShowFollowup && (
              <div className="ml-4 pl-4 border-l-4 border-accent-coral bg-accent-coral/5 rounded-r-xl py-4 pr-4">
                <QuestionRenderer
                  question={question.followupQuestion}
                  value={followupValue || ""}
                  onChange={(followupValue) =>
                    onChange({ value: yesNoValue, followup: followupValue })
                  }
                />
              </div>
            )}
          </div>
        );

      case "scale":
        return (
          <div className="space-y-3">
            <input
              type="range"
              min={question.min || 1}
              max={question.max || 5}
              value={value || question.min || 1}
              onChange={(e) => onChange(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-border rounded-lg appearance-none cursor-pointer accent-accent-coral"
              style={{
                background: `linear-gradient(to right, #FF6B4A 0%, #FF6B4A ${((value || question.min || 1) - (question.min || 1)) / ((question.max || 5) - (question.min || 1)) * 100}%, #E5E7EB ${((value || question.min || 1) - (question.min || 1)) / ((question.max || 5) - (question.min || 1)) * 100}%, #E5E7EB 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-neutral-muted">
              {question.scaleLabels?.map((label, idx) => (
                <span key={idx} className="text-center flex-1">
                  {label}
                </span>
              ))}
            </div>
            <div className="text-center mt-2">
              <span className="text-2xl font-bold text-brand-purple">
                {value || question.min || 1}
              </span>
            </div>
          </div>
        );

      case "number":
        return (
          <input
            type="number"
            min={question.min}
            max={question.max}
            value={value || ""}
            onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-4 py-2.5 border-2 border-neutral-border rounded-xl bg-white text-neutral-text focus:ring-2 focus:ring-accent-coral focus:border-accent-coral transition-all"
          />
        );

      case "text":
        return (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            maxLength={question.maxLength}
            rows={4}
            className="w-full px-4 py-2.5 border-2 border-neutral-border rounded-xl bg-white text-neutral-text focus:ring-2 focus:ring-accent-coral focus:border-accent-coral transition-all resize-y"
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-neutral-border rounded-xl bg-white text-neutral-text focus:ring-2 focus:ring-accent-coral focus:border-accent-coral transition-all"
          />
        );

      case "priority-ranking":
        return (
          <PriorityRanking
            value={Array.isArray(value) ? value : null}
            onChange={onChange}
          />
        );

      case "percentage-sliders":
        const criteria = value || {
          functionalFit: 0,
          integrationFit: 0,
          multiEntity: 0,
          controlsAudit: 0,
          implementationSpeed: 0,
          tco5Year: 0,
          partnerDelivery: 0,
        };
        const total = (Object.values(criteria) as number[]).reduce((a, b) => a + b, 0);
        const isValid = total === 100;

        return (
          <div className="space-y-4">
            {[
              { key: "functionalFit", label: "Functional fit" },
              { key: "integrationFit", label: "Integration fit" },
              { key: "multiEntity", label: "Multi-entity & consolidation" },
              { key: "controlsAudit", label: "Controls & audit" },
              { key: "implementationSpeed", label: "Implementation speed" },
              { key: "tco5Year", label: "5-year TCO" },
              { key: "partnerDelivery", label: "Partner delivery confidence" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-neutral-text mb-2">
                  {label}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={criteria[key] || 0}
                  onChange={(e) => {
                    const newCriteria = {
                      ...criteria,
                      [key]: parseInt(e.target.value),
                    };
                    onChange(newCriteria);
                  }}
                  className="w-full h-2 bg-neutral-border rounded-lg appearance-none cursor-pointer accent-accent-coral"
                  style={{
                    background: `linear-gradient(to right, #FF6B4A 0%, #FF6B4A ${criteria[key] || 0}%, #E5E7EB ${criteria[key] || 0}%, #E5E7EB 100%)`
                  }}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-neutral-muted">0%</span>
                  <span className="text-base font-bold text-brand-purple">
                    {criteria[key] || 0}%
                  </span>
                  <span className="text-sm text-neutral-muted">100%</span>
                </div>
              </div>
            ))}
            <div className={`mt-6 p-4 rounded-xl border-2 ${isValid ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}>
              <strong className="text-base">Total: {total}%</strong>
              {!isValid && (
                <p className="text-sm mt-2">
                  Total must equal 100%. Please adjust the sliders.
                </p>
              )}
            </div>
          </div>
        );

      default:
        return <p>Unsupported question type</p>;
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-base font-semibold text-neutral-text leading-tight">
        {question.label}
        {question.required && <span className="text-accent-coral ml-1.5">*</span>}
      </label>
      {question.helperText && (
        <p className="text-sm text-neutral-muted leading-relaxed">{question.helperText}</p>
      )}
      {renderQuestion()}
      {error && <p className="text-sm text-red-600 mt-2 font-medium">{error}</p>}
    </div>
  );
}
