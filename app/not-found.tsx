import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export default function NoEncontrado() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 12 } }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="overline" color="primary.main">
          Error 404
        </Typography>

        <Typography variant="h1" component="h1" sx={{ mt: 1 }}>
          Esta pagina no existe
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 4 }}>
          El enlace puede estar mal escrito, o el personaje que buscas no estar en el archivo.
        </Typography>

        {/* `href` en vez de `component={Link}`: MUI renderiza un `<a>` cuando ve
            `href`, y pasar el componente `Link` como prop desde un servidor a
            un cliente no se puede hacer. El enlace se abre en otra pestana y se
            ve como enlace en la barra de estado. */}
        <Button href="/" variant="contained" size="large">
          Volver al archivo
        </Button>
      </Box>
    </Container>
  );
}
