const defaultTransactions = [
  {
    id: "t1",
    date: "2026-03-28",
    description: "March salary",
    category: "Salary",
    type: "income",
    amount: 5200,
  },
  {
    id: "t2",
    date: "2026-03-24",
    description: "Rent payment",
    category: "Housing",
    type: "expense",
    amount: 1450,
  },
  {
    id: "t3",
    date: "2026-03-21",
    description: "Groceries",
    category: "Groceries",
    type: "expense",
    amount: 132.4,
  },
  {
    id: "t4",
    date: "2026-03-19",
    description: "Freelance app",
    category: "Freelance",
    type: "income",
    amount: 860,
  },
  {
    id: "t5",
    date: "2026-03-14",
    description: "Health insurance",
    category: "Health",
    type: "expense",
    amount: 240,
  },
  {
    id: "t6",
    date: "2026-02-26",
    description: "Utilities",
    category: "Utilities",
    type: "expense",
    amount: 180,
  },
  {
    id: "t7",
    date: "2026-02-20",
    description: "Investment dividend",
    category: "Investments",
    type: "income",
    amount: 210,
  },
  {
    id: "t8",
    date: "2026-02-18",
    description: "Dining out",
    category: "Dining",
    type: "expense",
    amount: 96.7,
  },
  {
    id: "t9",
    date: "2026-02-12",
    description: "Metro pass",
    category: "Transport",
    type: "expense",
    amount: 78,
  },
  {
    id: "t10",
    date: "2026-01-30",
    description: "Subscription renewals",
    category: "Subscriptions",
    type: "expense",
    amount: 64.5,
  },
  {
    id: "t11",
    date: "2026-01-25",
    description: "January salary",
    category: "Salary",
    type: "income",
    amount: 5100,
  },
  {
    id: "t12",
    date: "2026-01-10",
    description: "Weekend trip",
    category: "Travel",
    type: "expense",
    amount: 420,
  },
];

const storageKey = "finance_dashboard_transactions";
const themeKey = "finance_dashboard_theme";

const state = {
  role: "viewer",
  transactions: loadTransactions(),
  filters: {
    search: "",
    type: "all",
    category: "all",
    sort: "date_desc",
  },
  editingId: null,
};

const elements = {
  roleSelect: document.getElementById("roleSelect"),
  themeToggle: document.getElementById("themeToggle"),
  balanceCard: document.getElementById("balanceCard"),
  incomeCard: document.getElementById("incomeCard"),
  expenseCard: document.getElementById("expenseCard"),
  savingsCard: document.getElementById("savingsCard"),
  trendChart: document.getElementById("trendChart"),
  categoryChart: document.getElementById("categoryChart"),
  categoryLegend: document.getElementById("categoryLegend"),
  searchInput: document.getElementById("searchInput"),
  typeFilter: document.getElementById("typeFilter"),
  categoryFilter: document.getElementById("categoryFilter"),
  sortSelect: document.getElementById("sortSelect"),
  resetFilters: document.getElementById("resetFilters"),
  transactionsList: document.getElementById("transactionsList"),
  transactionForm: document.getElementById("transactionForm"),
  insightsGrid: document.getElementById("insightsGrid"),
  adminHint: document.getElementById("adminHint"),
};

const categoryPalette = [
  "#ef6c42",
  "#2a6f6a",
  "#f2b64a",
  "#8a6cff",
  "#2f8ac7",
  "#d65f5f",
  "#5f8d4e",
];

initialize();

function initialize() {
  hydrateTheme();
  bindEvents();
  render();
}

function bindEvents() {
  elements.roleSelect.addEventListener("change", (event) => {
    state.role = event.target.value;
    state.editingId = null;
    render();
  });

  elements.themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(currentTheme);
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim();
    render();
  });

  elements.typeFilter.addEventListener("change", (event) => {
    state.filters.type = event.target.value;
    render();
  });

  elements.categoryFilter.addEventListener("change", (event) => {
    state.filters.category = event.target.value;
    render();
  });

  elements.sortSelect.addEventListener("change", (event) => {
    state.filters.sort = event.target.value;
    render();
  });

  elements.resetFilters.addEventListener("click", () => {
    state.filters = {
      search: "",
      type: "all",
      category: "all",
      sort: "date_desc",
    };
    elements.searchInput.value = "";
    elements.typeFilter.value = "all";
    elements.categoryFilter.value = "all";
    elements.sortSelect.value = "date_desc";
    render();
  });
}

