import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${process.env.REACT_APP_API_BASE_URL}`, // Set your API base URL
  withCredentials: false,
});

// Response interceptor to handle 401 status
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      logoutUser();
      window.location.href = "/login"; // Redirect to the login page
    }
    return Promise.reject(error);
  }
);

const logoutUser = () => {
  try {
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("token");
  } catch (error) {
    console.error("Logout failed", error);
  }
};

export default axiosInstance;
