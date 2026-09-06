// Dev-server settings only. These values feed `server` and `preview` in vite.config.ts —
// nothing here reaches the production bundle, which is origin-relative by design.
//
// Copy to vite.env.config.ts (gitignored) and edit for local work. The Docker build copies
// this sample into place so that a clean checkout can build without a developer's local file.
export const env = {
  VITE_API_URL: 'http://localhost:3000',
  VITE_PORT: '5173',
  VITE_HOST: '0.0.0.0',
  VITE_BASE_URL: '/',
  VITE_ALLOWED_HOSTS: 'localhost',
};
