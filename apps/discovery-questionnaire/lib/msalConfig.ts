import { Configuration, PopupRequest } from "@azure/msal-browser";

const getRedirectUri = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI || "http://localhost:3001";
};

export const msalEnv = {
  clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || "",
  tenantId: process.env.NEXT_PUBLIC_AZURE_TENANT_ID || "",
  redirectUri: process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI || "",
  clientEmailDomain: process.env.NEXT_PUBLIC_CLIENT_EMAIL_DOMAIN || "",
};

export function isMsalConfigured() {
  // Tenant ID can be a GUID or verified domain (e.g. contoso.onmicrosoft.com)
  return Boolean(msalEnv.clientId && msalEnv.tenantId);
}

export const msalConfig: Configuration = {
  auth: {
    clientId: msalEnv.clientId,
    authority: `https://login.microsoftonline.com/${msalEnv.tenantId}`,
    redirectUri: getRedirectUri(),
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest: PopupRequest = {
  scopes: ["User.Read"],
};

export const CLIENT_EMAIL_DOMAIN = msalEnv.clientEmailDomain;
