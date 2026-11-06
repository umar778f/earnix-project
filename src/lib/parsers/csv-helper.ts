/**
 * RFC 4180 compliant CSV parser with support for quoted cells, escaped quotes,
 * commas inside quotes, and multi-line fields.
 */
export function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ""
  let inQuotes = false

  // Normalize Windows CRLF to LF
  const text = csvText.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        currentCell += '"'
        i++ // Skip next quote
      } else if (char === '"') {
        // Closing quote
        inQuotes = false
      } else {
        currentCell += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ",") {
        currentRow.push(currentCell.trim())
        currentCell = ""
      } else if (char === "\n") {
        currentRow.push(currentCell.trim())
        if (currentRow.some((cell) => cell.length > 0)) {
          rows.push(currentRow)
        }
        currentRow = []
        currentCell = ""
      } else {
        currentCell += char
      }
    }
  }

  // Push final cell and row if non-empty
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim())
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow)
    }
  }

  return rows
}

/**
 * Normalizes header string (lowercase, remove spaces, underscores, symbols)
 */
export function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "")
}

