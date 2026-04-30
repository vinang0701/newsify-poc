import {
	Text,
	StyleSheet,
	View,
	Button,
	Pressable,
	TextInput,
	ScrollView,
	useColorScheme,
} from "react-native";
import React, { Component, useState } from "react";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { UserProfileDetails } from "@/data/types";
import axios from "axios";
import { Image } from "expo-image";
import api from "@/lib/axios";
const BASE_URL = "http://10.0.2.2:8000/api/v1";
const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";
const user_id = "4813d507-9b97-4bb7-bee4-39ec47070889";

export default function Search() {
	const router = useRouter();
	const colorScheme = useColorScheme() || "light";
	const [isActive, setIsActive] = useState("posts");
	const [searchQuery, setSearchQuery] = useState("");

	const { data: searchResults, isFetching } = useQuery<UserProfileDetails[]>({
		queryKey: ["user_search", searchQuery],
		queryFn: async () => {
			if (!searchQuery) return [];
			const response = await api.get(
				`/${inst_id}/users?name=${searchQuery}`,
			);
			console.log(response.data);
			return response.data;
		},
		enabled: isActive === "users" && searchQuery.length > 2, // Only search after 3 characters
	});

	return (
		<SafeAreaView edges={["top"]} style={{ borderWidth: 1, flex: 1 }}>
			{/* Search Bar Header */}
			<View
				style={[
					styles.searchBarContainer,
					{ backgroundColor: Colors[colorScheme].tint },
				]}
			>
				<Pressable onPress={router.back}>
					<Feather
						name="arrow-left"
						size={24}
						color={Colors[colorScheme].button_text}
					/>
				</Pressable>

				<TextInput
					placeholder="Search..."
					value={searchQuery}
					onChangeText={setSearchQuery}
					placeholderTextColor={Colors[colorScheme].bg_dark}
					style={[
						styles.searchInput,
						{
							borderColor: Colors[colorScheme].bg,
							borderWidth: 1,
							color: Colors[colorScheme].bg_light,
						},
					]}
				/>
			</View>
			<View
				style={{
					padding: 8,
					flexDirection: "row",
					justifyContent: "center",
					backgroundColor: Colors[colorScheme].bg_light,
				}}
			>
				<Pressable
					style={[
						{
							flex: 1,
							justifyContent: "center",
							alignItems: "center",
							padding: 4,
						},
						isActive === "posts" && {
							borderBottomWidth: 3,
						},
					]}
					onPress={() => setIsActive("posts")}
				>
					<ThemedText type="body_medium" emphasized>
						Posts
					</ThemedText>
				</Pressable>
				<Pressable
					onPress={() => setIsActive("users")}
					style={[
						{
							flex: 1,
							justifyContent: "center",
							alignItems: "center",
							padding: 4,
						},
						isActive === "users" && {
							borderBottomWidth: 3,
						},
					]}
				>
					<ThemedText type="body_medium" emphasized>
						Users
					</ThemedText>
				</Pressable>
			</View>
			<FlashList
				contentContainerStyle={{
					flex: 1,
					paddingHorizontal: 16,
					backgroundColor: Colors[colorScheme].bg_light,
				}}
				data={searchResults}
				renderItem={({ item }) => (
					<Pressable
						style={{
							marginBottom: 16,
							flexDirection: "row",
							alignItems: "center",
							gap: 8,
						}}
						onPress={() => {
							router.push(`/(tabs)/profile_page/${item.id}`);
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
					</Pressable>
				)}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	searchBarContainer: {
		flex: 0,
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
		alignItems: "center",
	},
	searchInput: {
		flex: 1,
		borderRadius: 20,
		paddingLeft: 16,
		marginLeft: 8,
	},
});
