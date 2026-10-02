import { useEffect, useState } from 'react'
import { settings } from '../data'
import type { BloodPressureMeasurement } from '../domain/measurement'
import { loadPdfGenerator, pdfFileName, type PdfGenerator } from '../pdf/exportPdf'
import { buildPdfContent } from '../pdf/pdfContent'
import { shareOrDownloadPdf } from '../pdf/sharePdf'
import { BackIcon } from './icons'
import { PdfPreview } from './PdfPreview'

interface Props {
  measurements: BloodPressureMeasurement[]
  onBack: () => void
  notify: (text: string) => void
}

export function PdfScreen({ measurements, onBack, notify }: Props) {
  const [name, setName] = useState(settings.getPatientName)
  const [generator, setGenerator] = useState<PdfGenerator | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)

  // Se carga al abrir la pantalla para que el botón responda al instante.
  useEffect(() => {
    loadPdfGenerator()
      .then((g) => setGenerator(() => g))
      .catch(() => setLoadFailed(true))
  }, [])

  const content = buildPdfContent(measurements, { patientName: name })

  function changeName(value: string) {
    setName(value)
    settings.setPatientName(value)
  }

  async function share() {
    if (!generator) return
    try {
      const blob = generator(measurements, { patientName: name.trim() || undefined })
      const result = await shareOrDownloadPdf(blob, pdfFileName())
      if (result === 'downloaded') notify('PDF descargado')
    } catch {
      notify('No se pudo generar el PDF. Inténtalo de nuevo.')
    }
  }

  return (
    <div className="screen">
      <div className="bar">
        <button className="icon-btn" type="button" aria-label="Volver" onClick={onBack}>
          <BackIcon />
        </button>
        <h2>PDF para el médico</h2>
        <span />
      </div>

      <div className="card name-field">
        <label htmlFor="patient-name">
          Nombre del paciente <small>(opcional)</small>
        </label>
        <input
          id="patient-name"
          type="text"
          autoComplete="name"
          enterKeyHint="done"
          placeholder="Ej.: María García López"
          value={name}
          onChange={(e) => changeName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
      </div>

      {loadFailed ? (
        <div className="card">
          <div className="empty">No se pudo preparar el PDF. Comprueba la conexión y vuelve a abrir esta pantalla.</div>
        </div>
      ) : (
        <button className="btn primary" type="button" disabled={!generator} onClick={share}>
          {generator ? 'COMPARTIR PDF' : 'Preparando…'}
        </button>
      )}

      <div className="section-h">
        <h2>Vista previa</h2>
      </div>
      <PdfPreview content={content} />
      <p className="hint">El PDF se divide en páginas A4 numeradas y la cabecera de la tabla se repite en cada página.</p>
    </div>
  )
}
