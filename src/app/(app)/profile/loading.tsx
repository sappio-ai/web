export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFB] relative flex items-center justify-center">
      {/* Subtle paper texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")'
      }} />

      {/* Loading Content */}
      <div className="relative text-center px-4">
        {/* Animated Icon */}
        <div className="relative inline-block mb-6">
          {/* Outer rotating ring */}
          <div className="w-20 h-20 rounded-2xl border-4 border-[#E2E8F0] animate-spin" style={{
            animationDuration: '3s',
            borderTopColor: '#5A5FF0',
            borderRightColor: '#5A5FF0'
          }} />
          
          {/* Inner pulsing circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#5A5FF0] animate-pulse" style={{
              animationDuration: '2s'
            }} />
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-xl font-bold text-[#1A1D2E] mb-2">Loading your profile</h2>
        <p className="text-[#64748B] text-sm">Just a moment...</p>
      </div>
    </div>
  )
}
