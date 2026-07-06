# Семейный планер 🍽🧺

PWA для двоих: **меню недели**, **общий список покупок**, **КБЖУ по дням** и **семейные дела**
(стирка/уборка/… лейблами на числах). Интерфейс в стиле Final Surge — недельная лента дней сверху,
карточка дня снизу.

**Стек:** Nuxt 3 (SPA) · Firebase (Firestore + Anonymous Auth) · GitHub Pages.
Без своего сервера, без SQL, бесплатно.

## Как это работает

- Данные живут в **Firestore** (NoSQL). Синхронизация между устройствами — в реальном времени,
  вручную «обновлять» не нужно.
- **Без логина**: одно устройство создаёт «семью», второе открывает присланную ссылку — и всё.
  Вход анонимный, сессия хранится в IndexedDB и переживает добавление на домашний экран (iOS).
- Доступ к данным защищён неугадываемым ID семьи (в части ссылки после `#`, на серверы не уходит)
  и правилами Firestore.

## Настройка Firebase (один раз, ~5 минут)

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. **Build → Firestore Database** → Create (production mode).
3. **Build → Authentication → Sign-in method** → включить **Anonymous**.
4. **Project settings → General → Your apps** → Web (`</>`) → зарегистрировать → скопировать
   значения `firebaseConfig`.
5. Правила Firestore (**Firestore → Rules**) — вставить содержимое [firestore.rules](firestore.rules).

## Переменные окружения

Создай `.env` (не коммитится) на основе `firebaseConfig`:

```
NUXT_PUBLIC_FIREBASE_API_KEY=…
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=…
NUXT_PUBLIC_FIREBASE_PROJECT_ID=…
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=…
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=…
NUXT_PUBLIC_FIREBASE_APP_ID=…
```

> `firebaseConfig` публичный by design — его безопасно отдавать на клиент. Защита данных —
> через Auth + правила + секретный ID семьи.

Для деплоя те же значения положи в **GitHub → Settings → Secrets and variables → Actions**
(имена те же), их подхватит workflow.

## Запуск и сборка

```bash
npm install
npm run dev        # http://localhost:3000
npm run generate   # статика в .output/public
```

## Деплой (GitHub Pages)

Push в `main` → GitHub Actions собирает и публикует `.output/public` на Pages
(см. [.github/workflows/deploy.yml](.github/workflows/deploy.yml)).
Base path — `/meal-plan/` (репозиторный Pages-URL). Для кастомного домена задай
`NUXT_APP_BASE_URL=/`.

## Первый запуск на телефоне

1. Открой ссылку приложения в **Safari** → «Поделиться» → **«На экран „Домой"»**.
2. Запусти с домашнего экрана → ⚙️ → **«Создать семью»**.
3. ⚙️ → **«Поделиться с Ирой»** → отправь ссылку. На втором телефоне открой ссылку в Safari,
   добавь на домашний экран — данные подтянутся сами.

## Каждую неделю

Новый план генерируется в чате с Claude (идеи меню → JSON) и загружается один раз:
⚙️ → **«Импорт плана недели»** → вставить JSON → «Загрузить план».

## Формат плана

Пример — в [plan.example.json](plan.example.json). Кратко:

```json
{
  "title": "Неделя 6–12 июля",
  "targets": {
    "Илья": { "kcal": 2600, "p": 170, "f": 85, "c": 290 },
    "Ира":  { "kcal": 1900, "p": 120, "f": 65, "c": 210 }
  },
  "days": [{
    "date": "2026-07-06", "name": "Понедельник",
    "labels": [{ "id": "l1", "text": "Стирка", "icon": "🧺", "color": "#0a84ff" }],
    "meals": [{
      "slot": "Завтрак", "name": "Овсянка",
      "kbju": { "kcal": 520, "p": 18, "f": 16, "c": 78 },
      "cook": true, "leftover": false, "note": "…", "imageUrl": "https://…"
    }]
  }],
  "shopping": [{ "cat": "Мясо и рыба", "items": [{ "n": "Куриное филе", "q": "1.8 кг" }] }]
}
```

- `targets` — опционально; если есть, обновляет цели семьи.
- `labels` — дела дня (стирка/уборка/…); их также можно добавлять прямо в приложении (кнопка «＋ дело»).
- `imageUrl` у блюда — опционально; станет фото в шапке карточки дня.

## Для дизайнера 🎨

Цвета, скругления, тёмная тема — в [assets/css/tokens.css](assets/css/tokens.css), блок `:root`.
Каждая переменная подписана.
