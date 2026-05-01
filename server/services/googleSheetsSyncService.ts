import { google } from "googleapis";

type VendorLike = {
  vendorId: number;
  vendorName?: string;
  googleSheetId?: string | null;
  sheetTabName: string;
  sheetHeaderRow: number;
};
type OrderItemLike = {
  itemId: number;
  orderId: number;
  vendorId?: number | null;
  itemStatus?: string;
  productNameSnapshot?: string | null;
  anchorText?: string | null;
  targetUrl?: string | null;
  notes?: string | null;
  vendorPayload?: Record<string, unknown> | null;
  vendorSheetRowKey?: string | null;
};

type VendorFieldMapping = {
  // app-side field key, e.g. "anchorText" or "vendorPayload.status"
  appField: string;
  // sheet column header name, e.g. "Anchor Text"
  sheetColumn: string;
  // who owns this field for reconciliation
  owner?: "app" | "vendor";
};

type UpsertParams = {
  vendor: VendorLike;
  item: OrderItemLike;
  mappings: any;
  sheetTabName?: string; // default "Sheet1"
  externalKeyColumn?: string; // default "external_order_item_key"
  client: any;
};

type PullParams = {
  vendor: VendorLike;
  mappings: VendorFieldMapping[];
  sheetTabName?: string;
  externalKeyColumn?: string;
};

type PulledRow = {
  externalOrderItemKey: string;
  valuesByColumn: Record<string, string>;
};

// ---------- Auth / Client ----------

function assertEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function getJwtAuth() {
  const clientEmail = assertEnv("GOOGLE_SHEETS_CLIENT_EMAIL");
  const privateKey = assertEnv("GOOGLE_SHEETS_PRIVATE_KEY").replace(
    /\\n/g,
    "\n",
  );
  const projectId = process.env.GOOGLE_SHEETS_PROJECT_ID;

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    projectId,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });
}

function getSheetsClient() {
  const auth = getJwtAuth();
  return google.sheets({ version: "v4", auth });
}

// ---------- Helpers ----------

function buildExternalOrderItemKey(item: OrderItemLike): string {
  return `${item.orderId}-${item.itemId}`;
}

function toA1Range(tabName: string) {
  const safeTab = tabName.replace(/'/g, "''");
  return `'${safeTab}'!A:ZZ`;
}
function getValueByPath(
  client: any,
  vendor: VendorLike,
  item: OrderItemLike,
  path: string,
): unknown {
  const roots: Record<string, any> = {
    client,
    vendor,
    item,
    vendorPayload: item?.vendorPayload, // convenience alias
  };

  const parts = path.split(".");
  const [first, ...rest] = parts;

  // If path starts with known root (item/client/vendor/vendorPayload), use that root.
  // Otherwise default to item for backward compatibility.
  let acc: any = first in roots ? roots[first] : item;
  const keys = first in roots ? rest : parts;

  console.log(path);

  if (path === "client.clientName") {
    console.log(client);
  }

  for (const key of keys) {
    if (path === "currentDate") {
      acc = new Date().toLocaleDateString("en-US");
    } else if (path === "p1p_id") {
      acc = buildExternalOrderItemKey(item);
    } else if (acc && typeof acc === "object" && key in acc) {
      acc = acc[key];
    } else {
      return undefined;
    }
  }

  return acc;
}

function setValueByPath(
  target: Record<string, unknown>,
  path: string,
  value: unknown,
) {
  const parts = path.split(".");
  let cur: Record<string, unknown> = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (!cur[k] || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

function toStringCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function normalizeHeader(s: string): string {
  return s.trim().toLowerCase();
}

function indexHeaders(headerRow: string[]): Map<string, number> {
  const map = new Map<string, number>();
  headerRow.forEach((h, idx) => map.set(normalizeHeader(h), idx));
  return map;
}

function prependRow(sheet: any, rowData: any, sheetHeaderRow: number) {
  sheet
    .insertRowBefore(sheetHeaderRow + 1)
    .getRange(sheetHeaderRow + 1, 1, 1, rowData.length)
    .setValues([rowData]);
}

// ---------- Core: Connectivity ----------

export async function testSpreadsheetAccess(spreadsheetId: string) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.get({ spreadsheetId }).then((res) => {
    return {
      spreadsheetId,
      title: res.data.properties?.title ?? null,
      sheetCount: res.data.sheets?.length ?? 0,
    };
  });
}

// ---------- Core: Upsert Row (App -> Sheet) ----------

export async function upsertVendorRowToSheet(
  params: UpsertParams,
): Promise<{ externalKey: string; rowIndex: number }> {
  console.log("upsertting");
  const {
    client,
    vendor,
    item,
    mappings,
    externalKeyColumn = "p1p_id",
  } = params;
  const sheetTabName = vendor.sheetTabName;
  const sheetHeaderRow = vendor.sheetHeaderRow - 1;

  if (!vendor.googleSheetId) {
    throw new Error(`Vendor ${vendor.vendorId} has no googleSheetId`);
  }

  const sheets = getSheetsClient();
  const spreadsheetId = vendor.googleSheetId;
  const range = toA1Range(sheetTabName);

  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = (readRes.data.values ?? []) as string[][];
  if (rows.length === 0)
    throw new Error(`Sheet ${spreadsheetId}/${sheetTabName} has no header row`);

  const header = rows[sheetHeaderRow];
  const headerIndex = indexHeaders(header);

  // Validate required columns
  const requiredCols = [
    externalKeyColumn,
    ...mappings?.map((m: any) => m.label?.toLowerCase()),
  ];

  for (const col of requiredCols) {
    if (!headerIndex.has(normalizeHeader(col))) {
      throw new Error(`Missing required column ${col} in ${sheetTabName}`);
    }
  }

  const externalKey = buildExternalOrderItemKey(item);
  const extColIdx = headerIndex.get(normalizeHeader(externalKeyColumn))!;

  // Find existing row by external key (skip header row)
  let existingRowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    const rowVal = rows[i]?.[extColIdx] ?? "";
    if (rowVal === externalKey) {
      existingRowIndex = i;
      break;
    }
  }

  const rowArray =
    existingRowIndex >= 0
      ? [...(rows[existingRowIndex] ?? [])]
      : new Array(header.length).fill("");

  // Always write external key
  rowArray[extColIdx] = externalKey;

  // Write mapped app values
  for (const m of mappings) {
    const colIdx = headerIndex.get(normalizeHeader(m.label));
    if (colIdx === undefined) continue;
    if (!m.isClient) {
      const v = getValueByPath(client, vendor, item, m.appField);
      rowArray[colIdx] = toStringCell(v);
    }
  }

  if (existingRowIndex >= 0) {
    // Update existing row at exact row index (A1 is 1-based; +1 for header offset already included)
    const rowNumber = existingRowIndex + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetTabName}!A${rowNumber}:ZZ${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [rowArray] },
    });
    return { externalKey, rowIndex: existingRowIndex };
  }

  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties(sheetId,title))",
  });

  const tab = meta.data.sheets?.find(
    (s) => s.properties?.title === sheetTabName,
  );

  if (!tab?.properties?.sheetId) {
    throw new Error(`Tab "${sheetTabName}" not found`);
  }

  const gid = tab.properties.sheetId; // numeric gid for batchUpdate insertDimension

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId: gid,
              dimension: "ROWS",
              startIndex: sheetHeaderRow + 2,
              endIndex: sheetHeaderRow + 2,
            },
            inheritFromBefore: false,
          },
        },
      ],
    },
  });

  console.log(rowArray);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetTabName}!A${sheetHeaderRow + 2}:ZZ${sheetHeaderRow + 2}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [rowArray] },
  });

  // You can omit exact new row index unless needed
  return { externalKey, rowIndex: rows.length };
}

