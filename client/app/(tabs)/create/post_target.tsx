import { Image } from "expo-image";
import { supabase } from "@/lib/supabase";
import {
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    Platform,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
} from "react-native";
import axios, { isAxiosError } from "axios";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import DraftsTab from "@/components/drafts";
import { Checkbox } from "expo-checkbox";
import SearchBar from "@/components/search_bar";
import Feather from "@expo/vector-icons/Feather";
import { FlashList } from "@shopify/flash-list";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import api from "@/lib/axios";

type ModerationResponse = {
    content: string;
    flag: boolean;
};

interface UserCommunities {
    community_id: string;
    community_name: string;
    role: string;
}

type PostTargetParams = {
    imageUri: string;
    title: string;
    content: string;
};

const BASE_URL = "http://10.0.2.2:8000/api/v1";
const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";
const user_id = "4813d507-9b97-4bb7-bee4-39ec47070889";

export default function PostTargetForm() {
    const { imageUri, title, content } =
        useLocalSearchParams<PostTargetParams>();
    console.log(imageUri);
    const colorScheme = useColorScheme() ?? "light";
    const [inputValue, setInputValue] = useState("");
    const [moderationResponse, setModerationResponse] =
        useState<ModerationResponse>();
    const [activeFilter, setActiveFilter] = useState("New");
    const queryClient = useQueryClient();
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();
    const [isSchoolChecked, setIsSchoolChecked] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [searchQuery, setSearchQuery] = useState("");

    // Stores the category_id the user picks for this post
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
        null,
    );

    // Stores the list of categories fetched from Supabase
    const [categories, setCategories] = useState<
        { category_id: string; category_name: string }[]
    >([]);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        console.log("Searching for:", text);
        // You can trigger your filtering logic or API calls here
    };

    // Fetch communities that user is a member of
    const {
        isFetching,
        data: commData,
        error: commError,
    } = useQuery<UserCommunities[]>({
        queryKey: ["user_communities", user_id],
        queryFn: async () => {
            // axios try catch
            const response = await api.get(`/users/me/communities`);
            if (response.data.length > 0) {
                return response.data;
            }
        },
    });

    // Fetch all active categories from Supabase when the screen loads
    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase
                .from("categories")
                .select("category_id, category_name")
                .eq("status", "active"); // only show active categories
            setCategories(data || []);
        };
        fetchCategories();
    }, []); // [] means run once when screen loads

    // temp publish post
    const uploadPost = async () => {
        const formData = new FormData();
        formData.append("user_id", user_id);
        // 1. Add the text fields
        formData.append("title", title);
        formData.append("content", content);

        // Is school checked?
        formData.append("school", isSchoolChecked ? "true" : "false");

        if (selectedCategoryId) {
            formData.append("category_id", selectedCategoryId);
        }

        // need to add selected community id
        selectedIds.forEach((id) => formData.append("communities", id));

        // 2. Add the image file
        // Note: In React Native, the 'uri' is the local path,
        // and 'name'/'type' are required for the server to recognize it as a file.
        if (imageUri) {
            const filename = imageUri.split("/").pop() || "upload.jpg";
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append("image", {
                uri: imageUri,
                name: filename,
                type: type,
            } as any); // 'as any' is a common TS workaround for RN FormData files
        }

        console.log(formData);

        const response = await axios.post(
            `${BASE_URL}/${inst_id}/users/me/news`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    // "Authorization": `Bearer ${token}` // If your FastAPI uses Supabase Auth
                },
            },
        );

        return response.data;
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(
            (prev) =>
                prev.includes(id)
                    ? prev.filter((item) => item !== id) // Remove if exists
                    : [...prev, id], // Add if not exists
        );
    };

    const { mutate, isPending, data, error } = useMutation({
        mutationKey: ["moderation"],
        mutationFn: uploadPost,

        onSuccess: () => {
            setInputValue("");
            setModalVisible(true);
            console.log(data);
        },

        onError: (err) => {
            console.log("Post failed:", err);
            Alert.alert("Failed to publish post");
        },
    });

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={false}
            style={{
                backgroundColor: Colors[colorScheme].bg,
            }}
        >
            <SafeAreaView edges={["top"]}>
                <Header />
            </SafeAreaView>
            {isPending && (
                <Modal
                    animationType="slide"
                    backdropColor={"rgba(0, 0, 0, 0.25)"}
                    visible={isPending}
                >
                    <View style={styles.centeredView}>
                        <ActivityIndicator
                            size="large"
                            color={Colors[colorScheme].tint}
                        />
                    </View>
                </Modal>
            )}

            <View
                style={{
                    flex: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    gap: 12,
                }}
            >
                <View
                    style={[
                        styles.cardContainer,
                        {
                            backgroundColor: Colors[colorScheme].bg_light,
                            borderColor: Colors[colorScheme].border,
                        },
                    ]}
                >
                    <ThemedText
                        type="defaultSemiBold"
                        style={{ alignSelf: "center" }}
                    >
                        Where would you like to post to?
                    </ThemedText>
                    {/* School Checkbox */}
                    <View
                        style={[
                            styles.flexRowContainer,
                            {
                                backgroundColor: Colors[colorScheme].bg_dark,
                                gap: 16,
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 8,
                            },
                        ]}
                    >
                        <Checkbox
                            value={isSchoolChecked}
                            onValueChange={setIsSchoolChecked}
                            style={styles.checkbox}
                            color={
                                isSchoolChecked
                                    ? Colors[colorScheme].text
                                    : Colors[colorScheme].text
                            }
                        />
                        <ThemedText emphasized>School</ThemedText>
                    </View>

                    {/* Category Picker */}
                    <View style={{ width: "100%", gap: 8 }}>
                        <ThemedText type="defaultSemiBold">
                            Select a Category
                        </ThemedText>
                        <View
                            style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: 8,
                            }}
                        >
                            {categories.map((cat) => (
                                <Pressable
                                    key={cat.category_id}
                                    onPress={() =>
                                        setSelectedCategoryId(cat.category_id)
                                    }
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 8,
                                        borderRadius: 20,
                                        borderWidth: 1.5,
                                        // filled if selected, transparent if not
                                        borderColor: Colors[colorScheme].tint,
                                        backgroundColor:
                                            selectedCategoryId ===
                                            cat.category_id
                                                ? Colors[colorScheme].tint
                                                : "transparent",
                                    }}
                                >
                                    <ThemedText
                                        style={{
                                            color:
                                                selectedCategoryId ===
                                                cat.category_id
                                                    ? Colors[colorScheme]
                                                          .button_text
                                                    : Colors[colorScheme].text,
                                        }}
                                    >
                                        {cat.category_name}
                                    </ThemedText>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Communities */}
                    <View
                        style={{
                            padding: 12,
                            borderRadius: 8,
                            flex: 1,
                            width: "100%",
                            backgroundColor: Colors[colorScheme].bg_dark,
                        }}
                    >
                        {/* Search bar */}
                        <View
                            style={[
                                styles.flexRowContainer,
                                {
                                    backgroundColor:
                                        Colors[colorScheme].bg_light,
                                    paddingHorizontal: 12,
                                    borderRadius: 8,
                                    marginBottom: 12,
                                    gap: 4,
                                },
                            ]}
                        >
                            <Feather
                                name="search"
                                size={16}
                                color={Colors[colorScheme].caption}
                            />
                            <TextInput
                                editable
                                numberOfLines={1}
                                placeholder="Search"
                                value={searchQuery}
                                onChangeText={handleSearch}
                                placeholderTextColor={
                                    Colors[colorScheme].caption
                                }
                                style={[
                                    styles.searchInput,
                                    {
                                        color: Colors[colorScheme].text,
                                        borderColor: "transparent",
                                    },
                                ]}
                            />
                        </View>
                        <FlashList
                            data={commData}
                            keyExtractor={(item) => item.community_id}
                            renderItem={({ item }) => (
                                <View
                                    key={item.community_id}
                                    style={[
                                        styles.flexRowContainer,
                                        {
                                            backgroundColor:
                                                Colors[colorScheme].bg_dark,
                                            gap: 16,
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            borderRadius: 8,
                                        },
                                    ]}
                                >
                                    <Checkbox
                                        value={selectedIds.includes(
                                            item.community_id,
                                        )}
                                        onValueChange={() =>
                                            toggleSelection(item.community_id)
                                        }
                                        style={styles.checkbox}
                                        color={
                                            isSchoolChecked
                                                ? Colors[colorScheme].text
                                                : Colors[colorScheme].text
                                        }
                                    />
                                    <ThemedText emphasized>
                                        {item.community_name}
                                    </ThemedText>
                                </View>
                            )}
                        />
                    </View>

                    <View style={styles.actionButtonsContainer}>
                        <Pressable
                            style={[
                                styles.button,
                                { backgroundColor: Colors[colorScheme].text },
                            ]}
                        >
                            <ThemedText
                                type="defaultSemiBold"
                                style={{
                                    color: Colors[colorScheme].button_text,
                                    textAlign: "center",
                                }}
                                onPress={() => router.back()}
                            >
                                Back
                            </ThemedText>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.button,
                                { backgroundColor: Colors[colorScheme].tint },
                            ]}
                            onPress={() => mutate()}
                        >
                            <ThemedText
                                type="defaultSemiBold"
                                style={{
                                    color: Colors[colorScheme].button_text,
                                    textAlign: "center",
                                }}
                            >
                                Publish
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
            </View>
            {data && (
                <Modal
                    animationType="slide"
                    backdropColor={"rgba(0, 0, 0, 0.25)"}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={styles.centeredView}>
                        {!data.flagged ? (
                            <View
                                style={[
                                    styles.modalView,
                                    {
                                        backgroundColor:
                                            Colors[colorScheme].bg_light,
                                    },
                                ]}
                            >
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={{
                                        color: Colors[colorScheme].text,
                                    }}
                                >
                                    Success!
                                </ThemedText>
                                <ThemedText
                                    type="body_medium"
                                    style={{
                                        color: Colors[colorScheme].caption,
                                    }}
                                >
                                    Your news post has passed the checks and is
                                    now published.
                                </ThemedText>
                                <Pressable
                                    style={[
                                        {
                                            backgroundColor:
                                                Colors[colorScheme].text,
                                            width: "100%",
                                            paddingVertical: 8,
                                            borderRadius: 4,
                                        },
                                    ]}
                                    onPress={() => {
                                        setModalVisible(!modalVisible);
                                        router.navigate("/(tabs)");
                                    }}
                                >
                                    <ThemedText
                                        type="body_medium"
                                        style={{
                                            color: Colors[colorScheme]
                                                .button_text,
                                            textAlign: "center",
                                            fontWeight: "700",
                                        }}
                                    >
                                        Close
                                    </ThemedText>
                                </Pressable>
                            </View>
                        ) : (
                            <View
                                style={[
                                    styles.modalView,
                                    {
                                        backgroundColor:
                                            Colors[colorScheme].bg_light,
                                    },
                                ]}
                            >
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={{
                                        fontWeight: 700,
                                        color: Colors[colorScheme].text,
                                    }}
                                >
                                    Failed
                                </ThemedText>
                                <ThemedText
                                    type="body_medium"
                                    style={{
                                        color: Colors[colorScheme].caption,
                                    }}
                                >
                                    Your news post did not pass the checks.
                                    Please ensure to adhere to our rules and
                                    guidelines.
                                </ThemedText>
                                <Pressable
                                    style={[
                                        {
                                            backgroundColor:
                                                Colors[colorScheme].text,
                                            width: "100%",
                                            paddingVertical: 8,
                                            borderRadius: 4,
                                        },
                                    ]}
                                    onPress={() => {
                                        setModalVisible(!modalVisible);
                                        router.navigate("/(tabs)");
                                    }}
                                >
                                    <ThemedText
                                        type="body_medium"
                                        style={{
                                            color: Colors[colorScheme]
                                                .button_text,
                                            textAlign: "center",
                                            fontWeight: "700",
                                        }}
                                    >
                                        Close
                                    </ThemedText>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </Modal>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 87,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    flexRowContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
    },
    cardContainer: {
        flex: 1,
        height: "100%",
        borderRadius: 8,
        borderWidth: 1,
        gap: 16,
        alignItems: "flex-start",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
        minHeight: 600,
        elevation: 2,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    modalView: {
        borderWidth: 1,
        width: "100%",
        margin: 16,
        borderRadius: 8,
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 16,
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    searchInput: {
        flex: 1,
        borderRadius: 8,
        minHeight: 32,
        maxHeight: 120,
        borderWidth: 1,
        paddingVertical: 4,
        fontSize: 14,
        textAlignVertical: "center",
    },
    checkbox: {
        width: 16,
        height: 16,
    },
    actionButtonsContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});
