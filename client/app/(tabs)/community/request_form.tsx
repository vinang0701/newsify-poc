import {
    StyleSheet,
    Text,
    useColorScheme,
    View,
    ScrollView,
    Pressable,
    TextInput,
    Alert,
    ActivityIndicator,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import React, { useRef, useState } from "react";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "expo-router";
import Loading from "@/components/loading";
import api from "@/lib/axios";
import { useAuthStore } from "@/utils/authStore";
import Feather from "@expo/vector-icons/Feather";

// Define the shape of your form data
interface CommunityRequest {
    name: string;
    description: string;
    image_url: string;
    request_by_user_id: string;
}

const CommunityRequestForm = () => {
    const colorScheme = useColorScheme() ?? "light";
    const imagePickerRef = useRef(null);
    const [image, setImage] = useState<string | null>(null);
    const inset = useSafeAreaInsets();
    const router = useRouter();
    const [nameInput, setNameInput] = useState("");
    const [descInput, setDescInput] = useState("");
    const [isPublic, setIsPublic] = useState(true);

    const { user, metadata } = useAuthStore();

    // Can add in categories

    const pickImage = async () => {
        const permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    // HTTP API Request to BE
    // Remember to add support for image upload to BE
    // Remember to add zod form valdiaton
    // Remember to add JWT token for user_id
    async function handleFormSubmit() {
        // Check if input is empty
        if (!nameInput.trim() || !descInput.trim()) {
            throw Error("Invalid inputs");
        }

        mutate({ name: nameInput, description: descInput, public: isPublic });
    }

    const { mutate, isPending } = useMutation({
        mutationFn: async (newRequest: {
            name: string;
            description: string;
            public: boolean;
        }) => {
            const response = await api.post(
                `/${metadata?.inst_id}/communities/requests`,
                {
                    name: newRequest.name,
                    description: newRequest.description,
                    public: newRequest.public,
                },
            );

            return response.data;
        },
        onSuccess: () => {
            Alert.alert("Success", "Request submitted!");
            setNameInput("");
            setDescInput("");
            router.navigate("/(tabs)");
        },
        onError: (error) => {
            Alert.alert("Error", "Something went wrong.");
            console.error(error);
        },
    });

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
            {isPending && <Loading />}
            <ScrollView
                style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: Colors[colorScheme].bg,
                    flex: 1,
                }}
            >
                <ThemedText type="defaultSemiBold">
                    Community Application Form
                </ThemedText>
                <View
                    style={{
                        backgroundColor: Colors[colorScheme].bg_light,
                        flex: 1,
                        marginTop: 12,
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 12,
                        gap: 12,
                        borderRadius: 8,
                        elevation: 4,
                    }}
                >
                    {/* Image Picker */}
                    <Pressable onPress={pickImage}>
                        {image ? (
                            <Image
                                source={{ uri: image }}
                                style={{
                                    width: 84,
                                    height: 84,
                                    borderRadius: 42,
                                    resizeMode: "contain",
                                }}
                            />
                        ) : (
                            <View
                                style={{
                                    position: "relative",
                                    width: 84,
                                    height: 84,
                                    backgroundColor:
                                        Colors[colorScheme].bg_dark,
                                    borderRadius: 100,
                                    borderWidth: 1,
                                    borderStyle: "dashed",
                                    borderColor: Colors[colorScheme].caption,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Feather
                                    name="camera"
                                    size={28}
                                    color={Colors[colorScheme].text}
                                />
                            </View>
                        )}
                    </Pressable>
                    <View style={[styles.inputContainer]}>
                        <ThemedText
                            type="body_medium"
                            emphasized
                            style={{ color: Colors[colorScheme].caption }}
                        >
                            Community Name
                        </ThemedText>
                        <TextInput
                            editable
                            value={nameInput}
                            onChangeText={setNameInput}
                            style={[
                                styles.input,
                                {
                                    backgroundColor:
                                        Colors[colorScheme].bg_dark,
                                },
                            ]}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <ThemedText
                            type="body_medium"
                            emphasized
                            style={{ color: Colors[colorScheme].caption }}
                        >
                            Description
                        </ThemedText>
                        <TextInput
                            editable
                            multiline
                            value={descInput}
                            onChangeText={setDescInput}
                            numberOfLines={4}
                            style={[
                                styles.input,
                                {
                                    backgroundColor:
                                        Colors[colorScheme].bg_dark,
                                    height: 80,
                                    textAlignVertical: "top",
                                },
                            ]}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <ThemedText
                            type="body_medium"
                            emphasized
                            style={{ color: Colors[colorScheme].caption }}
                        >
                            Public or Private
                        </ThemedText>
                        <View style={{ flexDirection: "row", gap: 12 }}>
                            <Pressable
                                style={[
                                    styles.selectionButton,
                                    {
                                        backgroundColor: isPublic
                                            ? Colors[colorScheme].secondary
                                            : Colors[colorScheme].bg_light,
                                    },
                                ]}
                                onPress={() => setIsPublic(true)}
                            >
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={{ color: Colors[colorScheme].text }}
                                >
                                    Public
                                </ThemedText>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.selectionButton,
                                    {
                                        backgroundColor: !isPublic
                                            ? Colors[colorScheme].secondary
                                            : Colors[colorScheme].bg_light,
                                    },
                                ]}
                                onPress={() => setIsPublic(false)}
                            >
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={{ color: Colors[colorScheme].text }}
                                >
                                    Private
                                </ThemedText>
                            </Pressable>
                        </View>
                    </View>
                    <View style={[styles.flexRowContainer, { marginTop: 16 }]}>
                        <Pressable
                            style={[
                                styles.button,
                                { backgroundColor: Colors[colorScheme].text },
                            ]}
                            onPress={router.back}
                        >
                            <ThemedText
                                emphasized
                                style={{
                                    color: Colors[colorScheme].button_text,
                                }}
                            >
                                Cancel
                            </ThemedText>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.button,
                                { backgroundColor: Colors[colorScheme].tint },
                            ]}
                            onPress={handleFormSubmit}
                            disabled={isPending}
                        >
                            <ThemedText
                                emphasized
                                style={{
                                    color: Colors[colorScheme].button_text,
                                }}
                            >
                                Apply
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
        flex: 1,
        paddingHorizontal: 12,
        width: "100%",
        borderRadius: 8,
    },
    inputContainer: {
        flex: 1,
        gap: 4,
        alignSelf: "flex-start",
        width: "100%",
    },
    flexRowContainer: {
        flex: 1,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    selectionButton: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderRadius: 20,
        elevation: 2,
    },
});

export default CommunityRequestForm;
