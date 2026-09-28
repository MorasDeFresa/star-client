import type { TypePolicies } from "@apollo/client";

export const POLITICAS_CACHE: TypePolicies = {
  Query: {
    fields: {
      allPeople: {
        keyArgs: ["after"],
        merge(existing, incoming, { args }) {
          if (!existing) return incoming;

          const previos: unknown[] = existing.people ?? [];
          const nuevos: unknown[] = incoming.people ?? [];

          if (args?.after) {
            return { ...incoming, people: [...previos, ...nuevos] };
          }

          return incoming;
        },
      },
    },
  },
};
