import type { BloodPressureMeasurement } from '../domain/measurement'
import { toDateInputValue } from '../format'
import { NUMERIC_COLUMNS, buildPdfContent, type PdfOptions } from './pdfContent'

/** Genera el PDF de forma síncrona (una vez cargada la librería). */
export type PdfGenerator = (measurements: BloodPressureMeasurement[], options?: PdfOptions) => Blob

const MARGIN = 15 // mm

/**
 * Carga jsPDF bajo demanda para no penalizar el arranque de la app.
 * Devuelve un generador síncrono: así, al pulsar "Compartir", el PDF se crea y se
 * comparte sin esperas, que es lo que exige iOS para abrir el menú Compartir.
 */
export async function loadPdfGenerator(): Promise<PdfGenerator> {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])

  return (measurements, options) => {
    const content = buildPdfContent(measurements, options)
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    doc.setProperties({ title: content.patientName ? `${content.title} · ${content.patientName}` : content.title })

    let y = MARGIN + 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(content.title, MARGIN, y)

    doc.setFontSize(10)
    y += 8
    if (content.patientName) {
      doc.text('Paciente:', MARGIN, y)
      doc.setFont('helvetica', 'normal')
      doc.text(content.patientName, MARGIN + 18, y)
      y += 5.5
    }
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(70)
    if (content.period) {
      doc.text(`Periodo: ${content.period}`, MARGIN, y)
      y += 5.5
    }
    doc.text(content.generated, MARGIN, y)
    doc.setTextColor(0)

    autoTable(doc, {
      startY: y + 6,
      margin: { left: MARGIN, right: MARGIN, top: MARGIN, bottom: MARGIN + 6 },
      // En el PDF la unidad va en una segunda línea de la cabecera.
      head: [content.head.map((h) => h.replace(' (', '\n('))],
      body: content.rows,
      theme: 'plain',
      styles: { font: 'helvetica', fontSize: 9.5, cellPadding: { top: 2, bottom: 2, left: 2, right: 2 }, textColor: 20 },
      headStyles: { fontStyle: 'bold', fillColor: [235, 238, 241], valign: 'bottom' },
      bodyStyles: { lineColor: [200, 200, 200], lineWidth: { bottom: 0.2 } },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 15 },
        2: { cellWidth: 22, halign: 'right' },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 18, halign: 'right' },
        5: { cellWidth: 'auto' },
      },
      didParseCell: ({ section, column, cell }) => {
        if (section === 'head' && NUMERIC_COLUMNS.includes(column.index)) cell.styles.halign = 'right'
      },
    })

    const pages = doc.getNumberOfPages()
    doc.setFontSize(8)
    doc.setTextColor(110)
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.text(content.title, MARGIN, pageHeight - MARGIN + 2)
      doc.text(`Página ${i} de ${pages}`, pageWidth - MARGIN, pageHeight - MARGIN + 2, { align: 'right' })
    }

    return doc.output('blob')
  }
}

/** "tension-arterial-2026-10-03.pdf" */
export const pdfFileName = (date = new Date()) => `tension-arterial-${toDateInputValue(date)}.pdf`
