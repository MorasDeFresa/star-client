import Link from "next/link";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { obtener_personajes } from "@/lib/datos/obtener_personajes";
import TablaPersonajes from "./tabla_personajes";

export default async function VistaListado() {
  const pagina = await obtener_personajes();

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
          Los {pagina.total} personajes del universo Star Wars, con las peliculas en las que
          participan, sus directores y los planetas donde aparecen.
        </Typography>
      </Stack>

      <div id="listado" tabIndex={-1}>
        <TablaPersonajes paginaInicial={pagina} />
      </div>
    </Container>
  );
}
