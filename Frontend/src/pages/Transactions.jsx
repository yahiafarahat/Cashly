import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import cashlyLogo from "../assets/cashly-img-removebg-preview.png";

import "../styles/Dashboard.css";
import "../styles/Transactions.css";
import AppSidebar from "../components/AppSidebar";
import UserProfile from "../components/UserProfile";

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

const merchantSuggestions = [
    "Spinneys",
    "Carrefour",
    "Gourmet Egypt",
    "Seoudi",
    "Zara",
    "H&M",
    "Bershka",
    "Pull&Bear",
    "Uber",
    "Careem",
    "inDrive",
    "Starbucks",
    "Costa Coffee",
    "Dunkin'",
    "McDonald's",
    "Buffalo Burger",
    "Sephora",
    "Faces",
    "Mazaya",
    "Shell",
    "ChillOut",
    "TotalEnergies",
    "InstaPay Transfer",
];

const merchantCategoryMap = {
    Spinneys: "Groceries",
    Carrefour: "Groceries",
    "Gourmet Egypt": "Groceries",
    Seoudi: "Groceries",
    Zara: "Fashion",
    "H&M": "Fashion",
    Bershka: "Fashion",
    PullAndBear: "Fashion",
    Uber: "Transportation",
    Careem: "Transportation",
    inDrive: "Transportation",
    Starbucks: "Dining & Coffee",
    "Costa Coffee": "Dining & Coffee",
    "Dunkin'": "Dining & Coffee",
    "McDonald's": "Dining & Coffee",
    "Buffalo Burger": "Dining & Coffee",
    Sephora: "Beauty & Personal Care",
    Faces: "Beauty & Personal Care",
    Mazaya: "Beauty & Personal Care",
    Shell: "Fuel & Car",
    ChillOut: "Fuel & Car",
    TotalEnergies: "Fuel & Car",
    "InstaPay Transfer": "Transfers",
};

const startingTransactions = [
    {
        id: 1,
        merchant: "Spinneys",
        category: "Groceries",
        date: "2026-07-18",
        time: "14:35",
        location: "New Cairo",
        paymentMethod: "Debit Card",
        status: "Completed",
        notes: "Weekly groceries",
        items: [
            { id: 11, name: "Groceries", quantity: 1, price: 980 },
            { id: 12, name: "Household supplies", quantity: 1, price: 260 },
        ],
        fees: 0,
        discount: 0,
    },
    {
        id: 2,
        merchant: "Zara",
        category: "Fashion",
        date: "2026-07-16",
        time: "19:10",
        location: "Cairo Festival City",
        paymentMethod: "Credit Card",
        status: "Completed",
        notes: "Summer shopping",
        items: [
            { id: 21, name: "Blouse", quantity: 1, price: 1250 },
            { id: 22, name: "Trousers", quantity: 1, price: 850 },
        ],
        fees: 0,
        discount: 0,
    },
    {
        id: 3,
        merchant: "Uber",
        category: "Transportation",
        date: "2026-07-15",
        time: "09:15",
        location: "New Cairo",
        paymentMethod: "Mobile Wallet",
        status: "Completed",
        notes: "Trip to internship",
        items: [{ id: 31, name: "Car ride", quantity: 1, price: 185 }],
        fees: 0,
        discount: 0,
    },
    {
        id: 4,
        merchant: "InstaPay Transfer",
        category: "Transfers",
        date: "2026-07-14",
        time: "21:42",
        location: "Online",
        paymentMethod: "InstaPay",
        status: "Completed",
        notes: "Shared dinner payment",
        items: [{ id: 41, name: "Transfer to Sara", quantity: 1, price: 320 }],
        fees: 0,
        discount: 0,
    },
    {
        id: 5,
        merchant: "Sephora",
        category: "Beauty & Personal Care",
        date: "2026-07-12",
        time: "17:25",
        location: "City Centre Almaza",
        paymentMethod: "Debit Card",
        status: "Completed",
        notes: "",
        items: [
            { id: 51, name: "Lip gloss", quantity: 1, price: 740 },
            { id: 52, name: "Mascara", quantity: 1, price: 890 },
        ],
        fees: 0,
        discount: 130,
    },
];

