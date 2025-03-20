import { cognitoConfig } from "./config";

export const getCognitoLoginUrl = () => {
  const { domain, clientId, redirectUri } = cognitoConfig;
  return `${domain}/login?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;
};
