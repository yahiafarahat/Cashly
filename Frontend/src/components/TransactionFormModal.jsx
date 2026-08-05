import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { createTransaction, updateTransaction } from "../services/transactions";
import { predictCategory } from "../services/categorization";
import {
    currencyOptions,
    categories,
    paymentMethods,
    createEmptyForm,
    getTransactionTotal,
    getOriginalTransactionTotal,
} from "../utils/transactionForm";

// Wait for a short pause in typing before predicting — avoids firing a
// prediction (and re-render) on every keystroke while still feeling instant.
const CATEGORY_PREDICTION_DEBOUNCE_MS = 300;

function buildFormFromSeed(seedTransaction) {
    if (!seedTransaction) return createEmptyForm();

    const { amount, ...transactionForm } = seedTransaction;

    return { ...transactionForm, price: Number(seedTransaction.price) };
}

function formatMoney(amount, currencyCode = "EGP") {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: currencyCode === "EGP" ? 0 : 2,
    }).format(Number(amount || 0));
}

// Reusable Add/Edit transaction modal. Shared by the Transactions page and
// the My Day "Add Transaction" action so both stay backed by one form.
//
// Callers reset the form by remounting this component (pass a `key` that
// changes whenever a new add/edit/repeat session starts) rather than this
// component syncing its state from props via an effect.
function TransactionFormModal({ open, initialTransaction = null, editingTransactionId = null, onClose, onSaved }) {
    const [formData, setFormData] = useState(() => buildFormFromSeed(initialTransaction));
    const [isCategoryAutoAssigned, setIsCategoryAutoAssigned] = useState(() => !initialTransaction);
    const [rateStatus, setRateStatus] = useState("idle");
    const [rateError, setRateError] = useState("");
    const [submitError, setSubmitError] = useState("");

    // Mirrors isCategoryAutoAssigned so the debounced prediction callback
    // below always sees the latest value instead of the one captured when
    // the timer was scheduled — a manual category change should always win,
    // even if it happens while a prediction is still in flight.
    const isCategoryAutoAssignedRef = useRef(isCategoryAutoAssigned);

    useEffect(() => {
        isCategoryAutoAssignedRef.current = isCategoryAutoAssigned;
    }, [isCategoryAutoAssigned]);

    const predictionTimeoutRef = useRef(null);

    useEffect(() => {
        return () => clearTimeout(predictionTimeoutRef.current);
    }, []);

    useEffect(() => {
        if (!open) return;

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
    }, [formData.currency, open]);

    if (!open) return null;

    function updateFormField(event) {
        const { name, value } = event.target;

        setFormData((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    function updateDescription(event) {
        const description = event.target.value;

        setFormData((currentForm) => ({ ...currentForm, description }));

        clearTimeout(predictionTimeoutRef.current);

        if (!isCategoryAutoAssigned) {
            // The user already picked a category manually — never fight that.
            return;
        }

        predictionTimeoutRef.current = setTimeout(async () => {
            const prediction = await predictCategory(description);

            if (!prediction || !isCategoryAutoAssignedRef.current) return;

            setFormData((currentForm) => {
                // The description kept changing after this prediction was
                // requested — a newer prediction is already on the way.
                if (currentForm.description !== description) return currentForm;

                return { ...currentForm, category: prediction.category };
            });
        }, CATEGORY_PREDICTION_DEBOUNCE_MS);
    }

    function updateCategory(event) {
        setIsCategoryAutoAssigned(false);
        updateFormField(event);
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
            setSubmitError("");
            const savedTransaction = editingTransactionId
                ? await updateTransaction(editingTransactionId, newTransaction, getTransactionTotal(newTransaction))
                : await createTransaction(newTransaction, getTransactionTotal(newTransaction));

            onSaved(savedTransaction, { isEdit: Boolean(editingTransactionId) });
        } catch (error) {
            setSubmitError(error.message);
        }
    }

    const formTotal = getTransactionTotal(formData);
    const formOriginalTotal = getOriginalTransactionTotal(formData);

    return (
        <div className="transaction-modal-overlay" onMouseDown={onClose}>
            <form
                className="transaction-form-modal"
                onSubmit={submitTransaction}
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="transaction-modal-header">
                    <div>
                        <span className="transactions-eyebrow">
                            {editingTransactionId ? "Edit financial record" : "New financial record"}
                        </span>
                        <h2>{editingTransactionId ? "Edit transaction" : "Add transaction"}</h2>
                        <p>Add the description, price, and purchase information for this payment.</p>
                    </div>

                    <button className="transaction-close-button" type="button" onClick={onClose}>
                        <X size={18} />
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
                                <select name="category" value={formData.category} onChange={updateCategory}>
                                    {categories.map((category) => (
                                        <option value={category} key={category}>{category}</option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                <span>Payment method</span>
                                <select name="paymentMethod" value={formData.paymentMethod} onChange={updateFormField}>
                                    {paymentMethods.map((method) => (
                                        <option value={method} key={method}>{method}</option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                <span>Date of purchase *</span>
                                <input type="date" name="date" value={formData.date} onChange={updateFormField} required />
                            </label>

                            <label>
                                <span>Time *</span>
                                <input type="time" name="time" value={formData.time} onChange={updateFormField} required />
                            </label>

                            <label>
                                <span>Status</span>
                                <select name="status" value={formData.status} onChange={updateFormField}>
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
                                <p>Include discounts or fees applied to this payment.</p>
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
                        {submitError && <small className="error">{submitError}</small>}
                    </div>

                    <div className="form-footer-buttons">
                        <button className="cancel-transaction-button" type="button" onClick={onClose}>
                            Cancel
                        </button>

                        <button
                            className="save-transaction-button"
                            type="submit"
                            disabled={formData.currency !== "EGP" && rateStatus !== "ready"}
                        >
                            {editingTransactionId ? "Save changes" : "Save transaction"}
                        </button>
                    </div>
                </div>
                <a className="exchange-rate-attribution" href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer">Rates by ExchangeRate-API</a>
            </form>
        </div>
    );
}

export default TransactionFormModal;
