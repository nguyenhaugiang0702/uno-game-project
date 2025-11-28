'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Typography } from '@mui/material'
import Loading from '@/components/shared/Loading/Loading'
import GameAudio from '@/utils/audio'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [loadingAssets, setLoadingAssets] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const redirect = setTimeout(() => {
      if (localStorage.getItem('playerName')) router.push('/main-menu')
      else router.push('/create-user')
    }, 3000)

    return () => clearTimeout(redirect)
  }, [router])

  const onLoaded = () => {
    GameAudio.playMusic('music')
    setLoadingAssets(false)
  }

  if (loadingAssets) return <Loading onLoaded={onLoaded} />

  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -500 }}
      transition={{ duration: 0.7 }}
    >
      <motion.div
        initial={{ y: '-100%', opacity: 0 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 100, duration: 1 },
        }}
        className="w-4/5 max-w-xl"
      >
        <img src="/assets/images/uno-logo.png" alt="UNO Logo" className="w-full" />
      </motion.div>
      <Typography
        variant="h4"
        component={motion.h3}
        className="text-shadow"
        initial={{ opacity: 0, y: 100 }}
        animate={
          mounted
            ? {
                opacity: 1,
                y: [0, -10, 0],
                transition: {
                  repeat: Infinity,
                  duration: 0.9,
                  times: [0.4, 0.6, 1],
                  ease: 'easeInOut',
                },
              }
            : {
                opacity: 1,
                y: 0,
                transition: {
                  type: 'spring',
                  stiffness: 100,
                  duration: 1,
                  delay: 1,
                },
              }
        }
        onAnimationComplete={() => setMounted(true)}
        sx={{ mt: 4 }}
      >
        Welcome to UNO The Game
      </Typography>
    </motion.div>
  )
}

