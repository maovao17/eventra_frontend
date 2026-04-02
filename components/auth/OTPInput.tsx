"use client"

import { useEffect, useMemo, useRef } from "react"

type OTPInputProps = {
  value: string
  length?: number
  disabled?: boolean
  autoFocus?: boolean
  onChange: (value: string) => void
  onComplete?: (value: string) => void
}

const getSanitizedValue = (value: string, length: number) =>
  value.replace(/\D/g, "").slice(0, length)

export default function OTPInput({
  value,
  length = 6,
  disabled = false,
  autoFocus = false,
  onChange,
  onComplete,
}: OTPInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const digits = useMemo(() => {
    const sanitized = getSanitizedValue(value, length)
    return Array.from({ length }, (_, index) => sanitized[index] ?? "")
  }, [length, value])

  useEffect(() => {
    if (!autoFocus || disabled) return

    const firstEmptyIndex = digits.findIndex((digit) => !digit)
    const targetIndex = firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex
    refs.current[targetIndex]?.focus()
  }, [autoFocus, digits, disabled, length])

  const updateValue = (nextValue: string) => {
    const sanitized = getSanitizedValue(nextValue, length)
    onChange(sanitized)

    if (sanitized.length === length) {
      onComplete?.(sanitized)
    }
  }

  const handleChange = (index: number, nextValue: string) => {
    const sanitized = nextValue.replace(/\D/g, "")

    if (!sanitized) {
      const nextDigits = [...digits]
      nextDigits[index] = ""
      updateValue(nextDigits.join(""))
      return
    }

    if (sanitized.length > 1) {
      const nextDigits = [...digits]
      sanitized.split("").forEach((digit, offset) => {
        const targetIndex = index + offset
        if (targetIndex < length) {
          nextDigits[targetIndex] = digit
        }
      })

      updateValue(nextDigits.join(""))
      const nextFocus = Math.min(index + sanitized.length, length - 1)
      refs.current[nextFocus]?.focus()
      return
    }

    const nextDigits = [...digits]
    nextDigits[index] = sanitized
    updateValue(nextDigits.join(""))

    if (index < length - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault()
      refs.current[index - 1]?.focus()
    }

    if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault()
      refs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData("text")
    updateValue(pasted)
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={length}
          value={digit}
          disabled={disabled}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className="h-12 w-12 rounded-2xl border border-[#E1D4CE] bg-white text-center text-lg font-semibold text-[#3B2F2A] outline-none transition focus:border-[#E87D5F] focus:ring-2 focus:ring-[#E87D5F]/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 sm:h-14 sm:w-14"
        />
      ))}
    </div>
  )
}
