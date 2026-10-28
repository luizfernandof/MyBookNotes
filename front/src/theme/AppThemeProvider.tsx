import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { theme } from './theme'

// O modo escolhido (claro, escuro ou sistema) é salvo pelo MUI no localStorage
export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme} defaultMode="system" modeStorageKey="mybooknotes-theme">
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  )
}
