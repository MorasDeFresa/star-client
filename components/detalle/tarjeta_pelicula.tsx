import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PublicIcon from "@mui/icons-material/Public";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ChipPlaneta from "@/components/ui/chip_planeta";
import {
  formatear_episodio,
  formatear_fecha_pelicula,
  SIN_DATO,
} from "@/lib/utilidades/formatear_medidas";
import type { PeliculaDetalle } from "@/lib/datos/tipos_vista";

export default function TarjetaPelicula({ pelicula }: { pelicula: PeliculaDetalle }) {
  const etiquetaEpisodio = formatear_episodio(pelicula.episodio);
  const fecha = formatear_fecha_pelicula(pelicula.fechaLanzamiento);

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", alignItems: "baseline" }}>
        {/* El numero de episodio ordena las peliculas de la saga, que es como
            las piensa cualquiera que no las haya visto por orden de fecha. */}
        {etiquetaEpisodio && (
          <Chip size="small" label={etiquetaEpisodio} sx={{ fontVariantNumeric: "tabular-nums" }} />
        )}
        <Typography variant="h3" component="h3">
          {pelicula.titulo}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <CalendarMonthIcon fontSize="inherit" color="action" aria-hidden />
          <Typography variant="body2" color="text.secondary">
            {fecha ?? SIN_DATO}
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Director: {pelicula.director ?? SIN_DATO}
        </Typography>
      </Stack>

      {pelicula.planetas.length > 0 && (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
          <PublicIcon fontSize="small" color="action" aria-hidden />
          <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
            Planetas:
          </Typography>
          {pelicula.planetas.map((planeta) => (
            <ChipPlaneta key={planeta.id} nombre={planeta.nombre} contexto={pelicula.titulo} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
