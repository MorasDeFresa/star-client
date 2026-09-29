"use client";

import { HttpLink } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";
import { URL_GQL } from "@/lib/graphql/config_graphql";

export function crear_cliente_apollo_navegador(): ApolloClient {
  return new ApolloClient({
    link: new HttpLink({
      uri: URL_GQL,
    }),
    // Sin `typePolicies`: `allPeople` se cachea por sus variables, asi que cada
    // pagina es una entrada propia. Lo necesita la tabla de escritorio, que
    // salta de pagina en pagina; el listado de tarjetas apila las suyas en el
    // componente para no mezclar las dos formas de recorrer el mismo campo.
    cache: new InMemoryCache(),
  });
}
