import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CartProvider, useCart } from "../../cart/CartContext.jsx";
import CheckoutPage from "../CheckoutPage.jsx";

// Bridge component: exposes addToCart via a ref callback so tests can call it
function CartBridge({ cartRef, children }) {
  const cart = useCart();
  if (cartRef) cartRef.current = cart;
  return children;
}

function renderWithCart(cartRef) {
  return render(
    <MemoryRouter>
      <CartProvider>
        <CartBridge cartRef={cartRef}>
          <CheckoutPage />
        </CartBridge>
      </CartProvider>
    </MemoryRouter>,
  );
}

describe("CheckoutPage — empty cart", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  it("shows empty cart message", () => {
    renderWithCart(null);
    expect(screen.getByText(/корзина пуста/i)).toBeTruthy();
  });

  it("shows link to catalog", () => {
    renderWithCart(null);
    expect(screen.getByRole("link", { name: /перейти в каталог/i })).toBeTruthy();
  });

  it("renders page heading", () => {
    renderWithCart(null);
    expect(screen.getByRole("heading", { name: /оформление заказа/i })).toBeTruthy();
  });
});

describe("CheckoutPage — with items", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  function setup() {
    const cartRef = { current: null };
    renderWithCart(cartRef);

    act(() => {
      cartRef.current.addToCart({ id: 1, name: "Футболка", price: 2000 }, 1);
    });

    return cartRef;
  }

  it("renders address form after adding item", () => {
    setup();
    expect(screen.getByLabelText(/имя/i)).toBeTruthy();
    expect(screen.getByLabelText(/телефон/i)).toBeTruthy();
    expect(screen.getByLabelText(/город/i)).toBeTruthy();
    expect(screen.getByLabelText(/адрес/i)).toBeTruthy();
  });

  it("shows order summary with item and total", () => {
    setup();
    expect(screen.getByText(/футболка/i)).toBeTruthy();
    expect(screen.getByText(/итого/i)).toBeTruthy();
  });

  it("shows validation errors when submitting empty form", async () => {
    setup();
    const submitBtn = screen.getByRole("button", { name: /оформить заказ/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/укажите имя/i)).toBeTruthy();
      expect(screen.getByText(/укажите телефон/i)).toBeTruthy();
      expect(screen.getByText(/укажите город/i)).toBeTruthy();
      expect(screen.getByText(/укажите адрес/i)).toBeTruthy();
    });
  });

  it("shows success state after successful submission", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ orderId: "ORD-123", status: "confirmed", message: "Заказ оформлен" }),
    });

    setup();

    fireEvent.change(screen.getByLabelText(/имя/i), { target: { value: "Иван" } });
    fireEvent.change(screen.getByLabelText(/телефон/i), { target: { value: "+79001234567" } });
    fireEvent.change(screen.getByLabelText(/город/i), { target: { value: "Москва" } });
    fireEvent.change(screen.getByLabelText(/адрес/i), { target: { value: "ул. Ленина, 1" } });

    fireEvent.click(screen.getByRole("button", { name: /оформить заказ/i }));

    await waitFor(() => {
      expect(screen.getByText(/заказ оформлен/i)).toBeTruthy();
      expect(screen.getByText(/ORD-123/)).toBeTruthy();
    });
  });

  it("shows error message and allows retry on API failure", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });

    setup();

    fireEvent.change(screen.getByLabelText(/имя/i), { target: { value: "Иван" } });
    fireEvent.change(screen.getByLabelText(/телефон/i), { target: { value: "+79001234567" } });
    fireEvent.change(screen.getByLabelText(/город/i), { target: { value: "Москва" } });
    fireEvent.change(screen.getByLabelText(/адрес/i), { target: { value: "ул. Ленина, 1" } });

    fireEvent.click(screen.getByRole("button", { name: /оформить заказ/i }));

    await waitFor(() => {
      expect(screen.getByText(/не удалось оформить заказ/i)).toBeTruthy();
    });

    // Retry button is still present (form stays on screen)
    expect(screen.getByRole("button", { name: /оформить заказ/i })).toBeTruthy();
  });

  it("disables submit button while submitting", async () => {
    let resolveOrder;
    fetch.mockReturnValueOnce(
      new Promise((resolve) => { resolveOrder = resolve; }),
    );

    setup();

    fireEvent.change(screen.getByLabelText(/имя/i), { target: { value: "Иван" } });
    fireEvent.change(screen.getByLabelText(/телефон/i), { target: { value: "+79001234567" } });
    fireEvent.change(screen.getByLabelText(/город/i), { target: { value: "Москва" } });
    fireEvent.change(screen.getByLabelText(/адрес/i), { target: { value: "ул. Ленина, 1" } });

    fireEvent.click(screen.getByRole("button", { name: /оформить заказ/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /оформляем/i }).disabled).toBe(true);
    });

    // Resolve to clean up
    resolveOrder({ ok: true, json: () => Promise.resolve({ orderId: "X" }) });
  });
});
