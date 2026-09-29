import { describe, expect, test } from "vitest";
import type { ConsultarPeliculasQuery } from "@/lib/graphql/generados/graphql";
import type { PaginaPersonajes } from "@/lib/datos/tipos_vista";
import {
  con_apariciones,
  normalizar_indice_apariciones,
  normalizar_indice_nombres,
  normalizar_pagina_personajes,
  normalizar_pelicula,
  normalizar_personaje,
} from "@/lib/datos/normalizar_datos";

describe("normalizar_pagina_personajes", () => {
  test("mapea la pagina y conserva el cursor", () => {
    const pagina = normalizar_pagina_personajes({
      totalCount: 82,
      pageInfo: { hasNextPage: true, endCursor: "Y3Vyc29yOjE=" },
      people: [
        { id: "cGVvcGxlOjE=", name: "Luke Skywalker" },
        { id: "cGVvcGxlOjI=", name: "C-3PO" },
      ],
    });

    expect(pagina.total).toBe(82);
    expect(pagina.hayMas).toBe(true);
    expect(pagina.cursorSiguiente).toBe("Y3Vyc29yOjE=");
    expect(pagina.personajes.map((p) => p.nombre)).toEqual(["Luke Skywalker", "C-3PO"]);
  });

  test("descarta las entradas nulas de la lista", () => {
    const pagina = normalizar_pagina_personajes({
      totalCount: 2,
      pageInfo: { hasNextPage: false, endCursor: null },
      people: [{ id: "cGVvcGxlOjE=", name: "Luke Skywalker" }, null],
    });

    expect(pagina.personajes).toHaveLength(1);
  });

  test("usa el total de respaldo si la consulta no llega", () => {
    const pagina = normalizar_pagina_personajes(undefined, 82);

    expect(pagina.total).toBe(82);
    expect(pagina.personajes).toEqual([]);
    expect(pagina.hayMas).toBe(false);
  });

  test("deja las apariciones sin rellenar: las cruza despues el indice", () => {
    const pagina = normalizar_pagina_personajes({
      totalCount: 1,
      pageInfo: { hasNextPage: false, endCursor: null },
      people: [{ id: "cGVvcGxlOjE=", name: "Luke Skywalker" }],
    });

    expect(pagina.personajes[0]).toEqual({
      id: "cGVvcGxlOjE=",
      nombre: "Luke Skywalker",
      apariciones: null,
      primeraAparicion: null,
      ultimaAparicion: null,
    });
  });
});

describe("normalizar_pelicula", () => {
  test("mapea titulo, episodio, director, fecha y planetas", () => {
    const pelicula = normalizar_pelicula({
      id: "ZmlsbXM6MQ==",
      title: "A New Hope",
      episodeID: 4,
      director: "George Lucas",
      releaseDate: "1977-05-25",
      planetConnection: {
        totalCount: 2,
        planets: [
          { id: "cGxhbmV0OjE=", name: "Tatooine" },
          { id: "cGxhbmV0OjI=", name: "Alderaan" },
        ],
      },
    });

    expect(pelicula).toEqual({
      id: "ZmlsbXM6MQ==",
      titulo: "A New Hope",
      episodio: 4,
      director: "George Lucas",
      fechaLanzamiento: "1977-05-25",
      planetas: [
        { id: "cGxhbmV0OjE=", nombre: "Tatooine" },
        { id: "cGxhbmV0OjI=", nombre: "Alderaan" },
      ],
    });
  });

  test("una pelicula sin planetas ni planetaConnection da lista vacia", () => {
    const pelicula = normalizar_pelicula({
      id: "ZmlsbXM6Mg==",
      title: "The Empire Strikes Back",
      episodeID: 5,
      director: "Irvin Kershner",
      releaseDate: "1980-05-17",
      planetConnection: null,
    });

    expect(pelicula.planetas).toEqual([]);
  });
});

describe("normalizar_personaje", () => {
  const pelicula = {
    id: "ZmlsbXM6MQ==",
    titulo: "A New Hope",
    episodio: 4,
    director: "George Lucas",
    fechaLanzamiento: "1977-05-25",
    planetas: [],
  };

  test("se monta solo con el id, el nombre y las peliculas del indice", () => {
    const personaje = normalizar_personaje("cGVvcGxlOjE=", "Luke Skywalker", null, [pelicula]);

    expect(personaje.nombre).toBe("Luke Skywalker");
    expect(personaje.peliculas).toHaveLength(1);
    expect(personaje.genero).toBeNull();
    expect(personaje.alturaCm).toBeNull();
    expect(personaje.planetaNatal).toBeNull();
  });

  test("marca datosCompletos en false cuando no hay campos descriptivos", () => {
    const personaje = normalizar_personaje("cGVvcGxlOjE=", "Luke Skywalker", null, [pelicula]);

    expect(personaje.datosCompletos).toBe(false);
  });

  test("marca datosCompletos en true si person(id:) trae siquiera un campo", () => {
    const personaje = normalizar_personaje(
      "cGVvcGxlOjE=",
      "Luke Skywalker",
      {
        id: "cGVvcGxlOjE=",
        name: "Luke Skywalker",
        gender: "male",
        birthYear: null,
        height: 172,
        mass: 77,
        eyeColor: null,
        hairColor: null,
        skinColor: null,
        species: { id: "c3BlY2llczox", name: "Human" },
        starshipConnection: {
          totalCount: 1,
          starships: [{ id: "c3RhcnNoaXBzOjE=", name: "X-wing" }],
        },
        filmConnection: {
          totalCount: 0,
          pageInfo: { hasNextPage: false, endCursor: null },
          films: [],
        },
      },
      [pelicula],
    );

    expect(personaje.datosCompletos).toBe(true);
    expect(personaje.alturaCm).toBe(172);
    expect(personaje.naves.map((n) => n.nombre)).toEqual(["X-wing"]);
  });

  test("copia el array de peliculas en vez de guardar la referencia", () => {
    const compartidas = [pelicula];
    const personaje = normalizar_personaje("x", "Luke", null, compartidas);

    expect(personaje.peliculas).not.toBe(compartidas);
    expect(personaje.peliculas).toEqual(compartidas);
  });
});

