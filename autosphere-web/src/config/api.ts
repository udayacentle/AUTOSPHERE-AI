/** Backend base URL. Empty in dev (Vite proxy). Set VITE_API_BASE_URL in .env.production when hosting the SPA separately (e.g. S3). */
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
