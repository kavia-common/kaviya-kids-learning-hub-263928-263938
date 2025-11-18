import axios from "axios";

/**
 * PUBLIC_INTERFACE
 * getApiBaseUrl
 * Returns the configured backend base URL from environment variable.
 * Falls back to REACT_APP_API_BASE for compatibility, otherwise '' (relative).
 */
export function getApiBaseUrl() {
  const envBase =
    process.env.REACT_APP_BACKEND_URL ||
    process.env.REACT_APP_API_BASE ||
    "";
  if (!envBase) {
    // eslint-disable-next-line no-console
    console.warn(
      "[API] Missing REACT_APP_BACKEND_URL (or REACT_APP_API_BASE). Using relative URLs. Set this in .env to avoid CORS/404 issues."
    );
  }
  return envBase.replace(/\/+$/, "");
}

// Create axios instance
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
});

// Request interceptor (attach token if present)
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        // Safe header set
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`,
        };
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[API] Unable to access localStorage for token", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const friendly =
      (error?.response?.data?.message ||
        error?.message ||
        "Something went wrong, please try again.") + "";
    // eslint-disable-next-line no-console
    console.error("[API] Request failed:", {
      url: error?.config?.url,
      status: error?.response?.status,
      message: friendly,
    });
    // Ensure a consistent error shape
    return Promise.reject({
      message: friendly,
      status: error?.response?.status,
      data: error?.response?.data,
    });
  }
);

/**
 * PUBLIC_INTERFACE
 * signup
 * Calls POST /signup with { username, role, avatar, age }.
 * On success, stores userId and token (if provided) in localStorage.
 */
export async function signup(payload) {
  const res = await api.post("/signup", payload);
  const data = res?.data || {};
  // Store identifiers safely
  if (data.userId) localStorage.setItem("userId", data.userId);
  if (data.token) localStorage.setItem("authToken", data.token);
  return data;
}

/**
 * PUBLIC_INTERFACE
 * getDashboard
 * Fetches dashboard data for a kid by id: GET /dashboard/:id
 */
export async function getDashboard(userId) {
  const res = await api.get(`/dashboard/${encodeURIComponent(userId)}`);
  return res?.data || {};
}

/**
 * PUBLIC_INTERFACE
 * getQuiz
 * Loads quiz questions by subject: GET /quiz/:subject
 */
export async function getQuiz(subject) {
  const res = await api.get(`/quiz/${encodeURIComponent(subject)}`);
  return res?.data || {};
}

/**
 * PUBLIC_INTERFACE
 * submitQuiz
 * Submits quiz answers: POST /submit-quiz with { userId, answers }
 * Returns updated XP/level/badges etc.
 */
export async function submitQuiz(submission) {
  const res = await api.post("/submit-quiz", submission);
  return res?.data || {};
}

/**
 * PUBLIC_INTERFACE
 * getParentData
 * Fetch parent dashboard info: GET /parent/:id
 */
export async function getParentData(parentId) {
  const res = await api.get(`/parent/${encodeURIComponent(parentId)}`);
  return res?.data || {};
}

/**
 * PUBLIC_INTERFACE
 * getRewards
 * Fetch rewards and pet state: GET /rewards/:id
 */
export async function getRewards(userId) {
  const res = await api.get(`/rewards/${encodeURIComponent(userId)}`);
  return res?.data || {};
}

export default api;
