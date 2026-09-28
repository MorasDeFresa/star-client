import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import BuscadorPersonajes from "@/components/listado/buscador_personajes";

describe("BuscadorPersonajes", () => {
  test("escribe el texto en la URL una vez que el retardo pasa", async () => {
    const usuario = userEvent.setup();
    render(<BuscadorPersonajes />);

    await usuario.type(screen.getByRole("textbox", { name: /buscar por nombre/i }), "luke");

    expect(screen.getByRole("textbox", { name: /buscar por nombre/i })).toHaveValue("luke");

    await waitFor(() => expect(window.location.search).toBe("?q=luke"));
  });

  test("solo deja el ultimo texto de una racha de pulsaciones", async () => {
    const usuario = userEvent.setup();
    render(<BuscadorPersonajes />);

    const campo = screen.getByRole("textbox", { name: /buscar por nombre/i });
    await usuario.type(campo, "leia");

    await waitFor(() => expect(window.location.search).toBe("?q=leia"));
  });

  test("muestra el texto que ya venia en la URL", async () => {
    window.history.replaceState(null, "", "/?q=vader");
    render(<BuscadorPersonajes />);

    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: /buscar por nombre/i })).toHaveValue("vader"),
    );
  });

  test("el boton de borrar limpia el campo y la URL", async () => {
    const usuario = userEvent.setup();
    window.history.replaceState(null, "", "/?q=vader");
    render(<BuscadorPersonajes />);

    const campo = screen.getByRole("textbox", { name: /buscar por nombre/i });
    await waitFor(() => expect(campo).toHaveValue("vader"));

    await usuario.click(screen.getByRole("button", { name: /borrar la busqueda/i }));

    await waitFor(() => expect(campo).toHaveValue(""));
    await waitFor(() => expect(window.location.search).toBe(""));
  });

  test("el icono de buscar y el de borrar tienen nombre accesible", () => {
    render(<BuscadorPersonajes />);

    expect(screen.getByRole("textbox", { name: /buscar por nombre/i })).toBeInTheDocument();
  });

  test("el campo esta etiquetado y con su ayuda", () => {
    render(<BuscadorPersonajes />);

    const campo = screen.getByRole("textbox", { name: /buscar por nombre/i });

    expect(campo).toHaveAccessibleName("Buscar por nombre");
  });
});
