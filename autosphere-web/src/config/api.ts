/** Backend base URL. Set VITE_API_BASE_URL in `.env.production` before `npm run build` for S3 + EC2. */
function resolveApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim()
  if (fromEnv) return fromEnv
  // Last resort if a build was deployed without .env.production (public API URL only; update when EC2 IP changes)
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    const h = window.location.hostname
    if (
      h === 'a-autosphere-ai.s3-website-us-east-1.amazonaws.com' ||
      h === 'autosphere-ai.s3-website-us-east-1.amazonaws.com'
    ) {
      return 'http://98.93.80.228:3000'
    }
  }
  return ''
}

export const API_BASE = resolveApiBase()
