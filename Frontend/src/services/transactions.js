import { apiFetch } from "./api";

export function getTransactions() {
  return apiFetch("/transactions");
}

export function getTransaction(transactionId) {
  return apiFetch(`/transactions/${transactionId}`);
}

export function createTransaction({ description, price, date, category }) {
  return apiFetch("/transactions", {
    method: "POST",
    body: JSON.stringify({ description, price, date, category }),
  });
}

export function deleteTransaction(transactionId) {
  return apiFetch(`/transactions/${transactionId}`, {
    method: "DELETE",
  });
}
