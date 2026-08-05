import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import cashlyLogo from "../assets/cashly-img-removebg-preview.png";

import "../styles/Dashboard.css";
import "../styles/Transactions.css";
import AppSidebar from "../components/AppSidebar";
import UserProfile from "../components/UserProfile";
import TransactionFormModal from "../components/TransactionFormModal";
import {
    deleteTransaction as deleteTransactionRequest,
    fetchTransactions,
} from "../services/transactions";
import {
    currencyOptions,
    categories,
    getTransactionTotal,
} from "../utils/transactionForm";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
const [isLoadingTransactions, setIsLoadingTransactions] =
    useState(true);
const [transactionError, setTransactionError] = useState("");

    // Temporary compatibility state for the hidden legacy header selector.
    // Currency selection now belongs to each individual transaction form.
    const [currency, setCurrency] = useState("EGP");

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formSeed, setFormSeed] = useState(null);
    // Bumped every time the form is (re)opened so TransactionFormModal remounts
    // with a clean slate instead of syncing prop changes through an effect.
    const [formSessionId, setFormSessionId] = useState(0);
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

    function openAddForm() {
        setFormSeed(null);
        setEditingTransactionId(null);
        setFormSessionId((current) => current + 1);
        setIsFormOpen(true);
    }

    function closeAddForm() {
        setIsFormOpen(false);
        setFormSeed(null);
        setEditingTransactionId(null);
    }

    function openEditForm(transaction) {
        setFormSeed(transaction);
        setEditingTransactionId(transaction.id);
        setFormSessionId((current) => current + 1);
        setSelectedTransaction(null);
        setIsFormOpen(true);
    }

    function handleTransactionSaved(savedTransaction, { isEdit }) {
        setTransactions((currentTransactions) =>
            isEdit
                ? currentTransactions.map((transaction) =>
                    transaction.id === savedTransaction.id
                        ? savedTransaction
                        : transaction
                )
                : [savedTransaction, ...currentTransactions]
        );
        closeAddForm();
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
        setFormSeed({
            ...transaction,
            date: new Date().toISOString().slice(0, 10),
            time: new Date().toTimeString().slice(0, 5),
        });

        setEditingTransactionId(null);
        setFormSessionId((current) => current + 1);
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

            <TransactionFormModal
                key={formSessionId}
                open={isFormOpen}
                initialTransaction={formSeed}
                editingTransactionId={editingTransactionId}
                onClose={closeAddForm}
                onSaved={handleTransactionSaved}
            />

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
