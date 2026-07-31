import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import cashlyLogo from "../assets/cashly-img-removebg-preview.png";
import { logoutUser } from "../services/auth";

import "../styles/Dashboard.css";
import "../styles/Settings.css";


const t = {
    common: {
        cashly: "Cashly", dashboard: "Dashboard", transactions: "Transactions", analytics: "Analytics", challenges: "Challenges", settings: "Settings", logout: "Log out", saveChanges: "Save changes", saved: "Changes saved", comingSoon: "Coming soon", cancel: "Cancel",
    },
    settings: {
        eyebrow: "ACCOUNT CONTROL CENTER", title: "Settings", subtitle: "Manage your profile, preferences, security, and Cashly data.",
        navigation: { profile: "Personal information", language: "Language & region", notifications: "Notifications", appearance: "Appearance", preferences: "Financial preferences", security: "Security", data: "Data management" },
        profile: { title: "Personal information", subtitle: "Keep your account details accurate and up to date.", profileCompletion: "Profile complete", completionHint: "Complete your profile to personalize your Cashly experience.", firstName: "First name", lastName: "Last name", email: "Email", phone: "Phone", birthdate: "Birthdate", gender: "Gender", female: "Female", male: "Male", preferNotToSay: "Prefer not to say", country: "Country" },
        language: { title: "Language & region", subtitle: "Choose how dates, currency, and regional information are displayed.", english: "English", arabic: "Arabic — Coming soon", currency: "Currency", dateFormat: "Date format", monthStart: "Financial month starts on", monthStartHint: "Choose a day between 1 and 28." },
        notifications: { title: "Notifications", subtitle: "Control which Cashly updates you receive.", monthlySummary: "Monthly financial summary", budgetWarnings: "Budget warnings", budgetDescription: "Get notified when spending approaches your limits.", largeTransactions: "Large transaction alerts", challengeReminders: "Challenge reminders", weeklyInsights: "Weekly financial insights", goalUpdates: "Savings goal updates", coachAdvice: "Financial coach advice" },
        appearance: { title: "Appearance", subtitle: "Adjust how Cashly looks and feels.", darkTheme: "Cashly dark theme", darkThemeDescription: "The premium dark theme is currently active.", hideValues: "Hide financial values", hideValuesDescription: "Mask balances and transaction amounts for privacy.", reduceMotion: "Reduce motion", compactLayout: "Compact layout", largerText: "Larger text" },
        preferences: { title: "Financial preferences", subtitle: "Personalize how Cashly supports your financial habits.", primaryGoal: "Primary financial goal", saveMore: "Save more money", controlSpending: "Control spending", emergencyFund: "Build an emergency fund", accurateTracking: "Track spending accurately", completeChallenges: "Complete financial challenges", sensitivity: "Budget warning sensitivity", relaxed: "Relaxed", balanced: "Balanced", strict: "Strict", defaultPayment: "Default payment method", categorySuggestions: "Suggest transaction categories", rememberMerchant: "Remember merchant preferences" },
        security: { title: "Security", subtitle: "Review and strengthen your account protection.", changePassword: "Change password", autoLock: "Automatic app lock", signOutDevices: "Sign out from other devices", twoFactor: "Two-factor authentication", localNotice: "This portfolio version stores settings locally in your browser." },
        data: { title: "Data management", subtitle: "Export, reset, or remove information stored by Cashly.", exportCsv: "Export transactions as CSV", clearTransactions: "Clear transaction history", resetProgress: "Reset financial progress", clearAll: "Clear all Cashly data", clearAllDescription: "Remove all locally stored Cashly information.", confirmationTitle: "Clear all Cashly data?", confirmationText: "This action cannot be undone. Type CLEAR to confirm.", confirmationPlaceholder: "Type CLEAR", clearNow: "Clear data now" },
    },
};

const profileDefaults = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthdate: "",
    gender: "",
    country: "Egypt",
};

