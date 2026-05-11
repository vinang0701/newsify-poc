import { getItem, setItem, deleteItemAsync } from "expo-secure-store";

export const SecureStorageAdapter = {
    getItem: (key: string) => getItem(key),
    setItem: (key: string, value: string) => setItem(key, value),
    removeItem: (key: string) => deleteItemAsync(key),
};
