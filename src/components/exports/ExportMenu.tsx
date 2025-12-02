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
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] text-white hover:shadow-lg hover:shadow-[#a8d5d5]/30 hover:scale-105"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/20 to-[#8bc5c5]/20 rounded-xl blur-lg" />
            
            {/* Menu content */}
            <div className="relative bg-[#161b22] border-2 border-[#30363d] rounded-xl shadow-2xl p-3 space-y-2">
              {/* Exporting indicator */}
              {isExporting && (
                <div className="bg-[#a8d5d5]/10 border border-[#a8d5d5]/30 rounded-lg p-4 flex items-center gap-3 animate-in slide-in-from-top duration-200">
                  <Orb pose="packaging-wrapping" size="sm" />
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">Preparing your export...</p>
                    <p className="text-xs text-gray-400 mt-0.5">This will only take a moment</p>
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
                          ? 'bg-orange-500/10 border border-orange-500/30 cursor-not-allowed'
                          : 'bg-[#0d1117] border border-[#30363d] hover:border-[#a8d5d5]/50 hover:bg-[#a8d5d5]/5'
                      }
                      ${isExportingThis ? 'opacity-75' : ''}
                    `}
                  >
                    {isExportingThis ? (
                      <Loader2 className="w-5 h-5 text-[#a8d5d5] animate-spin flex-shrink-0 mt-0.5" />
                    ) : (
                      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${option.premium ? 'text-orange-400' : 'text-[#a8d5d5]'}`} />
                    )}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${option.premium ? 'text-orange-400' : 'text-white'}`}>
                          {option.label}
                        </span>
                        {option.premium && (
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold">
                              PRO
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </button>
                )
              })}

              {/* Success message */}
              {success && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-3 animate-in slide-in-from-top duration-200">
                  <Orb pose="delivery-gift" size="sm" />
                  <p className="text-sm text-green-400 flex-1">{success}</p>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 animate-in slide-in-from-top duration-200">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
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