function loadTransactions() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return defaultTransactions;
  }
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : defaultTransactions;
  } catch (error) {
    return defaultTransactions;
  }
}

function persistTransactions() {
  localStorage.setItem(storageKey, JSON.stringify(state.transactions));
}

function hydrateTheme() {
  const saved = localStorage.getItem(themeKey) || "light";
  applyTheme(saved);
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.dataset.theme = "dark";
  } else {
    delete document.body.dataset.theme;
  }
  localStorage.setItem(themeKey, theme);
}

function render() {
  const summary = computeSummary(state.transactions);
  renderSummary(summary);
  renderCharts(summary);
  renderFilters();
  renderTransactions();
  renderInsights(summary);
  renderAdminHint();
}

function renderSummary(summary) {
  elements.balanceCard.innerHTML = summaryCard("Total Balance", summary.balance, "+3.2% vs last month");
  elements.incomeCard.innerHTML = summaryCard("Total Income", summary.income, "+8.6% vs last month");
  elements.expenseCard.innerHTML = summaryCard("Total Expenses", summary.expenses, "-4.1% vs last month");
  elements.savingsCard.innerHTML = summaryCard(
    "Savings Rate",
    `${summary.savingsRate.toFixed(1)}%`,
    "Based on income",
    true
  );
}

function summaryCard(label, value, trend, rawValue = false) {
  return `
    <div class="label">${label}</div>
    <div class="value">${rawValue ? value : formatCurrency(value)}</div>
    <div class="trend">${trend}</div>
  `;
}

function renderCharts(summary) {
  renderTrendChart(summary.trend);
  renderCategoryChart(summary.categoryTotals);
}

