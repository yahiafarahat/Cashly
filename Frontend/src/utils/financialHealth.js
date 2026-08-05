// Reusable Financial Health scoring logic. Kept isolated from any component
// so the My Day and Challenges pages can share one source of truth, and so
// the formula can later grow to weigh in other factors (spending habits,
// budget adherence, savings goals, ...) without touching the UI.

const STATUS_TIERS = [
    { minScore: 90, status: "Excellent" },
    { minScore: 75, status: "Good" },
    { minScore: 50, status: "Fair" },
    { minScore: 0, status: "Needs Attention" },
];

export function getFinancialHealthStatus(score) {
    return STATUS_TIERS.find((tier) => score >= tier.minScore).status;
}

export function calculateFinancialHealthScore(completedChallenges, totalChallenges) {
    const total = Number(totalChallenges) || 0;
    const completed = Math.max(0, Math.min(Number(completedChallenges) || 0, total));
    const rawScore = total > 0 ? (completed / total) * 100 : 0;
    const score = Math.max(0, Math.min(100, Math.round(rawScore)));

    return { score, status: getFinancialHealthStatus(score) };
}
