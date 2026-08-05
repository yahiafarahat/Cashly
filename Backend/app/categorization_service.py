from pathlib import Path

import joblib

MODEL_PATH = Path(__file__).resolve().parent / "models" / "transaction_categorizer.joblib"

# Loaded once at import time (module-level singleton) and reused for every
# request — this is a scikit-learn Pipeline (TF-IDF -> LogisticRegression),
# not an LLM. Retrain it with Backend/scripts/train_categorization_model.py.
_pipeline = None


class CategorizationModelNotAvailable(Exception):
    """Raised when the trained model file is missing."""


def _get_pipeline():
    global _pipeline

    if _pipeline is None:
        if not MODEL_PATH.exists():
            raise CategorizationModelNotAvailable(
                f"No trained model at {MODEL_PATH}. Run "
                "Backend/scripts/train_categorization_model.py first."
            )

        _pipeline = joblib.load(MODEL_PATH)

    return _pipeline


def predict_category(description: str):
    """Predicts the most likely transaction category for a description.

    Returns {"category": str, "confidence": float} or None if the
    description is too short to carry any signal.
    """
    trimmed = (description or "").strip()

    if len(trimmed) < 3:
        return None

    pipeline = _get_pipeline()

    probabilities = pipeline.predict_proba([trimmed])[0]
    best_index = probabilities.argmax()

    return {
        "category": pipeline.classes_[best_index],
        "confidence": float(probabilities[best_index]),
    }
