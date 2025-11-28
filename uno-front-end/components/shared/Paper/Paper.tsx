'use client'

import Grid from '@mui/material/Grid'
import { motion } from 'framer-motion'

interface PaperProps {
  children: React.ReactNode
  [key: string]: any
}

const Paper = ({ children, ...props }: PaperProps) => {
  return (
    <Grid
      component={motion.div}
      initial={{ opacity: 0, x: 500 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -500 }}
      transition={{ duration: 0.7 }}
      container
      alignItems="center"
      justifyContent="center"
      {...props}
    >
      <Grid item xs={12} md={10} lg={8}>
        <div className="relative mx-[5vw] my-[20vh] min-h-[60vh] rounded-2xl bg-[var(--panel-bg)] px-10 pb-16 pt-24 text-center shadow-[1px_3px_18px_rgba(0,6,50,1)]">
          <img
            className="absolute left-1/2 top-0 w-36 -translate-x-1/2 -translate-y-1/2"
            src="/assets/images/uno-logo.png"
            alt="UNO logo"
          />
          {children}
        </div>
      </Grid>
    </Grid>
  )
}

export default Paper

