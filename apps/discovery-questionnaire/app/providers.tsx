"use client";

import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { isMsalConfigured, msalConfig, msalEnv } from "@/lib/msalConfig";
import { useEffect, useState } from "react";

let msalInstance: PublicClientApplication | null = null;

function getMsalInstance() {
  if (!msalInstance) {
    try {
      msalInstance = new PublicClientApplication(msalConfig);
      msalInstance.initialize();
    } catch (error) {
      console.error("MSAL initialization error:", error);
      // Return a minimal instance for preview purposes
    }
  }
  return msalInstance;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [instance, setInstance] = useState<PublicClientApplication | null>(null);

  useEffect(() => {
    try {
      if (!isMsalConfigured()) {
        // Don't initialize MSAL if env isn't configured; render a clear message instead.
        setInstance(null);
        return;
      }
      const msal = getMsalInstance();
      setInstance(msal);
    } catch (error) {
      console.error("Failed to initialize MSAL:", error);
      // Continue without MSAL for preview
    }
  }, []);

  if (!instance) {
    if (!isMsalConfigured()) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white rounded-lg shadow p-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Configuration required
            </h1>
            <p className="text-gray-700 mb-4">
              Azure AD / Entra ID settings are missing. Update{" "}
              <code className="bg-gray-100 px-1 rounded">apps/discovery-questionnaire/.env.local</code>{" "}
              with valid values, then restart the dev server.
            </p>
            <div className="text-sm text-gray-700 space-y-2">
              <div>
                <strong>Required:</strong>
                <ul className="list-disc pl-5 mt-1">
                  <li>NEXT_PUBLIC_AZURE_CLIENT_ID</li>
                  <li>NEXT_PUBLIC_AZURE_TENANT_ID</li>
                </ul>
              </div>
              <div className="bg-gray-50 border rounded p-3">
                <div className="font-mono break-all">
                  NEXT_PUBLIC_AZURE_CLIENT_ID={msalEnv.clientId || "(empty)"}
                </div>
                <div className="font-mono break-all">
                  NEXT_PUBLIC_AZURE_TENANT_ID={msalEnv.tenantId || "(empty)"}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  }

  return <MsalProvider instance={instance}>{children}</MsalProvider>;
}
