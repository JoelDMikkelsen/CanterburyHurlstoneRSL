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

export default function QuestionnairePage() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const [response, setResponse] = useState<QuestionnaireResponse | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState("section1");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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

  const loadResponse = async () => {
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
      }
    } catch (error) {
      console.error("Error loading response:", error);
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

    const currentSection = response.sections[currentSectionId];
    if (!currentSection) return;

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
        if (q.required && !section.answers[q.id]) {
          missingRequired.push(q.id);
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

  if (!isAuthenticated || !response) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const currentSection = sections.find((s) => s.id === currentSectionId);
  const currentSectionState = response.sections[currentSectionId];
  const currentIndex = sections.findIndex((s) => s.id === currentSectionId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              ERP Discovery Questionnaire
            </h1>
            <SaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{response.progress.percentComplete}% Complete</span>
              <span>
                Section {currentIndex + 1} of {sections.length}
              </span>
            </div>
            <ProgressBar percentComplete={response.progress.percentComplete} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Sections</h2>
              <SectionNavigation
                currentSectionId={currentSectionId}
                sectionStates={response.sections}
                onSectionClick={handleSectionClick}
              />
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-8">
              {currentSection && (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentSection.name}
                    </h2>
                    {currentSection.description && (
                      <p className="text-gray-600 mb-2">{currentSection.description}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Estimated time: {currentSection.estimatedMinutes} minutes
                    </p>
                  </div>

                  <div className="space-y-6">
                    {currentSection.questions.map((question) => (
                      <QuestionRenderer
                        key={question.id}
                        question={question}
                        value={currentSectionState?.answers[question.id]}
                        onChange={(value) => handleAnswerChange(question.id, value)}
                        error={errors[question.id]}
                      />
                    ))}
                  </div>

                  <div className="mt-8 flex justify-between items-center">
                    <button
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      className="px-6 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentSectionState?.completed || false}
                          onChange={handleSectionComplete}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">
                          Mark section as complete
                        </span>
                      </label>
                    </div>

                    {currentIndex < sections.length - 1 ? (
                      <button
                        onClick={handleNext}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          await handleSectionComplete();
                          if (response.progress.completedSections === response.progress.totalSections - 1) {
                            alert("Thank you for completing the questionnaire!");
                          }
                        }}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Complete Questionnaire
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
