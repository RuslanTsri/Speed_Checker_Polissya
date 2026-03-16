import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { usePlayerSelection } from '../../../hooks/tempoMetrics/usePlayerSelection';
import { usePlayersLogic } from '../../../hooks/players/usePlayersLogic';
import { Player } from '../../../services/playerService';

import { SearchInput } from '../../components/ui/SearchInput';
import { Button, IconButton } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import {
    ArrowIcon, ArrowIconActive, PhotoIcon,
    DocIcon, DocIconActive, UserIcon, UserIconActive,
    ImportIcon, ImportIconActive, ExportIcon, ExportIconActive
} from '../../../../assets/icons';

import { AppModal } from '../../components/AppModal';
import { TextField } from '../../components/ui/TextField';

interface Props {
    teamId: string;
    onBack: () => void;
    onSelect: (players: Player[]) => void;
}

export default function PlayerSelector({ teamId, onBack, onSelect }: Props) {
    const { t } = useTranslation();
    const { players: localPlayers, selectedIds, toggleSelection, toggleAll, isEmpty, isLoading: isSelectionLoading, search, setSearch } = usePlayerSelection(teamId);

    const {
        setSelectedTeam,
        isAddManualVisible, setAddManualVisible, newPlayerName, setNewPlayerName, handleAddManualPlayer,
        isAddPlayerOptionsVisible, setAddPlayerOptionsVisible,
        isImportVisible, setImportVisible, downloadTemplate, importedPlayers, handleSelectFile, handleConfirmImport,
        excludedPlayers, toggleExcludePlayer, // ДОДАНО: Стейт та функція для викреслювання гравців
        isLoading: isLogicLoading
    } = usePlayersLogic();

    const isInitialLoading = isSelectionLoading && localPlayers.length === 0;

    useEffect(() => {
        // @ts-ignore
        setSelectedTeam({ id: teamId });
        return () => setSelectedTeam(null);
    }, [teamId]);

    const onPlayerCreate = async () => {
        await handleAddManualPlayer();
    };

    const modalsJSX = (
        <>
            <AppModal type="bottom" visible={isAddPlayerOptionsVisible} onClose={() => setAddPlayerOptionsVisible(false)} title={t('screens.players.modal_players_title')}>
                <View className="flex-row gap-3 mb-2 mt-4">
                    <Pressable
                        onPress={() => { setAddPlayerOptionsVisible(false); setImportVisible(true); }}
                        className="flex-1 rounded-3xl p-5 border border-white/5 bg-white/5 justify-between"
                        style={({ pressed }) => [{ minHeight: 150 }, pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }]}
                    >
                        {({ pressed }) => (
                            <>
                                <View className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 self-start mb-4 items-center justify-center w-12 h-12">
                                    {pressed ? <DocIconActive width={24} height={24} /> : <DocIcon width={24} height={24} />}
                                </View>
                                <View>
                                    <Text className="text-[#F5F5F5] text-sm leading-5 mb-1 font-unbounded-bold">{t('screens.players.import_from_file')}</Text>
                                    <Text className="text-[#A3A3A3] text-[10px] leading-4 font-evolventa">{t('screens.players.import_desc_csv')}</Text>
                                </View>
                            </>
                        )}
                    </Pressable>

                    <Pressable
                        onPress={() => { setAddPlayerOptionsVisible(false); setAddManualVisible(true); }}
                        className="flex-1 rounded-3xl p-5 border border-white/5 bg-white/5 justify-between"
                        style={({ pressed }) => [{ minHeight: 150 }, pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }]}
                    >
                        {({ pressed }) => (
                            <>
                                <View className="bg-[#FF6D00]/10 p-3 rounded-xl border border-[#FF6D00]/20 self-start mb-4 items-center justify-center w-12 h-12">
                                    {pressed ? <UserIconActive width={24} height={24} /> : <UserIcon width={24} height={24} />}
                                </View>
                                <View>
                                    <Text className="text-[#F5F5F5] text-sm leading-5 mb-1 font-unbounded-bold">{t('screens.players.add_manual')}</Text>
                                    <Text className="text-[#A3A3A3] text-[10px] leading-4 font-evolventa">{t('screens.players.add_manual_desc')}</Text>
                                </View>
                            </>
                        )}
                    </Pressable>
                </View>
            </AppModal>

            <AppModal type="center" visible={isAddManualVisible} onClose={() => setAddManualVisible(false)} title={t('screens.players.modal_new_player')}>
                <TextField
                    value={newPlayerName}
                    onChangeText={setNewPlayerName}
                    placeholder={t('screens.players.placeholder_player_name')}
                    autoFocus
                />
                <View className="flex-row gap-3 mt-4">
                    <Button variant="outline" title={t('screens.players.btn_cancel')} onPress={() => setAddManualVisible(false)} className="flex-1" />
                    <Button variant="primary" title={t('screens.players.btn_add')} onPress={onPlayerCreate} className="flex-1" disabled={!newPlayerName?.trim() || isLogicLoading} />
                </View>
            </AppModal>

            <AppModal type="bottom" visible={isImportVisible} onClose={() => setImportVisible(false)} title={importedPlayers.length > 0 ? t('tools.speed_checker.import_file_verified') : t('screens.players.import_title')}>
                {importedPlayers.length === 0 ? (
                    <>
                        <Pressable
                            onPress={() => downloadTemplate()}
                            className="flex-row items-center border border-white/10 p-4 rounded-2xl mb-6 bg-white/5"
                            style={({ pressed }) => [pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }]}
                        >
                            {({ pressed }) => (
                                <>
                                    <View className="bg-emerald-500/10 p-3 rounded-xl mr-4 border border-emerald-500/20">
                                        {pressed ? <ExportIconActive width={24} height={24} /> : <ExportIcon width={24} height={24} fill="#34d399" />}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-base text-white font-unbounded-bold">{t('screens.players.import_template')}</Text>
                                        <Text className="text-xs text-[#A3A3A3] font-evolventa">{t('screens.players.import_template_desc')}</Text>
                                    </View>
                                    <Feather name="chevron-right" size={20} color="#A3A3A3" />
                                </>
                            )}
                        </Pressable>

                        <Pressable
                            onPress={() => handleSelectFile()}
                            className="border-2 border-dashed border-white/10 rounded-3xl py-10 items-center justify-center mb-4 bg-white/5"
                            style={({ pressed }) => [pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }]}
                        >
                            {({ pressed }) => (
                                <>
                                    <View className="mb-3">
                                        {pressed ? <ImportIconActive width={36} height={36} /> : <ImportIcon width={36} height={36} fill="#FF6D00" />}
                                    </View>
                                    <Text className="text-[#FF6D00] font-evolventa-bold">
                                        {t('screens.players.import_click_select')}
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    </>
                ) : (
                    <View className="w-full">
                        <View className="flex-row items-center border border-emerald-500/30 bg-[#0A0A0A]/50 p-4 rounded-2xl mb-6 shadow-sm">
                            <View className="mr-4">
                                <DocIconActive width={28} height={28} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base text-[#F5F5F5] mb-0.5 font-unbounded-bold">
                                    {t('tools.speed_checker.import_file_verified') || 'Файл перевірений'}
                                </Text>
                                <Text className="text-xs text-emerald-500 font-evolventa-bold">
                                    {t('tools.speed_checker.import_found_players', { count: importedPlayers.length }) || `Знайдено ${importedPlayers.length} гравців`}
                                </Text>
                            </View>
                        </View>

                        <Text className="text-[11px] text-[#F5F5F5] mb-3 font-evolventa-bold">
                            Список гравців
                        </Text>

                        <Text className="text-[11px] text-[#A3A3A3] mb-3 font-evolventa">
                            Натисніть на гравця, щоб виділити його <Text className="text-red-500 font-bold">червоним</Text> (він не додасться до команди).
                        </Text>

                        {/* ДОДАНО: Новий ScrollView з TouchableOpacity для виключення гравців */}
                        <ScrollView
                            className="mb-6 max-h-[250px]"
                            showsVerticalScrollIndicator={true}
                            contentContainerStyle={{ paddingBottom: 10 }}
                        >
                            {importedPlayers?.map((player: any, index: number) => {
                                const isExcluded = excludedPlayers.has(player.name);
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        activeOpacity={0.7}
                                        onPress={() => toggleExcludePlayer(player.name)}
                                        className={`flex-row items-center px-4 py-3 rounded-xl mb-2 border transition-colors ${
                                            isExcluded
                                                ? 'border-red-500/50 bg-red-500/10'
                                                : 'border-white/5 bg-[#0A0A0A]'
                                        }`}
                                    >
                                        <View className="flex-1">
                                            <Text className={`font-evolventa-bold text-base ${isExcluded ? 'text-red-500 line-through opacity-70' : 'text-[#F5F5F5]'}`}>
                                                {player.name}
                                            </Text>
                                        </View>
                                        {isExcluded && <Feather name="x-circle" size={18} color="#ef4444" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <Button
                            variant="primary"
                            title={isLogicLoading ? "Зачекайте... йде імпортування" : (t('tools.speed_checker.import_confirm') || 'Імпортувати')}
                            onPress={() => handleConfirmImport()}
                            disabled={isLogicLoading}
                        />
                    </View>
                )}
            </AppModal>
        </>
    );

    return (
        <View className="flex-1 pt-4 relative">
            {isInitialLoading && (
                <>
                    <View className="flex-row items-center justify-between px-4 mb-6 z-10">
                        <Pressable onPress={onBack} className="p-2 -ml-2">
                            {({ pressed }) => (
                                <View style={styles.rotateNeg90}>
                                    {pressed ? <ArrowIconActive width={28} height={28} /> : <ArrowIcon width={28} height={28} fill="#F5F5F5" />}
                                </View>
                            )}
                        </Pressable>
                        <Text className="text-h3 flex-1 text-center text-text-main font-unbounded-bold">
                            {t('tools.speed_checker.select_players_title')}
                        </Text>
                        <View className="w-10" />
                    </View>
                    <View className="flex-1 justify-center items-center pb-20">
                        <ActivityIndicator size="large" color="#FF6D00" />
                    </View>
                </>
            )}

            {isEmpty && !isInitialLoading && (
                <>
                    <View className="flex-row items-center justify-between px-4 mb-6 z-10">
                        <Pressable onPress={onBack} className="p-2 -ml-2">
                            {({ pressed }) => (
                                <View style={styles.rotateNeg90}>
                                    {pressed ? <ArrowIconActive width={28} height={28} /> : <ArrowIcon width={28} height={28} fill="#F5F5F5" />}
                                </View>
                            )}
                        </Pressable>
                        <Text className="text-h3 flex-1 text-center text-text-main font-unbounded-bold">
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
                        <Button
                            variant="primary"
                            title={t('tools.speed_checker.btn_add_players')}
                            onPress={() => setAddPlayerOptionsVisible(true)}
                            className="w-full mb-3"
                        />
                        <Button variant="outline" title={t('tools.speed_checker.btn_go_back')} onPress={onBack} className="w-full" />
                    </View>
                </>
            )}

            {!isEmpty && !isInitialLoading && (
                <>
                    <View className="flex-row items-center justify-between px-4 mb-6 z-10">
                        <Pressable onPress={onBack} className="p-2 -ml-2">
                            {({ pressed }) => (
                                <View style={styles.rotateNeg90}>
                                    {pressed ? <ArrowIconActive width={28} height={28} /> : <ArrowIcon width={28} height={28} fill="#F5F5F5" />}
                                </View>
                            )}
                        </Pressable>
                        <Text className="text-h3 flex-1 text-center text-text-main font-unbounded-bold">
                            {t('tools.speed_checker.select_players_title')}
                        </Text>
                        <IconButton
                            onPress={() => setAddPlayerOptionsVisible(true)}
                            icon={<Feather name="user-plus" size={24} color="#F5F5F5" />}
                        />
                    </View>

                    <View className="px-4 mb-4 z-10">
                        <SearchInput value={search} onChangeText={setSearch} placeholder={t('tools.speed_checker.search_player')} />
                    </View>

                    <View className="flex-row justify-between items-center px-5 mb-4 z-10">
                        <Text className="text-caption uppercase tracking-widest text-text-muted font-evolventa-bold">
                            {t('tools.speed_checker.selected_count')} <Text className="text-brand-orange">{selectedIds.length}</Text> {t('tools.speed_checker.from')} {localPlayers.length}
                        </Text>
                        <TouchableOpacity onPress={toggleAll} className="active:opacity-60 py-1">
                            <Text className="text-caption uppercase tracking-widest text-brand-orange font-evolventa-bold">
                                {selectedIds.length === localPlayers.length && localPlayers.length > 0 ? t('tools.speed_checker.deselect_all') : t('tools.speed_checker.select_all')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={localPlayers}
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
                                        <Text className="text-body text-text-main font-unbounded-bold">{item.name}</Text>
                                    </View>
                                    <View className="ml-4" pointerEvents="none">
                                        <Checkbox checked={isSelected} onChange={() => {}} />
                                    </View>
                                </Pressable>
                            );
                        }}
                    />

                    <View className="absolute bottom-28 left-4 right-4 z-50">
                        <Button
                            variant="primary"
                            title={t('tools.speed_checker.btn_continue')}
                            onPress={() => onSelect(localPlayers.filter(p => selectedIds.includes(p.id || '')))}
                            disabled={selectedIds.length === 0}
                            className="w-full shadow-xl"
                        />
                    </View>
                </>
            )}

            {modalsJSX}
        </View>
    );
}

const styles = StyleSheet.create({ rotateNeg90: { transform: [{ rotate: '-90deg' }] } });