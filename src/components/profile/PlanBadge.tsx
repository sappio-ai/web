import { Crown, Sparkles, Zap, Calendar, AlertTriangle } from 'lucide-react'

interface PlanBadgeProps {
  plan: 'free' | 'student_pro' | 'pro_plus'
  expiresAt?: string | null
  className?: string
}

export function PlanBadge({ plan, expiresAt, className = '' }: PlanBadgeProps) {
  const planConfig = {
    free: {
      label: 'Free Plan',
      description: 'Basic features',
      color: 'from-gray-500/20 to-gray-600/20',
      borderColor: 'border-gray-500/30',
      textColor: 'text-gray-300',
      icon: Zap,
      iconColor: 'text-gray-400',
      iconBg: 'from-gray-500/20 to-gray-600/20',
    },
    student_pro: {
      label: 'Student Pro',
      description: 'Enhanced learning',
      color: 'from-[#a8d5d5]/20 to-[#8bc5c5]/20',
      borderColor: 'border-[#a8d5d5]/30',
      textColor: 'text-[#a8d5d5]',
      icon: Sparkles,
      iconColor: 'text-[#a8d5d5]',
      iconBg: 'from-[#a8d5d5]/20 to-[#8bc5c5]/20',
    },
    pro_plus: {
      label: 'Pro Plus',
      description: 'Unlimited access',
      color: 'from-[#f5e6d3]/20 to-[#e5d6c3]/20',
      borderColor: 'border-[#f5e6d3]/30',
      textColor: 'text-[#f5e6d3]',
      icon: Crown,
      iconColor: 'text-[#f5e6d3]',
      iconBg: 'from-[#f5e6d3]/20 to-[#e5d6c3]/20',
    },
  }

  const config = planConfig[plan]
  const Icon = config.icon

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const isExpiringSoon = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  const isExpired = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    return date < now
  }

  return (
    <div className={`${className}`}>
      <div className={`relative overflow-hidden bg-gradient-to-br ${config.color} border-2 ${config.borderColor} rounded-xl p-5`}>
        <div className="relative z-10 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.iconBg} flex items-center justify-center border ${config.borderColor}`}>
            <Icon className={`w-7 h-7 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className={`font-bold ${config.textColor} text-xl mb-1`}>{config.label}</h3>
            <p className="text-gray-400 text-sm">{config.description}</p>
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
      </div>
      
      {expiresAt && plan !== 'free' && (
        <div className={`mt-4 flex items-center gap-3 px-4 py-3 rounded-xl ${
          isExpired(expiresAt) 
            ? 'bg-red-500/10 border border-red-500/30' 
            : isExpiringSoon(expiresAt)
            ? 'bg-yellow-500/10 border border-yellow-500/30'
            : 'bg-white/[0.02] border border-white/10'
        }`}>
          {isExpired(expiresAt) ? (
            <>
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Expired</p>
                <p className="text-sm text-red-400 font-semibold">{formatExpiryDate(expiresAt)}</p>
              </div>
            </>
          ) : isExpiringSoon(expiresAt) ? (
            <>
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Expires Soon</p>
                <p className="text-sm text-yellow-400 font-semibold">{formatExpiryDate(expiresAt)}</p>
              </div>
            </>
          ) : (
            <>
              <Calendar className={`w-5 h-5 ${config.iconColor}`} />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Valid Until</p>
                <p className={`text-sm ${config.textColor} font-semibold`}>{formatExpiryDate(expiresAt)}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
