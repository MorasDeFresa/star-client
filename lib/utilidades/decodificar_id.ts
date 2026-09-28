const SIN_TITULO = "Personaje de Star Wars";

export function decodificar_id(id: string): string {
  try {
    const bruto = atob(id);
    const separador = bruto.indexOf(":");
    return separador === -1 ? bruto : bruto.slice(separador + 1);
  } catch {
    return id;
  }
}

export function titulo_desde_id(id: string): string {
  return `${SIN_TITULO} #${decodificar_id(id)}`;
}

export function parece_id_swapi(valor: string): boolean {
  return /^[A-Za-z0-9+/]+={0,2}$/.test(valor) && valor.length % 4 === 0;
}
