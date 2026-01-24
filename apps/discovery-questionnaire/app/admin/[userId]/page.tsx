"use client";

import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { QuestionnaireResponse } from "@/types";
import { generateResponseHTML } from "@/lib/htmlGenerator";
import Link from "next/link";

export default function AdminResponsePage() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const params = useParams();
  const [response, setResponse] = useState<QuestionnaireResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    if (accounts.length > 0 && params.userId) {
      loadResponse();
    }
  }, [isAuthenticated, accounts, router, params.userId]);

  const loadResponse = async () => {
    try {
      const account = accounts[0];
      const userEmail = account.username;
      const userId = decodeURIComponent(params.userId as string);

      const res = await fetch(`/api/admin/responses/${encodeURIComponent(userId)}`, {
        headers: {
          "x-user-email": userEmail,
        },
      });

      if (res.status === 403) {
        setError("Access denied. Admin access required (Fusion5 email domain).");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load response");
      }

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || "Failed to load response");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadHTML = () => {
    if (!response) return;
    const html = generateResponseHTML(response);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `questionnaire-${response.metadata.userEmail}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-brand-purple border-t-transparent mx-auto"></div>
          <p className="mt-4 text-neutral-muted font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !response) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-elevated p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-text mb-2">Error</h2>
          <p className="text-neutral-muted mb-6">{error || "Response not found"}</p>
          <Link
            href="/admin"
            className="inline-block px-6 py-3 bg-brand-purple text-white rounded-xl font-semibold hover:bg-brand-purpleDark transition-all"
          >
            Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  const htmlContent = generateResponseHTML(response);

  return (
    <div className="min-h-screen bg-neutral-bg">
      <div className="bg-white border-b border-neutral-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold text-brand-purple">
                Response: {response.metadata.userName || response.metadata.userEmail}
              </h1>
              <div className="h-1 w-16 bg-accent-coral rounded-full mt-1"></div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDownloadHTML}
                className="px-4 py-2 bg-accent-coral text-white rounded-xl font-semibold hover:bg-accent-coralDark transition-all"
              >
                Download HTML
              </button>
              <Link
                href="/admin"
                className="px-4 py-2 border-2 border-brand-purple text-brand-purple rounded-xl font-semibold hover:bg-brand-purple hover:text-white transition-all"
              >
                ← Back to List
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
          <style jsx global>{`
            .admin-html-content {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
            .admin-html-content .header {
              background: linear-gradient(135deg, #6B46C1 0%, #4C1D95 100%);
              color: white;
              padding: 30px;
              border-radius: 12px;
              margin-bottom: 30px;
            }
            .admin-html-content .section {
              background: white;
              margin-bottom: 30px;
              padding: 25px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            .admin-html-content .section-title {
              color: #6B46C1;
              font-size: 22px;
              font-weight: bold;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #FF6B4A;
            }
            .admin-html-content .question {
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 1px solid #e5e7eb;
            }
            .admin-html-content .question-label {
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 8px;
            }
            .admin-html-content .question-answer {
              color: #4b5563;
              padding-left: 20px;
              margin-top: 5px;
            }
          `}</style>
          <div
            className="admin-html-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </div>
  );
}
