import React from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

type ModalType = 'bottom' | 'center' | 'fullscreen';

interface AppModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    type?: ModalType; // За замовчуванням 'bottom'
}

export const AppModal = ({ visible, onClose, title, children, type = 'bottom' }: AppModalProps) => {
    const insets = useSafeAreaInsets();

    // 1. Стилі для зовнішнього фону (робимо його більш прозорим, бо основну роботу тепер робить BlurView)
    const getBackdropClass = () => {
        if (type === 'fullscreen') return "flex-1"; // Для фулскріну фон не потрібен
        if (type === 'center') return "flex-1 justify-center items-center bg-black/30 p-6";
        return "flex-1 justify-end bg-black/30"; // bottom
    };

    // 2. Стилі для самого вікна з контентом
    const getContainerClass = () => {
        if (type === 'fullscreen') return "flex-1 w-full overflow-hidden";
        if (type === 'center') return "w-full rounded-3xl border border-white/10 overflow-hidden shadow-2xl";
        return "w-full rounded-t-3xl border-t border-white/10 overflow-hidden shadow-2xl"; // bottom
    };

    // 3. Динамічні відступи всередині
    const getDynamicStyles = () => {
        if (type === 'bottom') return { paddingBottom: Math.max(insets.bottom + 24, 24), paddingTop: 24, paddingHorizontal: 24 };
        if (type === 'fullscreen') return { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) };
        return { padding: 24 }; // center
    };

    const animation = type === 'center' ? 'fade' : 'slide';

    return (
        <Modal
            animationType={animation}
            transparent={true}
            visible={visible}

            onRequestClose={onClose}
        >
            {/* 🔥 РОЗМИТИЙ ФОН НА ВЕСЬ ЕКРАН */}
            <BlurView intensity={15} tint="dark" style={{ flex: 1 }} experimentalBlurMethod="dimezisBlurView">

                <Pressable
                    className={getBackdropClass()}
                    onPress={type !== 'fullscreen' ? onClose : undefined}
                >
                    {/* КОНТЕЙНЕР САМОЇ МОДАЛКИ */}
                    <Pressable
                        className={getContainerClass()}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* 🔥 БЛЮР САМОГО ВІКНА МОДАЛКИ (Подвійне скло) */}
                        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />

                        {/* Затемнення модалки, щоб вона виділялась на фоні екрану */}
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 15, 15, 0.7)' }]} />

                        {/* ВНУТРІШНІЙ КОНТЕНТ */}
                        <View style={getDynamicStyles()} className={type === 'fullscreen' ? 'flex-1' : 'w-full'}>

                            {/* Шапка для Bottom */}
                            {type === 'bottom' && (
                                <View className="flex-row justify-between items-center mb-6">
                                    <Text className="text-xl font-bold text-[#F5F5F5]" style={{ fontFamily: 'Unbounded' }}>
                                        {title}
                                    </Text>
                                    <TouchableOpacity onPress={onClose} className="p-2 -mr-2 active:opacity-50">
                                        <Feather name="x" size={24} color="#A3A3A3" />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Шапка для Center */}
                            {type === 'center' && (
                                <View className="mb-6">
                                    <Text className="text-xl font-bold text-[#F5F5F5]" style={{ fontFamily: 'Unbounded' }}>
                                        {title}
                                    </Text>
                                </View>
                            )}

                            {/* Шапка для Fullscreen */}
                            {type === 'fullscreen' && (
                                <View className="flex-row items-center px-4 pb-6 border-b border-white/10 mb-6">
                                    <TouchableOpacity onPress={onClose} className="p-2 -ml-2 active:opacity-50">
                                        <Feather name="chevron-left" size={28} color="#F5F5F5" />
                                    </TouchableOpacity>
                                    <Text className="text-lg font-bold flex-1 text-center -ml-8 text-[#F5F5F5]" style={{ fontFamily: 'Unbounded' }}>
                                        {title}
                                    </Text>
                                </View>
                            )}

                            {/* ОСНОВНИЙ КОНТЕНТ */}
                            <View className={type === 'fullscreen' ? 'px-4 flex-1' : ''}>
                                {children}
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </BlurView>
        </Modal>
    );
};