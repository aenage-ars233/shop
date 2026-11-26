import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../cart/CartContext.jsx";
import { submitOrder } from "../../api/checkout.js";
import { OrderForm } from "./OrderForm.jsx";
import styles from "./CheckoutPage.module.css";

function CheckoutPage() {
  const { items, promo, getSubtotal, getDelivery, getTotal, clearCart } = useCart();
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [orderId, setOrderId] = useState(null);
  const [apiError, setApiError] = useState(null);

  if (items.length === 0 && status !== "success") {
    return (
      <section className={styles.page}>
        <h1 className={styles.title}>Оформление заказа</h1>
        <p>
          Корзина пуста. <Link to="/">Перейти в каталог</Link>
        </p>
      </section>
    );
  }

  if (status === "success") {
    return (
      <section className={styles.page}>
        <h1 className={styles.title}>Заказ оформлен</h1>
        <p className={styles.success}>
          Ваш заказ <strong>{orderId}</strong> принят. Мы свяжемся с вами для подтверждения.
        </p>
        <Link to="/" className={styles.backLink}>Вернуться в каталог</Link>
      </section>
    );
  }

  const subtotal = getSubtotal();
  const delivery = getDelivery();
  const total = getTotal();
  const discountAmount = subtotal + delivery - total;

  async function handleOrderSubmit({ customer, payment }) {
    setStatus("submitting");
    setApiError(null);

    try {
      const result = await submitOrder({
        customer,
        payment,
        items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        promo: promo?.code ?? null,
      });
      setOrderId(result.orderId);
      clearCart();
      setStatus("success");
    } catch {
      setApiError("Не удалось оформить заказ. Попробуйте ещё раз.");
      setStatus("error");
    }
  }

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Оформление заказа</h1>

      <div className={styles.layout}>
        <OrderForm
          onSubmit={handleOrderSubmit}
          isSubmitting={status === "submitting"}
          apiError={status === "error" ? apiError : null}
        />

        <aside className={styles.summary}>
          <h2 className={styles.summaryTitle}>Ваш заказ</h2>
          <ul className={styles.summaryList}>
            {items.map((item) => (
              <li key={item.id} className={styles.summaryItem}>
                <span>{item.name} &times; {item.quantity}</span>
                <span>{item.price * item.quantity} ₽</span>
              </li>
            ))}
          </ul>
          <div className={styles.summaryTotals}>
            <div className={styles.summaryRow}>
              <span>Подытог:</span>
              <span>{subtotal} ₽</span>
            </div>
            {discountAmount > 0 && (
              <div className={styles.summaryRow}>
                <span>Скидка ({promo.discount}%):</span>
                <span className={styles.discount}>-{discountAmount} ₽</span>
              </div>
            )}
            <div className={styles.summaryRow}>
              <span>Доставка:</span>
              <span>{delivery === 0 ? "Бесплатно" : `${delivery} ₽`}</span>
            </div>
            <div className={styles.summaryRowTotal}>
              <span>Итого:</span>
              <span>{total} ₽</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default CheckoutPage;
