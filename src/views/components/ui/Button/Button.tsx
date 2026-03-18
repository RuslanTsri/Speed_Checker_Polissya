import React from 'react';
import { Text, Pressable, PressableProps, View, ActivityIndicator, StyleProp, TextStyle } from 'react-native';

type ButtonVariant = 'light' | 'primary' | 'outline' | 'danger';

interface MyButtonProps extends Omit<PressableProps, 'style'> {
    title: string;
    variant?: ButtonVariant;
    isLoading?: boolean;
    icon?: React.ReactNode;
    className?: string;
    style?: StyleProp<TextStyle>;
}

export const Button = ({
                           title,
                           variant = 'primary',
                           disabled = false,
                           isLoading = false,
                           icon,
                           className = '',
                           style,
                           ...props
                       }: MyButtonProps) => {

    const getContainerClasses = () => {
        const base = "flex-row items-center justify-center px-8 py-4 rounded-2xl border";

        if (variant === 'light') {
            if (disabled) return `${base} border-transparent bg-brand-light opacity-50`;
            return `${base} border-transparent bg-brand-light active:bg-brand-gray`;
        }

        if (variant === 'primary') {
            if (disabled) return `${base} border-transparent bg-text-muted opacity-50`;
            return `${base} border-transparent bg-brand-orange active:bg-brand-orangeDark`;
        }

        if (variant === 'outline') {
            if (disabled) return `${base} bg-transparent border-surface-border opacity-40`;
            return `${base} bg-transparent border-surface-border active:bg-surface-card`;
        }

        if (variant === 'danger') {
            if (disabled) return `${base} border-transparent bg-status-error opacity-50`;
            return `${base} border-transparent bg-status-error active:bg-red-700`;
        }

        return base;
    };

    const getTextClasses = () => {
        const base = "text-body font-unbounded-bold uppercase tracking-widest";

        if (variant === 'light') return `${base} ${disabled ? "text-text-muted" : "text-surface-bg"}`;
        if (variant === 'primary') return `${base} ${disabled ? "text-brand-gray" : "text-text-main"}`;
        if (variant === 'outline') return `${base} ${disabled ? "text-text-muted" : "text-text-main"}`;
        if (variant === 'danger') return `${base} text-text-main`;

        return base;
    };

    return (
        <Pressable
            disabled={disabled || isLoading}
            className={`${getContainerClasses()} ${className}`}
            style={({ pressed }) => [
                { transform: [{ scale: (pressed && !disabled) ? 0.96 : 1 }] }
            ]}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator
                    color={variant === 'primary' || variant === 'danger' ? '#F5F5F5' : '#FF6D00'}
                />
            ) : (
                <View className="flex-row items-center justify-center flex-shrink-1">
                    {icon && <View className="mr-3">{icon}</View>}

                    <Text
                        className={`${getTextClasses()} flex-shrink-1`}
                        style={[style, { textAlign: 'center' }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                        minimumFontScale={0.7}
                        ellipsizeMode="tail"
                    >
                        {title}
                    </Text>
                </View>
            )}
        </Pressable>
    );
};