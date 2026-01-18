'use client'

import { useState, useEffect, useRef } from 'react'
import Orb from '@/components/orb/Orb'
import MindMapViewer from '@/components/mindmap/MindMapViewer'
import NodeEditor from '@/components/mindmap/NodeEditor'
import { AnalyticsService } from '@/lib/services/AnalyticsService'
import type { MindMap, MindMapNode } from '@/lib/types/mindmap'
import GenerateMoreButton from '@/components/study-packs/GenerateMoreButton'
import UpgradePrompt from '@/components/paywall/UpgradePrompt'
import DemoPrompt from '@/components/demo/DemoPrompt'
import type { PlanLimits } from '@/lib/types/usage'

interface MindMapTabProps {
  packId: string
  userPlan?: string
  isDemo?: boolean
}

interface MindMapData {
  mindmap: MindMap
  nodes: MindMapNode[]
  nodeCount: number
  nodeLimit: number
  isLimited: boolean
}

export default function MindMapTab({ packId, userPlan = 'free', isDemo = false }: MindMapTabProps) {
  const [data, setData] = useState<MindMapData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const hasTrackedView = useRef(false)
  const [nodeCount, setNodeCount] = useState<number>(0)
  const [limits, setLimits] = useState<PlanLimits | null>(null)
  const [generationStatus, setGenerationStatus] = useState<any>(null)

  useEffect(() => {
    async function fetchMindMap() {
      if (isDemo) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // First, get the study pack to find the mindmap ID
        // Add cache-busting to ensure fresh data
        const packResponse = await fetch(`/api/study-packs/${packId}?t=${Date.now()}`, {
          cache: 'no-store'
        })
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

        // Use actual nodes array length for accurate count
        setNodeCount(mindmapData.nodes?.length || packData.stats?.mindMapNodeCount || 0)
        // Get generation status from stats
        setGenerationStatus(packData.stats?.generationStatus?.mindmap)

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

    async function fetchLimits() {
      try {
        const limitsUrl = new URL('/api/user/usage', window.location.origin)
        const limitsResponse = await fetch(limitsUrl.toString())
        if (limitsResponse.ok) {
          const limitsData = await limitsResponse.json()
          setLimits(limitsData.limits)
        }
      } catch (error) {
        console.error('Error fetching limits:', error)
      }
    }

    fetchMindMap()
    if (!isDemo) {
      fetchLimits()
    }
  }, [packId, isDemo])

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

  // Demo state - Show prompt immediately
  if (isDemo) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <DemoPrompt
          featureName="Interactive AI Mind Maps"
          description="Sign up to explore the full interactive mind map, edit nodes, and visualize connections."
          icon="mindmap"
          ctaText="Unlock Mind Maps"
          bulletPoints={[
            "Visualize complex topics effortlessly",
            "Edit and customize nodes",
            "Understand relationships between concepts"
          ]}
        />
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

  const canGenerateMore =
    limits?.batchNodesSize !== null &&
    limits?.batchNodesSize !== undefined &&
    nodeCount < (limits?.mindmapNodesLimit || 0)

  // Main content
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Progress Indicator */}
      <div className="text-[14px] text-[#64748B]">
        {!limits ? (
          <span className="inline-block w-24 h-4 bg-[#F1F5F9] rounded animate-pulse" />
        ) : (
          `${nodeCount} / ${limits.mindmapNodesLimit} nodes`
        )}
      </div>

      {/* Generate More Button (Paid Users) */}
      {canGenerateMore && limits && (
        <GenerateMoreButton
          contentType="mindmap"
          studyPackId={packId}
          currentCount={nodeCount}
          maxLimit={limits.mindmapNodesLimit}
          batchSize={limits.batchNodesSize!}
          userPlan={userPlan as 'free' | 'student_pro' | 'pro_plus'}
          generationStatus={generationStatus}
          onGenerated={async (newCount) => {
            setNodeCount(newCount)
            setGenerationStatus({ status: 'completed' })
            // Refresh mind map data without full page reload
            try {
              const packResponse = await fetch(`/api/study-packs/${packId}`)
              if (packResponse.ok) {
                const packData = await packResponse.json()
                const mindmapId = packData.mindMap?.id
                if (mindmapId) {
                  const response = await fetch(`/api/mindmaps/${mindmapId}`)
                  if (response.ok) {
                    const mindmapData = await response.json()
                    setData(mindmapData)
                  }
                }
              }
            } catch (error) {
              console.error('Error refreshing mind map:', error)
            }
          }}
        />
      )}

      {/* Upgrade Prompt (Free Users) */}
      {userPlan === 'free' && (
        <UpgradePrompt
          featureName="Generate More Mind Map Nodes"
          requiredPlan="student_pro"
          benefits={[
            'Generate up to 250 mind map nodes per pack',
            'Add +60 nodes at a time',
            'Comprehensive topic coverage',
            'Priority processing'
          ]}
          currentPlan={userPlan as 'free' | 'student_pro' | 'pro_plus'}
        />
      )}

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
