class UIManager {
  /**
   * Responsible for handling UI interactions: auth modal, tabs, forms, notifications.
   */
  constructor() {
    this.authModal = document.getElementById("authModal");
    this.registerForm = document.getElementById("registerForm");
    this.loginForm = document.getElementById("loginForm");

    // Initialize behavior
    this.initEventListeners();
    this.initDashboardTabs();
  }

  initEventListeners() {
    document.getElementById("startButton").addEventListener("click", () => {
      this.showAuthModal();
    });

    document.getElementById("showLogin").addEventListener("click", (e) => {
      e.preventDefault();
      this.showLoginForm();
    });

    document.getElementById("showRegister").addEventListener("click", (e) => {
      e.preventDefault();
      this.showRegisterForm();
    });

    document.getElementById("modalClose").addEventListener("click", () => {
      this.hideAuthModal();
    });

    document.getElementById("modalOverlay").addEventListener("click", () => {
      this.hideAuthModal();
    });

    document
      .getElementById("registerFormElement")
      .addEventListener("submit", (e) => this.handleRegister(e));
    document
      .getElementById("loginFormElement")
      .addEventListener("submit", (e) => this.handleLogin(e));

    // Обработчик перевода
    document
      .getElementById("makeTransfer")
      .addEventListener("click", () => this.handleTransfer());
  }

  /**
   * Initialize dashboard tab navigation (overview / transfer / history)
   */
  initDashboardTabs() {
    const navButtons = document.querySelectorAll(".nav-button");
    navButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabName = button.getAttribute("data-tab");
        this.switchTab(tabName);
      });
    });
  }

  /**
   * Switch visible tab by name (keeps DOM manipulation minimal).
   * @param {string} tabName - one of 'overview', 'transfer', 'history'
   */
  switchTab(tabName) {
    // Deactivate all nav buttons
    document
      .querySelectorAll(".nav-button")
      .forEach((btn) => btn.classList.remove("active"));

    // Hide all tab panes
    document
      .querySelectorAll(".tab-pane")
      .forEach((tab) => tab.classList.remove("active"));

    // Activate the chosen nav button and tab pane
    const button = document.querySelector(`[data-tab="${tabName}"]`);
    const pane = document.getElementById(`${tabName}Tab`);
    if (button) button.classList.add("active");
    if (pane) pane.classList.add("active");
  }

  handleTransfer() {
    // Read values from the UI; keep names explicit
    const fromAccount = document.getElementById("fromAccount")?.value || "";
    const toAccount = document.getElementById("toAccount")?.value || "";
    const amount = parseFloat(
      document.getElementById("transferAmount")?.value || "0"
    );
    const comment = document.getElementById("transferComment")?.value || "";

    // Basic validation
    if (!toAccount || !amount || amount <= 0) {
      this.showNotification("Заполните все поля корректно", "error");
      return;
    }

    // Demo behavior: notify and clear form
    this.showNotification(
      `Перевод на сумму ${amount}₽ выполнен успешно!`,
      "success"
    );

    // Clear form fields if they exist
    if (document.getElementById("toAccount"))
      document.getElementById("toAccount").value = "";
    if (document.getElementById("transferAmount"))
      document.getElementById("transferAmount").value = "";
    if (document.getElementById("transferComment"))
      document.getElementById("transferComment").value = "";
  }

  showAuthModal() {
    if (this.authModal) {
      this.authModal.style.display = "block";
      this.showRegisterForm();
    }
  }

  hideAuthModal() {
    if (this.authModal) {
      this.authModal.style.display = "none";
    }
  }

  showRegisterForm() {
    if (this.registerForm && this.loginForm) {
      document.getElementById("modalTitle").textContent = "Регистрация";
      this.registerForm.style.display = "block";
      this.loginForm.style.display = "none";
    }
  }

  showLoginForm() {
    if (this.registerForm && this.loginForm) {
      document.getElementById("modalTitle").textContent = "Вход";
      this.registerForm.style.display = "none";
      this.loginForm.style.display = "block";
    }
  }

  async handleRegister(e) {
    e.preventDefault();

    const userData = {
      firstName: document.getElementById("regFirstName").value,
      lastName: document.getElementById("regLastName").value,
      email: document.getElementById("regEmail").value,
      birthdate: document.getElementById("regBirthdate").value,
      // password: document.getElementById("regPassword").value,
    };

    try {
      this.setLoadingState(true);
      const result = await AuthService.register(userData);
      this.showNotification(
        "Регистрация успешна. Теперь войдите в аккаунт.",
        "success"
      );
      this.clearForm("registerFormElement");
      this.showLoginForm();
    } catch (error) {
      this.showNotification(error.message, "error");
    } finally {
      this.setLoadingState(false);
    }
  }

  async handleLogin(e) {
    e.preventDefault();

    const credentials = {
      username: document.getElementById("loginUsername").value,
      password: document.getElementById("loginPassword").value,
    };

    try {
      this.setLoadingState(true);
      const result = await AuthService.login(credentials);
      this.showNotification("Вход выполнен успешно", "success");
      this.hideAuthModal(); // Закрываем модальное окно после успешного входа
      this.clearForm("loginFormElement");
    } catch (error) {
      this.showNotification(error.message, "error");
    } finally {
      this.setLoadingState(false);
    }
  }

  setLoadingState(isLoading) {
    const buttons = document.querySelectorAll(
      "#registerFormElement button, #loginFormElement button"
    );
    buttons.forEach((button) => {
      button.disabled = isLoading;
      // Keep button text semantics based on the form container
      const isRegisterButton = Boolean(button.closest("#registerFormElement"));
      button.textContent = isLoading
        ? "Загрузка..."
        : isRegisterButton
        ? "Создать аккаунт"
        : "Войти";
    });
  }

  clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
  }

  showNotification(message, type) {
    const notification = document.getElementById("notification");
    if (notification) {
      notification.textContent = message;
      notification.className = `notification ${type} show`;

      setTimeout(() => {
        notification.classList.remove("show");
      }, 5000);
    }
  }
}

window.UIManager = new UIManager();
