import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import cashlyLogo from "../assets/cashly-img-removebg-preview.png";

import "../styles/Dashboard.css";
import "../styles/Transactions.css";
import AppSidebar from "../components/AppSidebar";
import UserProfile from "../components/UserProfile";
import {
    createTransaction,
    deleteTransaction as deleteTransactionRequest,
    fetchTransactions,
    updateTransaction,
} from "../services/transactions";
const currencyOptions = {
    EGP: { label: "Egyptian Pound", symbol: "EGP", rate: 1 },
    USD: { label: "US Dollar", symbol: "$", rate: 0.0203 },
    EUR: { label: "Euro", symbol: "€", rate: 0.0175 },
    GBP: { label: "British Pound", symbol: "£", rate: 0.0152 },
    SAR: { label: "Saudi Riyal", symbol: "SAR", rate: 0.0761 },
    AED: { label: "UAE Dirham", symbol: "AED", rate: 0.0746 },
};

const categories = [
    "Groceries",
    "Dining & Coffee",
    "Transportation",
    "Fashion",
    "Beauty & Personal Care",
    "Fuel & Car",
    "Bills & Utilities",
    "Entertainment",
    "Healthcare",
    "Education",
    "Transfers",
    "Subscriptions",
    "Other",
];

const paymentMethods = [
    "Cash",
    "Debit Card",
    "Credit Card",
    "InstaPay",
    "Mobile Wallet",
    "Bank Transfer",
];

// Keyword-based auto-categorizer. Checked in order, first match wins — no
// LLM call, just plain substring matching against the typed description.
const CATEGORY_KEYWORDS = [
    { category: "Groceries", keywords: ["grocery", "groceries", "spinneys", "carrefour", "seoudi", "gourmet", "kazyon", "hyperone", "supermarket", "market"] },
    { category: "Dining & Coffee", keywords: ["coffee", "cafe", "café", "restaurant", "starbucks", "costa", "dunkin", "mcdonald", "kfc", "burger", "pizza", "dining", "lunch", "dinner", "breakfast", "talabat", "uber eats", "ubereats", "shawarma", "koshary"] },
    { category: "Transportation", keywords: ["uber", "careem", "indrive", "taxi", "ride", "bus fare", "train ticket", "metro ticket", "parking"] },
    { category: "Fuel & Car", keywords: ["shell", "totalenergies", "total energies", "chillout", "fuel", "petrol", "gas station", "car service", "car wash", "tire", "oil change"] },
    { category: "Fashion", keywords: ["zara", "h&m", "bershka", "pull&bear", "pull & bear", "clothes", "clothing", "shoes", "fashion", "mall", "outfit"] },
    { category: "Beauty & Personal Care", keywords: ["sephora", "faces", "mazaya", "salon", "spa", "cosmetics", "skincare", "haircut", "barber", "makeup", "perfume"] },
    { category: "Bills & Utilities", keywords: ["electricity", "water bill", "internet bill", "wifi bill", "phone bill", "utility", "utilities", "rent", "landline"] },
    { category: "Entertainment", keywords: ["netflix", "cinema", "movie", "concert", "spotify", "game", "playstation", "xbox", "entertainment", "theatre", "theater"] },
    { category: "Healthcare", keywords: ["pharmacy", "doctor", "hospital", "clinic", "dental", "dentist", "medicine", "prescription", "health"] },
    { category: "Education", keywords: ["course", "tuition", "school", "university", "udemy", "coursera", "textbook"] },
    { category: "Transfers", keywords: ["transfer", "instapay", "send money", "remit"] },
    { category: "Subscriptions", keywords: ["subscription", "membership", "icloud", "prime"] },
];

function categorizeDescription(description) {
    const text = description.trim().toLowerCase();

    if (!text) return null;

    const match = CATEGORY_KEYWORDS.find(({ keywords }) =>
        keywords.some((keyword) => text.includes(keyword))
    );

    return match ? match.category : null;
}

function createEmptyForm() {
    const now = new Date();

    return {
        description: "",
        category: "Other",
        date: now.toISOString().slice(0, 10),
        time: now.toTimeString().slice(0, 5),
        paymentMethod: "Debit Card",
        status: "Completed",
        currency: "EGP",
        exchangeRateToEGP: 1,
        rateUpdatedAt: "",
        price: "",
        fees: "",
        discount: "",
    };
}