const notificationDefaults = {
    monthlySummary: true,
    budgetWarnings: true,
    largeTransactions: true,
    challengeReminders: true,
    weeklyInsights: true,
    goalUpdates: true,
    coachAdvice: true,
};

const appearanceDefaults = {
    hideValues: false,
    reduceMotion: false,
    compactLayout: false,
    largerText: false,
};

const preferenceDefaults = {
    primaryGoal: "saveMore",
    sensitivity: "balanced",
    categorySuggestions: true,
    rememberMerchant: true,
    defaultPayment: "Debit Card",
    financialMonthStart: "1",
    currency: "EGP",
    dateFormat: "DD/MM/YYYY",
};

function loadStoredObject(key, fallback) {
    try {
        const savedValue = localStorage.getItem(key);

        return savedValue
            ? { ...fallback, ...JSON.parse(savedValue) }
            : fallback;
    } catch {
        return fallback;
    }
}

function Toggle({ checked, onChange, label, description }) {
    return (
        <label className="settings-toggle-row">
            <span>
                <strong>{label}</strong>
                {description && <small>{description}</small>}
            </span>

            <button
                type="button"
                className={`settings-switch ${checked ? "active" : ""}`}
                aria-pressed={checked}
                onClick={() => onChange(!checked)}
            >
                <span />
            </button>
        </label>
    );
}

