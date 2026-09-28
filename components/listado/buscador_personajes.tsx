"use client";

import { useEffect, useId, useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { use_buscador_con_debounce } from "@/hooks/use_buscador_con_debounce";

export const RETRASO_BUSQUEDA_MS = 300;

export default function BuscadorPersonajes({ onBuscar }: { onBuscar: (texto: string) => void }) {
  const [texto, set_texto] = useState("");
  const [consulta, esperando] = use_buscador_con_debounce(texto, RETRASO_BUSQUEDA_MS);
  const id = useId();

  useEffect(() => {
    onBuscar(consulta);
    // `onBuscar` suele ser un `setState` del padre, estable entre renders. Si
    // se recreara, el efecto reventaria el debounce y volveria a filtrar en
    // cada tecla, que es justo lo que se quiere evitar.
  }, [consulta, onBuscar]);

  return (
    <TextField
      id={id}
      label="Buscar por nombre"
      value={texto}
      onChange={(evento) => set_texto(evento.target.value)}
      placeholder="Luke, Leia, Vader..."
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: esperando ? (
            <InputAdornment position="end">
              <CircularProgress size={16} aria-label="Buscando" />
            </InputAdornment>
          ) : texto ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => set_texto("")}
                aria-label="Borrar la busqueda"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
      sx={{ maxWidth: 420, width: "100%" }}
    />
  );
}
