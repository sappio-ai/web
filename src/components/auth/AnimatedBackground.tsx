export default function AnimatedBackground() {
  return (
    <>
      {/* Static radial gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,213,213,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,230,211,0.05),transparent_50%)]" />
      
      {/* Static ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[800px] h-[300px] sm:h-[600px] bg-[#a8d5d5]/5 rounded-full blur-[60px]" />
    </>
  )
}
