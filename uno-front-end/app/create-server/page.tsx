'use client'

import { useState } from 'react'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Paper from '@/components/shared/Paper/Paper'
import Button from '@/components/shared/Button/Button'
import TextField from '@/components/shared/TextField/TextField'
import Switch from '@/components/shared/Switch/Switch'
import { useRouter } from 'next/navigation'
import API from '@/api/API'
import Typography from '@/components/shared/Typography/Typography'
import { useDispatch } from '@/utils/hooks'
import { setInLobby, setPlayerId } from '@/stores/features/gameSlice'

export default function CreateServerPage() {
  const [serverName, setServerName] = useState('')
  const [serverPassword, setServerPassword] = useState('')
  const [isPrivate, setIsPrivate] = useState(true)
  const router = useRouter()
  const dispatch = useDispatch()

  const handleCreateServer = async () => {
    const playerId = await API.createServer(serverName, serverPassword)
    dispatch(setPlayerId(playerId))
    dispatch(setInLobby(true))
    router.push('/waiting-lobby')
  }

  return (
    <Paper>
      <Grid container justifyContent="center" alignItems="center" spacing={2}>
        <Grid item xs={12} md={10}>
          <Stack justifyContent="center" spacing={1} alignItems="center">
            <Typography>Choose A Server Name</Typography>

            <TextField
              label="server-name"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
            />
          </Stack>
        </Grid>
        <Grid item xs={10} sm={8} md={6} lg={5} sx={{ mt: 2 }}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            gap="32px"
          >
            <p
              style={{
                color: `${isPrivate ? 'white' : 'gray'}`,
                textShadow: `${isPrivate ? '0 0 3px white' : ''}`,
              }}
            >
              Private
            </p>
            <Switch
              defaultChecked
              onChange={() => {
                setIsPrivate(!isPrivate)
                setServerPassword('')
              }}
            />
            <p
              style={{
                color: `${!isPrivate ? 'white' : 'gray'}`,
                textShadow: `${!isPrivate ? '0 0 3px white' : ''}`,
              }}
            >
              Public
            </p>
          </Stack>
        </Grid>
        {isPrivate && (
          <Grid item xs={12} md={10} sx={{ mt: 2 }}>
            <Stack justifyContent="center" spacing={1} alignItems="center">
              <Typography>Server Password</Typography>

              <TextField
                type="password"
                label="server-password"
                value={serverPassword}
                onChange={(e) => setServerPassword(e.target.value)}
              />
            </Stack>
          </Grid>
        )}

        <Grid item xs={12} md={10} lg={8}>
          {((isPrivate && serverName && serverPassword) ||
            (!isPrivate && serverName)) && (
            <Button onClick={handleCreateServer}>Creat Server</Button>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}

