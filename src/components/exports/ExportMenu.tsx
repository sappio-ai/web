'use client'

import { useState } from 'react'
import { Download, FileText, Table, FileCode, Loader2, XCircle } from 'lucide-react'
import { ExportService } from '@/lib/services/ExportService'
import { AnalyticsService } from '@/lib/services/AnalyticsService'
import Orb from '@/components/orb/Orb'

interface ExportMenuProps {
  studyPackId?: string
  mindmapId?: string
  exportType: 'notes' | 'flashcards' | 'mindmap'
  userPlan: string
}

interface ExportOption {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  premium?: boolean
  action: () => Promise<void>
}

export default function ExportMenu({
  studyPackId,
  mindmapId,
  exportType,
  userPlan,
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportingType, setExportingType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleExport = async (type: string, filename: string, exportFn: () => Promise<Blob>) => {
    const startTime = Date.now()
    
    try {
      setIsExporting(true)
      setExportingType(type)
      setError(null)
      setSuccess(null)

      // Track export triggered
      if (studyPackId) {
        AnalyticsService.trackExportTriggered(type, studyPackId)
      }

      const blob = await exportFn()
      ExportService.downloadBlob(blob, filename)

      // Track export completed
      const duration = Date.now() - startTime
      if (studyPackId) {
        AnalyticsService.trackExportCompleted(type, studyPackId, duration)
      }

      setSuccess(`${filename} downloaded successfully!`)
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(null)
      }, 2000)
    } catch (err) {
      console.error('Export error:', err)
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setIsExporting(false)
      setExportingType(null)
    }
  }

  const exportOptions: Record<string, ExportOption[]> = {
    notes: [
      {
        id: 'pdf',
        label: 'Export as PDF',
        icon: FileText,
        description: 'Download notes as a formatted PDF document',
        action: () =>
          handleExport(
            'pdf',
            'notes.pdf',
            () => ExportService.exportNotesToPDF(studyPackId!)
          ),
      },
    ],
    flashcards: [
      {
        id: 'csv',
        label: 'Export as CSV',
        icon: Table,
        description: 'Download flashcards in CSV format',
        action: () =>
          handleExport(
            'csv',
            'flashcards.csv',
            () => ExportService.exportFlashcardsToCSV(studyPackId!)
          ),
      },
    ],
    mindmap: [
      {
        id: 'markdown',
        label: 'Export as Markdown',
        icon: FileCode,
        description: 'Download mind map as Markdown file',
        action: () =>
          handleExport(
            'markdown',
            'mindmap.md',
            () => ExportService.exportMindMapToMarkdown(mindmapId!)
          ),
      },
    ],
  }

  const options = exportOptions[exportType] || []

  return (
    <div className="relative">
      {/* Export button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[14px] transition-all bg-white hover:bg-[#F8FAFB] text-[#1A1D2E] border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_2px_4px_rgba(15,23,42,0.08)]"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Menu content */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.08)] p-3 space-y-2">
            {/* Exporting indicator */}
            {isExporting && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3 animate-in slide-in-from-top duration-200">
                <Orb pose="packaging-wrapping" size="sm" />
                <div className="flex-1">
                  <p className="text-sm text-[#1A1D2E] font-medium">Preparing your export...</p>
                  <p className="text-xs text-[#64748B] mt-0.5">This will only take a moment</p>
                </div>
              </div>
            )}

              {options.map((option) => {
                const Icon = option.icon
                const isExportingThis = isExporting && exportingType === option.id

                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      if (option.premium && studyPackId) {
                        // Track paywall encounter
                        AnalyticsService.trackUpgradeClicked(
                          `${option.id}-export`,
                          userPlan,
                          studyPackId
                        )
                      } else {
                        option.action()
                      }
                    }}
                    disabled={isExporting || option.premium}
                    className={`
                      w-full flex items-start gap-3 p-3 rounded-lg transition-all duration-200
                      ${
                        option.premium
                          ? 'bg-orange-50 border border-orange-200 cursor-not-allowed'
                          : 'bg-[#F8FAFB] border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-white hover:shadow-[0_1px_3px_rgba(15,23,42,0.08)]'
                      }
                      ${isExportingThis ? 'opacity-75' : ''}
                    `}
                  >
                    {isExportingThis ? (
                      <Loader2 className="w-5 h-5 text-[#5A5FF0] animate-spin flex-shrink-0 mt-0.5" />
                    ) : (
                      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${option.premium ? 'text-orange-500' : 'text-[#5A5FF0]'}`} />
                    )}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-[14px] ${option.premium ? 'text-orange-600' : 'text-[#1A1D2E]'}`}>
                          {option.label}
                        </span>
                        {option.premium && (
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs font-semibold">
                              PRO
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </button>
                )
              })}

            {/* Success message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3 animate-in slide-in-from-top duration-200">
                <Orb pose="delivery-gift" size="sm" />
                <p className="text-sm text-green-700 flex-1">{success}</p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 animate-in slide-in-from-top duration-200">
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2 text-sm text-[#64748B] hover:text-[#1A1D2E] transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
