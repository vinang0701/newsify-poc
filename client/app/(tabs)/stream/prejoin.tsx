import { View, Text } from "react-native";
import { useEffect } from "react";
import {
    AudioSession,
    LiveKitRoom,
    useTracks,
    TrackReferenceOrPlaceholder,
    VideoTrack,
    isTrackReference,
} from "@livekit/react-native";

import RoomView from "./player";

const wsURL = "wss://newsify-93y76ebs.livekit.cloud";
const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzY5MjIxNTEsImlkZW50aXR5IjoicGhvbmUiLCJpc3MiOiJBUEl4cnFmSGZ3eVlCenMiLCJuYmYiOjE3NzY5MjEyNTEsInN1YiI6InBob25lIiwidmlkZW8iOnsiY2FuUHVibGlzaCI6dHJ1ZSwiY2FuUHVibGlzaERhdGEiOnRydWUsImNhblN1YnNjcmliZSI6dHJ1ZSwicm9vbSI6InRlc3QgcGhvbmUiLCJyb29tSm9pbiI6dHJ1ZX19.Us2c3qIiKMv3GLJLvW6yQ297eIppHF3GvS8Fo9218ug";

const Prejoin = () => {
    useEffect(() => {
        let start = async () => {
            await AudioSession.startAudioSession();
        };

        start();
        return () => {
            AudioSession.stopAudioSession();
        };
    }, []);
    return (
        <LiveKitRoom
            serverUrl={wsURL}
            token={token}
            connect={true}
            options={{
                // Use screen pixel density to handle screens with differing densities.
                adaptiveStream: { pixelDensity: "screen" },
            }}
            audio={true}
            video={true}
        >
            <RoomView />
        </LiveKitRoom>
    );
};

export default Prejoin;
