import Link from 'next/link'
import Orb from '@/components/orb/Orb'
import { ArrowLeft } from 'lucide-react'

export default function StudyPackNotFound() {
  return (
    <div className="min-h-screen bg-[#0A0F1A] relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#a8d5d5]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#f5e6d3]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Orb pose="error-confused" size="xl" />
          <h1 className="mt-6 text-4xl font-bold text-white">
            Study Pack Not Found
          </h1>
          <p className="mt-3 text-gray-400 text-lg">
            This study pack doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] px-6 py-3 font-bold text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#a8d5d5]/30"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

