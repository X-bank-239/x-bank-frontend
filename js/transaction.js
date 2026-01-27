// Transactions management
/**
 * TransactionsService: handles accounts and transaction rendering.
 * Methods are non-destructive and try to fail gracefully if DOM elements are missing.
 */
class TransactionsService {
  constructor() {
    this.transactions = [];
  }

  // Load user accounts
  /**
   * Load accounts from API and render them. Returns accounts array or [] on error.
   */
  async loadAccounts() {
    if (!auth.isAuthenticated()) {
      showError("Для просмотра счетов необходимо войти в систему");
      return [];
    }

    try {
      const accounts = await api.getAccounts();
      this.renderAccounts(accounts);
      this.populateAccountSelect(accounts);
      return accounts;
    } catch (error) {
      showError("Ошибка загрузки счетов: " + error.message);
      return [];
    }
  }

  // Render accounts to the UI
  renderAccounts(accounts) {
    const accountsGrid = document.getElementById("accounts-grid");
    if (!accountsGrid) return;

    if (!Array.isArray(accounts) || accounts.length === 0) {
      accountsGrid.innerHTML = "<p>У вас пока нет счетов</p>";
      return;
    }

    accountsGrid.innerHTML = accounts
      .map(
        (account) => `
            <div class="account-card ${account.type}">
                <div class="account-type">${this.getAccountTypeName(
                  account.type
                )}</div>
                <div class="account-balance">${account.balance.toLocaleString(
                  "ru-RU"
                )} ₽</div>
                <div class="account-number">${this.maskAccountNumber(
                  account.number
                )}</div>
            </div>
        `
      )
      .join("");
  }

  // Populate account select for transfers
  populateAccountSelect(accounts) {
    const select = document.getElementById("from-account");
    if (!select) return;

    select.innerHTML =
      '<option value="">Выберите счет</option>' +
      (accounts || [])
        .map(
          (account) => `
                <option value="${account.id}">
                    ${this.getAccountTypeName(
                      account.type
                    )} (${this.maskAccountNumber(
            account.number
          )}) - ${account.balance.toLocaleString("ru-RU")} ₽
                </option>
            `
        )
        .join("");
  }

  // Load recent transactions
  async loadRecentTransactions() {
    if (!auth.isAuthenticated()) {
      showError("Для просмотра истории необходимо войти в систему");
      return;
    }

    try {
      const transactions = await api.getTransactions({ limit: 5 });
      this.transactions = transactions;
      this.renderRecentTransactions(transactions);
    } catch (error) {
      showError("Ошибка загрузки транзакций: " + error.message);
    }
  }

  // Render recent transactions
  renderRecentTransactions(transactions) {
    const container = document.getElementById("recent-transactions");
    if (!container) return;

    if (transactions.length === 0) {
      container.innerHTML = "<p>У вас пока нет транзакций</p>";
      return;
    }

    container.innerHTML = transactions
      .map((transaction) => this.createTransactionElement(transaction, false))
      .join("");
  }

  // Load detailed transaction history with filters
  async loadDetailedHistory() {
    if (!auth.isAuthenticated()) {
      showError("Для просмотра истории необходимо войти в систему");
      return;
    }

    const dateFilter = document.getElementById("date-filter").value;
    const typeFilter = document.getElementById("type-filter").value;

    try {
      const params = {};
      if (dateFilter !== "all") params.period = dateFilter;
      if (typeFilter !== "all") params.type = typeFilter;

      const transactions = await api.getTransactions(params);
      this.renderDetailedTransactions(transactions);
      this.updateStatistics(transactions);
    } catch (error) {
      showError("Ошибка загрузки истории: " + error.message);
    }
  }

  // Render detailed transactions
  renderDetailedTransactions(transactions) {
    const container = document.getElementById("all-transactions");
    if (!container) return;

    if (transactions.length === 0) {
      container.innerHTML = "<p>Нет транзакций за выбранный период</p>";
      return;
    }

    container.innerHTML = transactions
      .map((transaction) => this.createTransactionElement(transaction, true))
      .join("");
  }

