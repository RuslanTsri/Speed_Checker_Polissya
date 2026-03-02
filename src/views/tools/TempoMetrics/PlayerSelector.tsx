import React from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { usePlayerSelection } from '../../../hooks/tempoMetrics/usePlayerSelection';
import { Player } from '../../../services/playerService';

import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { ArrowIcon, ArrowIconActive, PhotoIcon } from '../../../../assets/icons';

interface Props {
    teamId: string;
    onBack: () => void;
    onSelect: (players: Player[]) => void;
}

export default function PlayerSelector({ teamId, onBack, onSelect }: Props) {
    const { t } = useTranslation();
    const { players, selectedIds, toggleSelection, toggleAll, isEmpty, isLoading, search, setSearch } = usePlayerSelection(teamId);

    if (isEmpty) {
        return (
            <View className="flex-1 pt-4 relative bg-surface-bg">
                <View className="flex-row items-center justify-between px-4 mb-6">
                    <Pressable onPress={onBack} className="p-2 -ml-2 active:opacity-60">
                        <View style={styles.rotateNeg90}>
                            <ArrowIcon width={28} height={28} fill="#F5F5F5" />
                        </View>
                    </Pressable>
                    <Text className="text-h3 font-bold flex-1 text-center text-text-main font-unbounded">
                        {t('tools.speed_checker.team_empty_title')}
                    </Text>
                    <View className="w-10" />
                </View>

                <View className="items-center justify-center flex-1 px-6 pb-20">
                    <View className="w-20 h-20 bg-surface-card border border-surface-border rounded-full items-center justify-center mb-6">
                        <Feather name="users" size={32} color="#717171" />
                    </View>
                    <Text className="text-text-sub text-center mb-8 font-evolventa text-body leading-5">
                        {t('tools.speed_checker.team_empty_desc')}
                    </Text>
                    <Button variant="outline" title={t('tools.speed_checker.btn_go_back')} onPress={onBack} className="w-full" />
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 pt-4 relative bg-surface-bg">
            <View className="flex-row items-center justify-between px-4 mb-6 z-10">
                <Pressable onPress={onBack} className="p-2 -ml-2 active:opacity-60">
                    <View style={styles.rotateNeg90}>
                        <ArrowIcon width={28} height={28} fill="#F5F5F5" />
                    </View>
                </Pressable>
                <Text className="text-h3 font-bold flex-1 text-center text-text-main font-unbounded">
                    {t('tools.speed_checker.select_players_title')}
                </Text>
                <View className="w-10" />
            </View>

            <View className="px-4 mb-4 z-10">
                <SearchInput value={search} onChangeText={setSearch} placeholder={t('tools.speed_checker.search_player')} />
            </View>

            <View className="flex-row justify-between items-center px-5 mb-4 z-10">
                <Text className="text-caption font-bold uppercase tracking-widest text-text-muted font-evolventa">
                    {t('tools.speed_checker.selected_count')} <Text className="text-brand-orange">{selectedIds.length}</Text> {t('tools.speed_checker.from')} {players.length}
                </Text>
                <TouchableOpacity onPress={toggleAll} className="active:opacity-60 py-1">
                    <Text className="text-caption font-bold uppercase tracking-widest text-brand-orange font-evolventa">
                        {selectedIds.length === players.length && players.length > 0 ? t('tools.speed_checker.deselect_all') : t('tools.speed_checker.select_all')}
                    </Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#FF6D00" className="mt-10" />
            ) : (
                <FlatList
                    data={players}
                    keyExtractor={item => item.id || Math.random().toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 200 }}
                    renderItem={({ item }) => {
                        const isSelected = selectedIds.includes(item.id || '');
                        return (
                            <Pressable
                                onPress={() => toggleSelection(item.id || '')}
                                style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }]}
                                className={`p-4 rounded-3xl mb-3 border flex-row items-center justify-between transition-colors shadow-sm ${
                                    isSelected ? 'bg-brand-orange/10 border-brand-orange/50' : 'bg-surface-card border-surface-border'
                                }`}
                            >
                                <View className="flex-row items-center flex-1 gap-3">
                                    <PhotoIcon width={24} height={24} fill="#717171" />
                                    <Text className="font-bold text-body text-text-main font-unbounded">{item.name}</Text>
                                </View>
                                <View className="ml-4" pointerEvents="none">
                                    <Checkbox checked={isSelected} onChange={() => {}} />
                                </View>
                            </Pressable>
                        );
                    }}
                />
            )}

            <View className="absolute bottom-28 left-4 right-4 z-50">
                <Button
                    variant="primary"
                    title={t('tools.speed_checker.btn_continue')}
                    onPress={() => onSelect(players.filter(p => selectedIds.includes(p.id || '')))}
                    disabled={selectedIds.length === 0}
                    className="w-full shadow-xl shadow-black/50"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({ rotateNeg90: { transform: [{ rotate: '-90deg' }] } });