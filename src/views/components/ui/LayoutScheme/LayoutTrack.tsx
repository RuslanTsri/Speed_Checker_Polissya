import React from 'react';
import { View } from 'react-native';

export const LayoutTrack = () => {
    return (
        // Використовуємо surface-border для ідеального злиття з карткою
        <View className="absolute left-0 right-0 h-[2px] bg-surface-border top-1/2 -mt-[1px]" />
    );
};