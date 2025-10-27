import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface CsvOptions {
  columns: string[];
  columnMap?: Record<string, string>;
}

export function createCsvDataUrl(rows: Record<string, any>[], options: CsvOptions): string {
  const { columns, columnMap } = options;
  const headers = columns.map((c) => (columnMap?.[c] ?? c));
  const bom = "\uFEFF"; // UTF-8 BOM for Excel

  const escape = (value: any) => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (/[",\n]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const lines: string[] = [];
  lines.push(headers.join(","));
  for (const row of rows) {
    const line = columns.map((c) => escape(row[c])).join(",");
    lines.push(line);
  }
  const csv = bom + lines.join("\n");
  const base64 = typeof window === 'undefined'
    ? Buffer.from(csv, 'utf8').toString('base64')
    : btoa(unescape(encodeURIComponent(csv)));
  return `data:text/csv;base64,${base64}`;
}

export interface PdfOptions {
  title?: string;
  subtitle?: string;
  template?: "transcript-summary";
}

export async function createTranscriptSummaryPdfDataUrl(params: {
  transcript: string;
  summary: string;
  options?: PdfOptions;
}): Promise<string> {
  const { transcript, summary, options } = params;

  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]); // Letter
  const { width, height } = page.getSize();
  const margin = 48;

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let cursorY = height - margin;

  const drawText = (text: string, size: number, bold = false, color = rgb(0, 0, 0)) => {
    const lines = wrapText(text, bold ? fontBold : font, size, width - margin * 2);
    for (const line of lines) {
      if (cursorY - size < margin) {
        // new page
        cursorY = addPage(doc, font, fontBold, width, height, margin, options);
      }
      page.drawText(line, { x: margin, y: cursorY - size, size, font: bold ? fontBold : font, color });
      cursorY -= size + 6;
    }
  };

  // Header
  const title = options?.title || "Conversation Summary";
  const subtitle = options?.subtitle || "Auto-generated report";
  drawText(title, 20, true);
  drawText(subtitle, 12, false, rgb(0.4, 0.4, 0.45));
  cursorY -= 12;

  // Summary
  drawText("Summary", 14, true);
  drawText(summary, 11);
  cursorY -= 6;

  // Transcript
  drawText("Full Transcript", 14, true);
  drawText(transcript, 11);

  const pdfBytes = await doc.save();
  const base64 = typeof window === 'undefined'
    ? Buffer.from(pdfBytes).toString('base64')
    : btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
  return `data:application/pdf;base64,${base64}`;
}

function addPage(doc: PDFDocument, font: any, fontBold: any, width: number, height: number, margin: number, options?: PdfOptions) {
  const page = doc.addPage([width, height]);
  // Optional: draw header/footer per page later
  return height - margin;
}

function wrapText(text: string, font: any, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const testLine = line ? line + " " + word : word;
    const width = font.widthOfTextAtSize(testLine, size);
    if (width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);
  return lines;
}





