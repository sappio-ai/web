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
      <div className="relative group animate-in fade-in duration-500">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Orb pose="processing-thinking" size="lg" />
            <p className="text-gray-400 mt-4">Loading mind map...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="relative group animate-in fade-in duration-500">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-red-500/30 shadow-2xl p-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Orb pose="error-confused" size="lg" />
            <p className="text-red-400 mt-4 font-semibold">Error loading mind map</p>
            <p className="text-gray-400 mt-2 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="relative group animate-in fade-in duration-500">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Orb pose="empty-state-inviting" size="lg" />
            <p className="text-gray-400 mt-4 text-center">
              No mind map available yet
            </p>
            <p className="text-gray-500 mt-2 text-sm text-center max-w-md">
              Mind maps are automatically generated when you upload study material.
              Try uploading a document to get started!
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Main content - for now just show the nodes in a list
  // This will be replaced with the actual MindMapViewer component in task 5
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with stats */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-[#a8d5d5]/10 to-[#f5e6d3]/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
        <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
          <div className="flex items-center gap-3">
            <Orb pose="explorer-magnifying-glass" size="sm" />
            <div>
              <h3 className="text-xl font-bold text-white">{data.mindmap.title}</h3>
              <p className="text-gray-400 text-sm mt-1">
                {data.nodes.length} of {data.nodeCount} nodes
                {data.isLimited && (
                  <span className="text-orange-400 ml-2">
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
        <div className="relative group z-50">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
          <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-orange-500/30 shadow-2xl p-6">
            <div className="flex items-start gap-4">
              <Orb pose="upgrade-prompt" size="sm" />
              <div className="flex-1">
                <h4 className="text-lg font-bold text-orange-400 mb-2">
                  Upgrade to see more nodes
                </h4>
                <p className="text-gray-300 text-sm">
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
