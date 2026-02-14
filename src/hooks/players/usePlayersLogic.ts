import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { teamService, Team } from '../../services/teamService';
import { playerService, Player } from '../../services/playerService';
import { useCSV, CSVPlayer } from '../useCSV';

// Розширюємо тип для UI
export interface UITeam extends Team {
    lastSessionDate: string;
    playerCount: number;  // 👈 Кількість гравців
    isMyTeam: boolean;    // 👈 Чи я власник?
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

    // --- МОДАЛКИ & INPUTS ---
    const [isAddTeamModalVisible, setAddTeamModalVisible] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');

    const [isAddPlayerOptionsVisible, setAddPlayerOptionsVisible] = useState(false);
    const [isAddManualVisible, setAddManualVisible] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState('');

    const [isImportVisibleState, setImportVisibleState] = useState(false);
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    // --- ІМПОРТ ---
    const [importedPlayers, setImportedPlayers] = useState<CSVPlayer[]>([]);
    const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [importMessage, setImportMessage] = useState('');

    // ===========================
    // 1. ЗАВАНТАЖЕННЯ ДАНИХ (ВИПРАВЛЕНО)
    // ===========================

    const fetchTeams = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await teamService.getMyTeams(); // Повертає команди з масивом гравців

        if (error) {
            Alert.alert("Помилка", "Не вдалося завантажити команди");
        } else {
            // 🔥 Мапимо дані: рахуємо гравців та ставимо прапорець власника
            const formattedTeams: UITeam[] = (data || []).map((t: any) => ({
                id: t.id,
                name: t.name,
                coach_id: t.coach_id,

                // Якщо players приходить як масив (завдяки join у сервісі), беремо його довжину
                playerCount: t.players ? t.players.length : 0,

                // Оскільки ми використовуємо getMyTeams (фільтр по coach_id = user.id), це завжди true.
                // Але якщо будемо вантажити чужі команди, тут треба буде порівнювати з auth.user.id
                isMyTeam: true,

                lastSessionDate: 'Немає даних' // Заглушка
            }));

            setTeams(formattedTeams);
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
    useEffect(() => {
        if (selectedTeam?.id) fetchPlayers(selectedTeam.id);
        else setPlayers([]);
    }, [selectedTeam, fetchPlayers]);

    // ===========================
    // 2. ЛОГІКА КОМАНД
    // ===========================

    const handleCreateTeam = async () => {
        if (!newTeamName.trim()) return;
        setIsLoading(true);
        const { error } = await teamService.create({ name: newTeamName.trim() });
        setIsLoading(false);
        if (error) {
            Alert.alert("Помилка", error.message);
        } else {
            setNewTeamName('');
            setAddTeamModalVisible(false);
            fetchTeams();
        }
    };

    const handleDeleteTeam = () => {
        setDropdownVisible(false);
        Alert.alert("Видалення", `Видалити команду "${selectedTeam?.name}"?`, [
            { text: "Скасувати", style: "cancel" },
            { text: "Видалити", style: "destructive", onPress: async () => {
                    if (selectedTeam?.id) {
                        setIsLoading(true);
                        await teamService.delete(selectedTeam.id);
                        setIsLoading(false);
                        setSelectedTeam(null);
                        fetchTeams();
                    }
                }}
        ]);
    };

    const handleEditTeam = () => {
        setDropdownVisible(false);
        Alert.alert("Інфо", "Скоро буде");
    };

    // ===========================
    // 3. ЛОГІКА ГРАВЦІВ
    // ===========================

    const handleAddManualPlayer = async () => {
        if (!newPlayerName.trim() || !selectedTeam?.id) return;
        setIsLoading(true);
        const { error } = await playerService.create({ name: newPlayerName.trim(), team_id: selectedTeam.id });
        setIsLoading(false);
        if (error) {
            Alert.alert("Помилка", error.message);
        } else {
            setNewPlayerName('');
            setAddManualVisible(false);
            fetchPlayers(selectedTeam.id);
            fetchTeams(); // Оновлюємо лічильник гравців у списку команд
        }
    };

    // ===========================
    // 4. ЛОГІКА ІМПОРТУ
    // ===========================

    const handleSetImportVisible = (visible: boolean) => {
        if (visible) {
            setImportVisibleState(true);
        } else {
            setImportVisibleState(false);
            setImportedPlayers([]);
            setImportStatus('idle');
            setImportMessage('');
        }
    };

    const handleSelectFile = async () => {
        setImportStatus('idle');
        setImportMessage('');
        try {
            const parsedData = await pickAndParseCSV();
            if (parsedData) setImportedPlayers(parsedData);
        } catch (e: any) {
            setImportStatus('error');
            setImportMessage(e.message);
        }
    };

    const handleConfirmImport = async () => {
        if (!selectedTeam?.id || importedPlayers.length === 0) return;

        setIsLoading(true);
        setImportStatus('idle');
        let successCount = 0;

        for (const p of importedPlayers) {
            const response = await playerService.create({ name: p.name, team_id: selectedTeam.id });
            if (!response.error) successCount++;
        }

        setIsLoading(false);

        if (successCount > 0) {
            setImportStatus('success');
            setImportMessage(`Додано: ${successCount}`);
            fetchPlayers(selectedTeam.id);
            fetchTeams(); // Оновлюємо лічильник після масового імпорту
            setTimeout(() => handleSetImportVisible(false), 1500);
        } else {
            setImportStatus('error');
            setImportMessage("Помилка додавання");
        }
    };

    const handleMockImport = () => {
        handleSetImportVisible(true);
    };

    const getInitials = (name: string) => name.charAt(0).toUpperCase();

    const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return {
        teams, filteredTeams, players, selectedTeam, setSelectedTeam, isLoading,
        searchQuery, setSearchQuery, getInitials,
        isAddTeamModalVisible, setAddTeamModalVisible, newTeamName, setNewTeamName,
        isAddPlayerOptionsVisible, setAddPlayerOptionsVisible,
        isAddManualVisible, setAddManualVisible, newPlayerName, setNewPlayerName,
        isDropdownVisible, setDropdownVisible,
        handleCreateTeam, handleDeleteTeam, handleEditTeam, handleAddManualPlayer, handleMockImport,
        isImportVisible: isImportVisibleState, setImportVisible: handleSetImportVisible,
        downloadTemplate: downloadPlayersTemplate,
        importedPlayers, importStatus, importMessage, handleSelectFile, handleConfirmImport
    };
};