'use client'

import Avatar from '@/components/shared/Avatar/Avatar'
import { Grid, Typography } from '@mui/material'
import Button from '@/components/shared/Button/Button'
import { useSelector } from '@/utils/hooks'
import { Player } from '@/utils/interfaces'
import clsx from 'clsx'

interface ScoreboardProps {
  players: Player[]
}

export default function Scoreboard({ players }: ScoreboardProps) {
  const playerId = useSelector((state) => state.game.playerId)

  return (
    <div className="fixed left-1/2 top-1/2 z-20 w-[90vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-black/80 p-10 text-white shadow-[0_0_40px_rgba(0,0,0,0.7)]">
      <Typography variant="h2" textAlign="center" fontWeight={600} mb={6}>
        Game Finished!!
      </Typography>
      <div className="space-y-5 text-2xl">
        {players.map((p, idx) => (
          <div
            key={idx}
            className={clsx(
              'flex items-center gap-6',
              p.id === playerId && 'text-yellow-300 animate-score-pulse'
            )}
          >
            <div className="w-12 text-2xl">{idx + 1}</div>
            <div className="w-12">
              <Avatar seed={`${p.name}${p.img}`} />
            </div>
            <div>{p.name}</div>
          </div>
        ))}
      </div>

      <Grid container justifyContent="center" sx={{ mt: 6 }}>
        <Button href="/main-menu">Play Again</Button>
      </Grid>
    </div>
  )
}

