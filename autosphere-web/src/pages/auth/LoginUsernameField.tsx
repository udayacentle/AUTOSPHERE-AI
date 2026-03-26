import { useRef, useState, useEffect, useMemo } from 'react'

type Props = {
  id: string
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder: string
  name?: string
  autoComplete?: string
}

/**
 * Username/email field: suggestions appear only when the field is focused/clicked;
 * choosing a suggestion fills the field (same pattern as common login UIs).
 */
export function LoginUsernameField({
  id,
  value,
  onChange,
  suggestions,
  placeholder,
  name = 'username',
  autoComplete = 'username',
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const suppressOpenUntilRef = useRef(0)
  const [open, setOpen] = useState(false)

  const tryOpenPanel = () => {
    if (Date.now() < suppressOpenUntilRef.current) return
    if (suggestions.length > 0) setOpen(true)
  }

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return suggestions
    return suggestions.filter(
      (u) => u.toLowerCase().includes(q) || u.toLowerCase().startsWith(q)
    )
  }, [suggestions, value])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  useEffect(() => {
    const v = value.trim().toLowerCase()
    if (!v) return
    if (suggestions.some((s) => s.trim().toLowerCase() === v)) {
      setOpen(false)
    }
  }, [value, suggestions])

  const showPanel = open && suggestions.length > 0 && filtered.length > 0

  return (
    <div className="login-username-field-wrap" ref={wrapRef}>
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => tryOpenPanel()}
        onClick={() => tryOpenPanel()}
        aria-expanded={showPanel}
        aria-controls={showPanel ? `${id}-suggestions` : undefined}
        aria-autocomplete={suggestions.length ? 'list' : undefined}
      />
      {showPanel && (
        <ul
          id={`${id}-suggestions`}
          className="login-username-suggestions"
          role="listbox"
          aria-label="Saved accounts"
        >
          {filtered.map((u) => (
            <li key={u} role="presentation">
              <button
                type="button"
                role="option"
                className="login-username-suggestion-item"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  suppressOpenUntilRef.current = Date.now() + 400
                  onChange(u)
                  setOpen(false)
                  requestAnimationFrame(() => {
                    inputRef.current?.blur()
                  })
                }}
              >
                {u}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
