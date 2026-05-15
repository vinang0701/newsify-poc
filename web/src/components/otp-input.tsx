import React, { useRef, useEffect } from "react";

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
    // Array of input references to control focus cleanly
    const inputRefs = useRef<HTMLInputElement[]>([]);

    // Ensure the value array matches the intended length on mount
    useEffect(() => {
        if (value.length !== length) {
            const updatedArray = Array(length)
                .fill("")
                .map((_, i) => value[i] || "");
            onChange(updatedArray);
        }
    }, [length]);

    const focusInput = (index: number) => {
        if (inputRefs.current[index]) {
            inputRefs.current[index].focus();
            inputRefs.current[index].select(); // Auto-select text on focus like web-native patterns
        }
    };

    const handleChange = (text: string, index: number) => {
        // Strip out non-numeric entries if you want a number-only pad
        const sanitizedText = text.replace(/[^0-9]/g, "");
        if (!sanitizedText && text !== "") return;

        const newValue = [...value];
        // Take only the last character typed if a box already contained data
        newValue[index] = sanitizedText.slice(-1);
        onChange(newValue);

        // Auto-advance focus to the right
        if (sanitizedText && index < length - 1) {
            focusInput(index + 1);
        }
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
        index: number,
    ) => {
        if (event.key === "Backspace") {
            // Case A: If current box has a value, clear it but stay in place
            if (value[index]) {
                const newValue = [...value];
                newValue[index] = "";
                onChange(newValue);
            }
            // Case B: If current box is empty, jump left and wipe out that value
            else if (index > 0) {
                const newValue = [...value];
                newValue[index - 1] = "";
                onChange(newValue);
                focusInput(index - 1);
            }
        }
        // Optional: Let users use horizontal arrow keys to traverse fields
        else if (event.key === "ArrowLeft" && index > 0) {
            event.preventDefault();
            focusInput(index - 1);
        } else if (event.key === "ArrowRight" && index < length - 1) {
            event.preventDefault();
            focusInput(index + 1);
        }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        if (disabled) return;

        const pastedData = event.clipboardData
            .getData("text")
            .replace(/[^0-9]/g, "") // Keep only numbers
            .slice(0, length)
            .split("");

        if (pastedData.length === 0) return;

        const newValue = Array(length)
            .fill("")
            .map((_, i) => pastedData[i] || value[i] || "");
        onChange(newValue);

        // Put focus at the end of the paste stream or cap at the final slot
        const targetFocusIndex = Math.min(pastedData.length, length - 1);
        focusInput(targetFocusIndex);
    };

    return (
        <div className="flex flex-row justify-between gap-2 w-full">
            {Array(length)
                .fill(0)
                .map((_, index) => (
                    <input
                        key={index}
                        type="text"
                        inputMode="numeric" // Triggers numeric keyboard layout on mobile web browsers
                        pattern="[0-9]*"
                        disabled={disabled}
                        value={value[index] || ""}
                        ref={(el) => {
                            if (el) inputRefs.current[index] = el;
                        }}
                        onChange={(e) => handleChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        className="w-12 h-14 text-center font-bold text-2xl border border-border bg-muted text-card-foreground rounded-sm transition-colors duration-150 focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                ))}
        </div>
    );
};

export default OTPInput;
