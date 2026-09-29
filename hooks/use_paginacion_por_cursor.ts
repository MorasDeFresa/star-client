"use client";

import { useCallback, useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import { ConsultarPersonajesDocument } from "@/lib/graphql/generados/graphql";
import { TAMANO_PAGINA } from "@/lib/datos/tamano_pagina";

export type Paginacion = {
  /** Número de página, empezando en 1. */
  pagina: number;
  totalPaginas: number;
  /** `after` de la página actual, o `undefined` si todavía no se conoce. */
  cursor: string | null | undefined;
  /** `true` mientras se piden los cursores que faltan para llegar a la página. */
  preparando: boolean;
  error: Error | null;
  ir_a: (destino: number) => void;
  /** Vuelve a pedir los cursores que faltaron, para reintentar tras un fallo. */
  reintentar: () => void;
};

/** `allPeople` pagina por cursor, no por número: para leer la página 7 hay que
    conocer el `endCursor` de la 6, y ese solo existe si se han pedido las
    anteriores. Por eso se guardan los cursores a medida que se descubren: saltar
    de la 3 a la 7 pide las páginas 4, 5 y 6, y como cada respuesta queda en la
    caché, un salto hacia atrás no vuelve a pedir nada.

    `cursores[i]` es el `after` necesario para leer la página `i + 1`; el índice
    0 vale `null` porque la primera página no lleva cursor. Un índice fuera del
    array es un cursor que todavía no se conoce. */
export function use_paginacion_por_cursor(cursorInicial: string | null, total: number): Paginacion {
  const cliente = useApolloClient();
  const [cursores, setCursores] = useState<readonly (string | null)[]>(() =>
    cursorInicial ? [null, cursorInicial] : [null],
  );

  const totalPaginas = Math.max(1, Math.ceil(total / TAMANO_PAGINA));
  const [pagina, setPagina] = useState(1);
  const [preparando, setPreparando] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cursor = pagina - 1 < cursores.length ? cursores[pagina - 1] : undefined;

  /** Pide las páginas intermedias que faltan para conocer el cursor de
      `destino`. No toca la página que se está viendo: solo deja el camino
      preparado para que la consulta de la tabla pueda dispararse. */
  const caminar = useCallback(
    (destino: number, conocidos: readonly (string | null)[]) => {
      setPreparando(true);
      void (async () => {
        const descubiertos: (string | null)[] = [...conocidos];
        try {
          while (destino - 1 >= descubiertos.length) {
            const resultado = await cliente.query({
              query: ConsultarPersonajesDocument,
              variables: { first: TAMANO_PAGINA, after: descubiertos[descubiertos.length - 1] },
            });
            const siguiente = resultado.data?.allPeople?.pageInfo?.endCursor;
            if (!siguiente) break;
            descubiertos.push(siguiente);
          }
        } catch (fallo) {
          setError(fallo instanceof Error ? fallo : new Error(String(fallo)));
        } finally {
          // Dos saltos seguidos pueden recorrer paginas distintas, y los cursores
          // solo se guardan al final: el array mas largo gana.
          setCursores((previos) => (descubiertos.length > previos.length ? descubiertos : previos));
          setPreparando(false);
        }
      })();
    },
    [cliente],
  );

  const ir_a = useCallback(
    (destino: number) => {
      const limitada = Math.min(Math.max(destino, 1), totalPaginas);
      if (limitada === pagina) return;

      setPagina(limitada);
      setError(null);

      // El cursor de destino ya se conoce: la página sale de la caché.
      if (limitada - 1 < cursores.length) return;

      caminar(limitada, cursores);
    },
    [cursores, pagina, totalPaginas, caminar],
  );

  const reintentar = useCallback(() => {
    if (cursor !== undefined) return;
    setError(null);
    caminar(pagina, cursores);
  }, [cursor, pagina, cursores, caminar]);

  return {
    pagina: Math.min(pagina, totalPaginas),
    totalPaginas,
    cursor,
    preparando,
    error,
    ir_a,
    reintentar,
  };
}
