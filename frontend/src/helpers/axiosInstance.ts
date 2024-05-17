import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://192.168.1.2:8080", // Set your API base URL
  withCredentials: false,
});

// Response interceptor to handle 401 status
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await logoutUser();
      window.location.href = "/login"; // Redirect to the login page
    }
    return Promise.reject(error);
  }
);

const logoutUser = async () => {
  try {
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("token");
    await axiosInstance.get("/users/logout");
  } catch (error) {
    console.error("Logout failed", error);
  }
};

export default axiosInstance;
