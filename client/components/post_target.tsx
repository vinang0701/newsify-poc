import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
} from "react-native";
import { ThemedText } from "./themed-text";
import React, { Dispatch, SetStateAction, useState } from "react";
import Checkbox from "expo-checkbox";
import { Colors } from "@/constants/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { FlashList } from "@shopify/flash-list";
import { Community } from "@/data/types";
import Feather from "@expo/vector-icons/Feather";
import { UserCommunities } from "@/hooks/useCommunity";

interface PostTargetProps {
    isSchoolChecked: boolean;
    setIsSchoolChecked: Dispatch<SetStateAction<boolean>>;
    selectedIds: string[];
    setSelectedIds: Dispatch<SetStateAction<string[]>>;
    selectedCategoryId: string;
    setSelectedCategoryId: Dispatch<SetStateAction<string>>;
    selectedCategoryName: string;
    setSelectedCategoryName: Dispatch<SetStateAction<string>>;
    categories: {
        category_id: string;
        category_name: string;
    }[];
    communities: UserCommunities[] | undefined;
    onBack: () => void;
    onSubmit: () => void;
}

const PostTarget = ({
    isSchoolChecked,
    setIsSchoolChecked,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedCategoryName,
    setSelectedCategoryName,
    selectedIds,
    setSelectedIds,
    categories,
    communities,
    onBack,
    onSubmit,
}: PostTargetProps) => {
    const colorScheme = useColorScheme() ?? "light";

    const [pickerVisible, setPickerVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        console.log("Searching for:", text);
        // You can trigger your filtering logic or API calls here
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(
            (prev) =>
                prev.includes(id)
                    ? prev.filter((item) => item !== id) // Remove if exists
                    : [...prev, id], // Add if not exists
        );
    };

    return (
        <View
            style={[
                styles.cardContainer,
                {
                    backgroundColor: Colors[colorScheme].bg_light,
                    borderColor: Colors[colorScheme].border,
                },
            ]}
        >
            {/* Categories Selector */}
            <View
                style={[
                    styles.selectorContainer,
                    { borderBottomColor: Colors[colorScheme].border },
                ]}
            >
                <ThemedText type="defaultSemiBold" style={{ marginBottom: 4 }}>
                    Select a category
                </ThemedText>
                <Pressable
                    style={[
                        styles.selector,
                        {
                            backgroundColor: Colors[colorScheme].bg,
                        },
                    ]}
                    onPress={() => setPickerVisible(!pickerVisible)}
                >
                    <ThemedText type="defaultSemiBold">
                        {selectedCategoryName || "Select a Category"}
                    </ThemedText>
                    <MaterialCommunityIcons
                        name="chevron-down" // "chevron-down" is more standard than a rotated triangle
                        size={20}
                        color={Colors[colorScheme].text}
                        style={{
                            transform: [
                                {
                                    rotate: pickerVisible ? "180deg" : "0deg",
                                },
                            ],
                        }}
                    />
                </Pressable>

                {pickerVisible && (
                    <>
                        {/* Invisible Backdrop to close dropdown when clicking outside */}
                        <Pressable
                            style={styles.backdrop}
                            onPress={() => setPickerVisible(false)}
                        />

                        <View
                            style={[
                                styles.dropdownMenu,
                                {
                                    backgroundColor:
                                        Colors[colorScheme].bg_dark,
                                    shadowColor: "#000",
                                },
                            ]}
                        >
                            <FlashList
                                data={categories}
                                keyExtractor={(item) =>
                                    item.category_id.toString()
                                }
                                ItemSeparatorComponent={() => (
                                    <View
                                        style={[
                                            styles.separator,
                                            {
                                                backgroundColor:
                                                    Colors[colorScheme].border,
                                            },
                                        ]}
                                    />
                                )}
                                renderItem={({ item }) => (
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.item,
                                            {
                                                opacity: pressed ? 0.7 : 1,
                                            },
                                        ]}
                                        onPress={() => {
                                            setSelectedCategoryId(
                                                item.category_id,
                                            );
                                            setSelectedCategoryName(
                                                item.category_name,
                                            );
                                            setPickerVisible(false);
                                        }}
                                    >
                                        <ThemedText
                                            style={{
                                                color:
                                                    selectedCategoryId ===
                                                    item.category_id
                                                        ? Colors[colorScheme]
                                                              .tint
                                                        : Colors[colorScheme]
                                                              .text,
                                            }}
                                        >
                                            {item.category_name}
                                        </ThemedText>

                                        {selectedCategoryId ===
                                            item.category_id && (
                                            <MaterialCommunityIcons
                                                name="check"
                                                size={18}
                                                color={Colors[colorScheme].tint}
                                            />
                                        )}
                                    </Pressable>
                                )}
                            />
                        </View>
                    </>
                )}
            </View>
            {/* Form */}

            <ThemedText
                type="defaultSemiBold"
                style={{ color: Colors[colorScheme].text, textAlign: "center" }}
            >
                Where would you like to post to?
            </ThemedText>
            {/* School Checkbox */}

            <View style={[styles.flexRowContainer, { gap: 8 }]}>
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

            {/* Communities */}
            <View style={{ flex: 1, borderRadius: 8, gap: 4 }}>
                <ThemedText
                    type="defaultSemiBold"
                    style={{ color: Colors[colorScheme].text }}
                >
                    Choose which communities you wish to post to.
                </ThemedText>
                {/* Search bar */}
                <View
                    style={[
                        styles.flexRowContainer,
                        {
                            backgroundColor: Colors[colorScheme].bg,
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
                        placeholderTextColor={Colors[colorScheme].caption}
                        style={[
                            styles.searchInput,
                            {
                                color: Colors[colorScheme].text,
                                borderColor: "transparent",
                            },
                        ]}
                    />
                </View>
                <View
                    style={{
                        flexShrink: 1,
                        height: 280,
                        padding: 4,
                        overflow: "hidden",
                    }}
                >
                    <FlashList
                        data={communities}
                        nestedScrollEnabled={true}
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyExtractor={(item) => item.community_id.toString()}
                        ListEmptyComponent={() => (
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={{ color: Colors[colorScheme].text }}
                                >
                                    You are not in any community.
                                </ThemedText>
                                <ThemedText
                                    type="body_medium"
                                    emphasized
                                    style={{
                                        color: Colors[colorScheme].caption,
                                        textAlign: "center",
                                    }}
                                >
                                    Join a community if you wish you share news
                                    there.
                                </ThemedText>
                            </View>
                        )}
                        ItemSeparatorComponent={() => (
                            <View
                                style={[
                                    styles.separator,
                                    {
                                        backgroundColor:
                                            Colors[colorScheme].border,
                                    },
                                ]}
                            />
                        )}
                        renderItem={({ item }) => (
                            <View
                                key={item.community_id}
                                style={[
                                    styles.flexRowContainer,
                                    {
                                        gap: 8,
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
                        onPress={onBack}
                    >
                        Back
                    </ThemedText>
                </Pressable>
                <Pressable
                    style={[
                        styles.button,
                        { backgroundColor: Colors[colorScheme].tint },
                    ]}
                    onPress={() => onSubmit()}
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
    );
};

export default PostTarget;

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 8,
        borderWidth: 1,
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        elevation: 4,
    },
    flexRowContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
    },
    checkbox: {
        width: 16,
        height: 16,
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
    actionButtonsContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    button: {
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 87,
    },
    // Category Selector
    selectorContainer: {
        width: "100%",
        zIndex: 100,
        borderBottomWidth: 1,
        paddingBottom: 12,
    },
    selector: {
        padding: 12,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.1)",
    },
    backdrop: {
        position: "absolute",
        top: -500, // Cover the whole screen
        left: -500,
        right: -500,
        bottom: -500,
        zIndex: 90,
    },
    dropdownMenu: {
        position: "absolute",
        top: 80,
        left: 0,
        width: "100%",
        borderRadius: 8,
        padding: 4,
        elevation: 5,
        zIndex: 100,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    item: {
        padding: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    separator: {
        height: 1,
        width: "100%",
        alignSelf: "center",
        opacity: 1,
    },
});
