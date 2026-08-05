"""
Trains the transaction-category classifier and serializes it to
Backend/app/models/transaction_categorizer.joblib, which
app/categorization_service.py loads at server startup.

Model: TF-IDF (word 1-2 grams) -> LogisticRegression(class_weight="balanced").
Not an LLM — a standard, well-supported scikit-learn text-classification
pipeline. LogisticRegression was chosen over Naive Bayes specifically
because it copes far better with imbalanced classes (real problem hit by
an earlier Naive Bayes prototype: categories with much more training data
swamped categories with less, via Naive Bayes's shared vocabulary and
Laplace smoothing). `class_weight="balanced"` reweights the loss per class
directly, so class-size imbalance no longer needs manual capping/balancing
of the training set — the classes below vary quite a bit in size on purpose.

Training data:
  - HAND_WRITTEN_EXAMPLES below: curated examples, including some for
    categories the public dataset doesn't have equivalents for (Groceries,
    Fashion, Beauty & Personal Care, Fuel & Car, Education, Subscriptions).
  - Real transaction descriptions streamed from the (gated) Hugging Face
    dataset mitulshah/transaction-categorization, mapped onto our category
    taxonomy. Requires `huggingface-cli login` once (see requirements-train.txt).

Setup (one-time):
    1. Accept the dataset's terms at
       https://huggingface.co/datasets/mitulshah/transaction-categorization
    2. huggingface-cli login          (or set HF_TOKEN)
    3. pip install -r requirements-train.txt

Run from this scripts/ directory:
    python train_categorization_model.py
"""

import itertools
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

from datasets import load_dataset
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
import joblib

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

DATASET_NAME = "mitulshah/transaction-categorization"
MODEL_OUTPUT_PATH = Path(__file__).resolve().parent.parent / "app" / "models" / "transaction_categorizer.joblib"

APP_CATEGORIES = [
    "Groceries", "Dining & Coffee", "Transportation", "Fashion", "Shopping",
    "Beauty & Personal Care", "Fuel & Car", "Bills & Utilities", "Entertainment",
    "Healthcare", "Education", "Transfers", "Subscriptions", "Other",
]

# Curated examples, notably including the categories the HF dataset has no
# equivalent for (it only has 10 categories; we have 14). Also includes
# examples already pulled from the dataset in an earlier iteration, kept
# here since they're already validated.
HAND_WRITTEN_EXAMPLES = json.loads((Path(__file__).parent / "hand_written_examples.json").read_text(encoding="utf-8"))

# How many additional examples to pull per category from the dataset.
# Unlike the earlier browser-side attempt, there's no bundle-size or
# in-browser-training-time constraint here, so this can be generous —
# class_weight="balanced" means more data for one category doesn't hurt
# the others the way it did with the old Naive Bayes approach.
EXAMPLES_PER_CATEGORY_FROM_DATASET = 4000
MAX_ROWS_TO_SCAN = 1_000_000

EXACT_LABEL_MAP = {
    "groceries": "Groceries",
    "grocery": "Groceries",
    "dining": "Dining & Coffee",
    "restaurants": "Dining & Coffee",
    "restaurant": "Dining & Coffee",
    "food & dining": "Dining & Coffee",
    "food and dining": "Dining & Coffee",
    "transportation": "Transportation",
    "travel": "Transportation",
    "transport": "Transportation",
    "fuel": "Fuel & Car",
    "gas": "Fuel & Car",
    "automotive": "Fuel & Car",
    "shopping": "Shopping",
    "retail": "Shopping",
    "fashion": "Fashion",
    "clothing": "Fashion",
    "personal care": "Beauty & Personal Care",
    "beauty": "Beauty & Personal Care",
    "bills": "Bills & Utilities",
    "utilities": "Bills & Utilities",
    "bills & utilities": "Bills & Utilities",
    "rent": "Bills & Utilities",
    "entertainment": "Entertainment",
    "healthcare": "Healthcare",
    "health": "Healthcare",
    "medical": "Healthcare",
    "education": "Education",
    "transfer": "Transfers",
    "transfers": "Transfers",
    "income": "Transfers",
    "salary": "Transfers",
    "subscriptions": "Subscriptions",
    "subscription": "Subscriptions",
    "other": "Other",
    "miscellaneous": "Other",
    "misc": "Other",
    "financial services": "Other",
    "government & legal": "Other",
    "charity & donations": "Other",
}

KEYWORD_FALLBACK = [
    ("Groceries", ["grocer", "supermarket"]),
    ("Dining & Coffee", ["dining", "restaurant", "food", "coffee", "cafe"]),
    ("Transportation", ["transport", "travel", "flight", "uber", "taxi", "ride"]),
    ("Fuel & Car", ["fuel", "gas station", "automotive", "car "]),
    ("Fashion", ["fashion", "cloth", "apparel"]),
    ("Shopping", ["shop", "retail"]),
    ("Beauty & Personal Care", ["beauty", "personal care", "salon", "spa"]),
    ("Bills & Utilities", ["bill", "utilit", "rent", "electric", "water", "internet"]),
    ("Entertainment", ["entertain", "movie", "cinema", "game", "music"]),
    ("Healthcare", ["health", "medical", "doctor", "pharmacy", "hospital"]),
    ("Education", ["educat", "school", "tuition", "course"]),
    ("Transfers", ["transfer", "salary", "income", "payroll"]),
    ("Subscriptions", ["subscrip", "membership"]),
]


