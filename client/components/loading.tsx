import { View, Text, StyleSheet } from "react-native";
import React from "react";

const Loading = () => {
    return (
        <View style={styles.overlay}>
            <View style={styles.loader} />
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255,255,255,0.8)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },

    loader: {
        width: 40,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
    },
});
export default Loading;
