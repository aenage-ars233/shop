import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
});

it("uses mock data by default in development without requesting the API", async () => {
  vi.stubEnv("VITE_USE_MOCK_DATA", undefined);
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  const { useProducts } = await import("../useProducts.js");

  const { result } = renderHook(() => useProducts());

  await waitFor(() => expect(result.current.status).toBe("success"));

  expect(result.current.products).toHaveLength(6);
  expect(fetchMock).not.toHaveBeenCalled();
});
