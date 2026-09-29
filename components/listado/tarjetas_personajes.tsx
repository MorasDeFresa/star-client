"use client";

import { useCallback, useRef, useState } from "react";
import { NetworkStatus } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ConsultarPersonajesDocument } from "@/lib/graphql/generados/graphql";
import { TAMANO_PAGINA } from "@/lib/datos/tamano_pagina";
import { con_apariciones, mapear_personajes } from "@/lib/datos/normalizar_datos";
import { use_observador_scroll_infinito } from "@/hooks/use_observador_scroll_infinito";
import type { IndiceApariciones, PaginaPersonajes, PersonajeResumen } from "@/lib/datos/tipos_vista";
import BotonCargarMas from "./boton_cargar_mas";
import EstadoVacio from "@/components/ui/estado_vacio";
import TarjetaPersonaje from "./tarjeta_personaje";

/** Lo que se sabe de la lista encadenada: las filas ya acumuladas y hasta donde
    se puede seguir leyendo. */
type PilaDePaginas = {
  personajes: PersonajeResumen[];
  cursor: string | null;
  hayMas: boolean;
};

/** El listado en tarjetas, para pantallas estrechas. A diferencia de la tabla de
    escritorio, aqui las paginas se encadenan: cada "cargar mas" apila sus filas
    debajo de las anteriores, y el scroll infinito pide la siguiente cuando ya
    se ve el final de la lista. */
export default function TarjetasPersonajes({
  paginaInicial,
  resultadosBusqueda,
  indiceApariciones,
}: {
  paginaInicial: PaginaPersonajes;
  resultadosBusqueda?: PersonajeResumen[] | undefined;
  indiceApariciones: IndiceApariciones;
}) {
  const { data, error, fetchMore, networkStatus } = useQuery(ConsultarPersonajesDocument, {
    variables: { first: TAMANO_PAGINA, after: null },
  });

  const conexion = data?.allPeople;
  const enBusqueda = resultadosBusqueda !== undefined;
  const cargandoMas = networkStatus === NetworkStatus.fetchMore;

  // La consulta del cliente se queda siempre en la primera pagina, que es la
  // que el servidor ya entrego y que por eso seeds la pila. Las siguientes se
  // anaden aqui con el cursor y el `hasNextPage` que devuelve cada una: leerlos
  // siempre de `conexion` repetiria la pagina 2 indefinidamente y el boton no
  // se apagaria nunca.
  const [pila, setPila] = useState<PilaDePaginas>({
    personajes: paginaInicial.personajes,
    cursor: paginaInicial.cursorSiguiente,
    hayMas: paginaInicial.hayMas,
  });
  // `networkStatus` llega tarde para un segundo toque en el mismo instante, y
  // el boton y el observer pueden coincidir: el candado va en una ref.
  const en_curso = useRef(false);

  const total = conexion?.totalCount ?? paginaInicial.total;
  const hayMas = !enBusqueda && pila.hayMas;
  const cursor = pila.cursor;

  const cargar_mas = useCallback(async () => {
    if (!hayMas || en_curso.current || !cursor) return;
    en_curso.current = true;
    try {
      const respuesta = await fetchMore({ variables: { first: TAMANO_PAGINA, after: cursor } });
      const pagina = respuesta.data?.allPeople;
      if (!pagina) return;
      setPila((previa) => ({
        personajes: [...previa.personajes, ...mapear_personajes(pagina.people)],
        cursor: pagina.pageInfo.endCursor,
        hayMas: pagina.pageInfo.hasNextPage,
      }));
    } catch {
      // `error` de la consulta ya pinta el aviso; aqui solo se suelta el candado.
    } finally {
      en_curso.current = false;
    }
  }, [hayMas, cursor, fetchMore]);

  const referencia = use_observador_scroll_infinito<HTMLDivElement>(() => {
    void cargar_mas();
  });

  // La pila ya arranca con la primera pagina del servidor, asi que la lista no
  // se vacia al hidratar y no hace falta volver a leer `conexion` para las filas.
  const personajes: PersonajeResumen[] = enBusqueda
    ? resultadosBusqueda
    : con_apariciones(pila.personajes, indiceApariciones);

  return (
    <Stack spacing={2}>
      {/* El contador va en `aria-live` para que el "Mostrando 10" -> "Mostrando
          20" al encadenar paginas se anuncie. */}
      <Typography
        variant="body2"
        color="text.secondary"
        aria-live="polite"
        sx={{ fontVariantNumeric: "tabular-nums" }}
      >
        {enBusqueda
          ? `${personajes.length} de ${total} personajes coinciden con la busqueda`
          : `Mostrando ${personajes.length} de ${total} personajes`}
      </Typography>

      {error && (
        <Alert severity="error" variant="outlined">
          No se pudo cargar la siguiente página de personajes. {error.message}
        </Alert>
      )}

      {personajes.length === 0 ? (
        <EstadoVacio
          titulo={enBusqueda ? "Ningún personaje coincide" : "No hay personajes"}
          detalle={
            enBusqueda
              ? "Prueba con otro nombre o borra la búsqueda para volver a ver el listado completo."
              : "El API público no devolvió ningún personaje."
          }
        />
      ) : (
        <Stack spacing={1.5} component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
          {personajes.map((personaje) => (
            <li key={personaje.id}>
              <TarjetaPersonaje personaje={personaje} />
            </li>
          ))}
          {/* Esqueletos de carga: sostienen el ancho sin desplazar las tarjetas
              ya visibles. `aria-hidden` para no anunciar items vacios. */}
          {cargandoMas &&
            Array.from({ length: 3 }, (_, indice) => (
              <li key={`cargando-${indice}`} aria-hidden>
                <Skeleton variant="rounded" height={124} />
              </li>
            ))}
        </Stack>
      )}

      {!enBusqueda && hayMas && (
        <>
          {/* Ancla del observer: no es interactiva, el boton de abajo es el
              camino accesible. */}
          <div ref={referencia} aria-hidden style={{ height: 1 }} />
          <BotonCargarMas onCargar={() => void cargar_mas()} cargando={cargandoMas} />
        </>
      )}
    </Stack>
  );
}
