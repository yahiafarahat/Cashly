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
    merchant:
      transaction.merchant_name ||
      transaction.description,
    category: transaction.category,
    date: transaction.date,
    time: "00:00",
    location: transaction.location || "",
    paymentMethod: "Not specified",
    status: "Completed",
    notes: transaction.description,
    items: transaction.items.map((item) => ({
      id: item.item_id,
      name: item.item_name,
      quantity: 1,
      price: item.item_price
    })),
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
  const validItems = formData.items.filter(
    (item) =>
      item.name.trim() !== "" &&
      Number(item.price) > 0
  );

  return {
    description:
      formData.notes.trim() ||
      `${formData.merchant} purchase`,
    price: Number(totalPrice),
    date: formData.date,
    category: formData.category,
    merchant_name: formData.merchant,
    location: formData.location,
    items: validItems.map((item) => ({
      item_name: item.name,
      item_price:
        Number(item.price) *
        Number(item.quantity || 1)
    }))
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
