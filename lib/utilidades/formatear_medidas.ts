const SIN_DATO = "—";

function es_vacio(valor: string | null | undefined): valor is null | undefined {
  if (!valor) return true;
  const limpio = valor.trim().toLowerCase();
  return limpio === "" || limpio === "n/a" || limpio === "unknown";
}

export function formatear_altura(centimetros: number | null): string {
  if (centimetros == null) return SIN_DATO;
  return `${centimetros} cm`;
}

export function formatear_masa(kilogramos: number | null): string {
  if (kilogramos == null) return SIN_DATO;
  return `${kilogramos} kg`;
}

export function formatear_genero(genero: string | null): string {
  if (es_vacio(genero)) return SIN_DATO;
  return genero.charAt(0).toUpperCase() + genero.slice(1).toLowerCase();
}

export function formatear_nacimiento(anio: string | null): string {
  if (es_vacio(anio)) return SIN_DATO;
  return anio;
}

export function formatear_fecha_pelicula(iso: string | null): string | null {
  if (es_vacio(iso)) return null;
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(fecha);
}

export function formatear_episodio(episodio: number | null): string | null {
  if (episodio == null) return null;
  return `Episodio ${episodio}`;
}

export { SIN_DATO };
