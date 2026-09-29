"use client";

import NextLink from "next/link";
import type { Route } from "next";
import Link from "@mui/material/Link";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { formatear_fecha_pelicula, SIN_DATO } from "@/lib/utilidades/formatear_medidas";
import type { PersonajeResumen } from "@/lib/datos/tipos_vista";

export default function FilaPersonaje({ personaje }: { personaje: PersonajeResumen }) {
  return (
    <TableRow hover sx={{ position: "relative" }}>
      <TableCell component="th" scope="row">
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "text.primary", display: "inline-block" }}
        >
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
      </TableCell>
      <TableCell align="right">
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontVariantNumeric: "tabular-nums" }}
        >
          {personaje.apariciones ?? SIN_DATO}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {formatear_fecha_pelicula(personaje.primeraAparicion) ?? SIN_DATO}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {formatear_fecha_pelicula(personaje.ultimaAparicion) ?? SIN_DATO}
        </Typography>
      </TableCell>
      <TableCell align="right">
        {/* Solo texto: el `::after` del enlace ya cubre esta celda, asi que un
            boton aqui seria un segundo control que no lleva a ninguna parte. */}
        <Typography
          variant="body2"
          aria-hidden
          sx={{ color: "primary.main", fontWeight: 600, pointerEvents: "none" }}
        >
          Ver detalle
        </Typography>
      </TableCell>
    </TableRow>
  );
}
