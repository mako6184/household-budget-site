// Kakeibo Ledger — the household's own data.
//
// data.js holds only data: the categories, one realistic month of seed
// transactions, the monthly budgets, the savings goals, six months of
// history for the trend chart, and the national reference figures shown
// on the Insights page. Nothing here touches the page or storage; that
// is store.js's job.

export const APP_NAME = 'Kakeibo Ledger';
export const HOUSEHOLD = 'The Sato household · two people · Tokyo';
export const CURRENT_MONTH = '2026-11';

// Spending categories. Each has a colour used by the charts and the
// category dots, and a short line saying what belongs in it.
export const CATEGORIES = [
  { id: 'housing', label: 'Housing', colour: '#2e6f5e', about: 'Rent, repairs and home upkeep' },
  { id: 'food', label: 'Food', colour: '#c65a2e', about: 'Groceries and eating out' },
  { id: 'utilities', label: 'Utilities', colour: '#d9a441', about: 'Electricity, gas, water, phone and internet' },
  { id: 'transport', label: 'Transport', colour: '#4a7fb5', about: 'Trains, buses, taxis and fuel' },
  { id: 'health', label: 'Health', colour: '#8a6fb8', about: 'Doctor, dentist, pharmacy and gym' },
  { id: 'clothing', label: 'Clothing', colour: '#b8577a', about: 'Clothes and shoes' },
  { id: 'entertainment', label: 'Entertainment', colour: '#5b8a6a', about: 'Films, concerts, books for fun and hobbies' },
  { id: 'education', label: 'Education', colour: '#7a6a53', about: 'Courses, lessons and study books' },
  { id: 'other', label: 'Other', colour: '#8a8a7a', about: 'Everything that fits nowhere else' },
];

export const INCOME_LABEL = 'Income';

// A realistic November for a two-person household. Amounts are yen.
// id, date, kind ('expense' or 'income'), category, note, amount.
export const SEED_TRANSACTIONS = [
  { id: 't01', date: '2026-11-01', kind: 'expense', category: 'housing', note: 'Monthly rent', amount: 98000 },
  { id: 't02', date: '2026-11-01', kind: 'expense', category: 'utilities', note: 'Electricity bill (October use)', amount: 8420 },
  { id: 't03', date: '2026-11-02', kind: 'expense', category: 'food', note: 'Supermarket — weekly shop', amount: 6840 },
  { id: 't04', date: '2026-11-03', kind: 'expense', category: 'transport', note: 'Train pass top-up', amount: 5000 },
  { id: 't05', date: '2026-11-03', kind: 'expense', category: 'food', note: 'Bakery and coffee', amount: 1280 },
  { id: 't06', date: '2026-11-04', kind: 'expense', category: 'utilities', note: 'Gas bill', amount: 4180 },
  { id: 't07', date: '2026-11-05', kind: 'expense', category: 'food', note: 'Supermarket — weekly shop', amount: 7920 },
  { id: 't08', date: '2026-11-06', kind: 'expense', category: 'food', note: 'Lunch out with a friend', amount: 2400 },
  { id: 't09', date: '2026-11-07', kind: 'expense', category: 'entertainment', note: 'Cinema tickets × 2', amount: 3600 },
  { id: 't10', date: '2026-11-08', kind: 'expense', category: 'health', note: 'Pharmacy — cold medicine', amount: 2850 },
  { id: 't11', date: '2026-11-09', kind: 'expense', category: 'food', note: 'Supermarket — weekly shop', amount: 5610 },
  { id: 't12', date: '2026-11-10', kind: 'income', category: 'income', note: 'Freelance payout', amount: 32000 },
  { id: 't13', date: '2026-11-10', kind: 'expense', category: 'utilities', note: 'Water bill', amount: 5230 },
  { id: 't14', date: '2026-11-11', kind: 'expense', category: 'utilities', note: 'Internet (monthly)', amount: 5940 },
  { id: 't15', date: '2026-11-12', kind: 'expense', category: 'clothing', note: 'Winter jumper and socks', amount: 7900 },
  { id: 't16', date: '2026-11-13', kind: 'expense', category: 'food', note: 'Dinner out — anniversary', amount: 4800 },
  { id: 't17', date: '2026-11-14', kind: 'expense', category: 'food', note: 'Supermarket — weekly shop', amount: 8150 },
  { id: 't18', date: '2026-11-15', kind: 'expense', category: 'utilities', note: 'Mobile phone (two lines)', amount: 7320 },
  { id: 't19', date: '2026-11-16', kind: 'expense', category: 'education', note: 'Cookbook and novels', amount: 2300 },
  { id: 't20', date: '2026-11-17', kind: 'expense', category: 'food', note: 'Supermarket — weekly shop', amount: 6430 },
  { id: 't21', date: '2026-11-18', kind: 'expense', category: 'health', note: 'Gym membership (monthly)', amount: 8800 },
  { id: 't22', date: '2026-11-19', kind: 'expense', category: 'transport', note: 'Taxi home, late night', amount: 1900 },
  { id: 't23', date: '2026-11-20', kind: 'expense', category: 'food', note: 'Supermarket — weekly shop', amount: 7260 },
  { id: 't24', date: '2026-11-21', kind: 'expense', category: 'entertainment', note: 'Concert tickets × 2', amount: 9500 },
  { id: 't25', date: '2026-11-22', kind: 'expense', category: 'health', note: 'Dentist check-up', amount: 3200 },
  { id: 't26', date: '2026-11-23', kind: 'expense', category: 'food', note: 'Supermarket — weekly shop', amount: 9120 },
  { id: 't27', date: '2026-11-24', kind: 'expense', category: 'education', note: 'Online design course', amount: 11000 },
  { id: 't28', date: '2026-11-25', kind: 'income', category: 'income', note: 'Monthly salary', amount: 485000 },
  { id: 't29', date: '2026-11-25', kind: 'expense', category: 'food', note: 'Supermarket — top-up shop', amount: 4980 },
  { id: 't30', date: '2026-11-26', kind: 'expense', category: 'food', note: 'Lunch out', amount: 1850 },
  { id: 't31', date: '2026-11-26', kind: 'expense', category: 'transport', note: 'Bus fare', amount: 480 },
];

