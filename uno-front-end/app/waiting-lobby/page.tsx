'use client'

import { useEffect, useState, useRef } from 'react'
import Paper from '@/components/shared/Paper/Paper'
import Avatar from '@/components/shared/Avatar/Avatar'
import Typography from '@/components/shared/Typography/Typography'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Loding from '@/components/waiting-lobby/Loding'
import { useDispatch, useSelector } from '@/utils/hooks'
import { init } from '@/stores/features/gameSlice'
import { useRouter } from 'next/navigation'
import API from '@/api/API'
import { Player } from '@/utils/interfaces'

export default function WaitingLobbyPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const gameInitRef = useRef(false)
  const { inLobby, inGame } = useSelector((state) => ({
    inLobby: state.game.inLobby,
    inGame: state.game.inGame,
  }))

  const dispatch = useDispatch()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we're not in lobby, not in game, and haven't started game initialization
    // Also check if we have 4 players (game is about to start)
    if (!inLobby && !inGame && !gameInitRef.current && players.length < 4) {
      router.replace('/main-menu')
    }
  }, [inLobby, inGame, router, players.length])

  useEffect(() => {
    if (!inGame) return
    const timeout = setTimeout(() => router.replace('/game'), 2000)
    return () => clearTimeout(timeout)
  }, [inGame, router])

  useEffect(() => {
    if (!inLobby) return

    let unsubInit: (() => void) | null = null
    let unsubPlayers: (() => void) | null = null

      ; (async () => {
        const serverPlayers = await API.getServerPlayers()
        setPlayers(serverPlayers)
        unsubPlayers = API.onPlayersUpdated((updatedPlayers) =>
          setPlayers(updatedPlayers)
        )
        unsubInit = API.onGameInit(({ players, cards, firstCard }) => {
          gameInitRef.current = true
          dispatch(init({ cards, players, firstCard }))
        })
      })()

    return () => {
      if (unsubInit) unsubInit()
      if (unsubPlayers) unsubPlayers()
      gameInitRef.current = false
    }
  }, [dispatch, router, inLobby])

  if (!inLobby) {
    return null
  }

  return (
    <Paper>
      <Grid container justifyContent="center" alignItems="center" spacing={2}>
        <Grid item xs={8}>
          <Typography>
            Waiting for Other Players To Join
            <Loding />
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>
            Joined ( <span className="font-bold text-orange-400 drop-shadow-[0_0_4px_#f37006]">{players.length}</span>/4 )
          </Typography>
        </Grid>
        <Grid
          item
          container
          flexWrap="nowrap"
          alignItems="center"
          justifyContent="center"
          spacing={0.5}
          gap={6}
          xs={12}
        >
          {players.map((player) => {
            return (
              <Stack
                key={player.id}
                justifyContent="center"
                alignItems="center"
                spacing={1}
              >
                <Avatar seed={`${player.name}${player.img}`} />
                <Typography>{player.name}</Typography>
              </Stack>
            )
          })}
        </Grid>
      </Grid>
    </Paper>
  )
}

