/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query ConsultarIndiceNombres {\n  allPeople {\n    totalCount\n    people {\n      id\n      name\n    }\n  }\n}": typeof types.ConsultarIndiceNombresDocument,
    "query ConsultarPeliculas {\n  allFilms {\n    totalCount\n    films {\n      id\n      title\n      episodeID\n      director\n      releaseDate\n      planetConnection {\n        totalCount\n        planets {\n          id\n          name\n        }\n      }\n      characterConnection {\n        totalCount\n        characters {\n          id\n          name\n        }\n      }\n    }\n  }\n}": typeof types.ConsultarPeliculasDocument,
    "query ConsultarPersonaje($id: ID!) {\n  person(id: $id) {\n    id\n    name\n    gender\n    birthYear\n    height\n    mass\n    eyeColor\n    hairColor\n    skinColor\n    species {\n      id\n      name\n    }\n    starshipConnection {\n      totalCount\n      starships {\n        id\n        name\n      }\n    }\n    filmConnection {\n      totalCount\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      films {\n        id\n        title\n        episodeID\n        director\n        releaseDate\n        planetConnection {\n          totalCount\n          planets {\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n}": typeof types.ConsultarPersonajeDocument,
    "query ConsultarPersonajes($first: Int!, $after: String) {\n  allPeople(first: $first, after: $after) {\n    totalCount\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    people {\n      id\n      name\n    }\n  }\n}": typeof types.ConsultarPersonajesDocument,
};
const documents: Documents = {
    "query ConsultarIndiceNombres {\n  allPeople {\n    totalCount\n    people {\n      id\n      name\n    }\n  }\n}": types.ConsultarIndiceNombresDocument,
    "query ConsultarPeliculas {\n  allFilms {\n    totalCount\n    films {\n      id\n      title\n      episodeID\n      director\n      releaseDate\n      planetConnection {\n        totalCount\n        planets {\n          id\n          name\n        }\n      }\n      characterConnection {\n        totalCount\n        characters {\n          id\n          name\n        }\n      }\n    }\n  }\n}": types.ConsultarPeliculasDocument,
    "query ConsultarPersonaje($id: ID!) {\n  person(id: $id) {\n    id\n    name\n    gender\n    birthYear\n    height\n    mass\n    eyeColor\n    hairColor\n    skinColor\n    species {\n      id\n      name\n    }\n    starshipConnection {\n      totalCount\n      starships {\n        id\n        name\n      }\n    }\n    filmConnection {\n      totalCount\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      films {\n        id\n        title\n        episodeID\n        director\n        releaseDate\n        planetConnection {\n          totalCount\n          planets {\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n}": types.ConsultarPersonajeDocument,
    "query ConsultarPersonajes($first: Int!, $after: String) {\n  allPeople(first: $first, after: $after) {\n    totalCount\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    people {\n      id\n      name\n    }\n  }\n}": types.ConsultarPersonajesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ConsultarIndiceNombres {\n  allPeople {\n    totalCount\n    people {\n      id\n      name\n    }\n  }\n}"): (typeof documents)["query ConsultarIndiceNombres {\n  allPeople {\n    totalCount\n    people {\n      id\n      name\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ConsultarPeliculas {\n  allFilms {\n    totalCount\n    films {\n      id\n      title\n      episodeID\n      director\n      releaseDate\n      planetConnection {\n        totalCount\n        planets {\n          id\n          name\n        }\n      }\n      characterConnection {\n        totalCount\n        characters {\n          id\n          name\n        }\n      }\n    }\n  }\n}"): (typeof documents)["query ConsultarPeliculas {\n  allFilms {\n    totalCount\n    films {\n      id\n      title\n      episodeID\n      director\n      releaseDate\n      planetConnection {\n        totalCount\n        planets {\n          id\n          name\n        }\n      }\n      characterConnection {\n        totalCount\n        characters {\n          id\n          name\n        }\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ConsultarPersonaje($id: ID!) {\n  person(id: $id) {\n    id\n    name\n    gender\n    birthYear\n    height\n    mass\n    eyeColor\n    hairColor\n    skinColor\n    species {\n      id\n      name\n    }\n    starshipConnection {\n      totalCount\n      starships {\n        id\n        name\n      }\n    }\n    filmConnection {\n      totalCount\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      films {\n        id\n        title\n        episodeID\n        director\n        releaseDate\n        planetConnection {\n          totalCount\n          planets {\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n}"): (typeof documents)["query ConsultarPersonaje($id: ID!) {\n  person(id: $id) {\n    id\n    name\n    gender\n    birthYear\n    height\n    mass\n    eyeColor\n    hairColor\n    skinColor\n    species {\n      id\n      name\n    }\n    starshipConnection {\n      totalCount\n      starships {\n        id\n        name\n      }\n    }\n    filmConnection {\n      totalCount\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      films {\n        id\n        title\n        episodeID\n        director\n        releaseDate\n        planetConnection {\n          totalCount\n          planets {\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ConsultarPersonajes($first: Int!, $after: String) {\n  allPeople(first: $first, after: $after) {\n    totalCount\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    people {\n      id\n      name\n    }\n  }\n}"): (typeof documents)["query ConsultarPersonajes($first: Int!, $after: String) {\n  allPeople(first: $first, after: $after) {\n    totalCount\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    people {\n      id\n      name\n    }\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;