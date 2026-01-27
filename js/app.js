// Main application initialization
/**
 * Main app orchestration: connects UI interactions to services.
 */
class BankApp {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadInitialData();
  }

  setupEventListeners() {
    // Navigation
    this.setupNavigation();

    // Transfer form
    this.setupTransferForm();

    // History buttons
    this.setupHistoryButtons();

    // Logout button
    this.setupLogoutButton();

    // Filter changes
    this.setupFilters();
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleNavigation(link);
      });
    });
  }

  handleNavigation(clickedLink) {
    const targetSection = clickedLink.getAttribute("data-section");

    // Remove active class from all links and sections
    document
      .querySelectorAll(".nav-link")
      .forEach((link) => link.classList.remove("active"));
    document
      .querySelectorAll(".content-section")
      .forEach((section) => section.classList.remove("active"));

    // Add active class to clicked link
    clickedLink.classList.add("active");

    // Show target section (defensive: check element exists)
    const targetEl = document.getElementById(targetSection);
    if (targetEl) targetEl.classList.add("active");

    // Load section-specific data
    this.loadSectionData(targetSection);
  }

  loadSectionData(section) {
    switch (section) {
      case "overview":
        this.loadOverviewData();
        break;
      case "transfer":
        this.loadTransferData();
        break;
      case "history":
        this.loadHistoryData();
        break;
      case "detailed-history":
        this.loadDetailedHistoryData();
        break;
    }
  }

  setupTransferForm() {
    const transferForm = document.getElementById("transfer-form");
    if (transferForm) {
      transferForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleTransfer();
      });
    }
  }

  async handleTransfer() {
    const formData = {
      fromAccount: document.getElementById("from-account").value,
      toAccount: document.getElementById("to-account").value,
      amount: parseFloat(document.getElementById("amount").value),
      message: document.getElementById("message").value || "Перевод средств",
    };

    // Basic validation
    if (!this.validateTransfer(formData)) {
      return;
    }

    // Disable submit button
    const submitBtn = document.querySelector(
      '#transfer-form button[type="submit"]'
    );
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Выполняется...";

    try {
      const success = await transactionsService.processTransfer(formData);
      if (success) {
        document.getElementById("transfer-form").reset();
      }
    } finally {
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  validateTransfer(formData) {
    if (!formData.fromAccount) {
      showError("Выберите счет для списания");
      return false;
    }

    if (!formData.toAccount) {
      showError("Введите номер счета получателя");
      return false;
    }

    if (!formData.amount || formData.amount <= 0) {
      showError("Введите корректную сумму перевода");
      return false;
    }

    return true;
  }

  setupHistoryButtons() {
    // Show all history button
    const showAllHistoryBtn = document.getElementById("show-all-history");
    if (showAllHistoryBtn) {
      showAllHistoryBtn.addEventListener("click", () => {
        this.showDetailedHistory();
      });
    }

    // Back to history button
    const backToHistoryBtn = document.getElementById("back-to-history");
    if (backToHistoryBtn) {
      backToHistoryBtn.addEventListener("click", () => {
        this.showMainHistory();
      });
    }
  }

  showDetailedHistory() {
    // Hide all sections
    document
      .querySelectorAll(".content-section")
      .forEach((section) => section.classList.remove("active"));
    document
      .querySelectorAll(".nav-link")
      .forEach((link) => link.classList.remove("active"));

    // Show detailed history
    document.getElementById("detailed-history").classList.add("active");

    // Load detailed history data
    this.loadDetailedHistoryData();
  }

  showMainHistory() {
    // Hide all sections
    document
      .querySelectorAll(".content-section")
      .forEach((section) => section.classList.remove("active"));
    document
      .querySelectorAll(".nav-link")
      .forEach((link) => link.classList.remove("active"));

    // Show main history and activate nav link
    document.getElementById("history").classList.add("active");
    document
      .querySelector('.nav-link[data-section="history"]')
      .classList.add("active");

    // Load history data
    this.loadHistoryData();
  }

  setupFilters() {
    const dateFilter = document.getElementById("date-filter");
    const typeFilter = document.getElementById("type-filter");

    if (dateFilter) {
      dateFilter.addEventListener("change", () => {
        this.loadDetailedHistoryData();
      });
    }

    if (typeFilter) {
      typeFilter.addEventListener("change", () => {
        this.loadDetailedHistoryData();
      });
    }
  }

  setupLogoutButton() {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await auth.logout();
      });
    }
  }

  async loadInitialData() {
    if (auth.isAuthenticated()) {
      await this.loadOverviewData();
    }
  }

  async loadOverviewData() {
    await transactionsService.loadAccounts();
  }

  async loadTransferData() {
    await transactionsService.loadAccounts(); // To populate account select
  }

  async loadHistoryData() {
    await transactionsService.loadRecentTransactions();
  }

  async loadDetailedHistoryData() {
    await transactionsService.loadDetailedHistory();
  }
}

// Demo login function for testing (remove in production)
async function demoLogin() {
  const success = await auth.login("demo@bank.com", "password");
  if (success) {
    // Reload initial data
    const app = new BankApp();
    await app.loadOverviewData();
  }
}

// Demo data initialization for testing (remove in production)
function initDemoData() {
  if (!auth.isAuthenticated()) {
    // Auto-login for demo
    setTimeout(() => {
      demoLogin();
    }, 1000);
  }
}

// Initialize application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const app = new BankApp();
  initDemoData(); // Remove this in production
});
