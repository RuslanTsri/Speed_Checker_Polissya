import React from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext'; // 🔥 Імпорт теми

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
    const { isDark } = useTheme(); // 🔥 Беремо тему

    // 1. Стилі для зовнішнього фону (затемнення)
    const getBackdropClass = () => {
        if (type === 'fullscreen') return `flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`;
        if (type === 'center') return "flex-1 justify-center items-center bg-black/80 p-6";
        return "flex-1 justify-end bg-black/80"; // bottom
    };

    // 2. Стилі для самого вікна з контентом
    const getContainerClass = () => {
        if (type === 'fullscreen') return `flex-1 w-full ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`;
        if (type === 'center') return `w-full rounded-3xl border p-6 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`;
        return `w-full rounded-t-3xl p-6 border-t ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`; // bottom
    };

    // 3. Динамічні відступи
    const getDynamicStyles = () => {
        if (type === 'bottom') return { paddingBottom: Math.max(insets.bottom + 24, 24) };
        if (type === 'fullscreen') return { paddingTop: Math.max(insets.top, 20) };
        return {};
    };

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
                onPress={type !== 'fullscreen' ? onClose : undefined}
            >
                <Pressable
                    className={getContainerClass()}
                    style={getDynamicStyles()}
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Для Bottom */}
                    {type === 'bottom' && (
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</Text>
                            <TouchableOpacity onPress={onClose} className="p-1">
                                <Feather name="x" size={24} color={isDark ? "#94a3b8" : "#64748b"} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Для Center */}
                    {type === 'center' && (
                        <View className="mb-6">
                            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</Text>
                        </View>
                    )}

                    {/* Для Fullscreen */}
                    {type === 'fullscreen' && (
                        <View className={`flex-row items-center px-4 pb-6 border-b mb-6 ${isDark ? 'border-slate-900' : 'border-slate-200'}`}>
                            <TouchableOpacity onPress={onClose} className="p-2 -ml-2">
                                <Feather name="chevron-left" size={28} color={isDark ? "white" : "black"} />
                            </TouchableOpacity>
                            <Text className={`text-lg font-bold flex-1 text-center -ml-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</Text>
                        </View>
                    )}

                    {/* КОНТЕНТ */}
                    <View className={type === 'fullscreen' ? 'px-4 flex-1' : ''}>
                        {children}
                    </View>

                </Pressable>
            </Pressable>
        </Modal>
    );
};