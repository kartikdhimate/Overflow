'use client';

import { Button } from '@heroui/button'
import { useEffect } from 'react'
 
export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])
 
  return (
    <div className='h-full flex items-center justify-center space-y-6'>
        <div className='flex flex-col items-center gap-6'>
            <h2 className='text-5xl font-bold'>Something went wrong!</h2>
            <h3 className='text-3xl text-danger-600'>{error.message}</h3>
            <Button
                onPress={
                () => unstable_retry()
                }
            >
                Try again
            </Button>
        </div>
      
    </div>
  )
}