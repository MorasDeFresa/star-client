import { describe, expect, test } from "vitest";
import {
  formatear_altura,
  formatear_episodio,
  formatear_fecha_pelicula,
  formatear_genero,
  formatear_masa,
  formatear_nacimiento,
  SIN_DATO,
} from "@/lib/utilidades/formatear_medidas";

describe("formatear_altura y formatear_masa", () => {
  test("anaden la unidad", () => {
    expect(formatear_altura(172)).toBe("172 cm");
    expect(formatear_masa(77)).toBe("77 kg");
  });

  test("degradan a SIN_DATO con null", () => {
    expect(formatear_altura(null)).toBe(SIN_DATO);
    expect(formatear_masa(null)).toBe(SIN_DATO);
  });

  test("el cero es un dato, no una ausencia", () => {
    expect(formatear_altura(0)).toBe("0 cm");
    expect(formatear_masa(0)).toBe("0 kg");
  });
});

describe("formatear_genero", () => {
  test("normaliza a mayuscula inicial", () => {
    expect(formatear_genero("male")).toBe("Male");
    expect(formatear_genero("FEMALE")).toBe("Female");
    expect(formatear_genero("droid")).toBe("Droid");
  });

  test.each([null, "", "   ", "n/a", "N/A", "unknown", "UNKNOWN"])(
    "degrada a SIN_DATO el valor %p",
    (valor) => {
      expect(formatear_genero(valor)).toBe(SIN_DATO);
    },
  );
});

describe("formatear_nacimiento", () => {
  test("respeta el calendario de la galaxia", () => {
    expect(formatear_nacimiento("19BBY")).toBe("19BBY");
    expect(formatear_nacimiento("52BBY")).toBe("52BBY");
  });

  test("degrada a SIN_DATO con unknown", () => {
    expect(formatear_nacimiento("unknown")).toBe(SIN_DATO);
    expect(formatear_nacimiento(null)).toBe(SIN_DATO);
  });
});

describe("formatear_fecha_pelicula", () => {
  test("formatea en espanol y en UTC", () => {
    expect(formatear_fecha_pelicula("1977-05-25")).toBe("25 de mayo de 1977");
  });

  test("devuelve null para lo que no es fecha", () => {
    expect(formatear_fecha_pelicula(null)).toBeNull();
    expect(formatear_fecha_pelicula("n/a")).toBeNull();
  });

  test("devuelve el original si la fecha no se puede interpretar", () => {
    expect(formatear_fecha_pelicula("el dia de la Estrella de la Muerte")).toBe(
      "el dia de la Estrella de la Muerte",
    );
  });
});

describe("formatear_episodio", () => {
  test("antepone la palabra Episodio", () => {
    expect(formatear_episodio(4)).toBe("Episodio 4");
  });

  test("devuelve null para que la tarjeta pueda ocultar la etiqueta", () => {
    expect(formatear_episodio(null)).toBeNull();
  });
});
