import { Colors } from "@/constants/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
	Text,
	View,
	BackHandler,
	Pressable,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, usePathname, useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import Animated from "react-native-reanimated";
import React from "react";

export function Header() {
	const colorScheme = useColorScheme() || "light";
	const path = usePathname();
	const router = useRouter();

	return (
		<SafeAreaView
			edges={["top"]}
			style={[
				styles.headerContainer,
				{
					backgroundColor: Colors[colorScheme].bg_light,
				},
			]}
		>
			<TouchableOpacity>
				<Feather
					name="bell"
					size={24}
					color={Colors[colorScheme].text}
					weight="bold"
				/>
			</TouchableOpacity>

			<Text
				style={{
					fontSize: 24,
					color: Colors[colorScheme].tint,
				}}
			>
				N
			</Text>

			<Link href="/search" push asChild>
				<Pressable onPress={() => console.log("hello")}>
					<Animated.View>
						<Feather name="search" size={24} />
					</Animated.View>
				</Pressable>
			</Link>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	headerContainer: {
		flex: 0,
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
		alignItems: "center",
	},
	searchBar: {
		flex: 1,
		textAlignVertical: "center",
		justifyContent: "center",
		marginLeft: 8,
		borderRadius: 20,

		paddingLeft: 8,
	},
});
