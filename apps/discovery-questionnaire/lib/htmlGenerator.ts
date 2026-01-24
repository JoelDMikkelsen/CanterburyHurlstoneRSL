import { QuestionnaireResponse } from "@/types";
import { sections } from "./questions";

export function generateResponseHTML(response: QuestionnaireResponse): string {
  const formatAnswer = (questionId: string, value: any, questionType: string): string => {
    if (value === null || value === undefined) {
      return "<em>Not answered</em>";
    }

    switch (questionType) {
      case "multiple-choice":
        const question = sections
          .flatMap((s) => s.questions)
          .find((q) => q.id === questionId);
        const option = question?.options?.find((opt) => opt.value === value);
        return option?.label || String(value);
      
      case "multiple-select":
        if (Array.isArray(value)) {
          const question2 = sections
            .flatMap((s) => s.questions)
            .find((q) => q.id === questionId);
          return value
            .map((v) => {
              const opt = question2?.options?.find((o) => o.value === v);
              return opt?.label || v;
            })
            .join(", ");
        }
        return String(value);
      
      case "yes-no-followup":
        if (typeof value === "object" && value !== null) {
          const yesNo = value.value ? "Yes" : "No";
          const followup = value.followup ? ` - ${value.followup}` : "";
          return yesNo + followup;
        }
        return value ? "Yes" : "No";
      
      case "priority-ranking":
        if (Array.isArray(value)) {
          const criteriaLabels: { [key: string]: string } = {
            functionalFit: "Functional fit",
            integrationFit: "Integration fit",
            multiEntity: "Multi-entity & consolidation",
            controlsAudit: "Controls & audit",
            implementationSpeed: "Implementation speed",
            tco5Year: "5-year TCO",
            partnerDelivery: "Partner delivery confidence",
          };
          return value
            .map((v, idx) => `${idx + 1}. ${criteriaLabels[v] || v}`)
            .join("<br>");
        }
        return String(value);
      
      case "text":
        return String(value).replace(/\n/g, "<br>");
      
      default:
        return String(value);
    }
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ERP Discovery Questionnaire - ${response.metadata.userName || response.metadata.userEmail}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #6B46C1 0%, #4C1D95 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header p {
      margin: 5px 0;
      opacity: 0.9;
    }
    .section {
      background: white;
      margin-bottom: 30px;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .section-title {
      color: #6B46C1;
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #FF6B4A;
    }
    .question {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e5e7eb;
    }
    .question:last-child {
      border-bottom: none;
    }
    .question-label {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
      font-size: 16px;
    }
    .question-answer {
      color: #4b5563;
      padding-left: 20px;
      margin-top: 5px;
    }
    .metadata {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
      font-size: 14px;
      color: #6b7280;
    }
    .metadata strong {
      color: #374151;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ERP Discovery Questionnaire</h1>
    <p><strong>Respondent:</strong> ${response.metadata.userName || "N/A"} (${response.metadata.userEmail})</p>
    <p><strong>Completed:</strong> ${response.completedAt ? new Date(response.completedAt).toLocaleString() : "Not completed"}</p>
    <p><strong>Progress:</strong> ${response.progress.percentComplete}% (${response.progress.completedSections} of ${response.progress.totalSections} sections)</p>
  </div>

  ${sections
    .map((section) => {
      const sectionState = response.sections[section.id];
      if (!sectionState) return "";

      return `
    <div class="section">
      <div class="section-title">${section.name}</div>
      ${section.questions
        .map((question) => {
          const answer = sectionState.answers[question.id];
          return `
        <div class="question">
          <div class="question-label">${question.label}${question.required ? " *" : ""}</div>
          <div class="question-answer">${formatAnswer(question.id, answer, question.type)}</div>
        </div>
      `;
        })
        .join("")}
    </div>
  `;
    })
    .join("")}

  <div class="metadata">
    <p><strong>Started:</strong> ${new Date(response.startedAt).toLocaleString()}</p>
    <p><strong>Last Updated:</strong> ${new Date(response.lastUpdated).toLocaleString()}</p>
    ${response.metadata.timeSpent ? `<p><strong>Time Spent:</strong> ${Math.round(response.metadata.timeSpent / 60)} minutes</p>` : ""}
  </div>
</body>
</html>`;

  return html;
}
