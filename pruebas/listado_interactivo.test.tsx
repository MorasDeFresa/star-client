import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ApolloLink } from "@apollo/client";
import { MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import { ConsultarPeliculasDocument, ConsultarPersonajesDocument } from "@/lib/graphql/generados/graphql";
import { TAMANO_PAGINA } from "@/lib/datos/tamano_pagina";
import type { IndiceNombres, PaginaPersonajes, PersonajeResumen } from "@/lib/datos/tipos_vista";
import ListadoInteractivo from "@/components/listado/listado_interactivo";

const NOMBRE = "Luke Skywalker";

const personajes: PersonajeResumen[] = [
  {
    id: "luke",
    nombre: NOMBRE,
    apariciones: 4,
    primeraAparicion: "1977-05-25",
    ultimaAparicion: "1983-05-25",
  },
];

const paginaInicial: PaginaPersonajes = {
  personajes,
  total: 82,
  cursorSiguiente: "c1",
  hayMas: true,
};

const indiceNombres: IndiceNombres = {
  entradas: personajes.map((personaje) => ({ id: personaje.id, nombre: personaje.nombre })),
  total: 82,
};

const MOCKS = [
  {
    request: { query: ConsultarPeliculasDocument },
    maxUsageCount: 4,
    result: { data: { allFilms: { films: [] } } },
  },
  {
    request: { query: ConsultarPersonajesDocument, variables: { first: TAMANO_PAGINA, after: null } },
    maxUsageCount: 4,
    result: {
      data: {
        allPeople: {
          totalCount: 82,
          pageInfo: { hasNextPage: true, endCursor: "c1" },
          people: [{ id: "luke", name: NOMBRE }],
        },
      },
    },
  },
];

function Proveedor({ children }: { children: ReactNode }) {
  return <MockedProvider link={ApolloLink.from([new MockLink(MOCKS)])}>{children}</MockedProvider>;
}

/** El hook de MUI lee `window.matchMedia`, que `jsdom` no trae. */
function definir_ancho(esEscritorio: boolean) {
  vi.stubGlobal("matchMedia", (consulta: string) => ({
    matches: esEscritorio,
    media: consulta,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

function pintar() {
  render(
    <Proveedor>
      <ListadoInteractivo paginaInicial={paginaInicial} indiceNombres={indiceNombres} />
    </Proveedor>,
  );
}

describe("ListadoInteractivo", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("en escritorio sale la tabla y no hay carga infinita", async () => {
    definir_ancho(true);
    pintar();

    await screen.findByRole("link", { name: /Ver el detalle de Luke Skywalker/ });

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ir a la página 9" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cargar más personajes/i })).not.toBeInTheDocument();
  });

  test("en movil salen las tarjetas y no hay paginacion numerada", async () => {
    definir_ancho(false);
    pintar();

    await screen.findByRole("link", { name: /Ver el detalle de Luke Skywalker/ });

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cargar más personajes/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ir a la página/i })).not.toBeInTheDocument();
  });
});
