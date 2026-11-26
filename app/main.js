// Kakeibo Ledger — wiring.
//
// main.js owns the hash router and every control on the page. The views
// only return HTML; this file renders it, listens once on the <main>
// element (event delegation), and calls the store for every change.
// After any change it re-renders, so the numbers on screen are always
// the numbers in storage.
//
//   #/                Dashboard
//   #/transactions    Add, edit and delete entries
//   #/budgets         A monthly budget per category
//   #/insights        Trends, the national comparison and guidance
//   #/goals           Savings goals
//
// window.__shotReady is false while a page renders and true once it is
// on screen, so a screenshot script knows when to capture.

import { APP_NAME, CATEGORIES } from './data.js';
import {
  addGoal,
  addToGoal,
  addTransaction,
  currentMonth,
  deleteGoal,
  deleteTransaction,
  setBudget,
  shiftMonth,
  transactionById,
  updateTransaction,
} from './store.js';
import { budgets, dashboard, insights, missing, savingsGoals, transactions } from './views.js';

const app = document.getElementById('app');
const navLinks = Array.from(document.querySelectorAll('.site-nav a'));

let editingId = null;

function route() {
  const hash = window.location.hash || '#/';
  if (hash.startsWith('#/transactions')) return 'transactions';
  if (hash.startsWith('#/budgets')) return 'budgets';
  if (hash.startsWith('#/insights')) return 'insights';
  if (hash.startsWith('#/goals')) return 'goals';
  if (hash === '#/' || hash === '') return 'dashboard';
  return 'missing';
}

const TITLES = {
  dashboard: 'Dashboard',
  transactions: 'Transactions',
  budgets: 'Budgets',
  insights: 'Insights',
  goals: 'Savings goals',
  missing: 'Not found',
};

function render() {
  window.__shotReady = false;
  const page = route();
  if (page === 'dashboard') app.innerHTML = dashboard();
  else if (page === 'transactions') app.innerHTML = transactions(editingId ? transactionById(editingId) : null);
  else if (page === 'budgets') app.innerHTML = budgets();
  else if (page === 'insights') app.innerHTML = insights();
  else if (page === 'goals') app.innerHTML = savingsGoals();
  else app.innerHTML = missing();
  document.title = `${TITLES[page]} | ${APP_NAME}`;
  for (const link of navLinks) {
    const target = link.getAttribute('href');
    const active = (page === 'dashboard' && target === '#/')
      || (page !== 'dashboard' && target === `#/${page}`);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function formValues(form) {
  const data = new window.FormData(form);
  const out = {};
  for (const [key, value] of data.entries()) out[key] = String(value).trim();
  return out;
}

function readAmount(value) {
  const amount = Math.round(Number(value));
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function handleForm(form) {
  const kind = form.getAttribute('data-form');
  const values = formValues(form);

  if (kind === 'add-tx') {
    const amount = readAmount(values.amount);
    if (!amount || !values.date || !values.note) return;
    const category = values.kind === 'income' ? 'income' : values.category;
    addTransaction({ date: values.date, kind: values.kind, category, note: values.note, amount });
    render();
  } else if (kind === 'edit-tx') {
    const amount = readAmount(values.amount);
    if (!amount || !values.date || !values.note) return;
    const category = values.kind === 'income' ? 'income' : values.category;
    if (updateTransaction(form.getAttribute('data-id'), {
      date: values.date, kind: values.kind, category, note: values.note, amount,
    })) {
      editingId = null;
      render();
    }
  } else if (kind === 'set-budget') {
    const amount = Math.round(Number(values.amount));
    if (!Number.isFinite(amount) || amount < 0) return;
    setBudget(form.getAttribute('data-category'), amount);
    render();
  } else if (kind === 'add-goal') {
    const target = readAmount(values.target);
    if (!target || !values.name) return;
    const saved = Math.max(0, Math.round(Number(values.saved)) || 0);
    addGoal({ name: values.name, target, saved, note: values.note || '' });
    render();
  } else if (kind === 'add-to-goal') {
    const amount = readAmount(values.amount);
    if (!amount) return;
    if (addToGoal(form.getAttribute('data-id'), amount)) render();
  }
}

app.addEventListener('submit', (event) => {
  const form = event.target;
  if (!(form instanceof window.HTMLFormElement)) return;
  event.preventDefault();
  handleForm(form);
});

app.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.getAttribute('data-action');
  const id = button.getAttribute('data-id');
  if (action === 'prev-month') {
    shiftMonth(-1);
    render();
  } else if (action === 'next-month') {
    shiftMonth(1);
    render();
  } else if (action === 'edit-tx') {
    editingId = id;
    render();
    const panel = app.querySelector('.edit-panel');
    if (panel) panel.scrollIntoView({ block: 'start' });
  } else if (action === 'cancel-edit') {
    editingId = null;
    render();
  } else if (action === 'delete-tx') {
    if (window.confirm('Delete this entry?')) {
      deleteTransaction(id);
      render();
    }
  } else if (action === 'delete-goal') {
    if (window.confirm('Delete this savings goal?')) {
      deleteGoal(id);
      render();
    }
  }
});

// Keep the category list honest: income entries never offer a spending
// category, and spending entries never offer "Income" as a category.
app.addEventListener('change', (event) => {
  const select = event.target;
  if (!(select instanceof window.HTMLSelectElement) || select.name !== 'kind') return;
  const form = select.closest('form');
  if (!form) return;
  const categorySelect = form.querySelector('select[name="category"]');
  if (!categorySelect) return;
  if (select.value === 'income') {
    categorySelect.innerHTML = '<option value="income">Income</option>';
  } else {
    categorySelect.innerHTML = CATEGORIES
      .map((category) => `<option value="${category.id}">${category.label}</option>`)
      .join('');
  }
});

window.addEventListener('hashchange', () => {
  editingId = null;
  render();
});

render();
