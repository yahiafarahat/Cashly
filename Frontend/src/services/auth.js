import { apiFetch, setToken, clearToken, getToken } from "./api";

function applyLoginResult(result) {
  setToken(result.access_token);
  localStorage.setItem("cashlyUserName", result.user.name);
}

export async function registerUser(name, email, password) {
  try {
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    const result = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    applyLoginResult(result);

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function loginUser(email, password) {
  try {
    const result = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    applyLoginResult(result);

    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export function getCurrentUser() {
  return getToken() ? { name: localStorage.getItem("cashlyUserName") } : null;
}

export function logoutUser() {
  clearToken();
  localStorage.removeItem("cashlyUserName");
}
