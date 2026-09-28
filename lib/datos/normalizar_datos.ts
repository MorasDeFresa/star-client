import type {
  ConsultarIndiceNombresQuery,
  ConsultarPersonajeQuery,
  ConsultarPersonajesQuery,
} from "@/lib/graphql/generados/graphql";
import type {
  IndiceNombres,
  PaginaPersonajes,
  PeliculaDetalle,
  PersonajeDetalle,
  PersonajeResumen,
} from "./tipos_vista";

type PeliculaApi = {
  id: string;
  title: string | null;
  episodeID: number | null;
  director: string | null;
  releaseDate: string | null;
  planetConnection: {
    totalCount: number | null;
    planets: ({ id: string; name: string | null } | null)[] | null;
  } | null;
};
type PersonajeApi = NonNullable<ConsultarPersonajeQuery["person"]> | null;

const SIN_DATO = "";

function texto(valor: string | null | undefined): string | null {
  const limpio = valor?.trim();
  if (!limpio || limpio === "n/a" || limpio === "unknown") return null;
  return limpio;
}

function lista<T>(items: readonly (T | null | undefined)[] | null | undefined): T[] {
  return items?.filter((item): item is T => item != null) ?? [];
}

export function normalizar_pagina_personajes(
  datos: ConsultarPersonajesQuery["allPeople"] | undefined,
  fallbackTotal = 0,
): PaginaPersonajes {
  const personas = lista(datos?.people);

  const personajes: PersonajeResumen[] = personas.map((persona) => ({
    id: persona.id,
    nombre: texto(persona.name) ?? SIN_DATO,
    genero: texto(persona.gender),
    anioNacimiento: texto(persona.birthYear),
  }));

  return {
    personajes,
    total: datos?.totalCount ?? fallbackTotal,
    cursorSiguiente: datos?.pageInfo?.endCursor ?? null,
    hayMas: datos?.pageInfo?.hasNextPage ?? false,
  };
}

export function normalizar_pelicula(pelicula: PeliculaApi): PeliculaDetalle {
  return {
    id: pelicula.id,
    titulo: texto(pelicula.title) ?? SIN_DATO,
    episodio: pelicula.episodeID ?? null,
    director: texto(pelicula.director),
    fechaLanzamiento: texto(pelicula.releaseDate),
    planetas: lista(pelicula.planetConnection?.planets).map((planeta) => ({
      id: planeta.id,
      nombre: texto(planeta.name) ?? SIN_DATO,
    })),
  };
}

export function normalizar_personaje(
  id: string,
  nombreApi: string | null | undefined,
  personaje: PersonajeApi | null,
  peliculas: readonly PeliculaDetalle[],
): PersonajeDetalle {
  const genero = texto(personaje?.gender);
  const nacimiento = texto(personaje?.birthYear);
  const especie = texto(personaje?.species?.name);

  return {
    id,
    nombre: texto(nombreApi) ?? texto(personaje?.name) ?? SIN_DATO,
    genero,
    anioNacimiento: nacimiento,
    alturaCm: personaje?.height ?? null,
    masaKg: personaje?.mass ?? null,
    colorOjos: texto(personaje?.eyeColor),
    colorPelo: texto(personaje?.hairColor),
    colorPiel: texto(personaje?.skinColor),
    planetaNatal: null,
    especie,
    naves: lista(personaje?.starshipConnection?.starships).map((nave) => ({
      id: nave.id,
      nombre: texto(nave.name) ?? SIN_DATO,
    })),
    peliculas: [...peliculas],
    datosCompletos: Boolean(genero || nacimiento || especie),
  };
}

export function normalizar_indice_nombres(
  datos: ConsultarIndiceNombresQuery | undefined,
): IndiceNombres {
  const personas = lista(datos?.allPeople?.people);
  return {
    entradas: personas.map((persona) => ({
      id: persona.id,
      nombre: texto(persona.name) ?? SIN_DATO,
    })),
    total: datos?.allPeople?.totalCount ?? personas.length,
  };
}
