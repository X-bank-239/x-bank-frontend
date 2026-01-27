class AuthService {
  /**
   * Register new user (tries backend, falls back to demo register on network error)
   * @param {{firstname:string,lastname:string,email:string,birthdate:date}} userData
   * @returns {Promise<object>} created user object or demo user
   */
  static async register(userData) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        // Если бэкенд недоступен, используем демо-режим
        if (response.status === 0) {
          console.log("Бэкенд недоступен, используем демо-режим");
          return this.demoRegister(userData);
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Ошибка регистрации: ${response.status}`
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("AuthService register error:", error);

      // Если ошибка сети, используем демо-режим
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("Network")
      ) {
        console.log("Сетевая ошибка, используем демо-режим");
        return this.demoRegister(userData);
      }

      throw error;
    }
  }

  static async login(credentials) {
    /**
     * Login with backend; falls back to demo login on network error.
     * @param {{username:string,password:string}} credentials
     */
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        }
      );

      if (!response.ok) {
        // Если бэкенд недоступен, используем демо-режим
        if (response.status === 0) {
          console.log("Бэкенд недоступен, используем демо-режим");
          return this.demoLoginWithCredentials(credentials);
        }

        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error("Неверное имя пользователя или пароль");
        }

        throw new Error(
          errorData.message || `Ошибка входа: ${response.status}`
        );
      }

      const result = await response.json();

      this.setUserData(result);
      this.updateUI();

      return result;
    } catch (error) {
      console.error("AuthService login error:", error);

      // Если ошибка сети, используем демо-режим
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("Network")
      ) {
        console.log("Сетевая ошибка, используем демо-режим");
        return this.demoLoginWithCredentials(credentials);
      }

      throw error;
    }
  }

  /* Демо-функции */
  static demoRegister(userData) {
    console.log("Демо-регистрация:", userData);

    const demoUser = {
      id: Date.now(),
      username: userData.username,
      email: userData.email,
      token: "demo-token-" + Date.now(),
    };

    this.setUserData(demoUser);
    this.updateUI();

    return demoUser;
  }

  /**
   * Demo login helper that accepts credentials and returns a demo user.
   * (Used as a fallback when backend is unavailable)
   * @param {{username?:string}} credentials
   */
  static demoLoginWithCredentials(credentials) {
    console.log("Демо-вход (credentials):", credentials);

    const demoUser = {
      id: 1,
      username: credentials.username || "demo-user",
      email: "demo@xbank.ru",
      token: "demo-token-12345",
    };

    this.setUserData(demoUser);
    this.updateUI();

    return demoUser;
  }

  static demoLogin() {
    console.log("Быстрый демо-вход");

    const demoUser = {
      id: 1,
      username: "Демо-Пользователь",
      email: "demo@xbank.ru",
      token: "demo-token-12345",
    };

    this.setUserData(demoUser);
    this.updateUI();

    // Закрываем модальное окно авторизации напрямую
    const authModal = document.getElementById("authModal");
    if (authModal) {
      authModal.style.display = "none";
    }

    this.showNotification("Демо-вход выполнен успешно!", "success");
  }

  static showNotification(message, type) {
    const notification = document.getElementById("notification");
    if (notification) {
      notification.textContent = message;
      notification.className = `notification ${type} show`;

      setTimeout(() => {
        notification.classList.remove("show");
      }, 5000);
    }
  }

  /* Остальные методы без изменений */
  static setUserData(userData) {
    localStorage.setItem("xbank_user", JSON.stringify(userData));
  }

  static getCurrentUser() {
    const user = localStorage.getItem("xbank_user");
    return user ? JSON.parse(user) : null;
  }

  static isAuthenticated() {
    return this.getCurrentUser() !== null;
  }

  static logout() {
    localStorage.removeItem("xbank_user");
    this.updateUI();
  }

  static updateUI() {
    const user = this.getCurrentUser();
    const welcomeView = document.getElementById("welcomeView");
    const dashboardView = document.getElementById("dashboardView");
    const headerActions = document.getElementById("headerActions");

    if (user) {
      if (welcomeView) welcomeView.style.display = "none";
      if (dashboardView) {
        dashboardView.style.display = "block";
        const userName = document.getElementById("userName");
        if (userName) userName.textContent = user.username || "Пользователь";
      }
      if (headerActions) {
        headerActions.innerHTML = `
                    <div class="user-info">
                        <span>${user.username}</span>
                        <button class="secondary-button" onclick="AuthService.logout()">Выйти</button>
                    </div>
                `;
      }
    } else {
      if (welcomeView) welcomeView.style.display = "flex";
      if (dashboardView) dashboardView.style.display = "none";
      if (headerActions) {
        headerActions.innerHTML = `
                    <button class="primary-button" onclick="AuthService.showAuthModal()">Войти</button>
                `;
      }
    }
  }

  static showAuthModal() {
    const authModal = document.getElementById("authModal");
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    if (authModal) {
      authModal.style.display = "block";

      // Показываем форму регистрации по умолчанию
      if (registerForm && loginForm) {
        registerForm.style.display = "block";
        loginForm.style.display = "none";
        document.getElementById("modalTitle").textContent = "Регистрация";
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  AuthService.updateUI();
});
