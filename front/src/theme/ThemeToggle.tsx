import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlined from '@mui/icons-material/LightModeOutlined'
import SettingsBrightnessOutlined from '@mui/icons-material/SettingsBrightnessOutlined'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import { useColorScheme } from '@mui/material/styles'
import { useState, type MouseEvent } from 'react'

type Mode = 'light' | 'dark' | 'system'

const OPTIONS: { mode: Mode; label: string; Icon: typeof LightModeOutlined }[] = [
  { mode: 'light', label: 'Claro', Icon: LightModeOutlined },
  { mode: 'dark', label: 'Escuro', Icon: DarkModeOutlined },
  { mode: 'system', label: 'Sistema', Icon: SettingsBrightnessOutlined },
]

export function ThemeToggle() {
  const { mode, setMode } = useColorScheme()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)

  // Na primeira renderização o MUI ainda não leu o modo salvo
  if (!mode) return null

  const current = OPTIONS.find((option) => option.mode === mode) ?? OPTIONS[2]

  function choose(selected: Mode) {
    setMode(selected)
    setAnchor(null)
  }

  return (
    <>
      <Tooltip title={`Tema: ${current.label}`}>
        <IconButton
          aria-label="Alterar tema"
          aria-haspopup="menu"
          aria-controls={anchor ? 'theme-menu' : undefined}
          onClick={(event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget)}
        >
          <current.Icon />
        </IconButton>
      </Tooltip>
      <Menu id="theme-menu" anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {OPTIONS.map(({ mode: option, label, Icon }) => (
          <MenuItem key={option} selected={option === mode} onClick={() => choose(option)}>
            <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
            <ListItemText>{label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
