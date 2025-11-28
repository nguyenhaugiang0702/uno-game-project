'use client'

import { Provider } from 'react-redux'
import { store } from '@/stores/store'
import CssBaseline from '@mui/material/CssBaseline'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <CssBaseline />
      {children}
    </Provider>
  )
}

