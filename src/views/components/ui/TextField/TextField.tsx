import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, Pressable } from 'react-native';

interface MyTextFieldProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export const TextField = ({
                              label, error, icon, disabled = false, className, onFocus, onBlur, value, ...props
                          }: MyTextFieldProps) => {
    const [isFocused, setIsFocused] = useState(false);

    const inputRef = useRef<TextInput>(null);

    const handleFocus = (e: any) => { setIsFocused(true); onFocus?.(e); };
    const handleBlur = (e: any) => { setIsFocused(false); onBlur?.(e); };

    const isTyped = Boolean(value && value.length > 0);
    let state: 'default' | 'focused' | 'typed' | 'error' | 'disabled' = 'default';

    if (disabled) state = 'disabled';
    else if (error) state = 'error';
    else if (isFocused) state = 'focused';
    else if (isTyped) state = 'typed';

    const containerBase = "flex-row items-center px-4 h-[56px] rounded-2xl border transition-all";
    const containerStyles = {
        focused: `${containerBase} border-brand-orange bg-surface-card`,
        error: `${containerBase} border-status-error bg-status-error/5`,
        disabled: `${containerBase} border-surface-border bg-surface-card opacity-50`,
        typed: `${containerBase} border-text-sub/30 bg-surface-card`,
        default: `${containerBase} border-surface-border bg-surface-card/50`,
    }[state];

    const labelStyles = {
        focused: "text-brand-orange",
        error: "text-status-error",
        disabled: "text-text-muted",
        typed: "text-text-main",
        default: "text-text-sub",
    }[state];

    return (
        <View className={`w-full mb-2 ${className || ''}`}>
            {label && (
                <Text className={`text-caption font-bold uppercase mb-2 ml-1 font-unbounded tracking-widest ${labelStyles}`}>
                    {label}
                </Text>
            )}

            <Pressable
                className={containerStyles}
                onPress={() => !disabled && inputRef.current?.focus()}
            >
                {icon && <View className="mr-3 opacity-70 z-10">{icon}</View>}

                <TextInput
                    ref={inputRef}
                    className={`flex-1 h-full text-base font-evolventa ${disabled ? 'text-text-muted' : 'text-text-main'}`}
                    placeholderTextColor="#717171"
                    editable={!disabled}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    value={value}
                    cursorColor="#FF6D00"
                    selectionColor="rgba(255, 109, 0, 0.3)"
                    style={styles.inputReset}
                    {...props}
                />
            </Pressable>

            <View className="h-5 mt-1 ml-1">
                {error && <Text className="text-small text-status-error font-evolventa">{error}</Text>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    inputReset: { paddingVertical: 0 }
});