import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import {
  escribir_consulta,
  PARAMETRO_BUSQUEDA,
  use_consulta_de_la_url,
} from "@/hooks/use_consulta_de_la_url";

describe("escribir_consulta", () => {
  test("pone el texto en el parametro q de la ruta actual", () => {
    escribir_consulta("luke");

    expect(window.location.search).toBe("?q=luke");
  });

  test("quita el parametro cuando el texto se queda en blanco", () => {
    escribir_consulta("luke");
    escribir_consulta("   ");

    expect(window.location.search).toBe("");
  });

  test("codifica los caracteres que romperian la URL", () => {
    escribir_consulta("obi & kenobi? #1");

    expect(window.location.search).toBe(`?${PARAMETRO_BUSQUEDA}=obi%20%26%20kenobi%3F%20%231`);
  });

  test("conserva el resto de la ruta", () => {
    window.history.replaceState(null, "", "/personajes");
    escribir_consulta("vader");

    expect(window.location.pathname).toBe("/personajes");
    expect(window.location.search).toBe("?q=vader");
  });

  test("no apila entradas en el historial", () => {
    const antes = window.history.length;
    escribir_consulta("a");
    escribir_consulta("ab");
    escribir_consulta("abc");

    expect(window.history.length).toBe(antes);
  });
});

describe("use_consulta_de_la_url", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  test("devuelve vacio si la URL no trae consulta", () => {
    const { result } = renderHook(() => use_consulta_de_la_url());

    expect(result.current).toBe("");
  });

  test("lee el valor inicial de la URL", () => {
    window.history.replaceState(null, "", "/?q=vader");
    const { result } = renderHook(() => use_consulta_de_la_url());

    expect(result.current).toBe("vader");
  });

  test("se actualiza cuando la propia aplicacion escribe", () => {
    const { result } = renderHook(() => use_consulta_de_la_url());

    act(() => {
      escribir_consulta("leia");
    });

    expect(result.current).toBe("leia");
  });

  test("se actualiza con el boton de atras del navegador", () => {
    const { result } = renderHook(() => use_consulta_de_la_url());

    act(() => {
      escribir_consulta("han");
      window.history.replaceState(null, "", "/?q=leia");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(result.current).toBe("leia");
  });

  test("deja de seguir los cambios al desmontar", () => {
    const { result, unmount } = renderHook(() => use_consulta_de_la_url());
    unmount();

    act(() => {
      escribir_consulta("darth");
    });

    expect(result.current).toBe("");
  });
});
