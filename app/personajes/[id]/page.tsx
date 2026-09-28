import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@mui/material/Container";
import { obtener_personaje } from "@/lib/datos/obtener_personaje";
import VistaDetalle from "@/components/detalle/vista_detalle";

export default async function PaginaPersonaje({ params }: PageProps<"/personajes/[id]">) {
  const { id } = await params;
  const personaje = await obtener_personaje(normalizar_id(id));

  if (!personaje) notFound();

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <VistaDetalle personaje={personaje} />
    </Container>
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/personajes/[id]">): Promise<Metadata> {
  const { id } = await params;

  try {
    const personaje = await obtener_personaje(normalizar_id(id));
    if (!personaje) return { title: "Personaje no encontrado" };

    const titulos = personaje.peliculas.map((pelicula) => pelicula.titulo);
    const descripcion = titulos.length
      ? `${personaje.nombre} aparece en ${titulos.length} ${
          titulos.length === 1 ? "película" : "películas"
        } de Star Wars: ${titulos.join(", ")}.`
      : `Ficha de ${personaje.nombre} en el archivo de personajes de Star Wars.`;

    return { title: personaje.nombre, description: descripcion };
  } catch {
    return { title: "Personaje" };
  }
}

function normalizar_id(id: string): string {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}
