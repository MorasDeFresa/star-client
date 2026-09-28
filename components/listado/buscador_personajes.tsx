"use client";

import { useEffect, useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { use_buscador_con_debounce } from "@/hooks/use_buscador_con_debounce";
import { escribir_consulta, use_consulta_de_la_url } from "@/hooks/use_consulta_de_la_url";

export const RETRASO_BUSQUEDA_MS = 300;

export default function BuscadorPersonajes() {
  const consulta = use_consulta_de_la_url();
  const [texto, set_texto] = useState(consulta);
  const [consulta_aplicada, set_consulta_aplicada] = useState(consulta);
  const [valor_retrasado, esperando] = use_buscador_con_debounce(texto, RETRASO_BUSQUEDA_MS);

  if (consulta !== consulta_aplicada) {
    set_consulta_aplicada(consulta);
    set_texto(consulta);
  }

  useEffect(() => {
    if (valor_retrasado !== consulta) escribir_consulta(valor_retrasado);
  }, [valor_retrasado, consulta]);

  return (
    <TextField
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
