const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const requestAuth = async (path, payload) => {
  const response = await fetch(`${API_BASE_URL}/auth/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Authentication request failed.");
  }

  return data;
};

const requestUsers = async (path = "", options = {}) => {
  const response = await fetch(`${API_BASE_URL}/auth/users${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "User request failed.");
  }

  return data;
};

export const signin = ({ email, password }) => {
  return requestAuth("signin", { email, password });
};

export const signup = ({ fullName, email, password }) => {
  return requestAuth("signup", {
    username: fullName,
    email,
    password,
    role: "admin",
  });
};

export const getUsers = () => {
  return requestUsers();
};

export const getUserById = (id) => {
  return requestUsers(`/${id}`);
};

export const updateUser = (id, user) => {
  return requestUsers(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(user),
  });
};
