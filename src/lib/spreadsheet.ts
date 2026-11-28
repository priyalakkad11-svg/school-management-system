import zlib from "node:zlib";

export function parseCsvText(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  const clean = csv.replace(/^\uFEFF/, "");
  for (let i = 0; i < clean.length; i += 1) {
    const ch = clean[i];
    const next = clean[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell.trim());
      cell = "";
    } else if (ch === "\n") {
      row.push(cell.trim());
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  row.push(cell.trim());
  if (row.some((c) => c.length > 0)) rows.push(row);
  return rows;
}

export function buildCsvText(headers: string[], rows: Array<Array<string | number | null | undefined>>): string {
  const esc = (v: string | number | null | undefined) => {
    const s = String(v ?? "");
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\r\n");
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function colIndexFromRef(ref: string): number {
  const letters = ref.replace(/[^A-Z]/gi, "").toUpperCase();
  let col = 0;
  for (let i = 0; i < letters.length; i += 1) {
    col = col * 26 + (letters.charCodeAt(i) - 64);
  }
  return Math.max(0, col - 1);
}

/**
 * Dependency-free XLSX (ZIP + OOXML) & CSV parser.
 * Parses local file entries safely without third-party vulnerable packages.
 */
export function parseSpreadsheetBuffer(fileName: string, buffer: Buffer): Array<Record<string, string>> {
  let matrix: string[][] = [];

  if (fileName.toLowerCase().endsWith(".xlsx")) {
    const entries = new Map<string, Buffer>();
    let offset = 0;
    while (offset + 30 < buffer.length) {
      if (buffer.readUInt32LE(offset) !== 0x04034b50) break;
      const compression = buffer.readUInt16LE(offset + 8);
      const compSize = buffer.readUInt32LE(offset + 18);
      const nameLen = buffer.readUInt16LE(offset + 26);
      const extraLen = buffer.readUInt16LE(offset + 28);
      const name = buffer.toString("utf8", offset + 30, offset + 30 + nameLen);
      const dataStart = offset + 30 + nameLen + extraLen;
      const rawData = buffer.subarray(dataStart, dataStart + compSize);
      if (compression === 0) entries.set(name, rawData);
      else if (compression === 8) entries.set(name, zlib.inflateRawSync(rawData));
      offset = dataStart + compSize;
    }

    const sharedStringsXml = entries.get("xl/sharedStrings.xml")?.toString("utf8") ?? "";
    const sharedStrings: string[] = [];
    for (const m of sharedStringsXml.matchAll(/<si[^>]*>([\s\S]*?)<\/si>/g)) {
      const textParts = Array.from(m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)).map((t) => t[1]);
      sharedStrings.push(decodeXmlEntities(textParts.join("")));
    }

    const sheetXml = entries.get("xl/worksheets/sheet1.xml")?.toString("utf8") ?? "";
    for (const rowMatch of sheetXml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
      const cells: string[] = [];
      for (const cellMatch of rowMatch[1].matchAll(/<c\s+([^>]*)>([\s\S]*?)<\/c>/g)) {
        const attrs = cellMatch[1];
        const body = cellMatch[2];
        const refMatch = attrs.match(/r="([A-Z]+\d+)"/i);
        const typeMatch = attrs.match(/t="([^"]+)"/);
        const idx = refMatch ? colIndexFromRef(refMatch[1]) : cells.length;
        const valMatch = body.match(/<v>([\s\S]*?)<\/v>/) ?? body.match(/<t[^>]*>([\s\S]*?)<\/t>/);
        let val = valMatch ? decodeXmlEntities(valMatch[1]) : "";
        if (typeMatch?.[1] === "s" && val !== "") {
          val = sharedStrings[Number(val)] ?? "";
        }
        cells[idx] = val.trim();
      }
      if (cells.some((c) => (c ?? "").length > 0)) {
        matrix.push(cells.map((c) => c ?? ""));
      }
    }
  } else {
    matrix = parseCsvText(buffer.toString("utf8"));
  }

  if (matrix.length < 2) return [];
  const headers = matrix[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return matrix.slice(1).map((row) => {
    const rec: Record<string, string> = {};
    headers.forEach((h, i) => {
      if (h) rec[h] = (row[i] ?? "").trim();
    });
    return rec;
  });
}
