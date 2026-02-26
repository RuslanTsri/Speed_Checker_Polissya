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
                             title,
                             variant = 'primary',
                             disabled = false,
                             isLoading = false,
                             icon,
                             className = '',
                             ...props
                         }: MyButtonProps) => {

    const getContainerClasses = () => {
        const base = "flex-row items-center justify-center px-8 py-3 rounded-lg border";

        if (variant === 'light') {
            if (disabled) return `${base} border-transparent bg-[#DCDCDC]`;
            return `${base} border-transparent bg-[#F5F5F5] active:bg-[#EDEDED]`;
        }

        if (variant === 'primary') {
            if (disabled) return `${base} border-transparent bg-[#717171]`;
            return `${base} border-transparent bg-[#FF6D00] active:bg-[#E65100]`;
        }

        if (variant === 'outline') {
            if (disabled) return `${base} bg-transparent border-white/10 opacity-50`;
            return `${base} bg-transparent border-white/20 active:bg-white/5`;
        }

        return base;
    };

    const getTextStyles = () => {
        if (variant === 'light') {
            return disabled ? "text-[#717171]" : "text-[#0A0A0A]";
        }
        if (variant === 'primary') {
            return disabled ? "text-[#C3C3C3]" : "text-[#F5F5F5]";
        }
        if (variant === 'outline') {
            return disabled ? "text-white/30" : "text-white";
        }
    };

    return (
        <Pressable
            disabled={disabled || isLoading}
            className={`${getContainerClasses()} ${className}`}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'primary' ? '#F5F5F5' : '#FF6D00'} />
            ) : (
                <View className="flex-row items-center justify-center">
                    {icon && <View className="mr-2">{icon}</View>}
                    <Text className={`text-base font-bold tracking-wide ${getTextStyles()}`}>
                        {title}
                    </Text>
                </View>
            )}
        </Pressable>
    );
};