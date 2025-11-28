'use client'

import * as React from 'react'
import { Switch as MuiSwitch } from '@mui/material'

interface SwitchProps {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  defaultChecked?: boolean
  checked?: boolean
}

export default function Switch(props: SwitchProps) {
  return (
    <MuiSwitch
      {...props}
      sx={{
        width: 48,
        height: 18,
        padding: 0,
        '& .MuiSwitch-switchBase': {
          padding: 0,
          margin: 0,
          transitionDuration: '200ms',
          '&.Mui-checked': {
            transform: 'translateX(30px)',
            color: 'rgb(2 15 108)',
            '& + .MuiSwitch-track': {
              backgroundColor: '#f7f7f7',
              opacity: 1,
              border: 'none',
            },
          },
        },
        '& .MuiSwitch-thumb': {
          boxSizing: 'border-box',
          width: 14,
          height: 14,
          boxShadow: '0 0 3px 0 #ffb100',
          backgroundColor: 'rgb(2 15 108)',
        },
        '& .MuiSwitch-track': {
          borderRadius: 10,
          backgroundColor: '#f7f7f7',
          opacity: 1,
          border: '2px solid rgb(2 15 108)',
        },
      }}
    />
  )
}

