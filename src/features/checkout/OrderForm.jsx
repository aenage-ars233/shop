import { useState } from "react";
import styles from "./OrderForm.module.css";

const PAYMENT_METHODS = [
  { value: "card", label: "Картой при доставке" },
  { value: "cash", label: "Наличными при доставке" },
];

const EMPTY_FORM = { name: "", phone: "", city: "", address: "" };

function validateForm(fields) {
  const errors = {};
  if (!fields.name.trim()) errors.name = "Укажите имя";
  if (!fields.phone.trim()) errors.phone = "Укажите телефон";
  if (!fields.city.trim()) errors.city = "Укажите город";
  if (!fields.address.trim()) errors.address = "Укажите адрес";
  return errors;
}

export function OrderForm({ onSubmit, isSubmitting = false, apiError = null }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [payment, setPayment] = useState("card");
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({ customer: form, payment });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Адрес доставки</legend>

        <label className={styles.label}>
          Имя
          <input
            className={styles.input}
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <span id="name-error" className={styles.fieldError} role="alert">
              {errors.name}
            </span>
          )}
        </label>

        <label className={styles.label}>
          Телефон
          <input
            className={styles.input}
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {errors.phone && (
            <span id="phone-error" className={styles.fieldError} role="alert">
              {errors.phone}
            </span>
          )}
        </label>

        <label className={styles.label}>
          Город
          <input
            className={styles.input}
            name="city"
            type="text"
            value={form.city}
            onChange={handleChange}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? "city-error" : undefined}
          />
          {errors.city && (
            <span id="city-error" className={styles.fieldError} role="alert">
              {errors.city}
            </span>
          )}
        </label>

        <label className={styles.label}>
          Адрес
          <input
            className={styles.input}
            name="address"
            type="text"
            value={form.address}
            onChange={handleChange}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.address)}
            aria-describedby={errors.address ? "address-error" : undefined}
          />
          {errors.address && (
            <span id="address-error" className={styles.fieldError} role="alert">
              {errors.address}
            </span>
          )}
        </label>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Способ оплаты</legend>
        {PAYMENT_METHODS.map(({ value, label }) => (
          <label key={value} className={styles.radioLabel}>
            <input
              type="radio"
              name="payment"
              value={value}
              checked={payment === value}
              onChange={() => setPayment(value)}
              disabled={isSubmitting}
            />
            {label}
          </label>
        ))}
      </fieldset>

      {apiError && (
        <p className={styles.apiError} role="alert">
          {apiError}
        </p>
      )}

      <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Оформляем..." : "Оформить заказ"}
      </button>
    </form>
  );
}
