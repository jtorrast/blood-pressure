import type { BloodPressureMeasurement } from '../domain/measurement'
import { formatDate, formatTime } from '../format'

export interface PdfOptions {
  patientName?: string
  generatedAt?: Date
}

/** Contenido del documento. Lo usan tanto el PDF como la vista previa, para que siempre coincidan. */
export interface PdfContent {
  title: string
  patientName?: string
  period?: string
  generated: string
  head: string[]
  rows: string[][]
}

export const PDF_TITLE = 'Registro de tensión arterial'

/** Columnas numéricas (sistólica, diastólica, pulso), alineadas a la derecha. */
export const NUMERIC_COLUMNS = [2, 3, 4]

export function buildPdfContent(
  measurements: BloodPressureMeasurement[],
  { patientName, generatedAt = new Date() }: PdfOptions = {},
): PdfContent {
  // Orden cronológico ascendente: es como se lee la evolución en consulta.
  const sorted = [...measurements].sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime())
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const count = sorted.length === 1 ? '1 medición' : `${sorted.length} mediciones`

  return {
    title: PDF_TITLE,
    patientName: patientName?.trim() || undefined,
    period: first && `${formatDate(first.measuredAt)} – ${formatDate(last.measuredAt)} · ${count}`,
    generated: `Generado el ${formatDate(generatedAt)}`,
    head: ['Fecha', 'Hora', 'Sistólica (mmHg)', 'Diastólica (mmHg)', 'Pulso (ppm)', 'Observaciones'],
    rows: sorted.map((m) => [
      formatDate(m.measuredAt),
      formatTime(m.measuredAt),
      String(m.systolic),
      String(m.diastolic),
      String(m.pulse),
      m.notes ?? '',
    ]),
  }
}
