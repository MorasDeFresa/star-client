"use client";

import { useMemo } from "react";
import Stack from "@mui/material/Stack";
import { use_consulta_de_la_url } from "@/hooks/use_consulta_de_la_url";
import type { IndiceNombres, PaginaPersonajes, PersonajeResumen } from "@/lib/datos/tipos_vista";
import BuscadorPersonajes from "./buscador_personajes";
import TablaPersonajes from "./tabla_personajes";

export default function ListadoInteractivo({
  paginaInicial,
  indiceNombres,
}: {
  paginaInicial: PaginaPersonajes;
  indiceNombres: IndiceNombres;
}) {
  const consulta = use_consulta_de_la_url();

  const resultados = useMemo<PersonajeResumen[] | undefined>(() => {
    const termino = consulta.trim().toLowerCase();
    if (!termino) return undefined;

    return indiceNombres.entradas
      .filter((entrada) => entrada.nombre.toLowerCase().includes(termino))
      .map((entrada) => ({
        id: entrada.id,
        nombre: entrada.nombre,
        genero: null,
        anioNacimiento: null,
      }));
  }, [consulta, indiceNombres]);

  return (
    <Stack spacing={3}>
      <BuscadorPersonajes />
      <TablaPersonajes paginaInicial={paginaInicial} resultadosBusqueda={resultados} />
    </Stack>
  );
}
