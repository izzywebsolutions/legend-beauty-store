'use client'

import { useEffect } from 'react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin error:', error)
  }, [error])

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-plum/10 max-w-md w-full text-center space-y-6">
        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl text-plum">Admin Panel Error</h2>
        <p className="text-plum/70 text-sm leading-relaxed">
          Something went wrong loading this section. This may be a temporary database issue.
        </p>
        <div className="pt-2 flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-plum hover:bg-plum/90 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => window.location.href = '/admin'}
            className="w-full border border-plum/20 text-plum hover:bg-plum/5 py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
