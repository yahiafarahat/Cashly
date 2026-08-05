export const currencyOptions = {
    EGP: { label: "Egyptian Pound", symbol: "EGP", rate: 1 },
    USD: { label: "US Dollar", symbol: "$", rate: 0.0203 },
    EUR: { label: "Euro", symbol: "€", rate: 0.0175 },
    GBP: { label: "British Pound", symbol: "£", rate: 0.0152 },
    SAR: { label: "Saudi Riyal", symbol: "SAR", rate: 0.0761 },
    AED: { label: "UAE Dirham", symbol: "AED", rate: 0.0746 },
};

export const categories = [
    "Groceries",
    "Dining & Coffee",
    "Transportation",
    "Fashion",
    "Shopping",
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

export const paymentMethods = [
    "Cash",
    "Debit Card",
    "Credit Card",
    "InstaPay",
    "Mobile Wallet",
    "Bank Transfer",
];

export function createEmptyForm() {
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

export function getTransactionTotal(transaction) {
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

export function getOriginalTransactionTotal(transaction) {
    const rate = Number(transaction.exchangeRateToEGP || 1);
    return getTransactionTotal(transaction) / rate;
}
