"use client";

import { useEffect, useRef } from "react";

export function use_observador_scroll_infinito<T extends Element>(
  al_alcanzar: () => void,
  opciones: IntersectionObserverInit = {},
) {
  const referencia = useRef<T | null>(null);
  const callback = useRef(al_alcanzar);
  callback.current = al_alcanzar;

  const { rootMargin, threshold, root } = opciones;

  useEffect(() => {
    const elemento = referencia.current;
    if (!elemento || typeof IntersectionObserver === "undefined") return;

    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) callback.current();
      },
      { rootMargin, threshold, root },
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, [rootMargin, threshold, root]);

  return referencia;
}
