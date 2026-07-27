const USERS_KEY = "cashlyUsers";
const CURRENT_USER_KEY = "cashlyCurrentUser";

// Get all users
export function getUsers() {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
}

// Save all users
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Register a new user
export function registerUser(name, email, password) {
  const users = getUsers();

  const existingUser = users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  );

  if (existingUser) {
    return {
      success: false,
      message: "An account with this email already exists."
    };
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password
  };

  users.push(newUser);
  saveUsers(users);

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(newUser)
  );

  return {
    success: true
  };
}

// Login
export function loginUser(email, password) {
  const users = getUsers();

  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    return {
      success: false,
      message: "No account found with this email."
    };
  }

  if (user.password !== password) {
    return {
      success: false,
      message: "Incorrect password."
    };
  }

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(user)
  );

  return {
    success: true,
    user
  };
}

// Current logged in user
export function getCurrentUser() {
  return JSON.parse(
    localStorage.getItem(CURRENT_USER_KEY)
  );
}

// Logout
export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}