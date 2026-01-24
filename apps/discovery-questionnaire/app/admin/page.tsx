"use client";

import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionnaireResponse } from "@/types";
import Link from "next/link";

export default function AdminPage() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    if (accounts.length > 0) {
      loadResponses();
    }
  }, [isAuthenticated, accounts, router]);

  const loadResponses = async () => {
    try {
      const account = accounts[0];
      const userEmail = account.username;

      const res = await fetch("/api/admin/responses", {
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
        throw new Error("Failed to load responses");
      }

      const data = await res.json();
      setResponses(data);
    } catch (err: any) {
      setError(err.message || "Failed to load responses");
    } finally {
      setLoading(false);
    }
  };

  const filteredResponses = responses.filter((r) => {
    const search = searchTerm.toLowerCase();
    return (
      r.metadata.userEmail.toLowerCase().includes(search) ||
      r.metadata.userName.toLowerCase().includes(search) ||
      r.id.toLowerCase().includes(search)
    );
  });

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-elevated p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-text mb-2">Access Denied</h2>
          <p className="text-neutral-muted mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-brand-purple text-white rounded-xl font-semibold hover:bg-brand-purpleDark transition-all"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <div className="bg-white border-b border-neutral-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold text-brand-purple">Admin - Questionnaire Responses</h1>
              <div className="h-1 w-16 bg-accent-coral rounded-full mt-1"></div>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-brand-purple hover:bg-brand-purple/10 rounded-xl transition-all"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-neutral-border rounded-xl bg-white text-neutral-text focus:ring-2 focus:ring-accent-coral focus:border-accent-coral transition-all"
            />
          </div>

          <div className="mb-4 text-sm text-neutral-muted">
            Showing {filteredResponses.length} of {responses.length} response{responses.length !== 1 ? "s" : ""}
          </div>

          {filteredResponses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-muted">No responses found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-neutral-border">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-text">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-text">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-text">Progress</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-text">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-text">Completed</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-text">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResponses.map((response) => (
                    <tr
                      key={response.id}
                      className="border-b border-neutral-border hover:bg-neutral-bg transition-colors"
                    >
                      <td className="py-4 px-4 text-neutral-text font-medium">
                        {response.metadata.userName || "N/A"}
                      </td>
                      <td className="py-4 px-4 text-neutral-text">{response.metadata.userEmail}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-neutral-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent-coral transition-all"
                              style={{ width: `${response.progress.percentComplete}%` }}
                            />
                          </div>
                          <span className="text-sm text-neutral-muted">{response.progress.percentComplete}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            response.completedAt
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {response.completedAt ? "Completed" : "In Progress"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-neutral-muted">
                        {response.completedAt
                          ? new Date(response.completedAt).toLocaleDateString()
                          : response.lastUpdated
                          ? new Date(response.lastUpdated).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-4 px-4">
                        <Link
                          href={`/admin/${encodeURIComponent(response.id)}`}
                          className="px-4 py-2 bg-brand-purple text-white rounded-lg font-semibold hover:bg-brand-purpleDark transition-all text-sm"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
