const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

const TOKEN_KEY = "cashlyAccessToken";
const CURRENT_USER_KEY = "cashlyCurrentUser";


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


function saveLoginSession(token, user, remember = false) {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);

  localStorage.removeItem(CURRENT_USER_KEY);
  sessionStorage.removeItem(CURRENT_USER_KEY);

  const storage = remember
    ? localStorage
    : sessionStorage;

  storage.setItem(TOKEN_KEY, token);

  storage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(user)
  );

  localStorage.setItem(
    "cashlyUserName",
    user.name
  );
}


export async function registerUser(
  name,
  email,
  password
) {
  try {
    const response = await fetch(
      `${API_URL}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password
        })
      }
    );

    const data = await readResponse(response);

    if (!response.ok) {
      return {
        success: false,
        message: getErrorMessage(
          data,
          "Unable to create your account."
        )
      };
    }

    return await loginUser(
      email,
      password,
      false
    );
  } catch {
    return {
      success: false,
      message:
        "Unable to connect to the Cashly server."
    };
  }
}


export async function loginUser(
  email,
  password,
  remember = false
) {
  try {
    const response = await fetch(
      `${API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      }
    );

    const data = await readResponse(response);

    if (!response.ok) {
      return {
        success: false,
        message: getErrorMessage(
          data,
          "Incorrect email or password."
        )
      };
    }

    saveLoginSession(
      data.access_token,
      data.user,
      remember
    );

    return {
      success: true,
      user: data.user
    };
  } catch {
    return {
      success: false,
      message:
        "Unable to connect to the Cashly server."
    };
  }
}


export function getAccessToken() {
  return (
    sessionStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem(TOKEN_KEY)
  );
}


export function getCurrentUser() {
  const savedUser =
    sessionStorage.getItem(CURRENT_USER_KEY) ||
    localStorage.getItem(CURRENT_USER_KEY);

  return savedUser
    ? JSON.parse(savedUser)
    : null;
}


export function getAuthHeaders() {
  const token = getAccessToken();

  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    : {
        "Content-Type": "application/json"
      };
}


export function logoutUser() {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);

  sessionStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);

  localStorage.removeItem("cashlyUserName");
}


export function updateCurrentUserProfile(
  name,
  email
) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return;
  }

  const updatedUser = {
    ...currentUser,
    name,
    email: email || currentUser.email
  };

  const storage =
    sessionStorage.getItem(CURRENT_USER_KEY)
      ? sessionStorage
      : localStorage;

  storage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(updatedUser)
  );

  localStorage.setItem(
    "cashlyUserName",
    updatedUser.name
  );
}