'use client'

import { useEffect } from 'react'

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Store error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 bg-cream">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-plum/10 max-w-md w-full text-center space-y-6">
        <div className="text-5xl mb-4">💅</div>
        <h2 className="font-serif text-3xl text-plum">Something went wrong</h2>
        <p className="text-plum/70 leading-relaxed">
          We hit a snag loading this page. This is usually temporary.
        </p>
        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-plum hover:bg-plum/90 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full border border-plum/20 text-plum hover:bg-plum/5 py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  )
}
