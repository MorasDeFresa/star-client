"use client";

import { useSyncExternalStore } from "react";

export const PARAMETRO_BUSQUEDA = "q";

const EVENTO_CAMBIO = "star-client:cambio-busqueda";

function suscribir(al_cambiar: () => void): () => void {
  window.addEventListener("popstate", al_cambiar);
  window.addEventListener(EVENTO_CAMBIO, al_cambiar);
  return () => {
    window.removeEventListener("popstate", al_cambiar);
    window.removeEventListener(EVENTO_CAMBIO, al_cambiar);
  };
}

function leer_consulta(): string {
  return new URLSearchParams(window.location.search).get(PARAMETRO_BUSQUEDA) ?? "";
}

function leer_consulta_en_servidor(): string {
  return "";
}

export function use_consulta_de_la_url(): string {
  return useSyncExternalStore(suscribir, leer_consulta, leer_consulta_en_servidor);
}

export function escribir_consulta(texto: string): void {
  const limpio = texto.trim();
  const url = limpio
    ? `${window.location.pathname}?${PARAMETRO_BUSQUEDA}=${encodeURIComponent(limpio)}`
    : window.location.pathname;

  window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(EVENTO_CAMBIO));
}