// One monthly budget per spending category, in yen.
export const SEED_BUDGETS = {
  housing: 100000,
  food: 80000,
  utilities: 32000,
  transport: 20000,
  health: 16000,
  clothing: 12000,
  entertainment: 20000,
  education: 15000,
  other: 15000,
};

// Savings goals. `saved` is what is already put aside.
export const SEED_GOALS = [
  { id: 'g1', name: 'Emergency fund', target: 600000, saved: 342000, note: 'Three months of essential spending, kept in a separate account.' },
  { id: 'g2', name: 'Trip to Okinawa', target: 180000, saved: 96000, note: 'Flights and four nights in spring, for two.' },
  { id: 'g3', name: 'New laptop', target: 150000, saved: 45000, note: 'To replace the eight-year-old one before it gives up.' },
];

// Income and spending for the six months up to November 2026, for the
// trend chart. November's spending is replaced at run time by the live
// total of the transactions above, so the chart never disagrees with
// the ledger.
export const MONTH_HISTORY = [
  { month: '2026-06', income: 512000, spending: 268400 },
  { month: '2026-07', income: 518000, spending: 291300 },
  { month: '2026-08', income: 515000, spending: 312800 },
  { month: '2026-09', income: 520000, spending: 274100 },
  { month: '2026-10', income: 517000, spending: 289600 },
  { month: '2026-11', income: 517000, spending: null },
];

// National reference figures for the Insights page. Every figure names
// its source and year in the page text; the numbers below are the ones
// the page quotes.
export const REFERENCE = {
  averageSpending: {
    amount: 314001,
    label: 'Average monthly spending, households of two or more people',
    source: 'Statistics Bureau of Japan, 2024 National Survey of Family Income, Consumption and Wealth',
    year: '2024',
  },
  // Average monthly spending by category, same survey, rounded.
  averageByCategory: [
    { category: 'food', amount: 94895 },
    { category: 'transport', amount: 45730 },
    { category: 'utilities', amount: 24547 },
    { category: 'housing', amount: 18678 },
    { category: 'health', amount: 15863 },
    { category: 'clothing', amount: 10063 },
  ],
  foodShareNote: 'Food is the largest single item in the average household budget — about three in every ten yen spent.',
};
