import { NextRequest, NextResponse } from "next/server";
import { createCsvDataUrl, createTranscriptSummaryPdfDataUrl } from "@/lib/export";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { format, rows, columns, columnMap, transcript, summary, filename } = body || {};

    if (format === 'csv') {
      if (!Array.isArray(rows) || !Array.isArray(columns)) {
        return NextResponse.json({ success: false, error: 'rows and columns are required for CSV' }, { status: 400 });
      }
      const dataUrl = createCsvDataUrl(rows, { columns, columnMap });
      const base64 = dataUrl.split(',')[1];
      const bytes = Buffer.from(base64, 'base64');
      return new NextResponse(bytes, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename || 'export.csv'}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // default PDF
    const dataUrl = await createTranscriptSummaryPdfDataUrl({ transcript, summary, options: {} });
    const base64 = dataUrl.split(',')[1];
    const bytes = Buffer.from(base64, 'base64');
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename || 'export.pdf'}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Internal error' }, { status: 500 });
  }
}



