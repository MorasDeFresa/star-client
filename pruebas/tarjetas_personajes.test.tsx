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
import TarjetasPersonajes from "@/components/listado/tarjetas_personajes";

const TOTAL = 20;
const SIN_INDICE = new Map();
const BOTON_CARGAR = /^cargar más personajes$/i;
const BOTON_CARGANDO = /^cargando más personajes$/i;

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

function paginaMock(after: string | null, numero: number, hayMas: boolean, delay?: number) {
  return {
    request: { query: ConsultarPersonajesDocument, variables: { first: TAMANO_PAGINA, after } },
    maxUsageCount: 4,
    delay,
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

const DOS_PAGINAS = [paginaMock(null, 1, true), paginaMock("c1", 2, false, 250)];

/** Cada peticion que sale del enlace, con su cursor. */
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

/** `jsdom` no implementa `IntersectionObserver`, asi que se instala uno que
    guarda los `observe` para poder fingir que el ancla entra en pantalla. */
let intersecciones: (() => void)[] = [];

function instalarObservador() {
  intersecciones = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(private readonly avisar: IntersectionObserverCallback) {}
      observe() {
        intersecciones.push(() => this.avisar([{ isIntersecting: true }] as never, this as never));
      }
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
}

function pintar(resultadosBusqueda?: PersonajeResumen[], mocks = DOS_PAGINAS) {
  const { Proveedor, peticiones } = crearProveedor(mocks);

  render(
    <Proveedor>
      <TarjetasPersonajes
        paginaInicial={paginaInicial}
        indiceApariciones={SIN_INDICE}
        resultadosBusqueda={resultadosBusqueda}
      />
    </Proveedor>,
  );

  return { peticiones };
}

/** Nombres visibles de las tarjetas, en orden. El enlace se estira sobre la
    tarjeta y su `aria-label` es "Ver el detalle de X", asi que el texto visible
    es solo el nombre. */
function tarjetas() {
  return screen.getAllByRole("link").map((enlace) => enlace.textContent);
}

describe("TarjetasPersonajes", () => {
  beforeEach(() => {
    instalarObservador();
  });

  test("muestra la primera pagina en tarjetas, no en una tabla", async () => {
    pintar();

    await screen.findByRole("link", { name: /Ver el detalle de Personaje 1\.0/ });

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(tarjetas()).toHaveLength(TAMANO_PAGINA);
    expect(screen.getByText("Mostrando 10 de 20 personajes")).toBeInTheDocument();
  });

  test("el boton anade la pagina siguiente debajo, sin quitar la anterior", async () => {
    const usuario = userEvent.setup();
    const { peticiones } = pintar();

    await screen.findByRole("link", { name: /Ver el detalle de Personaje 1\.0/ });
    await usuario.click(screen.getByRole("button", { name: BOTON_CARGAR }));

    await screen.findByRole("link", { name: /Ver el detalle de Personaje 2\.0/ });

    expect(tarjetas()).toHaveLength(TAMANO_PAGINA * 2);
    expect(tarjetas()[0]).toBe("Personaje 1.0");
    expect(tarjetas().at(-1)).toBe("Personaje 2.9");
    expect(screen.getByText("Mostrando 20 de 20 personajes")).toBeInTheDocument();
    expect(peticiones).toEqual([null, "c1"]);
  });

  test("el scroll infinito carga al llegar al final de la lista", async () => {
    pintar();

    await screen.findByRole("link", { name: /Ver el detalle de Personaje 1\.0/ });

    // El ancla entra en pantalla sin que nadie pulse nada.
    intersecciones.forEach((disparar) => disparar());

    expect(await screen.findByRole("link", { name: /Ver el detalle de Personaje 2\.0/ })).toBeInTheDocument();
    expect(tarjetas()).toHaveLength(TAMANO_PAGINA * 2);
  });

  test("no pide la segunda pagina hasta que se le pide", async () => {
    const { peticiones } = pintar();

    await screen.findByRole("link", { name: /Ver el detalle de Personaje 1\.0/ });

    expect(peticiones).toEqual([null]);
  });

  test("mientras carga avisa con esqueletos y deshabilita el boton", async () => {
    const usuario = userEvent.setup();
    pintar();

    await screen.findByRole("link", { name: /Ver el detalle de Personaje 1\.0/ });
    await usuario.click(screen.getByRole("button", { name: BOTON_CARGAR }));

    const cargando = await screen.findByRole("button", { name: BOTON_CARGANDO });
    expect(cargando).toBeDisabled();
    expect(document.querySelectorAll(".MuiSkeleton-root").length).toBeGreaterThan(0);

    await screen.findByRole("link", { name: /Ver el detalle de Personaje 2\.0/ });
  });

  test("en la ultima pagina el boton desaparece", async () => {
    const usuario = userEvent.setup();
    pintar();

    await screen.findByRole("link", { name: /Ver el detalle de Personaje 1\.0/ });
    await usuario.click(screen.getByRole("button", { name: BOTON_CARGAR }));

    await screen.findByRole("link", { name: /Ver el detalle de Personaje 2\.0/ });

    expect(screen.queryByRole("button", { name: BOTON_CARGAR })).not.toBeInTheDocument();
  });

  test("con busqueda salen todas las coincidencias y no hay paginacion", async () => {
    pintar(resúmenes(1).slice(0, 2));

    expect(await screen.findByText("2 de 20 personajes coinciden con la busqueda")).toBeInTheDocument();
    expect(tarjetas()).toHaveLength(2);
    expect(screen.queryByRole("button", { name: BOTON_CARGAR })).not.toBeInTheDocument();
  });
});
