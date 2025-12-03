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
      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: '#5A5FF0',
          strokeWidth: 2,
          opacity: 0.3,
        }}
      />
    </>
  )
}

export default memo(MindMapEdgeComponent)
