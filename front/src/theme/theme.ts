import { createTheme } from '@mui/material/styles'

// Identidade visual do MyBookNotes: paleta "Floresta" (verde-sálvia), nas versões clara e escura.
// success acompanha a cor principal (status "Lido") e warning é o âmbar das estrelas (status "Lendo").
// As cores viram variáveis CSS, então trocar de tema não recria o tema nem pisca a tela.
export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#2f6b4f' },
        success: { main: '#2f6b4f' },
        warning: { main: '#94600f' },
        background: { default: '#f4f6f3', paper: '#ffffff' },
        text: { primary: '#1f2a24', secondary: '#5e6b63' },
        divider: '#dfe5e0',
      },
    },
    dark: {
      palette: {
        primary: { main: '#7cc4a0' },
        success: { main: '#7cc4a0' },
        warning: { main: '#e0b25a' },
        background: { default: '#111614', paper: '#1a201d' },
        text: { primary: '#e3eae5', secondary: '#9aa8a0' },
        divider: '#2c3530',
      },
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: 'Roboto, system-ui, -apple-system, "Segoe UI", sans-serif',
    h1: { fontSize: '1.75rem', fontWeight: 700 },
    h2: { fontSize: '1.1rem', fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
    },
    MuiTextField: {
      defaultProps: { fullWidth: true },
    },
  },
})