function createEmptyForm() {
    const now = new Date();

    return {
        merchant: "",
        category: "Other",
        date: now.toISOString().slice(0, 10),
        time: now.toTimeString().slice(0, 5),
        location: "",
        paymentMethod: "Debit Card",
        status: "Completed",
        notes: "",
        currency: "EGP",
        exchangeRateToEGP: 1,
        rateUpdatedAt: "",
        items: [{ id: Date.now(), name: "", quantity: 1, price: "" }],
        fees: "",
        discount: "",
    };
}

function getTransactionTotal(transaction) {
    const itemsTotal = transaction.items.reduce(
        (total, item) =>
            total + Number(item.price || 0) * Number(item.quantity || 1),
        0
    );

    const originalTotal = (
        itemsTotal +
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
    const [transactions, setTransactions] = useState(() => {
        const savedTransactions = localStorage.getItem(
            "cashlyTransactions"
        );

        return savedTransactions
            ? JSON.parse(savedTransactions)
            : startingTransactions;
    });

    // Temporary compatibility state for the hidden legacy header selector.
    // Currency selection now belongs to each individual transaction form.
    const [currency, setCurrency] = useState("EGP");

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState(createEmptyForm);
    const [rateStatus, setRateStatus] = useState("idle");
    const [rateError, setRateError] = useState("");
    const [selectedTransaction, setSelectedTransaction] =
        useState(null);

    const [searchText, setSearchText] = useState("");
    const [merchantFilter, setMerchantFilter] = useState("All");
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
        localStorage.setItem(
            "cashlyTransactions",
            JSON.stringify(transactions)
        );
    }, [transactions]);

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

    function updateMerchant(event) {
        const merchant = event.target.value;
        const suggestedCategory = merchantCategoryMap[merchant];

        setFormData((currentForm) => ({
            ...currentForm,
            merchant,
            category: suggestedCategory || currentForm.category,
            paymentMethod:
                merchant === "InstaPay Transfer"
                    ? "InstaPay"
                    : currentForm.paymentMethod,
            location:
                merchant === "InstaPay Transfer"
                    ? "Online"
                    : currentForm.location,
        }));
    }

    function updateItem(itemId, field, value) {
        setFormData((currentForm) => ({
            ...currentForm,
            items: currentForm.items.map((item) =>
                item.id === itemId ? { ...item, [field]: value } : item
            ),
        }));
    }

    function addItem() {
        setFormData((currentForm) => ({
            ...currentForm,
            items: [
                ...currentForm.items,
                {
                    id: Date.now(),
                    name: "",
                    quantity: 1,
                    price: "",
                },
            ],
        }));
    }

    function removeItem(itemId) {
        setFormData((currentForm) => ({
            ...currentForm,
            items:
                currentForm.items.length === 1
                    ? currentForm.items
                    : currentForm.items.filter((item) => item.id !== itemId),
        }));
    }

    function openAddForm() {
        setFormData(createEmptyForm());
        setIsFormOpen(true);
    }

    function closeAddForm() {
        setIsFormOpen(false);
        setFormData(createEmptyForm());
    }

    function submitTransaction(event) {
        event.preventDefault();

        if (formData.currency !== "EGP" && rateStatus !== "ready") {
            setRateError("A current exchange rate is required before this transaction can be saved.");
            return;
        }

        const validItems = formData.items.filter(
            (item) =>
                item.name.trim() !== "" && Number(item.price) > 0
        );

        if (formData.merchant.trim() === "" || validItems.length === 0) {
            return;
        }

        const newTransaction = {
            ...formData,
            id: Date.now(),
            items: validItems.map((item) => ({
                ...item,
                quantity: Number(item.quantity),
                price: Number(item.price),
            })),
            fees: Number(formData.fees || 0),
            discount: Number(formData.discount || 0),
        };

        setTransactions((currentTransactions) => [
            newTransaction,
            ...currentTransactions,
        ]);

        closeAddForm();
    }

    function deleteTransaction(transactionId) {
        setTransactions((currentTransactions) =>
            currentTransactions.filter(
                (transaction) => transaction.id !== transactionId
            )
        );

        setSelectedTransaction(null);
    }

    function repeatTransaction(transaction) {
        setFormData({
            ...transaction,
            merchant: transaction.merchant,
            date: new Date().toISOString().slice(0, 10),
            time: new Date().toTimeString().slice(0, 5),
            items: transaction.items.map((item) => ({
                ...item,
                id: Date.now() + Math.random(),
            })),
        });

        setSelectedTransaction(null);
        setIsFormOpen(true);
    }

    function clearFilters() {
        setSearchText("");
        setMerchantFilter("All");
        setCategoryFilter("All");
        setDateFilter("All");
        setMinimumPrice("");
        setMaximumPrice("");
        setSortBy("newest");
    }

    const uniqueMerchants = useMemo(
        () => [
            "All",
            ...new Set(
                transactions.map((transaction) => transaction.merchant)
            ),
        ],
        [transactions]
    );

    const filteredTransactions = useMemo(() => {
        const today = new Date();

        const result = transactions.filter((transaction) => {
            const total = getTransactionTotal(transaction);
            const transactionDate = new Date(
                `${transaction.date}T${transaction.time || "00:00"}`
            );

            const matchesSearch =
                transaction.merchant
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                transaction.category
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                transaction.location
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                transaction.items.some((item) =>
                    item.name.toLowerCase().includes(searchText.toLowerCase())
                );

            const matchesMerchant =
                merchantFilter === "All" ||
                transaction.merchant === merchantFilter;

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
                matchesMerchant &&
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

            if (sortBy === "merchant") {
                return first.merchant.localeCompare(second.merchant);
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
        merchantFilter,
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
                                    placeholder="Search merchant, item, location..."
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

                            <select
                                value={merchantFilter}
                                onChange={(event) =>
                                    setMerchantFilter(event.target.value)
                                }
                            >
                                {uniqueMerchants.map((merchant) => (
                                    <option value={merchant} key={merchant}>
                                        {merchant === "All"
                                            ? "All merchants"
                                            : merchant}
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
                                        <option value="merchant">Merchant A–Z</option>
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
                                        <th>Merchant</th>
                                        <th>Details</th>
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
                                                <div className="merchant-cell">
                                                    <div className="merchant-logo">
                                                        {transaction.merchant
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <strong>{transaction.merchant}</strong>
                                                        <span>{transaction.location}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="transaction-item-summary">
                                                    <strong>
                                                        {transaction.items.length === 1
                                                            ? transaction.items[0].name
                                                            : `${transaction.items.length} items`}
                                                    </strong>
                                                    <span>
                                                        {transaction.items
                                                            .slice(0, 2)
                                                            .map((item) => item.name)
                                                            .join(", ")}
                                                    </span>
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
                                                    aria-label={`View ${transaction.merchant} transaction`}
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
                                    New financial record
                                </span>
                                <h2>Add transaction</h2>
                                <p>
                                    Add the merchant, purchase information, and all
                                    items included in this payment.
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
                                        <p>Where and when did this purchase happen?</p>
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
                                        <span>Merchant name *</span>
                                        <input
                                            name="merchant"
                                            list="merchant-options"
                                            placeholder="Example: Spinneys, Zara, Uber..."
                                            value={formData.merchant}
                                            onChange={updateMerchant}
                                            required
                                        />
                                        <datalist id="merchant-options">
                                            {merchantSuggestions.map((merchant) => (
                                                <option value={merchant} key={merchant} />
                                            ))}
                                        </datalist>
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

                                    <label className="wide-field">
                                        <span>Location</span>
                                        <input
                                            name="location"
                                            placeholder="Example: New Cairo, Cairo Festival City, Online"
                                            value={formData.location}
                                            onChange={updateFormField}
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
                                <div className="form-section-heading items-heading">
                                    <span>02</span>
                                    <div>
                                        <h3>Purchased items</h3>
                                        <p>
                                            Add one or several items from the same receipt.
                                        </p>
                                    </div>

                                    <button
                                        className="add-item-button"
                                        type="button"
                                        onClick={addItem}
                                    >
                                        ＋ Add item
                                    </button>
                                </div>

                                <div className="transaction-items-list">
                                    {formData.items.map((item, index) => (
                                        <div
                                            className="transaction-item-row"
                                            key={item.id}
                                        >
                                            <div className="item-number">
                                                {String(index + 1).padStart(2, "0")}
                                            </div>

                                            <label className="item-name-field">
                                                <span>Item name *</span>
                                                <input
                                                    placeholder="Example: Iced latte"
                                                    value={item.name}
                                                    onChange={(event) =>
                                                        updateItem(
                                                            item.id,
                                                            "name",
                                                            event.target.value
                                                        )
                                                    }
                                                    required
                                                />
                                            </label>

                                            <label className="quantity-field">
                                                <span>Quantity</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(event) =>
                                                        updateItem(
                                                            item.id,
                                                            "quantity",
                                                            event.target.value
                                                        )
                                                    }
                                                />
                                            </label>

                                            <label className="price-field">
                                                <span>Price in {formData.currency} *</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="0"
                                                    value={item.price}
                                                    onChange={(event) =>
                                                        updateItem(
                                                            item.id,
                                                            "price",
                                                            event.target.value
                                                        )
                                                    }
                                                    required
                                                />
                                            </label>

                                            <button
                                                className="remove-item-button"
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                disabled={formData.items.length === 1}
                                                aria-label="Remove item"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="form-section">
                                <div className="form-section-heading">
                                    <span>03</span>
                                    <div>
                                        <h3>Additional information</h3>
                                        <p>
                                            Include discounts, fees, or a useful note.
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

                                    <label className="wide-field">
                                        <span>Notes</span>
                                        <textarea
                                            name="notes"
                                            rows="3"
                                            placeholder="Add any useful details about this transaction..."
                                            value={formData.notes}
                                            onChange={updateFormField}
                                        ></textarea>
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
                                    Save transaction
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
                                <h2>{selectedTransaction.merchant}</h2>
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

                        <div className="details-merchant-card">
                            <div className="details-merchant-logo">
                                {selectedTransaction.merchant
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                            <div>
                                <strong>{selectedTransaction.merchant}</strong>
                                <span>
                                    {selectedTransaction.category} ·{" "}
                                    {selectedTransaction.location || "No location"}
                                </span>
                            </div>
                            <span
                                className={`status-pill ${selectedTransaction.status.toLowerCase()}`}
                            >
                                {selectedTransaction.status}
                            </span>
                        </div>

                        <div className="details-items">
                            <div className="details-section-title">
                                <span>Items</span>
                                <span>{selectedTransaction.items.length}</span>
                            </div>

                            {selectedTransaction.items.map((item) => (
                                <div className="details-item-row" key={item.id}>
                                    <div>
                                        <strong>{item.name}</strong>
                                        <span>Quantity {item.quantity}</span>
                                    </div>
                                    <strong>
                                        {formatMoney(item.price * item.quantity, selectedTransaction.currency || "EGP")}
                                    </strong>
                                </div>
                            ))}
                        </div>

                        <div className="details-totals">
                            <div>
                                <span>Subtotal</span>
                                <strong>
                                    {formatMoney(
                                        selectedTransaction.items.reduce(
                                            (total, item) =>
                                                total + item.price * item.quantity,
                                            0
                                        ),
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
                            <div>
                                <span>Payment method</span>
                                <strong>
                                    {selectedTransaction.paymentMethod}
                                </strong>
                            </div>
                            <div>
                                <span>Location</span>
                                <strong>
                                    {selectedTransaction.location || "Not added"}
                                </strong>
                            </div>
                            <div className="details-note">
                                <span>Notes</span>
                                <strong>
                                    {selectedTransaction.notes || "No notes added"}
                                </strong>
                            </div>
                        </div>

                        <div className="details-modal-actions">
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
