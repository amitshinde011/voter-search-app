import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/theme/colors';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { pickCSVFile, importCSVFile, previewCSVFile } from '../../src/database/csvParser';
import { getVoterCount, clearAllVoters } from '../../src/database/database';

export default function ImportScreen() {
  const { t } = useLanguage();

  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string } | null>(null);
  const [preview, setPreview] = useState<{
    headers: string[];
    rows: Record<string, string>[];
    totalRows: number;
  } | null>(null);

  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    errors: string[];
  } | null>(null);

  const [replaceMode, setReplaceMode] = useState(true);
  const [currentCount, setCurrentCount] = useState(0);

  useEffect(() => {
    loadCurrentCount();
  }, []);

  const loadCurrentCount = async () => {
    const count = await getVoterCount();
    setCurrentCount(count);
  };

  const handlePickFile = async () => {
    const file = await pickCSVFile();
    if (file) {
      setSelectedFile(file);
      setImportResult(null);

      // Load preview
      const previewData = await previewCSVFile(file.uri, 3);
      setPreview(previewData);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setImportProgress({ current: 0, total: 0 });
    setImportResult(null);

    try {
      const result = await importCSVFile(
        selectedFile.uri,
        replaceMode,
        (current, total) => setImportProgress({ current, total })
      );

      setImportResult({
        success: result.success,
        imported: result.importedRows,
        errors: result.errors,
      });

      if (result.success) {
        Alert.alert(
          t.success,
          `${t.importSuccess}\n${t.importedRows}: ${result.importedRows}`
        );
      } else {
        Alert.alert(t.error, `${t.importError}\n${result.errors.join('\n')}`);
      }

      await loadCurrentCount();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(t.error, msg);
    } finally {
      setImporting(false);
    }
  };

  const handleClearDatabase = () => {
    Alert.alert(t.clearDatabase, t.clearDatabaseConfirm, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.confirm,
        style: 'destructive',
        onPress: async () => {
          await clearAllVoters();
          await loadCurrentCount();
          setImportResult(null);
          Alert.alert(t.success, t.clearDatabaseSuccess);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.importTitle}</Text>
        <Text style={styles.headerSubtitle}>{t.importDescription}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* Current database info */}
        <View style={styles.infoCard}>
          <Ionicons name="server-outline" size={24} color={Colors.primary} />
          <View style={styles.infoCardContent}>
            <Text style={styles.infoCardTitle}>{t.databaseInfo}</Text>
            <Text style={styles.infoCardValue}>
              {t.totalRecords}: {currentCount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Import Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.importMode}</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeButton, replaceMode && styles.modeButtonActive]}
              onPress={() => setReplaceMode(true)}
            >
              <Ionicons
                name="swap-horizontal"
                size={18}
                color={replaceMode ? Colors.textOnPrimary : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  replaceMode && styles.modeButtonTextActive,
                ]}
              >
                {t.replaceData}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, !replaceMode && styles.modeButtonActive]}
              onPress={() => setReplaceMode(false)}
            >
              <Ionicons
                name="add-circle-outline"
                size={18}
                color={!replaceMode ? Colors.textOnPrimary : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  !replaceMode && styles.modeButtonTextActive,
                ]}
              >
                {t.appendData}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* File Picker */}
        <TouchableOpacity
          style={styles.pickButton}
          onPress={handlePickFile}
          disabled={importing}
          activeOpacity={0.7}
        >
          <View style={styles.pickButtonIcon}>
            <Ionicons name="document-outline" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.pickButtonTitle}>{t.selectFile}</Text>
          <Text style={styles.pickButtonHint}>CSV, XLS</Text>
        </TouchableOpacity>

        {/* Selected file info */}
        {selectedFile && (
          <View style={styles.fileCard}>
            <Ionicons name="document-text" size={24} color={Colors.success} />
            <View style={styles.fileCardContent}>
              <Text style={styles.fileCardTitle}>{t.fileSelected}</Text>
              <Text style={styles.fileCardName} numberOfLines={2}>
                {selectedFile.name}
              </Text>
              {preview && (
                <Text style={styles.fileCardRows}>
                  {t.totalRecords}: {preview.totalRows.toLocaleString()}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => {
                setSelectedFile(null);
                setPreview(null);
              }}
            >
              <Ionicons name="close-circle" size={24} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
        )}

        {/* Preview */}
        {preview && preview.rows.length > 0 && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Preview (first {preview.rows.length} rows)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                {/* Header row */}
                <View style={styles.previewRow}>
                  {preview.headers.slice(0, 6).map((h, i) => (
                    <Text key={i} style={styles.previewHeader}>
                      {h}
                    </Text>
                  ))}
                </View>
                {/* Data rows */}
                {preview.rows.map((row, ri) => (
                  <View key={ri} style={[styles.previewRow, ri % 2 === 0 && styles.previewRowAlt]}>
                    {preview.headers.slice(0, 6).map((h, ci) => (
                      <Text key={ci} style={styles.previewCell} numberOfLines={1}>
                        {row[h] || '-'}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Import Button */}
        {selectedFile && !importing && (
          <TouchableOpacity
            style={styles.importButton}
            onPress={handleImport}
            activeOpacity={0.8}
          >
            <Ionicons name="cloud-upload" size={22} color={Colors.textOnPrimary} />
            <Text style={styles.importButtonText}>
              {replaceMode ? t.replaceData : t.appendData}
            </Text>
          </TouchableOpacity>
        )}

        {/* Import Progress */}
        {importing && (
          <View style={styles.progressCard}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.progressText}>{t.importing}</Text>
            {importProgress.total > 0 && (
              <Text style={styles.progressCount}>
                {importProgress.current.toLocaleString()} / {importProgress.total.toLocaleString()}
              </Text>
            )}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: importProgress.total > 0
                      ? `${Math.round((importProgress.current / importProgress.total) * 100)}%`
                      : '0%',
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Import Result */}
        {importResult && (
          <View
            style={[
              styles.resultCard,
              importResult.success ? styles.resultSuccess : styles.resultError,
            ]}
          >
            <Ionicons
              name={importResult.success ? 'checkmark-circle' : 'alert-circle'}
              size={24}
              color={importResult.success ? Colors.success : Colors.error}
            />
            <View style={styles.resultContent}>
              <Text style={styles.resultTitle}>
                {importResult.success ? t.importSuccess : t.importError}
              </Text>
              <Text style={styles.resultDetail}>
                {t.importedRows}: {importResult.imported.toLocaleString()}
              </Text>
              {importResult.errors.length > 0 && (
                <Text style={styles.resultErrors} numberOfLines={3}>
                  {importResult.errors.slice(0, 3).join('\n')}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Clear Database */}
        {currentCount > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearDatabase}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
            <Text style={styles.clearButtonText}>{t.clearDatabase}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 48,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textOnPrimary + 'AA',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoCardValue: {
    fontSize: FontSize.lg,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modeButtonText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: Colors.textOnPrimary,
  },
  pickButton: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    borderWidth: 2,
    borderColor: Colors.primary + '40',
    borderStyle: 'dashed',
    marginBottom: Spacing.lg,
  },
  pickButtonIcon: {
    backgroundColor: Colors.chipBackground,
    borderRadius: BorderRadius.round,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  pickButtonTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.primary,
  },
  pickButtonHint: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    marginTop: 4,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  fileCardContent: {
    flex: 1,
  },
  fileCardTitle: {
    fontSize: FontSize.xs,
    color: Colors.success,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  fileCardName: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
    marginTop: 2,
  },
  fileCardRows: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  previewTitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
  },
  previewRowAlt: {
    backgroundColor: Colors.background,
  },
  previewHeader: {
    width: 100,
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
    padding: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  previewCell: {
    width: 100,
    fontSize: FontSize.xs,
    color: Colors.text,
    padding: Spacing.xs,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    elevation: 2,
  },
  importButtonText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  progressCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.xxl,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  progressText: {
    fontSize: FontSize.lg,
    color: Colors.primary,
    fontWeight: '600',
  },
  progressCount: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.chipBackground,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  resultSuccess: {
    backgroundColor: Colors.successLight,
  },
  resultError: {
    backgroundColor: Colors.errorLight,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  resultDetail: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  resultErrors: {
    fontSize: FontSize.sm,
    color: Colors.error,
    marginTop: Spacing.sm,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  clearButtonText: {
    color: Colors.error,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
