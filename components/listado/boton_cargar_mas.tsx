"use client";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

export default function BotonCargarMas({
  onCargar,
  cargando,
  disabled,
}: {
  onCargar: () => void;
  cargando?: boolean;
  disabled?: boolean;
}) {
  return (
    <Stack sx={{ py: 3, alignItems: "center" }}>
      <Button
        onClick={onCargar}
        disabled={disabled || cargando}
        variant="outlined"
        startIcon={cargando ? <CircularProgress size={16} color="inherit" /> : undefined}
      >
        {cargando ? "Cargando más personajes" : "Cargar más personajes"}
      </Button>
    </Stack>
  );
}
