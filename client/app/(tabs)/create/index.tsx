import { Image } from "expo-image";
import {
	Pressable,
	StyleSheet,
	Text,
	useColorScheme,
	View,
	Button,
} from "react-native";
import { EnrichedTextInput } from "react-native-enriched";
import type {
	EnrichedTextInputInstance,
	OnChangeStateEvent,
} from "react-native-enriched";

import Animated, {
	interpolate,
	useAnimatedRef,
	useAnimatedStyle,
	useScrollOffset,
} from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
export default function CreatePost() {
	const SERVER_URL =
		(process.env.EXPO_PUBLIC_SERVER_URL as string) ?? undefined;

	const colorScheme = useColorScheme() ?? "light";
	const queryClient = useQueryClient();
	const ref = useRef<EnrichedTextInputInstance>(null);

	const [stylesState, setStylesState] = useState<OnChangeStateEvent | null>();
	return (
		<SafeAreaView>
			<Animated.ScrollView>
				<Header />
				<ThemedView style={styles.titleContainer}>
					<ThemedText type="sub_heading">Creating a Post</ThemedText>
				</ThemedView>
				{/* Tab navigation */}
				<ThemedView style={{ flexDirection: "row", gap: 8 }}>
					<Pressable
						onPress={() => {}}
						style={[
							styles.button,
							{ backgroundColor: Colors[colorScheme].tint },
						]}
					>
						<ThemedText
							style={{ color: Colors[colorScheme].button_text }}
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
							style={{ color: Colors[colorScheme].button_text }}
						>
							Drafts
						</ThemedText>
					</Pressable>
				</ThemedView>
				{/* Rich Text Editor */}
				<View style={styles.container}>
					<EnrichedTextInput
						ref={ref}
						onChangeState={(e) => setStylesState(e.nativeEvent)}
						style={styles.input}
					/>
					<Button
						title={stylesState?.bold.isActive ? "Unbold" : "Bold"}
						color={stylesState?.bold.isActive ? "green" : "gray"}
						onPress={() => ref.current?.toggleBold()}
					/>
				</View>
			</Animated.ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8,
	},
	button: {
		alignSelf: "flex-start",
		paddingVertical: 4,
		paddingHorizontal: 12,
		marginTop: 12,
	},
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	input: {
		width: "100%",
		fontSize: 20,
		padding: 10,
		maxHeight: 200,
		backgroundColor: "lightgray",
	},
});