// ---------- Core: Pull Rows (Sheet -> App) ----------

export async function fetchVendorRowsForReconciliation(
  params: PullParams,
): Promise<PulledRow[]> {
  const {
    vendor,
    mappings,
    sheetTabName = "Sheet1",
    externalKeyColumn = "external_order_item_key",
  } = params;

  if (!vendor.googleSheetId) {
    throw new Error(`Vendor ${vendor.vendorId} has no googleSheetId`);
  }

  const sheets = getSheetsClient();
  const spreadsheetId = vendor.googleSheetId;
  const range = toA1Range(sheetTabName);

  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  const rows = (readRes.data.values ?? []) as string[][];
  if (rows.length <= 1) return [];

  const header = rows[0];
  const headerIndex = indexHeaders(header);
  const extColIdx = headerIndex.get(normalizeHeader(externalKeyColumn));
  if (extColIdx === undefined) {
    throw new Error(
      `Missing required external key column "${externalKeyColumn}"`,
    );
  }

  // Columns we care about: external key + mapped vendor-owned columns
  const neededColumns = new Set<string>([
    externalKeyColumn,
    ...mappings.map((m) => m.sheetColumn),
  ]);

  const out: PulledRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] ?? [];
    const externalOrderItemKey = row[extColIdx] ?? "";
    if (!externalOrderItemKey) continue;

    const valuesByColumn: Record<string, string> = {};
    for (const col of neededColumns) {
      const idx = headerIndex.get(normalizeHeader(col));
      if (idx === undefined) continue;
      valuesByColumn[col] = row[idx] ?? "";
    }

    out.push({ externalOrderItemKey, valuesByColumn });
  }

  return out;
}

// ---------- Core: Map pulled row -> app patch ----------

export function mapPulledRowToOrderItemPatch(
  pulledRow: PulledRow,
  mappings: VendorFieldMapping[],
): { itemId: number; patch: Record<string, unknown> } {
  // external key format: orderItem:123
  const parts = pulledRow.externalOrderItemKey.split(":");
  const itemId = Number(parts[1]);
  if (!Number.isFinite(itemId)) {
    throw new Error(`Invalid external key: ${pulledRow.externalOrderItemKey}`);
  }

  const patch: Record<string, unknown> = {};

  for (const m of mappings) {
    // only apply vendor-owned fields on inbound reconciliation
    if (m.owner && m.owner !== "vendor") continue;
    const raw = pulledRow.valuesByColumn[m.sheetColumn];
    if (raw === undefined) continue;

    // store as string by default; you can add per-field type parsing later
    setValueByPath(patch, m.appField, raw);
  }

  return { itemId, patch };
}
