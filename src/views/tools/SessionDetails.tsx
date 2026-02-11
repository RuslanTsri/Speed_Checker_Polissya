import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { TeamSession } from './SessionsTeam';

interface Props {
    session: TeamSession;
    onBack: () => void;
}

export default function SessionDetails({ session, onBack }: Props) {
    const [subTab, setSubTab] = useState<'BEST' | 'ALL'>('BEST');
    const [roundFilter, setRoundFilter] = useState<'ALL' | number>('ALL');

    const rounds = Array.from(new Set(session.results.flatMap(r => r.attempts.map(a => a.round)))).sort();
    const allAttemptsFlat = session.results.flatMap(player =>
        player.attempts.map(attempt => ({
            playerName: player.playerName,
            round: attempt.round,
            time: attempt.time
        }))
    );
    const filteredAttempts = roundFilter === 'ALL' ? allAttemptsFlat : allAttemptsFlat.filter(a => a.round === roundFilter);

    const exportToCSV = async () => {
        try {
            let csvContent = "\uFEFFКоманда;Гравець;Номер;Кращий час (с);Макс швидкість (км/год);Раунд;Час раунду (с)\n";

            session.results.forEach(player => {
                player.attempts.forEach(attempt => {
                    // 🔥 Строго 2 знаки після коми і примусова заміна на кому
                    const bestTimeStr = player.bestTime.toFixed(2).replace('.', ',');
                    const maxSpeedStr = player.maxSpeed.toFixed(1).replace('.', ',');
                    const attemptTimeStr = attempt.time.toFixed(2).replace('.', ',');

                    csvContent += `${session.teamName};${player.playerName};${player.number};${bestTimeStr};${maxSpeedStr};${attempt.round};${attemptTimeStr}\n`;
                });
            });

            // 🔥 Додаємо Date.now() до назви, щоб завжди створювався УНІКАЛЬНИЙ новий файл
            const fileUri = `${FileSystem.documentDirectory}results_team_${Date.now()}.csv`;

            await FileSystem.writeAsStringAsync(fileUri, csvContent, {
                encoding: FileSystem.EncodingType.UTF8
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'text/csv',
                    dialogTitle: `Експорт: ${session.teamName}`,
                    UTI: 'public.comma-separated-values-text'
                });
            } else {
                Alert.alert("Помилка", "Експорт не підтримується на цьому пристрої");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Помилка", "Не вдалося згенерувати файл");
        }
    };
    return (
        <View className="flex-1 bg-slate-950 pt-4">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 mb-6">
                <TouchableOpacity onPress={onBack} className="p-2 -ml-2">
                    <Feather name="chevron-left" size={24} color="white" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-white text-lg font-bold">Результати</Text>
                    <Text className="text-slate-500 text-xs">{session.testType}</Text>
                </View>
                <TouchableOpacity onPress={exportToCSV} className="p-2 -mr-2">
                    <Feather name="upload" size={20} color="#facc15" />
                </TouchableOpacity>
            </View>

            {/* Info Card */}
            <View className="bg-slate-900 mx-4 rounded-3xl p-5 border border-slate-800 mb-6 shadow-md">
                <View className="flex-row justify-between mb-6">
                    <View>
                        <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Команда</Text>
                        <Text className="text-white text-lg font-bold">{session.teamName}</Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Гравців</Text>
                        <Text className="text-white text-lg font-bold">{session.playerCount}</Text>
                    </View>
                </View>
                <View className="flex-row">
                    <View className="mr-8">
                        <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Найкращий</Text>
                        <Text className="text-yellow-400 text-3xl font-black">{session.bestTime.toFixed(2)} <Text className="text-sm font-bold text-slate-400">с</Text></Text>
                    </View>
                    <View>
                        <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Середній</Text>
                        <Text className="text-white text-3xl font-black">{session.avgTime.toFixed(2)} <Text className="text-sm font-bold text-slate-400">с</Text></Text>
                    </View>
                </View>
            </View>

            {/* Sub Tabs */}
            <View className="flex-row mx-4 bg-slate-900 p-1 rounded-xl mb-4 border border-slate-800">
                <TouchableOpacity onPress={() => setSubTab('BEST')} className={`flex-1 py-2 rounded-lg items-center ${subTab === 'BEST' ? 'bg-slate-800 border border-slate-700' : ''}`}>
                    <Text className={`font-bold text-sm ${subTab === 'BEST' ? 'text-white' : 'text-slate-500'}`}>Підсумок (Best)</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSubTab('ALL')} className={`flex-1 py-2 rounded-lg items-center ${subTab === 'ALL' ? 'bg-slate-800 border border-slate-700' : ''}`}>
                    <Text className={`font-bold text-sm ${subTab === 'ALL' ? 'text-white' : 'text-slate-500'}`}>Усі спроби</Text>
                </TouchableOpacity>
            </View>

            {/* TAB: ПІДСУМОК (BEST) */}
            {subTab === 'BEST' && (
                <FlatList
                    data={[...session.results].sort((a, b) => a.bestTime - b.bestTime)}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                    renderItem={({ item, index }) => {
                        let rankColor = "bg-slate-800 border-slate-700";
                        let rankTextColor = "text-white";
                        if (index === 0) { rankColor = "bg-yellow-500/20 border-yellow-500/50"; rankTextColor = "text-yellow-400"; }
                        else if (index === 1) { rankColor = "bg-slate-300/20 border-slate-300/50"; rankTextColor = "text-slate-300"; }
                        else if (index === 2) { rankColor = "bg-orange-500/20 border-orange-500/50"; rankTextColor = "text-orange-400"; }

                        return (
                            <View className="bg-slate-900 rounded-2xl mb-3 flex-row items-center border border-slate-800 overflow-hidden pr-5">
                                <View className={`w-12 h-full py-4 items-center justify-center border-r ${rankColor}`}>
                                    <Text className={`font-black text-lg ${rankTextColor}`}>{index + 1}</Text>
                                </View>
                                <View className="flex-1 pl-4 py-3">
                                    <Text className="text-white font-bold text-base mb-1">{item.playerName}</Text>
                                    <Text className="text-slate-500 text-xs font-bold">#{item.number}</Text>
                                </View>
                                <View className="items-end py-3">
                                    <Text className="text-white font-black text-xl">{item.bestTime.toFixed(2)} <Text className="text-xs text-slate-500">с</Text></Text>
                                    <Text className="text-slate-500 text-xs mt-1 font-medium">{item.maxSpeed.toFixed(1)} km/h</Text>
                                </View>
                            </View>
                        );
                    }}
                />
            )}

            {/* TAB: УСІ СПРОБИ */}
            {subTab === 'ALL' && (
                <View className="flex-1">
                    <View className="px-4 mb-4">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <TouchableOpacity onPress={() => setRoundFilter('ALL')} className={`mr-2 px-4 py-1.5 rounded-full border ${roundFilter === 'ALL' ? 'bg-slate-700 border-slate-600' : 'bg-transparent border-slate-800'}`}>
                                <Text className={`font-bold text-xs ${roundFilter === 'ALL' ? 'text-white' : 'text-slate-500'}`}>Раунд: Всі</Text>
                            </TouchableOpacity>
                            {rounds.map(r => (
                                <TouchableOpacity key={r} onPress={() => setRoundFilter(r)} className={`mr-2 px-4 py-1.5 rounded-full border ${roundFilter === r ? 'bg-slate-700 border-slate-600' : 'bg-transparent border-slate-800'}`}>
                                    <Text className={`font-bold text-xs ${roundFilter === r ? 'text-white' : 'text-slate-500'}`}>Раунд {r}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View className="flex-row px-6 pb-2 border-b border-slate-800 mb-2">
                        <Text className="flex-1 text-slate-500 text-[10px] font-bold tracking-widest uppercase">Гравець</Text>
                        <Text className="w-16 text-center text-slate-500 text-[10px] font-bold tracking-widest uppercase">Раунд</Text>
                        <Text className="w-16 text-right text-slate-500 text-[10px] font-bold tracking-widest uppercase">Час</Text>
                    </View>

                    <FlatList
                        data={filteredAttempts}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                        renderItem={({ item }) => (
                            <View className="flex-row items-center py-4 border-b border-slate-800/50">
                                <Text className="flex-1 text-slate-300 font-medium">{item.playerName}</Text>
                                <Text className="w-16 text-center text-slate-500">{item.round}</Text>
                                <Text className="w-16 text-right text-white font-bold">{item.time.toFixed(2)}</Text>
                            </View>
                        )}
                    />
                </View>
            )}
        </View>
    );
}