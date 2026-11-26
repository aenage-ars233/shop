import { ApiError, ErrorType } from "./errors.js";

export async function submitOrder(orderData) {
  let response;
  try {
    response = await fetch("/api/v2/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new ApiError("Request timed out", ErrorType.TIMEOUT);
    }
    throw new ApiError("Network error", ErrorType.NETWORK);
  }

  if (!response.ok) {
    throw new ApiError(`Order failed: ${response.status}`, ErrorType.SERVER, response.status);
  }

  return response.json();
}
