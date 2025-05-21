import axios from "axios";

const instance = axios.create({
  baseURL: "https://backend-5ofy.onrender.com/",
  timeout: 5000,
});

// Request Interceptor
instance.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error); // Important for error handling
  }
);

// Response Interceptor
instance.interceptors.response.use(
  (response) => {
    console.log("Response Data:", response);
    return response;
  },
  (error) => {
    console.error("Response Error:", error);
    return Promise.reject(error); // Important for error handling
  }
);

export default instance;
