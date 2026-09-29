import type {
  ConsultarIndiceNombresQuery,
  ConsultarPeliculasQuery,
  ConsultarPersonajeQuery,
  ConsultarPersonajesQuery,
} from "@/lib/graphql/generados/graphql";
import type {
  EstadisticasApariciones,
  IndiceApariciones,
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

/** Las fechas del API son ISO (`AAAA-MM-DD`); si alguna llega malformada se
    comparan como texto para no perder la aparicion mas antigua. */
function comparar_fechas(primera: string, segunda: string): number {
  const a = Date.parse(primera);
  const b = Date.parse(segunda);
  if (Number.isNaN(a) || Number.isNaN(b)) return primera.localeCompare(segunda);
  return a - b;
}

function antes_que(primera: string, segunda: string): boolean {
  return comparar_fechas(primera, segunda) < 0;
}

function despues_que(primera: string, segunda: string): boolean {
  return comparar_fechas(primera, segunda) > 0;
}

/** Se queda con la de la pelicula si es mejor que la que ya tenia, y no
    inventa ninguna cuando el API no dio fecha. */
function extremo(
  actual: string | null,
  nueva: string | null,
  mejor: (primera: string, segunda: string) => boolean,
): string | null {
  if (nueva == null) return actual;
  if (actual == null) return nueva;
  return mejor(nueva, actual) ? nueva : actual;
}

export function normalizar_pagina_personajes(
  datos: ConsultarPersonajesQuery["allPeople"] | undefined,
  fallbackTotal = 0,
): PaginaPersonajes {
  const personas = lista(datos?.people);

  const personajes: PersonajeResumen[] = personas.map((persona) => ({
    id: persona.id,
    nombre: texto(persona.name) ?? SIN_DATO,
    apariciones: null,
    primeraAparicion: null,
    ultimaAparicion: null,
  }));

  return {
    personajes,
    total: datos?.totalCount ?? fallbackTotal,
    cursorSiguiente: datos?.pageInfo?.endCursor ?? null,
    hayMas: datos?.pageInfo?.hasNextPage ?? false,
  };
}

/** La misma conversion para las paginas que llegan sueltas: el listado por
    scroll infinito las anade de una en una y las cruza con el indice igual que
    la pagina inicial. */
export function mapear_personajes(
  personas: readonly ({ id: string; name: string | null } | null)[] | null | undefined,
): PersonajeResumen[] {
  return lista(personas).map((persona) => ({
    id: persona.id,
    nombre: texto(persona.name) ?? SIN_DATO,
    apariciones: null,
    primeraAparicion: null,
    ultimaAparicion: null,
  }));
}

/** El API no devuelve las peliculas en la ficha de cada personaje, asi que el
    indice se invierte desde las peliculas: cuantas veces aparece cada id y las
    fechas de su primera y su ultima aparicion. */
export function normalizar_indice_apariciones(
  datos: ConsultarPeliculasQuery["allFilms"] | undefined,
): IndiceApariciones {
  const indice = new Map<string, EstadisticasApariciones>();

  for (const pelicula of lista(datos?.films)) {
    const fecha = texto(pelicula.releaseDate);

    for (const personaje of lista(pelicula.characterConnection?.characters)) {
      const previas = indice.get(personaje.id);

      if (!previas) {
        indice.set(personaje.id, {
          apariciones: 1,
          primeraAparicion: fecha,
          ultimaAparicion: fecha,
        });
        continue;
      }

      indice.set(personaje.id, {
        apariciones: previas.apariciones + 1,
        primeraAparicion: extremo(previas.primeraAparicion, fecha, antes_que),
        ultimaAparicion: extremo(previas.ultimaAparicion, fecha, despues_que),
      });
    }
  }

  return indice;
}

/** Cruza el indice con los personajes ya normalizados. Los que no aparecen en
    ninguna pelicula conservan sus valores vacios. */
export function con_apariciones(
  personajes: readonly PersonajeResumen[],
  indice: IndiceApariciones,
): PersonajeResumen[] {
  return personajes.map((personaje) => {
    const estadisticas = indice.get(personaje.id);
    return estadisticas ? { ...personaje, ...estadisticas } : personaje;
  });
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
