"use client";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

/** `true` a partir del breakpoint `md` de MUI (900px), que es donde la tabla
    deja de necesitar scroll horizontal.

    El servidor no sabe el ancho del navegador, asi que el HTML inicial se
    genera como la tabla: es la vista que mas gente ve y la que/google lee. En
    movil, `defaultMatches` se sustituye por el resultado real de `matchMedia`
    al hidratar y la tabla se cambia por las tarjetas. */
export function use_es_escritorio(): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up("md"), { defaultMatches: true });
}
