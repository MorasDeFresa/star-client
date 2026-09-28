import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function EstadoVacio({
  titulo = "No hay resultados",
  detalle,
}: {
  titulo?: string;
  detalle?: string;
}) {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{ py: 8, px: 2, textAlign: "center" }}
      data-testid="estado-vacio"
    >
      <Stack spacing={1} sx={{ alignItems: "center" }}>
        <Typography variant="h3" component="h2">
          {titulo}
        </Typography>
        {detalle && (
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: "34rem" }}>
            {detalle}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
