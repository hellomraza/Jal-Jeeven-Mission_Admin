import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000", // Update with your API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the auth token to headers
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: Clear token and redirect to login if unauthorized
      // if (typeof window !== 'undefined') {
      //   localStorage.removeItem('admin_token');
      //   window.location.href = '/login';
      // }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
