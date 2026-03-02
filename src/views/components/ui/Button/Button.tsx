import React from 'react';
import { Text, Pressable, PressableProps, View, ActivityIndicator } from 'react-native';

type ButtonVariant = 'light' | 'primary' | 'outline';

interface MyButtonProps extends Omit<PressableProps, 'style'> {
    title: string;
    variant?: ButtonVariant;
    isLoading?: boolean;
    icon?: React.ReactNode;
    className?: string;
}

export const Button = ({
                           title, variant = 'primary', disabled = false, isLoading = false, icon, className = '', ...props
                       }: MyButtonProps) => {

    const getContainerClasses = () => {
        const base = "flex-row items-center justify-center px-8 py-4 rounded-2xl border"; // Збільшили rounded до 2xl

        if (variant === 'light') {
            if (disabled) return `${base} border-transparent bg-brand-light opacity-50`;
            return `${base} border-transparent bg-brand-light active:bg-text-sub`;
        }

        if (variant === 'primary') {
            if (disabled) return `${base} border-transparent bg-text-muted`;
            return `${base} border-transparent bg-brand-orange active:bg-brand-orangeDark`;
        }

        if (variant === 'outline') {
            if (disabled) return `${base} bg-transparent border-white/10 opacity-50`;
            return `${base} bg-transparent border-surface-border active:bg-white/5`;
        }
        return base;
    };

    const getTextClasses = () => {
        const base = "text-base font-bold font-unbounded uppercase tracking-wider"; // Додали шрифт Unbounded
        if (variant === 'light') return disabled ? "text-text-muted" : "text-surface-bg";
        if (variant === 'primary') return disabled ? "text-brand-gray" : "text-text-main";
        if (variant === 'outline') return disabled ? "text-text-muted" : "text-text-main";
        return base;
    };

    return (
        <Pressable
            disabled={disabled || isLoading}
            className={`${getContainerClasses()} ${className}`}
            style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'primary' ? '#F5F5F5' : '#FF6D00'} />
            ) : (
                <View className="flex-row items-center justify-center">
                    {icon && <View className="mr-2">{icon}</View>}
                    <Text className={getTextClasses()}>
                        {title}
                    </Text>
                </View>
            )}
        </Pressable>
    );
};