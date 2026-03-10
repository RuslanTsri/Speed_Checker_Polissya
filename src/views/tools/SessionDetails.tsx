import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSessionDetails } from '../../hooks/sessions/useSessionDetails';

import { Mod, RatingMod } from '../components/ui/mods';
import { HeaderTabs, SubTabs } from '../components/ui/tabs/';
import { ExportIcon, ArrowIcon, ArrowIconActive } from '../../../assets/icons';

export default function SessionDetails({ session, onBack }: any) {
    const { t } = useTranslation();
    const {
        subTab, setSubTab, selectedDistance, setSelectedDistance, predefinedDistances,
        filteredAttempts, sortedResults, sessionStats, handleExport
    } = useSessionDetails(session);

    const mainTabs = [
        { id: 'BEST', label: t('tools.sessions.tab_summary') as string },
        { id: 'ALL', label: t('tools.sessions.tab_all_attempts') as string }
    ];

    return (
        <View className="flex-1 pt-4">
            <View className="flex-row items-center justify-between px-4 mb-6">

                <Pressable onPress={onBack} className="p-2 -ml-2">
                    {({ pressed }) => (
                        <View style={styles.rotateRight}>
                            {pressed ? (
                                <ArrowIconActive width={24} height={24} fill="#FF6D00" />
                            ) : (
                                <ArrowIcon width={24} height={24} fill="#F5F5F5" />
                            )}
                        </View>
                    )}
                </Pressable>

                <View className="items-center flex-1">
                    <Text className="text-h4 text-text-main font-unbounded-bold">{t('tools.sessions.results_title')}</Text>
                    <Text className="text-caption text-text-sub font-evolventa">{session.teamName}</Text>
                </View>

                <Pressable onPress={handleExport} className="p-2 active:opacity-60">
                    <ExportIcon width={24} height={24} fill="#F5F5F5" />
                </Pressable>
            </View>

            <View className="px-4 mb-6">
                <Mod title={session.teamName} subtitle={t('tools.sessions.team')}>
                    <View className="flex-row justify-between items-end border-t border-surface-border pt-4 mt-1">
                        <View>
                            <Text className="text-caption text-text-sub uppercase font-evolventa">{t('tools.sessions.best')}</Text>
                            <Text className="text-h1 text-brand-yellow font-unbounded-black">
                                {sessionStats.best > 0 ? sessionStats.best.toFixed(2) : '--'}
                            </Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-caption text-text-sub uppercase font-evolventa">{t('tools.sessions.average')}</Text>
                            <Text className="text-h1 text-brand-orange font-unbounded-black">
                                {sessionStats.avg > 0 ? sessionStats.avg.toFixed(2) : '--'}
                            </Text>
                        </View>
                    </View>
                </Mod>
            </View>

            <View className="px-4 mb-5"><HeaderTabs tabs={mainTabs} activeTab={subTab} onTabChange={id => setSubTab(id as any)} /></View>
            {subTab === 'BEST' && <SubTabs distances={predefinedDistances} selectedDistance={selectedDistance} onSelect={setSelectedDistance} />}

            <FlatList
                data={subTab === 'BEST' ? sortedResults : filteredAttempts}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                renderItem={({ item, index }) => (
                    subTab === 'BEST' ? (
                        <RatingMod rank={index + 1} name={item.playerName} resultValue={item.bestTime.toFixed(2)} className="mb-3" />
                    ) : (
                        <View className="flex-row items-center py-4 border-b border-surface-border/30">
                            <Text className="flex-1 text-body text-text-main font-evolventa">{item.playerName}</Text>
                            <Text className="text-h4 text-brand-orange font-unbounded-bold">{item.time.toFixed(2)}</Text>
                        </View>
                    )
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    rotateRight: { transform: [{ rotate: '-90deg' }] } // Поворот вправо на 90 градусів
});