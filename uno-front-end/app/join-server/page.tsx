'use client'

import { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
import Checkbox from '@mui/material/Checkbox'
import Paper from '@/components/shared/Paper/Paper'
import Stack from '@mui/material/Stack'
import Table from '@/components/shared/Table/Table'
import Button from '@/components/shared/Button/Button'
import Typography from '@/components/shared/Typography/Typography'
import { useRouter } from 'next/navigation'
import { useDispatch } from '@/utils/hooks'
import { setInLobby, setPlayerId } from '@/stores/features/gameSlice'
import API from '@/api/API'
import clsx from 'clsx'
import { CSSProperties } from 'react'

interface GameServer {
  id: string
  name: string
  serverName?: string
  cntPlayers: number
  isPrivate: boolean
}

export default function JoinServerPage() {
  const [showPrivate, setShowPrivate] = useState(true)
  const [selectedServer, setSelectedServer] = useState<number | null>(null)
  const [password, setPassword] = useState('')
  const [selectOne, setSelectOne] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [servers, setServers] = useState<GameServer[]>([])
  const router = useRouter()
  const dispatch = useDispatch()

  useEffect(() => {
    API.playOnline(true)
    ;(async () => {
      const servers = await API.getServers()
      setServers(servers)
    })()
    const interval = setInterval(async () => {
      const servers = await API.getServers()
      setServers(servers)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const handleJoinServer = async () => {
    if (selectedServer === null) return
    const serverId = servers[selectedServer].id
    const playerId = await API.joinServer(serverId, password)
    dispatch(setPlayerId(playerId))
    dispatch(setInLobby(true))
    router.push('/waiting-lobby')
  }

  return (
    <Paper>
      <Grid container justifyContent="center" alignItems="center" spacing={5}>
        <Grid item xs={12}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
            spacing={2}
          >
            <p
              style={{
                color: `${showPrivate ? ' white' : 'gray'}`,
                textShadow: `${showPrivate ? '0 0 3px white' : ''}`,
              }}
            >
              Show Private Servers
            </p>
            <Checkbox
              defaultChecked
              color="info"
              onChange={() => {
                setShowPrivate(!showPrivate)
                setSelectedServer(null)
                setSelectOne(false)
              }}
            />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Table>
            {servers.map((server, index) => {
              return (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedServer(index)
                    setSelectOne(true)
                    setPassword('')
                    if (server.isPrivate) setIsPrivate(true)
                    else setIsPrivate(false)
                  }}
                  className={clsx(
                    'flex h-[45px] cursor-pointer items-center justify-around rounded-3xl px-4 text-white transition'
                  )}
                  style={
                    (() => {
                      const style: CSSProperties = {}
                      if (index === selectedServer) {
                        style.backgroundColor = 'rgba(0,0,0,.5)'
                        style.borderRadius = '1rem'
                      }
                      if (index === selectedServer && server.isPrivate) {
                        style.border = '1px solid #fb0303'
                        style.borderWidth = '0 0 3px 2px'
                        style.boxShadow = 'inset 1px 0 5px 1px black'
                      }
                      return style
                    })()
                  }
                >
                  {index === selectedServer && server.isPrivate ? (
                    <>
                      <p className="flex w-1/3 items-center justify-center">
                        {server.serverName || server.name}
                      </p>
                      <input
                        type="password"
                        placeholder="Enter the server password"
                        className="w-full bg-transparent text-center text-white outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      <p className="flex w-1/3 items-center justify-center">{server.name}</p>
                      <p className="flex w-1/3 items-center justify-center">
                        {server.cntPlayers}
                      </p>
                      <p className="flex w-1/3 items-center justify-center">
                        {server.isPrivate ? 'Yes' : ''}
                      </p>
                    </>
                  )}
                </div>
              )
            })}
          </Table>
        </Grid>
        <Grid item xs={12}>
          {((selectOne && isPrivate && password) || (selectOne && !isPrivate)) && (
            <Button onClick={handleJoinServer}>
              <Typography>Join Game</Typography>
            </Button>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}

