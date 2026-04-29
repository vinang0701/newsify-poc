import {
    Text,
    Pressable,
    StyleSheet,
    useColorScheme,
    View,
    TextInput,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import axios from "axios";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";

const BASE_URL = "http://10.0.2.2:8000/api/v1";
const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";

interface InvitableUser {
    user_id: string;
    name: string;
    role?: string;
}

const InviteMemberPage = () => {
    const colorScheme = useColorScheme() ?? "light";
    const router = useRouter();
    const { communityId: communityIdParam } = useLocalSearchParams();
    const communityId = Array.isArray(communityIdParam) ? communityIdParam[0] : communityIdParam;
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showSuccess, setShowSuccess] = useState(false);

    
    const { data: users, isLoading } = useQuery<InvitableUser[]>({
        queryKey: ["invitable_users", communityId],
        queryFn: async () => {
            const res = await axios.get(
                `${BASE_URL}/${inst_id}/communities/${communityId}/invitable-members`,
            );
            return res.data;
        },
    });

    const inviteMutation = useMutation({
        mutationFn: async (userIds: string[]) => {
            await axios.post(
                `${BASE_URL}/${inst_id}/communities/${communityId}/members/invite`,
                { user_ids: userIds },
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["community_members", communityId] });
            setShowSuccess(true);
        },
    });

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        if (!searchQuery.trim()) return users;
        return users.filter((u) =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
    }, [users, searchQuery]);

    const toggleSelect = (userId: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(userId)) next.delete(userId);
            else next.add(userId);
            return next;
        });
    };

    const handleInvite = () => {
        if (selectedIds.size === 0) return;
        inviteMutation.mutate(Array.from(selectedIds));
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        router.back();
    };

    const hasSelected = selectedIds.size > 0;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View
                    style={[
                        styles.headerContainer,
                        { backgroundColor: Colors[colorScheme].tint },
                    ]}
                >
                    <Pressable onPress={() => router.back()}>
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color={Colors[colorScheme].button_text}
                        />
                    </Pressable>
                </View>

                <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12 }}>
                    {/* Page title */}
                    <View
                        style={{
                            borderBottomWidth: 1,
                            borderColor: Colors[colorScheme].border,
                            paddingVertical: 4,
                            marginBottom: 10,
                        }}
                    >
                        <ThemedText type="defaultSemiBold">Invite members</ThemedText>
                    </View>

                    {/* Search bar */}
                    <View
                        style={[
                            styles.searchContainer,
                            { backgroundColor: Colors[colorScheme].border + "55" },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="magnify"
                            size={18}
                            color={Colors[colorScheme].caption}
                        />
                        <TextInput
                            style={[styles.searchInput, { color: Colors[colorScheme].text }]}
                            placeholder="Search"
                            placeholderTextColor={Colors[colorScheme].caption}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* User list */}
                    <FlashList
                        data={filteredUsers}
                        keyExtractor={(item) => item.user_id}
                        renderItem={({ item }) => {
                            const isSelected = selectedIds.has(item.user_id);
                            return (
                                <Pressable
                                    style={styles.memberRow}
                                    onPress={() => toggleSelect(item.user_id)}
                                >
                                    {/* Checkbox */}
                                    <View
                                        style={[
                                            styles.checkbox,
                                            isSelected && styles.checkboxSelected,
                                        ]}
                                    >
                                        {isSelected && (
                                            <MaterialCommunityIcons
                                                name="check"
                                                size={14}
                                                color="#fff"
                                            />
                                        )}
                                    </View>

                                    {/* Avatar + Name */}
                                    <View style={styles.memberInfo}>
                                        <Image
                                            source={require("@/assets/images/profile.png")}
                                            style={styles.avatar}
                                        />
                                        <ThemedText type="defaultSemiBold">
                                            {item.name}
                                        </ThemedText>
                                    </View>

                                    {/* Dots menu (decorative, matching design) */}
                                    <MaterialCommunityIcons
                                        name="dots-vertical"
                                        size={24}
                                        color={Colors[colorScheme].caption}
                                    />
                                </Pressable>
                            );
                        }}
                    />
                </View>

                {/* Bottom action buttons */}
                <View
                    style={[
                        styles.bottomBar,
                        { borderTopColor: Colors[colorScheme].border },
                    ]}
                >
                    <Pressable
                        style={styles.cancelButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                        style={[
                            styles.inviteButton,
                            !hasSelected && styles.inviteButtonDisabled,
                        ]}
                        onPress={handleInvite}
                        disabled={!hasSelected || inviteMutation.isPending}
                    >
                        <Text style={styles.inviteButtonText}>
                            {hasSelected ? "Invite members" : "Add members"}
                        </Text>
                    </Pressable>
                </View>

                {/* Success Modal */}
                <Modal
                    visible={showSuccess}
                    transparent
                    animationType="fade"
                    onRequestClose={handleSuccessClose}
                >
                    <View style={styles.modalOverlay}>
                        <View
                            style={[
                                styles.modalCard,
                                { backgroundColor: Colors[colorScheme].bg },
                            ]}
                        >
                            <View style={styles.successHeader}>
                                <MaterialCommunityIcons
                                    name="check-circle"
                                    size={20}
                                    color="#2E7D32"
                                />
                                <Text style={styles.successTitle}>Success</Text>
                            </View>
                            <Text style={[styles.successMessage, { color: Colors[colorScheme].caption }]}>
                                Successfully invited {selectedIds.size} member{selectedIds.size !== 1 ? "s" : ""}.
                            </Text>
                            <Pressable
                                style={styles.closeButton}
                                onPress={handleSuccessClose}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

export default InviteMemberPage;

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 0,
    },
    memberRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
        gap: 10,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: "#9E9E9E",
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxSelected: {
        backgroundColor: "#1976D2",
        borderColor: "#1976D2",
    },
    memberInfo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    bottomBar: {
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#111",
        borderRadius: 999,
        paddingVertical: 13,
        alignItems: "center",
    },
    cancelText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    inviteButton: {
        flex: 1,
        backgroundColor: "#1976D2",
        borderRadius: 999,
        paddingVertical: 13,
        alignItems: "center",
    },
    inviteButtonDisabled: {
        backgroundColor: "#90CAF9",
    },
    inviteButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    modalCard: {
        width: "100%",
        borderRadius: 12,
        padding: 20,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    successHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 6,
    },
    successTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2E7D32",
    },
    successMessage: {
        fontSize: 13,
        marginBottom: 20,
        lineHeight: 18,
    },
    closeButton: {
        backgroundColor: "#111",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
    },
    closeButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
});