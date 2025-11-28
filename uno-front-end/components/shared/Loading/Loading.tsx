'use client'

import { useState, useEffect } from 'react'
import Loader from '@/utils/loader'

interface LoadingProps {
  onLoaded: () => void
}

export default function Loading({ onLoaded }: LoadingProps) {
  const [percentage, setPercentage] = useState(3)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    Loader.load()
    Loader.addEventListener('progress', (value: number) => {
      setPercentage(Math.round(100 * value))
    })

    Loader.addEventListener('completed', () => {
      setCompleted(true)
    })
  }, [])

  const onClick = () => {
    if (completed) {
      onLoaded()
    }
  }

  return (
    <div
      onClick={onClick}
      className="flex h-screen w-screen cursor-pointer flex-col items-center justify-center bg-black text-white"
    >
      {completed ? (
        <>
          <h2 className="mb-9 text-center text-[10vmin]">Ready!!</h2>
          <p className="animate-loading-text text-[5vmin] drop-shadow-[0_0_10px_white]">
            Click Anywhere to Start
          </p>
        </>
      ) : (
        <>
          <h2 className="mb-9 text-center text-[10vmin]">Loading Game Assets...</h2>
          <p className="animate-loading-text text-[5vmin] drop-shadow-[0_0_10px_white]">
            {percentage}%
          </p>
        </>
      )}
    </div>
  )
}

