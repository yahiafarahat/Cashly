const PROFILE_STORAGE_KEY = "cashlyProfile";

// Reads the Monthly Income saved from Settings → Personal Information.
// Returns null when it hasn't been entered yet (or is invalid) so callers
// can fall back to a placeholder instead of showing a bogus balance.
export function getMonthlyIncome() {
    try {
        const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (!saved) return null;

        const income = Number(JSON.parse(saved)?.monthlyIncome);

        return Number.isFinite(income) && income >= 0 ? income : null;
    } catch {
        return null;
    }
}
