import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

export function LoadingState({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: fullScreen ? '100vh' : 240 }}>
      <CircularProgress aria-label="Carregando" />
    </Box>
  )
}