function renderTrendChart(trendData) {
  const svg = elements.trendChart;
  svg.innerHTML = "";
  if (!trendData.length) {
    svg.innerHTML = emptyChartMessage("No data for trend");
    return;
  }

  const width = 300;
  const height = 140;
  const padding = 20;
  const values = trendData.map((point) => point.balance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = trendData
    .map((point, index) => {
      const x = padding + (index * (width - padding * 2)) / (trendData.length - 1 || 1);
      const y = height - padding - ((point.balance - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const gradientId = "trendGradient";
  svg.innerHTML = `
    <defs>
      <linearGradient id="${gradientId}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#ef6c42" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#ef6c42" stop-opacity="0" />
      </linearGradient>
    </defs>
    <polyline
      fill="none"
      stroke="#ef6c42"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
      points="${points}"
    />
    <polygon
      fill="url(#${gradientId})"
      points="${points} ${width - padding},${height - padding} ${padding},${height - padding}"
    />
  `;
}

function renderCategoryChart(categoryTotals) {
  const svg = elements.categoryChart;
  const legend = elements.categoryLegend;
  svg.innerHTML = "";
  legend.innerHTML = "";

  if (!categoryTotals.length) {
    svg.innerHTML = emptyChartMessage("No expenses yet");
    return;
  }

  const total = categoryTotals.reduce((sum, item) => sum + item.amount, 0);
  const center = 110;
  const radius = 90;
  let startAngle = -90;

  categoryTotals.forEach((item, index) => {
    const sliceAngle = (item.amount / total) * 360;
    const endAngle = startAngle + sliceAngle;
    const path = describeArc(center, center, radius, startAngle, endAngle);
    const color = categoryPalette[index % categoryPalette.length];
    svg.innerHTML += `<path d="${path}" fill="${color}"></path>`;

    const percent = ((item.amount / total) * 100).toFixed(1);
    legend.innerHTML += `
      <li>
        <span><span class="dot" style="background:${color}"></span>${item.category}</span>
        <strong>${percent}%</strong>
      </li>
    `;

    startAngle = endAngle;
  });

  svg.innerHTML += `
    <circle cx="${center}" cy="${center}" r="55" fill="var(--card)"></circle>
    <text x="${center}" y="${center}" text-anchor="middle" dominant-baseline="middle" fill="var(--text)" font-size="16" font-family="Space Grotesk">${formatCurrency(total)}</text>
  `;
}

function renderFilters() {
  const categories = getCategories(state.transactions, true);
  const current = elements.categoryFilter.value || "all";
  elements.categoryFilter.innerHTML = `<option value="all">All categories</option>`;
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.categoryFilter.appendChild(option);
  });
  elements.categoryFilter.value = current;
}

function renderTransactions() {
  const filtered = getFilteredTransactions();
  elements.transactionsList.innerHTML = "";
  renderTransactionForm();

  if (!filtered.length) {
    elements.transactionsList.innerHTML = `
      <div class="panel fade-in">
        <h3>No transactions found</h3>
        <p class="muted">Try adjusting filters or add a new transaction.</p>
      </div>
    `;
    return;
  }

  filtered.forEach((tx) => {
    const item = document.createElement("div");
    item.className = "transaction-item fade-in";
    item.innerHTML = `
      <div class="desc">
        <strong>${tx.description}</strong>
        <div class="muted">${tx.category}</div>
      </div>
      <div class="amount">${formatCurrency(tx.amount)}</div>
      <div class="type ${tx.type}">${tx.type}</div>
      <div class="meta muted">${formatDate(tx.date)}</div>
      <div class="actions"></div>
    `;

    const actions = item.querySelector(".actions");
    if (state.role === "admin") {
      actions.classList.add("transaction-actions");
      actions.innerHTML = `
        <button class="action-btn" data-action="edit" data-id="${tx.id}">Edit</button>
        <button class="action-btn" data-action="delete" data-id="${tx.id}">Delete</button>
      `;
    }

    elements.transactionsList.appendChild(item);
  });

  if (state.role === "admin") {
    elements.transactionsList.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", handleTransactionAction);
    });
  }
}

function renderTransactionForm() {
  if (state.role !== "admin") {
    elements.transactionForm.hidden = true;
    return;
  }

  const editing = state.transactions.find((tx) => tx.id === state.editingId);
  const isEditing = Boolean(editing);
  const categories = getCategories(state.transactions, true);

  elements.transactionForm.hidden = false;
  elements.transactionForm.innerHTML = `
    <div class="panel-header">
      <h2>${isEditing ? "Edit Transaction" : "Add Transaction"}</h2>
      <span class="panel-sub">Admin mode</span>
    </div>
    <form id="txForm">
      <div class="form-grid">
        <input type="date" name="date" value="${isEditing ? editing.date : ""}" required />
        <input type="text" name="description" placeholder="Description" value="${isEditing ? editing.description : ""}" required />
        <input type="number" name="amount" step="0.01" min="0" placeholder="Amount" value="${isEditing ? editing.amount : ""}" required />
        <select name="type" required>
          <option value="income" ${isEditing && editing.type === "income" ? "selected" : ""}>Income</option>
          <option value="expense" ${isEditing && editing.type === "expense" ? "selected" : ""}>Expense</option>
        </select>
        <input list="categoryList" name="category" placeholder="Category" value="${isEditing ? editing.category : ""}" required />
        <datalist id="categoryList">
          ${categories.map((category) => `<option value="${category}"></option>`).join("")}
        </datalist>
      </div>
      <div class="form-actions">
        <button class="primary-btn" type="submit">${isEditing ? "Save" : "Add"}</button>
        ${
          isEditing
            ? `<button class="ghost-btn" type="button" id="cancelEdit">Cancel</button>`
            : ""
        }
      </div>
    </form>
  `;

  const form = document.getElementById("txForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const payload = {
      date: data.get("date"),
      description: data.get("description"),
      category: data.get("category"),
      type: data.get("type"),
      amount: Number.parseFloat(data.get("amount")),
    };

    if (!payload.date || !payload.description || !payload.category || !payload.amount) {
      return;
    }

    if (isEditing) {
      updateTransaction(state.editingId, payload);
    } else {
      addTransaction(payload);
    }
  });

  const cancelButton = document.getElementById("cancelEdit");
  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      state.editingId = null;
      render();
    });
  }
}

function renderInsights(summary) {
  const insights = buildInsights(summary);
  elements.insightsGrid.innerHTML = "";

  insights.forEach((insight) => {
    const card = document.createElement("div");
    card.className = "insight-card fade-in";
    card.innerHTML = `
      <h3>${insight.title}</h3>
      <p class="muted">${insight.detail}</p>
    `;
    elements.insightsGrid.appendChild(card);
  });
}

function renderAdminHint() {
  elements.adminHint.textContent =
    state.role === "admin" ? "Admin: you can add, edit, and delete transactions." : "Viewer: read-only mode.";
}

