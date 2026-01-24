"use client";

import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { sections } from "@/lib/questions";
import { QuestionnaireResponse, Section, SectionState } from "@/types";
import { ProgressBar } from "@/components/ProgressBar";
import { SectionNavigation } from "@/components/SectionNavigation";
import { QuestionRenderer } from "@/components/QuestionRenderer";
import { SaveIndicator } from "@/components/SaveIndicator";
import { CompletionScreen } from "@/components/CompletionScreen";

export default function QuestionnairePage() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const [response, setResponse] = useState<QuestionnaireResponse | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState("section1");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    if (accounts.length > 0) {
      loadResponse();
    }
  }, [isAuthenticated, accounts, router]);

  // Initialize section state if missing when currentSectionId changes
  useEffect(() => {
    if (!response || !currentSectionId) return;
    
    const currentSection = sections.find((s) => s.id === currentSectionId);
    if (!currentSection) return;
    
    if (!response.sections[currentSectionId]) {
      const newSection: SectionState = {
        id: currentSectionId,
        name: currentSection.name,
        completed: false,
        completedAt: null,
        answers: {},
        lastModified: new Date().toISOString(),
      };
      
      setResponse((prev) => ({
        ...prev!,
        sections: {
          ...prev!.sections,
          [currentSectionId]: newSection,
        },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSectionId]);

  const loadResponse = async (): Promise<QuestionnaireResponse | null> => {
    try {
      const account = accounts[0];
      const userId = account.homeAccountId;
      const userEmail = account.username;
      const userName = account.name || "";

      const res = await fetch("/api/responses", {
        headers: {
          "x-user-id": userId,
          "x-user-email": userEmail,
          "x-user-name": userName,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data);
        if (data.progress.currentSection) {
          setCurrentSectionId(`section${data.progress.currentSection}`);
        }
        return data;
      }
      return null;
    } catch (error) {
      console.error("Error loading response:", error);
      return null;
    }
  };

  const saveResponse = useCallback(
    async (sectionId: string, answers: any, completed?: boolean) => {
      if (!response || !accounts[0]) return;

      const account = accounts[0];
      const userId = account.homeAccountId;
      const userEmail = account.username;
      const userName = account.name || "";

      setIsSaving(true);

      try {
        const res = await fetch("/api/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
            "x-user-email": userEmail,
            "x-user-name": userName,
          },
          body: JSON.stringify({
            sectionId,
            answers,
            completed,
          }),
        });

        if (res.ok) {
          const updated = await res.json();
          setResponse(updated);
          setLastSaved(new Date());
          setErrors({});
        } else {
          throw new Error("Failed to save");
        }
      } catch (error) {
        console.error("Error saving response:", error);
        setErrors({ [sectionId]: "Failed to save. Please try again." });
      } finally {
        setIsSaving(false);
      }
    },
    [response, accounts]
  );

  const debouncedSave = useCallback(
    (sectionId: string, answers: any) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveResponse(sectionId, answers);
      }, 500);
    },
    [saveResponse]
  );

  const handleAnswerChange = (questionId: string, value: any) => {
    if (!response) return;

    let currentSection = response.sections[currentSectionId];
    
    // Initialize section if it doesn't exist
    if (!currentSection) {
      const sectionData = sections.find((s) => s.id === currentSectionId);
      currentSection = {
        id: currentSectionId,
        name: sectionData?.name || "",
        completed: false,
        completedAt: null,
        answers: {},
        lastModified: new Date().toISOString(),
      };
    }

    const updatedAnswers = {
      ...currentSection.answers,
      [questionId]: value,
    };

    const updatedSection: SectionState = {
      ...currentSection,
      answers: updatedAnswers,
      lastModified: new Date().toISOString(),
    };

    setResponse({
      ...response,
      sections: {
        ...response.sections,
        [currentSectionId]: updatedSection,
      },
    });

    debouncedSave(currentSectionId, updatedAnswers);
  };

  const handleSectionComplete = async () => {
    if (!response) return;

    const section = response.sections[currentSectionId];
    if (!section) return;

    // Validate required questions
    const currentSectionData = sections.find((s) => s.id === currentSectionId);
    if (currentSectionData) {
      const missingRequired: string[] = [];
      currentSectionData.questions.forEach((q) => {
        if (q.required) {
          const answer = section.answers[q.id];
          // Check if answer exists and is not null/undefined
          // For arrays/strings, also check they're not empty
          // For booleans/numbers, false/0 are valid answers
          const isMissing = 
            answer === undefined || 
            answer === null ||
            (Array.isArray(answer) && answer.length === 0) ||
            (typeof answer === "string" && answer.trim() === "");
          
          if (isMissing) {
            missingRequired.push(q.id);
          }
        }
      });

      if (missingRequired.length > 0) {
        const newErrors: { [key: string]: string } = {};
        missingRequired.forEach((qId) => {
          newErrors[qId] = "This field is required";
        });
        setErrors(newErrors);
        return;
      }
    }

    await saveResponse(currentSectionId, section.answers, true);
  };

  const handleCompleteQuestionnaire = async () => {
    if (!response || !accounts[0]) return;

    // First, mark the last section as complete
    await handleSectionComplete();

    // Wait a moment for the save to complete, then reload
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Check if all sections are now complete
    const updatedResponse = await loadResponse();
    if (!updatedResponse) {
      alert("Unable to verify completion. Please try again.");
      return;
    }

    if (updatedResponse.progress.completedSections !== updatedResponse.progress.totalSections) {
      // Not all sections complete yet - show which ones are missing
      const incompleteSections = sections.filter(
        (s) => !updatedResponse.sections[s.id]?.completed
      );
      alert(
        `Please complete all sections before finishing. Missing: ${incompleteSections.map((s) => s.name).join(", ")}`
      );
      return;
    }

    setIsCompleting(true);

    try {
      const account = accounts[0];
      const userId = account.homeAccountId;
      const userEmail = account.username;
      const userName = account.name || "";

      const res = await fetch("/api/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
          "x-user-email": userEmail,
          "x-user-name": userName,
        },
      });

      if (res.ok) {
        setShowCompletion(true);
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to complete questionnaire");
      }
    } catch (error: any) {
      console.error("Error completing questionnaire:", error);
      alert(`There was an error completing the questionnaire: ${error.message || "Please try again."}`);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSectionClick = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setErrors({});
  };

  const handleNext = () => {
    const currentIndex = sections.findIndex((s) => s.id === currentSectionId);
    if (currentIndex < sections.length - 1) {
      setCurrentSectionId(sections[currentIndex + 1].id);
      setErrors({});
    }
  };

  const handlePrevious = () => {
    const currentIndex = sections.findIndex((s) => s.id === currentSectionId);
    if (currentIndex > 0) {
      setCurrentSectionId(sections[currentIndex - 1].id);
      setErrors({});
    }
  };

  if (showCompletion && response) {
    return <CompletionScreen userName={response.metadata.userName} />;
  }

  if (!isAuthenticated || !response) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-brand-purple border-t-transparent mx-auto"></div>
          <p className="mt-4 text-neutral-muted font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const currentSection = sections.find((s) => s.id === currentSectionId);
  // Ensure section state exists - provide fallback if missing
  const currentSectionState = response.sections[currentSectionId] || (currentSection ? {
    id: currentSectionId,
    name: currentSection.name,
    completed: false,
    completedAt: null,
    answers: {},
    lastModified: new Date().toISOString(),
  } : null);
  const currentIndex = sections.findIndex((s) => s.id === currentSectionId);

  return (
    <div className="min-h-screen bg-neutral-bg">
      <div className="bg-white border-b border-neutral-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold text-brand-purple">
                ERP Discovery Questionnaire
              </h1>
              <div className="h-1 w-16 bg-accent-coral rounded-full mt-1"></div>
            </div>
            <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-neutral-muted mb-3 font-medium">
              <span>{response.progress.percentComplete}% Complete</span>
              <span>
                Section {currentIndex + 1} of {sections.length}
              </span>
            </div>
            <ProgressBar percentComplete={response.progress.percentComplete} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-brand-purple rounded-2xl shadow-elevated p-5 sticky top-24">
              <h2 className="font-bold text-white mb-5 text-lg">Sections</h2>
              <SectionNavigation
                currentSectionId={currentSectionId}
                sectionStates={response.sections}
                onSectionClick={handleSectionClick}
              />
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8 lg:p-10">
              {currentSection && (
                <>
                  <div className="mb-8 pb-6 border-b border-neutral-border">
                    <h2 className="text-3xl font-bold text-brand-purple mb-3">
                      {currentSection.name}
                    </h2>
                    {currentSection.description && (
                      <p className="text-neutral-text text-base leading-relaxed mb-3">{currentSection.description}</p>
                    )}
                    <p className="text-sm text-neutral-muted font-medium">
                      Estimated time: {currentSection.estimatedMinutes} minutes
                    </p>
                  </div>

                  <div className="space-y-8">
                    {currentSection.questions.map((question) => {
                      // Ensure we have a section state (use empty answers if missing)
                      const sectionAnswers = currentSectionState?.answers || {};
                      const answerValue = sectionAnswers[question.id] ?? undefined;
                      return (
                        <QuestionRenderer
                          key={question.id}
                          question={question}
                          value={answerValue}
                          onChange={(value) => handleAnswerChange(question.id, value)}
                          error={errors[question.id]}
                        />
                      );
                    })}
                  </div>

                  <div className="mt-10 pt-6 border-t border-neutral-border flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      className="px-6 py-3 border-2 border-brand-purple text-brand-purple rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-purple hover:text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent-coral focus-visible:ring-offset-2"
                    >
                      Previous
                    </button>

                    <div className="flex gap-4 items-center">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={currentSectionState?.completed || false}
                          onChange={handleSectionComplete}
                          className="w-5 h-5 text-accent-coral rounded border-neutral-border focus:ring-2 focus:ring-accent-coral focus:ring-offset-2 cursor-pointer"
                        />
                        <span className="text-sm text-neutral-text font-medium group-hover:text-brand-purple transition-colors">
                          Mark section as complete
                        </span>
                      </label>
                    </div>

                    {currentIndex < sections.length - 1 ? (
                      <button
                        onClick={handleNext}
                        className="px-8 py-3 bg-accent-coral text-white rounded-xl font-semibold hover:bg-accent-coralDark transition-all duration-200 shadow-card hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-accent-coral focus-visible:ring-offset-2"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={handleCompleteQuestionnaire}
                        disabled={isCompleting}
                        className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 shadow-card hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCompleting ? "Completing..." : "Complete Questionnaire"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
