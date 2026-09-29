"use client";

import MuiPagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/** Los números de página, con los nombres accesibles en castellano que MUI no
    trae de serie (`getItemAriaLabel` solo acepta los valores por defecto). */
export default function Paginacion({
  pagina,
  totalPaginas,
  total,
  from,
  to,
  disabled,
  onCambio,
}: {
  pagina: number;
  totalPaginas: number;
  total: number;
  /** Primer y último personaje de la página, para el resumen. */
  from: number;
  to: number;
  disabled?: boolean;
  onCambio: (pagina: number) => void;
}) {
  if (totalPaginas <= 1) return null;

  return (
    <Stack spacing={1} sx={{ alignItems: "center", py: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
        Mostrando {from}–{to} de {total} personajes
      </Typography>
      <MuiPagination
        count={totalPaginas}
        page={pagina}
        disabled={disabled}
        onChange={(_evento, destino) => onCambio(destino)}
        color="primary"
        shape="rounded"
        showFirstButton
        showLastButton
        getItemAriaLabel={(tipo, paginaActual) => {
          if (tipo === "page") return `Ir a la página ${paginaActual}`;
          if (tipo === "first") return "Ir a la primera página";
          if (tipo === "last") return "Ir a la última página";
          if (tipo === "next") return "Ir a la página siguiente";
          return "Ir a la página anterior";
        }}
      />
    </Stack>
  );
}
