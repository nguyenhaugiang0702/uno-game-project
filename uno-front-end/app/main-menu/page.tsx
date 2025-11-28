'use client'

import Grid from '@mui/material/Grid'
import Paper from '@/components/shared/Paper/Paper'
import Button from '@/components/shared/Button/Button'
import Typography from '@/components/shared/Typography/Typography'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import API from '@/api/API'
import { useDispatch } from '@/utils/hooks'
import { setInLobby, setPlayerId } from '@/stores/features/gameSlice'
import { getSocket } from '@/api/socket'
import Link from 'next/link'

const style = {
  color: '#fff',
}

export default function MainMenuPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    dispatch(setInLobby(false))
    
    const socket = getSocket()
    
    // Check if socket is already connected
    if (socket?.connected) {
      API.setOnlineMode(true)
      setIsOnline(true)
    } else {
      // Try to connect to back-end when entering main-menu
      // This allows user to play online if back-end is available
      if (socket && !socket.connected) {
        socket.connect()
      }
    }
    
    // Listen for socket connection
    if (socket) {
      const onConnect = () => {
        API.setOnlineMode(true)
        setIsOnline(true)
      }
      const onDisconnect = () => {
        API.setOnlineMode(false)
        setIsOnline(false)
      }
      const onConnectError = (error: Error) => {
        console.warn('Failed to connect to back-end:', error.message)
        // Don't show error to user, just disable online buttons
        API.setOnlineMode(false)
        setIsOnline(false)
      }
      
      socket.on('connect', onConnect)
      socket.on('disconnect', onDisconnect)
      socket.on('connect_error', onConnectError)
      
      return () => {
        socket.off('connect', onConnect)
        socket.off('disconnect', onDisconnect)
        socket.off('connect_error', onConnectError)
      }
    }
  }, [dispatch])

  const onPlayOnline = () => {
    API.playOnline(true)
  }

  const onPlayOffline = async () => {
    API.playOnline(false)
    const playerId = await API.joinServer()
    dispatch(setPlayerId(playerId))
    dispatch(setInLobby(true))
    router.push('/waiting-lobby')
  }

  return (
    <Paper>
      <Grid container alignItems="center" justifyContent="center" spacing={4}>
        <Grid item xs={10}>
          <Typography fontSize={22}>Start Playing</Typography>
        </Grid>
        <Grid
          item
          container
          alignItems="center"
          justifyContent="center"
          spacing={2}
          xs={12}
        >
          <Grid item xs={12} md={5}>
            <Button
              disabled={!isOnline}
              style={{ width: '80%' }}
              href="/create-server"
              onClick={onPlayOnline}
            >
              <img src="/assets/icons/add.svg" alt="" />
              <Typography>Create A Game</Typography>
            </Button>
          </Grid>
          <Grid item sx={{ display: { xs: 'none', md: 'initial' } }} md={2}>
            <Typography>OR</Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Button
              disabled={!isOnline}
              style={{ width: '80%' }}
              href="/join-server"
              onClick={onPlayOnline}
            >
              <img src="/assets/icons/glob.svg" alt="" />
              <Typography>Join A Game</Typography>
            </Button>
          </Grid>
          <Grid item xs={12} md={5} sx={{ mt: 3 }}>
            <Button style={{ width: '80%' }} onClick={onPlayOffline}>
              <img src="/assets/icons/tv.svg" alt="" />
              <Typography>Play with PC</Typography>
            </Button>
          </Grid>
        </Grid>
        <Grid item container alignItems="center" justifyContent="center" sx={{ mt: 6 }}>
          <Grid item xs={6}>
            <Link style={style} href="/create-user">
              Profile Setting
            </Link>
          </Grid>
        </Grid>
        <Grid
          item
          container
          alignItems="center"
          justifyContent="center"
          xs={12}
        >
          <Grid item xs={6}>
            <a
              style={style}
              href="https://www.ultraboardgames.com/uno/game-rules.php"
              target="_blank"
              rel="noreferrer"
            >
              Game Rules
            </a>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  )
}

