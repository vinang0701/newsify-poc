import {
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
} from "react-native";
import React from "react";
import Feather from "@expo/vector-icons/Feather";
import { Colors } from "@/constants/theme";

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
}

const SearchBar = ({ value, onChangeText }: SearchBarProps) => {
    const colorScheme = useColorScheme() ?? "light";
    return (
        <View
            style={[
                styles.flexRowContainer,
                {
                    backgroundColor: Colors[colorScheme].bg_dark,
                    paddingHorizontal: 12,
                    borderRadius: 20,
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
                value={value} // 1. Bind the value to the prop
                onChangeText={onChangeText} // 2. Call the parent function
                placeholderTextColor={Colors[colorScheme].caption}
                style={[
                    styles.searchInput,
                    {
                        color: Colors[colorScheme].text, // Ensure text is visible
                        borderColor: "transparent",
                    },
                ]}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    flexRowContainer: {
        flex: 1,
        alignItems: "center",
        flexDirection: "row",
    },
    searchInput: {
        flex: 1,
        borderRadius: 8,
        minHeight: 32,
        maxHeight: 120,
        borderWidth: 1,
        paddingVertical: 4,
        fontSize: 12,
        textAlignVertical: "center",
    },
});

export default SearchBar;
