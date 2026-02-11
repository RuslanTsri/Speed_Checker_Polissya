import React from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ModalType = 'bottom' | 'center' | 'fullscreen';

interface AppModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    type?: ModalType; // За замовчуванням буде 'bottom'
}

export const AppModal = ({ visible, onClose, title, children, type = 'bottom' }: AppModalProps) => {
    const insets = useSafeAreaInsets();

    // 1. Стилі для зовнішнього фону (затемнення)
    const getBackdropClass = () => {
        if (type === 'fullscreen') return "flex-1 bg-slate-950"; // Без прозорості
        if (type === 'center') return "flex-1 justify-center items-center bg-black/80 p-6";
        return "flex-1 justify-end bg-black/80"; // bottom
    };

    // 2. Стилі для самого вікна з контентом
    const getContainerClass = () => {
        if (type === 'fullscreen') return "flex-1 bg-slate-950 w-full";
        if (type === 'center') return "bg-slate-900 w-full rounded-3xl border border-slate-700 p-6";
        return "bg-slate-900 w-full rounded-t-3xl p-6 border-t border-slate-700"; // bottom
    };

    // 3. Динамічні відступи (щоб не залазило під "члку" або нижню смужку iOS)
    const getDynamicStyles = () => {
        if (type === 'bottom') return { paddingBottom: Math.max(insets.bottom + 24, 24) };
        if (type === 'fullscreen') return { paddingTop: Math.max(insets.top, 20) };
        return {}; // center не потребує safe area, бо він по центру
    };

    // 4. Тип анімації
    const animation = type === 'center' ? 'fade' : 'slide';

    return (
        <Modal
            animationType={animation}
            transparent={type !== 'fullscreen'}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable
                className={getBackdropClass()}
                onPress={type !== 'fullscreen' ? onClose : undefined} // Закриття по кліку на фон (крім фулскріну)
            >
                <Pressable
                    className={getContainerClass()}
                    style={getDynamicStyles()}
                    onPress={(e) => e.stopPropagation()} // Блокуємо закриття при кліку на саме вікно
                >
                    {/* --- ХЕДЕР ВІКНА --- */}
                    {/* Для Bottom */}
                    {type === 'bottom' && (
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white text-xl font-bold">{title}</Text>
                            <TouchableOpacity onPress={onClose} className="p-1">
                                <Feather name="x" size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Для Center */}
                    {type === 'center' && (
                        <View className="mb-6">
                            <Text className="text-white text-xl font-bold">{title}</Text>
                        </View>
                    )}

                    {/* Для Fullscreen */}
                    {type === 'fullscreen' && (
                        <View className="flex-row items-center px-4 pb-6 border-b border-slate-900 mb-6">
                            <TouchableOpacity onPress={onClose} className="p-2 -ml-2">
                                <Feather name="chevron-left" size={28} color="white" />
                            </TouchableOpacity>
                            <Text className="text-white text-lg font-bold flex-1 text-center -ml-8">{title}</Text>
                        </View>
                    )}

                    {/* --- КОНТЕНТ --- */}
                    <View className={type === 'fullscreen' ? 'px-4 flex-1' : ''}>
                        {children}
                    </View>

                </Pressable>
            </Pressable>
        </Modal>
    );
};