"use client";

import { useCallback, useMemo, useState } from "react";
import Stack from "@mui/material/Stack";
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
  const [consulta, set_consulta] = useState("");

  const al_buscar = useCallback((texto: string) => set_consulta(texto), []);

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
      <BuscadorPersonajes onBuscar={al_buscar} />
      <TablaPersonajes paginaInicial={paginaInicial} resultadosBusqueda={resultados} />
    </Stack>
  );
}
