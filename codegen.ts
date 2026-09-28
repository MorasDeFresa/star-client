import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: process.env.SWAPI_GRAPHQL_URL ?? "https://swapi-graphql.netlify.app/graphql",
  documents: ["lib/graphql/operaciones/**/*.graphql"],
  ignoreNoDocuments: false,
  generates: {
    "lib/graphql/generados/": {
      preset: "client",
      config: {
        typesPrefix: "",
        useTypeImports: true,
        enumsAsTypes: true,
        skipTypename: false,
      },
    },
  },
};

export default config;
