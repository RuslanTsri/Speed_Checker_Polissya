import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TeamSession } from '../../hooks/sessions/useSessionsData';
import { useSessionDetails } from '../../hooks/sessions/useSessionDetails';

interface Props {
    session: TeamSession;
    onBack: () => void;
}

export default function SessionDetails({ session, onBack }: Props) {
    const {
        subTab, setSubTab,
        roundFilter, setRoundFilter,
        selectedDistance, setSelectedDistance, predefinedDistances,
        rounds,
        filteredAttempts,
        sortedResults,
        sessionStats,
        handleExport
    } = useSessionDetails(session);

    return (
        <View className="flex-1 bg-slate-950 pt-4">
            {/* --- HEADER --- */}
            <View className="flex-row items-center justify-between px-4 mb-4">
                <TouchableOpacity onPress={onBack} className="p-2 -ml-2">
                    <Feather name="chevron-left" size={24} color="white" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-white text-lg font-bold">Результати</Text>
                    {/* Показуємо обрану дистанцію в хедері тільки для BEST */}
                    <Text className="text-slate-500 text-xs">
                        {session.testType} {subTab === 'BEST' ? `(${selectedDistance}м)` : ''}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleExport} className="p-2 -mr-2">
                    <Feather name="upload" size={20} color="#facc15" />
                </TouchableOpacity>
            </View>

            {/* --- INFO CARD (Оновлюється залежно від дистанції, якщо ми в BEST) --- */}
            <View className="bg-slate-900 mx-4 rounded-3xl p-4 border border-slate-800 mb-4 shadow-md">
                <View className="flex-row justify-between mb-4">
                    <View>
                        <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Команда</Text>
                        <Text className="text-white text-lg font-bold">{session.teamName}</Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Гравців у ТОПі</Text>
                        <Text className="text-white text-lg font-bold">{subTab === 'BEST' ? sortedResults.length : '-'}</Text>
                    </View>
                </View>
                <View className="flex-row">
                    <View className="mr-8">
                        <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Найкращий</Text>
                        <Text className="text-yellow-400 text-3xl font-black">{sessionStats.best > 0 ? sessionStats.best.toFixed(2) : '--'} <Text className="text-sm font-bold text-slate-400">с</Text></Text>
                    </View>
                    <View>
                        <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Середній</Text>
                        <Text className="text-white text-3xl font-black">{sessionStats.avg > 0 ? sessionStats.avg.toFixed(2) : '--'} <Text className="text-sm font-bold text-slate-400">с</Text></Text>
                    </View>
                </View>
            </View>

            {/* --- TABS --- */}
            <View className="flex-row mx-4 bg-slate-900 p-1 rounded-xl mb-3 border border-slate-800">
                <TouchableOpacity onPress={() => setSubTab('BEST')} className={`flex-1 py-2 rounded-lg items-center ${subTab === 'BEST' ? 'bg-slate-800 border border-slate-700' : ''}`}>
                    <Text className={`font-bold text-sm ${subTab === 'BEST' ? 'text-white' : 'text-slate-500'}`}>Підсумок (Best)</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSubTab('ALL')} className={`flex-1 py-2 rounded-lg items-center ${subTab === 'ALL' ? 'bg-slate-800 border border-slate-700' : ''}`}>
                    <Text className={`font-bold text-sm ${subTab === 'ALL' ? 'text-white' : 'text-slate-500'}`}>Усі спроби</Text>
                </TouchableOpacity>
            </View>

            {/* 🔥 ТАБИ ДИСТАНЦІЙ (Відображаються ТІЛЬКИ в Підсумках) */}
            {subTab === 'BEST' && (
                <View className="px-4 mb-3 flex-row justify-center">
                    {predefinedDistances.map(dist => (
                        <TouchableOpacity
                            key={dist}
                            onPress={() => setSelectedDistance(dist)}
                            className={`mx-2 px-6 py-1.5 rounded-full border ${selectedDistance === dist ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-transparent border-slate-800'}`}
                        >
                            <Text className={`font-bold text-xs ${selectedDistance === dist ? 'text-yellow-400' : 'text-slate-500'}`}>{dist} м</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* ГОЛОВНИЙ КОНТЕЙНЕР СПИСКІВ */}
            <View className="flex-1">

                {/* LIST: BEST (Лідерборд) */}
                {subTab === 'BEST' && (
                    <FlatList
                        className="flex-1"
                        data={sortedResults}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View className="py-10 items-center">
                                <Text className="text-slate-500 font-medium">Немає результатів на {selectedDistance}м</Text>
                            </View>
                        )}
                        renderItem={({ item, index }) => {
                            let rankColor = "bg-slate-800/50 border-r border-slate-700";
                            let rankTextColor = "text-slate-400";
                            let cardBg = "bg-slate-900 border-slate-800";

                            if (index === 0) {
                                rankColor = "bg-yellow-500/20 border-r border-yellow-500/50";
                                rankTextColor = "text-yellow-400";
                                cardBg = "bg-slate-900 border-yellow-500/30";
                            }
                            else if (index === 1) {
                                rankColor = "bg-slate-300/20 border-r border-slate-300/50";
                                rankTextColor = "text-slate-300";
                            }
                            else if (index === 2) {
                                rankColor = "bg-orange-500/20 border-r border-orange-500/50";
                                rankTextColor = "text-orange-400";
                            }

                            return (
                                <View className={`rounded-xl mb-2 flex-row items-center border overflow-hidden pr-4 ${cardBg}`}>
                                    <View className={`w-10 py-3 items-center justify-center ${rankColor}`}>
                                        <Text className={`font-black text-lg ${rankTextColor}`}>{index + 1}</Text>
                                    </View>

                                    <View className="flex-1 pl-3 py-2">
                                        <Text className="text-white font-bold text-base" numberOfLines={1}>{item.playerName}</Text>
                                        <Text className="text-slate-500 text-[10px] font-bold mt-0.5">Спроб: {item.attemptsCount}</Text>
                                    </View>

                                    <View className="items-end py-2">
                                        <Text className="text-white font-black text-xl">{item.bestTime.toFixed(2)}<Text className="text-xs text-slate-500 font-bold ml-0.5">s</Text></Text>
                                    </View>
                                </View>
                            );
                        }}
                    />
                )}

                {/* LIST: ALL ATTEMPTS (Всі спроби) */}
                {subTab === 'ALL' && (
                    <View className="flex-1">
                        <View className="flex-row px-6 pb-2 border-b border-slate-800 mb-2 mt-2">
                            <Text className="flex-1 text-slate-500 text-[10px] font-bold tracking-widest uppercase">Гравець</Text>
                            <Text className="w-16 text-right text-slate-500 text-[10px] font-bold tracking-widest uppercase">Час</Text>
                        </View>

                        <FlatList
                            className="flex-1"
                            data={filteredAttempts}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <View className="flex-row items-center py-3 border-b border-slate-800/40">
                                    <Text className="flex-1 text-slate-300 font-medium text-sm">
                                        {item.playerName}{' '}
                                        {/* 🔥 ДОДАЛИ ДИСТАНЦІЮ В ДУЖКАХ */}
                                        <Text className="text-slate-500 text-[10px]">({item.distance}м)</Text>
                                    </Text>
                                    <Text className="w-16 text-right text-white font-bold font-mono">{item.time.toFixed(2)}</Text>
                                </View>
                            )}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}