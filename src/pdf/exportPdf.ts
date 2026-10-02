import type { BloodPressureMeasurement } from '../domain/measurement'
import { formatDate, formatTime, toDateInputValue } from '../format'

export interface PdfOptions {
  patientName?: string
  generatedAt?: Date
}

/** Genera el PDF de forma síncrona (una vez cargada la librería). */
export type PdfGenerator = (measurements: BloodPressureMeasurement[], options?: PdfOptions) => Blob

const TITLE = 'Registro de tensión arterial'
const MARGIN = 15 // mm

/**
 * Carga jsPDF bajo demanda para no penalizar el arranque de la app.
 * Devuelve un generador síncrono: así, al pulsar "Compartir", el PDF se crea y se
 * comparte sin esperas, que es lo que exige iOS para abrir el menú Compartir.
 */
export async function loadPdfGenerator(): Promise<PdfGenerator> {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])

  return (measurements, { patientName, generatedAt = new Date() } = {}) => {
    // Orden cronológico ascendente: es como se lee la evolución en consulta.
    const rows = [...measurements].sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime())
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    doc.setProperties({ title: patientName ? `${TITLE} · ${patientName}` : TITLE })

    let y = MARGIN + 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(TITLE, MARGIN, y)

    doc.setFontSize(10)
    y += 8
    if (patientName) {
      doc.text('Paciente:', MARGIN, y)
      doc.setFont('helvetica', 'normal')
      doc.text(patientName, MARGIN + 18, y)
      y += 5.5
    }
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(70)
    if (rows.length > 0) {
      const period = `${formatDate(rows[0].measuredAt)} – ${formatDate(rows[rows.length - 1].measuredAt)}`
      const count = rows.length === 1 ? '1 medición' : `${rows.length} mediciones`
      doc.text(`Periodo: ${period} · ${count}`, MARGIN, y)
      y += 5.5
    }
    doc.text(`Generado el ${formatDate(generatedAt)}`, MARGIN, y)
    doc.setTextColor(0)

    autoTable(doc, {
      startY: y + 6,
      margin: { left: MARGIN, right: MARGIN, top: MARGIN, bottom: MARGIN + 6 },
      head: [['Fecha', 'Hora', 'Sistólica\n(mmHg)', 'Diastólica\n(mmHg)', 'Pulso\n(ppm)', 'Observaciones']],
      body: rows.map((m) => [
        formatDate(m.measuredAt),
        formatTime(m.measuredAt),
        String(m.systolic),
        String(m.diastolic),
        String(m.pulse),
        m.notes ?? '',
      ]),
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
        if (section === 'head' && column.index >= 2 && column.index <= 4) cell.styles.halign = 'right'
      },
    })

    const pages = doc.getNumberOfPages()
    doc.setFontSize(8)
    doc.setTextColor(110)
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.text(TITLE, MARGIN, pageHeight - MARGIN + 2)
      doc.text(`Página ${i} de ${pages}`, pageWidth - MARGIN, pageHeight - MARGIN + 2, { align: 'right' })
    }

    return doc.output('blob')
  }
}

/** "tension-arterial-2026-10-03.pdf" */
export const pdfFileName = (date = new Date()) => `tension-arterial-${toDateInputValue(date)}.pdf`
