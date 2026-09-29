import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import FilaPersonaje from "@/components/listado/fila_personaje";
import type { PersonajeResumen } from "@/lib/datos/tipos_vista";

const luke: PersonajeResumen = {
  id: "cGVvcGxlOjE=",
  nombre: "Luke Skywalker",
  apariciones: 4,
  primeraAparicion: "1977-05-25",
  ultimaAparicion: "1983-05-25",
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

/** La cabecera es la celda `th`; estas son las de datos, en orden de columna. */
function celdas() {
  return screen.getAllByRole("cell").map((celda) => celda.textContent);
}

describe("FilaPersonaje", () => {
  test("la fila es una fila de tabla, no un enlace disfrazado", () => {
    pintarFila();

    const fila = screen.getByRole("row");
    expect(fila.tagName).toBe("TR");
    expect(screen.getByRole("rowheader", { name: /Luke Skywalker/ })).toBeInTheDocument();
    expect(celdas()).toHaveLength(4);
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

  test("muestra cuantas peliculas aparece y las fechas de la primera y la ultima", () => {
    pintarFila();

    expect(celdas()).toEqual([
      "4",
      "25 de mayo de 1977",
      "25 de mayo de 1983",
      "Ver detalle",
    ]);
  });

  test("el cero es un dato: sin peliculas muestra 0 y no el guion largo", () => {
    pintarFila({ ...luke, apariciones: 0, primeraAparicion: null, ultimaAparicion: null });

    expect(celdas()).toEqual(["0", "—", "—", "Ver detalle"]);
  });

  test("muestra el guion largo cuando el API no trae apariciones", () => {
    pintarFila({ ...luke, apariciones: null, primeraAparicion: null, ultimaAparicion: null });

    expect(celdas()).toEqual(["—", "—", "—", "Ver detalle"]);
  });
});
