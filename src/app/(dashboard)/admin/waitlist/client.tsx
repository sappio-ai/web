'use client'

import { useState, useEffect } from 'react'
import { Download, Mail, CheckCircle, Clock, Users } from 'lucide-react'

interface WaitlistEntry {
  id: string
  email: string
  studying: string | null
  current_tool: string | null
  wants_early_access: boolean
  referral_code: string
  referred_by: string | null
  created_at: string
  meta_json: {
    invited_at?: string
    invite_sent_at?: string
    converted_at?: string
    invite_status?: 'pending' | 'invited' | 'converted' | 'failed'
  }
}

export default function WaitlistAdminClient() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'pending' | 'invited' | 'converted'>('all')
  const [actionLoading, setActionLoading] = useState(false)
  const [sendStatus, setSendStatus] = useState<{ sent: number; failed: number } | null>(null)
  const [waitlistMode, setWaitlistMode] = useState(true)
  const [waitlistModeLoading, setWaitlistModeLoading] = useState(false)

  useEffect(() => {
    fetchWaitlist()
    fetchWaitlistMode()
  }, [])

  const fetchWaitlistMode = async () => {
    try {
      const response = await fetch('/api/admin/settings/waitlist-mode')
      const data = await response.json()
      
      if (data.success) {
        setWaitlistMode(data.enabled)
      }
    } catch (error) {
      console.error('Error fetching waitlist mode:', error)
    }
  }

  const toggleWaitlistMode = async () => {
    setWaitlistModeLoading(true)
    try {
      const response = await fetch('/api/admin/settings/waitlist-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !waitlistMode })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setWaitlistMode(data.enabled)
      }
    } catch (error) {
      console.error('Error toggling waitlist mode:', error)
    } finally {
      setWaitlistModeLoading(false)
    }
  }

  const fetchWaitlist = async () => {
    try {
      const response = await fetch('/api/admin/waitlist')
      const data = await response.json()
      
      if (data.success) {
        setEntries(data.entries)
      }
    } catch (error) {
      console.error('Error fetching waitlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedEmails.size === filteredEntries.length) {
      setSelectedEmails(new Set())
    } else {
      setSelectedEmails(new Set(filteredEntries.map(e => e.email)))
    }
  }

  const handleSelectEntry = (email: string) => {
    const newSelected = new Set(selectedEmails)
    if (newSelected.has(email)) {
      newSelected.delete(email)
    } else {
      newSelected.add(email)
    }
    setSelectedEmails(newSelected)
  }

  const handleSendInvites = async () => {
    if (selectedEmails.size === 0) return
    
    setActionLoading(true)
    setSendStatus(null)
    try {
      const response = await fetch('/api/admin/waitlist/send-invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: Array.from(selectedEmails) })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSendStatus({ sent: data.sent, failed: data.failed })
        await fetchWaitlist()
        setSelectedEmails(new Set())
        
        // Clear status after 5 seconds
        setTimeout(() => setSendStatus(null), 5000)
      }
    } catch (error) {
      console.error('Error sending invites:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/waitlist/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting:', error)
    }
  }

  const getStatus = (entry: WaitlistEntry): 'pending' | 'invited' | 'converted' => {
    if (entry.meta_json?.converted_at) return 'converted'
    if (entry.meta_json?.invited_at) return 'invited'
    return 'pending'
  }

  const filteredEntries = entries.filter(entry => {
    if (filter === 'all') return true
    return getStatus(entry) === filter
  })

  const stats = {
    total: entries.length,
    pending: entries.filter(e => getStatus(e) === 'pending').length,
    invited: entries.filter(e => getStatus(e) === 'invited').length,
    converted: entries.filter(e => getStatus(e) === 'converted').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading waitlist...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Waitlist Management</h1>
            <p className="text-gray-400">Manage early access invitations and track conversions</p>
          </div>
          
          {/* Waitlist Mode Toggle */}
          <div className="bg-[#1A1A24] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div>
                <div className="text-sm font-semibold text-white mb-1">Waitlist Mode</div>
                <div className="text-xs text-gray-400">
                  {waitlistMode ? 'Signup requires invite code' : 'Signup is open to everyone'}
                </div>
              </div>
              <button
                onClick={toggleWaitlistMode}
                disabled={waitlistModeLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  waitlistMode ? 'bg-blue-600' : 'bg-gray-600'
                } ${waitlistModeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    waitlistMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1A1A24] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400 text-sm">Total</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>
          
          <div className="bg-[#1A1A24] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-400 text-sm">Pending</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.pending}</div>
          </div>
          
          <div className="bg-[#1A1A24] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400 text-sm">Invited</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.invited}</div>
          </div>
          
          <div className="bg-[#1A1A24] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-400 text-sm">Converted</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.converted}</div>
          </div>
        </div>

        {/* Send Status */}
        {sendStatus && (
          <div className={`mb-6 p-4 rounded-lg ${
            sendStatus.failed === 0 
              ? 'bg-green-500/10 border border-green-500/20' 
              : 'bg-yellow-500/10 border border-yellow-500/20'
          }`}>
            <p className={`text-sm ${
              sendStatus.failed === 0 ? 'text-green-400' : 'text-yellow-400'
            }`}>
              ✓ Sent {sendStatus.sent} invite{sendStatus.sent !== 1 ? 's' : ''}
              {sendStatus.failed > 0 && ` • ${sendStatus.failed} failed`}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#1A1A24] text-gray-400 hover:bg-[#252530]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#1A1A24] text-gray-400 hover:bg-[#252530]'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('invited')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'invited'
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#1A1A24] text-gray-400 hover:bg-[#252530]'
              }`}
            >
              Invited
            </button>
            <button
              onClick={() => setFilter('converted')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'converted'
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#1A1A24] text-gray-400 hover:bg-[#252530]'
              }`}
            >
              Converted
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSendInvites}
              disabled={selectedEmails.size === 0 || actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Mail className="w-4 h-4" />
              {actionLoading ? 'Sending...' : `Send Invites (${selectedEmails.size})`}
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A24] text-gray-300 rounded-lg hover:bg-[#252530] transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1A1A24] border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#0F0F14] border-b border-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEmails.size === filteredEntries.length && filteredEntries.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-600 bg-[#1A1A24]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Studying</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Signed Up</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Invited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredEntries.map((entry) => {
                const status = getStatus(entry)
                return (
                  <tr key={entry.id} className="hover:bg-[#252530] transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedEmails.has(entry.email)}
                        onChange={() => handleSelectEntry(entry.email)}
                        className="rounded border-gray-600 bg-[#1A1A24]"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{entry.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{entry.studying || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          status === 'converted'
                            ? 'bg-green-500/10 text-green-400'
                            : status === 'invited'
                            ? 'bg-purple-500/10 text-purple-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}
                      >
                        {status === 'converted' && <CheckCircle className="w-3 h-3" />}
                        {status === 'invited' && <Mail className="w-3 h-3" />}
                        {status === 'pending' && <Clock className="w-3 h-3" />}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {entry.meta_json?.invited_at
                        ? new Date(entry.meta_json.invited_at).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {filteredEntries.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No entries found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
