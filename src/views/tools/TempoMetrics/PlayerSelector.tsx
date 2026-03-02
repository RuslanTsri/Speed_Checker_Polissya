import React from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { usePlayerSelection } from '../../../hooks/tempoMetrics/usePlayerSelection';
import { Player } from '../../../services/playerService';

// 🔥 Імпорт UI-компонентів
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import {
    ArrowIcon,
    ArrowIconActive,
    PhotoIcon
} from '../../../../assets/icons';

interface Props {
    teamId: string;
    onBack: () => void;
    onSelect: (players: Player[]) => void;
}

export default function PlayerSelector({ teamId, onBack, onSelect }: Props) {
    const { t } = useTranslation();
    const { players, selectedIds, toggleSelection, toggleAll, isEmpty, isLoading, search, setSearch } = usePlayerSelection(teamId);

    // ==========================================
    // СТАН: ПОРОЖНЯ КОМАНДА
    // ==========================================
    if (isEmpty) {
        return (
            <View className="flex-1 pt-4 relative">
                <View className="flex-row items-center justify-between px-4 mb-6">
                    <Pressable onPress={onBack} className="p-2 -ml-2 active:opacity-60">
                        {({ pressed }) => (
                            <View style={{ transform: [{ rotate: '-90deg' }] }}>
                                {pressed ? <ArrowIconActive width={28} height={28} fill="#F5F5F5" /> : <ArrowIcon width={28} height={28} fill="#F5F5F5" />}
                            </View>
                        )}
                    </Pressable>
                    <Text className="text-xl font-bold flex-1 text-center text-[#F5F5F5]" style={{ fontFamily: 'Unbounded' }}>
                        {t('tools.speed_checker.team_empty_title')}
                    </Text>
                    <View className="w-10" />
                </View>

                <View className="items-center justify-center flex-1 px-6 pb-20">
                    <View className="w-20 h-20 bg-white/5 border border-white/10 rounded-full items-center justify-center mb-6">
                        <Feather name="users" size={32} color="#A3A3A3" />
                    </View>
                    <Text className="text-[#A3A3A3] text-center mb-8" style={{ fontFamily: 'Evolventa', lineHeight: 22 }}>
                        {t('tools.speed_checker.team_empty_desc')}
                    </Text>
                    <Button
                        variant="outline"
                        title={t('tools.speed_checker.btn_go_back')}
                        onPress={onBack}
                        className="w-full"
                    />
                </View>
            </View>
        );
    }

    // ==========================================
    // СТАН: СПИСОК ГРАВЦІВ
    // ==========================================
    return (
        <View className="flex-1 pt-4 relative">

            {/* HEADER */}
            <View className="flex-row items-center justify-between px-4 mb-6 relative z-10">
                <Pressable onPress={onBack} className="p-2 -ml-2 active:opacity-60">
                    {({ pressed }) => (
                        <View style={{ transform: [{ rotate: '-90deg' }] }}>
                            {pressed ? <ArrowIconActive width={28} height={28} fill="#F5F5F5" /> : <ArrowIcon width={28} height={28} fill="#F5F5F5" />}
                        </View>
                    )}
                </Pressable>
                <Text className="text-xl font-bold flex-1 text-center text-[#F5F5F5]" style={{ fontFamily: 'Unbounded' }}>
                    {t('tools.speed_checker.select_players_title')}
                </Text>
                <View className="w-10" />
            </View>

            {/* ПОШУК */}
            <View className="px-4 mb-4 z-10">
                <SearchInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder={t('tools.speed_checker.search_player')}
                />
            </View>

            {/* СУБХЕДЕР */}
            <View className="flex-row justify-between items-center px-5 mb-4 z-10">
                <Text className="text-[10px] font-bold uppercase tracking-widest text-[#A3A3A3]" style={{ fontFamily: 'Evolventa' }}>
                    {t('tools.speed_checker.selected_count')} <Text className="text-[#FF6D00]">{selectedIds.length}</Text> {t('tools.speed_checker.from')} {players.length}
                </Text>

                <TouchableOpacity onPress={toggleAll} className="active:opacity-60 py-1">
                    <Text className="text-[10px] font-bold uppercase tracking-widest text-[#FF6D00]" style={{ fontFamily: 'Evolventa' }}>
                        {selectedIds.length === players.length && players.length > 0
                            ? t('tools.speed_checker.deselect_all')
                            : t('tools.speed_checker.select_all')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* СПИСОК ГРАВЦІВ */}
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
                                    isSelected
                                        ? 'bg-[#FF6D00]/10 border-[#FF6D00]/50'
                                        : 'bg-white/5 border-white/10'
                                }`}
                            >
                                {/* Ліва частина: Просто іконка та Ім'я */}
                                <View className="flex-row items-center flex-1 gap-3">
                                    <PhotoIcon width={24} height={24} fill="#A3A3A3" />
                                    <Text className="font-bold text-base text-[#F5F5F5]" style={{ fontFamily: 'Unbounded' }}>
                                        {item.name}
                                    </Text>
                                </View>

                                {/* Права частина: Чекбокс */}
                                <View className="ml-4" pointerEvents="none">
                                    <Checkbox
                                        checked={isSelected}
                                        onChange={() => {}}
                                    />
                                </View>
                            </Pressable>
                        );
                    }}
                />
            )}

            {/* 🔥 НИЖНЯ КНОПКА (Над футером) */}
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