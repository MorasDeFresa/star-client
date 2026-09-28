import { Divider, Skeleton, Stack } from "@mui/material";

export default function EsqueletoCajonPersonaje() {
  return (
    <Stack
      aria-hidden
      spacing={2.5}
      sx={{ p: 3, width: { xs: "100vw", sm: 480 } }}
      data-testid="esqueleto-cajon"
    >
      <Skeleton variant="text" width="55%" height={44} />
      <Skeleton variant="text" width="35%" height={24} />

      <Divider />

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
        {Array.from({ length: 6 }, (_, indice) => (
          <Skeleton key={indice} variant="rounded" width={90} height={32} />
        ))}
      </Stack>

      <Divider />

      <Stack spacing={1.5}>
        {Array.from({ length: 3 }, (_, indice) => (
          <Stack key={indice} spacing={0.75}>
            <Skeleton variant="text" width="40%" height={22} />
            <Skeleton variant="text" width="70%" height={18} />
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
