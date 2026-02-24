import * as Print from 'expo-print';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import type { Voter, BluetoothDevice } from '../types/voter';

// ============================================================
// Bluetooth BLE Direct Printing (requires dev build)
// Uses react-native-thermal-receipt-printer-image-qr
// ============================================================

let BLEPrinter: any = null;
let COMMANDS: any = null;
let ColumnAlignment: any = null;
let bluetoothAvailable = false;

try {
  const btModule = require('react-native-thermal-receipt-printer-image-qr');
  BLEPrinter = btModule.BLEPrinter;
  COMMANDS = btModule.COMMANDS;
  ColumnAlignment = btModule.ColumnAlignment;
  bluetoothAvailable = true;
} catch (e) {
  // Bluetooth module not available (running in Expo Go)
  bluetoothAvailable = false;
}

export function isBluetoothPrintAvailable(): boolean {
  return bluetoothAvailable;
}

/** Request Bluetooth permissions on Android */
export async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  try {
    if (Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(granted).every(
        (v) => v === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (error) {
    console.error('Permission error:', error);
    return false;
  }
}

/** Initialize BLE and return available devices */
export async function enableBluetooth(): Promise<BluetoothDevice[]> {
  if (!bluetoothAvailable || !BLEPrinter) {
    throw new Error('Bluetooth module not available. Use a dev build.');
  }

  const hasPermission = await requestBluetoothPermissions();
  if (!hasPermission) {
    throw new Error('Bluetooth permissions not granted');
  }

  await BLEPrinter.init();
  const deviceList = await BLEPrinter.getDeviceList();
  return (deviceList || []).map((d: any) => ({
    name: d.device_name || d.name || 'Unknown',
    address: d.inner_mac_address || d.address || '',
  }));
}

/** Scan for nearby BLE devices (same as enableBluetooth for this library) */
export async function scanBluetoothDevices(): Promise<BluetoothDevice[]> {
  if (!bluetoothAvailable || !BLEPrinter) {
    throw new Error('Bluetooth module not available');
  }

  const deviceList = await BLEPrinter.getDeviceList();
  return (deviceList || []).map((d: any) => ({
    name: d.device_name || d.name || 'Unknown',
    address: d.inner_mac_address || d.address || '',
  }));
}

/** Connect to a Bluetooth printer */
export async function connectBluetoothPrinter(address: string): Promise<void> {
  if (!bluetoothAvailable || !BLEPrinter) {
    throw new Error('Bluetooth module not available');
  }
  await BLEPrinter.connectPrinter(address);
}

/** Print voter slip via BLE thermal printer */
export async function printVoterBluetoothDirect(voter: Voter): Promise<void> {
  if (!bluetoothAvailable || !BLEPrinter) {
    throw new Error('Bluetooth module not available');
  }

  const BOLD_ON = COMMANDS?.TEXT_FORMAT?.TXT_BOLD_ON || '';
  const BOLD_OFF = COMMANDS?.TEXT_FORMAT?.TXT_BOLD_OFF || '';
  const CENTER = COMMANDS?.TEXT_FORMAT?.TXT_ALIGN_CT || '';
  const LEFT = COMMANDS?.TEXT_FORMAT?.TXT_ALIGN_LT || '';
  const SEPARATOR = '================================\n';
  const THIN_SEP = '--------------------------------\n';

  const fields: Array<[string, string]> = [
    ['Ward / प्रभाग', voter.ward],
    ['Booth / बूथ नं', voter.booth_no],
    ['Sr.No / अक्र', voter.sr_no],
    ['Name / नाव', voter.name],
    ['Voter Card / मतदान कार्ड', voter.voter_card_no],
    ['Address / पत्ता', voter.address],
    ['Center / मतदान केंद्र', voter.voting_center],
    ['House No / घर क्र', voter.house_no],
    ['Age-Gender / वय-लिंग', voter.age_gender],
    ['Color / रंग', voter.color_code],
    ['Mobile 1 / मोबाइल-1', voter.mobile1],
    ['Mobile 2 / मोबाइल-2', voter.mobile2],
    ['New Address / नवीन पत्ता', voter.new_address],
    ['Village / गाव', voter.village],
    ['Voted / वोटेड', voter.voted],
    ['Community / समुदाय', voter.community],
    ['Area / क्षेत्र', voter.area],
    ['Resident Type / निवासी प्रकार', voter.resident_type],
    ['Email / ई मेल', voter.email],
    ['Complaint / तक्रार', voter.complaint],
    ['Society / सोसायटी', voter.society],
    ['Family / कुटुंब', voter.family_id],
    ['Assembly / विधानसभा', voter.assembly_no],
  ];

  let receiptText = '';
  receiptText += `${CENTER}${BOLD_ON}${SEPARATOR}`;
  receiptText += `${CENTER}${BOLD_ON}VOTER INFORMATION\n`;
  receiptText += `${CENTER}Voter Slip / मतदार स्लिप\n`;
  receiptText += `${CENTER}${SEPARATOR}${BOLD_OFF}`;
  receiptText += `${LEFT}`;

  for (const [label, value] of fields) {
    if (value && value.trim()) {
      receiptText += `${BOLD_ON}${label}:${BOLD_OFF}\n`;
      receiptText += `  ${value}\n`;
      receiptText += `${THIN_SEP}`;
    }
  }

  receiptText += `${CENTER}${SEPARATOR}`;
  receiptText += '\n\n\n'; // Feed paper

  BLEPrinter.printBill(receiptText);
}

// ============================================================
// System Print (HTML-based, works with any paired printer)
// ============================================================

function generateVoterHTML(voter: Voter): string {
  const fields: Array<{ label: string; labelMr: string; value: string }> = [
    { label: 'Ward', labelMr: 'प्रभाग', value: voter.ward },
    { label: 'Booth No', labelMr: 'बूथ नं', value: voter.booth_no },
    { label: 'Sr. No', labelMr: 'अक्र', value: voter.sr_no },
    { label: 'Name', labelMr: 'नाव', value: voter.name },
    { label: 'Voter Card', labelMr: 'मतदान कार्ड', value: voter.voter_card_no },
    { label: 'Address', labelMr: 'पत्ता', value: voter.address },
    { label: 'Voting Center', labelMr: 'मतदान केंद्र', value: voter.voting_center },
    { label: 'House No', labelMr: 'घर क्र', value: voter.house_no },
    { label: 'Age/Gender', labelMr: 'वय/लिंग', value: voter.age_gender },
    { label: 'Color', labelMr: 'रंग', value: voter.color_code },
    { label: 'Mobile 1', labelMr: 'मोबाइल - 1', value: voter.mobile1 },
    { label: 'Mobile 2', labelMr: 'मोबाइल - 2', value: voter.mobile2 },
    { label: 'New Address', labelMr: 'नवीन पत्ता', value: voter.new_address },
    { label: 'Village', labelMr: 'गाव', value: voter.village },
    { label: 'Voted', labelMr: 'वोटेड', value: voter.voted },
    { label: 'Community', labelMr: 'समुदाय', value: voter.community },
    { label: 'Extra Info', labelMr: 'अधिक माहिती', value: voter.extra_info2 },
    { label: 'Area', labelMr: 'क्षेत्र', value: voter.area },
    { label: 'Resident Type', labelMr: 'निवासी प्रकार', value: voter.resident_type },
    { label: 'Email', labelMr: 'ई मेल', value: voter.email },
    { label: 'Complaint', labelMr: 'तक्रार', value: voter.complaint },
    { label: 'Society', labelMr: 'सोसायटी', value: voter.society },
    { label: 'Extra Check 1', labelMr: 'अधिक चेक-1', value: voter.extra_check1 },
    { label: 'Extra Check 2', labelMr: 'अधिक चेक-2', value: voter.extra_check2 },
    { label: 'Printed', labelMr: 'प्रिंटेड', value: voter.printed },
    { label: 'Family', labelMr: 'कुटुंब', value: voter.family_id },
    { label: 'Assembly No', labelMr: 'विधानसभा क्र', value: voter.assembly_no },
  ];

  const rows = fields
    .filter((f) => f.value && f.value.trim())
    .map(
      (f) => `
      <tr>
        <td class="label">${f.labelMr}<br/><small>${f.label}</small></td>
        <td class="value">${f.value}</td>
      </tr>`
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @page { margin: 5mm; size: 80mm auto; }
      body {
        font-family: 'Noto Sans Devanagari', 'Mangal', sans-serif;
        font-size: 11px;
        margin: 0;
        padding: 4mm;
        color: #222;
      }
      .header {
        text-align: center;
        border-bottom: 2px solid #333;
        padding-bottom: 6px;
        margin-bottom: 8px;
      }
      .header h1 {
        margin: 0;
        font-size: 16px;
        color: #1565C0;
      }
      .header h2 {
        margin: 2px 0 0;
        font-size: 12px;
        color: #666;
        font-weight: normal;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      tr {
        border-bottom: 1px dashed #ccc;
      }
      td {
        padding: 3px 4px;
        vertical-align: top;
      }
      .label {
        font-weight: bold;
        color: #444;
        white-space: nowrap;
        width: 35%;
        font-size: 10px;
      }
      .label small {
        color: #888;
        font-weight: normal;
        font-size: 8px;
      }
      .value {
        color: #111;
        font-size: 11px;
        word-wrap: break-word;
      }
      .highlight {
        background-color: #E3F2FD;
      }
      .highlight .value {
        font-size: 14px;
        font-weight: bold;
        color: #0D47A1;
      }
      .footer {
        text-align: center;
        margin-top: 8px;
        padding-top: 6px;
        border-top: 2px solid #333;
        font-size: 9px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>मतदार माहिती</h1>
      <h2>Voter Information Slip</h2>
    </div>
    <table>
      ${rows}
    </table>
    <div class="footer">
      Printed on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}
    </div>
  </body>
  </html>`;
}

/** Print voter slip using system print dialog (supports Bluetooth-paired printers) */
export async function printVoterSystemPrint(voter: Voter): Promise<void> {
  const html = generateVoterHTML(voter);
  await Print.printAsync({
    html,
    width: 226, // ~80mm at 72dpi
  });
}

// ============================================================
// Unified Print Interface
// ============================================================

export type PrintMethod = 'system' | 'bluetooth';

let currentPrintMethod: PrintMethod = 'system';
let connectedPrinterAddress: string | null = null;
let connectedPrinterName: string | null = null;

export function setPrintMethod(method: PrintMethod): void {
  currentPrintMethod = method;
}

export function getPrintMethod(): PrintMethod {
  return currentPrintMethod;
}

export function getConnectedPrinter(): { name: string; address: string } | null {
  if (connectedPrinterAddress && connectedPrinterName) {
    return { name: connectedPrinterName, address: connectedPrinterAddress };
  }
  return null;
}

export function setConnectedPrinter(name: string, address: string): void {
  connectedPrinterName = name;
  connectedPrinterAddress = address;
}

/** Print voter using the currently selected method */
export async function printVoter(voter: Voter): Promise<void> {
  if (currentPrintMethod === 'bluetooth' && bluetoothAvailable) {
    if (!connectedPrinterAddress) {
      throw new Error('No Bluetooth printer connected');
    }
    await printVoterBluetoothDirect(voter);
  } else {
    await printVoterSystemPrint(voter);
  }
}
