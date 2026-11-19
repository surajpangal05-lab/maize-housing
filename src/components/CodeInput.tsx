'use client'

import { useEffect, useRef } from 'react'

interface CodeInputProps {
  value: string[]
  onChange: (digits: string[]) => void
  disabled?: boolean
  autoFocus?: boolean
}

const LENGTH = 6

export const EMPTY_CODE = Array<string>(LENGTH).fill('')

export default function CodeInput({ value, onChange, disabled, autoFocus = true }: CodeInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus()
  }, [autoFocus])

  const handleChange = (index: number, raw: string) => {
    if (!/^\d*$/.test(raw)) return
    const next = [...value]
    next[index] = raw.slice(-1)
    onChange(next)
    if (raw && index < LENGTH - 1) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH)
    if (!pasted) return
    const next = Array.from({ length: LENGTH }, (_, i) => pasted[i] || '')
    onChange(next)
    refs.current[Math.min(pasted.length, LENGTH - 1)]?.focus()
  }

  return (
    <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
      {value.map((digit, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-[#00274C] focus:ring-0 focus:outline-none transition-colors disabled:bg-gray-50"
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  )
}
