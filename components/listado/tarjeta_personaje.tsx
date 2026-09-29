"use client";

import NextLink from "next/link";
import type { Route } from "next";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatear_fecha_pelicula, SIN_DATO } from "@/lib/utilidades/formatear_medidas";
import type { PersonajeResumen } from "@/lib/datos/tipos_vista";

function apariciones(texto: number | null): string {
  if (texto === null) return SIN_DATO;
  return `${texto} ${texto === 1 ? "película" : "películas"}`;
}

/** La version en tarjeta de `FilaPersonaje`, para pantallas estrechas. Mismo
    contrato de accesibilidad: un unico control, el enlace del nombre, que
    cubre la tarjeta entera; el resto son datos. */
export default function TarjetaPersonaje({ personaje }: { personaje: PersonajeResumen }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        position: "relative",
        transition: "border-color 120ms",
        "&:hover": { borderColor: "primary.main" },
      }}
    >
      <Stack spacing={1.5}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
          <Link
            component={NextLink}
            href={`/personajes/${personaje.id}` as Route}
            aria-label={`Ver el detalle de ${personaje.nombre}`}
            underline="hover"
            color="inherit"
            sx={{
              textDecoration: "none",
              "&::after": { content: '""', position: "absolute", inset: 0 },
            }}
          >
            {personaje.nombre}
          </Link>
        </Typography>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
          <Chip
            label={apariciones(personaje.apariciones)}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Primera aparición: {formatear_fecha_pelicula(personaje.primeraAparicion) ?? SIN_DATO}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Última aparición: {formatear_fecha_pelicula(personaje.ultimaAparicion) ?? SIN_DATO}
        </Typography>
      </Stack>
    </Paper>
  );
}
