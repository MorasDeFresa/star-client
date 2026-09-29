import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ApolloLink } from "@apollo/client";
import { MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import { ConsultarPersonajesDocument } from "@/lib/graphql/generados/graphql";
import { TAMANO_PAGINA } from "@/lib/datos/tamano_pagina";
import type { PaginaPersonajes, PersonajeResumen } from "@/lib/datos/tipos_vista";
import TablaPersonajes from "@/components/listado/tabla_personajes";

const TOTAL = 30;
const SIN_INDICE = new Map();

/** `first` filas por pagina, con nombres reconocibles: `Personaje 2.3` es la
    cuarta fila de la segunda pagina. */
function gente(pagina: number) {
  return Array.from({ length: TAMANO_PAGINA }, (_, indice) => ({
    id: `p${pagina}-${indice}`,
    name: `Personaje ${pagina}.${indice}`,
  }));
}

function resúmenes(pagina: number): PersonajeResumen[] {
  return gente(pagina).map((persona, indice) => ({
    id: persona.id,
    nombre: persona.name,
    apariciones: indice,
    primeraAparicion: "1977-05-25",
    ultimaAparicion: "1983-05-25",
  }));
}

function paginaMock(after: string | null, numero: number, hayMas: boolean) {
  return {
    request: { query: ConsultarPersonajesDocument, variables: { first: TAMANO_PAGINA, after } },
    maxUsageCount: 4,
    result: {
      data: {
        allPeople: {
          totalCount: TOTAL,
          pageInfo: { hasNextPage: hayMas, endCursor: `c${numero}` },
          people: gente(numero),
        },
      },
    },
  };
}

const paginaInicial: PaginaPersonajes = {
  personajes: resúmenes(1),
  total: TOTAL,
  cursorSiguiente: "c1",
  hayMas: true,
};

/** `MockedProvider` con un enlace delante que apunta cada peticion, para poder
    comprobar cuantas salen y con que cursor. */
function crearProveedor(mocks: MockLink.MockedResponse[]) {
  const peticiones: (string | null)[] = [];
  const registro = new ApolloLink((operacion, siguiente) => {
    peticiones.push(operacion.variables.after ?? null);
    return siguiente(operacion);
  });

  return {
    peticiones,
    Proveedor: ({ children }: { children: ReactNode }) => (
      <MockedProvider link={ApolloLink.from([registro, new MockLink(mocks)])}>
        {children}
      </MockedProvider>
    ),
  };
}

const TRES_PAGINAS = [
  paginaMock(null, 1, true),
  paginaMock("c1", 2, true),
  paginaMock("c2", 3, false),
];

function pintar(resultadosBusqueda?: PersonajeResumen[]) {
  const { Proveedor, peticiones } = crearProveedor(TRES_PAGINAS);

  render(
    <Proveedor>
      <TablaPersonajes
        paginaInicial={paginaInicial}
        indiceApariciones={SIN_INDICE}
        resultadosBusqueda={resultadosBusqueda}
      />
    </Proveedor>,
  );

  return { peticiones };
}

function filas() {
  return screen.getAllByRole("rowheader").map((fila) => fila.textContent);
}

describe("TablaPersonajes", () => {
  beforeEach(() => {
    // La version anterior se colgaba de un `IntersectionObserver`: cualquier
    // interseccion pedia la pagina siguiente sin que nadie la pidiera.
    vi.stubGlobal("IntersectionObserver", undefined);
  });

  test("muestra la primera pagina y las demas como numeros", async () => {
    pintar();

    await screen.findByRole("rowheader", { name: /Personaje 1\.0/ });

    expect(filas()).toHaveLength(TAMANO_PAGINA);
    expect(screen.getByText("Página 1 de 3 · 30 personajes")).toBeInTheDocument();
    expect(screen.getByText("Mostrando 1–10 de 30 personajes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ir a la página 3" })).toBeInTheDocument();
  });

  test("no hay boton de cargar mas: la tabla pagina", async () => {
    pintar();

    await screen.findByRole("rowheader", { name: /Personaje 1\.0/ });

    expect(screen.queryByRole("button", { name: /cargar m/i })).not.toBeInTheDocument();
  });

  test("ir a la pagina 2 pide solo esa pagina", async () => {
    const usuario = userEvent.setup();
    const { peticiones } = pintar();

    await screen.findByRole("rowheader", { name: /Personaje 1\.0/ });
    await usuario.click(screen.getByRole("button", { name: "Ir a la página 2" }));

    await screen.findByRole("rowheader", { name: /Personaje 2\.0/ });

    expect(filas()).toHaveLength(TAMANO_PAGINA);
    expect(filas()[0]).toBe("Personaje 2.0");
    expect(screen.getByText("Mostrando 11–20 de 30 personajes")).toBeInTheDocument();
    // La primera pagina, ni la tercera: solo lo que se ve.
    expect(peticiones).toEqual([null, "c1"]);
  });

  test("saltar a la ultima pide por el camino las que faltan", async () => {
    const usuario = userEvent.setup();
    const { peticiones } = pintar();

    await screen.findByRole("rowheader", { name: /Personaje 1\.0/ });
    await usuario.click(screen.getByRole("button", { name: "Ir a la página 3" }));

    await screen.findByRole("rowheader", { name: /Personaje 3\.0/ });

    expect(filas()[0]).toBe("Personaje 3.0");
    expect(screen.queryByRole("rowheader", { name: /Personaje 1\.0/ })).not.toBeInTheDocument();
    expect(screen.getByText("Mostrando 21–30 de 30 personajes")).toBeInTheDocument();
    // La 2 solo se pide para obtener su cursor; la 1 sale de la cache.
    expect(peticiones).toEqual([null, "c1", "c2"]);
  });

  test("volver a una pagina ya vista no vuelve a pedirla", async () => {
    const usuario = userEvent.setup();
    const { peticiones } = pintar();

    await screen.findByRole("rowheader", { name: /Personaje 1\.0/ });
    await usuario.click(screen.getByRole("button", { name: "Ir a la página 2" }));
    await screen.findByRole("rowheader", { name: /Personaje 2\.0/ });
    await usuario.click(screen.getByRole("button", { name: "Ir a la primera página" }));

    await screen.findByRole("rowheader", { name: /Personaje 1\.0/ });

    expect(filas()[0]).toBe("Personaje 1.0");
    expect(peticiones).toEqual([null, "c1"]);
  });

  test("un fallo ofrece reintentar y deja volver a otra pagina", async () => {
    const usuario = userEvent.setup();
    const { Proveedor, peticiones } = crearProveedor([
      paginaMock(null, 1, true),
      {
        request: {
          query: ConsultarPersonajesDocument,
          variables: { first: TAMANO_PAGINA, after: "c1" },
        },
        maxUsageCount: 2,
        error: new Error("se cayo el servidor"),
      },
    ]);

    render(
      <Proveedor>
        <TablaPersonajes
          paginaInicial={paginaInicial}
          indiceApariciones={SIN_INDICE}
          resultadosBusqueda={undefined}
        />
      </Proveedor>,
    );

    await screen.findByRole("rowheader", { name: /Personaje 1\.0/ });
    await usuario.click(screen.getByRole("button", { name: "Ir a la página 2" }));

    const aviso = await screen.findByRole("alert");
    expect(aviso).toHaveTextContent(/se cayo el servidor/);
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Ir a la primera página" }));

    expect(await screen.findByRole("rowheader", { name: /Personaje 1\.0/ })).toBeInTheDocument();
    expect(peticiones).toEqual([null, "c1"]);
  });

  test("con busqueda salen todas las coincidencias y sin paginacion", async () => {
    pintar(resúmenes(1).slice(0, 3));

    expect(await screen.findByText("3 de 30 personajes coinciden con la busqueda")).toBeInTheDocument();
    expect(filas()).toHaveLength(3);
    expect(screen.queryByRole("button", { name: /ir a la pagina/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /página/i })).not.toBeInTheDocument();
  });
});
