'use client'

import { useEffect, useState } from 'react'
import { Package, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Purchase {
  id: string
  quantity: number
  consumed: number
  available: number
  amountPaid: number
  currency: string
  purchasedAt: string
  expiresAt: string
  status: 'active' | 'expired' | 'refunded'
  refundedAt?: string
  refundAmount?: number
}

export default function ExtraPacksPurchaseHistory() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/users/extra-packs/history')
      if (!response.ok) {
        throw new Error('Failed to fetch history')
      }
      const data = await response.json()
      setPurchases(data.purchases)
    } catch (err) {
      console.error('Error fetching purchase history:', err)
      setError('Failed to load purchase history')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }



  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Purchase History</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Purchase History</h3>
        <div className="text-center py-8 text-gray-500">{error}</div>
      </div>
    )
  }

  if (purchases.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Purchase History</h3>
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No purchases yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Purchase History</h3>
      <div className="space-y-3">
        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className={`rounded-lg border-2 p-4 ${
              purchase.status === 'active'
                ? 'border-blue-200 bg-blue-50'
                : purchase.status === 'expired'
                ? 'border-gray-200 bg-gray-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-gray-900">
                    {purchase.quantity} Packs
                  </span>
                  {purchase.status === 'active' && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  )}
                  {purchase.status === 'expired' && (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expired
                    </span>
                  )}
                  {purchase.status === 'refunded' && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Refunded
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Purchased {formatDate(purchase.purchasedAt)}</span>
                  </div>
                  {purchase.status === 'active' && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Expires {formatDate(purchase.expiresAt)}</span>
                    </div>
                  )}
                  {purchase.status === 'refunded' && purchase.refundedAt && (
                    <div className="flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Refunded {formatDate(purchase.refundedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  €{purchase.amountPaid.toFixed(2)}
                </div>
                {purchase.status === 'active' && (
                  <div className="text-xs text-gray-600">
                    {purchase.available} / {purchase.quantity} left
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar for active purchases */}
            {purchase.status === 'active' && (
              <div className="mt-3">
                <div className="h-1.5 bg-white rounded-full overflow-hidden border border-blue-200">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{
                      width: `${((purchase.quantity - purchase.consumed) / purchase.quantity) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}


          </div>
        ))}
      </div>
    </div>
  )
}
