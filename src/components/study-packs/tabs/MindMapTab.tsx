'use client'

import { useState, useEffect, useRef } from 'react'
import Orb from '@/components/orb/Orb'
import MindMapViewer from '@/components/mindmap/MindMapViewer'
import NodeEditor from '@/components/mindmap/NodeEditor'
import { AnalyticsService } from '@/lib/services/AnalyticsService'
import type { MindMap, MindMapNode } from '@/lib/types/mindmap'

interface MindMapTabProps {
  packId: string
}

interface MindMapData {
  mindmap: MindMap
  nodes: MindMapNode[]
  nodeCount: number
  nodeLimit: number
  isLimited: boolean
}

export default function MindMapTab({ packId }: MindMapTabProps) {
  const [data, setData] = useState<MindMapData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const hasTrackedView = useRef(false)

  useEffect(() => {
    async function fetchMindMap() {
      try {
        setIsLoading(true)
        setError(null)

        // First, get the study pack to find the mindmap ID
        const packResponse = await fetch(`/api/study-packs/${packId}`)
        if (!packResponse.ok) {
          throw new Error('Failed to fetch study pack')
        }

        const packData = await packResponse.json()
        const mindmapId = packData.mindMap?.id

        if (!mindmapId) {
          setData(null)
          setIsLoading(false)
          return
        }

        // Fetch the mind map data
        const response = await fetch(`/api/mindmaps/${mindmapId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch mind map')
        }

        const mindmapData = await response.json()
        setData(mindmapData)

        // Track map viewed event (only once per mount)
        if (!hasTrackedView.current) {
          AnalyticsService.trackMapViewed(packId, mindmapData.nodeCount)
          hasTrackedView.current = true
        }
      } catch (err) {
        console.error('Error fetching mind map:', err)
        setError(err instanceof Error ? err.message : 'Failed to load mind map')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMindMap()
  }, [packId])

  // Loading state
  if (isLoading) {
    return (
      <div className="relative animate-in fade-in duration-500">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Orb pose="processing-thinking" size="lg" />
            <p className="text-[#64748B] mt-4">Loading mind map...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="relative animate-in fade-in duration-500">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#EF4444]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#EF4444]/30">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Orb pose="error-confused" size="lg" />
            <p className="text-[#EF4444] mt-4 font-semibold">Error loading mind map</p>
            <p className="text-[#64748B] mt-2 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="relative animate-in fade-in duration-500">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Orb pose="empty-state-inviting" size="lg" />
            <p className="text-[#64748B] mt-4 text-center">
              No mind map available yet
            </p>
            <p className="text-[#94A3B8] mt-2 text-sm text-center max-w-md">
              Mind maps are automatically generated when you upload study material.
              Try uploading a document to get started!
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Main content
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with stats */}
      <div className="relative">
        <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <Orb pose="explorer-magnifying-glass" size="sm" />
            <div>
              <h3 className="text-[20px] font-bold text-[#1A1D2E]">{data.mindmap.title}</h3>
              <p className="text-[#64748B] text-[14px] mt-1">
                {data.nodes.length} of {data.nodeCount} nodes
                {data.isLimited && (
                  <span className="text-[#F59E0B] ml-2">
                    (Limited by plan)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan limit warning */}
      {data.isLimited && (
        <div className="relative z-50">
          <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#F59E0B]/40" />
          <div className="relative bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] border border-[#F59E0B]/50">
            <div className="flex items-start gap-4">
              <Orb pose="upgrade-prompt" size="sm" />
              <div className="flex-1">
                <h4 className="text-[18px] font-bold text-[#F59E0B] mb-2">
                  Upgrade to see more nodes
                </h4>
                <p className="text-[#64748B] text-[14px]">
                  Your current plan limits you to {data.nodeLimit} nodes. Upgrade to Student Pro or Pro+ to unlock the full mind map with {data.nodeCount} nodes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mind Map Viewer */}
      <div className="relative z-10">
        <MindMapViewer
          nodes={data.nodes}
          onNodeClick={(node) => {
            setSelectedNode(node)
            setIsEditing(true)
          }}
          selectedNodeId={selectedNode?.id}
          readOnly={false}
        />
      </div>

      {/* Node Editor Modal */}
      {isEditing && selectedNode && (
        <NodeEditor
          node={selectedNode}
          onSave={async (nodeId, updates) => {
            // Call API to update node
            const response = await fetch(
              `/api/mindmaps/${data.mindmap.id}/nodes/${nodeId}`,
              {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
              }
            )

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || 'Failed to update node')
            }

            // Get the updated node from API response
            const result = await response.json()
            const updatedNode = result.node

            // Update local state with the full updated node
            setData((prev) => {
              if (!prev) return prev
              return {
                ...prev,
                nodes: prev.nodes.map((n) =>
                  n.id === nodeId
                    ? {
                        ...n,
                        title: updatedNode.title,
                        content: updatedNode.content,
                      }
                    : n
                ),
              }
            })

            // Also update the selected node
            setSelectedNode((prev) =>
              prev?.id === nodeId
                ? {
                    ...prev,
                    title: updatedNode.title,
                    content: updatedNode.content,
                  }
                : prev
            )

            // Track edit event
            AnalyticsService.trackMapEdited(nodeId, 'edit', packId)

            // Close editor
            setIsEditing(false)
            setSelectedNode(null)
          }}
          onCancel={() => {
            setIsEditing(false)
            setSelectedNode(null)
          }}
          mode="modal"
        />
      )}
    </div>
  )
}
