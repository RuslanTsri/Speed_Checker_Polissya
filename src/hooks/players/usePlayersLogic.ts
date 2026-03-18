import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { teamService, Team } from '../../services/teamService';
import { playerService, Player } from '../../services/playerService';
import { useCSV, CSVPlayer } from '../useCSV';
import { syncManager } from '../../services/SyncManager';
import { useTranslation } from 'react-i18next';

export interface UITeam extends Team {
    lastSessionDate: string;
    playerCount: number;
    isMyTeam: boolean;
}

export const usePlayersLogic = () => {
    const { t } = useTranslation();
    const [teams, setTeams] = useState<UITeam[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { downloadPlayersTemplate, pickAndParseCSV } = useCSV();

    const [selectedTeam, setSelectedTeam] = useState<UITeam | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [isAddTeamOptionsVisible, setAddTeamOptionsVisible] = useState(false);
    const [isAddTeamImportVisible, setAddTeamImportVisible] = useState(false);
    const [excludedPlayers, setExcludedPlayers] = useState<Set<string>>(new Set());

    const [isAddTeamModalVisible, setAddTeamModalVisible] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [isEditTeamModalVisible, setEditTeamModalVisible] = useState(false);
    const [editingTeamName, setEditingTeamName] = useState('');
    const [isDeleteTeamModalVisible, setDeleteTeamModalVisible] = useState(false);

    const [isAddPlayerOptionsVisible, setAddPlayerOptionsVisible] = useState(false);
    const [isAddManualVisible, setAddManualVisible] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState('');

    const [isEditPlayerModalVisible, setEditPlayerModalVisible] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [editingPlayerName, setEditingPlayerName] = useState('');
    const [isDeletePlayerModalVisible, setDeletePlayerModalVisible] = useState(false);
    const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);

    const [isImportVisibleState, setImportVisibleState] = useState(false);
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [importedPlayers, setImportedPlayers] = useState<CSVPlayer[]>([]);
    const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [importMessage, setImportMessage] = useState('');

    const fetchTeams = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        const { data, error } = await teamService.getMyTeams();
        if (error) {
            if (!silent) Alert.alert(t('screens.players.error_title', 'Помилка') as string, t('screens.players.error_load_teams', 'Не вдалося завантажити команди') as string);
        } else {
            setTeams((data || []).map((teamData: any) => ({
                id: teamData.id,
                name: teamData.name || '',
                coach_id: teamData.coach_id,
                playerCount: teamData.players ? teamData.players.length : 0,
                isMyTeam: true,
                lastSessionDate: t('screens.players.no_data', 'Немає даних') as string
            })));
        }
        if (!silent) setIsLoading(false);
    }, [t]);

    const fetchPlayers = useCallback(async (teamId: string, silent = false) => {
        if (!silent) setIsLoading(true);
        const { data } = await playerService.getByTeam(teamId);
        setPlayers(data || []);
        if (!silent) setIsLoading(false);
    }, []);

    useEffect(() => { fetchTeams(); }, [fetchTeams]);

    useEffect(() => {
        if (selectedTeam?.id) fetchPlayers(selectedTeam.id as string);
        else setPlayers([]);
    }, [selectedTeam, fetchPlayers]);

    useEffect(() => {
        const unsubscribe = syncManager.subscribe(() => {
            if (!syncManager.getIsSyncing()) {
                fetchTeams(true);
                if (selectedTeam?.id) {
                    fetchPlayers(selectedTeam.id as string, true);
                }
            }
        });
        return unsubscribe;
    }, [fetchTeams, fetchPlayers, selectedTeam?.id]);

    const handleCreateTeamManual = async () => {
        if (!newTeamName.trim()) return;
        setIsLoading(true);
        const { error } = await teamService.create({ name: newTeamName.trim() });
        setIsLoading(false);
        if (error) Alert.alert(t('screens.players.error_title', 'Помилка') as string, error.message);
        else { setNewTeamName(''); setAddTeamModalVisible(false); fetchTeams(true); }
    };

    const handleSelectTeamFile = async () => {
        try {
            const parsedData = await pickAndParseCSV();
            if (parsedData) {
                setImportedPlayers(parsedData.players);
                setNewTeamName(parsedData.fileName || '');
                setExcludedPlayers(new Set());
                setAddTeamOptionsVisible(false);
                setAddTeamImportVisible(true);
            }
        } catch (e: any) {
            Alert.alert(
                t('screens.common.error', 'Помилка') as string,
                e.message || t('screens.players.error_file', 'Помилка файлу') as string
            );
        }
    };

    const toggleExcludePlayer = (playerName: string) => {
        setExcludedPlayers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(playerName)) newSet.delete(playerName);
            else newSet.add(playerName);
            return newSet;
        });
    };

    const handleConfirmImportTeam = async (skipPlayers: boolean = false) => {
        if (!newTeamName.trim()) {
            Alert.alert(
                t('screens.common.warning', 'Увага') as string,
                t('screens.players.enter_team_name', 'Введіть назву команди') as string
            );
            return;
        }

        setIsLoading(true);
        const { data: teamData, error: teamError } = await teamService.create({ name: newTeamName.trim() });

        if (teamError || !teamData) {
            setIsLoading(false);
            Alert.alert(
                t('screens.players.error_title', 'Помилка') as string,
                teamError?.message || t('screens.common.error', 'Помилка') as string
            );
            return;
        }

        if (!skipPlayers) {
            const playersToAdd = importedPlayers.filter(p => !excludedPlayers.has(p.name));
            for (const p of playersToAdd) {
                await playerService.create({ name: p.name, team_id: teamData.id as string });
            }
        }

        await fetchTeams(true);
        setAddTeamImportVisible(false);
        setNewTeamName('');
        setImportedPlayers([]);
        setIsLoading(false);
    };

    const handleDeleteTeam = () => { setDropdownVisible(false); setDeleteTeamModalVisible(true); };

    const handleConfirmDeleteTeam = async () => {
        if (!selectedTeam?.id) return;
        setIsLoading(true);
        const { error } = await teamService.delete(selectedTeam.id as string);
        setIsLoading(false);
        if (error) Alert.alert(t('screens.players.error_title', 'Помилка') as string, t('screens.players.error_delete_team', 'Не вдалося видалити команду') as string);
        else { setDeleteTeamModalVisible(false); setSelectedTeam(null); fetchTeams(true); }
    };

    const handleEditTeam = () => {
        if (!selectedTeam) return;
        setEditingTeamName(selectedTeam.name || '');
        setDropdownVisible(false);
        setEditTeamModalVisible(true);
    };

    const handleUpdateTeam = async () => {
        if (!selectedTeam?.id || !editingTeamName.trim()) return;
        setIsLoading(true);
        const { error } = await teamService.update(selectedTeam.id as string, { name: editingTeamName.trim() });
        setIsLoading(false);
        if (error) Alert.alert(t('screens.players.error_title', 'Помилка') as string, t('screens.players.error_update_team', 'Не вдалося оновити команду') as string);
        else {
            setSelectedTeam({ ...selectedTeam, name: editingTeamName.trim() } as UITeam);
            fetchTeams(true);
            setEditTeamModalVisible(false);
        }
    };

    const handleAddManualPlayer = async () => {
        if (!newPlayerName.trim() || !selectedTeam?.id) return;
        setIsLoading(true);
        const { error } = await playerService.create({ name: newPlayerName.trim(), team_id: selectedTeam.id as string });
        setIsLoading(false);
        if (error) Alert.alert(t('screens.players.error_title', 'Помилка') as string, error.message);
        else {
            setNewPlayerName('');
            setAddManualVisible(false);
            fetchPlayers(selectedTeam.id as string, true);
            fetchTeams(true);
        }
    };

    const handleEditPlayer = (player: Player) => {
        setEditingPlayer(player);
        setEditingPlayerName(player.name || '');
        setEditPlayerModalVisible(true);
    };

    const handleUpdatePlayer = async () => {
        if (!editingPlayer || !editingPlayer.id || !editingPlayerName.trim() || !selectedTeam?.id) return;
        setIsLoading(true);
        const { error } = await playerService.update(editingPlayer.id as string, { name: editingPlayerName.trim() });
        setIsLoading(false);
        if (error) {
            Alert.alert(t('screens.players.error_title', 'Помилка') as string, t('screens.players.error_update_player', 'Не вдалося оновити гравця') as string);
        } else {
            fetchPlayers(selectedTeam.id as string, true);
            setEditPlayerModalVisible(false);
            setEditingPlayer(null);
        }
    };

    const handleDeletePlayer = (player: Player) => {
        if (!player.id) return;
        setPlayerToDelete(player);
        setDeletePlayerModalVisible(true);
    };

    const handleConfirmDeletePlayer = async () => {
        if (!playerToDelete || !playerToDelete.id || !selectedTeam?.id) return;
        setIsLoading(true);
        const { error } = await playerService.delete(playerToDelete.id as string);
        setIsLoading(false);
        if (error) {
            Alert.alert(t('screens.players.error_title', 'Помилка') as string, t('screens.players.error_delete_player', 'Не вдалося видалити гравця') as string);
        } else {
            fetchPlayers(selectedTeam.id as string, true);
            fetchTeams(true);
            setDeletePlayerModalVisible(false);
            setPlayerToDelete(null);
        }
    };

    const handleSetImportVisible = (visible: boolean) => {
        if (visible) setImportVisibleState(true);
        else { setImportVisibleState(false); setImportedPlayers([]); setImportStatus('idle'); setImportMessage(''); }
    };

    const handleSelectFile = async () => {
        setImportStatus('idle'); setImportMessage('');
        try {
            const parsedData = await pickAndParseCSV();
            if (parsedData) {
                setImportedPlayers(parsedData.players);
                setExcludedPlayers(new Set());
            }
        }
        catch (e: any) {
            setImportStatus('error');
            setImportMessage(e.message || t('screens.common.error', 'Помилка') as string);
        }
    };

    const handleConfirmImport = async () => {
        if (!selectedTeam?.id || importedPlayers.length === 0) return;
        setIsLoading(true);
        setImportStatus('idle');
        let successCount = 0;

        const playersToAdd = importedPlayers.filter(p => !excludedPlayers.has(p.name));

        for (const p of playersToAdd) {
            const response = await playerService.create({ name: p.name, team_id: selectedTeam.id as string });
            if (!response.error) successCount++;
        }

        if (successCount > 0) {
            setImportStatus('success');
            await fetchPlayers(selectedTeam.id as string, true);
            await fetchTeams(true);
            setIsLoading(false);
            handleSetImportVisible(false);
        } else {
            setImportStatus('error');
            setImportMessage(t('screens.players.error_import_add', 'Помилка імпорту') as string);
            setIsLoading(false);
        }
    };

    const handleMockImport = () => { handleSetImportVisible(true); };
    const getInitials = (name: string) => (name || '').charAt(0).toUpperCase();
    const filteredTeams = teams.filter(t => (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

    return {
        teams, filteredTeams, players, selectedTeam, setSelectedTeam, isLoading,
        searchQuery, setSearchQuery, getInitials,
        isAddTeamOptionsVisible, setAddTeamOptionsVisible,
        isAddTeamImportVisible, setAddTeamImportVisible, excludedPlayers,
        toggleExcludePlayer, handleCreateTeamManual, handleSelectTeamFile, handleConfirmImportTeam,
        isAddTeamModalVisible, setAddTeamModalVisible, newTeamName, setNewTeamName,
        isEditTeamModalVisible, setEditTeamModalVisible, editingTeamName, setEditingTeamName, handleUpdateTeam,
        isDeleteTeamModalVisible, setDeleteTeamModalVisible, handleConfirmDeleteTeam,
        isAddPlayerOptionsVisible, setAddPlayerOptionsVisible, isAddManualVisible, setAddManualVisible, newPlayerName, setNewPlayerName,
        isEditPlayerModalVisible, setEditPlayerModalVisible, editingPlayerName, setEditingPlayerName,
        isDeletePlayerModalVisible, setDeletePlayerModalVisible, playerToDelete,
        handleAddManualPlayer, handleEditPlayer, handleUpdatePlayer,
        handleDeletePlayer, handleConfirmDeletePlayer,
        isDropdownVisible, setDropdownVisible,
        handleDeleteTeam, handleEditTeam, handleMockImport,
        isImportVisible: isImportVisibleState, setImportVisible: handleSetImportVisible,
        downloadTemplate: downloadPlayersTemplate, importedPlayers, importStatus, importMessage, handleSelectFile, handleConfirmImport
    };
};