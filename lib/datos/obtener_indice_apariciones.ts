import { deduplicar, consultar_apollo } from "@/lib/graphql/cliente_apollo_servidor";
import { ConsultarPeliculasDocument } from "@/lib/graphql/generados/graphql";
import { normalizar_indice_apariciones } from "./normalizar_datos";
import type { IndiceApariciones } from "./tipos_vista";

export const obtener_indice_apariciones = deduplicar(
  async (): Promise<IndiceApariciones> => {
    const { data } = await consultar_apollo({ query: ConsultarPeliculasDocument });

    return normalizar_indice_apariciones(data?.allFilms);
  },
);
