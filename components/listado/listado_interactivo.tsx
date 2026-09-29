"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import Stack from "@mui/material/Stack";
import { use_consulta_de_la_url } from "@/hooks/use_consulta_de_la_url";
import { use_es_escritorio } from "@/hooks/use_es_escritorio";
import { ConsultarPeliculasDocument } from "@/lib/graphql/generados/graphql";
import { con_apariciones, normalizar_indice_apariciones } from "@/lib/datos/normalizar_datos";
import type { IndiceNombres, PaginaPersonajes, PersonajeResumen } from "@/lib/datos/tipos_vista";
import BuscadorPersonajes from "./buscador_personajes";
import TablaPersonajes from "./tabla_personajes";
import TarjetasPersonajes from "./tarjetas_personajes";

export default function ListadoInteractivo({
  paginaInicial,
  indiceNombres,
}: {
  paginaInicial: PaginaPersonajes;
  indiceNombres: IndiceNombres;
}) {
  const consulta = use_consulta_de_la_url();
  const esEscritorio = use_es_escritorio();

  // El indice de apariciones es el mismo para toda la tabla (son seis peliculas),
  // asi que se consulta una vez y se comparte con las filas paginadas.
  const { data: peliculas } = useQuery(ConsultarPeliculasDocument);
  const indiceApariciones = useMemo(
    () => normalizar_indice_apariciones(peliculas?.allFilms),
    [peliculas],
  );

  const resultados = useMemo<PersonajeResumen[] | undefined>(() => {
    const termino = consulta.trim().toLowerCase();
    if (!termino) return undefined;

    return con_apariciones(
      indiceNombres.entradas
        .filter((entrada) => entrada.nombre.toLowerCase().includes(termino))
        .map((entrada) => ({
          id: entrada.id,
          nombre: entrada.nombre,
          apariciones: null,
          primeraAparicion: null,
          ultimaAparicion: null,
        })),
      indiceApariciones,
    );
  }, [consulta, indiceNombres, indiceApariciones]);

  // Una sola vista a la vez: en escritorio la tabla pagina, en movil las
  // tarjetas encadenan. Montar las dos pediria los mismos datos dos veces.
  const Listado = esEscritorio ? TablaPersonajes : TarjetasPersonajes;

  return (
    <Stack spacing={3}>
      <BuscadorPersonajes />
      <Listado
        paginaInicial={paginaInicial}
        indiceApariciones={indiceApariciones}
        resultadosBusqueda={resultados}
      />
    </Stack>
  );
}
