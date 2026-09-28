import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { use_buscador_con_debounce } from "@/hooks/use_buscador_con_debounce";

describe("use_buscador_con_debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("no propaga el valor hasta que pasa el retraso", () => {
    const { result } = renderHook(() => use_buscador_con_debounce("a", 300));

    expect(result.current[0]).toBe("a");

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current[0]).toBe("a");
  });

  test("propaga el valor cuando el temporizador se cumple", () => {
    const { result } = renderHook(() => use_buscador_con_debounce("a", 300));

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current[0]).toBe("a");
  });

  test("solo propaga el ultimo valor de una racha de cambios", () => {
    const { result, rerender } = renderHook(({ v }) => use_buscador_con_debounce(v, 300), {
      initialProps: { v: "" },
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    for (const letra of ["l", "lu", "luk", "luke"]) {
      rerender({ v: letra });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current[0]).toBe("");
    }

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current[0]).toBe("luke");
  });

  test("avisa mientras hay un valor pendiente y se calma al aplicarlo", () => {
    const { result, rerender } = renderHook(({ v }) => use_buscador_con_debounce(v, 300), {
      initialProps: { v: "" },
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current[1]).toBe(false);

    rerender({ v: "leia" });
    expect(result.current[1]).toBe(true);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current[1]).toBe(false);
    expect(result.current[0]).toBe("leia");
  });

  test("descarta el temporizador al desmontar", () => {
    const { unmount } = renderHook(() => use_buscador_con_debounce("a", 300));
    unmount();

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }).not.toThrow();
    expect(vi.getTimerCount()).toBe(0);
  });
});
