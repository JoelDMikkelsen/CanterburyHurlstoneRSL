export type QuestionType =
  | "multiple-choice"
  | "multiple-select"
  | "yes-no-followup"
  | "scale"
  | "number"
  | "text"
  | "date"
  | "percentage-sliders";

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  helperText?: string;
  required?: boolean;
  options?: QuestionOption[];
  followupQuestion?: Question;
  min?: number;
  max?: number;
  scaleLabels?: string[];
  maxLength?: number;
}

export interface Section {
  id: string;
  name: string;
  description?: string;
  estimatedMinutes: number;
  questions: Question[];
}

export interface SectionAnswers {
  [questionId: string]: any;
}

export interface SectionState {
  id: string;
  name: string;
  completed: boolean;
  completedAt: string | null;
  answers: SectionAnswers;
  lastModified: string;
}

export interface Progress {
  totalSections: number;
  completedSections: number;
  percentComplete: number;
  currentSection: number;
}

export interface QuestionnaireResponse {
  id: string;
  partitionKey: string;
  rowKey: string;
  timestamp: string;
  lastUpdated: string;
  startedAt: string;
  completedAt: string | null;
  progress: Progress;
  sections: {
    [sectionId: string]: SectionState;
  };
  metadata: {
    userEmail: string;
    userName: string;
    browser?: string;
    device?: string;
    timeSpent?: number;
  };
}

export interface User {
  email: string;
  name: string;
}
