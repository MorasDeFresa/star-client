import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import FilaPersonaje from "@/components/listado/fila_personaje";
import type { PersonajeResumen } from "@/lib/datos/tipos_vista";

const luke: PersonajeResumen = {
  id: "cGVvcGxlOjE=",
  nombre: "Luke Skywalker",
  genero: null,
  anioNacimiento: null,
};

function pintarFila(personaje: PersonajeResumen = luke) {
  return render(
    <Table>
      <TableBody>
        <FilaPersonaje personaje={personaje} />
      </TableBody>
    </Table>,
  );
}

describe("FilaPersonaje", () => {
  test("la fila es una fila de tabla, no un enlace disfrazado", () => {
    pintarFila();

    const fila = screen.getByRole("row");
    expect(fila.tagName).toBe("TR");
    expect(screen.getByRole("rowheader", { name: /Luke Skywalker/ })).toBeInTheDocument();
  });

  test("el enlace conserva su rol y apunta a la ficha", () => {
    pintarFila();

    const enlace = screen.getByRole("link", { name: "Ver el detalle de Luke Skywalker" });
    expect(enlace).toHaveAttribute("href", "/personajes/cGVvcGxlOjE=");
  });

  test("el enlace se estira sobre la fila con un pseudoelemento", () => {
    const { container } = pintarFila();

    expect(container.querySelector("a")?.className).toBeTruthy();
    expect(screen.getByRole("row")).toBeInTheDocument();
  });

  test("el enlace es el unico control que recibe el foco", () => {
    pintarFila();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  test("React no avisa de anidamiento invalido", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    pintarFila();

    const avisos = error.mock.calls
      .map(([mensaje]) => String(mensaje))
      .filter((mensaje) => mensaje.includes("cannot contain a nested"));

    error.mockRestore();
    expect(avisos).toEqual([]);
  });

  test("muestra el guion largo cuando el API no trae genero ni nacimiento", () => {
    pintarFila();

    const fila = screen.getByRole("row");
    expect(fila).toHaveTextContent("Luke Skywalker");
    expect(fila).toHaveTextContent("—");
  });

  test("muestra el genero y el anio cuando el personaje los trae", () => {
    pintarFila({ id: "d2FyazI=", nombre: "Ayla Secura", genero: "female", anioNacimiento: "48BBY" });

    const fila = screen.getByRole("row");
    expect(fila).toHaveTextContent("Female");
    expect(fila).toHaveTextContent("48BBY");
  });
});
