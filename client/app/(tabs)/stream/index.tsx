import {
	Pressable,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	useColorScheme,
	View,
} from "react-native";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { FlashList } from "@shopify/flash-list";
import { Link, useRouter } from "expo-router";
import liveStreamData from "@/data/livestreams.json";
import { LiveStream } from "@/data/types";
import { Image } from "expo-image";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Checkbox from "expo-checkbox";

const DATA = [
	{
		id: "1",
		title: "LIVE",
	},
	{
		id: "2",
		title: "Upcoming",
	},
	{
		id: "3",
		title: "Following",
	},
];

const StreamTab = () => {
	const colorScheme = useColorScheme() ?? "light";
	const [activeFilter, setActiveFilter] = useState("LIVE");
	const [liveStream, setLiveStream] = useState<LiveStream[]>([]);
	const router = useRouter();
	const snapPoints = useMemo(() => ["80%"], []);
	const bottomSheetRef = useRef<BottomSheet>(null);

	const handleExpandSheet = () => bottomSheetRef.current?.expand();
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

	useEffect(() => {
		const fetchData = () => {
			if (!liveStreamData?.livestreams) return;

			const formattedLiveStreams = liveStreamData.livestreams.map(
				(stream) => ({
					id: stream.id,
					title: stream.title,
					desc: stream.desc ?? "",
					community: stream.community ?? "",
					view_count: stream.viewer_count ?? 0,
				}),
			);

			setLiveStream(formattedLiveStreams);
		};
		fetchData();
	}, []);

	const handleLiveStreamPress = (id: string) => {
		router.push({
			pathname: "/community/[communityId]",
			params: { communityId: id },
		});
	};

	return (
		<GestureHandlerRootView>
			<SafeAreaView style={{ flex: 1 }} edges={["top"]}>
				<FlashList
					contentContainerStyle={{
						paddingHorizontal: 16,
						paddingVertical: 12,
						backgroundColor: Colors[colorScheme].bg,
					}}
					// style={styles.liveStreamContainer}
					data={liveStream}
					nestedScrollEnabled={false}
					ListHeaderComponent={
						<>
							<ThemedText
								type="sub_heading"
								style={{
									marginBottom: 12,
								}}
							>
								Live Streams
							</ThemedText>
							<View>
								<FlashList
									keyExtractor={(item) => item.id}
									horizontal
									style={{
										marginBottom: 12,
										elevation: 10,
									}}
									data={DATA}
									renderItem={({ item }) => (
										<Pressable
											style={{
												paddingHorizontal: 12,
												paddingVertical: 4,
												backgroundColor:
													activeFilter === item.title
														? Colors[colorScheme]
																.tint
														: Colors[colorScheme]
																.bg_light,
												borderColor:
													Colors[colorScheme].border,
												borderWidth: 1,
												marginRight: 8,
												borderRadius: 4,
											}}
											onPress={() => {
												// Check if active state is pressed
												if (
													activeFilter === item.title
												) {
													return;
												} else {
													setActiveFilter(item.title);
												}
											}}
										>
											<ThemedText
												type="body_small"
												emphasized={true}
												style={{
													color:
														activeFilter ===
														item.title
															? Colors[
																	colorScheme
																].button_text
															: Colors[
																	colorScheme
																].tint,
												}}
											>
												{item.title}
											</ThemedText>
										</Pressable>
									)}
								/>
							</View>
						</>
					}
					renderItem={({ item }) => (
						<Pressable
							onPress={() => handleLiveStreamPress(item.id)}
						>
							<View
								style={[
									styles.card,
									{
										borderColor: Colors[colorScheme].border,
										backgroundColor:
											Colors[colorScheme].bg_light,
									},
								]}
							>
								<Image
									source={require(
										`@/assets/images/react-logo3x.png`,
									)}
									style={{
										width: "100%",
										height: 200,
										resizeMode: "contain",
										borderWidth: 1,
										borderColor: Colors[colorScheme].border,
										borderRadius: 8,
									}}
								/>
								{/* Info Container */}
								<View
									style={[
										styles.flexRowContainer,
										styles.infoContainer,
									]}
								>
									<Image
										source={require("@/assets/images/icon.png")}
										style={{
											width: 24,
											height: 24,
											resizeMode: "contain",
											borderWidth: 1,
											borderColor:
												Colors[colorScheme].border,
											borderRadius: 100,
										}}
									/>
									<ThemedText type="body_medium" emphasized>
										{item.community}
									</ThemedText>
								</View>
								<ThemedText type="sub_heading">
									{item.title}
								</ThemedText>
								<ThemedText
									type="body_small"
									style={{
										color: Colors[colorScheme].caption,
									}}
								>
									{item.desc}
								</ThemedText>
								<View
									style={[
										styles.flexRowContainer,
										{
											gap: 12,
											justifyContent: "flex-start",
										},
									]}
								>
									<View
										style={[
											styles.flexRowContainer,
											{ gap: 4 },
										]}
									>
										<MaterialCommunityIcons
											name="clock-outline"
											size={16}
											color={Colors[colorScheme].caption}
										/>
										<ThemedText
											type="caption"
											emphasized
											style={{
												color: Colors[colorScheme]
													.caption,
											}}
										>
											LIVE
										</ThemedText>
									</View>
									<View
										style={[
											styles.flexRowContainer,
											{ gap: 4 },
										]}
									>
										<MaterialCommunityIcons
											name="clock-outline"
											size={16}
											color={Colors[colorScheme].caption}
										/>
										<ThemedText
											type="caption"
											emphasized
											style={{
												color: Colors[colorScheme]
													.caption,
											}}
										>
											{item.view_count}
										</ThemedText>
									</View>
								</View>
							</View>
						</Pressable>
					)}
				/>

				<Pressable
					style={{
						position: "absolute",
						right: 16,
						bottom: 16,
						padding: 8,
						backgroundColor: Colors[colorScheme].tint,
						borderRadius: 100,
					}}
					onPress={() => {
						handleExpandSheet();
					}}
				>
					<MaterialCommunityIcons
						name="plus"
						size={40}
						color={Colors[colorScheme].button_text}
					/>
				</Pressable>
				<BottomSheet
					ref={bottomSheetRef}
					index={-1}
					snapPoints={snapPoints}
					backdropComponent={renderBackdrop}
					enablePanDownToClose
				>
					<BottomSheetView style={styles.bottomSheet}>
						<View style={styles.sheetInfoContainer}>
							<TextInput
								placeholder="Title"
								style={{
									borderRadius: 8,
									backgroundColor:
										Colors[colorScheme].bg_dark,
									padding: 12,
									fontSize: 28,
									fontWeight: 600,
								}}
							/>
							<TextInput
								multiline={true}
								numberOfLines={4}
								placeholder="Say something"
								style={{
									borderRadius: 8,
									backgroundColor:
										Colors[colorScheme].bg_dark,
									padding: 12,
									fontSize: 16,
									fontWeight: 600,
									minHeight: 56,
								}}
							/>
							<View
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
								}}
							>
								<ThemedText emphasized>
									Allow Live Chat
								</ThemedText>
								<Switch />
							</View>
						</View>
						<View
							style={{
								width: "100%",
								borderWidth: 0.5,
								borderColor: Colors[colorScheme].border,
							}}
						/>
						<View style={[styles.sheetInfoContainer, { flex: 1 }]}>
							<ThemedText type="sub_heading">Audience</ThemedText>
							<View
								style={[
									styles.flexRowContainer,
									{
										justifyContent: "space-between",
									},
								]}
							>
								<ThemedText emphasized>School</ThemedText>
								<Checkbox />
							</View>
							{/* Search bar */}
							{/* Communities */}
							{/* Start Button */}
							<Pressable
								style={[
									styles.startButton,
									{
										backgroundColor:
											Colors[colorScheme].alert_red,
									},
								]}
								onPress={() =>
									router.navigate("/stream/prejoin")
								}
							>
								<ThemedText
									emphasized
									style={{
										color: Colors[colorScheme].button_text,
									}}
								>
									Start Live Stream
								</ThemedText>
							</Pressable>
						</View>
					</BottomSheetView>
				</BottomSheet>
			</SafeAreaView>
		</GestureHandlerRootView>
	);
};

export default StreamTab;

const styles = StyleSheet.create({
	liveStreamContainer: {
		flex: 1,
		flexDirection: "column",
		paddingVertical: 8,
	},
	card: {
		width: "100%",
		flex: 1,
		borderRadius: 12,
		padding: 12,
		marginBottom: 12,
		gap: 12,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.25,
		shadowRadius: 12,
		elevation: 4,
	},
	flexRowContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	infoContainer: {
		gap: 8,
		justifyContent: "flex-start",
	},
	bottomSheet: {
		flexDirection: "column",
		height: "100%",
	},
	sheetInfoContainer: {
		flexDirection: "column",
		paddingVertical: 12,
		paddingHorizontal: 16,
		gap: 12,
	},
	startButton: {
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		padding: 8,
		marginTop: "auto",
	},
	streamPlayer: {
		width: "100%",
		height: "80%",
		alignSelf: "center",
	},
});
