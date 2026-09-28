import { describe, expect, test } from "vitest";
import {
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
        { id: "cGVvcGxlOjE=", name: "Luke Skywalker", gender: null, birthYear: null },
        { id: "cGVvcGxlOjI=", name: "C-3PO", gender: null, birthYear: null },
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
      people: [
        { id: "cGVvcGxlOjE=", name: "Luke Skywalker", gender: null, birthYear: null },
        null,
      ],
    });

    expect(pagina.personajes).toHaveLength(1);
  });

  test("usa el total de respaldo si la consulta no llega", () => {
    const pagina = normalizar_pagina_personajes(undefined, 82);

    expect(pagina.total).toBe(82);
    expect(pagina.personajes).toEqual([]);
    expect(pagina.hayMas).toBe(false);
  });

  test("convierte n/a y unknown en null, no en texto", () => {
    const pagina = normalizar_pagina_personajes({
      totalCount: 1,
      pageInfo: { hasNextPage: false, endCursor: null },
      people: [{ id: "x", name: "Desconocido", gender: "n/a", birthYear: "unknown" }],
    });

    expect(pagina.personajes[0].genero).toBeNull();
    expect(pagina.personajes[0].anioNacimiento).toBeNull();
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
