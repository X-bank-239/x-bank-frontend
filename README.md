# X-Bank Frontend

Современное банковское веб-приложение на Next.js с TypeScript и Tailwind CSS.

## Возможности

- Регистрация и авторизация пользователей (JWT)
- Мультивалютные счета (RUB, USD, EUR, CNY)
- Дебетовые и кредитные счета
- Переводы между счетами
- Пополнение счёта
- Платежи
- История транзакций с пагинацией

## Технологии

- **Next.js 15** - React фреймворк с App Router
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация
- **JWT** - аутентификация

## Установка

```bash
# Установить зависимости
npm install

# Запустить в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Запустить продакшен-сервер
npm start
```

## Структура проекта

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Защищённые страницы
│   │   ├── accounts/       # Управление счетами
│   │   └── transactions/   # Операции
│   ├── login/              # Страница входа
│   └── register/           # Страница регистрации
├── components/             # React компоненты
│   ├── dashboard/          # Компоненты дашборда
│   └── ui/                 # Базовые UI компоненты
├── contexts/               # React Context (Auth)
├── lib/                    # Утилиты и API клиенты
│   └── api/                # API функции
└── types/                  # TypeScript типы
```

## API

Приложение интегрировано с REST API:
- `POST /user/login` - вход
- `POST /user/create` - регистрация
- `GET /user/get-profile/{userId}` - профиль
- `POST /bank-account/create` - создание счёта
- `POST /transactions/transfer` - перевод
- `POST /transactions/deposit` - пополнение
- `POST /transactions/payment` - платёж
- `GET /transactions/get-recent/{accountId}` - история

## Разработка

```bash
npm run dev      # Запуск dev-сервера на http://localhost:3000
npm run lint     # Проверка ESLint
npm run build    # Сборка проекта
```
