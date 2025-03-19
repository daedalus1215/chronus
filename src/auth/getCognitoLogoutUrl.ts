import { cognitoConfig } from "./config";

export const getCognitoLogoutUrl = () => {
  const { domain, clientId, redirectUri } = cognitoConfig;
  return `${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
    redirectUri
    )}`;
};
