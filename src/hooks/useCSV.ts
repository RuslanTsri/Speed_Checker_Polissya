import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { TeamSession } from './sessions/useSessionsData'; 

export const useCSV = () => {

    // --- ЕКСПОРТ СЕСІЇ ---
    const exportSessionToCSV = async (session: TeamSession) => {
        try {
            // Header
            let csvContent = "\uFEFFКоманда;Гравець;Номер;Кращий час (с);Макс швидкість (км/год);Раунд;Час раунду (с)\n";

            // Body
            session.results.forEach(player => {
                player.attempts.forEach(attempt => {
                    const bestTimeStr = player.bestTime.toFixed(2).replace('.', ',');
                    const maxSpeedStr = player.maxSpeed.toFixed(1).replace('.', ',');
                    const attemptTimeStr = attempt.time.toFixed(2).replace('.', ',');

                    csvContent += `${session.teamName};${player.playerName};${player.number};${bestTimeStr};${maxSpeedStr};${attempt.round};${attemptTimeStr}\n`;
                });
            });

            // File creation
            const fileName = `results_${session.teamName.replace(/\s+/g, '_')}_${Date.now()}.csv`;
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.writeAsStringAsync(fileUri, csvContent, {
                encoding: FileSystem.EncodingType.UTF8
            });

            // Sharing
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'text/csv',
                    dialogTitle: `Експорт: ${session.teamName}`,
                    UTI: 'public.comma-separated-values-text'
                });
            } else {
                Alert.alert("Помилка", "Експорт не підтримується на цьому пристрої");
            }
        } catch (error) {
            console.error("Export CSV Error:", error);
            Alert.alert("Помилка", "Не вдалося згенерувати файл");
        }
    };

    // --- ЗАВАНТАЖЕННЯ ШАБЛОНУ (Заглушка) ---
    const downloadTemplate = async () => {
        try {
            const csvContent = "\uFEFFПрізвище Ім'я;Номер;Рік народження;Позиція\nПриклад Іван;10;2008;Нападник\n";
            const fileUri = `${FileSystem.documentDirectory}player_import_template.csv`;

            await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            }
        } catch (e) {
            Alert.alert("Помилка", "Не вдалося створити шаблон");
        }
    };

    // --- ІМПОРТ (Заглушка) ---
    const importFromCSV = async () => {
        Alert.alert("Імпорт", "Функціонал вибору файлу та парсингу CSV буде тут.");
        // Тут буде логіка з DocumentPicker
    };

    return {
        exportSessionToCSV,
        downloadTemplate,
        importFromCSV
    };
};