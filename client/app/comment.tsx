import { StyleSheet, Text, View } from "react-native";
import React, { useCallback, useMemo, useRef } from "react";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import CommentsModal from "@/components/comments_modal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useNavigation, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Comment = () => {
    const snapPoints = useMemo(() => ["100%"], []);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const handleSheetChange = (index: number) => {
        if (index === -1) {
            router.back();
        }
    };

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

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheet
                ref={bottomSheetRef}
                index={1}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                enablePanDownToClose
                topInset={insets.top}
                onChange={handleSheetChange}
                animationConfigs={{
                    duration: 180,
                }}
            >
                <CommentsModal />
            </BottomSheet>
        </GestureHandlerRootView>
    );
};

export default Comment;

const styles = StyleSheet.create({});
