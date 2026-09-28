"use client";

import NextLink from "next/link";
import type { Route } from "next";
import Button from "@mui/material/Button";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { formatear_genero, formatear_nacimiento, SIN_DATO } from "@/lib/utilidades/formatear_medidas";
import type { PersonajeResumen } from "@/lib/datos/tipos_vista";

export default function FilaPersonaje({ personaje }: { personaje: PersonajeResumen }) {
  return (
    <TableRow
      component={NextLink}
      href={`/personajes/${personaje.id}` as Route}
      hover
      sx={{ textDecoration: "none" }}
      aria-label={`Ver el detalle de ${personaje.nombre}`}
    >
      <TableCell component="th" scope="row">
        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
          {personaje.nombre}
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
        <Button size="small" variant="text" tabIndex={-1} aria-hidden>
          Ver detalle
        </Button>
      </TableCell>
    </TableRow>
  );
}
