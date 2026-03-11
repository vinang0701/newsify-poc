import { Image } from "expo-image";
import {
	Pressable,
	StyleSheet,
	Text,
	useColorScheme,
	View,
	Button,
	TextInput,
	ScrollView,
} from "react-native";
import { EnrichedTextInput } from "react-native-enriched";
import type {
	EnrichedTextInputInstance,
	OnChangeStateEvent,
} from "react-native-enriched";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import { WebView } from "react-native-webview";

export default function CreatePost() {
	const colorScheme = useColorScheme() ?? "light";
	const ref = useRef<EnrichedTextInputInstance>(null);
	const [inputValue, setInputValue] = useState("");

	const [stylesState, setStylesState] = useState<OnChangeStateEvent | null>();
	return (
		<ScrollView
			style={{
				backgroundColor: Colors[colorScheme].bg,
			}}
		>
			<SafeAreaView>
				<Header />
			</SafeAreaView>

			<View style={{ paddingHorizontal: 16, gap: 24 }}>
				<ThemedView style={styles.titleContainer}>
					<ThemedText type="sub_heading">Creating a Post</ThemedText>
				</ThemedView>
				{/* Tab navigation */}
				<ThemedView
					style={{
						flexDirection: "row",
						gap: 8,
					}}
				>
					<Pressable
						onPress={() => {}}
						style={[
							styles.button,
							{ backgroundColor: Colors[colorScheme].tint },
						]}
					>
						<ThemedText
							style={{
								color: Colors[colorScheme].button_text,
							}}
						>
							New
						</ThemedText>
					</Pressable>
					<Pressable
						onPress={() => {}}
						style={[
							styles.button,
							{ backgroundColor: Colors[colorScheme].tint },
						]}
					>
						<ThemedText
							style={{
								color: Colors[colorScheme].button_text,
							}}
						>
							Drafts
						</ThemedText>
					</Pressable>
				</ThemedView>
				{/* Rich Text Editor */}
				<TextInput
					editable
					multiline
					numberOfLines={4}
					value={inputValue}
					onChangeText={(text) => {
						setInputValue(text);
					}}
					style={styles.textInput}
				/>
				<Pressable
					style={[
						styles.button,
						{
							backgroundColor: Colors[colorScheme].tint,
							alignSelf: "flex-end",
						},
					]}
				>
					<ThemedText
						type="defaultSemiBold"
						style={{ color: Colors[colorScheme].button_text }}
					>
						Publish
					</ThemedText>
				</Pressable>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	button: {
		alignSelf: "flex-start",
		paddingVertical: 4,
		paddingHorizontal: 12,
		borderRadius: 8,
	},
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	textInput: {
		padding: 16,
		textAlignVertical: "top",
		height: "100%",
		borderColor: "#000",
		borderWidth: 1,
	},
});
