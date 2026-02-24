import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { usePlayerInfo, Player } from '../../hooks/players/usePlayerInfo';
import { useTheme } from '../../context/ThemeContext';

interface InfoScreenProps {
    player: Player;
    onBack: () => void;
    onDelete: (id: string) => void;
}

export default function InfoScreen({ player, onBack, onDelete }: InfoScreenProps) {
    const { t } = useTranslation();
    const { isDark } = useTheme();
    const { positionLabel, handleDeletePress, handleBack } = usePlayerInfo(player, onBack, onDelete);

    return (
        <ScrollView className={`flex-1 pt-4 px-4 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity onPress={handleBack} className="flex-row items-center">
                    <Feather name="arrow-left" size={24} color={isDark ? "#facc15" : "#eab308"} />
                    <Text className={`font-bold ml-2 text-lg ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        {t('screens.player_info.back') as string}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleDeletePress} className={`p-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <Feather name="trash-2" size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <View className="items-center mb-8">
                <View className={`w-48 h-48 rounded-full border-4 items-center justify-center overflow-hidden mb-6 shadow-2xl ${isDark ? 'bg-slate-800 border-yellow-400 shadow-yellow-400/20' : 'bg-white border-yellow-400 shadow-yellow-400/30'}`}>
                    <Image source={{ uri: player.photoUrl }} className="w-full h-full" resizeMode="cover" />
                </View>

                <Text className={`text-3xl font-black text-center mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{player.name}</Text>
                <Text className={`text-sm font-bold uppercase tracking-widest mb-6 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    {t('screens.player_info.main_squad') as string}
                </Text>

                <View className="flex-row items-center gap-4">
                    <View className={`px-6 py-3 rounded-2xl border items-center min-w-[90px] shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                        <Text className={`text-xs uppercase font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {t('screens.player_info.label_number') as string}
                        </Text>
                        <Text className={`font-black text-3xl ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`}>#{player.number}</Text>
                    </View>
                    <View className="bg-yellow-400 px-6 py-3 rounded-2xl items-center min-w-[90px] shadow-lg shadow-yellow-400/20">
                        <Text className="text-slate-900 text-xs uppercase font-bold mb-1">
                            {t('screens.player_info.label_position') as string}
                        </Text>
                        <Text className="text-slate-900 font-black text-2xl">{positionLabel}</Text>
                    </View>
                </View>
            </View>

            <View className={`border-t my-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
            <Text className={`font-bold uppercase text-xs tracking-widest mb-4 mt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('screens.player_info.label_stats') as string}
            </Text>

            <View className="flex-row justify-between mb-4">
                <View className={`w-[48%] p-5 rounded-3xl border items-center shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <View className="w-12 h-12 bg-green-500/10 rounded-full items-center justify-center mb-3">
                        <Feather name="award" size={24} color="#4ade80" />
                    </View>
                    <Text className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {t('screens.player_info.best_time') as string}
                    </Text>
                    <Text className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{player.stats?.bestTime || '--'}</Text>
                </View>

                <View className={`w-[48%] p-5 rounded-3xl border items-center shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <View className="w-12 h-12 bg-blue-500/10 rounded-full items-center justify-center mb-3">
                        <Feather name="clock" size={24} color="#60a5fa" />
                    </View>
                    <Text className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {t('screens.player_info.last_time') as string}
                    </Text>
                    <Text className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{player.stats?.lastTime || '--'}</Text>
                </View>
            </View>

            <View className={`p-5 rounded-3xl border flex-row justify-between items-center mb-20 shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <View className="flex-row items-center">
                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <MaterialCommunityIcons name="run-fast" size={24} color={isDark ? "#cbd5e1" : "#64748b"} />
                    </View>
                    <View>
                        <Text className={`text-xs uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {t('screens.player_info.activity') as string}
                        </Text>
                        <Text className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {t('screens.player_info.total_sessions') as string}
                        </Text>
                    </View>
                </View>
                <Text className={`font-black text-3xl ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`}>{player.stats?.totalSessions || 0}</Text>
            </View>

        </ScrollView>
    );
}