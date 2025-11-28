'use client'

import React from 'react'
import { Button as MuiButton } from '@mui/material'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

interface ButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
  [key: string]: any
}

const baseClasses =
  'px-9 py-4 normal-case bg-black/30 border border-[#020F6C] rounded-xl text-white text-center transition-transform duration-100 ease-out inline-flex flex-col items-center hover:scale-105 hover:bg-black/40 active:scale-95 disabled:opacity-50 disabled:pointer-events-none'

const Button = ({ children, href, className, onClick, ...props }: ButtonProps) => {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) onClick()
    if (href && !props.disabled) router.push(href)
  }

  return (
    <MuiButton
      {...props}
      className={clsx(baseClasses, className)}
      onClick={handleClick}
    >
      {children}
    </MuiButton>
  )
}

export default Button

