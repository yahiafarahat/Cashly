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

export function categorizeDescription(description) {
    const text = description.trim().toLowerCase();

    if (!text) return null;

    const match = CATEGORY_KEYWORDS.find(({ keywords }) =>
        keywords.some((keyword) => text.includes(keyword))
    );

    return match ? match.category : null;
}

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
