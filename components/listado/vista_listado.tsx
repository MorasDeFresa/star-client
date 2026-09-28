import Link from "next/link";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { obtener_indice_nombres } from "@/lib/datos/obtener_indice_nombres";
import { obtener_personajes } from "@/lib/datos/obtener_personajes";
import ListadoInteractivo from "./listado_interactivo";

export default async function VistaListado() {
  const [pagina, indice] = await Promise.all([obtener_personajes(), obtener_indice_nombres()]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Link href="#listado" className="enlace_salto">
        Saltar al listado
      </Link>

      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h1" component="h1">
          Archivo de personajes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Los {pagina.total} personajes del universo Star Wars. Abre cualquiera para ver las
          peliculas en las que participa, sus directores y los planetas donde aparece.
        </Typography>
      </Stack>

      <div id="listado" tabIndex={-1}>
        <ListadoInteractivo paginaInicial={pagina} indiceNombres={indice} />
      </div>
    </Container>
  );
}