  // Create transaction HTML element
  createTransactionElement(transaction, isDetailed) {
    const amountClass = transaction.amount >= 0 ? "income" : "expense";
    const amountSign = transaction.amount >= 0 ? "+" : "-";
    const absoluteAmount = Math.abs(transaction.amount);

    if (isDetailed) {
      return `
                <div class="detailed-transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-icon ${amountClass}">${this.getTransactionIcon(
        transaction
      )}</div>
                        <div class="transaction-details">
                            <h4>${transaction.description} 
                                <span class="transaction-category">${
                                  transaction.category
                                }</span>
                                <span class="transaction-status status-${
                                  transaction.status
                                }">
                                    ${this.getStatusText(transaction.status)}
                                </span>
                            </h4>
                            <p>${new Date(transaction.date).toLocaleDateString(
                              "ru-RU"
                            )} • ${
        transaction.accountNumber
          ? "Карта • " + this.maskAccountNumber(transaction.accountNumber)
          : "Перевод"
      }</p>
                        </div>
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        ${amountSign} ${absoluteAmount.toLocaleString(
        "ru-RU"
      )} ₽
                    </div>
                </div>
            `;
    } else {
      return `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-icon ${amountClass}">${this.getTransactionIcon(
        transaction
      )}</div>
                        <div class="transaction-details">
                            <h4>${transaction.description}</h4>
                            <p>${new Date(transaction.date).toLocaleDateString(
                              "ru-RU"
                            )} • ${
        transaction.accountNumber
          ? "Карта • " + this.maskAccountNumber(transaction.accountNumber)
          : "Перевод"
      }</p>
                        </div>
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        ${amountSign} ${absoluteAmount.toLocaleString(
        "ru-RU"
      )} ₽
                    </div>
                </div>
            `;
    }
  }

  // Update statistics
  updateStatistics(transactions) {
    const income = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const total = income - expense;

    const incomeElement = document.getElementById("total-income");
    const expenseElement = document.getElementById("total-expense");
    const totalElement = document.getElementById("total-balance");

    if (incomeElement)
      incomeElement.textContent = `+ ${income.toLocaleString("ru-RU")} ₽`;
    if (expenseElement)
      expenseElement.textContent = `- ${expense.toLocaleString("ru-RU")} ₽`;
    if (totalElement)
      totalElement.textContent = `${total.toLocaleString("ru-RU")} ₽`;
  }

  // Process money transfer
  async processTransfer(formData) {
    if (!auth.isAuthenticated()) {
      showError("Для выполнения перевода необходимо войти в систему");
      return false;
    }

    try {
      // Validate transfer
      await api.validateTransfer(formData);

      // Create transfer
      const result = await api.createTransfer(formData);

      showSuccess(
        `Перевод на сумму ${formData.amount.toLocaleString(
          "ru-RU"
        )} ₽ выполнен успешно!`
      );

      // Reload data
      this.loadAccounts();
      this.loadRecentTransactions();
      this.loadDetailedHistory();

      return true;
    } catch (error) {
      showError("Ошибка перевода: " + error.message);
      return false;
    }
  }

  // Helper methods
  getAccountTypeName(type) {
    const types = {
      primary: "Основной счет",
      savings: "Накопительный счет",
      investment: "Инвестиционный счет",
    };
    return types[type] || type;
  }

  maskAccountNumber(number) {
    return "•• " + number.slice(-4);
  }

  getTransactionIcon(transaction) {
    const icons = {
      store: "🛒",
      salary: "💼",
      rent: "🏠",
      cafe: "☕",
      transfer: "↔️",
      internet: "🌐",
      mobile: "📱",
      transport: "🚗",
    };
    return icons[transaction.category] || "💳";
  }

  getStatusText(status) {
    const statuses = {
      completed: "Выполнено",
      pending: "Ожидание",
      failed: "Ошибка",
    };
    return statuses[status] || status;
  }
}

// Create global transactions instance
const transactionsService = new TransactionsService();
