"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Country {
  code: string
  name: string
  length: number // expected phone number length
}

const COUNTRIES: Country[] = [
  { code: "+1", name: "United States", length: 10 },
  { code: "+44", name: "United Kingdom", length: 10 },
  { code: "+61", name: "Australia", length: 9 },
  { code: "+91", name: "India", length: 10 },
  { code: "+81", name: "Japan", length: 10 },
  { code: "+49", name: "Germany", length: 10 },
  { code: "+33", name: "France", length: 9 },
  { code: "+971", name: "UAE", length: 9 },
  { code: "+92", name: "Pakistan", length: 10 },
  { code: "+94", name: "Sri Lanka", length: 9 },
]

interface PhoneInputProps {
  label?: string
  value: { countryCode: string; phone: string }
  onChange: (val: { countryCode: string; phone: string }) => void
  required?: boolean
  error?: string
}

export function PhoneInput({
  label = "Phone Number",
  value,
  onChange,
  required,
  error,
}: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState(value.countryCode || "+91")
  const [phone, setPhone] = useState(value.phone || "")
  const [validationMsg, setValidationMsg] = useState<string | null>(null)

  // ✅ Auto-detect country from IP
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch("https://ipapi.co/json")
        const data = await res.json()
        const code = data.country_calling_code || "+91"
        if (COUNTRIES.some((c) => c.code === code)) {
          setCountryCode(code)
        }
      } catch (err) {
        console.warn("Geo detection failed, defaulting to +91")
      }
    }
    detectCountry()
  }, [])

  useEffect(() => {
    onChange({ countryCode, phone })
  }, [countryCode, phone])

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode)

  const handlePhoneChange = (val: string) => {
    const numeric = val.replace(/\D/g, "") // keep only digits
    setPhone(numeric)

    if (selectedCountry) {
      if (numeric.length > selectedCountry.length) {
        setValidationMsg(`Too long: expected ${selectedCountry.length} digits`)
      } else if (numeric.length < selectedCountry.length) {
        setValidationMsg(`Enter ${selectedCountry.length}-digit number`)
      } else {
        setValidationMsg(null)
      }
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="flex gap-2">
        {/* Country Code Selector */}
        <select
          className="border border-border bg-background rounded-lg px-2 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
        >
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.code} {country.name}
            </option>
          ))}
        </select>

        {/* Phone Number Input */}
        <Input
          type="tel"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder={
            selectedCountry ? `e.g., ${"9".repeat(selectedCountry.length)}` : "Phone number"
          }
          className={cn(
            "flex-1 border-border focus:ring-2 focus:ring-primary",
            (error || validationMsg) && "border-red-500 focus:ring-red-500"
          )}
          inputMode="numeric"
        />
      </div>

      {validationMsg && <p className="text-xs text-red-500 mt-1">{validationMsg}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
