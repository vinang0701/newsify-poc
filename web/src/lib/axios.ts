import axios from "axios";
import { supabase } from "@/lib/supabase";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor — runs before every request
api.interceptors.request.use(async (config) => {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
});

// Optional: response interceptor — handle token expiry globally
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await supabase.auth.signOut();
            window.location.href = "/login";
        } else if (
            error.response?.status === 403 ||
            error.response?.data?.detail === "User account is banned" ||
            error.response?.data?.detail === "User account is suspended"
        ) {
            await supabase.auth.signOut();
        }
        return Promise.reject(error);
    },
);

export default api;
