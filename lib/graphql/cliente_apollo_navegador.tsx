"use client";

import { HttpLink } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs";
import { URL_GQL } from "@/lib/graphql/config_graphql";

export function crear_cliente_apollo_navegador(): ApolloClient {
  return new ApolloClient({
    link: new HttpLink({
      uri: URL_GQL,
    }),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            allPeople: {
              keyArgs: ["after"],
              merge(existing, incoming, { args }) {
                if (!existing) return incoming;
                if (args?.after) {
                  const previos = existing.people ?? [];
                  const nuevos = incoming.people ?? [];
                  return { ...incoming, people: [...previos, ...nuevos] };
                }
                return incoming;
              },
            },
          },
        },
      },
    }),
  });
}
