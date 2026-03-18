const LOGIN_USERNAMES_KEY = 'autosphere-login-usernames'
const MAX_SAVED_USERNAMES = 5

export function loadSavedLoginUsernames(): string[] {
  try {
    const raw = localStorage.getItem(LOGIN_USERNAMES_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as unknown
    if (!Array.isArray(arr)) return []
    return arr
      .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      .map((x) => x.trim())
      .filter((x, i, a) => a.findIndex((y) => y.toLowerCase() === x.toLowerCase()) === i)
      .slice(0, MAX_SAVED_USERNAMES)
  } catch {
    return []
  }
}

export function rememberLoginUsername(username: string) {
  const trimmed = username.trim()
  if (!trimmed) return
  const prev = loadSavedLoginUsernames().filter((x) => x.toLowerCase() !== trimmed.toLowerCase())
  const next = [trimmed, ...prev].slice(0, MAX_SAVED_USERNAMES)
  try {
    localStorage.setItem(LOGIN_USERNAMES_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}
