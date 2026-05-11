import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { registerForPushNotifications } from "@/lib/notificationContext";

export function usePushNotifications() {
    const [pushToken, setPushToken] = useState<string | null>(null);
    const [notification, setNotification] =
        useState<Notifications.Notification | null>(null);

    useEffect(() => {
        registerForPushNotifications()
            .then((token) => setPushToken(token))
            .catch((err) =>
                console.error(
                    "Failed to register for push notifications:",
                    err,
                ),
            );

        const notificationListener =
            Notifications.addNotificationReceivedListener((notification) => {
                console.log("Received notification:", notification);
                setNotification(notification);
            });

        const responseListener =
            Notifications.addNotificationResponseReceivedListener((response) =>
                console.log("Notification response:", response),
            );

        return () => {
            notificationListener.remove();
            responseListener.remove();
        };
    }, []);

    return { pushToken, notification };
}
