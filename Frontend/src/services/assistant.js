import { getAccessToken } from "./auth";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";


function getAuthorizationHeader() {
  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Please log in to use the assistant."
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


export async function sendAssistantMessage(message, history) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    30000
  );

  let response;

  try {
    response = await fetch(
      `${API_URL}/assistant/ask`,
      {
        method: "POST",
        headers: getAuthorizationHeader(),
        body: JSON.stringify({
          message,
          history: history.map(({ role, content }) => ({ role, content }))
        }),
        signal: controller.signal
      }
    );
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "The assistant took too long to respond. Please try again.",
        { cause: error }
      );
    }

    throw new Error(
      "Unable to reach the assistant. Check your connection and try again.",
      { cause: error }
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to get an answer right now."
      )
    );
  }

  return data.reply;
}
