import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-slate-950">
      {/* Шапка как в Сбербанк Онлайн: логотип, вход, открыть счёт */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-6xl">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">X</span>
            </div>
            <span className="text-xl font-semibold text-slate-800 dark:text-slate-100">X-Bank</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium text-sm transition-colors"
            >
              Войти
            </Link>
            <Link
              href="/register"
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              Открыть счёт
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-12 pb-20 max-w-6xl">
        {/* Главный экран — как в Сбербанк: один акцент, два действия */}
        <div className="max-w-2xl mx-auto text-center pt-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            X-Bank — управление финансами
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Переводы, платежи и счета в одном приложении.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors shadow-sm"
            >
              Войти
            </Link>
            <Link
              href="/register"
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-6 py-3 rounded-lg font-semibold text-sm transition-colors border border-slate-200 dark:border-slate-700"
            >
              Открыть счёт
            </Link>
          </div>
        </div>

        {/* Блоки преимуществ — карточки как в Сбере */}
        <div className="grid md:grid-cols-3 gap-4 mt-16">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Мгновенные переводы</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Переводите деньги между счетами и другим пользователям без комиссий.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Мультивалютность</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Рубли, доллары, евро, юани. Хранение и конвертация в одном месте.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Безопасность</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Защита данных и современные стандарты безопасности.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm">
          © 2026 X-Bank. Все права защищены.
        </div>
      </footer>
    </div>
  );
}
