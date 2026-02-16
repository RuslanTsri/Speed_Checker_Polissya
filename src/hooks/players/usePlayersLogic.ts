import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { teamService, Team } from '../../services/teamService';
import { playerService, Player } from '../../services/playerService';
import { useCSV, CSVPlayer } from '../useCSV';

export interface UITeam extends Team {
    lastSessionDate: string;
    playerCount: number;
    isMyTeam: boolean;
}

export const usePlayersLogic = () => {
    // --- ДАНІ ---
    const [teams, setTeams] = useState<UITeam[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { downloadPlayersTemplate, pickAndParseCSV } = useCSV();

    // --- НАВІГАЦІЯ ---
    const [selectedTeam, setSelectedTeam] = useState<UITeam | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // --- СТАНИ ДЛЯ КОМАНД ---
    const [isAddTeamModalVisible, setAddTeamModalVisible] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [isEditTeamModalVisible, setEditTeamModalVisible] = useState(false);
    const [editingTeamName, setEditingTeamName] = useState('');
    const [isDeleteTeamModalVisible, setDeleteTeamModalVisible] = useState(false);

    // --- СТАНИ ДЛЯ ГРАВЦІВ (СТВОРЕННЯ) ---
    const [isAddPlayerOptionsVisible, setAddPlayerOptionsVisible] = useState(false);
    const [isAddManualVisible, setAddManualVisible] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState('');

    // --- СТАНИ ДЛЯ ГРАВЦІВ (РЕДАГУВАННЯ/ВИДАЛЕННЯ) ---
    const [isEditPlayerModalVisible, setEditPlayerModalVisible] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [editingPlayerName, setEditingPlayerName] = useState('');

    // 🔥 ВИПРАВЛЕННЯ ТУТ: Обов'язково вказуємо <Player | null>
    const [isDeletePlayerModalVisible, setDeletePlayerModalVisible] = useState(false);
    const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
    // --- ІМПОРТ ---
    const [isImportVisibleState, setImportVisibleState] = useState(false);
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [importedPlayers, setImportedPlayers] = useState<CSVPlayer[]>([]);
    const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [importMessage, setImportMessage] = useState('');

    // ===========================
    // ЗАВАНТАЖЕННЯ ДАНИХ
    // ===========================
    const fetchTeams = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await teamService.getMyTeams();
        if (error) Alert.alert("Помилка", "Не вдалося завантажити команди");
        else {
            setTeams((data || []).map((t: any) => ({
                id: t.id, name: t.name, coach_id: t.coach_id,
                playerCount: t.players ? t.players.length : 0, isMyTeam: true, lastSessionDate: 'Немає даних'
            })));
        }
        setIsLoading(false);
    }, []);

    const fetchPlayers = useCallback(async (teamId: string) => {
        setIsLoading(true);
        const { data } = await playerService.getByTeam(teamId);
        setPlayers(data || []);
        setIsLoading(false);
    }, []);

    useEffect(() => { fetchTeams(); }, [fetchTeams]);
    useEffect(() => { if (selectedTeam?.id) fetchPlayers(selectedTeam.id); else setPlayers([]); }, [selectedTeam, fetchPlayers]);

    // ===========================
    // ЛОГІКА КОМАНД
    // ===========================
    const handleCreateTeam = async () => {
        if (!newTeamName.trim()) return;
        setIsLoading(true);
        const { error } = await teamService.create({ name: newTeamName.trim() });
        setIsLoading(false);
        if (error) Alert.alert("Помилка", error.message);
        else { setNewTeamName(''); setAddTeamModalVisible(false); fetchTeams(); }
    };

    const handleDeleteTeam = () => { setDropdownVisible(false); setDeleteTeamModalVisible(true); };

    const handleConfirmDeleteTeam = async () => {
        if (!selectedTeam?.id) return;
        setIsLoading(true);
        const { error } = await teamService.delete(selectedTeam.id);
        setIsLoading(false);
        if (error) Alert.alert("Помилка", "Не вдалося видалити команду");
        else { setDeleteTeamModalVisible(false); setSelectedTeam(null); fetchTeams(); }
    };

    const handleEditTeam = () => {
        if (!selectedTeam) return;
        setEditingTeamName(selectedTeam.name);
        setDropdownVisible(false);
        setEditTeamModalVisible(true);
    };

    const handleUpdateTeam = async () => {
        if (!selectedTeam?.id || !editingTeamName.trim()) return;
        setIsLoading(true);
        const { error } = await teamService.update(selectedTeam.id, { name: editingTeamName.trim() });
        setIsLoading(false);
        if (error) Alert.alert("Помилка", "Не вдалося оновити назву");
        else {
            setSelectedTeam({ ...selectedTeam, name: editingTeamName.trim() });
            fetchTeams();
            setEditTeamModalVisible(false);
        }
    };

    // ===========================
    // ЛОГІКА ГРАВЦІВ
    // ===========================

    // 1. Створення
    const handleAddManualPlayer = async () => {
        if (!newPlayerName.trim() || !selectedTeam?.id) return;
        setIsLoading(true);
        const { error } = await playerService.create({ name: newPlayerName.trim(), team_id: selectedTeam.id });
        setIsLoading(false);
        if (error) Alert.alert("Помилка", error.message);
        else {
            setNewPlayerName('');
            setAddManualVisible(false);
            fetchPlayers(selectedTeam.id);
            fetchTeams();
        }
    };

    // 2. Підготовка до редагування
    const handleEditPlayer = (player: Player) => {
        setEditingPlayer(player);
        setEditingPlayerName(player.name);
        setEditPlayerModalVisible(true);
    };

    // 3. Збереження змін гравця
    const handleUpdatePlayer = async () => {
        if (!editingPlayer || !editingPlayer.id || !editingPlayerName.trim() || !selectedTeam?.id) return;

        setIsLoading(true);
        const { error } = await playerService.update(editingPlayer.id, { name: editingPlayerName.trim() });
        setIsLoading(false);

        if (error) {
            Alert.alert("Помилка", "Не вдалося оновити гравця");
        } else {
            fetchPlayers(selectedTeam.id);
            setEditPlayerModalVisible(false);
            setEditingPlayer(null);
        }
    };

    // 4. Видалення гравця
    const handleDeletePlayer = (player: Player) => {
        if (!player.id) return;
        setPlayerToDelete(player);
        setDeletePlayerModalVisible(true);
    };

    const handleConfirmDeletePlayer = async () => {
        if (!playerToDelete || !playerToDelete.id || !selectedTeam?.id) return;

        setIsLoading(true);
        const { error } = await playerService.delete(playerToDelete.id);
        setIsLoading(false);

        if (error) {
            Alert.alert("Помилка", "Не вдалося видалити гравця");
        } else {
            fetchPlayers(selectedTeam.id);
            fetchTeams();
            setDeletePlayerModalVisible(false);
            setPlayerToDelete(null);
        }
    };

    // ===========================
    // ЛОГІКА ІМПОРТУ
    // ===========================
    const handleSetImportVisible = (visible: boolean) => {
        if (visible) setImportVisibleState(true);
        else { setImportVisibleState(false); setImportedPlayers([]); setImportStatus('idle'); setImportMessage(''); }
    };

    const handleSelectFile = async () => {
        setImportStatus('idle'); setImportMessage('');
        try { const parsedData = await pickAndParseCSV(); if (parsedData) setImportedPlayers(parsedData); }
        catch (e: any) { setImportStatus('error'); setImportMessage(e.message); }
    };

    const handleConfirmImport = async () => {
        if (!selectedTeam?.id || importedPlayers.length === 0) return;
        setIsLoading(true); setImportStatus('idle'); let successCount = 0;
        for (const p of importedPlayers) {
            const response = await playerService.create({ name: p.name, team_id: selectedTeam.id });
            if (!response.error) successCount++;
        }
        setIsLoading(false);
        if (successCount > 0) {
            setImportStatus('success'); setImportMessage(`Додано: ${successCount}`);
            fetchPlayers(selectedTeam.id); fetchTeams();
            setTimeout(() => handleSetImportVisible(false), 1500);
        } else { setImportStatus('error'); setImportMessage("Помилка додавання"); }
    };

    const handleMockImport = () => { handleSetImportVisible(true); };
    const getInitials = (name: string) => name.charAt(0).toUpperCase();
    const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return {
        // Data
        teams, filteredTeams, players, selectedTeam, setSelectedTeam, isLoading,
        // UI
        searchQuery, setSearchQuery, getInitials,
        // Team Modals
        isAddTeamModalVisible, setAddTeamModalVisible, newTeamName, setNewTeamName,
        isEditTeamModalVisible, setEditTeamModalVisible, editingTeamName, setEditingTeamName, handleUpdateTeam,
        isDeleteTeamModalVisible, setDeleteTeamModalVisible, handleConfirmDeleteTeam,

        // Player Modals & Actions
        isAddPlayerOptionsVisible, setAddPlayerOptionsVisible, isAddManualVisible, setAddManualVisible, newPlayerName, setNewPlayerName,

        // EXPORTS FOR PLAYERS
        isEditPlayerModalVisible, setEditPlayerModalVisible, editingPlayerName, setEditingPlayerName,
        isDeletePlayerModalVisible, setDeletePlayerModalVisible, playerToDelete,

        handleAddManualPlayer, handleEditPlayer, handleUpdatePlayer,
        handleDeletePlayer, handleConfirmDeletePlayer,

        // Common
        isDropdownVisible, setDropdownVisible,
        handleCreateTeam, handleDeleteTeam, handleEditTeam, handleMockImport,
        // Import
        isImportVisible: isImportVisibleState, setImportVisible: handleSetImportVisible,
        downloadTemplate: downloadPlayersTemplate, importedPlayers, importStatus, importMessage, handleSelectFile, handleConfirmImport
    };
};