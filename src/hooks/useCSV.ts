import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert, Platform } from 'react-native';


const fs: any = FileSystem;

// Визначаємо базову директорію через наш "хакнутий" об'єкт
const baseDir = fs.documentDirectory || fs.cacheDirectory;

export interface CSVPlayer {
    name: string;
}

export const useCSV = () => {

    const saveFileOnWeb = (content: string, fileName: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // --- 1. EXPORT (Optimized English version) ---
    const exportResultsToCSV = async (results: any[], teamName: string) => {
        try {
            if (!results || results.length === 0) {
                Alert.alert("Info", "No data to export");
                return;
            }

            // Header: Team,Player,Date,Type,Time,Splits
            let csvContent = "Team,Player,Date,Type,Time,Splits\n";

            results.forEach((res) => {
                const time = res.time.toFixed(2);
                const splits = res.splits ? `"${res.splits.join(',')}"` : '""';
                const date = res.date || '-';
                const type = res.testType || 'Sprint';

                csvContent += `${teamName},${res.playerName},${date},${type},${time},${splits}\n`;
            });

            const fileName = `rep_${teamName.replace(/\s+/g, '_')}_${Date.now()}.csv`;

            if (Platform.OS === 'web') {
                saveFileOnWeb(csvContent, fileName);
                return;
            }

            const fileUri = baseDir.endsWith('/') ? `${baseDir}${fileName}` : `${baseDir}/${fileName}`;
            // Використовуємо функції через fs (any)
            await fs.writeAsStringAsync(fileUri, csvContent, {
                encoding: fs.EncodingType?.UTF8 || 'utf8'
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'text/csv',
                    UTI: 'public.comma-separated-values-text'
                });
            }
        } catch (error) {
            console.error("CSV Export Error:", error);
            Alert.alert("Error", "Export failed");
        }
    };

    // --- 2. TEMPLATE ---
    const downloadPlayersTemplate = async () => {
        try {
            const csvContent = "Full Name\nAndriy Shevchenko\nIlya Zabarnyi";
            const fileName = 'template.csv';

            if (Platform.OS === 'web') {
                saveFileOnWeb(csvContent, fileName);
                return;
            }

            const fileUri = `${baseDir}${fileName}`;
            await fs.writeAsStringAsync(fileUri, csvContent, {
                encoding: fs.EncodingType?.UTF8 || 'utf8'
            });
            await Sharing.shareAsync(fileUri);
        } catch (e) {
            Alert.alert("Error", "Failed to create template");
        }
    };

    // --- 3. PARSE ---
    const pickAndParseCSV = async (): Promise<CSVPlayer[] | null> => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'text/plain'],
                copyToCacheDirectory: true
            });

            if (result.canceled) return null;

            const fileUri = result.assets[0].uri;
            let content = '';

            if (Platform.OS === 'web') {
                const response = await fetch(fileUri);
                content = await response.text();
            } else {
                content = await fs.readAsStringAsync(fileUri, {
                    encoding: fs.EncodingType?.UTF8 || 'utf8'
                });
            }

            const rows = content.split('\n');
            const parsed: CSVPlayer[] = [];

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i].trim();
                if (!row) continue;
                let name = row.split(',')[0].trim();
                if (name.length > 1) parsed.push({ name });
            }

            return parsed;
        } catch (e) {
            console.error(e);
            throw new Error("Read error");
        }
    };

    return { exportResultsToCSV, downloadPlayersTemplate, pickAndParseCSV };
};