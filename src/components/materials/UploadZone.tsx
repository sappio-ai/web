'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import Orb from '../orb/Orb'
import { validateFile } from '@/lib/utils/files'
import { Upload } from 'lucide-react'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  className?: string
}

export default function UploadZone({
  onFileSelect,
  disabled = false,
  className = '',
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    setError(null)

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    onFileSelect(file)
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={className}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative rounded-xl border-2 border-dashed p-8 text-center transition-all
          ${isDragging 
            ? 'border-[#5A5FF0] bg-[#5A5FF0]/10 scale-[1.01] shadow-lg shadow-[#5A5FF0]/20' 
            : 'border-[#CBD5E1] bg-[#F8FAFB]'
          }
          ${disabled 
            ? 'cursor-not-allowed opacity-50' 
            : 'cursor-pointer hover:border-[#5A5FF0]/60 hover:bg-[#5A5FF0]/5'
          }
          ${error ? 'border-[#DC2626] bg-[#FEF2F2]' : ''}
        `}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload file zone"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.webp,.gif"
          onChange={handleFileInput}
          disabled={disabled}
          aria-label="File input"
        />

        <div className="flex flex-col items-center gap-3">
          <Orb
            pose={error ? 'error-confused' : isDragging ? 'upload-ready' : 'neutral'}
            size="md"
          />

          {error ? (
            <div className="text-[#DC2626] text-center">
              <p className="font-semibold text-[15px]">Upload Error</p>
              <p className="text-[14px] mt-1">{error}</p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Upload className={`w-5 h-5 ${isDragging ? 'text-[#5A5FF0]' : 'text-[#64748B]'}`} />
                  <p className="text-[16px] font-bold text-[#1A1D2E]">
                    {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
                  </p>
                </div>
                <p className="text-[14px] text-[#64748B] font-medium">
                  or click to browse
                </p>
              </div>
            </>
          )}
        </div>
        
        {!error && (
          <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
            <p className="text-[12px] text-[#94A3B8] text-center">
              PDF, DOCX, Images (JPG, PNG, WEBP, GIF) • Max 50MB
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
