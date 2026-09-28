"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export default function EstadoError({
  titulo = "No se pudieron cargar los datos",
  detalle,
  onReintentar,
}: {
  titulo?: string;
  detalle?: string;
  onReintentar?: () => void;
}) {
  return (
    <Alert
      severity="error"
      variant="outlined"
      sx={{ m: 2 }}
      action={
        onReintentar && (
          <Button color="inherit" size="small" onClick={onReintentar}>
            Reintentar
          </Button>
        )
      }
    >
      <Stack spacing={0.5} sx={{ alignItems: "flex-start" }}>
        <strong>{titulo}</strong>
        {detalle && <span>{detalle}</span>}
      </Stack>
    </Alert>
  );
}
