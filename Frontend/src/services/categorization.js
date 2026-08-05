import { getAccessToken } from "./auth";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

// Below this length there isn't enough signal in the text to predict
// anything meaningful (and it avoids firing a request after a single keystroke).
const MINIMUM_DESCRIPTION_LENGTH = 3;

/**
 * Predicts the most likely transaction category for a free-text description
 * by calling the backend's /categorization/predict endpoint (a scikit-learn
 * TF-IDF + LogisticRegression model trained offline — see
 * Backend/scripts/train_categorization_model.py — not an LLM).
 *
 * This is the single categorization entry point shared by every place a
 * transaction can be added — the Transactions page and My Day's Add
 * Transaction modal both go through TransactionFormModal, which is the
 * only caller of this function. Any future entry point that reuses
 * TransactionFormModal gets categorization for free.
 *
 * @param {string} description
 * @returns {Promise<{ category: string, confidence: number } | null>}
 */
export async function predictCategory(description) {
    const trimmedDescription = (description || "").trim();

    if (trimmedDescription.length < MINIMUM_DESCRIPTION_LENGTH) {
        return null;
    }

    const token = getAccessToken();

    if (!token) {
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/categorization/predict`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ description: trimmedDescription })
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        if (!data?.category) {
            return null;
        }

        return { category: data.category, confidence: data.confidence };
    } catch (error) {
        console.error("Unable to predict transaction category", error);
        return null;
    }
}
