import React from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const BottomModal = ({ visible, onClose, title, children }: BottomModalProps) => {

    const insets = useSafeAreaInsets();

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable className="flex-1 justify-end bg-black/80" onPress={onClose}>

                <Pressable
                    className="bg-slate-900 rounded-t-3xl p-6 border-t border-slate-700"
                    style={{ paddingBottom: insets.bottom + 24 }}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-white text-xl font-bold">{title}</Text>
                        <TouchableOpacity onPress={onClose} className="p-1">
                            <Feather name="x" size={24} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    <View>
                        {children}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};