"use client";

import { useCallback } from "react";
import { NetworkStatus } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { ConsultarPersonajesDocument } from "@/lib/graphql/generados/graphql";
import { use_observador_scroll_infinito } from "@/hooks/use_observador_scroll_infinito";
import { TAMANO_PAGINA } from "@/lib/datos/tamano_pagina";
import type { PaginaPersonajes, PersonajeResumen } from "@/lib/datos/tipos_vista";
import BotonCargarMas from "./boton_cargar_mas";
import EstadoVacio from "@/components/ui/estado_vacio";
import FilaPersonaje from "./fila_personaje";

const visualmente_oculto = {
  position: "absolute",
  width: 1,
  height: 1,
  p: 0,
  m: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

export default function TablaPersonajes({
  paginaInicial,
  resultadosBusqueda,
}: {
  paginaInicial: PaginaPersonajes;
  resultadosBusqueda?: PersonajeResumen[] | undefined;
}) {
  const { data, error, fetchMore, networkStatus } = useQuery(ConsultarPersonajesDocument, {
    variables: { first: TAMANO_PAGINA, after: null },
  });

  const conexion = data?.allPeople;
  const enBusqueda = resultadosBusqueda !== undefined;
  const cargandoMas = networkStatus === NetworkStatus.fetchMore;

  const pagina: PersonajeResumen[] = enBusqueda
    ? resultadosBusqueda
    : mapear(conexion?.people) ?? paginaInicial.personajes;

  const total = conexion?.totalCount ?? paginaInicial.total;
  const hayMas = !enBusqueda && (conexion?.pageInfo?.hasNextPage ?? paginaInicial.hayMas);

  const cargar_mas = useCallback(async () => {
    if (!hayMas || cargandoMas) return;
    const despues = conexion?.pageInfo?.endCursor ?? paginaInicial.cursorSiguiente;
    if (!despues) return;
    await fetchMore({ variables: { first: TAMANO_PAGINA, after: despues } });
  }, [hayMas, cargandoMas, conexion?.pageInfo?.endCursor, paginaInicial.cursorSiguiente, fetchMore]);

  const referencia = use_observador_scroll_infinito<HTMLDivElement>(() => {
    void cargar_mas();
  });

  return (
    <Stack spacing={2}>
      {/* `aria-live` para que el cambio de "Mostrando 10" a "Mostrando 20" al
          hacer scroll se anuncie. Con la busqueda es lo que comunica el
          resultado. `tabular-nums` evita que el ancho de la fila se mueva. */}
      <Typography
        variant="body2"
        color="text.secondary"
        aria-live="polite"
        sx={{ fontVariantNumeric: "tabular-nums" }}
      >
        {enBusqueda
          ? `${pagina.length} de ${total} personajes coinciden con la busqueda`
          : `Mostrando ${pagina.length} de ${total} personajes`}
      </Typography>

      {error && (
        <Alert severity="error" variant="outlined">
          No se pudo cargar la siguiente pagina de personajes. {error.message}
        </Alert>
      )}

      {pagina.length === 0 ? (
        <EstadoVacio
          titulo={enBusqueda ? "Ningún personaje coincide" : "No hay personajes"}
          detalle={
            enBusqueda
              ? "Prueba con otro nombre o borra la búsqueda para volver a ver el listado completo."
              : "El API público no devolvió ningún personaje."
          }
        />
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table aria-label="Listado de personajes de Star Wars">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Género</TableCell>
                <TableCell>Nacimiento</TableCell>
                <TableCell align="right">
                  <span style={visualmente_oculto}>Acción</span>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagina.map((personaje) => (
                <FilaPersonaje key={personaje.id} personaje={personaje} />
              ))}
              {/* Filas de carga al final: sostienen el ancho de columna sin
                  desplazar las filas ya visibles. */}
              {cargandoMas &&
                Array.from({ length: 3 }, (_, indice) => (
                  <TableRow key={`cargando-${indice}`}>
                    <TableCell colSpan={4}>
                      <Skeleton height={28} />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
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

function mapear(
  personas: readonly ({ id: string; name: string | null; gender: string | null; birthYear: string | null } | null)[] | null | undefined,
): PersonajeResumen[] | undefined {
  if (!personas) return undefined;
  return personas
    .filter((persona): persona is NonNullable<typeof persona> => persona != null)
    .map((personaje) => ({
      id: personaje.id,
      nombre: personaje.name ?? "",
      genero: personaje.gender,
      anioNacimiento: personaje.birthYear,
    }));
}
