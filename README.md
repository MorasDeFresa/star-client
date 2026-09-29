# Star Wars - Archivo de personajes

Archivo de personajes del universo Star Wars construido con **Next.js 16** (App
Router), **React 19**, **MUI 9** y **Apollo Client 4**, sobre el GraphQL público
de [SWAPI](https://github.com/trevorharrington/swapi-graphql).

Listado paginado, ficha de detalle por personaje y buscador con debounce que se
refleja en la URL.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local
npm run codegen   # descarga el schema y genera los tipos
npm run dev
```

En [http://localhost:3000](http://localhost:3000).

`npm run codegen` necesita red: descarga el schema del endpoint real en vez de
mantener una copia local, para que los tipos no puedan quedar desincronizados. Si
el endpoint no responde, el comando falla en lugar de generar tipos falsos. Los
tipos generados quedan versionados en `lib/graphql/generados/`, así que solo hace
falta ejecutarlo cuando cambia el schema o alguna operación de
`lib/graphql/operaciones/`.

## Scripts

| Script              | Qué hace                                                  |
| ------------------- | --------------------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                                    |
| `npm run build`     | Build de producción (ejecuta `tsc`, así que también tipa)  |
| `npm run start`     | Sirve el build de producción                              |
| `npm run lint`      | ESL plano sobre el proyecto entero                        |
| `npm run typecheck` | `tsc --noEmit`                                            |
| `npm run test`      | Suite de Vitest en modo watch-free, una sola ejecución     |
| `npm run test:watch`| Vitest en watch                                            |
| `npm run codegen`   | Regenera los tipos de GraphQL                             |

## Variables de entorno

Todas tienen valor por defecto, así que la aplicación arranca sin `.env.local`.
Están documentadas en `.env.example`.

| Variable                       | Para qué sirve                                                        |
| ------------------------------ | --------------------------------------------------------------------- |
| `SWAPI_GRAPHQL_URL`            | Endpoint que usa el cliente Apollo del servidor y el generador de tipos |
| `NEXT_PUBLIC_SWAPI_GRAPHQL_URL`| El mismo endpoint, expuesto al bundle para paginar en el cliente       |
| `NEXT_PUBLIC_ORIGIN`           | Origen con el que se construye `metadataBase`                         |

## Cómo funciona

### Los datos pasan siempre por el servidor

El API bloquea las peticiones que llegan del navegador por CORS, así que la
consulta inicial se hace en el servidor y se serializa en la caché de Apollo,
que viaja en el HTML. El cliente de Apollo solo interviene a partir de ahí, para
traer las páginas siguientes. Un cliente puramente en el navegador no
funcionaría.

La segunda vista cambia según el tamaño de la pantalla, y con ella cambia cómo se
recorren los personajes: en escritorio la tabla pagina por números, en móvil las
tarjetas se encadenan hasta el final.

### Elige tabla o tarjetas según el ancho

`use_es_escritorio` decide con la media query de MUI en `md` (900px). Se resuelve
con `defaultMatches: true` para que el servidor y la hidratación pinten siempre la
tabla, y el cambio a tarjetas ocurre después, ya en el cliente. Al revés se
produciría un desajuste de hidratación, porque el servidor no puede saber el ancho
de la ventana.

Solo se monta una de las dos vistas. Montar las dos pediría los mismos datos dos
veces, y cada vista necesita una estrategia de paginación distinta.

### La tabla de escritorio pagina, y SWAPI no pagina por número

`allPeople` acepta `first` y `after`, no `page`. Para leer la página 7 hay que
conocer el `endCursor` de la 6, y ese solo existe si se han pedido las anteriores.
`use_paginacion_por_cursor` guarda los cursores a medida que los descubre: al
saltar de la 3 a la 7 pide las páginas 4, 5 y 6, únicamente por su cursor, y como
cada respuesta queda en la caché, volver atrás no vuelve a pedir nada. El
componente de la tabla solo lee el cursor ya conocido, así que nunca muestra una
página a medio camino.

En una página que falla se enseñan filas vacías, no las de la primera: repetir
esas bajo un contador que dice «Página 4» sería peor que no mostrar nada. El
paginador sigue disponible para poderarse.

### Las tarjetas de móvil se encadenan

El scroll infinito va aquí, y no en la tabla, que es el sitio donde un
`IntersectionObserver` molesta: en escritorio la lista no llega al fondo de la
ventana, así que el disparador nunca se activaría y el botón «Cargar más» sería la
única vía, con un comportamiento distinto al del móvil.

Las páginas ya pedidas se apilan en estado de React, con el `endCursor` y el
`hasNextPage` de cada una. Leerlos siempre de la consulta principal repetiría la
página 2 indefinidamente y el botón no se apagaría nunca. La caché de Apollo se
queda con la política por defecto, que separa cada página por sus variables: la
tabla necesita las páginas aisladas y las tarjetas las acumulan ellas mismas.

El botón sigue ahí aunque haya scroll infinito. Es el camino accesible por teclado
y el que funciona cuando el observer no llega a dispararse.

### La búsqueda vive en la URL

Escribir en el buscador reescribe `?q=` con `history.replaceState` en lugar de
hacer un `router.push`. Dos consecuencias: la página `/` sigue siendo estática y
se revalida cada 5 minutos, y el botón de atrás del navegador no acumula una
entrada por pulsación. Un enlace `/?q=vader` abre el listado ya filtrado.

`replaceState` no emite `popstate`, así que el hook de la URL también despacha un
evento propio: sin eso, el input y la tabla se desincronizarían al escribir.

### La fila es un enlace de verdad

Abrir una ficha es navegar a `/personajes/{id}`, no un `onClick` con
`router.push`. El enlace vive dentro de la celda del nombre y se estira sobre la
fila con un `::after`. No se hace al revés porque un `<a>` no puede contener
`<th>` ni `<td>`, y porque MUI impondría `role="row"` al `<a>`, que perdería el
rol de enlace.

`/personajes/[id]` es dinámica, así que el botón de volver comprueba si la
entrada la gestionó Next antes de usar `router.back()`. Si el usuario llegó por
un enlace externo, `history` está vacío y `back()` no haría nada: en ese caso
vuelve al listado.

### La ficha se compone con dos fuentes

`person(id:)` falla en el API público con
`No entry in local cache for https://www.swapi.tech/api/people/...`, y `allPeople`
solo devuelve `id` y `name` con valor real: el resto llega como `null` o como las
cadenas `"n/a"` y `"unknown"`.

Por eso la ficha se monta con el índice de nombres (para la identidad) y el
índice invertido de `allFilms` (para las apariciones), y la consulta a
`person(id:)` se mantiene solo como enriquecimiento opcional, dentro de un
`try/catch` que degrada en silencio. Cuando el API añada esos campos, aparecerán
sin tocar el código. La interfaz avisa de que los guiones vacíos son una
limitación del origen, no un dato real.

Por el mismo motivo la operación no pide `homeworld`: el campo existe en el
schema, pero el resolver lo rechaza y hace fallar la consulta entera.

### Accesibilidad

Las celdas sin dato muestran `—` en lugar de una cadena vacía, para que un lector
de pantalla no las anuncie como si tuvieran contenido. El nombre de cada fila es
el encabezado de fila (`th` con `scope="row"`), y en las tarjetas el enlace se
estira sobre toda la superficie, de modo que el objetivo táctil es la tarjeta
entera y no el texto. El contador de resultados va en una región
`aria-live="polite"` para que se anuncie el cambio de «Mostrando 10» a
«Mostrando 20» al encadenar páginas. El paginador de escritorio lleva etiquetas
propias en lugar de las de MUI, que salen en inglés, y el «Cargar más personajes»
se deshabilita y muestra `CircularProgress` mientras la página siguiente está en
vuelo.

## Pruebas

```bash
npm run test
```

86 pruebas con Vitest y Testing Library sobre `jsdom`:

- **Formateadores** — que `null`, `"n/a"` y `"unknown"` acaben en el mismo sitio, y
  que un `0` se trate como dato y no como ausencia.
- **Normalizado** — el contrato entre los tipos generados y el modelo que consume
  la interfaz, incluidos los huecos dentro de un array.
- **Hooks** — el debounce con relojes falsos (incluida una racha de pulsaciones),
  las tres puertas de la URL (la aplicación, la escritura a mano y el `popstate`)
  y la paginación por cursor: que la segunda página venga del servidor, que un
  salto lejano pida solo las intermedias, que volver atrás no repita peticiones y
  que un fallo se pueda reintentar.
- **Componentes** — el buscador escribiendo en la URL tras el retardo, y la fila sin
  HTML inválido ni pérdida del rol de enlace.
- **Las dos vistas** — que en escritorio salga la tabla con paginador y sin carga
  infinita, y que en móvil salgan las tarjetas encadenadas, con el botón y el
  observer añadiendo páginas debajo sin quitar las anteriores.

Los tests de paginación cuentan las peticiones que salen por el enlace de Apollo
en vez de fiarse del orden de los mocks: es lo que demuestra que saltar a la
última página no pide de más, y que el `IntersectionObserver` no dispara una
petición por su cuenta.

No se prueban los Server Components asíncronos con Vitest; la guía de Next lo
desaconseja. Esos caminos se comprueban levantando el servidor.

## Despliegue

Pensado para Vercel: `npm run build` y `npm run start` no necesitan más
configuración, y el proyecto no usa nada específico de otra plataforma.

Antes del primer despliegue hay que definir `SWAPI_GRAPHQL_URL`,
`NEXT_PUBLIC_SWAPI_GRAPHQL_URL` y `NEXT_PUBLIC_ORIGIN` en las variables del
proyecto, con el dominio real en `NEXT_PUBLIC_ORIGIN` para que las URLs
canónicas y de Open Graph sean correctas.

Dos detalles del build que conviene conocer:

- La ruta `/` se genera como estática con revalidación cada 5 minutos.
- Si el despliegue vive en un subdirectorio, hay que fijar `turbopack.root` y
  `outputFileTracingRoot`; el aviso sobre un `pnpm-lock.yaml` fuera del repositorio
  que aparece en algunas máquinas tiene esa misma causa.
