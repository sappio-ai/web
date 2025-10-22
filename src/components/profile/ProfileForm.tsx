'use client'

import { useState, useEffect, useRef } from 'react'
import { User, Mail, AtSign, Upload, Check, AlertCircle, Loader2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  role: string
  plan: string
  plan_expires_at: string | null
  locale: string
  created_at: string
}

interface ProfileFormProps {
  initialProfile?: UserProfile
  hasUsername?: boolean
}

export function ProfileForm({ initialProfile, hasUsername: initialHasUsername = true }: ProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile || null)
  const [loading, setLoading] = useState(!initialProfile)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasUsername, setHasUsername] = useState(initialHasUsername)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const firstErrorRef = useRef<HTMLDivElement>(null)
  const supabase = createBrowserClient()

  const [formData, setFormData] = useState({
    full_name: initialProfile?.full_name || '',
    username: initialProfile?.username || '',
    avatar_url: initialProfile?.avatar_url || '',
    locale: initialProfile?.locale || 'en',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!initialProfile) {
      fetchProfile()
    }
  }, [initialProfile])



  // Scroll to first error when errors change
  useEffect(() => {
    if (Object.keys(errors).length > 0 && firstErrorRef.current) {
      firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [errors])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile')
      }

      setProfile(data.profile)
      setFormData({
        full_name: data.profile.full_name || '',
        username: data.profile.username || '',
        avatar_url: data.profile.avatar_url || '',
        locale: data.profile.locale || 'en',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, WebP, or GIF)')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB')
      return
    }

    try {
      setUploading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (formData.avatar_url) {
        const oldPath = formData.avatar_url.split('/').pop()
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`])
        }
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const removeAvatar = async () => {
    if (!formData.avatar_url) return
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const oldPath = formData.avatar_url.split('/').pop()
      if (oldPath) {
        await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`])
      }
      
      setFormData(prev => ({ ...prev, avatar_url: '' }))
    } catch (err) {
      console.error('Failed to remove avatar:', err)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // If username already exists in profile, don't allow saving empty username
    if (profile?.username && !formData.username) {
      newErrors.username = 'Username cannot be empty once set'
    }

    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (formData.username && !/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, hyphens, and underscores'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      setProfile(data.profile)
      
      // Update hasUsername state if username was just set
      if (formData.username && !hasUsername) {
        setHasUsername(true)
      }
      
      setSuccess(true)
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#a8d5d5]" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-400">Failed to load profile</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Username Alert - Only show if no username */}
      {!hasUsername && (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition" />
          <div className="relative bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-yellow-400 font-bold text-base mb-1">Complete Your Profile</p>
              <p className="text-yellow-400/80 text-sm">Set your username below to unlock all features and personalize your experience</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
        <p className="text-gray-500">Update your profile details and photo</p>
      </div>

      {error && (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-red-500/20 rounded-xl blur" />
          <div className="relative flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-[#a8d5d5]/20 rounded-xl blur" />
          <div className="relative flex items-start gap-3 p-4 bg-[#a8d5d5]/10 border border-[#a8d5d5]/30 rounded-xl">
            <Check className="w-5 h-5 text-[#a8d5d5] flex-shrink-0 mt-0.5" />
            <p className="text-[#a8d5d5] text-sm font-medium">Profile updated successfully!</p>
          </div>
        </div>
      )}

      {/* Avatar Upload Section */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#a8d5d5]/20 to-[#f5e6d3]/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition" />
        <div className="relative flex items-center gap-8 p-6 bg-white/[0.03] rounded-2xl border border-white/10">
          <div className="relative group/avatar">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#a8d5d5] to-[#f5e6d3] rounded-3xl blur-lg opacity-40 group-hover/avatar:opacity-60 transition" />
            <div className="relative w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-[#a8d5d5]/30 to-[#8bc5c5]/30 border-2 border-[#a8d5d5]/50 flex items-center justify-center">
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-[#a8d5d5]/60" />
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              className="hidden"
            />
            <h3 className="text-white font-semibold mb-2">Profile Photo</h3>
            <p className="text-gray-500 text-sm mb-4">JPG, PNG or GIF. Max 2MB</p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#a8d5d5]/50 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {formData.avatar_url ? 'Change' : 'Upload'}
                  </>
                )}
              </button>
              {formData.avatar_url && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="text-sm text-gray-500 hover:text-red-400 transition-colors font-medium"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Email (Read-only) */}
        <div ref={errors.email ? firstErrorRef : null}>
          <label className="block text-sm font-semibold text-gray-400 mb-3">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-white/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition" />
            <div className="relative flex items-center">
              <Mail className="absolute left-5 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full pl-14 pr-28 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-gray-400 cursor-not-allowed focus:outline-none"
              />
              <div className="absolute right-4 flex items-center gap-2 text-xs text-[#a8d5d5] bg-[#a8d5d5]/10 px-3 py-2 rounded-lg border border-[#a8d5d5]/30 font-semibold">
                <div className="w-2 h-2 rounded-full bg-[#a8d5d5]" />
                Verified
              </div>
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-semibold text-gray-400 mb-3">
            Full Name
          </label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-[#a8d5d5]/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition" />
            <div className="relative flex items-center">
              <User className="absolute left-5 w-5 h-5 text-gray-500" />
              <input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-14 pr-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#a8d5d5]/50 focus:ring-2 focus:ring-[#a8d5d5]/20 focus:bg-white/[0.05] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Username */}
        <div ref={errors.username ? firstErrorRef : null}>
          <label htmlFor="username" className="block text-sm font-semibold text-gray-400 mb-3">
            Username {!hasUsername && <span className="text-yellow-400 ml-1">*</span>}
          </label>
          <div className="relative group">
            <div className={`absolute -inset-0.5 rounded-xl blur opacity-0 group-hover:opacity-100 transition ${
              !hasUsername && !formData.username ? 'bg-yellow-500/10' : 'bg-[#a8d5d5]/10'
            }`} />
            <div className="relative flex items-center">
              <AtSign className="absolute left-5 w-5 h-5 text-gray-500" />
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="Choose a unique username"
                className={`w-full pl-14 pr-5 py-4 bg-white/[0.03] border rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all focus:bg-white/[0.05] ${
                  !hasUsername && !formData.username
                    ? 'border-yellow-500/50 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20'
                    : errors.username 
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : 'border-white/10 focus:border-[#a8d5d5]/50 focus:ring-2 focus:ring-[#a8d5d5]/20'
                }`}
              />
            </div>
          </div>
          {errors.username && (
            <p className="mt-3 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errors.username}
            </p>
          )}
          {!hasUsername && !errors.username && (
            <p className="mt-3 text-xs text-gray-500">
              Choose a unique username that others will see
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-8 border-t border-white/10">
        <button
          type="button"
          onClick={() => {
            setFormData({
              full_name: profile?.full_name || '',
              username: profile?.username || '',
              avatar_url: profile?.avatar_url || '',
              locale: profile?.locale || 'en',
            })
            setErrors({})
          }}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-gray-400 hover:text-white text-sm font-semibold transition-all"
        >
          Reset Changes
        </button>
        <button
          type="submit"
          disabled={saving || uploading}
          className="relative group/btn px-8 py-3.5 bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] hover:from-[#8bc5c5] hover:to-[#a8d5d5] text-[#0a0e14] font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#a8d5d5]/30 hover:shadow-2xl hover:shadow-[#a8d5d5]/50 hover:scale-[1.02] flex items-center gap-2"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] rounded-xl blur opacity-50 group-hover/btn:opacity-75 transition" />
          <span className="relative flex items-center gap-2">
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Save Changes
              </>
            )}
          </span>
        </button>
      </div>
    </form>
  )
}
