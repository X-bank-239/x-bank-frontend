// API service for backend communication
/**
 * Minimal API service wrapper used by the app.
 * Keeps a single request method and a few convenience endpoints.
 */
class ApiService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  // Generic request method
  /**
   * Generic fetch wrapper. Adds JSON headers and optional Authorization.
   * @param {string} endpoint
   * @param {RequestInit} [options]
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith("http")
      ? endpoint
      : this.baseUrl + endpoint;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if user is logged in (CURRENT_USER optional)
    try {
      if (
        typeof CURRENT_USER !== "undefined" &&
        CURRENT_USER &&
        CURRENT_USER.token
      ) {
        config.headers["Authorization"] = `Bearer ${CURRENT_USER.token}`;
      }
    } catch (e) {
      // ignore if CURRENT_USER isn't defined in this build/runtime
    }

    try {
      showLoading();
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Ошибка сервера");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    } finally {
      hideLoading();
    }
  }

  // Authentication methods
  async login(credentials) {
    return this.request(API_CONFIG.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request(API_CONFIG.AUTH.LOGOUT, {
      method: "POST",
    });
  }

  async getProfile() {
    return this.request(API_CONFIG.AUTH.PROFILE);
  }

  // Accounts methods
  async getAccounts() {
    return this.request(API_CONFIG.ACCOUNTS.LIST);
  }

  async getAccount(accountId) {
    return this.request(
      getApiUrl(API_CONFIG.ACCOUNTS.DETAIL, { id: accountId })
    );
  }

  // Transactions methods
  async getTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint =
      API_CONFIG.TRANSACTIONS.LIST + (queryString ? `?${queryString}` : "");
    return this.request(endpoint);
  }

  async createTransaction(transactionData) {
    return this.request(API_CONFIG.TRANSACTIONS.CREATE, {
      method: "POST",
      body: JSON.stringify(transactionData),
    });
  }

  // Transfers methods
  async createTransfer(transferData) {
    return this.request(API_CONFIG.TRANSFERS.CREATE, {
      method: "POST",
      body: JSON.stringify(transferData),
    });
  }

  async validateTransfer(transferData) {
    return this.request(API_CONFIG.TRANSFERS.VALIDATE, {
      method: "POST",
      body: JSON.stringify(transferData),
    });
  }
}

// Create global API instance
const api = new ApiService();

// Loading utility functions
function showLoading() {
  const loading = document.getElementById("loading");
  if (loading) loading.style.display = "flex";
}

function hideLoading() {
  const loading = document.getElementById("loading");
  if (loading) loading.style.display = "none";
}

// Error handling utility
function showError(message) {
  // Remove existing error messages
  const existingError = document.querySelector(".error-message");
  if (existingError) existingError.remove();

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;

  // Insert at the top of main content
  const main = document.querySelector("main");
  if (main) main.insertBefore(errorDiv, main.firstChild);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) errorDiv.remove();
  }, 5000);
}

function showSuccess(message) {
  const successDiv = document.createElement("div");
  successDiv.className = "success-message";
  successDiv.textContent = message;

  const main = document.querySelector("main");
  if (main) main.insertBefore(successDiv, main.firstChild);

  setTimeout(() => {
    if (successDiv.parentNode) successDiv.remove();
  }, 5000);
}
