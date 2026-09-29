import { cache } from "react";
import { HttpLink } from "@apollo/client";
import { ApolloClient, InMemoryCache, registerApolloClient } from "@apollo/client-integration-nextjs";
import { URL_GQL as URL_PUBLICA } from "@/lib/graphql/config_graphql";

const SEGUNDOS_REVALIDACION = 300;

export const { getClient: obtener_cliente_apollo, query: consultar_apollo } = registerApolloClient(
  () =>
    new ApolloClient({
      link: new HttpLink({
        uri: process.env.SWAPI_GRAPHQL_URL ?? URL_PUBLICA,
        fetchOptions: {
          next: { revalidate: SEGUNDOS_REVALIDACION },
          headers: { "Content-Type": "application/json" },
        },
      }),
      // La clave por defecto incluye las variables, con lo que la primera pagina
      // que se pide aqui es la misma entrada que lee el cliente al hidratar y no
      // vuelve a salir por la red.
      cache: new InMemoryCache(),
    }),
);

export const deduplicar = cache;
