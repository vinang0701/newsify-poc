import {
    Text,
    Pressable,
    StyleSheet,
    useColorScheme,
    View,
    TextInput,
    Modal,
    Alert,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import axios from "axios";
import { Image } from "expo-image";
import React, { useCallback, useMemo, useRef, useState } from "react";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from "@gorhom/bottom-sheet";

const BASE_URL = "http://10.0.2.2:8000/api/v1";
const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";
const user_id = "4813d507-9b97-4bb7-bee4-39ec47070889";
const role = "community_admin";

interface CommunityMembers {
    community_id: string;
    user_id: string;
    name: string;
    role: string;
}

type ConfirmAction = "ban" | "remove" | "promote" | "revoke" | null;

const MembersPage = () => {
    const colorScheme = useColorScheme() ?? "light";
    const router = useRouter();
    const { communityId: communityIdParam } = useLocalSearchParams();
    const communityId = Array.isArray(communityIdParam) ? communityIdParam[0] : communityIdParam;
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMember, setSelectedMember] = useState<CommunityMembers | null>(null);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

    const { data: members, isLoading } = useQuery<CommunityMembers[]>({
        queryKey: ["community_members", communityId],
        queryFn: async () => {
            const res = await axios.get(
                `${BASE_URL}/${inst_id}/communities/${communityId}/members`,
            );
            return res.data;
        },
    });

    // --- Mutations ---

    const banMutation = useMutation({
        mutationFn: async (targetUserId: string) => {
            await axios.post(
                `${BASE_URL}/${inst_id}/communities/${communityId}/members/${targetUserId}/ban`,
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["community_members", communityId] });
            setConfirmAction(null);
            setSelectedMember(null);
            bottomSheetRef.current?.close();
        },
        onError: () => {
            Alert.alert("Error", "Failed to ban user. Please try again.");
        },
    });

    const removeMutation = useMutation({
        mutationFn: async (targetUserId: string) => {
            await axios.delete(
                `${BASE_URL}/${inst_id}/communities/${communityId}/members/${targetUserId}`,
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["community_members", communityId] });
            setConfirmAction(null);
            setSelectedMember(null);
            bottomSheetRef.current?.close();
        },
        onError: () => {
            Alert.alert("Error", "Failed to remove user. Please try again.");
        },
    });

    const promoteMutation = useMutation({
        mutationFn: async (targetUserId: string) => {
            await axios.patch(
                `${BASE_URL}/${inst_id}/communities/${communityId}/members/${targetUserId}/role`,
                { role: "community_admin" },
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["community_members", communityId] });
            setConfirmAction(null);
            setSelectedMember(null);
            bottomSheetRef.current?.close();
        },
        onError: () => {
            Alert.alert("Error", "Failed to promote user. Please try again.");
        },
    });

    const revokeMutation = useMutation({
        mutationFn: async (targetUserId: string) => {
            await axios.patch(
                `${BASE_URL}/${inst_id}/communities/${communityId}/members/${targetUserId}/role`,
                { role: "member" },
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["community_members", communityId] });
            setConfirmAction(null);
            setSelectedMember(null);
            bottomSheetRef.current?.close();
        },
        onError: () => {
            Alert.alert("Error", "Failed to revoke admin privileges. Please try again.");
        },
    });

    // --- Bottom Sheet ---

    const snapPoints = useMemo(() => ["15%"], []);
    const bottomSheetRef = useRef<BottomSheet>(null);

    const handleExpandSheet = (member: CommunityMembers) => {
        setSelectedMember(member);
        bottomSheetRef.current?.expand();
    };

    const handleSheetChange = (index: number) => {
        if (index === -1) {
            setSelectedMember(null);
        }
    };

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                {...props}
            />
        ),
        [],
    );

    const isSelectedMemberAdmin =
        selectedMember?.role === "community_admin" ||
        selectedMember?.role === "admin";

    // --- Confirm Dialog ---

    const handleConfirm = () => {
        if (!selectedMember) return;
        if (confirmAction === "ban") banMutation.mutate(selectedMember.user_id);
        else if (confirmAction === "remove") removeMutation.mutate(selectedMember.user_id);
        else if (confirmAction === "promote") promoteMutation.mutate(selectedMember.user_id);
        else if (confirmAction === "revoke") revokeMutation.mutate(selectedMember.user_id);
    };

    const confirmConfig: Record<
        Exclude<ConfirmAction, null>,
        { title: string; message: string; actionLabel: string; actionColor: string }
    > = {
        ban: {
            title: "Ban user?",
            message: "Are you sure you want to ban this user?",
            actionLabel: "Ban",
            actionColor: "#E53935",
        },
        remove: {
            title: "Remove user?",
            message: "Are you sure you want to remove this user?",
            actionLabel: "Remove",
            actionColor: "#E53935",
        },
        promote: {
            title: "Promote user?",
            message: "Are you sure you want to Promote this user?",
            actionLabel: "Promote",
            actionColor: "#1976D2",
        },
        revoke: {
            title: "Revoke Admin Privileges?",
            message: "Are you sure you want to revoke this admin privileges?",
            actionLabel: "Revoke",
            actionColor: "#E53935",
        },
    };

    // --- Filtered members ---

    const filteredMembers = useMemo(() => {
        if (!members) return [];
        if (!searchQuery.trim()) return members;
        return members.filter((m) =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
    }, [members, searchQuery]);

    const isAdmin = (member: CommunityMembers) =>
        member.role === "community_admin" || member.role === "admin";

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
                    <Pressable
                        style={styles.inviteButton}
                        onPress={() =>
                            router.push({
                                pathname: "/(tabs)/community/[communityId]/invite_members",
                                params: { communityId },
                            })
                        }
                    >
                        <MaterialCommunityIcons
                            name="account-plus"
                            size={16}
                            color="#fff"
                        />
                        <Text style={styles.inviteText}>Invite</Text>
                    </Pressable>
                </View>

                <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12 }}>
                    {/* Members header */}
                    <View
                        style={{
                            borderBottomWidth: 1,
                            borderColor: Colors[colorScheme].border,
                            paddingVertical: 4,
                            marginBottom: 8,
                        }}
                    >
                        <ThemedText type="defaultSemiBold">Members</ThemedText>
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

                    {/* Member List */}
                    <FlashList
                        data={filteredMembers}
                        keyExtractor={(item) => item.user_id}
                        renderItem={({ item }) => (
                            <View style={styles.memberRow}>
                                <View style={styles.memberInfo}>
                                    <Image
                                        source={require("@/assets/images/profile.png")}
                                        style={styles.avatar}
                                    />
                                    <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                                    {isAdmin(item) && (
                                        <View style={styles.adminBadge}>
                                            <Text style={styles.adminBadgeText}>Admin</Text>
                                        </View>
                                    )}
                                </View>
                                <Pressable onPress={() => handleExpandSheet(item)}>
                                    <MaterialCommunityIcons
                                        name="dots-vertical"
                                        size={24}
                                        color={Colors[colorScheme].caption}
                                    />
                                </Pressable>
                            </View>
                        )}
                    />
                </View>

                {/* Bottom Sheet */}
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    backdropComponent={renderBackdrop}
                    enablePanDownToClose
                    onChange={handleSheetChange}
                >
                    <BottomSheetView
                        style={[
                            styles.bottomSheet,
                            { backgroundColor: Colors[colorScheme].bg_light },
                        ]}
                    >
                        {/* Ban */}
                        <Pressable
                            style={styles.sheetOption}
                            onPress={() => setConfirmAction("ban")}
                        >
                            <MaterialCommunityIcons
                                name="close-circle-outline"
                                size={20}
                                color={Colors[colorScheme].text}
                            />
                            <ThemedText>Ban</ThemedText>
                        </Pressable>

                        {/* Remove */}
                        <Pressable
                            style={styles.sheetOption}
                            onPress={() => setConfirmAction("remove")}
                        >
                            <MaterialCommunityIcons
                                name="account-remove-outline"
                                size={20}
                                color={Colors[colorScheme].text}
                            />
                            <ThemedText>Remove</ThemedText>
                        </Pressable>

                        {/* Promote / Revoke */}
                        {isSelectedMemberAdmin ? (
                            <Pressable
                                style={styles.sheetOption}
                                onPress={() => setConfirmAction("revoke")}
                            >
                                <MaterialCommunityIcons
                                    name="shield-off-outline"
                                    size={20}
                                    color={Colors[colorScheme].text}
                                />
                                <ThemedText>Revoke admin</ThemedText>
                            </Pressable>
                        ) : (
                            <Pressable
                                style={styles.sheetOption}
                                onPress={() => setConfirmAction("promote")}
                            >
                                <MaterialCommunityIcons
                                    name="shield-outline"
                                    size={20}
                                    color={Colors[colorScheme].text}
                                />
                                <ThemedText>Promote to admin</ThemedText>
                            </Pressable>
                        )}
                    </BottomSheetView>
                </BottomSheet>

                {/* Confirmation Modal */}
                <Modal
                    visible={confirmAction !== null}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setConfirmAction(null)}
                >
                    <View style={styles.modalOverlay}>
                        <View
                            style={[
                                styles.modalCard,
                                { backgroundColor: Colors[colorScheme].bg },
                            ]}
                        >
                            <Text style={[styles.modalTitle, { color: Colors[colorScheme].text }]}>
                                {confirmAction ? confirmConfig[confirmAction].title : ""}
                            </Text>
                            <Text style={[styles.modalMessage, { color: Colors[colorScheme].caption }]}>
                                {confirmAction ? confirmConfig[confirmAction].message : ""}
                            </Text>
                            <View style={styles.modalActions}>
                                <Pressable
                                    style={styles.cancelButton}
                                    onPress={() => setConfirmAction(null)}
                                >
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </Pressable>
                                <Pressable
                                    style={[
                                        styles.confirmButton,
                                        {
                                            backgroundColor: confirmAction
                                                ? confirmConfig[confirmAction].actionColor
                                                : "#000",
                                        },
                                    ]}
                                    onPress={handleConfirm}
                                >
                                    <Text style={styles.confirmText}>
                                        {confirmAction ? confirmConfig[confirmAction].actionLabel : ""}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

export default MembersPage;

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
    },
    inviteButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(255,255,255,0.25)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    inviteText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 13,
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
        justifyContent: "space-between",
        marginVertical: 10,
    },
    memberInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    adminBadge: {
        backgroundColor: "#1976D2",
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    adminBadgeText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "600",
    },
    bottomSheet: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 4,
    },
    sheetOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
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
    modalTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 6,
    },
    modalMessage: {
        fontSize: 13,
        marginBottom: 20,
        lineHeight: 18,
    },
    modalActions: {
        flexDirection: "row",
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#111",
        borderRadius: 999,
        paddingVertical: 12,
        alignItems: "center",
    },
    cancelText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    confirmButton: {
        flex: 1,
        borderRadius: 999,
        paddingVertical: 12,
        alignItems: "center",
    },
    confirmText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
});