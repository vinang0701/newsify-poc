import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Pressable,
    useColorScheme,
} from "react-native";
import type {
    NativeSyntheticEvent,
    TextInputKeyPressEvent,
} from "react-native";
import React, { useRef, useState } from "react";
import { Colors } from "@/constants/theme";

interface OTPInputProps {
    value: string[];
    onChange: (value: string[]) => void;
    length?: number;
    disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
    value,
    onChange,
    length = 6,
    disabled = false,
}) => {
    const colourScheme = "light";
    const inputRefs = useRef<TextInput[]>([]);

    const focusInput = (index: number) => {
        if (inputRefs.current[index]) {
            inputRefs.current[index].focus();
        }
    };

    const handleChange = (text: string, index: number) => {
        // 1. Handle Pasting (if text is longer than 1 character)
        if (text.length > 1) {
            const pastedData = text.slice(0, length).split("");
            const newValue = [...value];
            pastedData.forEach((char, i) => {
                if (index + i < length) newValue[index + i] = char;
            });
            onChange(newValue);
            focusInput(Math.min(index + pastedData.length, length - 1));
            return;
        }

        // 2. Normal Single Character Input
        const newValue = [...value];
        newValue[index] = text;
        onChange(newValue);

        if (text && index < length - 1) {
            focusInput(index + 1);
        }
    };

    const handleKeyPress = (event: any, index: number) => {
        // Handle Backspace
        if (event.nativeEvent.key === "Backspace") {
            if (!value[index] && index > 0) {
                // If box is empty, go back and clear previous box
                const newValue = [...value];
                newValue[index - 1] = "";
                onChange(newValue);
                focusInput(index - 1);
            }
        }
    };

    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {Array(length)
                .fill(0)
                .map((_, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => {
                            if (ref) inputRefs.current[index] = ref;
                        }}
                        value={value[index]}
                        onChangeText={(text) => handleChange(text, index)}
                        keyboardType="number-pad"
                        maxLength={index === 0 ? length : 1}
                        editable={!disabled}
                        selectTextOnFocus
                        onKeyPress={(event) => handleKeyPress(event, index)}
                        textContentType="oneTimeCode"
                        style={{
                            height: 56,
                            width: 48,
                            backgroundColor: Colors[colourScheme].bg_light,
                            borderWidth: 1,
                            borderColor: Colors[colourScheme].border,
                            borderRadius: 4,
                            fontSize: 32,
                            lineHeight: 1.3,
                            paddingVertical: 8,
                            fontWeight: "bold",
                            textAlign: "center",
                            textAlignVertical: "center",
                        }}
                    />
                ))}
        </View>
    );
};

export default OTPInput;

const styles = StyleSheet.create({});
