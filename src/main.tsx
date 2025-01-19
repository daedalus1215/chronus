import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "react-oidc-context";
import { cognitoConfig } from "./auth/config.ts";

const cognitoAuthConfig = {
  authority: cognitoConfig.domain,
  client_id: cognitoConfig.clientId,
  redirect_uri: cognitoConfig.redirectUri,
  response_type: cognitoConfig.responseType,
  scope: cognitoConfig.scope,
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