def normalize_label(label):
    return re.sub(r"\s+", " ", str(label).strip().lower())


def map_category(source_label):
    normalized = normalize_label(source_label)

    if normalized in EXACT_LABEL_MAP:
        return EXACT_LABEL_MAP[normalized]

    for app_category, keywords in KEYWORD_FALLBACK:
        if any(keyword in normalized for keyword in keywords):
            return app_category

    return None


def find_column(column_names, candidates):
    lowered = {name.lower(): name for name in column_names}
    for candidate in candidates:
        if candidate in lowered:
            return lowered[candidate]
    return None


def collect_dataset_examples():
    print(f"Loading {DATASET_NAME} (streaming — no full download)...")
    dataset = load_dataset(DATASET_NAME, split="train", streaming=True)

    dataset_iterator = iter(dataset)
    first_row = next(dataset_iterator)
    column_names = list(first_row.keys())
    print(f"Columns: {column_names}")

    description_column = find_column(column_names, ["description", "text", "merchant", "transaction_description"])
    category_column = find_column(column_names, ["category", "label", "class"])

    if not description_column or not category_column:
        raise SystemExit(
            f"Could not auto-detect description/category columns from {column_names}. "
            "Edit find_column()'s candidate lists to match the real names, then re-run."
        )

    print(f"Using description column '{description_column}', category column '{category_column}'")

    examples_by_category = defaultdict(list)
    seen_by_category = defaultdict(set)
    unmapped_labels = defaultdict(int)
    rows_scanned = 0
    # Only these categories can ever be filled from the dataset — the rest
    # (Groceries, Fashion, Beauty & Personal Care, Fuel & Car, Education,
    # Subscriptions) have no equivalent source label, so they'd never
    # trigger the early-stop and we'd always scan MAX_ROWS_TO_SCAN for nothing.
    mappable_categories = set(EXACT_LABEL_MAP.values())

    for row in itertools.chain([first_row], dataset_iterator):
        rows_scanned += 1

        if rows_scanned > MAX_ROWS_TO_SCAN:
            print(f"Stopping after scanning {MAX_ROWS_TO_SCAN:,} rows.")
            break

        if all(len(examples_by_category[c]) >= EXAMPLES_PER_CATEGORY_FROM_DATASET for c in mappable_categories):
            print(f"All fillable category quotas reached after scanning {rows_scanned:,} rows.")
            break

        description = str(row.get(description_column, "")).strip()
        source_label = row.get(category_column)

        if not description or source_label is None:
            continue

        app_category = map_category(source_label)

        if app_category is None:
            unmapped_labels[str(source_label)] += 1
            continue

        if len(examples_by_category[app_category]) >= EXAMPLES_PER_CATEGORY_FROM_DATASET:
            continue

        normalized_description = description.lower()
        if normalized_description in seen_by_category[app_category]:
            continue

        seen_by_category[app_category].add(normalized_description)
        examples_by_category[app_category].append(description)

    if unmapped_labels:
        print("\nSource labels not mapped to any app category:")
        for label, count in sorted(unmapped_labels.items(), key=lambda item: -item[1])[:20]:
            print(f"  {label!r}: {count} rows")

    return examples_by_category


def build_training_set():
    dataset_examples = collect_dataset_examples()

    descriptions = []
    labels = []
    counts = {}

    for category in APP_CATEGORIES:
        hand_written = HAND_WRITTEN_EXAMPLES.get(category, [])
        from_dataset = dataset_examples.get(category, [])

        seen = {example.lower() for example in hand_written}
        combined = list(hand_written)
        for example in from_dataset:
            if example.lower() not in seen:
                seen.add(example.lower())
                combined.append(example)

        counts[category] = {"hand_written": len(hand_written), "from_dataset": len(from_dataset), "total": len(combined)}
        descriptions.extend(combined)
        labels.extend([category] * len(combined))

    print("\nFinal training set per category:")
    for category, count in counts.items():
        print(f"  {category:<24} hand-written: {count['hand_written']:>5}  +dataset: {count['from_dataset']:>5}  = {count['total']:>5}")
    print(f"\nTotal examples: {len(descriptions)}")

    return descriptions, labels


def main():
    descriptions, labels = build_training_set()

    X_train, X_test, y_train, y_test = train_test_split(
        descriptions, labels, test_size=0.15, random_state=42, stratify=labels
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True, lowercase=True)),
        ("classifier", LogisticRegression(class_weight="balanced", max_iter=2000, C=5.0)),
    ])

    print("\nTraining on held-out split to measure real accuracy...")
    pipeline.fit(X_train, y_train)
    predictions = pipeline.predict(X_test)
    print(f"\nHeld-out accuracy: {(predictions == y_test).mean():.1%}\n")
    print(classification_report(y_test, predictions, zero_division=0))

    print("Refitting on the full dataset for the shipped model...")
    pipeline.fit(descriptions, labels)

    MODEL_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_OUTPUT_PATH)
    print(f"\nWrote {MODEL_OUTPUT_PATH}")


if __name__ == "__main__":
    main()
