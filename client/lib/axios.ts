import axios from "axios";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { useAuthStore } from "@/utils/authStore";

const router = useRouter();

const api = axios.create({
    baseURL:
        process.env.EXPO_PUBLIC_API_BASE_URL || "http://10.0.2.2:8000/api/v1",
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
            router.navigate("/login");
        } else if (
            error.response?.status === 403 ||
            error.response?.data?.detail === "User account is banned" ||
            error.response?.data?.detail === "User account is suspended"
        ) {
            await supabase.auth.signOut();
            useAuthStore.getState().signOut();
            Alert.alert(
                "Access Denied",
                "Your account has been restricted. Please contact your institution admin",
            );
        }
        return Promise.reject(error);
    },
);

export default api;
