export interface ScoreCardData {
  type: 'session' | 'quiz'
  accuracy?: number
  score?: number
  cardsReviewed?: number
  streak?: number
  level?: number
  xpEarned?: number
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export async function generateScoreCardImage(data: ScoreCardData): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 400
  const ctx = canvas.getContext('2d')!

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, 600, 400)
  grad.addColorStop(0, '#5A5FF0')
  grad.addColorStop(1, '#8B5CF6')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 600, 400)

  // White rounded card
  roundRect(ctx, 20, 20, 560, 360, 16)
  ctx.fillStyle = '#FFFFFF'
  ctx.fill()

  // "Sappio" branding top-left
  ctx.fillStyle = '#5A5FF0'
  ctx.font = 'bold 22px sans-serif'
  ctx.fillText('Sappio', 44, 58)

  // Main stat
  const mainValue =
    data.type === 'quiz' && data.score != null
      ? `${data.score}`
      : data.accuracy != null
        ? `${data.accuracy}%`
        : '—'
  const mainLabel = data.type === 'quiz' ? 'Quiz Score' : 'Accuracy'

  ctx.fillStyle = '#1A1D2E'
  ctx.font = 'bold 64px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(mainValue, 300, 170)

  ctx.fillStyle = '#64748B'
  ctx.font = '16px sans-serif'
  ctx.fillText(mainLabel, 300, 198)

  // Secondary stats row
  const secondaryStats: { label: string; value: string }[] = []
  if (data.cardsReviewed != null) secondaryStats.push({ label: 'Cards', value: `${data.cardsReviewed}` })
  if (data.streak != null) secondaryStats.push({ label: 'Streak', value: `${data.streak}d` })
  if (data.level != null) secondaryStats.push({ label: 'Level', value: `${data.level}` })
  if (data.xpEarned != null) secondaryStats.push({ label: 'XP', value: `+${data.xpEarned}` })

  if (secondaryStats.length > 0) {
    const totalWidth = 440
    const startX = (600 - totalWidth) / 2
    const gap = totalWidth / secondaryStats.length

    secondaryStats.forEach((stat, i) => {
      const x = startX + gap * i + gap / 2

      ctx.fillStyle = '#1A1D2E'
      ctx.font = 'bold 28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(stat.value, x, 274)

      ctx.fillStyle = '#94A3B8'
      ctx.font = '13px sans-serif'
      ctx.fillText(stat.label, x, 296)
    })
  }

  // Watermark bottom-right
  ctx.fillStyle = '#CBD5E1'
  ctx.font = '13px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('sappio.ai', 556, 364)

  return canvas.toDataURL('image/png')
}