describe("normalizar_indice_apariciones", () => {
  type PeliculaApi = NonNullable<
    NonNullable<NonNullable<ConsultarPeliculasQuery["allFilms"]>["films"]>[number]
  >;

  function pelicula(
    id: string,
    releaseDate: string | null,
    personajes: string[],
  ): PeliculaApi {
    return {
      id,
      title: null,
      episodeID: null,
      director: null,
      releaseDate,
      planetConnection: null,
      characterConnection: {
        totalCount: personajes.length,
        characters: personajes.map((id) => ({ id, name: null })),
      },
    };
  }

  test("cuenta las peliculas de cada personaje y ordena sus fechas", () => {
    const indice = normalizar_indice_apariciones({
      totalCount: 2,
      // Vienen en orden de episodio, no de fecha: la primera es la mas antigua.
      films: [
        pelicula("ZmlsbXM6Mg==", "1980-05-17", ["cGVvcGxlOjE=", "ZGFydGg6MQ=="]),
        pelicula("ZmlsbXM6MQ==", "1977-05-25", ["cGVvcGxlOjE="]),
      ],
    });

    expect(indice.get("cGVvcGxlOjE=")).toEqual({
      apariciones: 2,
      primeraAparicion: "1977-05-25",
      ultimaAparicion: "1980-05-17",
    });
    expect(indice.get("ZGFydGg6MQ==")).toEqual({
      apariciones: 1,
      primeraAparicion: "1980-05-17",
      ultimaAparicion: "1980-05-17",
    });
  });

  test("cuenta la pelicula sin fecha pero no inventa ninguna", () => {
    const indice = normalizar_indice_apariciones({
      totalCount: 1,
      films: [pelicula("ZmlsbXM6MQ==", "unknown", ["cGVvcGxlOjE="])],
    });

    expect(indice.get("cGVvcGxlOjE=")).toEqual({
      apariciones: 1,
      primeraAparicion: null,
      ultimaAparicion: null,
    });
  });

  test("descarta las peliculas nulas y las que no traen reparto", () => {
    expect(normalizar_indice_apariciones(undefined).size).toBe(0);
    expect(normalizar_indice_apariciones({ totalCount: 2, films: [null] }).size).toBe(0);
    expect(
      normalizar_indice_apariciones({
        totalCount: 1,
        films: [{ ...pelicula("ZmlsbXM6MQ==", "1977-05-25", []), characterConnection: null }],
      }).size,
    ).toBe(0);
  });
});

describe("con_apariciones", () => {
  const pagina: PaginaPersonajes = {
    personajes: [
      { id: "cGVvcGxlOjE=", nombre: "Luke Skywalker", apariciones: null, primeraAparicion: null, ultimaAparicion: null },
      { id: "ZGVuZXJhdG8=", nombre: "Desconocido", apariciones: null, primeraAparicion: null, ultimaAparicion: null },
    ],
    total: 2,
    cursorSiguiente: null,
    hayMas: false,
  };

  test("rellena las apariciones de quien esta en el indice", () => {
    const indice = new Map([["cGVvcGxlOjE=", { apariciones: 4, primeraAparicion: "1977-05-25", ultimaAparicion: "1983-05-25" }]]);

    const personajes = con_apariciones(pagina.personajes, indice);

    expect(personajes[0]).toEqual({
      id: "cGVvcGxlOjE=",
      nombre: "Luke Skywalker",
      apariciones: 4,
      primeraAparicion: "1977-05-25",
      ultimaAparicion: "1983-05-25",
    });
  });

  test("deja sin tocar a quien no aparece en ninguna pelicula", () => {
    const personajes = con_apariciones(pagina.personajes, new Map());

    expect(personajes).toEqual(pagina.personajes);
  });
});

describe("normalizar_indice_nombres", () => {
  test("mapea los 82 nombres del archivo", () => {
    const indice = normalizar_indice_nombres({
      allPeople: {
        totalCount: 82,
        people: [
          { id: "cGVvcGxlOjE=", name: "Luke Skywalker" },
          { id: "cGVvcGxlOjI=", name: "C-3PO" },
        ],
      },
    });

    expect(indice.total).toBe(82);
    expect(indice.entradas).toHaveLength(2);
    expect(indice.entradas[0]).toEqual({ id: "cGVvcGxlOjE=", nombre: "Luke Skywalker" });
  });

  test("si la consulta no llega, el total es el numero de entradas", () => {
    const indice = normalizar_indice_nombres(undefined);

    expect(indice.total).toBe(0);
    expect(indice.entradas).toEqual([]);
  });
});
