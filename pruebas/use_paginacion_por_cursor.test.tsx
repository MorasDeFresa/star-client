import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ApolloLink } from "@apollo/client";
import { MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import { ConsultarPersonajesDocument } from "@/lib/graphql/generados/graphql";
import { TAMANO_PAGINA } from "@/lib/datos/tamano_pagina";
import { use_paginacion_por_cursor } from "@/hooks/use_paginacion_por_cursor";

const TOTAL = 90;

function paginaMock(after: string | null, siguiente: string): MockLink.MockedResponse {
  return {
    request: { query: ConsultarPersonajesDocument, variables: { first: TAMANO_PAGINA, after } },
    maxUsageCount: 4,
    result: {
      data: {
        allPeople: {
          totalCount: TOTAL,
          pageInfo: { hasNextPage: true, endCursor: siguiente },
          people: [],
        },
      },
    },
  };
}

const CAMINO = [paginaMock(null, "c1"), paginaMock("c1", "c2"), paginaMock("c2", "c3"), paginaMock("c3", "c4")];

function montar(mocks: MockLink.MockedResponse[] = CAMINO) {
  const peticiones: (string | null)[] = [];
  const registro = new ApolloLink((operacion, siguiente_enlace) => {
    peticiones.push(operacion.variables.after ?? null);
    return siguiente_enlace(operacion);
  });
  function Proveedor({ children }: { children: ReactNode }) {
    return (
      <MockedProvider link={ApolloLink.from([registro, new MockLink(mocks)])}>{children}</MockedProvider>
    );
  }

  const hook = renderHook(() => use_paginacion_por_cursor("c1", TOTAL), { wrapper: Proveedor });
  return { ...hook, peticiones };
}

describe("use_paginacion_por_cursor", () => {
  test("empieza en la primera pagina y con el total conocido", () => {
    const { result } = montar();

    expect(result.current.pagina).toBe(1);
    expect(result.current.totalPaginas).toBe(9);
    // El servidor ya entrego la primera pagina con su cursor siguiente.
    expect(result.current.cursor).toBeNull();
    expect(result.current.preparando).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("la segunda pagina ya tiene cursor, no hace falta pedirla", async () => {
    const { result, peticiones } = montar();

    await act(async () => {
      result.current.ir_a(2);
    });

    expect(result.current.pagina).toBe(2);
    expect(result.current.cursor).toBe("c1");
    expect(peticiones).toEqual([]);
  });

  test("una pagina lejana pide solo las que faltan por el camino", async () => {
    const { result, peticiones } = montar();

    await act(async () => {
      result.current.ir_a(4);
    });

    await waitFor(() => expect(result.current.preparando).toBe(false));

    expect(result.current.pagina).toBe(4);
    expect(result.current.cursor).toBe("c3");
    // La 1 y la 2 no: la 1 vino del servidor y la 2 solo se necesita por su cursor.
    expect(peticiones).toEqual(["c1", "c2"]);
  });

  test("volver atras no vuelve a pedir lo ya servido", async () => {
    const { result, peticiones } = montar();

    await act(async () => {
      result.current.ir_a(4);
    });
    await waitFor(() => expect(result.current.preparando).toBe(false));
    await act(async () => {
      result.current.ir_a(1);
    });

    expect(result.current.pagina).toBe(1);
    expect(result.current.cursor).toBeNull();
    expect(peticiones).toEqual(["c1", "c2"]);
  });

  test("acota el destino a las paginas que existen", async () => {
    const { result, peticiones } = montar();

    await act(async () => {
      result.current.ir_a(99);
    });

    // La 9 tambien necesita su camino, pero nunca se pasa de la ultima.
    expect(result.current.pagina).toBe(9);
    expect(peticiones.length).toBeGreaterThan(0);
  });

  test("un fallo al caminar se puede reintentar", async () => {
    // El primer salto a la segunda pagina se cae; el reintento ya la encuentra.
    const { result, peticiones } = montar([
      paginaMock(null, "c1"),
      {
        request: { query: ConsultarPersonajesDocument, variables: { first: TAMANO_PAGINA, after: "c1" } },
        maxUsageCount: 1,
        error: new Error("se cayo el servidor"),
      },
      paginaMock("c1", "c2"),
      paginaMock("c2", "c3"),
    ]);

    await act(async () => {
      result.current.ir_a(4);
    });

    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.error?.message).toBe("se cayo el servidor");
    // Sin cursor no se puede leer la pagina de destino todavia.
    expect(result.current.cursor).toBeUndefined();

    await act(async () => {
      result.current.reintentar();
    });

    // El error se limpia al pulsar, antes de que el camino este entero: lo que
    // dice que el reintento funciono es que aparezca el cursor de destino.
    await waitFor(() => expect(result.current.cursor).toBe("c3"));
    expect(result.current.error).toBeNull();
    expect(peticiones).toEqual(["c1", "c1", "c2"]);
  });
});
