import { createTheme } from "@mui/material/styles";

const AMBAR = "#f5a524";
const AMBAR_OSCURO = "#c47f0a";
const AZUL_ENLACES = "#7db8ff";

export const tema_star_wars = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: AMBAR,
      dark: AMBAR_OSCURO,
      contrastText: "#1a1206",
    },
    secondary: {
      main: AZUL_ENLACES,
    },
    background: {
      default: "#0b0d12",
      paper: "#151922",
    },
    text: {
      primary: "#f4f6fb",
      secondary: "#a7b0c0",
    },
    divider: "rgba(255, 255, 255, 0.12)",
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    h1: { fontSize: "2rem", fontWeight: 700 },
    h2: { fontSize: "1.5rem", fontWeight: 700 },
    h3: { fontSize: "1.25rem", fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "::selection": {
          backgroundColor: AMBAR,
          color: "#1a1206",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "rgba(245, 165, 36, 0.07)",
          },
        },
      },
    },
  },
});
