import { deduplicar, consultar_apollo } from "@/lib/graphql/cliente_apollo_servidor";
import {
  ConsultarPersonajeDocument,
  type ConsultarPersonajeQuery,
} from "@/lib/graphql/generados/graphql";
import { obtener_indice_peliculas } from "./obtener_indice_peliculas";
import { normalizar_personaje, normalizar_pelicula } from "./normalizar_datos";
import type { PeliculaDetalle, PersonajeDetalle } from "./tipos_vista";

type PersonajeApi = NonNullable<ConsultarPersonajeQuery["person"]>;
type PeliculasApi = Exclude<NonNullable<PersonajeApi["filmConnection"]>["films"], null | undefined>;
type PeliculaApi = Exclude<PeliculasApi[number], null>;

function tiene_datos_descriptivos(personaje: PersonajeApi): boolean {
  return Boolean(personaje.gender || personaje.birthYear || personaje.homeworld);
}

function peliculas_de_la_conexion(films: PeliculasApi): PeliculaDetalle[] {
  return films.filter((pelicula): pelicula is PeliculaApi => pelicula != null).map(normalizar_pelicula);
}

async function consultar_personaje_api(id: string) {
  return consultar_apollo({ query: ConsultarPersonajeDocument, variables: { id } });
}

export const obtener_personaje = deduplicar(async (id: string): Promise<PersonajeDetalle | null> => {
  const { data } = await consultar_personaje_api(id);
  const personaje = data?.person;

  if (!personaje) return null;

  const peliculasConexion = peliculas_de_la_conexion(personaje.filmConnection?.films ?? []);
  if (peliculasConexion.length > 0) {
    return normalizar_personaje(personaje, peliculasConexion, true);
  }

  const peliculasDelIndice = (await obtener_indice_peliculas()).get(personaje.id) ?? [];

  return normalizar_personaje(personaje, peliculasDelIndice, tiene_datos_descriptivos(personaje));
});