function handleTransactionAction(event) {
  const id = event.target.dataset.id;
  const action = event.target.dataset.action;
  if (!id || !action) return;

  if (action === "edit") {
    state.editingId = id;
    render();
  }

  if (action === "delete") {
    state.transactions = state.transactions.filter((tx) => tx.id !== id);
    persistTransactions();
    render();
  }
}

function addTransaction(payload) {
  const newTx = {
    id: `t${Date.now()}`,
    ...payload,
  };
  state.transactions = [newTx, ...state.transactions];
  persistTransactions();
  render();
}

function updateTransaction(id, payload) {
  state.transactions = state.transactions.map((tx) =>
    tx.id === id
      ? {
          ...tx,
          ...payload,
        }
      : tx
  );
  state.editingId = null;
  persistTransactions();
  render();
}

function computeSummary(transactions) {
  const income = transactions.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = transactions.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0);
  const balance = income - expenses;
  const savingsRate = income ? ((income - expenses) / income) * 100 : 0;

  const trend = buildMonthlyTrend(transactions);
  const categoryTotals = buildCategoryTotals(transactions);

  return {
    income,
    expenses,
    balance,
    savingsRate,
    trend,
    categoryTotals,
  };
}

function buildMonthlyTrend(transactions) {
  const grouped = {};
  transactions.forEach((tx) => {
    const monthKey = tx.date.slice(0, 7);
    if (!grouped[monthKey]) {
      grouped[monthKey] = { income: 0, expenses: 0 };
    }
    if (tx.type === "income") {
      grouped[monthKey].income += tx.amount;
    } else {
      grouped[monthKey].expenses += tx.amount;
    }
  });

  const months = Object.keys(grouped).sort();
  let running = 0;
  return months.slice(-6).map((month) => {
    running += grouped[month].income - grouped[month].expenses;
    return {
      month,
      balance: running,
    };
  });
}

function buildCategoryTotals(transactions) {
  const totals = {};
  transactions
    .filter((tx) => tx.type === "expense")
    .forEach((tx) => {
      totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
    });

  return Object.entries(totals)
    .map(([category, amount]) => ({
      category,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function buildInsights(summary) {
  const highestCategory = summary.categoryTotals[0];
  const lastMonth = summary.trend[summary.trend.length - 1];
  const prevMonth = summary.trend[summary.trend.length - 2];
  const change = lastMonth && prevMonth ? lastMonth.balance - prevMonth.balance : 0;

  return [
    {
      title: highestCategory ? "Top Spend" : "Top Spend",
      detail: highestCategory
        ? `${highestCategory.category} leads with ${formatCurrency(highestCategory.amount)} spent.`
        : "Add expenses to see your highest category.",
    },
    {
      title: "Month-over-Month",
      detail: lastMonth
        ? `Balance change of ${formatCurrency(change)} compared to the previous month.`
        : "Add more monthly data to compare trends.",
    },
    {
      title: "Income vs Expenses",
      detail: summary.income
        ? `${Math.round((summary.expenses / summary.income) * 100)}% of income went to expenses.`
        : "Record income to calculate your spending ratio.",
    },
  ];
}

function getFilteredTransactions() {
  const { search, type, category, sort } = state.filters;
  let filtered = [...state.transactions];

  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(
      (tx) =>
        tx.description.toLowerCase().includes(query) || tx.category.toLowerCase().includes(query)
    );
  }

  if (type !== "all") {
    filtered = filtered.filter((tx) => tx.type === type);
  }

  if (category !== "all") {
    filtered = filtered.filter((tx) => tx.category === category);
  }

  filtered.sort((a, b) => {
    if (sort === "date_desc") return b.date.localeCompare(a.date);
    if (sort === "date_asc") return a.date.localeCompare(b.date);
    if (sort === "amount_desc") return b.amount - a.amount;
    if (sort === "amount_asc") return a.amount - b.amount;
    return 0;
  });

  return filtered;
}

function getCategories(transactions, includeIncome = false) {
  const set = new Set();
  transactions.forEach((tx) => {
    if (includeIncome || tx.type === "expense") {
      set.add(tx.category);
    }
  });
  return Array.from(set).sort();
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function emptyChartMessage(message) {
  return `<text x="50%" y="50%" text-anchor="middle" fill="var(--muted)">${message}</text>`;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "L",
    x,
    y,
    "Z",
  ].join(" ");
}
