'use client'

import { memo } from 'react'
import { BaseEdge, EdgeProps, getSmoothStepPath } from 'reactflow'

function MindMapEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 20,
  })

  return (
    <>
      {/* Outer glow */}
      <BaseEdge
        id={`${id}-glow`}
        path={edgePath}
        style={{
          ...style,
          stroke: '#a8d5d5',
          strokeWidth: 4,
          opacity: 0.1,
          filter: 'blur(4px)',
        }}
      />
      {/* Main edge with dashed style */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: '#a8d5d5',
          strokeWidth: 2,
          opacity: 0.4,
          strokeDasharray: '5,5',
        }}
      />
    </>
  )
}

export default memo(MindMapEdgeComponent)
