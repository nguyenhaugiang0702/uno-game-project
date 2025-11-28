'use client'

import { useState, useEffect } from 'react'
import Paper from '@/components/shared/Paper/Paper'
import Grid from '@mui/material/Grid'
import TextField from '@/components/shared/TextField/TextField'
import Avatar from '@/components/shared/Avatar/Avatar'
import Button from '@/components/shared/Button/Button'
import Typography from '@/components/shared/Typography/Typography'
import ReChoiceIcon from '@/components/create-user/ReChoiceIcon'

export default function CreateUserPage() {
  const getLocalStorageName = () => {
    if (typeof window !== 'undefined' && localStorage.getItem('playerName'))
      return localStorage.getItem('playerName') || ''
    else return ''
  }

  const getLocalStorageImg = () => {
    if (typeof window !== 'undefined' && localStorage.getItem('playerImg'))
      return JSON.parse(localStorage.getItem('playerImg') || '0')
    else return Math.random() * 100
  }

  const [playerName, setPlayerName] = useState(getLocalStorageName)
  const [imgSeed, setImgSeed] = useState(getLocalStorageImg)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('playerName', playerName)
      localStorage.setItem('playerImg', String(imgSeed))
    }
  }, [playerName, imgSeed])

  return (
    <Paper>
      <Grid container justifyContent="center" spacing={2}>
        <Grid item xs={10}>
          <Typography>Enter Your Name</Typography>
        </Grid>
        <Grid item xs={10} md={6}>
          <TextField
            type="text"
            placeholder=""
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            pad
          />
        </Grid>

        <Grid
          item
          container
          justifyContent="center"
          alignItems="center"
          spacing={4}
          xs={10}
        >
          <Grid item xs={2}>
            <Avatar seed={`${playerName}${imgSeed}`} />
          </Grid>
          <Grid item xs={1}>
            <Button
              onClick={() => setImgSeed((seed) => seed + 1)}
              style={{
                width: '4vw',
                height: '4vw',
                padding: '35%',
              }}
            >
              <ReChoiceIcon />
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={10}>
          {playerName && imgSeed && (
            <Button href="/main-menu">
              <Typography> Save & Go </Typography>
            </Button>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}

