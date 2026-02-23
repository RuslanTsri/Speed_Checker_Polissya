import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TeamSession } from '../../hooks/sessions/useSessionsData';
import { useSessionDetails } from '../../hooks/sessions/useSessionDetails';
import { useTheme } from '../../context/ThemeContext';

interface Props {
    session: TeamSession;
    onBack: () => void;
}

export default function SessionDetails({ session, onBack }: Props) {
    const { isDark } = useTheme();
    const {
        subTab, setSubTab,
        selectedDistance, setSelectedDistance, predefinedDistances,
        filteredAttempts, sortedResults, sessionStats, handleExport
    } = useSessionDetails(session);

    // 🎨 КОЛЬОРИ ЧЕРЕЗ JS (100% захист від зависань NativeWind)
    const colors = {
        bgMain: isDark ? '#020617' : '#f8fafc', // slate-950 : slate-50
        bgCard: isDark ? '#0f172a' : '#ffffff', // slate-900 : white
        border: isDark ? '#1e293b' : '#e2e8f0', // slate-800 : slate-200
        textMain: isDark ? '#ffffff' : '#0f172a', // white : slate-900
        textSub: isDark ? '#64748b' : '#64748b',  // slate-500
        yellow: isDark ? '#facc15' : '#eab308',
        tabActiveBg: isDark ? '#1e293b' : '#ffffff', // slate-800 : white
        tabInactiveBg: 'transparent',
    };

    return (
        <View className="flex-1 pt-4" style={{ backgroundColor: colors.bgMain }}>
            {/* --- HEADER --- */}
            <View className="flex-row items-center justify-between px-4 mb-4">
                <TouchableOpacity onPress={onBack} className="p-2 -ml-2">
                    <Feather name="chevron-left" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-lg font-bold" style={{ color: colors.textMain }}>Результати</Text>
                    <Text className="text-xs" style={{ color: colors.textSub }}>
                        {session.testType} {subTab === 'BEST' ? `(${selectedDistance}м)` : ''}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleExport} className="p-2 -mr-2">
                    <Feather name="upload" size={20} color={colors.yellow} />
                </TouchableOpacity>
            </View>

            {/* --- INFO CARD --- */}
            <View className="mx-4 rounded-3xl p-4 border mb-4 shadow-sm" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                <View className="flex-row justify-between mb-4">
                    <View>
                        <Text className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: colors.textSub }}>Команда</Text>
                        <Text className="text-lg font-bold" style={{ color: colors.textMain }}>{session.teamName}</Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: colors.textSub }}>Гравців у ТОПі</Text>
                        <Text className="text-lg font-bold" style={{ color: colors.textMain }}>{subTab === 'BEST' ? sortedResults.length : '-'}</Text>
                    </View>
                </View>
                <View className="flex-row">
                    <View className="mr-8">
                        <Text className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: colors.textSub }}>Найкращий</Text>
                        <Text className="text-3xl font-black" style={{ color: colors.yellow }}>{sessionStats.best > 0 ? sessionStats.best.toFixed(2) : '--'} <Text className="text-sm font-bold" style={{ color: colors.textSub }}>с</Text></Text>
                    </View>
                    <View>
                        <Text className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: colors.textSub }}>Середній</Text>
                        <Text className="text-3xl font-black" style={{ color: colors.textMain }}>{sessionStats.avg > 0 ? sessionStats.avg.toFixed(2) : '--'} <Text className="text-sm font-bold" style={{ color: colors.textSub }}>с</Text></Text>
                    </View>
                </View>
            </View>

            {/* --- TABS --- */}
            <View className="flex-row mx-4 p-1 rounded-xl mb-3 border" style={{ backgroundColor: isDark ? '#0f172a' : '#e2e8f0', borderColor: isDark ? '#1e293b' : '#cbd5e1' }}>
                <TouchableOpacity onPress={() => setSubTab('BEST')} className="flex-1 py-2 rounded-lg items-center shadow-sm" style={{ backgroundColor: subTab === 'BEST' ? colors.tabActiveBg : colors.tabInactiveBg, borderColor: subTab === 'BEST' ? colors.border : 'transparent', borderWidth: subTab === 'BEST' ? 1 : 0 }}>
                    <Text className="font-bold text-sm" style={{ color: subTab === 'BEST' ? colors.textMain : colors.textSub }}>Підсумок (Best)</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSubTab('ALL')} className="flex-1 py-2 rounded-lg items-center shadow-sm" style={{ backgroundColor: subTab === 'ALL' ? colors.tabActiveBg : colors.tabInactiveBg, borderColor: subTab === 'ALL' ? colors.border : 'transparent', borderWidth: subTab === 'ALL' ? 1 : 0 }}>
                    <Text className="font-bold text-sm" style={{ color: subTab === 'ALL' ? colors.textMain : colors.textSub }}>Усі спроби</Text>
                </TouchableOpacity>
            </View>

            {/* 🔥 ТАБИ ДИСТАНЦІЙ */}
            {subTab === 'BEST' && (
                <View className="px-4 mb-3 flex-row justify-center">
                    {predefinedDistances.map(dist => {
                        const isSelected = selectedDistance === dist;
                        const distBg = isSelected ? (isDark ? 'rgba(234, 179, 8, 0.2)' : '#fefce8') : 'transparent';
                        const distBorder = isSelected ? (isDark ? 'rgba(234, 179, 8, 0.5)' : '#fde047') : colors.border;
                        const distText = isSelected ? colors.yellow : colors.textSub;

                        return (
                            <TouchableOpacity
                                key={dist}
                                onPress={() => setSelectedDistance(dist)}
                                className="mx-2 px-6 py-1.5 rounded-full border"
                                style={{ backgroundColor: distBg, borderColor: distBorder }}
                            >
                                <Text className="font-bold text-xs" style={{ color: distText }}>{dist} м</Text>
                            </TouchableOpacity>
                        )
                    })}
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
                                <Text className="font-medium" style={{ color: colors.textSub }}>Немає результатів на {selectedDistance}м</Text>
                            </View>
                        )}
                        renderItem={({ item, index }) => {
                            let rankColor = isDark ? "rgba(30, 41, 59, 0.5)" : "#f8fafc";
                            let rankBorder = colors.border;
                            let rankTextColor = colors.textSub;
                            let itemCardBg = colors.bgCard;
                            let itemBorder = colors.border;

                            if (index === 0) {
                                rankColor = isDark ? "rgba(234, 179, 8, 0.2)" : "#fefce8";
                                rankBorder = isDark ? "rgba(234, 179, 8, 0.5)" : "#fde047";
                                rankTextColor = colors.yellow;
                                itemCardBg = isDark ? "#0f172a" : "#ffffff";
                                itemBorder = isDark ? "rgba(234, 179, 8, 0.3)" : "#facc15";
                            }

                            return (
                                <View className="rounded-xl mb-2 flex-row items-center border overflow-hidden pr-4" style={{ backgroundColor: itemCardBg, borderColor: itemBorder }}>
                                    <View className="w-10 py-3 items-center justify-center border-r" style={{ backgroundColor: rankColor, borderColor: rankBorder }}>
                                        <Text className="font-black text-lg" style={{ color: rankTextColor }}>{index + 1}</Text>
                                    </View>
                                    <View className="flex-1 pl-3 py-2">
                                        <Text className="font-bold text-base" style={{ color: colors.textMain }} numberOfLines={1}>{item.playerName}</Text>
                                        <Text className="text-[10px] font-bold mt-0.5" style={{ color: colors.textSub }}>Спроб: {item.attemptsCount}</Text>
                                    </View>
                                    <View className="items-end py-2">
                                        <Text className="font-black text-xl" style={{ color: colors.textMain }}>{item.bestTime.toFixed(2)}<Text className="text-xs font-bold ml-0.5" style={{ color: colors.textSub }}>s</Text></Text>
                                    </View>
                                </View>
                            );
                        }}
                    />
                )}

                {/* LIST: ALL ATTEMPTS (Всі спроби) */}
                {subTab === 'ALL' && (
                    <View className="flex-1">
                        <View className="flex-row px-6 pb-2 border-b mb-2 mt-2" style={{ borderColor: colors.border }}>
                            <Text className="flex-1 text-[10px] font-bold tracking-widest uppercase" style={{ color: colors.textSub }}>Гравець</Text>
                            <Text className="w-16 text-right text-[10px] font-bold tracking-widest uppercase" style={{ color: colors.textSub }}>Час</Text>
                        </View>

                        <FlatList
                            className="flex-1"
                            data={filteredAttempts}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <View className="flex-row items-center py-3 border-b" style={{ borderColor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#e2e8f0' }}>
                                    <Text className="flex-1 font-medium text-sm" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
                                        {item.playerName}{' '}
                                        <Text className="text-[10px]" style={{ color: colors.textSub }}>({item.distance}м)</Text>
                                    </Text>
                                    <Text className="w-16 text-right font-bold font-mono" style={{ color: colors.textMain }}>{item.time.toFixed(2)}</Text>
                                </View>
                            )}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}