import { getAccessToken } from "./auth";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";


export async function getAnalyticsSummary(
  signal,
  granularity = "monthly"
) {
  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Please log in to view your analytics."
    );
  }

  const response = await fetch(
    `${API_URL}/analytics/summary?granularity=${granularity}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      },
      signal
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "Your session expired. Please log in again."
      );
    }

    throw new Error(
      data.detail ||
      "Unable to load your analytics."
    );
  }

  return data;
}