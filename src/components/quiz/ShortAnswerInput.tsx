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
        className="w-full px-6 py-4 bg-[#F8FAFB] border-2 border-[#CBD5E1] rounded-lg text-[#1A1D2E] placeholder-[#94A3B8] focus:outline-none focus:border-[#5A5FF0] focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[15px]"
      />
      {!disabled && (
        <p className="text-[#64748B] text-[13px] mt-2">
          Press Enter to submit your answer
        </p>
      )}
    </div>
  )
}
