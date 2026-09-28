import { deduplicar, consultar_apollo } from "@/lib/graphql/cliente_apollo_servidor";
import {
  ConsultarPersonajeDocument,
  type ConsultarPersonajeQuery,
} from "@/lib/graphql/generados/graphql";
import { obtener_indice_nombres } from "./obtener_indice_nombres";
import { obtener_indice_peliculas } from "./obtener_indice_peliculas";
import { normalizar_pelicula, normalizar_personaje } from "./normalizar_datos";
import type { PeliculaDetalle } from "./tipos_vista";

export const obtener_personaje = deduplicar(async (id: string) => {
  const [indiceNombres, indicePeliculas] = await Promise.all([
    obtener_indice_nombres(),
    obtener_indice_peliculas(),
  ]);

  const nombre = indiceNombres.entradas.find((entrada) => entrada.id === id)?.nombre;
  const desdeApi = await consultar_personaje_opcional(id);

  if (nombre === undefined && !desdeApi) return null;

  const peliculas: PeliculaDetalle[] = peliculas_de_la_conexion(desdeApi);
  if (peliculas.length === 0) {
    peliculas.push(...(indicePeliculas.get(id) ?? []));
  }

  return normalizar_personaje(id, nombre ?? desdeApi?.name ?? null, desdeApi, peliculas);
});

type PersonajeApi = NonNullable<ConsultarPersonajeQuery["person"]>;

async function consultar_personaje_opcional(id: string): Promise<PersonajeApi | null> {
  try {
    const { data } = await consultar_apollo({ query: ConsultarPersonajeDocument, variables: { id } });
    return data?.person ?? null;
  } catch {
    return null;
  }
}

function peliculas_de_la_conexion(personaje: PersonajeApi | null): PeliculaDetalle[] {
  const films = personaje?.filmConnection?.films;
  if (!films) return [];
  return films
    .filter((pelicula): pelicula is NonNullable<typeof pelicula> => pelicula != null)
    .map(normalizar_pelicula);
}
