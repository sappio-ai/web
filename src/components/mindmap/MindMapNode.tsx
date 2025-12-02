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

      {/* Hexagonal card design */}
      <div
        className={`
          relative w-[280px] p-5 transition-all duration-300
          bg-[#161b22] border-l-4
          clip-path-hexagon
          ${
            isSelected
              ? 'border-l-[#a8d5d5] shadow-[0_8px_32px_rgba(168,213,213,0.3)] scale-[1.02]'
              : 'border-l-[#30363d] hover:border-l-[#a8d5d5]/60 hover:shadow-[0_4px_20px_rgba(168,213,213,0.15)]'
          }
        `}
        style={{
          clipPath: 'polygon(0 10%, 100% 0, 100% 90%, 0 100%)',
        }}
      >
        {/* Animated scan line effect */}
        {isSelected && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#a8d5d5]/10 to-transparent animate-scan" />
          </div>
        )}

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
                      ? 'bg-[#21262d] border-[#30363d] text-gray-500 hover:border-[#a8d5d5]/50 hover:text-[#a8d5d5]'
                      : 'bg-[#a8d5d5]/10 border-[#a8d5d5]/30 text-[#a8d5d5] hover:bg-[#a8d5d5]/20'
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
              <h4 className="text-sm font-semibold text-white leading-tight break-words">
                {node.title}
              </h4>
            </div>

            {/* Edit button on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                data.onEdit()
              }}
              className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center bg-[#21262d] border border-[#30363d] text-gray-500 opacity-0 group-hover:opacity-100 hover:border-[#a8d5d5]/50 hover:text-[#a8d5d5] transition-all duration-200"
              aria-label={`Edit ${node.title}`}
              title="Edit node (Enter)"
            >
              <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Content preview */}
          {node.content && (
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 pl-10">
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
                    className="w-2 h-2 rounded-full bg-[#a8d5d5]/30 border border-[#a8d5d5]/50"
                  />
                ))}
              </div>
              <span className="text-[10px] text-[#a8d5d5]/60 uppercase tracking-wider">
                Collapsed
              </span>
            </div>
          )}
        </div>

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
          <div className={`absolute -top-6 -right-6 w-12 h-12 rotate-45 bg-gradient-to-br from-[#a8d5d5]/20 to-transparent transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
        </div>

        {/* Bottom glow line */}
        <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a8d5d5] to-transparent transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
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

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default memo(MindMapNodeComponent)
