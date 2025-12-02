/**
 * Mind Map Types
 * TypeScript interfaces for mind map data structures
 */

import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow'

/**
 * Mind Map database record
 */
export interface MindMap {
  id: string
  studyPackId: string
  title: string
  layoutJson: {
    nodes: any[]
  }
  createdAt: string
  updatedAt: string
}

/**
 * Mind Map Node database record
 */
export interface MindMapNode {
  id: string
  mindmapId: string
  parentId: string | null
  title: string
  content: string | null
  orderIndex: number
  sourceChunkIds: number[]
}

/**
 * React Flow node data for mind map nodes
 */
export interface MindMapNodeData {
  node: MindMapNode
  isSelected: boolean
  isCollapsed: boolean
  hasChildren: boolean
  onToggleCollapse: () => void
  onEdit: () => void
}

/**
 * React Flow node type for mind map
 */
export type MindMapReactFlowNode = ReactFlowNode<MindMapNodeData>

/**
 * React Flow edge type for mind map
 */
export type MindMapReactFlowEdge = ReactFlowEdge

/**
 * Mind Map with nodes (API response)
 */
export interface MindMapWithNodes {
  mindmap: MindMap
  nodes: MindMapNode[]
  nodeCount: number
  nodeLimit: number
}

/**
 * Node update payload
 */
export interface NodeUpdatePayload {
  title?: string
  content?: string
  parentId?: string | null
}
