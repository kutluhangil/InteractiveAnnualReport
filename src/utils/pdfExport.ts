import html2pdf from 'html2pdf.js';

export interface PdfExportOptions {
  filename?: string;
  elementId?: string;
  onProgress?: (status: string) => void;
}

export async function exportReportToPdf({
  filename = 'London_Urban_Bee_Report_2026.pdf',
  elementId = 'report-content',
  onProgress,
}: PdfExportOptions = {}): Promise<boolean> {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    console.error(`PDF Export target element #${elementId} not found.`);
    return false;
  }

  try {
    onProgress?.('Preparing report layout...');

    // html2pdf options optimized for full-page reports
    const opt = {
      margin: [10, 8, 10, 8] as [number, number, number, number],
      filename: filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        scrollY: 0,
        windowWidth: 1280,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait' as const,
        compress: true,
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        avoid: ['section', '.pdf-avoid-break', 'tr', '.recharts-wrapper', 'svg'],
      },
    };

    onProgress?.('Rendering high-resolution pages...');

    await html2pdf().set(opt).from(targetElement).save();

    onProgress?.('Completed');
    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw error;
  }
}
