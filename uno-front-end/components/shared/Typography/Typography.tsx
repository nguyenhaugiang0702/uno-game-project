'use client'

import React from 'react'
import { Typography as MuiTypography } from '@mui/material'
import clsx from 'clsx'

const Typography = ({
  className,
  ...props
}: {
  children: React.ReactNode
  className?: string
  [key: string]: any
}) => {
  return <MuiTypography {...props} className={clsx('text-white font-semibold', className)} />
}

export default Typography

