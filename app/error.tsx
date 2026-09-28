"use client";

import { useEffect } from "react";
import EstadoError from "@/components/ui/estado_error";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[listado] error al renderizar la pagina:", error.digest ?? error.message);
  }, [error]);

  return (
    <EstadoError
      titulo="No se pudo cargar el listado de personajes"
      detalle="El API publico de SWAPI puede no estar disponible en este momento."
      onReintentar={retry}
    />
  );
}
