import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

const fs = FileSystem as any;
const baseDir = fs.documentDirectory || fs.cacheDirectory;

export interface CSVPlayer {
    name: string;
}

export const useCSV = () => {
    const { t } = useTranslation();

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

    const exportResultsToCSV = async (results: any[], teamName: string) => {
        try {
            if (!results || results.length === 0) {
                Alert.alert(
                    t('screens.common.info'),
                    t('logs.warns.csv.no_data')
                );
                return;
            }

            let csvContent = `${t('screens.csv.export_headers')}\n`;

            results.forEach((res) => {
                const timeStr = `="${res.time.toFixed(2)}"`;
                const distanceStr = res.distance ? `="${res.distance.toString()}"` : '"-"';
                const splitsStr = res.splits && res.splits.length > 0 ? `="${res.splits.join(', ')}"` : '""';
                const dateStr = `"${res.date || '-'}"`;
                const typeStr = `"${res.testType || 'Sprint'}"`;

                csvContent += `"${teamName}","${res.playerName}",${dateStr},${typeStr},${distanceStr},${timeStr},${splitsStr}\n`;
            });

            const fileName = `Results_${teamName.replace(/\s+/g, '_')}_${Date.now()}.csv`;

            if (Platform.OS === 'web') {
                saveFileOnWeb(csvContent, fileName);
                return;
            }

            const fileUri = baseDir.endsWith('/') ? `${baseDir}${fileName}` : `${baseDir}/${fileName}`;

            await fs.writeAsStringAsync(fileUri, csvContent, {
                encoding: fs.EncodingType?.UTF8 || 'utf8'
            });

            if (await Sharing.isAvailableAsync()) {
                try {
                    await Sharing.shareAsync(fileUri, {
                        mimeType: 'text/csv',
                        dialogTitle: `${t('screens.csv.export_dialog')}: ${teamName}`,
                        UTI: 'public.comma-separated-values-text'
                    });
                } catch (shareError) {
                    console.log("Share dismissed by user:", shareError);
                }
            } else {
                Alert.alert(t('screens.common.error'), t('logs.errors.csv.sharing_unavailable'));
            }
        } catch (error) {
            console.error("Export Error:", error);
            Alert.alert(t('screens.common.error'), "Не вдалося згенерувати файл");
        }
    };
    const downloadPlayersTemplate = async () => {
        try {
            const header = t('screens.csv.template_header');
            const example1 = t('screens.csv.template_ex1');
            const example2 = t('screens.csv.template_ex2');
            const example3 = t('screens.csv.template_ex3');

            const csvContent = `\uFEFF${header}\n${example1}\n${example2}\n${example3}`;
            const fileName = 'tempo_players_simple.csv';

            if (Platform.OS === 'web') {
                saveFileOnWeb(csvContent, fileName);
                return;
            }

            const fileUri = `${baseDir}${fileName}`;
            await FileSystem.writeAsStringAsync(fileUri, csvContent, {
                encoding: FileSystem.EncodingType.UTF8
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'text/csv',
                    dialogTitle: t('screens.csv.template_dialog'),
                    UTI: 'public.comma-separated-values-text'
                });
            } else {
                Alert.alert(t('screens.common.warning'), t('logs.errors.csv.sharing_unavailable'));
            }
        } catch (e: any) {
            console.error("Template Error:", e);
            Alert.alert(t('screens.common.error'), t('logs.errors.csv.template_failed'));
        }
    };

    const pickAndParseCSV = async (): Promise<CSVPlayer[] | null> => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel', 'text/plain'],
                copyToCacheDirectory: true
            });

            if (result.canceled) return null;

            const fileUri = result.assets[0].uri;
            let content = '';

            if (Platform.OS === 'web') {
                const response = await fetch(fileUri);
                content = await response.text();
            } else {
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

            if (parsedPlayers.length === 0) throw new Error(t('logs.errors.csv.file_empty') as string);

            return parsedPlayers;

        } catch (e: any) {
            console.error("CSV Parse Error:", e);
            if (e.message === t('logs.errors.csv.file_empty')) {
                throw e;
            }
            throw new Error(t('logs.errors.csv.parse_failed') as string);
        }
    };

    const importFromCSV = async () => {
        Alert.alert(t('screens.common.info'), t('screens.csv.use_modal_btn'));
    };

    return {
        exportResultsToCSV,
        downloadPlayersTemplate,
        pickAndParseCSV,
        importFromCSV
    };
};