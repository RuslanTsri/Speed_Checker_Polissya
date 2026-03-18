import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';

const fs = FileSystem as any;
const baseDir = fs.documentDirectory || fs.cacheDirectory;

export interface CSVPlayer {
    name: string;
}

export interface ParseResult {
    players: CSVPlayer[];
    fileName: string;
}

const FIRST_NAME_KEYS = ['імʼя', "ім'я", 'імя', 'first name', 'firstname', 'first_name', 'name', 'имя'];
const LAST_NAME_KEYS = ['прізвище', 'last name', 'lastname', 'last_name', 'surname', 'фамилия'];
const FULL_NAME_KEYS = ['full name', 'fullname', 'full_name', 'pib', 'піб', 'фио', "повне ім'я", 'гравець', 'player', 'спортсмен', 'name'];

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

    const exportResultsToExcel = async (results: any[], teamName: string) => {
        try {
            if (!results || results.length === 0) {
                Alert.alert(t('screens.common.info'), t('logs.warns.csv.no_data'));
                return;
            }

            const sheetData: any[][] = [];

            const headersStr = String(t('screens.csv.export_headers'));
            const headers = headersStr.split(',').map(h => h.replace(/^"|"$/g, '').trim());
            sheetData.push(headers);

            results.forEach((res) => {
                const distanceVal = res.distance ? res.distance.toString() : '-';
                const timeVal = Number(res.time.toFixed(3)); // Excel любить чисті числа
                const splitsVal = res.splits && res.splits.length > 0 ? res.splits.join(', ') : '';
                const dateVal = res.date || '-';
                const typeVal = res.testType || 'Sprint';

                sheetData.push([
                    teamName,
                    res.playerName,
                    dateVal,
                    typeVal,
                    distanceVal,
                    timeVal,
                    splitsVal
                ]);
            });

            const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
            const workbook = XLSX.utils.book_new();

            worksheet['!cols'] = [
                { wch: 20 },
                { wch: 25 },
                { wch: 15 },
                { wch: 15 },
                { wch: 12 },
                { wch: 10 },
                { wch: 30 }
            ];

            XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

            const fileName = `Results_${teamName.replace(/\s+/g, '_')}_${Date.now()}.xlsx`;

            if (Platform.OS === 'web') {
                XLSX.writeFile(workbook, fileName);
                return;
            }

            const b64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
            const fileUri = baseDir.endsWith('/') ? `${baseDir}${fileName}` : `${baseDir}/${fileName}`;

            await fs.writeAsStringAsync(fileUri, b64, {
                encoding: fs.EncodingType?.Base64 || 'base64'
            });

            if (await Sharing.isAvailableAsync()) {
                try {
                    await Sharing.shareAsync(fileUri, {
                        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        dialogTitle: `${t('screens.csv.export_dialog')}: ${teamName}`,
                        UTI: 'org.openxmlformats.spreadsheetml.sheet'
                    });
                } catch (shareError) {
                    console.log("Share dismissed by user:", shareError);
                }
            } else {
                Alert.alert(t('screens.common.error'), t('logs.errors.csv.sharing_unavailable'));
            }
        } catch (error) {
            console.error("Export Error:", error);
            Alert.alert(t('screens.common.error'), "Не вдалося згенерувати файл таблиці");
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

    const pickAndParseCSV = async (): Promise<ParseResult | null> => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'text/csv',
                    'text/comma-separated-values',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/plain'
                ],
                copyToCacheDirectory: true
            });

            if (result.canceled) return null;

            const fileUri = result.assets[0].uri;
            const originalFileName = result.assets[0].name;
            const lowerFileName = originalFileName.toLowerCase();
            const nameWithoutExt = originalFileName.replace(/\.[^/.]+$/, "");

            let content = '';

            if (lowerFileName.endsWith('.xlsx') || lowerFileName.endsWith('.xls')) {
                const b64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
                const workbook = XLSX.read(b64, { type: 'base64' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                content = XLSX.utils.sheet_to_csv(worksheet);
            } else {
                if (Platform.OS === 'web') {
                    const response = await fetch(fileUri);
                    content = await response.text();
                } else {
                    content = await FileSystem.readAsStringAsync(fileUri, {
                        encoding: FileSystem.EncodingType.UTF8
                    });
                }
            }

            if (content.charCodeAt(0) === 0xFEFF) {
                content = content.slice(1);
            }

            const rows = content.split(/\r?\n/);
            if (rows.length === 0) throw new Error(t('logs.errors.csv.file_empty') as string);

            const sampleText = rows.slice(0, 5).join('');
            const commaCount = (sampleText.match(/,/g) || []).length;
            const semicolonCount = (sampleText.match(/;/g) || []).length;
            const delimiter = semicolonCount > commaCount ? ';' : ',';

            const splitRow = (row: string) =>
                row.split(delimiter).map(c => c.trim().replace(/^"|"$/g, '').trim());

            const parsedPlayers: CSVPlayer[] = [];
            let headerIdx = -1;
            let pIdx = -1, iIdx = -1, fIdx = -1;

            for (let i = 0; i < Math.min(rows.length, 10); i++) {
                const cols = splitRow(rows[i].toLowerCase());

                pIdx = cols.findIndex(c => LAST_NAME_KEYS.some(key => c.includes(key)));
                iIdx = cols.findIndex(c => FIRST_NAME_KEYS.some(key => c.includes(key)));
                fIdx = cols.findIndex(c => FULL_NAME_KEYS.some(key => c.includes(key)));

                if (fIdx !== -1 || (pIdx !== -1 && iIdx !== -1) || pIdx !== -1 || iIdx !== -1) {
                    headerIdx = i;
                    break;
                }
            }

            const startIdx = headerIdx !== -1 ? headerIdx + 1 : 0;

            for (let i = startIdx; i < rows.length; i++) {
                const rowContent = rows[i].trim();
                if (!rowContent) continue;

                const cols = splitRow(rowContent);
                let name = "";

                if (pIdx !== -1 && iIdx !== -1) {
                    name = `${cols[pIdx] || ""} ${cols[iIdx] || ""}`.trim();
                } else if (fIdx !== -1) {
                    name = cols[fIdx] || "";
                } else if (pIdx !== -1) {
                    name = cols[pIdx] || "";
                } else if (iIdx !== -1) {
                    name = cols[iIdx] || "";
                } else {
                    name = cols.find(c => c.length > 0) || "";
                }

                if (name && name.length > 1 && name.toLowerCase() !== 'nan nan' && name.toLowerCase() !== 'nan') {
                    parsedPlayers.push({ name });
                }
            }

            if (parsedPlayers.length === 0) throw new Error(t('logs.errors.csv.file_empty') as string);

            return { players: parsedPlayers, fileName: nameWithoutExt };

        } catch (e: any) {
            console.error("CSV Parse Error:", e);
            if (e.message === t('logs.errors.csv.file_empty')) throw e;
            throw new Error(t('logs.errors.csv.parse_failed') as string);
        }
    };

    const importFromCSV = async () => {
        Alert.alert(t('screens.common.info'), t('screens.csv.use_modal_btn'));
    };

    return {
        exportResultsToExcel,
        downloadPlayersTemplate,
        pickAndParseCSV,
        importFromCSV
    };
};