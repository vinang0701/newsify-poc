import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";
import React from "react";
import { Colors } from "@/constants/theme";

const Loading = () => {
    return (
        <Modal transparent visible={true} animationType="fade">
            <View style={styles.overlay}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
            </View>
        </Modal>
    );
};

export default Loading;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
});
