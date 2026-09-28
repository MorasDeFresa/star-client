import { deduplicar, consultar_apollo } from "@/lib/graphql/cliente_apollo_servidor";
import { ConsultarIndiceNombresDocument } from "@/lib/graphql/generados/graphql";
import { normalizar_indice_nombres } from "./normalizar_datos";
import type { IndiceNombres } from "./tipos_vista";

export const obtener_indice_nombres = deduplicar(async (): Promise<IndiceNombres> => {
  const { data } = await consultar_apollo({ query: ConsultarIndiceNombresDocument });
  return normalizar_indice_nombres(data);
});
