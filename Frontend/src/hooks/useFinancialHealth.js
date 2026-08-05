import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../services/auth";
import { getAnalyticsSummary } from "../services/analytics";
import { calculateFinancialHealthScore } from "../utils/financialHealth";

const PROGRESS_STORAGE_PREFIX = "cashlyChallengeProgress";

function getProgressStorageKey() {
    const currentUser = getCurrentUser();
    const userKey = currentUser?.user_id ?? currentUser?.email ?? "guest";
    return `${PROGRESS_STORAGE_PREFIX}:${userKey}`;
}

function loadProgress() {
    try {
        const saved = localStorage.getItem(getProgressStorageKey());
        const parsed = saved ? JSON.parse(saved) : null;

        return {
            acceptedIds: Array.isArray(parsed?.acceptedIds) ? parsed.acceptedIds : [],
            todayComplete: Boolean(parsed?.todayComplete),
        };
    } catch {
        return { acceptedIds: [], todayComplete: false };
    }
}

function saveProgress(progress) {
    localStorage.setItem(getProgressStorageKey(), JSON.stringify(progress));
}

// The Challenges page's "today's focus" and category suggestions are the
// app's completable challenges today. Building them here (instead of inside
// Challenges.jsx) lets My Day compute the same score without duplicating
// the derivation logic.
function buildChallenges(analytics) {
    const suggestions = (analytics?.category_breakdown || [])
        .slice(0, 3)
        .map((category) => ({
            id: category.name,
            category: category.name,
            signal: `${category.name} is ${category.percent}% of your spending this month.`,
            action: `Try reducing ${category.name.toLowerCase()} by 10%.`,
            saving: Math.round(category.amount * 0.1),
            confidence: `Based on EGP ${Math.round(category.amount).toLocaleString("en-US")} recorded this month`,
        }));

    const focus = suggestions.length
        ? { ...suggestions[0], id: "today-focus" }
        : null;

    return { focus, suggestions };
}

export function useFinancialHealth() {
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(loadProgress);

    useEffect(() => {
        const controller = new AbortController();

        async function loadAnalytics() {
            setIsLoading(true);

            try {
                const summary = await getAnalyticsSummary(controller.signal);
                setAnalytics(summary);
            } catch (error) {
                if (error.name !== "AbortError") console.error("Unable to load financial health data", error);
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        }

        loadAnalytics();

        return () => controller.abort();
    }, []);

    const { focus, suggestions } = useMemo(() => buildChallenges(analytics), [analytics]);

    const total = suggestions.length + (focus ? 1 : 0);
    const completed =
        suggestions.filter((item) => progress.acceptedIds.includes(item.id)).length +
        (focus && progress.todayComplete ? 1 : 0);

    const { score, status } = calculateFinancialHealthScore(completed, total);

    const acceptSuggestion = useCallback((id) => {
        setProgress((current) => {
            if (current.acceptedIds.includes(id)) return current;
            const next = { ...current, acceptedIds: [...current.acceptedIds, id] };
            saveProgress(next);
            return next;
        });
    }, []);

    const toggleTodayComplete = useCallback(() => {
        setProgress((current) => {
            const next = { ...current, todayComplete: !current.todayComplete };
            saveProgress(next);
            return next;
        });
    }, []);

    return {
        analytics,
        isLoading,
        focus,
        suggestions,
        acceptedIds: progress.acceptedIds,
        todayComplete: progress.todayComplete,
        acceptSuggestion,
        toggleTodayComplete,
        completed,
        total,
        score,
        status,
    };
}
