"use client"

interface GuestSelectorProps {
  guests: number
  onGuestsChange: (guests: number) => void
}

export default function GuestSelector({ guests, onGuestsChange }: GuestSelectorProps) {
  const guestOptions = Array.from({ length: 10 }, (_, i) => i + 1)

  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-4">Number of guest(s)</label>
      <div className="flex flex-wrap gap-2">
        {guestOptions.map((num) => (
          <button
            key={num}
            onClick={() => onGuestsChange(num)}
            className={`w-12 h-12 rounded-lg font-medium transition-colors ${
              guests === num
                ? "bg-orange-500 text-white"
                : "bg-background border border-border text-foreground hover:border-primary"
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  )
}
