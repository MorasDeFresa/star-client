"use client";

import NextLink from "next/link";
import type { Route } from "next";
import Link from "@mui/material/Link";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { formatear_genero, formatear_nacimiento, SIN_DATO } from "@/lib/utilidades/formatear_medidas";
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
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {personaje.genero ? formatear_genero(personaje.genero) : SIN_DATO}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {personaje.anioNacimiento ? formatear_nacimiento(personaje.anioNacimiento) : SIN_DATO}
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
