import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { TeamSession } from '../../hooks/sessions/useSessionsData';
import { useSessionDetails } from '../../hooks/sessions/useSessionDetails';

import { Mod, RatingMod } from '../components/ui/mods';
import { HeaderTabs, SubTabs } from '../components/ui/tabs/';

import { ExportIcon, ExportIconActive, ArrowIconActive, ArrowIcon } from '../../../assets/icons';

interface Props { session: TeamSession; onBack: () => void; }

export default function SessionDetails({ session, onBack }: Props) {
    const { t } = useTranslation();
    const {
        subTab, setSubTab, selectedDistance, setSelectedDistance, predefinedDistances,
        filteredAttempts, sortedResults, sessionStats, handleExport
    } = useSessionDetails(session);

    // Конфіг для головних табів
    const mainTabs = [
        { id: 'BEST', label: t('tools.sessions.tab_summary') as string }, // "Підсумок (Best)"
        { id: 'ALL', label: t('tools.sessions.tab_all_attempts') as string } // "Усі спроби"
    ];

    return (
        <View className="flex-1 pt-4 relative">

            {/* --- HEADER --- */}
            <View className="flex-row items-center justify-between px-4 mb-6 relative z-10">

                {/* 🔥 КНОПКА НАЗАД (Кастомна стрілка) */}
                <Pressable onPress={onBack} className="p-2 -ml-2 active:opacity-60">
                    {({ pressed }) => (
                        <View style={{ transform: [{ rotate: '-90deg' }] }}>
                            {pressed ? (
                                <ArrowIconActive width={24} height={24} fill="#F5F5F5" />
                            ) : (
                                <ArrowIcon width={24} height={24} fill="#F5F5F5" />
                            )}
                        </View>
                    )}
                </Pressable>

                {/* Текстовий блок по центру */}
                <View className="items-center flex-1">
                    <Text className="text-xl font-bold text-[#F5F5F5]" style={{ fontFamily: 'Unbounded' }}>
                        {t('tools.sessions.results_title') as string}
                    </Text>
                    <Text className="text-xs text-[#A3A3A3] mt-0.5" style={{ fontFamily: 'Evolventa' }}>
                        {t('tools.sessions.team') as string} {session.teamName}
                    </Text>
                </View>

                {/* 🔥 ІКОНКА ЕКСПОРТУ */}
                <Pressable onPress={handleExport} className="p-2 -mr-2 active:opacity-60">
                    {({ pressed }) => (
                        pressed ? (
                            <ExportIconActive width={24} height={24} />
                        ) : (
                            <ExportIcon width={24} height={24} fill="#F5F5F5" />
                        )
                    )}
                </Pressable>
            </View>

            {/* --- INFO CARD (Використовуємо Mod) --- */}
            <View className="px-4 mb-6 mt-2">
                <Mod
                    title={session.teamName}
                    subtitle={t('tools.sessions.team') as string}

                    rightHeader={
                        <View className="items-end">
                            <Text className="text-[10px] text-[#A3A3A3] mb-0.5 tracking-widest uppercase" style={{ fontFamily: 'Evolventa' }}>
                                {t('tools.sessions.top_players') as string}
                            </Text>
                            <Text className="text-lg font-black text-[#F5F5F5]" style={{ fontFamily: 'Unbounded' }}>
                                {subTab === 'BEST' ? sortedResults.length : '-'}
                            </Text>
                        </View>
                    }
                >
                    <View className="flex-row justify-between items-end border-t border-white/10 pt-4 mt-1">

                        {/* ЛІВИЙ НИЖНІЙ КУТ: Найкращий (Світлий "кожаний" відтінок) */}
                        <View>
                            <Text className="text-[10px] text-[#A3A3A3] mb-1 tracking-widest uppercase" style={{ fontFamily: 'Evolventa' }}>
                                {t('tools.sessions.best') as string}
                            </Text>
                            <Text className="text-3xl font-black text-[#E5A059]" style={{ fontFamily: 'Unbounded' }}>
                                {sessionStats.best > 0 ? sessionStats.best.toFixed(2) : '--'}
                            </Text>
                        </View>

                        {/* ПРАВИЙ НИЖНІЙ КУТ: Середній (Фірмовий помаранчевий) */}
                        <View className="items-end">
                            <Text className="text-[10px] text-[#A3A3A3] mb-1 tracking-widest uppercase" style={{ fontFamily: 'Evolventa' }}>
                                {t('tools.sessions.average') as string}
                            </Text>
                            <Text className="text-3xl font-black text-[#FF6D00]" style={{ fontFamily: 'Unbounded' }}>
                                {sessionStats.avg > 0 ? sessionStats.avg.toFixed(2) : '--'}
                            </Text>
                        </View>

                    </View>
                </Mod>
            </View>

            {/* --- TABS (Підсумок / Усі спроби) --- */}
            <View className="px-4 mb-4">
                <HeaderTabs
                    tabs={mainTabs}
                    activeTab={subTab}
                    onTabChange={(id) => setSubTab(id as 'BEST' | 'ALL')}
                />
            </View>

            {/* --- SUB TABS (10м, 20м, 30м) --- */}
            {subTab === 'BEST' && predefinedDistances.length > 0 && (
                <SubTabs
                    distances={predefinedDistances}
                    selectedDistance={selectedDistance}
                    onSelect={setSelectedDistance}
                />
            )}

            {/* --- СПИСОК РЕЗУЛЬТАТІВ --- */}
            <View className="flex-1">
                {subTab === 'BEST' && (
                    <>
                        <Text className="px-4 mb-2 text-[11px] font-bold text-[#A3A3A3] uppercase tracking-[0.1em]" style={{ fontFamily: 'Evolventa' }}>
                            {t("tools.sessions.player")}
                        </Text>
                        <FlatList
                            data={sortedResults}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={() => (
                                <View className="py-10 items-center">
                                    <Text className="font-medium text-[#A3A3A3]" style={{ fontFamily: 'Evolventa' }}>
                                        {t('tools.sessions.no_results_distance', { dist: selectedDistance }) as string}
                                    </Text>
                                </View>
                            )}
                            renderItem={({ item, index }) => (
                                // 🔥 ВИКОРИСТОВУЄМО RatingMod
                                <RatingMod
                                    rank={index + 1}
                                    name={item.playerName}
                                    subtitle={t('tools.sessions.attempts_count', { count: item.attemptsCount }) as string} // Тут можна вивести Роль або К-сть спроб
                                    resultValue={item.bestTime.toFixed(2)}
                                    // Якщо є швидкість, показуємо, якщо ні - можна прибрати або залишити як приклад
                                    secondaryValue="25.1 km/h"
                                    className="mb-3"
                                    onPress={() => {}} // Клік на гравця
                                />
                            )}
                        />
                    </>
                )}

                {/* --- УСІ СПРОБИ (Простий список у стилі Glassmorphism) --- */}
                {subTab === 'ALL' && (
                    <View className="flex-1">
                        <View className="flex-row px-6 pb-2 border-b border-white/10 mb-2 mt-2">
                            <Text className="flex-1 text-[10px] font-bold tracking-widest uppercase text-[#A3A3A3]" style={{ fontFamily: 'Evolventa' }}>
                                {t('tools.sessions.player') as string}
                            </Text>
                            <Text className="w-16 text-right text-[10px] font-bold tracking-widest uppercase text-[#A3A3A3]" style={{ fontFamily: 'Evolventa' }}>
                                {t('tools.sessions.time') as string}
                            </Text>
                        </View>
                        <FlatList
                            data={filteredAttempts}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <View className="flex-row items-center py-4 border-b border-white/5">
                                    <Text className="flex-1 text-sm text-[#F5F5F5]" style={{ fontFamily: 'Evolventa' }}>
                                        {item.playerName} <Text className="text-[10px] text-[#FF6D00]">({item.distance}м)</Text>
                                    </Text>
                                    <Text className="w-16 text-right text-lg font-bold text-[#FF6D00]" style={{ fontFamily: 'Unbounded' }}>
                                        {item.time.toFixed(2)}
                                    </Text>
                                </View>
                            )}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}