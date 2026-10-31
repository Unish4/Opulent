type Cell = string | number | null | undefined;

const escapeCell = (value: Cell): string => {
  if (value === null || value === undefined) return "";
  let text = typeof value === "number" ? String(value) : value;
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (header: string[], rows: Cell[][]): string =>
  `${[header, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n")}\r\n`;
