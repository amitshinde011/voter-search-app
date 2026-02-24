import * as SQLite from 'expo-sqlite';
import type { Voter, SearchFilters } from '../types/voter';
import { DB_COLUMNS } from '../types/voter';

const DB_NAME = 'voters.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await initializeDatabase(db);
  }
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS voters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ward TEXT DEFAULT '',
      booth_no TEXT DEFAULT '',
      sr_no TEXT DEFAULT '',
      name TEXT DEFAULT '',
      voter_card_no TEXT DEFAULT '',
      address TEXT DEFAULT '',
      voting_center TEXT DEFAULT '',
      house_no TEXT DEFAULT '',
      age_gender TEXT DEFAULT '',
      color_code TEXT DEFAULT '',
      mobile1 TEXT DEFAULT '',
      mobile2 TEXT DEFAULT '',
      new_address TEXT DEFAULT '',
      village TEXT DEFAULT '',
      voted TEXT DEFAULT '',
      community TEXT DEFAULT '',
      extra_info2 TEXT DEFAULT '',
      area TEXT DEFAULT '',
      resident_type TEXT DEFAULT '',
      extra_info5 TEXT DEFAULT '',
      email TEXT DEFAULT '',
      complaint TEXT DEFAULT '',
      society TEXT DEFAULT '',
      extra_check1 TEXT DEFAULT '',
      extra_check2 TEXT DEFAULT '',
      printed TEXT DEFAULT '',
      family_id TEXT DEFAULT '',
      assembly_no TEXT DEFAULT ''
    );
  `);

  // Create indexes for commonly searched fields
  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_voters_name ON voters(name);
    CREATE INDEX IF NOT EXISTS idx_voters_voter_card ON voters(voter_card_no);
    CREATE INDEX IF NOT EXISTS idx_voters_booth ON voters(booth_no);
    CREATE INDEX IF NOT EXISTS idx_voters_ward ON voters(ward);
    CREATE INDEX IF NOT EXISTS idx_voters_address ON voters(address);
    CREATE INDEX IF NOT EXISTS idx_voters_sr_no ON voters(sr_no);
  `);
}

/** Insert multiple voters in a single transaction (batch insert) */
export async function insertVoters(voters: Omit<Voter, 'id'>[]): Promise<number> {
  const database = await getDatabase();
  let insertedCount = 0;

  const placeholders = DB_COLUMNS.map(() => '?').join(', ');
  const columnNames = DB_COLUMNS.join(', ');
  const sql = `INSERT INTO voters (${columnNames}) VALUES (${placeholders})`;

  await database.withTransactionAsync(async () => {
    const statement = await database.prepareAsync(sql);
    try {
      for (const voter of voters) {
        const values = DB_COLUMNS.map((col) => (voter as any)[col] ?? '');
        await statement.executeAsync(values);
        insertedCount++;
      }
    } finally {
      await statement.finalizeAsync();
    }
  });

  return insertedCount;
}

/** Search voters with multiple filter criteria */
export async function searchVoters(
  filters: SearchFilters,
  limit: number = 100,
  offset: number = 0
): Promise<{ voters: Voter[]; totalCount: number }> {
  const database = await getDatabase();

  const conditions: string[] = [];
  const params: any[] = [];

  // Text search across name, voter card, address, house_no
  if (filters.query && filters.query.trim()) {
    const q = `%${filters.query.trim()}%`;
    conditions.push(
      '(name LIKE ? OR voter_card_no LIKE ? OR address LIKE ? OR house_no LIKE ? OR mobile1 LIKE ? OR sr_no LIKE ?)'
    );
    params.push(q, q, q, q, q, q);
  }

  // Ward filter
  if (filters.ward && filters.ward !== '') {
    conditions.push('ward = ?');
    params.push(filters.ward);
  }

  // Booth filter
  if (filters.booth_no && filters.booth_no !== '') {
    conditions.push('booth_no = ?');
    params.push(filters.booth_no);
  }

  // Gender filter
  if (filters.gender && filters.gender !== '') {
    conditions.push('age_gender LIKE ?');
    params.push(`%${filters.gender}`);
  }

  // Voted filter
  if (filters.voted && filters.voted !== '') {
    conditions.push('voted = ?');
    params.push(filters.voted);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM voters ${whereClause}`,
    params
  );
  const totalCount = countResult?.count ?? 0;

  // Get paginated results
  const voters = await database.getAllAsync<Voter>(
    `SELECT * FROM voters ${whereClause} ORDER BY CAST(sr_no AS INTEGER) ASC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { voters, totalCount };
}

/** Get all unique ward values */
export async function getDistinctWards(): Promise<string[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync<{ ward: string }>(
    "SELECT DISTINCT ward FROM voters WHERE ward != '' ORDER BY CAST(ward AS INTEGER)"
  );
  return results.map((r) => r.ward);
}

/** Get all unique booth numbers */
export async function getDistinctBooths(): Promise<string[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync<{ booth_no: string }>(
    "SELECT DISTINCT booth_no FROM voters WHERE booth_no != '' ORDER BY CAST(booth_no AS INTEGER)"
  );
  return results.map((r) => r.booth_no);
}

/** Get total voter count */
export async function getVoterCount(): Promise<number> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM voters'
  );
  return result?.count ?? 0;
}

/** Get a single voter by ID */
export async function getVoterById(id: number): Promise<Voter | null> {
  const database = await getDatabase();
  return await database.getFirstAsync<Voter>(
    'SELECT * FROM voters WHERE id = ?',
    [id]
  );
}

/** Get voters from the same family */
export async function getFamilyMembers(familyId: string): Promise<Voter[]> {
  if (!familyId) return [];
  const database = await getDatabase();
  return await database.getAllAsync<Voter>(
    'SELECT * FROM voters WHERE family_id = ? ORDER BY CAST(sr_no AS INTEGER)',
    [familyId]
  );
}

/** Clear all voter data */
export async function clearAllVoters(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync('DELETE FROM voters');
}

/** Update the voted status */
export async function updateVotedStatus(id: number, voted: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('UPDATE voters SET voted = ? WHERE id = ?', [voted, id]);
}

/** Update the printed status */
export async function updatePrintedStatus(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("UPDATE voters SET printed = 'printed' WHERE id = ?", [id]);
}
