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
        rounds,
        filteredAttempts,
        sortedResults,
        handleExport
    } = useSessionDetails(session);

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
                <TouchableOpacity onPress={handleExport} className="p-2 -mr-2">
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

            {/* Tabs */}
            <View className="flex-row mx-4 bg-slate-900 p-1 rounded-xl mb-4 border border-slate-800">
                <TouchableOpacity onPress={() => setSubTab('BEST')} className={`flex-1 py-2 rounded-lg items-center ${subTab === 'BEST' ? 'bg-slate-800 border border-slate-700' : ''}`}>
                    <Text className={`font-bold text-sm ${subTab === 'BEST' ? 'text-white' : 'text-slate-500'}`}>Підсумок (Best)</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSubTab('ALL')} className={`flex-1 py-2 rounded-lg items-center ${subTab === 'ALL' ? 'bg-slate-800 border border-slate-700' : ''}`}>
                    <Text className={`font-bold text-sm ${subTab === 'ALL' ? 'text-white' : 'text-slate-500'}`}>Усі спроби</Text>
                </TouchableOpacity>
            </View>

            {/* LIST: BEST */}
            {subTab === 'BEST' && (
                <FlatList
                    data={sortedResults}
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

            {/* LIST: ALL ATTEMPTS */}
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