function getTransactionTotal(transaction) {
    // Persisted transactions include `amount`, the EGP total calculated at
    // save time. Use it for history rather than reinterpreting the price
    // (which may have been entered in USD or another currency).
    if (Number.isFinite(Number(transaction.amount))) {
        return Number(transaction.amount);
    }

    const originalTotal = (
        Number(transaction.price || 0) +
        Number(transaction.fees || 0) -
        Number(transaction.discount || 0)
    );

    return originalTotal * Number(transaction.exchangeRateToEGP || 1);
}

function getOriginalTransactionTotal(transaction) {
    const rate = Number(transaction.exchangeRateToEGP || 1);
    return getTransactionTotal(transaction) / rate;
}

function Transactions() {
  const [transactions, setTransactions] = useState([]);
const [isLoadingTransactions, setIsLoadingTransactions] =
    useState(true);
const [transactionError, setTransactionError] = useState("");

    // Temporary compatibility state for the hidden legacy header selector.
    // Currency selection now belongs to each individual transaction form.
    const [currency, setCurrency] = useState("EGP");

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState(createEmptyForm);
    const [isCategoryAutoAssigned, setIsCategoryAutoAssigned] = useState(true);
    const [rateStatus, setRateStatus] = useState("idle");
    const [rateError, setRateError] = useState("");
    const [selectedTransaction, setSelectedTransaction] =
        useState(null);
    const [editingTransactionId, setEditingTransactionId] =
        useState(null);

    const [searchText, setSearchText] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("All");
    const [minimumPrice, setMinimumPrice] = useState("");
    const [maximumPrice, setMaximumPrice] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [showMoreFilters, setShowMoreFilters] = useState(false);

    const userName =
        localStorage.getItem("cashlyUserName") || "Cashly User";
    const firstLetter = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const controller = new AbortController();

    async function loadTransactions() {
        setIsLoadingTransactions(true);
        setTransactionError("");

        try {
            const savedTransactions =
                await fetchTransactions(
                    controller.signal
                );

            setTransactions(savedTransactions);
        } catch (error) {
            if (error.name !== "AbortError") {
                setTransactionError(error.message);
            }
        } finally {
            if (!controller.signal.aborted) {
                setIsLoadingTransactions(false);
            }
        }
    }

    loadTransactions();

    return () => {
        controller.abort();
    };
}, []);

    function formatMoney(amount, currencyCode = "EGP") {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currencyCode,
            maximumFractionDigits: currencyCode === "EGP" ? 0 : 2,
        }).format(Number(amount || 0));
    }

    useEffect(() => {
        if (!isFormOpen) return;
        if (formData.currency === "EGP") {
            setFormData((current) => ({ ...current, exchangeRateToEGP: 1, rateUpdatedAt: new Date().toISOString() }));
            setRateStatus("ready");
            setRateError("");
            return;
        }

        const controller = new AbortController();
        setRateStatus("loading");
        setRateError("");
        fetch(`https://open.er-api.com/v6/latest/${formData.currency}`, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) throw new Error("Rate service unavailable");
                return response.json();
            })
            .then((data) => {
                const rate = Number(data?.rates?.EGP);
                if (data?.result !== "success" || !Number.isFinite(rate) || rate <= 0) throw new Error("Invalid rate");
                setFormData((current) => ({ ...current, exchangeRateToEGP: rate, rateUpdatedAt: data.time_last_update_utc || new Date().toISOString() }));
                setRateStatus("ready");
            })
            .catch((error) => {
                if (error.name === "AbortError") return;
                setRateStatus("error");
                setRateError("Current exchange rate could not be loaded. Try again before saving.");
            });
        return () => controller.abort();
    }, [formData.currency, isFormOpen]);

    function updateFormField(event) {
        const { name, value } = event.target;

        setFormData((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    function updateDescription(event) {
        const description = event.target.value;

        setFormData((currentForm) => {
            const suggestedCategory = isCategoryAutoAssigned
                ? categorizeDescription(description)
                : null;

            return {
                ...currentForm,
                description,
                category: suggestedCategory || currentForm.category,
            };
        });
    }

    function updateCategory(event) {
        setIsCategoryAutoAssigned(false);
        updateFormField(event);
    }

    function openAddForm() {
        setFormData(createEmptyForm());
        setIsCategoryAutoAssigned(true);
        setEditingTransactionId(null);
        setIsFormOpen(true);
    }

    function closeAddForm() {
        setIsFormOpen(false);
        setFormData(createEmptyForm());
        setIsCategoryAutoAssigned(true);
        setEditingTransactionId(null);
    }

    function openEditForm(transaction) {
        const { amount, ...transactionForm } = transaction;
        setFormData({
            ...transactionForm,
            price: Number(transaction.price),
        });
        setIsCategoryAutoAssigned(false);
        setEditingTransactionId(transaction.id);
        setSelectedTransaction(null);
        setIsFormOpen(true);
    }

    async function submitTransaction(event) {
        event.preventDefault();

        if (formData.currency !== "EGP" && rateStatus !== "ready") {
            setRateError("A current exchange rate is required before this transaction can be saved.");
            return;
        }

        if (formData.description.trim() === "" || !(Number(formData.price) > 0)) {
            return;
        }

        const newTransaction = {
            ...formData,
            id: Date.now(),
            price: Number(formData.price),
            fees: Number(formData.fees || 0),
            discount: Number(formData.discount || 0),
        };

        try {
            setTransactionError("");
            const savedTransaction = editingTransactionId
                ? await updateTransaction(
                    editingTransactionId,
                    newTransaction,
                    getTransactionTotal(newTransaction)
                )
                : await createTransaction(
                    newTransaction,
                    getTransactionTotal(newTransaction)
                );

            setTransactions((currentTransactions) =>
                editingTransactionId
                    ? currentTransactions.map((transaction) =>
                        transaction.id === editingTransactionId
                            ? savedTransaction
                            : transaction
                    )
                    : [savedTransaction, ...currentTransactions]
            );
            closeAddForm();
        } catch (error) {
            setTransactionError(error.message);
        }
    }

    async function deleteTransaction(transactionId) {
        try {
            setTransactionError("");
            await deleteTransactionRequest(transactionId);
            setTransactions((currentTransactions) =>
                currentTransactions.filter(
                    (transaction) => transaction.id !== transactionId
                )
            );
            setSelectedTransaction(null);
        } catch (error) {
            setTransactionError(error.message);
        }
    }

    function repeatTransaction(transaction) {
        const { amount, ...transactionForm } = transaction;
        setFormData({
            ...transactionForm,
            date: new Date().toISOString().slice(0, 10),
            time: new Date().toTimeString().slice(0, 5),
        });

        setIsCategoryAutoAssigned(false);
        setEditingTransactionId(null);
        setSelectedTransaction(null);
        setIsFormOpen(true);
    }

    function clearFilters() {
        setSearchText("");
        setCategoryFilter("All");
        setDateFilter("All");
        setMinimumPrice("");
        setMaximumPrice("");
        setSortBy("newest");
    }

    const filteredTransactions = useMemo(() => {
        const today = new Date();

        const result = transactions.filter((transaction) => {
            const total = getTransactionTotal(transaction);
            const transactionDate = new Date(
                `${transaction.date}T${transaction.time || "00:00"}`
            );

            const matchesSearch =
                transaction.description
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                transaction.category
                    .toLowerCase()
                    .includes(searchText.toLowerCase());

            const matchesCategory =
                categoryFilter === "All" ||
                transaction.category === categoryFilter;

            const matchesMinimum =
                minimumPrice === "" || total >= Number(minimumPrice);

            const matchesMaximum =
                maximumPrice === "" || total <= Number(maximumPrice);

            let matchesDate = true;

            if (dateFilter === "today") {
                matchesDate =
                    transactionDate.toDateString() === today.toDateString();
            }

            if (dateFilter === "7days") {
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                matchesDate = transactionDate >= sevenDaysAgo;
            }

            if (dateFilter === "30days") {
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);
                matchesDate = transactionDate >= thirtyDaysAgo;
            }

            return (
                matchesSearch &&
                matchesCategory &&
                matchesMinimum &&
                matchesMaximum &&
                matchesDate
            );
        });

        return result.sort((first, second) => {
            const firstTotal = getTransactionTotal(first);
            const secondTotal = getTransactionTotal(second);

            if (sortBy === "highest") {
                return secondTotal - firstTotal;
            }

            if (sortBy === "lowest") {
                return firstTotal - secondTotal;
            }

            if (sortBy === "description") {
                return first.description.localeCompare(second.description);
            }

            const firstDate = new Date(`${first.date}T${first.time}`);
            const secondDate = new Date(`${second.date}T${second.time}`);

            if (sortBy === "oldest") {
                return firstDate - secondDate;
            }

            return secondDate - firstDate;
        });
    }, [
        transactions,
        searchText,
        categoryFilter,
        dateFilter,
        minimumPrice,
        maximumPrice,
        sortBy,
    ]);

    const transactionSummary = useMemo(() => {
        const totals = transactions.map(getTransactionTotal);
        const totalSpent = totals.reduce(
            (total, current) => total + current,
            0
        );

        return {
            totalSpent,
            transactionCount: transactions.length,
            average:
                transactions.length === 0
                    ? 0
                    : totalSpent / transactions.length,
            highest: totals.length === 0 ? 0 : Math.max(...totals),
        };
    }, [transactions]);

    const formTotal = getTransactionTotal(formData);
    const formOriginalTotal = getOriginalTransactionTotal(formData);

    return (
        <div className="dashboard-page transactions-page">
            <AppSidebar active="transactions" />
            <aside className="legacy-sidebar" aria-hidden="true">
                <div className="sidebar-logo">
                    <img src={cashlyLogo} alt="Cashly Logo" />
                    <h2>Cashly</h2>
                </div>

                <nav className="sidebar-menu">
                    <Link className="sidebar-link" to="/dashboard">
                        <span>⌂</span>
                        Dashboard
                    </Link>

                    <Link
                        className="sidebar-link active"
                        to="/transactions"
                    >
                        <span>↔</span>
                        Transactions
                    </Link>

                    <Link className="sidebar-link" to="/analytics">
                        <span>◫</span>
                        Analytics
                    </Link>

                    <Link className="sidebar-link" to="/challenges">
                        <span>★</span>
                        Challenges
                    </Link>

                    <Link className="sidebar-link" to="/settings">
                        <span>⚙</span>
                        Settings
                    </Link>
                </nav>

                <Link className="logout-link" to="/login">
                    <span>←</span>
                    Logout
                </Link>
            </aside>

            <main className="dashboard-main transactions-main">
                <header className="transactions-header">
                    <div>
                        <span className="transactions-eyebrow">
                            Spending Management
                        </span>
                        <h1>Transactions</h1>
                        <p>
                            Review, organize, and understand every payment in
                            one place.
                        </p>
                    </div>

                    <div className="transactions-header-actions">
                        <label className="currency-control header-currency-control">
                            <span>Currency</span>
                            <select
                                value={currency}
                                onChange={(event) =>
                                    setCurrency(event.target.value)
                                }
                            >
                                {Object.entries(currencyOptions).map(
                                    ([code, option]) => (
                                        <option value={code} key={code}>
                                            {code} · {option.label}
                                        </option>
                                    )
                                )}
                            </select>
                        </label>

                        <button
                            className="add-transaction-button"
                            type="button"
                            onClick={openAddForm}
                        >
                            <span>＋</span>
                            Add Transaction
                        </button>

                        <UserProfile />
                    </div>
                </header>

                <section className="transactions-content">
                    <div className="transaction-summary-grid">
                        <article className="transaction-summary-card">
                            <div className="summary-card-icon">↗</div>
                            <div>
                                <span>Total spent</span>
                                <strong>
                                    {formatMoney(transactionSummary.totalSpent)}
                                </strong>
                                <small>Across all recorded transactions</small>
                            </div>
                        </article>

                        <article className="transaction-summary-card">
                            <div className="summary-card-icon">#</div>
                            <div>
                                <span>Transactions</span>
                                <strong>
                                    {transactionSummary.transactionCount}
                                </strong>
                                <small>Payments currently recorded</small>
                            </div>
                        </article>

                        <article className="transaction-summary-card">
                            <div className="summary-card-icon">≈</div>
                            <div>
                                <span>Average value</span>
                                <strong>
                                    {formatMoney(transactionSummary.average)}
                                </strong>
                                <small>Average cost per transaction</small>
                            </div>
                        </article>

                        <article className="transaction-summary-card">
                            <div className="summary-card-icon">↑</div>
                            <div>
                                <span>Highest transaction</span>
                                <strong>
                                    {formatMoney(transactionSummary.highest)}
                                </strong>
                                <small>Your largest recorded payment</small>
                            </div>
                        </article>
                    </div>

                    <section className="transactions-history-panel">
                        <div className="history-heading">
                            <div>
                                <span className="transactions-eyebrow">
                                    Activity History
                                </span>
                                <h2>Transaction history</h2>
                                <p>
                                    Search, filter, and inspect your recent spending.
                                </p>
                            </div>

                            <div className="history-result-count">
                                <strong>{filteredTransactions.length}</strong>
                                <span>results</span>
                            </div>
                        </div>

                        <div className="transaction-filter-bar">
                            <div className="transaction-search-box">
                                <span>⌕</span>
                                <input
                                    type="text"
                                    placeholder="Search description, category..."
                                    value={searchText}
                                    onChange={(event) =>
                                        setSearchText(event.target.value)
                                    }
                                />
                            </div>

                            <select
                                value={dateFilter}
                                onChange={(event) =>
                                    setDateFilter(event.target.value)
                                }
                            >
                                <option value="All">Any date</option>
                                <option value="today">Today</option>
                                <option value="7days">Last 7 days</option>
                                <option value="30days">Last 30 days</option>
                            </select>

                            <select
                                value={categoryFilter}
                                onChange={(event) =>
                                    setCategoryFilter(event.target.value)
                                }
                            >
                                <option value="All">All categories</option>
                                {categories.map((category) => (
                                    <option value={category} key={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>

                            <button
                                className={`more-filters-button ${showMoreFilters ? "active" : ""
                                    }`}
                                type="button"
                                onClick={() =>
                                    setShowMoreFilters(
                                        (currentValue) => !currentValue
                                    )
                                }
                            >
                                ☷ More filters
                            </button>
                        </div>

                        {showMoreFilters && (
                            <div className="advanced-filter-row">
                                <label>
                                    <span>Minimum price</span>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={minimumPrice}
                                        onChange={(event) =>
                                            setMinimumPrice(event.target.value)
                                        }
                                    />
                                </label>

                                <label>
                                    <span>Maximum price</span>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="No limit"
                                        value={maximumPrice}
                                        onChange={(event) =>
                                            setMaximumPrice(event.target.value)
                                        }
                                    />
                                </label>

                                <label>
                                    <span>Sort by</span>
                                    <select
                                        value={sortBy}
                                        onChange={(event) =>
                                            setSortBy(event.target.value)
                                        }
                                    >
                                        <option value="newest">Newest first</option>
                                        <option value="oldest">Oldest first</option>
                                        <option value="highest">
                                            Highest amount
                                        </option>
                                        <option value="lowest">Lowest amount</option>
                                        <option value="description">Description A–Z</option>
                                    </select>
                                </label>

                                <button
                                    className="clear-filter-button"
                                    type="button"
                                    onClick={clearFilters}
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        <div className="transactions-table-wrapper">
                            <table className="transactions-table">
                                <thead>
                                    <tr>
                                        <th>Description</th>
                                        <th>Category</th>
                                        <th>Date & time</th>
                                        <th>Payment</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredTransactions.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td>
                                                <div className="description-cell">
                                                    <div className="description-logo">
                                                        {transaction.description
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <strong>{transaction.description}</strong>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="category-pill">
                                                    {transaction.category}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="date-cell">
                                                    <strong>
                                                        {new Date(
                                                            `${transaction.date}T00:00:00`
                                                        ).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        })}
                                                    </strong>
                                                    <span>{transaction.time}</span>
                                                </div>
                                            </td>

                                            <td>{transaction.paymentMethod}</td>

                                            <td className="amount-cell">
                                                {formatMoney(
                                                    getTransactionTotal(transaction)
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={`status-pill ${transaction.status.toLowerCase()}`}
                                                >
                                                    {transaction.status}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    className="view-transaction-button"
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedTransaction(transaction)
                                                    }
                                                    aria-label={`View ${transaction.description} transaction`}
                                                >
                                                    ›
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredTransactions.length === 0 && (
                                <div className="empty-transactions-state">
                                    <div>⌕</div>
                                    <h3>No transactions found</h3>
                                    <p>
                                        Change your filters or record a new transaction.
                                    </p>
                                    <button type="button" onClick={clearFilters}>
                                        Reset filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </section>
            </main>

            {isFormOpen && (
                <div
                    className="transaction-modal-overlay"
                    onMouseDown={closeAddForm}
                >
                    <form
                        className="transaction-form-modal"
                        onSubmit={submitTransaction}
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="transaction-modal-header">
                            <div>
                                <span className="transactions-eyebrow">
                                    {editingTransactionId
                                        ? "Edit financial record"
                                        : "New financial record"}
                                </span>
                                <h2>
                                    {editingTransactionId
                                        ? "Edit transaction"
                                        : "Add transaction"}
                                </h2>
                                <p>
                                    Add the description, price, and purchase
                                    information for this payment.
                                </p>
                            </div>

                            <button
                                className="transaction-close-button"
                                type="button"
                                onClick={closeAddForm}
                            >
                                ×
                            </button>
                        </div>

                        <div className="transaction-form-scroll">
                            <section className="form-section">
                                <div className="form-section-heading">
                                    <span>01</span>
                                    <div>
                                        <h3>Transaction details</h3>
                                        <p>What was this purchase, and when did it happen?</p>
                                    </div>
                                </div>

                                <div className="transaction-form-grid">
                                    <label className="wide-field transaction-currency-field">
                                        <span>Transaction currency *</span>
                                        <select name="currency" value={formData.currency} onChange={updateFormField}>
                                            {Object.entries(currencyOptions).map(([code, option]) => (
                                                <option value={code} key={code}>{code} — {option.label}</option>
                                            ))}
                                        </select>
                                        <small className={`exchange-rate-note ${rateStatus}`}>
                                            {formData.currency === "EGP" && "Recorded directly in Egyptian pounds."}
                                            {formData.currency !== "EGP" && rateStatus === "loading" && "Loading the latest EGP exchange rate…"}
                                            {formData.currency !== "EGP" && rateStatus === "ready" && `1 ${formData.currency} = ${Number(formData.exchangeRateToEGP).toFixed(4)} EGP`}
                                            {rateStatus === "error" && rateError}
                                        </small>
                                    </label>
                                    <label className="wide-field">
                                        <span>Description *</span>
                                        <input
                                            name="description"
                                            placeholder="Example: Groceries at Spinneys"
                                            value={formData.description}
                                            onChange={updateDescription}
                                            required
                                        />
                                    </label>

                                    <label>
                                        <span>Price in {formData.currency} *</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            name="price"
                                            placeholder="0"
                                            value={formData.price}
                                            onChange={updateFormField}
                                            required
                                        />
                                    </label>

                                    <label>
                                        <span>
                                            Category
                                            {isCategoryAutoAssigned && formData.description.trim() !== "" && (
                                                <i className="auto-category-tag">Auto-detected</i>
                                            )}
                                        </span>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={updateCategory}
                                        >
                                            {categories.map((category) => (
                                                <option value={category} key={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        <span>Payment method</span>
                                        <select
                                            name="paymentMethod"
                                            value={formData.paymentMethod}
                                            onChange={updateFormField}
                                        >
                                            {paymentMethods.map((method) => (
                                                <option value={method} key={method}>
                                                    {method}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        <span>Date of purchase *</span>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={updateFormField}
                                            required
                                        />
                                    </label>

                                    <label>
                                        <span>Time *</span>
                                        <input
                                            type="time"
                                            name="time"
                                            value={formData.time}
                                            onChange={updateFormField}
                                            required
                                        />
                                    </label>

                                    <label>
                                        <span>Status</span>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={updateFormField}
                                        >
                                            <option value="Completed">Completed</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Refunded">Refunded</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </label>
                                </div>
                            </section>

                            <section className="form-section">
                                <div className="form-section-heading">
                                    <span>02</span>
                                    <div>
                                        <h3>Additional information</h3>
                                        <p>
                                            Include discounts or fees applied to this payment.
                                        </p>
                                    </div>
                                </div>

                                <div className="transaction-form-grid">
                                    <label>
                                        <span>Additional fees ({formData.currency})</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            name="fees"
                                            placeholder="0"
                                            value={formData.fees}
                                            onChange={updateFormField}
                                        />
                                    </label>

                                    <label>
                                        <span>Discount ({formData.currency})</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            name="discount"
                                            placeholder="0"
                                            value={formData.discount}
                                            onChange={updateFormField}
                                        />
                                    </label>
                                </div>
                            </section>
                        </div>

                        <div className="transaction-form-footer">
                            <div className="form-total">
                                <span>Transaction total</span>
                                <strong>{formatMoney(formOriginalTotal, formData.currency)}</strong>
                                {formData.currency !== "EGP" && rateStatus === "ready" && <small>About {formatMoney(formTotal)} at the saved rate</small>}
                            </div>

                            <div className="form-footer-buttons">
                                <button
                                    className="cancel-transaction-button"
                                    type="button"
                                    onClick={closeAddForm}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="save-transaction-button"
                                    type="submit"
                                    disabled={formData.currency !== "EGP" && rateStatus !== "ready"}
                                >
                                    {editingTransactionId
                                        ? "Save changes"
                                        : "Save transaction"}
                                </button>
                            </div>
                        </div>
                        <a className="exchange-rate-attribution" href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer">Rates by ExchangeRate-API</a>
                    </form>
                </div>
            )}

            {selectedTransaction && (
                <div
                    className="transaction-modal-overlay"
                    onMouseDown={() => setSelectedTransaction(null)}
                >
                    <article
                        className="transaction-details-modal"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="transaction-modal-header">
                            <div>
                                <span className="transactions-eyebrow">
                                    Transaction receipt
                                </span>
                                <h2>{selectedTransaction.description}</h2>
                                <p>
                                    {new Date(
                                        `${selectedTransaction.date}T00:00:00`
                                    ).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}{" "}
                                    at {selectedTransaction.time}
                                </p>
                            </div>

                            <button
                                className="transaction-close-button"
                                type="button"
                                onClick={() => setSelectedTransaction(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="details-description-card">
                            <div className="details-description-logo">
                                {selectedTransaction.description
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                            <div>
                                <strong>{selectedTransaction.description}</strong>
                                <span>{selectedTransaction.category}</span>
                            </div>
                            <span
                                className={`status-pill ${selectedTransaction.status.toLowerCase()}`}
                            >
                                {selectedTransaction.status}
                            </span>
                        </div>

                        <div className="details-totals">
                            <div>
                                <span>Price</span>
                                <strong>
                                    {formatMoney(
                                        Number(selectedTransaction.price ?? selectedTransaction.amount ?? 0),
                                        selectedTransaction.currency || "EGP"
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Additional fees</span>
                                <strong>
                                    {formatMoney(selectedTransaction.fees, selectedTransaction.currency || "EGP")}
                                </strong>
                            </div>

                            <div>
                                <span>Discount</span>
                                <strong>
                                    − {formatMoney(selectedTransaction.discount, selectedTransaction.currency || "EGP")}
                                </strong>
                            </div>

                            <div className="details-total-row">
                                <span>Total paid {selectedTransaction.currency && selectedTransaction.currency !== "EGP" ? "(in EGP)" : ""}</span>
                                <strong>
                                    {formatMoney(
                                        getTransactionTotal(selectedTransaction)
                                    )}
                                </strong>
                            </div>
                        </div>

                        <div className="details-information-grid">
                            <div className="details-note">
                                <span>Payment method</span>
                                <strong>
                                    {selectedTransaction.paymentMethod}
                                </strong>
                            </div>
                        </div>

                        <div className="details-modal-actions">
                            <button
                                className="repeat-transaction-button"
                                type="button"
                                onClick={() =>
                                    openEditForm(selectedTransaction)
                                }
                            >
                                Edit transaction
                            </button>

                            <button
                                className="delete-transaction-button"
                                type="button"
                                onClick={() =>
                                    deleteTransaction(selectedTransaction.id)
                                }
                            >
                                Delete
                            </button>

                            <button
                                className="repeat-transaction-button"
                                type="button"
                                onClick={() =>
                                    repeatTransaction(selectedTransaction)
                                }
                            >
                                Repeat transaction
                            </button>
                        </div>
                    </article>
                </div>
            )}
        </div>
    );
}

export default Transactions;
