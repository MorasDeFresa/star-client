"use client";

import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";

export default function BotonVolver() {
  const router = useRouter();

  return (
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={() => router.back()}
      sx={{ alignSelf: "flex-start", minHeight: 44 }}
    >
      Volver al listado
    </Button>
  );
}
