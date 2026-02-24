import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/theme/colors';
import { useLanguage } from '../../src/i18n/LanguageContext';
import {
  isBluetoothPrintAvailable,
  enableBluetooth,
  scanBluetoothDevices,
  connectBluetoothPrinter,
  setPrintMethod,
  getPrintMethod,
  getConnectedPrinter,
  setConnectedPrinter,
  type PrintMethod,
} from '../../src/services/printService';
import type { BluetoothDevice } from '../../src/types/voter';
import { getVoterCount } from '../../src/database/database';

export default function SettingsScreen() {
  const { t, language, setLanguage } = useLanguage();

  // Print settings
  const [printMethod, setPrintMethodState] = useState<PrintMethod>(getPrintMethod());
  const [btAvailable] = useState(isBluetoothPrintAvailable());
  const [connectedPrinter, setConnectedPrinterState] = useState(getConnectedPrinter());
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showDevices, setShowDevices] = useState(false);

  // Database info
  const [voterCount, setVoterCount] = useState(0);

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    const count = await getVoterCount();
    setVoterCount(count);
  };

  const handleScanPrinters = async () => {
    try {
      setScanning(true);
      setShowDevices(true);
      setDevices([]);

      // Enable Bluetooth and get paired devices
      const paired = await enableBluetooth();
      setDevices(paired);

      // Scan for nearby devices
      try {
        const scanned = await scanBluetoothDevices();
        // Merge with paired, avoiding duplicates
        const addresses = new Set(paired.map((d) => d.address));
        const newDevices = scanned.filter((d) => !addresses.has(d.address));
        setDevices((prev) => [...prev, ...newDevices]);
      } catch (scanErr) {
        // Scan might fail, but paired devices are still available
        console.log('Scan complete or failed:', scanErr);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(t.error, msg);
    } finally {
      setScanning(false);
    }
  };

  const handleConnectDevice = async (device: BluetoothDevice) => {
    try {
      setConnecting(true);
      await connectBluetoothPrinter(device.address);
      setConnectedPrinter(device.name, device.address);
      setConnectedPrinterState({ name: device.name, address: device.address });
      setPrintMethod('bluetooth');
      setPrintMethodState('bluetooth');
      Alert.alert(t.success, `${t.connected}: ${device.name}`);
      setShowDevices(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(t.error, msg);
    } finally {
      setConnecting(false);
    }
  };

  const handlePrintMethodChange = (method: PrintMethod) => {
    setPrintMethod(method);
    setPrintMethodState(method);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.settingsTitle}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.language}</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                language === 'mr' && styles.optionButtonActive,
              ]}
              onPress={() => setLanguage('mr')}
            >
              <Text
                style={[
                  styles.optionText,
                  language === 'mr' && styles.optionTextActive,
                ]}
              >
                मराठी
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                language === 'en' && styles.optionButtonActive,
              ]}
              onPress={() => setLanguage('en')}
            >
              <Text
                style={[
                  styles.optionText,
                  language === 'en' && styles.optionTextActive,
                ]}
              >
                English
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Print Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.printMethod}</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                printMethod === 'system' && styles.optionButtonActive,
              ]}
              onPress={() => handlePrintMethodChange('system')}
            >
              <Ionicons
                name="print-outline"
                size={18}
                color={printMethod === 'system' ? Colors.textOnPrimary : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.optionText,
                  printMethod === 'system' && styles.optionTextActive,
                ]}
              >
                {t.systemPrint}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                printMethod === 'bluetooth' && styles.optionButtonActive,
                !btAvailable && styles.optionButtonDisabled,
              ]}
              onPress={() => {
                if (btAvailable) {
                  handlePrintMethodChange('bluetooth');
                } else {
                  Alert.alert(
                    'Bluetooth Direct',
                    'Bluetooth direct printing requires a development build. Use "System Print" which works with paired Bluetooth printers through the Android print dialog.'
                  );
                }
              }}
            >
              <Ionicons
                name="bluetooth"
                size={18}
                color={
                  !btAvailable
                    ? Colors.disabled
                    : printMethod === 'bluetooth'
                    ? Colors.textOnPrimary
                    : Colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.optionText,
                  printMethod === 'bluetooth' && styles.optionTextActive,
                  !btAvailable && styles.optionTextDisabled,
                ]}
              >
                {t.bluetoothDirect}
              </Text>
            </TouchableOpacity>
          </View>
          {!btAvailable && (
            <Text style={styles.hintText}>
              * Bluetooth Direct requires a dev build with native module
            </Text>
          )}
        </View>

        {/* Printer Setup Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.printerSetup}</Text>

          {/* Connected Printer */}
          <View style={styles.printerCard}>
            <Ionicons
              name={connectedPrinter ? 'bluetooth' : 'bluetooth-outline'}
              size={24}
              color={connectedPrinter ? Colors.success : Colors.textLight}
            />
            <View style={styles.printerCardContent}>
              <Text style={styles.printerCardTitle}>{t.connectedPrinter}</Text>
              <Text style={styles.printerCardValue}>
                {connectedPrinter ? connectedPrinter.name : t.noPrinter}
              </Text>
            </View>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: connectedPrinter
                    ? Colors.success
                    : Colors.textLight,
                },
              ]}
            />
          </View>

          {/* Scan Button */}
          {btAvailable && (
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScanPrinters}
              disabled={scanning}
              activeOpacity={0.7}
            >
              {scanning ? (
                <ActivityIndicator color={Colors.textOnPrimary} size="small" />
              ) : (
                <Ionicons name="search" size={18} color={Colors.textOnPrimary} />
              )}
              <Text style={styles.scanButtonText}>
                {scanning ? t.scanning : t.scanPrinters}
              </Text>
            </TouchableOpacity>
          )}

          {/* For system print, show info about how it works */}
          {printMethod === 'system' && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={Colors.info} />
              <Text style={styles.infoBoxText}>
                System Print uses Android's built-in print dialog. Pair your Bluetooth printer in Android Settings, then select it when printing.
              </Text>
            </View>
          )}

          {/* Device List */}
          {showDevices && devices.length > 0 && (
            <View style={styles.deviceList}>
              <Text style={styles.deviceListTitle}>
                Available Devices ({devices.length})
              </Text>
              {devices.map((device, index) => (
                <TouchableOpacity
                  key={device.address || index}
                  style={styles.deviceItem}
                  onPress={() => handleConnectDevice(device)}
                  disabled={connecting}
                >
                  <Ionicons
                    name="bluetooth"
                    size={18}
                    color={Colors.primary}
                  />
                  <View style={styles.deviceItemContent}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceAddress}>{device.address}</Text>
                  </View>
                  {connecting ? (
                    <ActivityIndicator color={Colors.primary} size="small" />
                  ) : (
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color={Colors.textLight}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Database Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.databaseInfo}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t.totalRecords}</Text>
            <Text style={styles.infoValue}>{voterCount.toLocaleString()}</Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.about}</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>
              मतदार शोध / Voter Search
            </Text>
            <Text style={styles.aboutVersion}>{t.version} 1.0.0</Text>
            <Text style={styles.aboutDesc}>
              Voter search and print application for election fieldwork.
              {'\n'}मतदार शोध आणि प्रिंट अॅप्लिकेशन.
            </Text>
          </View>
        </View>
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
  content: {
    flex: 1,
  },
  contentInner: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionButtonDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  optionTextActive: {
    color: Colors.textOnPrimary,
  },
  optionTextDisabled: {
    color: Colors.disabled,
  },
  hintText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  printerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  printerCardContent: {
    flex: 1,
  },
  printerCardTitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  printerCardValue: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  scanButtonText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  infoBoxText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  deviceList: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  deviceListTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: Spacing.md,
  },
  deviceItemContent: {
    flex: 1,
  },
  deviceName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  deviceAddress: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  infoLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  aboutCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  aboutVersion: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    marginTop: 4,
  },
  aboutDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 20,
  },
});
