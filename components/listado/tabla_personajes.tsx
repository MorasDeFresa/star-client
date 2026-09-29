"use client";

import { useEffect, useRef } from "react";
import { NetworkStatus } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
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
import { TAMANO_PAGINA } from "@/lib/datos/tamano_pagina";
import { con_apariciones, mapear_personajes } from "@/lib/datos/normalizar_datos";
import { use_paginacion_por_cursor } from "@/hooks/use_paginacion_por_cursor";
import type { IndiceApariciones, PaginaPersonajes, PersonajeResumen } from "@/lib/datos/tipos_vista";
import EstadoVacio from "@/components/ui/estado_vacio";
import FilaPersonaje from "./fila_personaje";
import Paginacion from "./paginacion";

const COLUMNAS = 5;

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

/** El listado en tabla, para pantallas anchas. En vez de encadenar páginas avanza
    de una en una: cada página es una consulta aparte, así que el servidor solo
    manda las diez filas que se ven. */
export default function TablaPersonajes({
  paginaInicial,
  resultadosBusqueda,
  indiceApariciones,
}: {
  paginaInicial: PaginaPersonajes;
  resultadosBusqueda?: PersonajeResumen[] | undefined;
  indiceApariciones: IndiceApariciones;
}) {
  const enBusqueda = resultadosBusqueda !== undefined;
  const totalServidor = paginaInicial.total;

  const { pagina, totalPaginas, cursor, preparando, error: errorPaginacion, ir_a, reintentar } =
    use_paginacion_por_cursor(paginaInicial.cursorSiguiente, totalServidor);

  const { data, error, networkStatus, refetch } = useQuery(ConsultarPersonajesDocument, {
    variables: { first: TAMANO_PAGINA, after: cursor ?? null },
    // Sin el cursor de la página no hay nada que leer todavía: se espera a que el
    // hook lo descubra en vez de volver a pedir la primera página.
    skip: cursor === undefined,
    notifyOnNetworkStatusChange: true,
  });

  const conexion = data?.allPeople;
  const total = conexion?.totalCount ?? totalServidor;

  // Hasta que la consulta del cliente responde se pintan las filas que ya venían
  // del servidor, para que la tabla no se vacíe al hidratar. En las páginas
  // siguientes no: si fallan, la tabla se queda vacía en vez de mostrar las
  // filas de la primera bajo un contador que dice otra cosa.
  const filasServidor = pagina === 1 ? paginaInicial.personajes : [];
  const personajes: PersonajeResumen[] = enBusqueda
    ? resultadosBusqueda
    : con_apariciones(
        conexion ? mapear_personajes(conexion.people) : filasServidor,
        indiceApariciones,
      );

  const cargando = !enBusqueda && networkStatus === NetworkStatus.loading;
  const fallo = error ?? errorPaginacion;

  // Al cambiar de página se vuelve al principio del listado: si no, el usuario
  // aterriza a mitad de la tabla y tiene que subir para ver la cabecera. El
  // primer render no cuenta, que ahí ya está donde tiene que estar.
  const paginaPrevia = useRef(pagina);
  useEffect(() => {
    if (paginaPrevia.current === pagina) return;
    paginaPrevia.current = pagina;
    document.getElementById("listado")?.scrollIntoView({ block: "start" });
  }, [pagina]);

  return (
    <Stack spacing={2}>
      {/* `aria-live` para que el cambio de "Página 1 de 9" a "Página 2 de 9" se
          anuncie. Con la búsqueda es lo que comunica el resultado.
          `tabular-nums` evita que el ancho de la fila se mueva. */}
      <Typography
        variant="body2"
        color="text.secondary"
        aria-live="polite"
        sx={{ fontVariantNumeric: "tabular-nums" }}
      >
        {enBusqueda
          ? `${personajes.length} de ${total} personajes coinciden con la busqueda`
          : `Página ${pagina} de ${totalPaginas} · ${total} personajes`}
      </Typography>

      {fallo && (
        <Alert
          severity="error"
          variant="outlined"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => (errorPaginacion ? reintentar() : void refetch())}
            >
              Reintentar
            </Button>
          }
        >
          No se pudo cargar esa página de personajes. {fallo.message}
        </Alert>
      )}

      {personajes.length === 0 ? (
        fallo ? null : (
          <EstadoVacio
            titulo={enBusqueda ? "Ningún personaje coincide" : "No hay personajes"}
            detalle={
              enBusqueda
                ? "Prueba con otro nombre o borra la búsqueda para volver a ver el listado completo."
                : "El API público no devolvió ningún personaje."
            }
          />
        )
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table aria-label="Listado de personajes de Star Wars">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell align="right">Apariciones</TableCell>
                <TableCell>Primera aparición</TableCell>
                <TableCell>Última aparición</TableCell>
                <TableCell align="right">
                  <span style={visualmente_oculto}>Acción</span>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {personajes.map((personaje) => (
                <FilaPersonaje key={personaje.id} personaje={personaje} />
              ))}
              {/* Filas de carga al final: sostienen el ancho de columna sin
                  desplazar las filas ya visibles. */}
              {cargando &&
                Array.from({ length: 3 }, (_, indice) => (
                  <TableRow key={`cargando-${indice}`}>
                    <TableCell colSpan={COLUMNAS}>
                      <Skeleton height={28} />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!enBusqueda && (
        <Paginacion
          pagina={pagina}
          totalPaginas={totalPaginas}
          total={total}
          from={(pagina - 1) * TAMANO_PAGINA + 1}
          to={(pagina - 1) * TAMANO_PAGINA + personajes.length}
          disabled={preparando}
          onCambio={ir_a}
        />
      )}
    </Stack>
  );
}
