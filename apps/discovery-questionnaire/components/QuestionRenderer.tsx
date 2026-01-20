"use client";

import { Question } from "@/types";
import { useState } from "react";

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
                className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
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
                  className="mr-3"
                />
                <span>{option.label}</span>
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
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
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
                    className="mr-3"
                  />
                  <span>{option.label}</span>
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
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name={question.id}
                  checked={yesNoValue === true}
                  onChange={() => {
                    onChange({ value: true, followup: followupValue });
                    setShowFollowup(true);
                  }}
                  className="mr-3"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name={question.id}
                  checked={yesNoValue === false}
                  onChange={() => {
                    onChange(false);
                    setShowFollowup(false);
                  }}
                  className="mr-3"
                />
                <span>No</span>
              </label>
            </div>
            {question.followupQuestion && shouldShowFollowup && (
              <div className="ml-4 pl-4 border-l-2 border-primary-300">
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
          <div className="space-y-2">
            <input
              type="range"
              min={question.min || 1}
              max={question.max || 5}
              value={value || question.min || 1}
              onChange={(e) => onChange(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              {question.scaleLabels?.map((label, idx) => (
                <span key={idx} className="text-center flex-1">
                  {label}
                </span>
              ))}
            </div>
            <div className="text-center mt-2">
              <span className="text-lg font-semibold text-primary-600">
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
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        );

      case "text":
        return (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            maxLength={question.maxLength}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        );

      case "percentage-sliders":
        const criteria = value || {
          price: 0,
          functionality: 0,
          scalability: 0,
          integration: 0,
          partner: 0,
          timeline: 0,
        };
        const total = Object.values(criteria).reduce((a: number, b: number) => a + b, 0);
        const isValid = total === 100;

        return (
          <div className="space-y-4">
            {[
              { key: "price", label: "Price/Total Cost of Ownership" },
              { key: "functionality", label: "Functionality Fit" },
              { key: "scalability", label: "Upgradeability/Scalability" },
              { key: "integration", label: "Integration Friendliness" },
              { key: "partner", label: "Partner Capability" },
              { key: "timeline", label: "Implementation Timeline" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-600">0%</span>
                  <span className="text-sm font-semibold text-primary-600">
                    {criteria[key] || 0}%
                  </span>
                  <span className="text-sm text-gray-600">100%</span>
                </div>
              </div>
            ))}
            <div className={`mt-4 p-3 rounded-lg ${isValid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              <strong>Total: {total}%</strong>
              {!isValid && (
                <p className="text-sm mt-1">
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
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {question.label}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {question.helperText && (
        <p className="text-sm text-gray-500 italic">{question.helperText}</p>
      )}
      {renderQuestion()}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
