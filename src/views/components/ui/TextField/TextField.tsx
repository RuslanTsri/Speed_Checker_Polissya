import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface MyTextFieldProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export const TextField = ({
                              label,
                              error,
                              icon,
                              disabled = false,
                              className,
                              onFocus,
                              onBlur,
                              value,
                              ...props
                          }: MyTextFieldProps) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
    };

    const isTyped = Boolean(value && value.length > 0);

    let state: 'default' | 'focused' | 'typed' | 'error' | 'disabled' = 'default';

    if (disabled) state = 'disabled';
    else if (error) state = 'error';
    else if (isFocused) state = 'focused';
    else if (isTyped) state = 'typed';

    // 🎨 Стилі контейнера (Рамка та фон адаптовані під Dark Background)
    const getContainerStyles = () => {
        const base = "flex-row items-center px-4 h-[56px] rounded-2xl border border-solid transition-all"; // Збільшив висоту до 56 та закруглення
        switch (state) {
            case 'focused': return `${base} border-[#FF6D00] bg-white/5`; // Помаранчевий фокус
            case 'error': return `${base} border-[#EF4444] bg-red-500/5`; // Яскравіший червоний
            case 'disabled': return `${base} border-white/5 bg-white/5 opacity-50`;
            case 'typed': return `${base} border-white/20 bg-white/5`; // Світліша рамка для заповненого
            default: return `${base} border-white/10 bg-white/5`;      // Ледь помітна рамка в спокої
        }
    };

    const getLabelStyles = () => {
        switch (state) {
            case 'focused': return "text-[#FF6D00]";
            case 'error': return "text-[#EF4444]";
            case 'disabled': return "text-[#4B5563]";
            case 'typed': return "text-white/80";   // Білий напівпрозорий для заповненого
            default: return "text-slate-400";       // Сірий для порожнього
        }
    };

    return (
        <View className={`w-full mb-2 ${className || ''}`}>
            {label && (
                <Text className={`text-[11px] font-bold tracking-[0.1em] uppercase mb-2 ml-1 ${getLabelStyles()}`}>
                    {label}
                </Text>
            )}

            <View className={getContainerStyles()}>
                {icon && <View className="mr-3 opacity-70">{icon}</View>}

                <TextInput
                    className={`flex-1 text-base font-medium ${
                        disabled ? 'text-slate-500' : 'text-white' // ОСЬ ТУТ: Текст тепер БІЛИЙ
                    }`}
                    placeholderTextColor="#4B5563" // Колір плейсхолдера (сірий Zinc-600)
                    editable={!disabled}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    value={value}
                    cursorColor="#FF6D00" // Колір курсора Android
                    selectionColor="rgba(255, 109, 0, 0.3)" // Колір виділення тексту
                    style={{ paddingVertical: 0 }}
                    {...props}
                />
            </View>

            <View className="h-5 mt-1 ml-1">
                {error ? (
                    <Text className="text-[12px] text-[#EF4444] font-medium">
                        {error}
                    </Text>
                ) : null}
            </View>
        </View>
    );
};