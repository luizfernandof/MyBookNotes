import Box from '@mui/material/Box'
import { useState } from 'react'

const SIZE = { width: 88, height: 130 }

// Mostra a capa ou, se não houver URL (ou a imagem falhar), a inicial do título
export function BookCover({ title, coverUrl }: { title: string; coverUrl: string | null }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  if (coverUrl && coverUrl !== failedUrl) {
    return (
      <Box
        component="img"
        src={coverUrl}
        alt=""
        loading="lazy"
        onError={() => setFailedUrl(coverUrl)}
        sx={{ ...SIZE, flexShrink: 0, objectFit: 'cover', borderRadius: 1.5, bgcolor: 'divider' }}
      />
    )
  }

  return (
    <Box
      aria-hidden="true"
      sx={{
        ...SIZE,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 1.5,
        bgcolor: 'divider',
        color: 'text.secondary',
        fontSize: '2rem',
        fontWeight: 700,
      }}
    >
      {title.charAt(0).toUpperCase()}
    </Box>
  )
}
