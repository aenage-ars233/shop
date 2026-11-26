# HTML Academy Shop

Учебный интернет-магазин курса «[Разработка с AI-агентами: инженерный подход](https://up.htmlacademy.ru/ai/2)». Финальное состояние: полный магазин с реализованной итоговой функцией — оформление заказа.

## Запуск

```bash
npm install
npm run dev
```

Сервер разработки запустится на `http://localhost:5173` на встроенных данных.

## Переменные окружения

Скопировать `.env.example` в `.env`:

| Переменная | Описание | По умолчанию |
|---|---|---|
| `VITE_USE_MOCK_DATA` | Использовать встроенные данные вместо обращения к поставщику | `true` |
| `VITE_API_KEY` | Ключ API поставщика | (пусто) |

В режиме разработки по умолчанию `true` — API поставщика не нужен. Чтобы попробовать реальный API: `VITE_USE_MOCK_DATA=false` и заполнить `VITE_API_KEY`.

## Скрипты

| Команда | Описание |
|---|---|
| `npm run dev` | Сервер разработки |
| `npm run build` | Сборка для продакшена |
| `npm test` | Модульные тесты через Vitest |
| `npm run lint` | Проверка ESLint |
| `npm run test:e2e` | Сквозные тесты через Playwright |

## Архитектура

```
src/
  api/                 # HTTP-клиент, адаптер, ошибки
    catalog.js
    catalog-adapter.js
    checkout.js          # Итоговая функция: API оформления заказа
    errors.js
    mocks/
  components/          # Переиспользуемые компоненты интерфейса
  data/                # Статические данные (товары, промокоды)
  features/            # Функциональные модули
    catalog/
    cart/
    checkout/          # Итоговая функция: страница оформления
  hooks/               # Хуки React
  utils/               # Чистые утилиты
docs/
  specs/api-catalog/   # Комплект спецификаций для API (критическая зона)
  specs/capstone/      # Комплект спецификаций для итоговой функции
  capstone-review.md   # Самооценка итоговой функции
  decisions.md         # Журнал решений
  pr-description.md     # Описание PR: что, зачем, как проверить, риски
  release-notes.md      # Заметки к релизу для пользователей
  risk-checklist.md     # Чек-лист релизных рисков
  mcp-inventory.md     # Подключённые MCP-серверы и их инструменты
  mcp-risk-log.md      # Риски подключения MCP
tests/e2e/             # Сквозные тесты Playwright
.cursor/
  mcp.json             # Конфигурация Playwright MCP
  rules/               # Правила Cursor: project.mdc, components.mdc
CHANGELOG.md           # История версий (формат Keep a Changelog)
```

## API-интеграция

Каталог товаров загружается через `GET /api/v2/products` с заголовком `X-Api-Key: ${VITE_API_KEY}`, оформление заказа — через `POST /api/v2/orders`. Адаптер `adaptProduct` преобразует snake_case формат поставщика в доменную модель. Интерфейс каталога поддерживает четыре состояния: `loading`, `retrying`, `fallback`, `failed`. Полная спецификация — `docs/specs/api-catalog/contract.md`.

## MCP

Подключён [Playwright MCP](https://github.com/microsoft/playwright-mcp) — агент в редакторе сам открывает страницы, нажимает на элементы, заполняет формы, делает снимки экрана и читает консоль, запуская тесты прямо из диалога. Конфигурация — `.cursor/mcp.json`. Политика подтверждений по типам инструментов и полный список — `docs/mcp-inventory.md`, `docs/mcp-risk-log.md`. Первый запуск скачает браузерное ядро Chromium (~300 МБ).

## Сквозные тесты

Лежат в `tests/e2e/`, конфигурация — `playwright.config.js`. Запуск:

```bash
npm run test:e2e
```

Тесты выполняются на локальном сервере разработки. Запустить их может и агент через Playwright MCP.

## Итоговая функция

Реализовано оформление заказа: форма адреса, выбор оплаты, экран подтверждения, очистка корзины. Полный комплект спецификаций — `docs/specs/capstone/`, самооценка — `docs/capstone-review.md`.

## Релиз 0.1.0

- `CHANGELOG.md` — история версий в формате Keep a Changelog.
- `docs/release-notes.md` — заметки к релизу для пользователей.
- `docs/risk-checklist.md` — чек-лист релизных рисков.
- `docs/pr-description.md` — описание релизного PR.

## Известные ограничения

- Оплата имитируется (встроенный обработчик всегда подтверждает).
- Корзина не сохраняется в localStorage между сессиями.
- Изображения товаров — заглушки.
