import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import cashlyLogo from "../assets/cashly-img-removebg-preview.png";

import "../styles/Dashboard.css";
import "../styles/Transactions.css";

import { logoutUser } from "../services/auth";
import {
    getTransactions,
    createTransaction,
    deleteTransaction,
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

function createEmptyForm() {
    return {
        description: "",
        category: "Other",
        date: new Date().toISOString().slice(0, 10),
        price: "",
    };
}

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [currency, setCurrency] = useState(
        localStorage.getItem("cashlyCurrency") || "EGP"
    );
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState(createEmptyForm);
    const [formError, setFormError] = useState("");
    const [selectedTransaction, setSelectedTransaction] =
        useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

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
        getTransactions()
            .then(setTransactions)
            .catch((error) => setLoadError(error.message))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        localStorage.setItem("cashlyCurrency", currency);
    }, [currency]);

    function formatMoney(amount) {
        const convertedAmount =
            Number(amount || 0) * currencyOptions[currency].rate;

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            maximumFractionDigits: currency === "EGP" ? 0 : 2,
        }).format(convertedAmount);
    }

    function updateFormField(event) {
        const { name, value } = event.target;

        setFormData((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    function openAddForm() {
        setFormData(createEmptyForm());
        setFormError("");
        setIsFormOpen(true);
    }

    function closeAddForm() {
        setIsFormOpen(false);
        setFormData(createEmptyForm());
        setFormError("");
    }

    async function submitTransaction(event) {
        event.preventDefault();

        if (formData.description.trim() === "" || Number(formData.price) <= 0) {
            return;
        }

        try {
            const newTransaction = await createTransaction({
                description: formData.description,
                price: Number(formData.price),
                date: formData.date,
                category: formData.category,
            });

            setTransactions((currentTransactions) => [
                newTransaction,
                ...currentTransactions,
            ]);

            closeAddForm();
        } catch (error) {
            setFormError(error.message);
        }
    }

    async function handleDeleteTransaction(transactionId) {
        setIsDeleting(true);
        setDeleteError("");

        try {
            await deleteTransaction(transactionId);

            setTransactions((currentTransactions) =>
                currentTransactions.filter(
                    (transaction) => transaction.transaction_id !== transactionId
                )
            );

            setSelectedTransaction(null);
        } catch (error) {
            setDeleteError(error.message);
        } finally {
            setIsDeleting(false);
        }
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
            const transactionDate = new Date(`${transaction.date}T00:00:00`);

            const matchesSearch =
                (transaction.description || "")
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                transaction.category
                    .toLowerCase()
                    .includes(searchText.toLowerCase());

            const matchesCategory =
                categoryFilter === "All" ||
                transaction.category === categoryFilter;

            const matchesMinimum =
                minimumPrice === "" || transaction.price >= Number(minimumPrice);

            const matchesMaximum =
                maximumPrice === "" || transaction.price <= Number(maximumPrice);

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
            if (sortBy === "highest") {
                return second.price - first.price;
            }

            if (sortBy === "lowest") {
                return first.price - second.price;
            }

            const firstDate = new Date(first.date);
            const secondDate = new Date(second.date);

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
        const totalSpent = transactions.reduce(
            (total, transaction) => total + transaction.price,
            0
        );

        return {
            totalSpent,
            transactionCount: transactions.length,
            average:
                transactions.length === 0
                    ? 0
                    : totalSpent / transactions.length,
            highest:
                transactions.length === 0
                    ? 0
                    : Math.max(...transactions.map((transaction) => transaction.price)),
        };
    }, [transactions]);

    return (
        <div className="dashboard-page transactions-page">
            <aside className="dashboard-sidebar">
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

                <Link className="logout-link" to="/login" onClick={logoutUser}>
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
                        <label className="currency-control">
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

                        <div className="dashboard-avatar" title={userName}>
                            {firstLetter}
                        </div>
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
                                    placeholder="Search description or category..."
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
                            {isLoading && (
                                <p className="transactions-loading-state">
                                    Loading transactions...
                                </p>
                            )}

                            {loadError && (
                                <p className="transactions-error-state">
                                    {loadError}
                                </p>
                            )}

                            {!isLoading && !loadError && (
                                <table className="transactions-table">
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th>Category</th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredTransactions.map((transaction) => (
                                            <tr key={transaction.transaction_id}>
                                                <td>
                                                    <strong>
                                                        {transaction.description || "—"}
                                                    </strong>
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
                                                    </div>
                                                </td>

                                                <td className="amount-cell">
                                                    {formatMoney(transaction.price)}
                                                </td>

                                                <td>
                                                    <button
                                                        className="view-transaction-button"
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedTransaction(transaction);
                                                            setDeleteError("");
                                                        }}
                                                        aria-label="View transaction"
                                                    >
                                                        ›
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {!isLoading && !loadError && filteredTransactions.length === 0 && (
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
                                    New financial record
                                </span>
                                <h2>Add transaction</h2>
                                <p>
                                    Add the description, category, date, and amount.
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
                                <div className="transaction-form-grid">
                                    <label className="wide-field">
                                        <span>Description *</span>
                                        <input
                                            name="description"
                                            placeholder="Example: Groceries, Uber ride..."
                                            value={formData.description}
                                            onChange={updateFormField}
                                            required
                                        />
                                    </label>

                                    <label>
                                        <span>Category</span>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={updateFormField}
                                        >
                                            {categories.map((category) => (
                                                <option value={category} key={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        <span>Date *</span>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={updateFormField}
                                            required
                                        />
                                    </label>

                                    <label>
                                        <span>Price in EGP *</span>
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
                                </div>
                            </section>
                        </div>

                        {formError && (
                            <p className="transactions-error-state">{formError}</p>
                        )}

                        <div className="transaction-form-footer">
                            <div className="form-total">
                                <span>Transaction total</span>
                                <strong>{formatMoney(formData.price)}</strong>
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
                                >
                                    Save transaction
                                </button>
                            </div>
                        </div>
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
                                <h2>{selectedTransaction.description || "Transaction"}</h2>
                                <p>
                                    {new Date(
                                        `${selectedTransaction.date}T00:00:00`
                                    ).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
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

                        <div className="details-totals">
                            <div>
                                <span>Category</span>
                                <strong>{selectedTransaction.category}</strong>
                            </div>

                            <div className="details-total-row">
                                <span>Amount</span>
                                <strong>
                                    {formatMoney(selectedTransaction.price)}
                                </strong>
                            </div>
                        </div>

                        {deleteError && (
                            <p className="transactions-error-state">{deleteError}</p>
                        )}

                        <div className="details-modal-actions">
                            <button
                                className="delete-transaction-button"
                                type="button"
                                disabled={isDeleting}
                                onClick={() =>
                                    handleDeleteTransaction(
                                        selectedTransaction.transaction_id
                                    )
                                }
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </article>
                </div>
            )}
        </div>
    );
}

export default Transactions;
