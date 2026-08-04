import { getAccessToken } from "./auth";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";


function getAuthorizationHeader() {
  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Please log in to manage transactions."
    );
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}


async function readResponse(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}


function getErrorMessage(data, fallbackMessage) {
  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data.detail)) {
    return data.detail
      .map((error) => error.msg)
      .join(", ");
  }

  return fallbackMessage;
}


export function normalizeTransaction(transaction) {
  return {
    id: transaction.transaction_id,
    description: transaction.description,
    category: transaction.category,
    date: transaction.date,
    time: transaction.time || "00:00",
    paymentMethod: transaction.payment_method || "Not specified",
    status: "Completed",
    price: Number(transaction.price),
    amount: Number(transaction.price),
    fees: 0,
    discount: 0,
    currency: "EGP",
    exchangeRateToEGP: 1,
    rateUpdatedAt: ""
  };
}


export async function fetchTransactions(signal) {
  const response = await fetch(
    `${API_URL}/transactions`,
    {
      method: "GET",
      headers: getAuthorizationHeader(),
      signal
    }
  );

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to load transactions."
      )
    );
  }

  return data.map(normalizeTransaction);
}


export async function createTransaction(
  formData,
  totalPrice
) {
  const response = await fetch(
    `${API_URL}/transactions`,
    {
      method: "POST",
      headers: getAuthorizationHeader(),
      body: JSON.stringify(buildTransactionPayload(formData, totalPrice))
    }
  );

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to create transaction."
      )
    );
  }

  return normalizeTransaction(data);
}


function buildTransactionPayload(formData, totalPrice) {
  return {
    description: formData.description.trim(),
    price: Number(totalPrice),
    date: formData.date,
    category: formData.category,
    time: formData.time || null,
    payment_method: formData.paymentMethod || null
  };
}


export async function updateTransaction(
  transactionId,
  formData,
  totalPrice
) {
  const response = await fetch(
    `${API_URL}/transactions/${transactionId}`,
    {
      method: "PUT",
      headers: getAuthorizationHeader(),
      body: JSON.stringify(buildTransactionPayload(formData, totalPrice))
    }
  );

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Unable to update transaction.")
    );
  }

  return normalizeTransaction(data);
}


export async function deleteTransaction(transactionId) {
  const response = await fetch(
    `${API_URL}/transactions/${transactionId}`,
    {
      method: "DELETE",
      headers: getAuthorizationHeader()
    }
  );

  if (!response.ok) {
    const data = await readResponse(response);
    throw new Error(
      getErrorMessage(data, "Unable to delete transaction.")
    );
  }
}
