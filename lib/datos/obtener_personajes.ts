import { deduplicar, consultar_apollo } from "@/lib/graphql/cliente_apollo_servidor";
import { ConsultarPersonajesDocument } from "@/lib/graphql/generados/graphql";
import { normalizar_pagina_personajes } from "./normalizar_datos";
import type { PaginaPersonajes } from "./tipos_vista";

export const TAMANO_PAGINA = 10;

export const obtener_personajes = deduplicar(
  async (opciones: { after?: string | null; first?: number } = {}): Promise<PaginaPersonajes> => {
    const first = opciones.first ?? TAMANO_PAGINA;

    const { data } = await consultar_apollo({
      query: ConsultarPersonajesDocument,
      variables: { first, after: opciones.after ?? null },
    });

    return normalizar_pagina_personajes(data?.allPeople, 0);
  },
);
