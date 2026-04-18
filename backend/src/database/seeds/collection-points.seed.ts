import fs from 'node:fs';
import * as xlsx from 'xlsx';
import path from 'node:path';
import { DataSource } from 'typeorm';
import { CollectionPoint } from '../../collection-points/collection-point.entity';

export type Seed = {
  name: string;
  run: (ds: DataSource) => Promise<void>;
};

function normKey(input: unknown): string {
  if (input === undefined || input === null) return '';
  if (typeof input === 'object') return '';
  if (typeof input === 'symbol') return '';
  // input is now narrowed to primitive (string/number/boolean/bigint)
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/đ/g, 'd');
}

function pick<T extends Record<string, unknown>>(
  row: T,
  candidates: string[],
): unknown {
  const normalized = new Map<string, string>();
  for (const k of Object.keys(row)) normalized.set(normKey(k), k);
  for (const c of candidates) {
    const rawKey = normalized.get(normKey(c));
    if (rawKey) return row[rawKey];
  }
  return undefined;
}

function toNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function toStringOrNull(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v === 'object') return null;
  if (typeof v === 'symbol') return null;
  // v is now narrowed to primitive (string/number/boolean/bigint)
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  const s = String(v).trim();
  return s.length ? s : null;
}

export const collectionPointsSeed: Seed = {
  name: 'collection-points',
  async run(ds) {
    const repo = ds.getRepository(CollectionPoint);

    const jsonPath =
      process.env.JSON_PATH ||
      path.resolve(process.cwd(), 'seeds', 'collection-points.json');
    const excelPath =
      process.env.EXCEL_PATH ||
      path.resolve(process.cwd(), 'seeds', 'collection-points.xlsx');
    const sheetName = process.env.SHEET_NAME;
    const defaultAddress = process.env.DEFAULT_ADDRESS ?? '';

    let rows: Record<string, unknown>[] = [];
    let source: { kind: 'json' | 'xlsx'; file: string; sheet?: string };

    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, 'utf8');
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed))
        throw new Error(`Invalid JSON seed file: ${jsonPath}`);
      rows = parsed as Record<string, unknown>[];
      source = { kind: 'json', file: jsonPath };
    } else {
      const wb = xlsx.readFile(excelPath);
      const actualSheetName = sheetName || wb.SheetNames[0];
      const ws = wb.Sheets[actualSheetName];
      if (!ws) throw new Error(`Sheet not found: ${actualSheetName}`);
      rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(ws, {
        defval: '',
      });
      source = { kind: 'xlsx', file: excelPath, sheet: actualSheetName };
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of rows) {
      const name =
        toStringOrNull(
          pick(row, [
            'name',
            'Tên',
            'Ten',
            'Name',
            'Store',
            'Cửa hàng',
            'Cua hang',
          ]),
        ) ?? toStringOrNull(row.name);
      const address =
        toStringOrNull(
          pick(row, ['address', 'Địa chỉ', 'Dia chi', 'Address', 'ĐC', 'DC']),
        ) ??
        toStringOrNull(row.address) ??
        defaultAddress;
      const openHours = toStringOrNull(
        pick(row, [
          'openHours',
          'Giờ Hoạt động',
          'Gio Hoat Dong',
          'OpenHours',
          'Open Hours',
        ]),
      );
      const latitude =
        toNumber(
          pick(row, ['latitude', 'Lat', 'Latitude', 'Vĩ độ', 'Vi do']),
        ) ?? toNumber(row.latitude);
      const longitude = toNumber(
        pick(row, [
          'longitude',
          'Long',
          'Lng',
          'Longitude',
          'Kinh do',
          'Kinh độ',
        ]),
      );

      if (!name || latitude === null || longitude === null) {
        skipped++;
        continue;
      }

      const existing = await repo.findOneBy({ name, latitude, longitude });
      if (existing) {
        existing.address = address;
        existing.openHours = openHours ?? existing.openHours;
        await repo.save(existing);
        updated++;
        continue;
      }

      await repo.save({
        name,
        address,
        latitude,
        longitude,
        openHours: openHours ?? undefined,
      });
      inserted++;
    }

    console.log(
      JSON.stringify(
        {
          seed: 'collection-points',
          source,
          totalRows: rows.length,
          inserted,
          updated,
          skipped,
        },
        null,
        2,
      ),
    );
  },
};
