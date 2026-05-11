import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";

import RequestList from "@/components/requests/RequestList";
import { useRequests } from "@/hooks/useRequests";

export default function RequestsScreen() {
    const router = useRouter();

    const { requests, loading, refreshing, error, refresh } = useRequests();
    console.log(requests);

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.topHeader}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Feather name="arrow-left" size={18} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.headerSpacer} />
            </View>

            <View style={styles.content}>
                <Text style={styles.pageTitle}>Your Requests</Text>

                {loading ? (
                    <View style={styles.centerWrap}>
                        <ActivityIndicator size="small" color="#2563EB" />
                    </View>
                ) : error ? (
                    <View style={styles.centerWrap}>
                        <Text style={styles.errorTitle}>
                            Unable to load requests
                        </Text>
                        <Text style={styles.errorText}>{error.message}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => refresh}
                        >
                            <Text style={styles.retryButtonText}>
                                Try again
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <RequestList
                        data={requests}
                        refreshing={refreshing}
                        onRefresh={refresh}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EDEDED",
    },
    topHeader: {
        height: 44,
        backgroundColor: "#0B5FFF",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    backButton: {
        width: 28,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    headerSpacer: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingTop: 12,
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    centerWrap: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    errorTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 6,
    },
    errorText: {
        fontSize: 12,
        color: "#6B7280",
        textAlign: "center",
        marginBottom: 12,
    },
    retryButton: {
        backgroundColor: "#2563EB",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 6,
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
});
