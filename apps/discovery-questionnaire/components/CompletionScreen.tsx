"use client";

interface CompletionScreenProps {
  userName?: string;
}

export function CompletionScreen({ userName }: CompletionScreenProps) {
  const handleDownload = () => {
    // This will be handled by the parent component
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-neutral-bg flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-elevated overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 sm:p-10 text-center">
            <div className="mb-4">
              <svg
                className="w-20 h-20 mx-auto text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Thank You!
            </h1>
            <p className="text-white/90 text-lg">
              Your questionnaire has been completed successfully.
            </p>
          </div>

          <div className="p-8 sm:p-10">
            <div className="space-y-6">
              <div className="bg-green-50 border-l-4 border-green-500 rounded-r-xl p-5">
                <p className="text-green-800 font-medium">
                  <strong>Completion Confirmed</strong>
                </p>
                <p className="text-green-700 mt-2 text-sm">
                  {userName
                    ? `Thank you, ${userName}, for completing the ERP Discovery Questionnaire.`
                    : "Thank you for completing the ERP Discovery Questionnaire."}
                </p>
              </div>

              <div className="bg-brand-purple/5 border-l-4 border-brand-purple rounded-r-xl p-5">
                <p className="text-brand-purple font-semibold mb-2">
                  What Happens Next?
                </p>
                <ul className="text-neutral-text text-sm space-y-2 list-disc list-inside">
                  <li>Your responses have been saved and sent to the evaluation team</li>
                  <li>A copy of your responses has been emailed to the project team</li>
                  <li>We will review your responses before the on-site discovery workshop</li>
                  <li>You will be contacted if we need any clarification</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-neutral-border">
                <p className="text-sm text-neutral-muted text-center">
                  You can close this window or navigate away. Your responses are securely stored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
