export const financialData = {
  summary: {
    balance: 24850,
    income: 12500,
    expenses: 7240,
    savings: 5260,
    budget: 10000,
  },

  comparisons: {
    balanceChange: 8.4,
    incomeChange: 5.2,
    expensesChange: 3.1,
    healthImprovement: 6,
  },

  financialHealth: {
    score: 84,
    targetScore: 90,
    status: "Excellent",
  },

  challenge: {
    title: "Restaurant Spending Challenge",
    spent: 680,
    limit: 1000,
    daysRemaining: 12,
    reward: 5,
  },

  spendingCategories: [
    {
      name: "Food",
      amount: 2750,
      percentage: 38,
      icon: "🍔",
    },
    {
      name: "Transport",
      amount: 1520,
      percentage: 21,
      icon: "🚗",
    },
    {
      name: "Shopping",
      amount: 1160,
      percentage: 16,
      icon: "🛍",
    },
    {
      name: "Bills",
      amount: 1010,
      percentage: 14,
      icon: "📱",
    },
    {
      name: "Entertainment",
      amount: 800,
      percentage: 11,
      icon: "🎬",
    },
  ],

  weeklySpending: [
    {
      day: "Saturday",
      amount: 780,
    },
    {
      day: "Sunday",
      amount: 490,
    },
    {
      day: "Monday",
      amount: 320,
    },
    {
      day: "Tuesday",
      amount: 610,
    },
    {
      day: "Wednesday",
      amount: 420,
    },
    {
      day: "Thursday",
      amount: 560,
    },
    {
      day: "Friday",
      amount: 920,
    },
  ],

  monthlySpending: [
    {
      month: "Feb",
      amount: 4600,
    },
    {
      month: "Mar",
      amount: 6200,
    },
    {
      month: "Apr",
      amount: 5300,
    },
    {
      month: "May",
      amount: 7100,
    },
    {
      month: "Jun",
      amount: 6500,
    },
    {
      month: "Jul",
      amount: 7240,
    },
  ],

  yearlySpending: [
    {
      month: "Aug",
      amount: 5100,
    },
    {
      month: "Sep",
      amount: 5800,
    },
    {
      month: "Oct",
      amount: 4950,
    },
    {
      month: "Nov",
      amount: 6700,
    },
    {
      month: "Dec",
      amount: 7600,
    },
    {
      month: "Jan",
      amount: 5600,
    },
    {
      month: "Feb",
      amount: 4600,
    },
    {
      month: "Mar",
      amount: 6200,
    },
    {
      month: "Apr",
      amount: 5300,
    },
    {
      month: "May",
      amount: 7100,
    },
    {
      month: "Jun",
      amount: 6500,
    },
    {
      month: "Jul",
      amount: 7240,
    },
  ],

  recentTransactions: [
    {
      id: 1,
      name: "Netflix",
      category: "Entertainment",
      date: "Today",
      amount: -220,
      icon: "N",
    },
    {
      id: 2,
      name: "Monthly Salary",
      category: "Income",
      date: "Yesterday",
      amount: 12500,
      icon: "S",
    },
    {
      id: 3,
      name: "Coffee Shop",
      category: "Food",
      date: "15 July",
      amount: -145,
      icon: "C",
    },
    {
      id: 4,
      name: "Uber",
      category: "Transport",
      date: "14 July",
      amount: -180,
      icon: "U",
    },
  ],
};

export function formatCurrency(amount) {
  return `EGP ${amount.toLocaleString()}`;
}
