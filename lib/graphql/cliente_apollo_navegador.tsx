"use client";

import { HttpLink } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";
import { URL_GQL } from "@/lib/graphql/config_graphql";
import { POLITICAS_CACHE } from "@/lib/graphql/cache_tipos";

export function crear_cliente_apollo_navegador(): ApolloClient {
  return new ApolloClient({
    link: new HttpLink({
      uri: URL_GQL,
    }),
    cache: new InMemoryCache({ typePolicies: POLITICAS_CACHE }),
  });
}
