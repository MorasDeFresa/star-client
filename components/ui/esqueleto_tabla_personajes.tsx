import { Skeleton, Stack } from "@mui/material";

export default function EsqueletoTablaPersonajes({ filas = 10 }: { filas?: number }) {
  return (
    <Stack
      aria-hidden
      spacing={1}
      sx={{ p: 2 }}
      data-testid="esqueleto-tabla"
      role="presentation"
    >
      {Array.from({ length: filas }, (_, indice) => (
        <Stack key={indice} direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Skeleton variant="text" width="45%" height={28} />
          <Skeleton variant="text" width="15%" height={24} />
          <Skeleton variant="text" width="20%" height={24} />
          <Skeleton variant="rectangular" width={96} height={32} sx={{ ml: "auto" }} />
        </Stack>
      ))}
    </Stack>
  );
}
