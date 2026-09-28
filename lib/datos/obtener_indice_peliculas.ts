import { deduplicar, consultar_apollo } from "@/lib/graphql/cliente_apollo_servidor";
import { ConsultarPeliculasDocument } from "@/lib/graphql/generados/graphql";
import { normalizar_pelicula } from "./normalizar_datos";
import type { PeliculaDetalle } from "./tipos_vista";

export const obtener_indice_peliculas = deduplicar(
  async (): Promise<ReadonlyMap<string, PeliculaDetalle[]>> => {
    const { data } = await consultar_apollo({
      query: ConsultarPeliculasDocument,
    });

    if (!data) return new Map();

    const indice = new Map<string, PeliculaDetalle[]>();

    for (const pelicula of data.allFilms?.films ?? []) {
      if (!pelicula) continue;

      const detalle = normalizar_pelicula(pelicula);
      const personajes = (pelicula.characterConnection?.characters ?? []).filter(
        (personaje): personaje is NonNullable<typeof personaje> => personaje != null,
      );

      for (const personaje of personajes) {
        const existentes = indice.get(personaje.id);
        if (existentes) {
          existentes.push(detalle);
        } else {
          indice.set(personaje.id, [detalle]);
        }
      }
    }

    return indice;
  },
);
