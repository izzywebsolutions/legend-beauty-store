'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error('Global application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-16">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-plum/10 max-w-md w-full text-center space-y-6">
        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        
        <h2 className="font-serif text-3xl text-plum">Oops! Something went wrong</h2>
        
        <p className="text-plum/70 leading-relaxed">
          We encountered an unexpected error while trying to load this page. Our technical team has been notified.
        </p>
        
        <div className="pt-4 flex flex-col gap-3">
          <Button 
            onClick={() => reset()}
            className="w-full bg-plum hover:bg-plum/90 text-white"
          >
            Try Again
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full border-plum/20 text-plum hover:bg-plum/5"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
