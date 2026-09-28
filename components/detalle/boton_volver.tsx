"use client";

import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";

function hay_paso_atras_dentro_de_la_app(): boolean {
  if (typeof window === "undefined") return false;
  const estado = window.history.state as { __NA?: boolean } | null;
  return estado?.__NA === true;
}

export default function BotonVolver() {
  const router = useRouter();

  function volver() {
    if (hay_paso_atras_dentro_de_la_app()) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={volver}
      sx={{ alignSelf: "flex-start", minHeight: 44 }}
    >
      Volver al listado
    </Button>
  );
}
