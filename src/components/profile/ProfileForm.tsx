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
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[#5A5FF0]/10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#5A5FF0]" />
        </div>
        <p className="text-sm text-[#64748B] font-medium">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 rounded-xl bg-[#FEE2E2] flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-[#EF4444]" />
        </div>
        <p className="text-[#1A1D2E] font-bold text-lg mb-1">Failed to load profile</p>
        <p className="text-[#64748B] text-sm">Please refresh the page to try again</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Username Alert - Only show if no username */}
      {!hasUsername && (
        <div className="relative">
          <div className="absolute top-[2px] left-0 right-0 h-full bg-[#FEF3C7]/60 rounded-xl border border-[#FCD34D]/40" />
          <div className="relative bg-[#FFFBEB] border-2 border-[#FCD34D] rounded-xl p-5 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[#FCD34D]/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-[#92400E] font-bold text-sm mb-1">Complete Your Profile</p>
              <p className="text-[#92400E] text-sm">Set your username below to unlock all features and personalize your experience</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#1A1D2E] mb-1">Personal Information</h2>
        <p className="text-[#64748B] text-sm">Update your profile details and photo</p>
      </div>

      {error && (
        <div className="relative">
          <div className="absolute top-[2px] left-0 right-0 h-full bg-[#FEE2E2]/60 rounded-xl border border-[#FCA5A5]/40" />
          <div className="relative flex items-start gap-3 p-4 bg-[#FEF2F2] border-2 border-[#FCA5A5] rounded-xl shadow-sm">
            <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
            <p className="text-[#991B1B] text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="relative">
          <div className="absolute top-[2px] left-0 right-0 h-full bg-[#D1FAE5]/60 rounded-xl border border-[#6EE7B7]/40" />
          <div className="relative flex items-start gap-3 p-4 bg-[#ECFDF5] border-2 border-[#6EE7B7] rounded-xl shadow-sm">
            <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
            <p className="text-[#065F46] text-sm font-bold">Profile updated successfully!</p>
          </div>
        </div>
      )}

      {/* Avatar Upload Section */}
      <div className="relative">
        <div className="absolute top-[2px] left-0 right-0 h-full bg-white/60 rounded-xl border border-[#CBD5E1]/40" />
        <div className="relative flex items-center gap-6 p-5 bg-[#F8FAFB] rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="relative">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F1F5F9] border-2 border-[#E2E8F0] flex items-center justify-center">
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-[#94A3B8]" />
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
            <h3 className="text-[#1A1D2E] font-bold text-sm mb-1">Profile Photo</h3>
            <p className="text-[#64748B] text-xs mb-3">JPG, PNG or GIF. Max 2MB</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#F8FAFB] border border-[#E2E8F0] hover:border-[#5A5FF0]/40 rounded-lg text-[#1A1D2E] text-xs font-semibold transition-all disabled:opacity-50 shadow-sm"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    {formData.avatar_url ? 'Change' : 'Upload'}
                  </>
                )}
              </button>
              {formData.avatar_url && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="text-xs text-[#64748B] hover:text-[#EF4444] transition-colors font-semibold"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Email (Read-only) */}
        <div ref={errors.email ? firstErrorRef : null}>
          <label className="block text-sm font-bold text-[#1A1D2E] mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full pl-12 pr-24 py-3 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-[#64748B] cursor-not-allowed focus:outline-none text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-[#10B981] bg-[#ECFDF5] px-2.5 py-1.5 rounded-md border border-[#6EE7B7] font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              Verified
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-bold text-[#1A1D2E] mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="Enter your full name"
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-lg text-[#1A1D2E] placeholder-[#94A3B8] focus:outline-none focus:border-[#5A5FF0] focus:ring-2 focus:ring-[#5A5FF0]/20 transition-all text-sm"
            />
          </div>
        </div>

        {/* Username */}
        <div ref={errors.username ? firstErrorRef : null}>
          <label htmlFor="username" className="block text-sm font-bold text-[#1A1D2E] mb-2">
            Username {!hasUsername && <span className="text-[#F59E0B] ml-1">*</span>}
          </label>
          <div className="relative">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder="Choose a unique username"
              className={`w-full pl-12 pr-4 py-3 bg-white border rounded-lg text-[#1A1D2E] placeholder-[#94A3B8] focus:outline-none transition-all text-sm ${
                !hasUsername && !formData.username
                  ? 'border-[#FCD34D] focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20'
                  : errors.username 
                  ? 'border-[#FCA5A5] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20' 
                  : 'border-[#E2E8F0] focus:border-[#5A5FF0] focus:ring-2 focus:ring-[#5A5FF0]/20'
              }`}
            />
          </div>
          {errors.username && (
            <p className="mt-2 text-xs text-[#EF4444] flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.username}
            </p>
          )}
          {!hasUsername && !errors.username && (
            <p className="mt-2 text-xs text-[#64748B]">
              Choose a unique username that others will see
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-[#E2E8F0]">
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
          className="px-5 py-2.5 bg-white hover:bg-[#F8FAFB] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-[#64748B] hover:text-[#1A1D2E] text-sm font-semibold transition-all shadow-sm"
        >
          Reset Changes
        </button>
        <button
          type="submit"
          disabled={saving || uploading}
          className="px-6 py-2.5 bg-[#5A5FF0] hover:bg-[#4A4FD0] text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98] flex items-center gap-2 text-sm"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  )
}
