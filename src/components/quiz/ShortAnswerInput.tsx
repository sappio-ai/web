'use client'

interface ShortAnswerInputProps {
  value: string
  onChange: (value: string) => void
  disabled: boolean
  onSubmit?: () => void
}

export default function ShortAnswerInput({
  value,
  onChange,
  disabled,
  onSubmit,
}: ShortAnswerInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled && value.trim() && onSubmit) {
      onSubmit()
    }
  }

  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        placeholder="Type your answer here..."
        className="w-full px-6 py-4 bg-white/5 border-2 border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#a8d5d5] focus:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {!disabled && (
        <p className="text-gray-400 text-sm mt-2">
          Press Enter to submit your answer
        </p>
      )}
    </div>
  )
}
