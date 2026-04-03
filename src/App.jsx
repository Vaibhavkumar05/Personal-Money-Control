import { useMemo, useState, useEffect } from "react";

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

const categoryPalette = [
  "#ef6c42",
  "#2a6f6a",
  "#f2b64a",
  "#8a6cff",
  "#2f8ac7",
  "#d65f5f",
  "#5f8d4e",
];

const defaultFilters = {
  search: "",
  type: "all",
  category: "all",
  sort: "date_desc",
};

function App() {
  const [role, setRole] = useState("viewer");
  const [transactions, setTransactions] = useState(loadTransactions());
  const [filters, setFilters] = useState(defaultFilters);
  const [editingId, setEditingId] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    const savedTheme = localStorage.getItem(themeKey) || "light";
    applyTheme(savedTheme);
  }, []);

  const summaryData = useMemo(() => computeSummary(transactions), [transactions]);
  const allCategories = useMemo(() => getCategories(transactions, true), [transactions]);

  const visibleTransactions = useMemo(() => {
    return applyFilters(transactions, filters);
  }, [transactions, filters]);

  const currentEdit = transactions.find((tx) => tx.id === editingId) || null;

  function resetFilters() {
    setFilters(defaultFilters);
  }

  function submitTransaction(event) {
    event.preventDefault();
    const data = new FormData(event.target);
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

    if (currentEdit) {
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === currentEdit.id ? { ...tx, ...payload } : tx))
      );
      setEditingId(null);
    } else {
      setTransactions((prev) => [
        {
          id: `t${Date.now()}`,
          ...payload,
        },
        ...prev,
      ]);
    }

    event.target.reset();
  }

  function deleteTransaction(id) {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }

  function startEdit(id) {
    setEditingId(id);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function changeRole(event) {
    setRole(event.target.value);
    setEditingId(null);
  }

  function showTooltip(payload) {
    setTooltip(payload);
  }

  function hideTooltip() {
    setTooltip(null);
  }

  return (
    <div>
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      <header className="topbar">
        <div>
          <p className="eyebrow">Finance Overview</p>
          <h1>Personal Money Control</h1>
        </div>
        <div className="topbar-actions">
          <div className="role-switch">
            <label htmlFor="roleSelect">Role</label>
            <select id="roleSelect" value={role} onChange={changeRole}>
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            id="themeToggle"
            className="ghost-btn"
            type="button"
            onClick={toggleTheme}
          >
            Toggle Theme
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="summary" aria-label="Summary">
          <SummaryCard
            label="Total Balance"
            value={summaryData.balance}
            trend={"+3.2% vs last month"}
          />
          <SummaryCard label="Total Income" value={summaryData.income} trend={"+8.6% vs last month"} />
          <SummaryCard label="Total Expenses" value={summaryData.expenses} trend={"-4.1% vs last month"} />
          <SummaryCard
            label="Savings Rate"
            value={`${summaryData.savingsRate.toFixed(1)}%`}
            trend="Based on income"
            rawValue
          />
        </section>

        <section className="charts" aria-label="Charts">
          <div className="panel">
            <div className="panel-header">
              <h2>Balance Trend</h2>
              <span className="panel-sub">Last 6 months</span>
            </div>
            <div className="chart-area">
              <TrendChart data={summaryData.trend} onShow={showTooltip} onHide={hideTooltip} />
            </div>
          </div>
          <div className="panel">
            <div className="panel-header">
              <h2>Spending Breakdown</h2>
              <span className="panel-sub">Expenses by category</span>
            </div>
            <div className="chart-area split">
              <CategoryChart
                data={summaryData.categoryTotals}
                onShow={showTooltip}
                onHide={hideTooltip}
              />
              <CategoryLegend data={summaryData.categoryTotals} />
            </div>
          </div>
        </section>

        <section className="transactions" aria-label="Transactions">
          <div className="section-header">
            <div>
              <h2>Transactions</h2>
              <p className="muted">Track, filter, and review recent activity.</p>
            </div>
            <div className="admin-hint">
              {role === "admin"
                ? "Admin: you can add, edit, and delete transactions."
                : "Viewer: read-only mode."}
            </div>
          </div>

          <div className="filters">
            <input
              type="search"
              placeholder="Search description or category"
              value={filters.search}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, search: event.target.value.trim() }))
              }
            />
            <select
              value={filters.type}
              onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
            >
              <option value="all">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              value={filters.category}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, category: event.target.value }))
              }
            >
              <option value="all">All categories</option>
              {allCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={filters.sort}
              onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value }))}
            >
              <option value="date_desc">Newest first</option>
              <option value="date_asc">Oldest first</option>
              <option value="amount_desc">Highest amount</option>
              <option value="amount_asc">Lowest amount</option>
            </select>
            <button className="ghost-btn" type="button" onClick={resetFilters}>
              Reset
            </button>
          </div>

          {role === "admin" && (
            <div className="panel form-panel">
              <div className="panel-header">
                <h2>{currentEdit ? "Edit Transaction" : "Add Transaction"}</h2>
                <span className="panel-sub">Admin mode</span>
              </div>
              <form onSubmit={submitTransaction} key={currentEdit?.id || "new"}>
                <div className="form-grid">
                  <input type="date" name="date" defaultValue={currentEdit?.date || ""} required />
                  <input
                    type="text"
                    name="description"
                    placeholder="Description"
                    defaultValue={currentEdit?.description || ""}
                    required
                  />
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    min="0"
                    placeholder="Amount"
                    defaultValue={currentEdit?.amount || ""}
                    required
                  />
                  <select name="type" defaultValue={currentEdit?.type || "income"} required>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                  <input
                    list="categoryList"
                    name="category"
                    placeholder="Category"
                    defaultValue={currentEdit?.category || ""}
                    required
                  />
                  <datalist id="categoryList">
                    {allCategories.map((category) => (
                      <option key={category} value={category}></option>
                    ))}
                  </datalist>
                </div>
                <div className="form-actions">
                  <button className="primary-btn" type="submit">
                    {currentEdit ? "Save" : "Add"}
                  </button>
                  {currentEdit && (
                    <button className="ghost-btn" type="button" onClick={cancelEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          <div className="transaction-list">
            {visibleTransactions.length === 0 ? (
              <div className="panel fade-in">
                <h3>No transactions found</h3>
                <p className="muted">Try adjusting filters or add a new transaction.</p>
              </div>
            ) : (
              visibleTransactions.map((tx) => (
                <div key={tx.id} className="transaction-item fade-in">
                  <div className="desc">
                    <strong>
                      {tx.description}
                      <span className="muted"> · {tx.category}</span>
                    </strong>
                  </div>
                  <div className="amount">{formatCurrency(tx.amount)}</div>
                  <div className={`type ${tx.type}`}>{tx.type}</div>
                  <div className="meta muted">{formatDate(tx.date)}</div>
                  <div className="actions">
                    {role === "admin" && (
                      <div className="transaction-actions">
                        <button className="action-btn" type="button" onClick={() => startEdit(tx.id)}>
                          Edit
                        </button>
                        <button
                          className="action-btn"
                          type="button"
                          onClick={() => deleteTransaction(tx.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="insights" aria-label="Insights">
          <div className="section-header">
            <div>
              <h2>Insights</h2>
              <p className="muted">Quick observations from your data.</p>
            </div>
          </div>
          <div className="insights-grid">
            {buildInsights(summaryData).map((insight) => (
              <div key={insight.title} className="insight-card fade-in">
                <h3>{insight.title}</h3>
                <p className="muted">{insight.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Sample data stored locally in your browser.</p>
      </footer>

      {tooltip && (
        <div className="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <strong>{tooltip.title}</strong>
          <span>{tooltip.value}</span>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, trend, rawValue = false }) {
  return (
    <div className="summary-card">
      <div className="label">{label}</div>
      <div className="value">{rawValue ? value : formatCurrency(value)}</div>
      <div className="trend">{trend}</div>
    </div>
  );
}

function TrendChart({ data, onShow, onHide }) {
  if (!data.length) {
    return (
      <svg id="trendChart" viewBox="0 0 300 140" role="img">
        <text x="50%" y="50%" textAnchor="middle" fill="var(--muted)">
          No data for trend
        </text>
      </svg>
    );
  }

  const width = 300;
  const height = 140;
  const padding = 20;
  const values = data.map((point) => point.balance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coordinates = data.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / (data.length - 1 || 1);
    const y = height - padding - ((point.balance - min) / range) * (height - padding * 2);
    return { x, y, ...point };
  });

  const points = coordinates.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <svg id="trendChart" viewBox="0 0 300 140" role="img">
      <defs>
        <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ef6c42" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ef6c42" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="#ef6c42"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <polygon
        fill="url(#trendGradient)"
        points={`${points} ${width - padding},${height - padding} ${padding},${height - padding}`}
      />
      {coordinates.map((point) => (
        <circle
          key={point.month}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="#ef6c42"
          onMouseEnter={(event) =>
            onShow({
              x: event.clientX + 12,
              y: event.clientY + 12,
              title: point.month,
              value: formatCurrency(point.balance),
            })
          }
          onMouseMove={(event) =>
            onShow({
              x: event.clientX + 12,
              y: event.clientY + 12,
              title: point.month,
              value: formatCurrency(point.balance),
            })
          }
          onMouseLeave={onHide}
        />
      ))}
    </svg>
  );
}

function CategoryChart({ data, onShow, onHide }) {
  if (!data.length) {
    return (
      <svg id="categoryChart" viewBox="0 0 220 220" role="img">
        <text x="50%" y="50%" textAnchor="middle" fill="var(--muted)">
          No expenses yet
        </text>
      </svg>
    );
  }

  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const center = 110;
  const radius = 90;
  let startAngle = -90;

  const slices = data.map((item, index) => {
    const sliceAngle = (item.amount / total) * 360;
    const endAngle = startAngle + sliceAngle;
    const path = describeArc(center, center, radius, startAngle, endAngle);
    const color = categoryPalette[index % categoryPalette.length];
    const output = { path, color, ...item };
    startAngle = endAngle;
    return output;
  });

  return (
    <svg id="categoryChart" viewBox="0 0 220 220" role="img">
      {slices.map((slice) => (
        <path
          key={slice.category}
          d={slice.path}
          fill={slice.color}
          onMouseEnter={(event) =>
            onShow({
              x: event.clientX + 12,
              y: event.clientY + 12,
              title: slice.category,
              value: formatCurrency(slice.amount),
            })
          }
          onMouseMove={(event) =>
            onShow({
              x: event.clientX + 12,
              y: event.clientY + 12,
              title: slice.category,
              value: formatCurrency(slice.amount),
            })
          }
          onMouseLeave={onHide}
        ></path>
      ))}
      <circle cx={center} cy={center} r={55} fill="var(--card)"></circle>
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--text)"
        fontSize="16"
        fontFamily="Space Grotesk"
      >
        {formatCurrency(total)}
      </text>
    </svg>
  );
}

function CategoryLegend({ data }) {
  if (!data.length) {
    return null;
  }

  const total = data.reduce((sum, item) => sum + item.amount, 0);
  return (
    <ul className="legend">
      {data.map((item, index) => {
        const percent = ((item.amount / total) * 100).toFixed(1);
        const color = categoryPalette[index % categoryPalette.length];
        return (
          <li key={item.category}>
            <span>
              <span className="dot" style={{ background: color }}></span>
              {item.category}
            </span>
            <strong>{percent}%</strong>
          </li>
        );
      })}
    </ul>
  );
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

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.dataset.theme = "dark";
  } else {
    delete document.body.dataset.theme;
  }
  localStorage.setItem(themeKey, theme);
}

function toggleTheme() {
  const currentTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(currentTheme);
}

function computeSummary(transactions) {
  const income = transactions.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
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
      title: "Top Spend",
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

function applyFilters(transactions, filters) {
  const { search, type, category, sort } = filters;
  let filtered = [...transactions];

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
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
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

export default App;