function Settings() {
    const language = "en";
    const setLanguage = () => { };

    const [activeSection, setActiveSection] = useState("profile");
    const [savedMessage, setSavedMessage] = useState("");

    const [profile, setProfile] = useState(() =>
        loadStoredObject("cashlyProfile", profileDefaults)
    );

    const [notifications, setNotifications] = useState(() =>
        loadStoredObject(
            "cashlyNotifications",
            notificationDefaults
        )
    );

    const [appearance, setAppearance] = useState(() =>
        loadStoredObject("cashlyAppearance", appearanceDefaults)
    );

    const [preferences, setPreferences] = useState(() =>
        loadStoredObject(
            "cashlyPreferences",
            preferenceDefaults
        )
    );

    const [showClearModal, setShowClearModal] =
        useState(false);
    const [clearConfirmation, setClearConfirmation] =
        useState("");

    const profileCompletion = useMemo(() => {
        const fields = Object.values(profile);
        const completed = fields.filter(
            (value) => String(value).trim() !== ""
        ).length;

        return Math.round((completed / fields.length) * 100);
    }, [profile]);

    const displayedName =
        [profile.firstName, profile.lastName]
            .filter(Boolean)
            .join(" ") ||
        localStorage.getItem("cashlyUserName") ||
        "Cashly User";

    const firstLetter = displayedName.charAt(0).toUpperCase();

    const navigationItems = [
        ["profile", "◉", t.settings.navigation.profile],
        ["language", "文", t.settings.navigation.language],
        [
            "notifications",
            "◌",
            t.settings.navigation.notifications,
        ],
        [
            "appearance",
            "◐",
            t.settings.navigation.appearance,
        ],
        [
            "preferences",
            "✦",
            t.settings.navigation.preferences,
        ],
        ["security", "◆", t.settings.navigation.security],
        ["data", "⌫", t.settings.navigation.data],
    ];

    function showSavedMessage() {
        setSavedMessage(t.common.saved);

        window.setTimeout(() => {
            setSavedMessage("");
        }, 2600);
    }

    function saveSettings() {
        localStorage.setItem(
            "cashlyProfile",
            JSON.stringify(profile)
        );

        localStorage.setItem(
            "cashlyNotifications",
            JSON.stringify(notifications)
        );

        localStorage.setItem(
            "cashlyAppearance",
            JSON.stringify(appearance)
        );

        localStorage.setItem(
            "cashlyPreferences",
            JSON.stringify(preferences)
        );

        if (profile.firstName.trim()) {
            localStorage.setItem(
                "cashlyUserName",
                [profile.firstName, profile.lastName]
                    .filter(Boolean)
                    .join(" ")
            );
        }

        document.body.classList.toggle(
            "cashly-reduce-motion",
            appearance.reduceMotion
        );

        document.body.classList.toggle(
            "cashly-large-text",
            appearance.largerText
        );

        document.body.classList.toggle(
            "cashly-compact",
            appearance.compactLayout
        );

        showSavedMessage();
    }

    function updateProfile(event) {
        const { name, value } = event.target;

        setProfile((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function exportTransactionsCsv() {
        const rawTransactions =
            localStorage.getItem("cashlyTransactions");

        let transactions = [];

        try {
            transactions = rawTransactions
                ? JSON.parse(rawTransactions)
                : [];
        } catch {
            transactions = [];
        }

        const rows = [
            [
                "Merchant",
                "Category",
                "Amount",
                "Date",
                "Payment",
                "Status",
            ],
            ...transactions.map((transaction) => [
                transaction.merchant || "",
                transaction.category || "",
                transaction.total ||
                transaction.amount ||
                "",
                transaction.date || "",
                transaction.paymentMethod || "",
                transaction.status || "",
            ]),
        ];

        const csvContent = rows
            .map((row) =>
                row
                    .map((value) =>
                        `"${String(value).replaceAll('"', '""')}"`
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "cashly-transactions.csv";
        link.click();

        URL.revokeObjectURL(url);
    }

    function clearTransactionHistory() {
        localStorage.removeItem("cashlyTransactions");
        showSavedMessage();
    }

    function resetFinancialProgress() {
        [
            "cashlyChallengeProgress",
            "cashlyChallenges",
            "cashlyFinancialScore",
            "cashlyAnalytics",
        ].forEach((key) => localStorage.removeItem(key));

        showSavedMessage();
    }

    function clearAllCashlyData() {
        if (clearConfirmation !== "CLEAR") {
            return;
        }

        Object.keys(localStorage)
            .filter((key) => key.startsWith("cashly"))
            .forEach((key) => localStorage.removeItem(key));

        setShowClearModal(false);
        setClearConfirmation("");

        window.location.href = "/login";
    }

    function renderProfileSection() {
        return (
            <>
                <div className="settings-section-heading">
                    <div>
                        <span>01</span>
                        <h2>{t.settings.profile.title}</h2>
                        <p>{t.settings.profile.subtitle}</p>
                    </div>

                    <div className="profile-completion">
                        <strong>{profileCompletion}%</strong>
                        <span>{t.settings.profile.profileCompletion}</span>
                    </div>
                </div>

                <div className="profile-overview-card">
                    <div className="settings-profile-avatar">
                        {firstLetter}
                    </div>

                    <div>
                        <h3>{displayedName}</h3>
                        <p>
                            {profile.email || "your@email.com"}
                        </p>
                    </div>

                    <div className="profile-progress-shell">
                        <div
                            className="profile-progress-fill"
                            style={{ width: `${profileCompletion}%` }}
                        />
                    </div>

                    <small>
                        {t.settings.profile.completionHint}
                    </small>
                </div>

                <div className="settings-form-grid">
                    <label>
                        <span>{t.settings.profile.firstName}</span>
                        <input
                            name="firstName"
                            value={profile.firstName}
                            onChange={updateProfile}
                        />
                    </label>

                    <label>
                        <span>{t.settings.profile.lastName}</span>
                        <input
                            name="lastName"
                            value={profile.lastName}
                            onChange={updateProfile}
                        />
                    </label>

                    <label>
                        <span>{t.settings.profile.email}</span>
                        <input
                            name="email"
                            type="email"
                            value={profile.email}
                            onChange={updateProfile}
                        />
                    </label>

                    <label>
                        <span>{t.settings.profile.phone}</span>
                        <input
                            name="phone"
                            type="tel"
                            value={profile.phone}
                            onChange={updateProfile}
                        />
                    </label>

                    <label>
                        <span>{t.settings.profile.birthdate}</span>
                        <input
                            name="birthdate"
                            type="date"
                            value={profile.birthdate}
                            onChange={updateProfile}
                        />
                    </label>

                    <label>
                        <span>{t.settings.profile.gender}</span>
                        <select
                            name="gender"
                            value={profile.gender}
                            onChange={updateProfile}
                        >
                            <option value="">—</option>
                            <option value="female">
                                {t.settings.profile.female}
                            </option>
                            <option value="male">
                                {t.settings.profile.male}
                            </option>
                            <option value="prefer-not">
                                {t.settings.profile.preferNotToSay}
                            </option>
                        </select>
                    </label>

                    <label className="settings-wide-field">
                        <span>{t.settings.profile.country}</span>
                        <select
                            name="country"
                            value={profile.country}
                            onChange={updateProfile}
                        >
                            <option value="Egypt">Egypt</option>
                            <option value="Saudi Arabia">
                                Saudi Arabia
                            </option>
                            <option value="United Arab Emirates">
                                United Arab Emirates
                            </option>
                            <option value="United Kingdom">
                                United Kingdom
                            </option>
                            <option value="United States">
                                United States
                            </option>
                        </select>
                    </label>
                </div>
            </>
        );
    }

    function renderLanguageSection() {
        return (
            <>
                <div className="settings-section-heading">
                    <div>
                        <span>02</span>
                        <h2>{t.settings.language.title}</h2>
                        <p>{t.settings.language.subtitle}</p>
                    </div>
                </div>

                <div className="language-choice-grid">
                    <button
                        type="button"
                        className={
                            language === "en" ? "selected" : ""
                        }
                        onClick={() => setLanguage("en")}
                    >
                        <span>EN</span>
                        <strong>
                            {t.settings.language.english}
                        </strong>
                        <small>Left-to-right</small>
                    </button>

                    <button
                        type="button"
                        className="language-disabled"
                        disabled
                        aria-disabled="true"
                    >
                        <span>AR</span>
                        <strong>
                            {t.settings.language.arabic}
                        </strong>
                        <small>من اليمين إلى اليسار</small>
                    </button>
                </div>

                <div className="settings-form-grid">
                    <label>
                        <span>{t.settings.language.currency}</span>
                        <select
                            value={preferences.currency}
                            onChange={(event) =>
                                setPreferences((current) => ({
                                    ...current,
                                    currency: event.target.value,
                                }))
                            }
                        >
                            <option value="EGP">
                                EGP — Egyptian Pound
                            </option>
                            <option value="USD">
                                USD — US Dollar
                            </option>
                            <option value="EUR">EUR — Euro</option>
                            <option value="GBP">
                                GBP — British Pound
                            </option>
                            <option value="SAR">
                                SAR — Saudi Riyal
                            </option>
                            <option value="AED">
                                AED — UAE Dirham
                            </option>
                        </select>
                    </label>

                    <label>
                        <span>{t.settings.language.dateFormat}</span>
                        <select
                            value={preferences.dateFormat}
                            onChange={(event) =>
                                setPreferences((current) => ({
                                    ...current,
                                    dateFormat: event.target.value,
                                }))
                            }
                        >
                            <option value="DD/MM/YYYY">
                                DD/MM/YYYY
                            </option>
                            <option value="MM/DD/YYYY">
                                MM/DD/YYYY
                            </option>
                            <option value="YYYY-MM-DD">
                                YYYY-MM-DD
                            </option>
                        </select>
                    </label>

                    <label className="settings-wide-field">
                        <span>{t.settings.language.monthStart}</span>
                        <input
                            type="number"
                            min="1"
                            max="28"
                            value={preferences.financialMonthStart}
                            onChange={(event) =>
                                setPreferences((current) => ({
                                    ...current,
                                    financialMonthStart:
                                        event.target.value,
                                }))
                            }
                        />
                        <small>
                            {t.settings.language.monthStartHint}
                        </small>
                    </label>
                </div>
            </>
        );
    }

    function renderNotificationsSection() {
        const notificationRows = [
            ["monthlySummary", t.settings.notifications.monthlySummary],
            [
                "budgetWarnings",
                t.settings.notifications.budgetWarnings,
                t.settings.notifications.budgetDescription,
            ],
            [
                "largeTransactions",
                t.settings.notifications.largeTransactions,
            ],
            [
                "challengeReminders",
                t.settings.notifications.challengeReminders,
            ],
            ["weeklyInsights", t.settings.notifications.weeklyInsights],
            ["goalUpdates", t.settings.notifications.goalUpdates],
            ["coachAdvice", t.settings.notifications.coachAdvice],
        ];

        return (
            <>
                <div className="settings-section-heading">
                    <div>
                        <span>03</span>
                        <h2>{t.settings.notifications.title}</h2>
                        <p>{t.settings.notifications.subtitle}</p>
                    </div>
                </div>

                <div className="settings-toggle-list">
                    {notificationRows.map(
                        ([key, label, description]) => (
                            <Toggle
                                key={key}
                                checked={notifications[key]}
                                onChange={(checked) =>
                                    setNotifications((current) => ({
                                        ...current,
                                        [key]: checked,
                                    }))
                                }
                                label={label}
                                description={description}
                            />
                        )
                    )}
                </div>
            </>
        );
    }

    function renderAppearanceSection() {
        return (
            <>
                <div className="settings-section-heading">
                    <div>
                        <span>04</span>
                        <h2>{t.settings.appearance.title}</h2>
                        <p>{t.settings.appearance.subtitle}</p>
                    </div>
                </div>

                <div className="theme-preview-card">
                    <div className="theme-preview-icon">◐</div>
                    <div>
                        <strong>{t.settings.appearance.darkTheme}</strong>
                        <p>
                            {t.settings.appearance.darkThemeDescription}
                        </p>
                    </div>
                    <span>ACTIVE</span>
                </div>

                <div className="settings-toggle-list">
                    <Toggle
                        checked={appearance.hideValues}
                        onChange={(checked) =>
                            setAppearance((current) => ({
                                ...current,
                                hideValues: checked,
                            }))
                        }
                        label={t.settings.appearance.hideValues}
                        description={
                            t.settings.appearance.hideValuesDescription
                        }
                    />

                    <Toggle
                        checked={appearance.reduceMotion}
                        onChange={(checked) =>
                            setAppearance((current) => ({
                                ...current,
                                reduceMotion: checked,
                            }))
                        }
                        label={t.settings.appearance.reduceMotion}
                    />

                    <Toggle
                        checked={appearance.compactLayout}
                        onChange={(checked) =>
                            setAppearance((current) => ({
                                ...current,
                                compactLayout: checked,
                            }))
                        }
                        label={t.settings.appearance.compactLayout}
                    />

                    <Toggle
                        checked={appearance.largerText}
                        onChange={(checked) =>
                            setAppearance((current) => ({
                                ...current,
                                largerText: checked,
                            }))
                        }
                        label={t.settings.appearance.largerText}
                    />
                </div>
            </>
        );
    }

    function renderPreferencesSection() {
        return (
            <>
                <div className="settings-section-heading">
                    <div>
                        <span>05</span>
                        <h2>{t.settings.preferences.title}</h2>
                        <p>{t.settings.preferences.subtitle}</p>
                    </div>
                </div>

                <div className="settings-form-grid">
                    <label className="settings-wide-field">
                        <span>
                            {t.settings.preferences.primaryGoal}
                        </span>
                        <select
                            value={preferences.primaryGoal}
                            onChange={(event) =>
                                setPreferences((current) => ({
                                    ...current,
                                    primaryGoal: event.target.value,
                                }))
                            }
                        >
                            <option value="saveMore">
                                {t.settings.preferences.saveMore}
                            </option>
                            <option value="controlSpending">
                                {t.settings.preferences.controlSpending}
                            </option>
                            <option value="emergencyFund">
                                {t.settings.preferences.emergencyFund}
                            </option>
                            <option value="accurateTracking">
                                {t.settings.preferences.accurateTracking}
                            </option>
                            <option value="completeChallenges">
                                {t.settings.preferences.completeChallenges}
                            </option>
                        </select>
                    </label>

                    <label>
                        <span>{t.settings.preferences.sensitivity}</span>
                        <select
                            value={preferences.sensitivity}
                            onChange={(event) =>
                                setPreferences((current) => ({
                                    ...current,
                                    sensitivity: event.target.value,
                                }))
                            }
                        >
                            <option value="relaxed">
                                {t.settings.preferences.relaxed}
                            </option>
                            <option value="balanced">
                                {t.settings.preferences.balanced}
                            </option>
                            <option value="strict">
                                {t.settings.preferences.strict}
                            </option>
                        </select>
                    </label>

                    <label>
                        <span>{t.settings.preferences.defaultPayment}</span>
                        <select
                            value={preferences.defaultPayment}
                            onChange={(event) =>
                                setPreferences((current) => ({
                                    ...current,
                                    defaultPayment: event.target.value,
                                }))
                            }
                        >
                            <option>Debit Card</option>
                            <option>Credit Card</option>
                            <option>Cash</option>
                            <option>Bank Transfer</option>
                            <option>Digital Wallet</option>
                        </select>
                    </label>
                </div>

                <div className="settings-toggle-list settings-toggle-list-spaced">
                    <Toggle
                        checked={preferences.categorySuggestions}
                        onChange={(checked) =>
                            setPreferences((current) => ({
                                ...current,
                                categorySuggestions: checked,
                            }))
                        }
                        label={
                            t.settings.preferences.categorySuggestions
                        }
                    />

                    <Toggle
                        checked={preferences.rememberMerchant}
                        onChange={(checked) =>
                            setPreferences((current) => ({
                                ...current,
                                rememberMerchant: checked,
                            }))
                        }
                        label={t.settings.preferences.rememberMerchant}
                    />
                </div>
            </>
        );
    }

    function renderSecuritySection() {
        return (
            <>
                <div className="settings-section-heading">
                    <div>
                        <span>06</span>
                        <h2>{t.settings.security.title}</h2>
                        <p>{t.settings.security.subtitle}</p>
                    </div>
                </div>

                <div className="security-action-grid">
                    {[
                        t.settings.security.changePassword,
                        t.settings.security.autoLock,
                        t.settings.security.signOutDevices,
                        t.settings.security.twoFactor,
                    ].map((item) => (
                        <button type="button" key={item}>
                            <span>◆</span>
                            <div>
                                <strong>{item}</strong>
                                <small>{t.common.comingSoon}</small>
                            </div>
                            <b>›</b>
                        </button>
                    ))}
                </div>

                <div className="settings-information-note">
                    <span>i</span>
                    <p>{t.settings.security.localNotice}</p>
                </div>
            </>
        );
    }

    function renderDataSection() {
        return (
            <>
                <div className="settings-section-heading">
                    <div>
                        <span>07</span>
                        <h2>{t.settings.data.title}</h2>
                        <p>{t.settings.data.subtitle}</p>
                    </div>
                </div>

                <div className="data-action-list">
                    <button
                        type="button"
                        onClick={exportTransactionsCsv}
                    >
                        <span>⇩</span>
                        <div>
                            <strong>{t.settings.data.exportCsv}</strong>
                            <small>cashly-transactions.csv</small>
                        </div>
                        <b>Export</b>
                    </button>

                    <button
                        type="button"
                        onClick={clearTransactionHistory}
                    >
                        <span>⌫</span>
                        <div>
                            <strong>
                                {t.settings.data.clearTransactions}
                            </strong>
                            <small>Profile settings are preserved</small>
                        </div>
                        <b>Clear</b>
                    </button>

                    <button
                        type="button"
                        onClick={resetFinancialProgress}
                    >
                        <span>↺</span>
                        <div>
                            <strong>{t.settings.data.resetProgress}</strong>
                            <small>
                                Challenges, score, and analytics
                            </small>
                        </div>
                        <b>Reset</b>
                    </button>

                    <button
                        type="button"
                        className="danger-data-action"
                        onClick={() => setShowClearModal(true)}
                    >
                        <span>!</span>
                        <div>
                            <strong>{t.settings.data.clearAll}</strong>
                            <small>
                                {t.settings.data.clearAllDescription}
                            </small>
                        </div>
                        <b>Delete</b>
                    </button>
                </div>
            </>
        );
    }

    const sectionRenderers = {
        profile: renderProfileSection,
        language: renderLanguageSection,
        notifications: renderNotificationsSection,
        appearance: renderAppearanceSection,
        preferences: renderPreferencesSection,
        security: renderSecuritySection,
        data: renderDataSection,
    };

    return (
        <div className="dashboard-page settings-page">
            <aside className="dashboard-sidebar">
                <div className="sidebar-logo">
                    <img src={cashlyLogo} alt="Cashly Logo" />
                    <h2>{t.common.cashly}</h2>
                </div>

                <nav className="sidebar-menu">
                    <Link className="sidebar-link" to="/dashboard">
                        <span>⌂</span>
                        {t.common.dashboard}
                    </Link>

                    <Link
                        className="sidebar-link"
                        to="/transactions"
                    >
                        <span>↔</span>
                        {t.common.transactions}
                    </Link>

                    <Link className="sidebar-link" to="/analytics">
                        <span>◫</span>
                        {t.common.analytics}
                    </Link>

                    <Link
                        className="sidebar-link"
                        to="/challenges"
                    >
                        <span>★</span>
                        {t.common.challenges}
                    </Link>

                    <Link
                        className="sidebar-link active"
                        to="/settings"
                    >
                        <span>⚙</span>
                        {t.common.settings}
                    </Link>
                </nav>

                <Link className="logout-link" to="/login" onClick={logoutUser}>
                    <span>←</span>
                    {t.common.logout}
                </Link>
            </aside>

            <main className="dashboard-main settings-main">
                <header className="settings-page-header">
                    <div>
                        <span className="settings-eyebrow">
                            {t.settings.eyebrow}
                        </span>
                        <h1>{t.settings.title}</h1>
                        <p>{t.settings.subtitle}</p>
                    </div>

                    <div className="settings-header-actions">
                        {savedMessage && (
                            <span className="settings-save-message">
                                ✓ {savedMessage}
                            </span>
                        )}

                        <button
                            type="button"
                            className="settings-save-button"
                            onClick={saveSettings}
                        >
                            {t.common.saveChanges}
                        </button>
                    </div>
                </header>

                <div className="settings-layout">
                    <aside className="settings-inner-navigation">
                        <span className="settings-nav-label">
                            ACCOUNT SETTINGS
                        </span>

                        {navigationItems.map(
                            ([key, icon, label]) => (
                                <button
                                    type="button"
                                    key={key}
                                    className={
                                        activeSection === key ? "active" : ""
                                    }
                                    onClick={() => setActiveSection(key)}
                                >
                                    <span>{icon}</span>
                                    {label}
                                </button>
                            )
                        )}
                    </aside>

                    <section className="settings-content-card">
                        {sectionRenderers[activeSection]()}
                    </section>
                </div>
            </main>

            {showClearModal && (
                <div
                    className="settings-modal-overlay"
                    onClick={() => setShowClearModal(false)}
                >
                    <div
                        className="settings-danger-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="danger-modal-icon">!</div>

                        <h2>{t.settings.data.confirmationTitle}</h2>
                        <p>{t.settings.data.confirmationText}</p>

                        <input
                            value={clearConfirmation}
                            placeholder={
                                t.settings.data.confirmationPlaceholder
                            }
                            onChange={(event) =>
                                setClearConfirmation(event.target.value)
                            }
                        />

                        <div>
                            <button
                                type="button"
                                className="danger-modal-cancel"
                                onClick={() => setShowClearModal(false)}
                            >
                                {t.common.cancel}
                            </button>

                            <button
                                type="button"
                                className="danger-modal-confirm"
                                disabled={clearConfirmation !== "CLEAR"}
                                onClick={clearAllCashlyData}
                            >
                                {t.settings.data.clearNow}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;
