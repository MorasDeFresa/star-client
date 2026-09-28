"use client";

import { useEffect, useRef, useState } from "react";

export function use_buscador_con_debounce<T>(valor: T, retraso = 300): [T, boolean] {
  const [aplazado, set_aplazado] = useState(valor);
  const [pendiente, set_pendiente] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (aplazado === valor) {
      set_pendiente(false);
      return;
    }

    set_pendiente(true);
    temporizador.current = setTimeout(() => {
      set_aplazado(valor);
      set_pendiente(false);
    }, retraso);

    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, [valor, aplazado, retraso]);

  return [aplazado, pendiente];
}
