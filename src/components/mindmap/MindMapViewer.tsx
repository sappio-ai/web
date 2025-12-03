'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
} from 'reactflow'
import MindMapNodeComponent from './MindMapNode'
import MindMapEdgeComponent from './MindMapEdge'
import type { MindMapNode } from '@/lib/types/mindmap'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

interface MindMapViewerProps {
  nodes: MindMapNode[]
  onNodeClick?: (node: MindMapNode) => void
  onNodeDragEnd?: (nodeId: string, newParentId: string | null) => void
  selectedNodeId?: string | null
  readOnly?: boolean
}

const nodeTypes = {
  mindmapNode: MindMapNodeComponent,
}

const edgeTypes = {
  mindmapEdge: MindMapEdgeComponent,
}

export default function MindMapViewer({
  nodes: mindmapNodes,
  onNodeClick,
  selectedNodeId,
  readOnly = false,
}: MindMapViewerProps) {
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set())
  const [userPositions, setUserPositions] = useState<Map<string, { x: number; y: number }>>(new Map())

  // Build hierarchy map
  const hierarchyMap = useMemo(() => {
    const map = new Map<string | null, MindMapNode[]>()
    mindmapNodes.forEach((node) => {
      const parentId = node.parentId
      if (!map.has(parentId)) {
        map.set(parentId, [])
      }
      map.get(parentId)!.push(node)
    })
    console.log('Hierarchy map:', {
      totalNodes: mindmapNodes.length,
      rootNodes: map.get(null)?.length || 0,
      mapKeys: Array.from(map.keys()),
    })
    return map
  }, [mindmapNodes])

  // Check if node has children
  const hasChildren = useCallback(
    (nodeId: string) => {
      return hierarchyMap.has(nodeId) && hierarchyMap.get(nodeId)!.length > 0
    },
    [hierarchyMap]
  )

  // Get all descendants of a node
  const getDescendants = useCallback(
    (nodeId: string): string[] => {
      const descendants: string[] = []
      const children = hierarchyMap.get(nodeId) || []

      children.forEach((child) => {
        descendants.push(child.id)
        descendants.push(...getDescendants(child.id))
      })

      return descendants
    },
    [hierarchyMap]
  )

  // Toggle collapse state
  const handleToggleCollapse = useCallback((nodeId: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }, [])

  // Convert MindMapNodes to React Flow nodes with layout
  const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []
    const nodePositions = new Map<string, { x: number; y: number; level: number }>()

    // Calculate positions using a proper tree layout algorithm
    const HORIZONTAL_SPACING = 300
    const VERTICAL_SPACING = 140

    // First pass: calculate subtree widths
    const subtreeWidths = new Map<string, number>()

    function calculateSubtreeWidth(nodeId: string): number {
      if (subtreeWidths.has(nodeId)) {
        return subtreeWidths.get(nodeId)!
      }

      const children = hierarchyMap.get(nodeId) || []
      if (children.length === 0 || collapsedNodes.has(nodeId)) {
        subtreeWidths.set(nodeId, 1)
        return 1
      }

      const childrenWidth = children.reduce(
        (sum, child) => sum + calculateSubtreeWidth(child.id),
        0
      )
      subtreeWidths.set(nodeId, childrenWidth)
      return childrenWidth
    }

    // Calculate widths for all nodes
    mindmapNodes.forEach((node) => calculateSubtreeWidth(node.id))

    // Second pass: position nodes
    function layoutNode(
      node: MindMapNode,
      level: number,
      leftBound: number
    ): number {
      const y = level * VERTICAL_SPACING
      const width = subtreeWidths.get(node.id) || 1

      // Position children first to calculate this node's center
      const children = hierarchyMap.get(node.id) || []
      let childX = leftBound

      if (children.length > 0 && !collapsedNodes.has(node.id)) {
        children.forEach((child) => {
          childX = layoutNode(child, level + 1, childX)
        })
      }

      // Center this node over its children (or at leftBound if no children)
      const x = leftBound + (width * HORIZONTAL_SPACING) / 2 - HORIZONTAL_SPACING / 2

      nodePositions.set(node.id, { x, y, level })

      return leftBound + width * HORIZONTAL_SPACING
    }

    // Start with root nodes (nodes with no parent)
    const rootNodes = hierarchyMap.get(null) || []
    let currentX = 0
    rootNodes.forEach((rootNode) => {
      currentX = layoutNode(rootNode, 0, currentX)
      currentX += HORIZONTAL_SPACING // Add spacing between root trees
    })

    // Handle orphaned nodes (nodes whose parents don't exist or weren't positioned)
    mindmapNodes.forEach((node) => {
      if (!nodePositions.has(node.id)) {
        // This node wasn't positioned, treat it as a root
        currentX = layoutNode(node, 0, currentX)
        currentX += HORIZONTAL_SPACING
      }
    })

    // Create React Flow nodes
    mindmapNodes.forEach((node) => {
      const position = nodePositions.get(node.id)
      if (!position) {
        console.warn('Node not positioned:', node.id, node.title)
        return
      }

      // Check if node should be hidden (parent is collapsed)
      let isHidden = false
      let currentParentId = node.parentId
      while (currentParentId) {
        if (collapsedNodes.has(currentParentId)) {
          isHidden = true
          break
        }
        const parentNode = mindmapNodes.find((n) => n.id === currentParentId)
        currentParentId = parentNode?.parentId || null
      }

      if (isHidden) return

      nodes.push({
        id: node.id,
        type: 'mindmapNode',
        position: { x: position.x, y: position.y },
        data: {
          node,
          isSelected: node.id === selectedNodeId,
          isCollapsed: collapsedNodes.has(node.id),
          hasChildren: hasChildren(node.id),
          onToggleCollapse: () => handleToggleCollapse(node.id),
          onEdit: () => {
            if (onNodeClick) {
              onNodeClick(node)
            }
          },
        },
        draggable: !readOnly,
      })

      // Create edge to parent if parent exists and is visible
      if (node.parentId && !collapsedNodes.has(node.parentId)) {
        edges.push({
          id: `${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
          type: 'mindmapEdge',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#5A5FF0',
            width: 16,
            height: 16,
          },
        })
      }
    })

    return { nodes, edges }
  }, [
    mindmapNodes,
    hierarchyMap,
    collapsedNodes,
    selectedNodeId,
    hasChildren,
    handleToggleCollapse,
    readOnly,
  ])

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges)

  // Custom node change handler to track user-moved positions
  const handleNodesChange = useCallback(
    (changes: any[]) => {
      changes.forEach((change) => {
        // Track position changes when dragging ends (dragging is undefined or false)
        if (change.type === 'position' && change.position && !change.dragging) {
          console.log('Saving position for node:', change.id, change.position)
          setUserPositions((prev) => {
            const next = new Map(prev)
            next.set(change.id, change.position)
            return next
          })
        }
      })
      onNodesChange(changes)
    },
    [onNodesChange]
  )

  // Update nodes and edges when flowNodes/flowEdges change (for collapse/expand)
  // But preserve user-moved positions
  useEffect(() => {
    console.log('Updating nodes, userPositions size:', userPositions.size)
    setNodes((currentNodes) => {
      // Create a map of current positions (includes user moves)
      const currentPositionMap = new Map(
        currentNodes.map((n) => [n.id, n.position])
      )

      // Update nodes but keep user-moved positions
      return flowNodes.map((newNode) => {
        const userPos = userPositions.get(newNode.id)
        const currentPos = currentPositionMap.get(newNode.id)
        const finalPos = userPos || currentPos || newNode.position
        
        if (userPos) {
          console.log(`Node ${newNode.id} using user position:`, userPos)
        }
        
        return {
          ...newNode,
          position: finalPos,
        }
      })
    })
    setEdges(flowEdges)
  }, [flowNodes, flowEdges, setNodes, setEdges, userPositions])

  // Handle node click
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const mindmapNode = mindmapNodes.find((n) => n.id === node.id)
      if (mindmapNode && onNodeClick) {
        onNodeClick(mindmapNode)
      }
    },
    [mindmapNodes, onNodeClick]
  )

  return (
    <div 
      className="relative w-full h-[700px] rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#F8FAFB] shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)]"
      role="application"
      aria-label="Interactive mind map visualization"
    >
      {/* Subtle paper texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")'
      }} />

      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, #5A5FF0 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0',
        }} />
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{
          padding: 0.05,
          minZoom: 1.0,
          maxZoom: 2.5,
        }}
        minZoom={0.2}
        maxZoom={1.8}
        defaultViewport={{ x: 0, y: 0, zoom: 2.0 }}
        className="bg-transparent"
        proOptions={{ hideAttribution: true }}
        aria-label="Mind map canvas"
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Controls
          showInteractive={false}
          className="!bg-white !border !border-[#E2E8F0] !rounded-lg !shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
          aria-label="Mind map controls"
        >
          <button 
            className="react-flow__controls-button !border-[#E2E8F0] hover:!bg-[#F1F5F9] !transition-all"
            aria-label="Zoom in"
            title="Zoom in (Ctrl/Cmd + Plus)"
          >
            <ZoomIn className="w-4 h-4 text-[#5A5FF0]" />
          </button>
          <button 
            className="react-flow__controls-button !border-[#E2E8F0] hover:!bg-[#F1F5F9] !transition-all"
            aria-label="Zoom out"
            title="Zoom out (Ctrl/Cmd + Minus)"
          >
            <ZoomOut className="w-4 h-4 text-[#5A5FF0]" />
          </button>
          <button 
            className="react-flow__controls-button !border-[#E2E8F0] hover:!bg-[#F1F5F9] !transition-all"
            aria-label="Fit view"
            title="Fit view to screen"
          >
            <Maximize2 className="w-4 h-4 text-[#5A5FF0]" />
          </button>
        </Controls>
        <MiniMap
          nodeColor="#5A5FF0"
          maskColor="rgba(248, 250, 251, 0.95)"
          className="!bg-white !border !border-[#E2E8F0] !rounded-lg !shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
          aria-label="Mind map minimap overview"
        />
      </ReactFlow>


    </div>
  )
}
