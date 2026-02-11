import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Pressable, Modal} from 'react-native';
import {Feather} from "@expo/vector-icons";

interface HeaderProps {
    onGoHome: () => void;
    onLogout?: () => void;
    onChangePin?: () => void;
}

export const Header = ({ onGoHome, onLogout, onChangePin }: HeaderProps) => {

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const closeMenu = () => setIsMenuOpen(false);

    return (

        <View className="bg-slate-900 py-4 px-6 border-b border-slate-800 flex-row justify-between items-center z-50">


            <TouchableOpacity onPress={onGoHome} activeOpacity={0.6}>
                <Text className="text-yellow-400 text-lg font-black tracking-[0.2em] uppercase italic">
                    Tempo Metrics
                </Text>
            </TouchableOpacity>

            <View className="relative">
                <TouchableOpacity
                    onPress={() => setIsMenuOpen(!isMenuOpen)}
                    className={`w-10 h-10 rounded-full items-center justify-center border transition-colors ${isMenuOpen ? 'bg-yellow-400 border-yellow-400' : 'bg-slate-800 border-slate-700'}`}
                >
                    <Text className={`font-bold text-xs ${isMenuOpen ? 'text-slate-900' : 'text-yellow-400'}`}>
                        РЦ
                    </Text>
                </TouchableOpacity>


                {isMenuOpen && (
                    <>
                        <Modal transparent animationType="fade" visible={isMenuOpen} onRequestClose={closeMenu}>
                            <Pressable className="flex-1" onPress={closeMenu}>
                                <View
                                    className="absolute top-[60px] right-4 bg-slate-800 border border-slate-700 rounded-xl shadow-xl w-48 overflow-hidden py-1"
                                    onStartShouldSetResponder={() => true}
                                >
                                    <TouchableOpacity
                                        onPress={() => { closeMenu(); onChangePin?.(); }}
                                        className="flex-row items-center px-4 py-3 border-b border-slate-700 active:bg-slate-700"
                                    >
                                        <Feather name="lock" size={16} color="#94a3b8" />
                                        <Text className="text-white ml-3 font-medium text-sm">Зміна PIN</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => { closeMenu(); onLogout?.(); }}
                                        className="flex-row items-center px-4 py-3 active:bg-red-900/20"
                                    >
                                        <Feather name="log-out" size={16} color="#ef4444" />
                                        <Text className="text-red-400 ml-3 font-medium text-sm">Вихід</Text>
                                    </TouchableOpacity>
                                </View>
                            </Pressable>
                        </Modal>
                    </>
                )}
            </View>
        </View>
    );
};