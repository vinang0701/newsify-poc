import * as Notifications from "expo-notifications";
import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import { createContext } from "react";
import Constants from "expo-constants";

const NotificationContext = createContext({
    token: null as string | null,
    notification: null as Notifications.Notification | null,
});

// Set foreground notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
}

export async function registerForPushNotifications() {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
        });
    }
    // 1. Request permission
    const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        console.warn("Permission not granted for notifications");
        return null;
    }

    const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
    if (!projectId) {
        handleRegistrationError("Project ID not found");
    }

    // 3. Get FCM token
    const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
        .data;
    console.log("FCM Token:", token);

    return token;
}
