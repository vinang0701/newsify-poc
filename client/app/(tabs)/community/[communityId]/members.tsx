import {
    Text,
    Pressable,
    StyleSheet,
    useColorScheme,
    View,
    ScrollView,
    Modal,
    ActivityIndicator,
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import axios from "axios";
import { Image } from "expo-image";
import React, { useCallback, useMemo, useRef } from "react";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from "@gorhom/bottom-sheet";

const BASE_URL = "http://10.0.2.2:8000/api/v1";
const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";
const user_id = "4813d507-9b97-4bb7-bee4-39ec47070889";

interface CommunityMembers {
    community_id: string;
    user_id: string;
    name: string;
    role: string;
}

const MembersPage = () => {
    const colorScheme = useColorScheme() ?? "light";
    const router = useRouter();
    const { communityId } = useLocalSearchParams();
    const { data: members, isLoading } = useQuery<CommunityMembers[]>({
        queryKey: ["community_members", communityId],
        queryFn: async () => {
            const res = await axios.get(
                `${BASE_URL}/${inst_id}/communities/${communityId}/members`,
            );
            return res.data;
        },
    });

    const snapPoints = useMemo(() => ["10%"], []);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const insets = useSafeAreaInsets();
    const handleExpandSheet = () => bottomSheetRef.current?.expand();

    const handleSheetChange = (index: number) => {
        bottomSheetRef.current?.close();
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

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View
                    style={[
                        styles.headerContainer,
                        {
                            backgroundColor: Colors[colorScheme].tint,
                        },
                    ]}
                >
                    <Pressable onPress={() => router.back()}>
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color={Colors[colorScheme].button_text}
                            weight="bold"
                        />
                    </Pressable>
                </View>
                <View
                    style={{
                        flex: 1,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                    }}
                >
                    {/* Members header */}
                    <View
                        style={{
                            borderBottomWidth: 1,
                            borderColor: Colors[colorScheme].border,
                            paddingVertical: 4,
                        }}
                    >
                        <ThemedText type="defaultSemiBold">Members</ThemedText>
                    </View>
                    {/* Member List */}
                    <FlashList
                        data={members}
                        renderItem={({ item }) => (
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginVertical: 12,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    <Image
                                        source={require("@/assets/images/profile.png")}
                                        style={{
                                            width: 36,
                                            height: 36,
                                            resizeMode: "contain",
                                        }}
                                    />
                                    <ThemedText type="defaultSemiBold">
                                        {item.name}
                                    </ThemedText>
                                </View>
                                <Pressable
                                    style={{ alignSelf: "flex-end" }}
                                    onPress={handleExpandSheet}
                                >
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
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    backdropComponent={renderBackdrop}
                    enablePanDownToClose
                >
                    <BottomSheetView
                        style={[
                            styles.bottomSheet,
                            {
                                flex: 1,
                                justifyContent: "space-between",
                                backgroundColor: Colors[colorScheme].bg_light,
                                gap: 12,
                            },
                        ]}
                    >
                        <Pressable>
                            <ThemedText>Remove</ThemedText>
                        </Pressable>
                    </BottomSheetView>
                </BottomSheet>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

export default MembersPage;

const styles = StyleSheet.create({
    headerContainer: {
        flex: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
    },
    bottomSheet: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 12,
        justifyContent: "space-between",
        height: "100%",
    },
});
