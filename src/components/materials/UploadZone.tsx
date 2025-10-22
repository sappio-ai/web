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
          relative rounded-xl border-2 border-dashed p-12 text-center transition-all
          ${isDragging 
            ? 'border-[#a8d5d5] bg-[#a8d5d5]/10 scale-[1.02]' 
            : 'border-white/20 bg-white/5'
          }
          ${disabled 
            ? 'cursor-not-allowed opacity-50' 
            : 'cursor-pointer hover:border-[#a8d5d5]/50 hover:bg-white/10'
          }
          ${error ? 'border-red-500/50 bg-red-500/10' : ''}
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

        <div className="flex flex-col items-center gap-4">
          <Orb
            pose={error ? 'error-confused' : isDragging ? 'upload-ready' : 'neutral'}
            size="lg"
          />

          {error ? (
            <div className="text-red-400">
              <p className="font-semibold">Upload Error</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Upload className={`w-5 h-5 ${isDragging ? 'text-[#a8d5d5]' : 'text-gray-400'}`} />
                  <p className="text-lg font-semibold text-white">
                    {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
                  </p>
                </div>
                <p className="text-sm text-gray-400">
                  or click to browse
                </p>
              </div>

              <div className="mt-2 px-4 py-2 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10">
                <p className="text-xs text-gray-300">Supported formats: PDF, DOCX, Images (JPG, PNG, WEBP, GIF)</p>
                <p className="text-xs text-gray-300">Maximum size: 50MB</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
