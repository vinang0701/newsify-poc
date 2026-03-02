import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import newsArticles from "@/data/news.json";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { Image } from "expo-image";
import { Link } from "expo-router";
import * as React from "react";
import { useEffect, useState } from "react";
import {
	Text,
	Button,
	FlatList,
	Pressable,
	ScrollView,
	StyleSheet,
	TouchableHighlight,
	useColorScheme,
	View,
} from "react-native";

const HEADER_HEIGHT = 250;

type News = {
	title: string;
	author: string;
	desc: string;
	url: string;
	urlToImage: string;
	content: string;
};

const DATA = [
	{
		id: "1",
		title: "Recent",
	},
	{
		id: "2",
		title: "Important",
	},
	{
		id: "3",
		title: "Following",
	},
];

// Substack like news feed
// avatar, name, time ago, 3 dots on the right
// title, image, preview text, read more
// like, comment, repost, save

type ItemProps = { title: string };
const FilterItem = ({ title }: ItemProps) => {
	const colorScheme = useColorScheme() ?? "light";

	return (
		<Pressable
			style={{
				paddingHorizontal: 12,
				paddingVertical: 4,
				backgroundColor: Colors[colorScheme].bg_light,
				borderRadius: 4,
				marginRight: 8,
			}}
		>
			<Text
				style={{
					color: Colors[colorScheme].tint,
				}}
			>
				{title}
			</Text>
		</Pressable>
	);
};

export default function HomeScreen() {
	const colorScheme = useColorScheme() ?? "light";

	const [news, setNews] = useState<News[]>([]);
	// const articles = newsArticles.articles.map((newsItem: News) => {
	// 	title: newsItem.title;
	// 	author: newsItem.author ?? "";
	// 	desc: newsItem.desc ?? "";
	// 	url: newsItem.url ?? "";
	// 	urlToImage: newsItem.urlToImage ?? "";
	// 	content: newsItem.content ?? "";
	// });
	useEffect(() => {
		const articles = newsArticles.articles.map((newsItem, index) => ({
			title: newsItem.title,
			author: newsItem.author ?? "",
			desc: newsItem.description ?? "",
			url: newsItem.url ?? "",
			urlToImage: newsItem.urlToImage ?? "",
			content: newsItem.content ?? "",
		}));

		setNews((prev) => [...prev, ...articles]);
	}, []);

	return (
		<ScrollView
			style={[
				styles.bodyContainer,
				{ backgroundColor: Colors[colorScheme].bg },
			]}
		>
			<View style={{ marginBottom: 12 }}>
				<FlatList
					data={DATA}
					renderItem={({ item }) => <FilterItem title={item.title} />}
					keyExtractor={(item) => item.id}
					horizontal={true}
				/>
			</View>

			{news.map((newsItem, index) => {
				return (
					<View
						key={index}
						style={[
							styles.card,
							{
								backgroundColor: Colors[colorScheme].bg_light,
							},
						]}
					>
						<View style={styles.cardInfoContainer}>
							<Image
								source={require("@/assets/images/profile.png")}
								style={{ width: 28, height: 28 }}
							/>
							<ThemedText type="defaultSemiBold">
								Author
							</ThemedText>
							<ThemedText
								type="default"
								style={{
									fontSize: 10,
									color: "hsl(0, 0%, 5%)",
								}}
							>
								1d
							</ThemedText>
							<TouchableHighlight style={{ marginLeft: "auto" }}>
								<Feather
									name="more-vertical"
									size={20}
									color={Colors[colorScheme].icon}
								/>
							</TouchableHighlight>
						</View>
						<View>
							{/* Content */}
							<Image
								alt="image"
								source={{
									uri: newsItem.urlToImage,
								}}
								style={{
									width: "100%",
									height: 200,
									resizeMode: "cover",
								}}
							/>
							<ThemedText
								type="title"
								style={{
									paddingTop: 12,
									paddingHorizontal: 12,
									fontSize: 20,
								}}
							>
								{newsItem.title}
							</ThemedText>
							<ThemedText
								style={{
									paddingVertical: 4,
									paddingHorizontal: 12,
									fontSize: 14,
								}}
							>
								{newsItem.content?.replace(
									/\s*\[\+\d+ chars\]$/,
									"",
								)}
								<Link href="/(tabs)/create-post">
									<ThemedText
										type="link"
										style={{ fontSize: 14 }}
									>
										Read More
									</ThemedText>
								</Link>
							</ThemedText>
						</View>

						<View style={styles.iconsContainer}>
							{/* Interaction */}
							<View
								style={{
									flex: 1,
									flexDirection: "row",
									justifyContent: "flex-start",
								}}
							>
								<Pressable
									style={{
										flex: 1,
										flexDirection: "row",
										gap: 4,
										alignItems: "center",
										justifyContent: "flex-start",
									}}
								>
									<Feather
										name="heart"
										size={24}
										color="black"
									/>
									<Text>100</Text>
								</Pressable>
								<Pressable
									style={{
										flex: 1,
										flexDirection: "row",
										gap: 4,
										justifyContent: "flex-start",
										alignItems: "center",
									}}
								>
									<Feather
										name="message-square"
										size={24}
										color="black"
									/>
									<Text>100</Text>
								</Pressable>
								<Pressable
									style={{
										flex: 1,
										flexDirection: "row",
										justifyContent: "flex-start",
										gap: 4,
										alignItems: "center",
									}}
								>
									<Feather
										name="repeat"
										size={24}
										color="black"
									/>
									<Text>100</Text>
								</Pressable>
							</View>
							<Feather name="bookmark" size={24} color="black" />
						</View>
					</View>
				);
			})}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	header: {
		height: HEADER_HEIGHT,
		overflow: "hidden",
	},
	bodyContainer: {
		paddingHorizontal: 16,
		paddingTop: 8,
	},
	card: {
		flex: 1,
		gap: 8,
		alignContent: "flex-start",
		borderRadius: 8,
		paddingVertical: 24,
		marginBottom: 4,
		minHeight: 200,
	},
	cardInfoContainer: {
		flex: 1,
		gap: 8,
		alignItems: "center",
		flexDirection: "row",
		paddingHorizontal: 12,
	},

	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8,
	},
	iconsContainer: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		paddingTop: 8,
		paddingHorizontal: 12,
	},
});
