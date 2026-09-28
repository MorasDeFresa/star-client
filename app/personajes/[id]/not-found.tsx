import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export default function PersonajeNoEncontrado() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="overline" color="primary.main">
          Error 404
        </Typography>

        <Typography variant="h1" component="h1" sx={{ mt: 1 }}>
          No encontramos ese personaje
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 4 }}>
          Puede que el enlace tenga un identificador equivocado. El archivo tiene 82 personajes, y
          todos se alcanzan desde el listado.
        </Typography>

        <Button href="/" variant="contained" size="large">
          Volver al archivo
        </Button>
      </Box>
    </Container>
  );
}
