import axios from 'axios'

const baseUrl = 'http://127.0.0.1:8000/'

const AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 10000,  // Increased to 10 seconds
    headers: {
        "Content-Type": "application/json",
        accept: "application/json",
    }
})

// Add request interceptor to attach the access token
AxiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token refresh and errors
AxiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refresh");

            if (refreshToken) {
                try {
                    // Try to get a new access token
                    const response = await axios.post("http://127.0.0.1:8000/register/refresh/", {
                        refresh: refreshToken,
                    });

                    const { access } = response.data;
                    localStorage.setItem("access", access);

                    // Update the header and retry the original request
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return AxiosInstance(originalRequest);
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    // If refresh fails, log out
                    localStorage.clear();
                    window.location.href = "/auth";
                }
            } else {
                // No refresh token, redirect to login
                localStorage.clear();
                window.location.href = "/auth";
            }
        }

        return Promise.reject(error);
    }
);

export default AxiosInstance