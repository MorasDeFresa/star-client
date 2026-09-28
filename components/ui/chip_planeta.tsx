"use client";

import { useId } from "react";
import Chip from "@mui/material/Chip";

export default function ChipPlaneta({ nombre, contexto }: { nombre: string; contexto?: string }) {
  const id = useId();
  const etiqueta = contexto ? `${nombre}, en ${contexto}` : nombre;

  return (
    <Chip
      id={id}
      label={nombre}
      size="small"
      variant="outlined"
      aria-label={etiqueta}
      sx={{
        borderColor: "rgba(245, 165, 36, 0.45)",
        color: "primary.main",
      }}
    />
  );
}
