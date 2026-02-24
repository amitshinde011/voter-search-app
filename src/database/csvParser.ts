import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import { CSV_HEADER_MAP, DB_COLUMNS, type Voter, type ImportResult } from '../types/voter';
import { insertVoters, clearAllVoters } from './database';

/**
 * Opens the file picker for the user to select a CSV file.
 * Returns the file URI or null if cancelled.
 */
export async function pickCSVFile(): Promise<{ uri: string; name: string } | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'text/comma-separated-values', 'application/csv', '*/*'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return { uri: asset.uri, name: asset.name };
  } catch (error) {
    console.error('Error picking file:', error);
    return null;
  }
}

/**
 * Reads and parses a CSV file, then inserts the data into the database.
 * @param fileUri - URI of the CSV file
 * @param replaceExisting - If true, clears existing data before import
 * @param onProgress - Optional callback for progress updates
 */
export async function importCSVFile(
  fileUri: string,
  replaceExisting: boolean = true,
  onProgress?: (current: number, total: number) => void
): Promise<ImportResult> {
  const errors: string[] = [];

  try {
    // Read file content
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (!fileContent || fileContent.trim().length === 0) {
      return { success: false, totalRows: 0, importedRows: 0, errors: ['File is empty'] };
    }

    // Parse CSV using PapaParse
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    });

    if (parseResult.errors.length > 0) {
      for (const err of parseResult.errors) {
        errors.push(`Row ${err.row}: ${err.message}`);
      }
    }

    const rows = parseResult.data as Record<string, string>[];
    const totalRows = rows.length;

    if (totalRows === 0) {
      return { success: false, totalRows: 0, importedRows: 0, errors: ['No data rows found in CSV'] };
    }

    // Map CSV rows to voter objects
    const voters: Omit<Voter, 'id'>[] = [];
    const csvHeaders = Object.keys(rows[0]);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const voter: any = {};

      // Initialize all columns with empty strings
      for (const col of DB_COLUMNS) {
        voter[col] = '';
      }

      // Map CSV headers to database columns
      for (const csvHeader of csvHeaders) {
        const dbColumn = CSV_HEADER_MAP[csvHeader];
        if (dbColumn) {
          voter[dbColumn] = (row[csvHeader] ?? '').trim();
        }
      }

      // Skip rows with no name and no voter card
      if (!voter.name && !voter.voter_card_no) {
        continue;
      }

      voters.push(voter as Omit<Voter, 'id'>);

      if (onProgress && i % 50 === 0) {
        onProgress(i + 1, totalRows);
      }
    }

    // Clear existing data if replacing
    if (replaceExisting) {
      await clearAllVoters();
    }

    // Insert in batches of 200 for better performance
    const BATCH_SIZE = 200;
    let totalImported = 0;

    for (let i = 0; i < voters.length; i += BATCH_SIZE) {
      const batch = voters.slice(i, i + BATCH_SIZE);
      const count = await insertVoters(batch);
      totalImported += count;

      if (onProgress) {
        onProgress(Math.min(i + BATCH_SIZE, voters.length), voters.length);
      }
    }

    return {
      success: true,
      totalRows,
      importedRows: totalImported,
      errors,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      totalRows: 0,
      importedRows: 0,
      errors: [message],
    };
  }
}

/**
 * Preview first N rows of a CSV file without importing
 */
export async function previewCSVFile(
  fileUri: string,
  maxRows: number = 5
): Promise<{ headers: string[]; rows: Record<string, string>[]; totalRows: number } | null> {
  try {
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      preview: maxRows,
      transformHeader: (header: string) => header.trim(),
    });

    // Count total rows
    const fullParse = Papa.parse(fileContent, {
      header: false,
      skipEmptyLines: true,
    });

    return {
      headers: parseResult.meta.fields ?? [],
      rows: parseResult.data as Record<string, string>[],
      totalRows: fullParse.data.length - 1, // minus header row
    };
  } catch (error) {
    console.error('Error previewing CSV:', error);
    return null;
  }
}
