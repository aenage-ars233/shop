import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitOrder } from "../checkout.js";
import { ApiError, ErrorType } from "../errors.js";

describe("submitOrder", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("submits order successfully", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ orderId: "ORD-123", status: "confirmed" }),
    });

    const result = await submitOrder({ items: [], address: {} });
    expect(result.orderId).toBe("ORD-123");
  });

  it("throws on server error", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(submitOrder({})).rejects.toThrow("Order failed");
  });

  it("throws TIMEOUT on timeout", async () => {
    fetch.mockRejectedValueOnce(Object.assign(new Error(), { name: "TimeoutError" }));

    try {
      await submitOrder({});
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error.type).toBe(ErrorType.TIMEOUT);
    }
  });

  it("throws NETWORK on network error", async () => {
    fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    try {
      await submitOrder({});
    } catch (error) {
      expect(error.type).toBe(ErrorType.NETWORK);
    }
  });

  it("sends POST with JSON body", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ orderId: "ORD-1" }),
    });

    const orderData = { items: [{ id: 1, quantity: 2 }], address: { city: "Москва" } };
    await submitOrder(orderData);

    expect(fetch).toHaveBeenCalledWith(
      "/api/v2/orders",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(orderData),
      }),
    );
  });

  it("sends correct Content-Type header", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ orderId: "ORD-1" }),
    });

    await submitOrder({});
    expect(fetch).toHaveBeenCalledWith(
      "/api/v2/orders",
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
      }),
    );
  });
});
