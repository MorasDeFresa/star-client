import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BotonVolver from "./boton_volver";
import TarjetaPelicula from "./tarjeta_pelicula";
import {
  formatear_altura,
  formatear_genero,
  formatear_masa,
  formatear_nacimiento,
  SIN_DATO,
} from "@/lib/utilidades/formatear_medidas";
import type { PersonajeDetalle } from "@/lib/datos/tipos_vista";

export default function VistaDetalle({ personaje }: { personaje: PersonajeDetalle }) {
  const campos = [
    { etiqueta: "Género", valor: formatear_genero(personaje.genero) },
    { etiqueta: "Nacimiento", valor: formatear_nacimiento(personaje.anioNacimiento) },
    { etiqueta: "Altura", valor: formatear_altura(personaje.alturaCm) },
    { etiqueta: "Masa", valor: formatear_masa(personaje.masaKg) },
    { etiqueta: "Color de ojos", valor: personaje.colorOjos ?? SIN_DATO },
    { etiqueta: "Color de pelo", valor: personaje.colorPelo ?? SIN_DATO },
    { etiqueta: "Color de piel", valor: personaje.colorPiel ?? SIN_DATO },
    { etiqueta: "Especie", valor: personaje.especie ?? SIN_DATO },
  ];

  return (
    <Stack spacing={4}>
      <BotonVolver />

      <Stack spacing={1}>
        <Typography variant="h1" component="h1">
          {personaje.nombre}
        </Typography>
        {/* El planeta natal no se pide: `homeworld` no es consultable en
            `Person` (ver `consultar_personaje.graphql`). En vez de dejar un
            guion suelto debajo del nombre, el subtitulo dice lo que si se sabe. */}
        {personaje.planetaNatal ? (
          <Typography variant="body1" color="text.secondary">
            Nació en {personaje.planetaNatal.nombre}
          </Typography>
        ) : (
          <Typography variant="body1" color="text.secondary">
            {personaje.peliculas.length}{" "}
            {personaje.peliculas.length === 1 ? "película" : "películas"} de la saga original y las
            tres prequelas.
          </Typography>
        )}
      </Stack>

      {!personaje.datosCompletos && (
        <Alert severity="info" variant="outlined">
          El API público devuelve los personajes sin sus campos descriptivos. Esta ficha se ha
          reconstruido a partir de las películas del personaje, así que la altura, el color de ojos
          o la especie no son fiables.
        </Alert>
      )}

      {/* `dl` describe terminos y sus valores, que es exactamente la relacion
          entre la etiqueta de un dato de personaje y su valor. */}
      <Paper component="dl" variant="outlined" sx={{ p: 3, borderRadius: 2, m: 0 }}>
        <Stack direction="row" spacing={4} useFlexGap sx={{ flexWrap: "wrap", rowGap: 3 }}>
          {campos.map((campo) => (
            <BoxDato key={campo.etiqueta} etiqueta={campo.etiqueta} valor={campo.valor} />
          ))}
        </Stack>
      </Paper>

      <Stack spacing={2}>
        <Typography variant="h2" component="h2">
          Aparece en {personaje.peliculas.length}{" "}
          {personaje.peliculas.length === 1 ? "película" : "películas"}
        </Typography>

        {personaje.peliculas.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            Este personaje no aparece en ninguna película del archivo.
          </Typography>
        ) : (
          personaje.peliculas.map((pelicula) => (
            <Paper key={pelicula.id} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <TarjetaPelicula pelicula={pelicula} />
            </Paper>
          ))
        )}
      </Stack>

      {personaje.naves.length > 0 && (
        <Stack spacing={1.5}>
          <Divider />
          <Typography variant="h2" component="h2">
            Naves y vehículos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {personaje.naves.map((nave) => nave.nombre).join(", ")}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}

function BoxDato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <Typography
        component="dt"
        variant="overline"
        color="text.secondary"
        sx={{ display: "block" }}
      >
        {etiqueta}
      </Typography>
      <Typography component="dd" variant="body1" sx={{ m: 0 }}>
        {valor}
      </Typography>
    </div>
  );
}
