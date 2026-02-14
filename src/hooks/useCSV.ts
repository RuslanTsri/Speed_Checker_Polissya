import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert, Platform } from 'react-native';

// Хак для TypeScript, щоб не сварився на legacy
const fs = FileSystem as any;
const baseDir = fs.documentDirectory || fs.cacheDirectory;

export interface CSVPlayer {
    name: string;
}

export const useCSV = () => {

    // === ДОПОМІЖНА ФУНКЦІЯ ДЛЯ WEB ===
    const saveFileOnWeb = (content: string, fileName: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;

        // Емулюємо клік для скачування
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // --- 1. ЕКСПОРТ СЕСІЇ ---
    const exportSessionToCSV = async (session: any) => {
        try {
            let csvContent = "\uFEFFКоманда;Гравець;Номер;Кращий час (с);Макс швидкість (км/год);Раунд;Час раунду (с)\n";

            session.results.forEach((player: any) => {
                player.attempts.forEach((attempt: any) => {
                    const bestTimeStr = player.bestTime.toFixed(2).replace('.', ',');
                    const maxSpeedStr = player.maxSpeed.toFixed(1).replace('.', ',');
                    const attemptTimeStr = attempt.time.toFixed(2).replace('.', ',');

                    csvContent += `${session.teamName};${player.playerName};${player.number};${bestTimeStr};${maxSpeedStr};${attempt.round};${attemptTimeStr}\n`;
                });
            });

            const fileName = `results_${session.teamName.replace(/\s+/g, '_')}_${Date.now()}.csv`;

            // 🔥 WEB LOGIC
            if (Platform.OS === 'web') {
                saveFileOnWeb(csvContent, fileName);
                return;
            }

            // 🔥 MOBILE LOGIC
            const fileUri = `${baseDir}${fileName}`;
            await FileSystem.writeAsStringAsync(fileUri, csvContent, {
                encoding: FileSystem.EncodingType.UTF8
            });

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

    // --- 2. ЗАВАНТАЖЕННЯ ШАБЛОНУ ---
    const downloadPlayersTemplate = async () => {
        try {
            const header = "Прізвище та Ім'я";
            const example1 = "Шевченко Андрій";
            const example2 = "Забарний Ілля";
            const example3 = "Мудрик Михайло";

            const csvContent = `\uFEFF${header}\n${example1}\n${example2}\n${example3}`;
            const fileName = 'tempo_players_simple.csv';

            // 🔥 WEB LOGIC
            if (Platform.OS === 'web') {
                saveFileOnWeb(csvContent, fileName);
                return;
            }

            // 🔥 MOBILE LOGIC
            const fileUri = `${baseDir}${fileName}`;
            await FileSystem.writeAsStringAsync(fileUri, csvContent, {
                encoding: FileSystem.EncodingType.UTF8
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'text/csv',
                    dialogTitle: 'Шаблон списку гравців',
                    UTI: 'public.comma-separated-values-text'
                });
            } else {
                Alert.alert("Увага", "Функція 'Поділитися' недоступна");
            }
        } catch (e: any) {
            console.error("Template Error:", e);
            Alert.alert("Помилка", "Не вдалося створити шаблон");
        }
    };

    // --- 3. ПАРСИНГ ФАЙЛУ ---
    const pickAndParseCSV = async (): Promise<CSVPlayer[] | null> => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel', 'text/plain'],
                copyToCacheDirectory: true
            });

            if (result.canceled) return null;

            const fileUri = result.assets[0].uri;
            let content = '';

            // 🔥 WEB LOGIC: Читаємо через fetch, бо FileSystem немає
            if (Platform.OS === 'web') {
                const response = await fetch(fileUri);
                content = await response.text();
            } else {
                // 🔥 MOBILE LOGIC
                content = await FileSystem.readAsStringAsync(fileUri, {
                    encoding: FileSystem.EncodingType.UTF8
                });
            }

            const rows = content.split('\n');
            const parsedPlayers: CSVPlayer[] = [];

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i].trim();
                if (!row) continue;

                let name = row.split(';')[0];
                if (name.includes(',')) name = name.split(',')[0];

                name = name.trim();

                if (name.length > 1) {
                    parsedPlayers.push({ name });
                }
            }

            if (parsedPlayers.length === 0) throw new Error("Файл пустий");

            return parsedPlayers;

        } catch (e: any) {
            console.error("CSV Parse Error:", e);
            throw new Error("Не вдалося прочитати файл");
        }
    };

    const importFromCSV = async () => {
        Alert.alert("Інфо", "Використовуйте кнопку у модалці");
    };

    return {
        exportSessionToCSV,
        downloadPlayersTemplate,
        pickAndParseCSV,
        importFromCSV
    };
};