export type EstadisticasApariciones = {
  apariciones: number;
  primeraAparicion: string | null;
  ultimaAparicion: string | null;
};

export type IndiceApariciones = ReadonlyMap<string, EstadisticasApariciones>;

export type PersonajeResumen = {
  id: string;
  nombre: string;
  apariciones: number | null;
  primeraAparicion: string | null;
  ultimaAparicion: string | null;
};

export type PlanetaResumen = {
  id: string;
  nombre: string;
};

export type PeliculaDetalle = {
  id: string;
  titulo: string;
  episodio: number | null;
  director: string | null;
  fechaLanzamiento: string | null;
  planetas: PlanetaResumen[];
};

export type NaveResumen = {
  id: string;
  nombre: string;
};

export type PersonajeDetalle = {
  id: string;
  nombre: string;
  genero: string | null;
  anioNacimiento: string | null;
  alturaCm: number | null;
  masaKg: number | null;
  colorOjos: string | null;
  colorPelo: string | null;
  colorPiel: string | null;
  planetaNatal: PlanetaResumen | null;
  especie: string | null;
  naves: NaveResumen[];
  peliculas: PeliculaDetalle[];
  datosCompletos: boolean;
};

export type PaginaPersonajes = {
  personajes: PersonajeResumen[];
  total: number;
  cursorSiguiente: string | null;
  hayMas: boolean;
};

export type IndiceNombres = {
  entradas: { id: string; nombre: string }[];
  total: number;
};
