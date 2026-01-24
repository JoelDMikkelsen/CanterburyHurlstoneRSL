"use client";

import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { loginRequest } from "@/lib/msalConfig";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isAuthenticated && accounts.length > 0) {
      const account = accounts[0];
      
      // Determine user identity string (prefer email, fallback to username/userPrincipalName)
      const identity = (account as any).email || account.username || "";
      
      // Normalize allowlist: support NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS (comma-separated) or fallback to NEXT_PUBLIC_CLIENT_EMAIL_DOMAIN
      const allowedDomainsEnv = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS || process.env.NEXT_PUBLIC_CLIENT_EMAIL_DOMAIN || "";
      const allowedDomains = allowedDomainsEnv
        .split(",")
        .map(d => d.trim().toLowerCase())
        .filter(d => d.length > 0);
      
      if (allowedDomains.length > 0) {
        // Extract effective domain from identity
        let effectiveDomain = "";
        const id = identity.toLowerCase().trim();
        
        // Handle B2B guest identities: e.g., "joel_mikkelsen_fusion5.com.au#ext#@fusion5.onmicrosoft.com"
        if (id.includes("#ext#") && id.endsWith(".onmicrosoft.com")) {
          const left = id.split("#ext#")[0];
          const lastUnderscore = left.lastIndexOf("_");
          if (lastUnderscore >= 0) {
            effectiveDomain = left.substring(lastUnderscore + 1);
          } else {
            // Fallback: try to extract domain before #ext#
            effectiveDomain = left;
          }
        } else {
          // Standard email format: extract domain after @
          const atIndex = id.indexOf("@");
          if (atIndex >= 0) {
            effectiveDomain = id.substring(atIndex + 1);
          } else {
            effectiveDomain = id;
          }
        }
        
        // Compare domain against allowlist (case-insensitive)
        const isAllowed = allowedDomains.some(allowed => effectiveDomain === allowed);
        
        if (!isAllowed) {
          alert(`Detected domain: ${effectiveDomain}. Access restricted to: ${allowedDomains.join(", ")}.`);
          instance.logout();
          return;
        }
      }

      setIsChecking(false);
      router.push("/questionnaire");
    } else if (!isAuthenticated) {
      setIsChecking(false);
    }
  }, [isAuthenticated, accounts, instance, router]);

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch((error) => {
      console.error("Login error:", error);
    });
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-brand-purple border-t-transparent mx-auto"></div>
          <p className="mt-4 text-neutral-muted font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-elevated overflow-hidden">
          <div className="bg-gradient-to-r from-brand-purple to-brand-purpleDark p-8 sm:p-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              ERP Discovery Questionnaire
            </h1>
            <div className="h-1 w-20 bg-accent-coral rounded-full"></div>
          </div>
          
          <div className="p-8 sm:p-10">
            <p className="text-lg text-neutral-text mb-8 leading-relaxed">
              This questionnaire is designed to gather context for evaluating ERP solutions.
              Your responses will help inform a balanced comparison between NetSuite and
              Microsoft Dynamics 365 Business Central.
            </p>

            <div className="bg-brand-purple/5 border-l-4 border-accent-coral rounded-r-xl p-5 mb-8">
              <p className="text-sm text-neutral-text font-medium">
                <strong className="text-brand-purple">Estimated completion time:</strong> 60-75 minutes
              </p>
              <p className="text-sm text-neutral-text mt-2">
                You can save your progress and return later. All responses are automatically saved.
              </p>
            </div>

            {!isAuthenticated ? (
              <button
                onClick={handleLogin}
                className="w-full bg-accent-coral text-white py-4 px-8 rounded-xl font-semibold text-lg hover:bg-accent-coralDark transition-all duration-200 shadow-card hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-accent-coral focus-visible:ring-offset-2"
              >
                Sign in with Microsoft
              </button>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/questionnaire"
                  className="block w-full bg-accent-coral text-white py-4 px-8 rounded-xl font-semibold text-lg hover:bg-accent-coralDark transition-all duration-200 shadow-card hover:shadow-card-hover text-center focus-visible:ring-2 focus-visible:ring-accent-coral focus-visible:ring-offset-2"
                >
                  Continue to Questionnaire
                </Link>
                {(() => {
                  const account = accounts[0];
                  const identity = (account as any).email || account.username || "";
                  const domain = identity.toLowerCase().split("@")[1];
                  const isAdmin = domain === "fusion5.com.au" || domain === "fusion5.com";
                  return isAdmin ? (
                    <Link
                      href="/admin"
                      className="block w-full border-2 border-brand-purple text-brand-purple py-3 px-8 rounded-xl font-semibold text-base hover:bg-brand-purple hover:text-white transition-all duration-200 text-center focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2"
                    >
                      Admin - View Responses
                    </Link>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
