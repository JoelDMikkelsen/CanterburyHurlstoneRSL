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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ERP Discovery Questionnaire
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              This questionnaire is designed to gather context for evaluating ERP solutions.
              Your responses will help inform a balanced comparison between NetSuite and
              Microsoft Dynamics 365 Business Central.
            </p>

            <div className="bg-blue-50 border-l-4 border-primary-500 p-4 mb-8">
              <p className="text-sm text-gray-700">
                <strong>Estimated completion time:</strong> 45-60 minutes
              </p>
              <p className="text-sm text-gray-700 mt-2">
                You can save your progress and return later. All responses are automatically saved.
              </p>
            </div>

            {!isAuthenticated ? (
              <button
                onClick={handleLogin}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Sign in with Microsoft
              </button>
            ) : (
              <Link
                href="/questionnaire"
                className="block w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center"
              >
                Continue to Questionnaire
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
