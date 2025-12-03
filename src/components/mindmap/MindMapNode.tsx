'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import type { MindMapNode } from '@/lib/types/mindmap'
import { ChevronDown, ChevronRight, Edit3 } from 'lucide-react'

interface MindMapNodeProps {
  data: {
    node: MindMapNode
    isSelected: boolean
    isCollapsed: boolean
    hasChildren: boolean
    onToggleCollapse: () => void
    onEdit: () => void
  }
}

function MindMapNodeComponent({ data }: MindMapNodeProps) {
  const { node, isSelected, isCollapsed, hasChildren, onToggleCollapse } = data

  return (
    <div 
      className="relative group"
      role="treeitem"
      aria-expanded={hasChildren ? !isCollapsed : undefined}
      aria-selected={isSelected}
      aria-label={`Mind map node: ${node.title}`}
    >
      {/* Connection handles - small and non-interactive */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-transparent !border-0 !opacity-0"
        style={{ pointerEvents: 'none', left: '50%', transform: 'translateX(-50%)' }}
        aria-hidden="true"
      />

      {/* Paper stack effect */}
      <div className="absolute top-[3px] left-0 right-0 h-full bg-white/60 rounded-lg border border-[#CBD5E1]/40" />
      
      {/* Main card */}
      <div
        className={`
          relative w-[280px] p-5 transition-all duration-200
          bg-white rounded-lg border-l-4 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)]
          ${
            isSelected
              ? 'border-l-[#5A5FF0] shadow-[0_4px_16px_rgba(90,95,240,0.15)] scale-[1.02]'
              : 'border-l-[#CBD5E1] hover:border-l-[#5A5FF0]/60 hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)]'
          }
        `}
      >

        {/* Content */}
        <div className="relative z-10 space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleCollapse()
                }}
                className={`
                  flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center
                  transition-all duration-200 border
                  ${
                    isCollapsed
                      ? 'bg-[#F8FAFB] border-[#CBD5E1] text-[#64748B] hover:border-[#5A5FF0]/50 hover:text-[#5A5FF0]'
                      : 'bg-[#5A5FF0]/10 border-[#5A5FF0]/30 text-[#5A5FF0] hover:bg-[#5A5FF0]/20'
                  }
                `}
                aria-label={isCollapsed ? 'Expand node' : 'Collapse node'}
                aria-expanded={!isCollapsed}
                title={isCollapsed ? 'Expand to show children' : 'Collapse to hide children'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            )}
            
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-semibold text-[#1A1D2E] leading-tight break-words">
                {node.title}
              </h4>
            </div>

            {/* Edit button on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                data.onEdit()
              }}
              className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center bg-[#F8FAFB] border border-[#CBD5E1] text-[#64748B] opacity-0 group-hover:opacity-100 hover:border-[#5A5FF0]/50 hover:text-[#5A5FF0] transition-all duration-200"
              aria-label={`Edit ${node.title}`}
              title="Edit node (Enter)"
            >
              <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Content preview */}
          {node.content && (
            <p className="text-[12px] text-[#64748B] leading-relaxed line-clamp-2 pl-10">
              {node.content}
            </p>
          )}

          {/* Collapsed indicator */}
          {hasChildren && isCollapsed && (
            <div className="flex items-center gap-2 pl-10">
              <div className="flex -space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#5A5FF0]/30 border border-[#5A5FF0]/50"
                  />
                ))}
              </div>
              <span className="text-[10px] text-[#5A5FF0]/60 uppercase tracking-wider font-semibold">
                Collapsed
              </span>
            </div>
          )}
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#5A5FF0] animate-pulse" />
        )}
      </div>

      {/* Output handle - small and non-interactive */}
      {hasChildren && !isCollapsed && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-2 !h-2 !bg-transparent !border-0 !opacity-0"
          style={{ pointerEvents: 'none', left: '50%', transform: 'translateX(-50%)' }}
          aria-hidden="true"
        />
      )}


    </div>
  )
}

export default memo(MindMapNodeComponent)
