import { View, Text, StyleSheet } from "react-native";
import { useEffect } from "react";
import {
    AudioSession,
    LiveKitRoom,
    useTracks,
    TrackReferenceOrPlaceholder,
    VideoTrack,
    isTrackReference,
} from "@livekit/react-native";
import { Track } from "livekit-client";
import { FlashList, ListRenderItem } from "@shopify/flash-list";

const RoomView = () => {
    const tracks = useTracks([Track.Source.Camera]);

    const renderTrack: ListRenderItem<TrackReferenceOrPlaceholder> = ({
        item,
    }) => {
        // Render using the VideoTrack component.
        if (isTrackReference(item)) {
            return (
                <VideoTrack trackRef={item} style={styles.participantView} />
            );
        } else {
            return <View style={styles.participantView} />;
        }
    };

    return (
        <View style={styles.container}>
            <FlashList data={tracks} renderItem={renderTrack} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "stretch",
        justifyContent: "center",
    },
    participantView: {
        height: 300,
    },
});
export default RoomView;
