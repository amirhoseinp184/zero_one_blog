import {
  createTheme,
  CssBaseline,
  StyledEngineProvider,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material";

import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "@mui/stylis-plugin-rtl";
import { blue } from "@mui/material/colors";

const rtlCache = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

function Rtl({ children }) {
  return <CacheProvider value={rtlCache}>{children}</CacheProvider>;
}

export function ThemeProvider({ children }) {
  const theme = createTheme({
    direction: "rtl",
    typography: {
      fontFamily: "Vazirmatn",
      button: {
        textTransform: "none",
      },
    },
    colorSchemes: {
      dark: {
        palette: {
          primary: {
            main: blue[600],
          },
          error: {
            main: "#ef4056",
          },
          dark: {
            dark: "#000000",
            main: "#121212",
            // light: '#262626',
            light: "#1f1f1f",
            contrastText: "#FFFFFF",
          },
          divider: "#FFFFFF",
        },
      },
      light: {
        divider: "#222222",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          .size-full{
            width: 100%;
            height: 100%;
          }
          ul{
            padding:0!important;  
          }
          @keyframes bounce {
            0%, 100% {
              transform: translateY(-25%);
              animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
            }
            50% {
              transform: none;
              animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
            }
          }
       `,
      },
    },
  });

  return (
    <StyledEngineProvider>
      <Rtl>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </Rtl>
    </StyledEngineProvider>
  );
}
