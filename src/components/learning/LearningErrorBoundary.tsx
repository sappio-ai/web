'use client'

import { Component, ReactNode } from 'react'
import Orb from '../orb/Orb'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class LearningErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error for debugging
    console.error('Learning Error:', error, errorInfo)

    // You can also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0F1A] flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition" />
              <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-red-500/30 shadow-2xl p-8">
                <div className="flex flex-col items-center text-center">
                  <Orb pose="error-confused" size="lg" />
                  <h2 className="text-2xl font-bold text-white mt-6 mb-2">
                    Something Went Wrong
                  </h2>
                  <p className="text-gray-400 mb-6">
                    We encountered an error while loading your learning content.
                    Don&apos;t worry, your progress is saved!
                  </p>

                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <div className="w-full bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
                      <p className="text-red-400 text-sm font-mono break-all">
                        {this.state.error.message}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                      onClick={() => window.location.reload()}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#a8d5d5] to-[#8bc5c5] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#a8d5d5]/30 transition-all hover:scale-105"
                    >
                      Reload Page
                    </button>
                    <button
                      onClick={() => (window.location.href = '/dashboard')}
                      className="flex-1 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
