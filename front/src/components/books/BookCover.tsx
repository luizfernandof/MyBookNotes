import Box from '@mui/material/Box'
import { useState } from 'react'

const SIZES = {
  small: { width: 88, height: 130 },
  large: { width: 160, height: 236 },
}

// Mostra a capa ou, se não houver URL (ou a imagem falhar), a inicial do título
export function BookCover({ title, coverUrl, size = 'small' }: { title: string; coverUrl: string | null; size?: keyof typeof SIZES }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  if (coverUrl && coverUrl !== failedUrl) {
    return (
      <Box
        component="img"
        src={coverUrl}
        alt=""
        loading="lazy"
        onError={() => setFailedUrl(coverUrl)}
        sx={{ ...SIZES[size], flexShrink: 0, objectFit: 'cover', borderRadius: 1.5, bgcolor: 'divider' }}
      />
    )
  }

  return (
    <Box
      aria-hidden="true"
      sx={{
        ...SIZES[size],
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
