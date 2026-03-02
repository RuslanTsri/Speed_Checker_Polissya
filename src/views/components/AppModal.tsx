import React from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

export const AppModal = ({ visible, onClose, title, children, type = 'bottom' }: any) => {
    const insets = useSafeAreaInsets();
    const isFull = type === 'fullscreen';
    const isCenter = type === 'center';

    const getDynamicStyles = () => {
        if (type === 'bottom') return { paddingBottom: Math.max(insets.bottom + 24, 24), paddingTop: 24, paddingHorizontal: 24 };
        if (isFull) return { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) };
        return { padding: 24 };
    };

    return (
        <Modal animationType={isCenter ? 'fade' : 'slide'} transparent visible={visible} onRequestClose={onClose}>
            <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} experimentalBlurMethod="dimezisBlurView">
                <Pressable
                    className={`flex-1 ${isCenter ? 'justify-center items-center p-6 bg-black/30' : isFull ? '' : 'justify-end bg-black/30'}`}
                    onPress={!isFull ? onClose : undefined}
                >
                    <Pressable
                        className={`w-full overflow-hidden ${isFull ? 'flex-1' : isCenter ? 'rounded-3xl border border-surface-border shadow-2xl' : 'rounded-t-3xl border-t border-surface-border shadow-2xl'}`}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10, 10, 10, 0.8)' }]} />

                        <View style={getDynamicStyles()} className={isFull ? 'flex-1' : 'w-full'}>
                            {/* Header */}
                            <View className={`flex-row justify-between items-center mb-6 ${isFull ? 'px-4 pb-4 border-b border-surface-border' : ''}`}>
                                <Text className={`${isFull ? 'text-h4' : 'text-h3'} font-bold text-text-main font-unbounded flex-1`}>
                                    {title}
                                </Text>
                                <TouchableOpacity onPress={onClose} className="p-2 -mr-2 active:opacity-50">
                                    <Feather name={isFull ? "chevron-left" : "x"} size={24} color="#A3A3A3" />
                                </TouchableOpacity>
                            </View>

                            <View className={isFull ? 'px-4 flex-1' : ''}>{children}</View>
                        </View>
                    </Pressable>
                </Pressable>
            </BlurView>
        </Modal>
    );
};