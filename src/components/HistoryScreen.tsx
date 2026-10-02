import type { BloodPressureMeasurement } from '../domain/measurement'
import { formatLongDay, formatMediumDate } from '../format'
import { BackupSection } from './BackupSection'
import { BackIcon } from './icons'
import { MeasurementList } from './MeasurementList'

interface Props {
  measurements: BloodPressureMeasurement[]
  onBack: () => void
  onOpenPdf: () => void
  onSelect: (measurement: BloodPressureMeasurement) => void
  lastBackupAt: Date | null
  onBackup: () => void
  onRestore: (file: File) => void
}

/** Agrupa por día manteniendo el orden recibido (más reciente primero). */
function groupByDay(list: BloodPressureMeasurement[]) {
  const groups: { key: string; day: Date; items: BloodPressureMeasurement[] }[] = []
  for (const m of list) {
    const key = m.measuredAt.toDateString()
    const last = groups[groups.length - 1]
    if (last?.key === key) last.items.push(m)
    else groups.push({ key, day: m.measuredAt, items: [m] })
  }
  return groups
}

export function HistoryScreen({ measurements, onBack, onOpenPdf, onSelect, lastBackupAt, onBackup, onRestore }: Props) {
  const newest = measurements[0]
  const oldest = measurements[measurements.length - 1]

  return (
    <div className="screen">
      <div className="bar">
        <button className="icon-btn" type="button" aria-label="Volver" onClick={onBack}>
          <BackIcon />
        </button>
        <h2>Historial</h2>
        <span />
      </div>

      {measurements.length === 0 ? (
        <div className="card">
          <div className="empty">No hay mediciones registradas.</div>
        </div>
      ) : (
        <>
          <div className="summary">
            {measurements.length === 1 ? '1 medición' : `${measurements.length} mediciones`} · del{' '}
            {formatMediumDate(oldest.measuredAt)} al {formatMediumDate(newest.measuredAt)}
          </div>
          {groupByDay(measurements).map((g) => (
            <section key={g.key} className="day">
              <h3 className="day-h">{formatLongDay(g.day)}</h3>
              <MeasurementList measurements={g.items} showDate={false} onSelect={onSelect} />
            </section>
          ))}
          <div className="bottom-bar">
            <button className="btn primary" type="button" onClick={onOpenPdf}>
              GENERAR PDF
            </button>
          </div>
        </>
      )}

      <BackupSection
        hasMeasurements={measurements.length > 0}
        lastBackupAt={lastBackupAt}
        onBackup={onBackup}
        onRestore={onRestore}
      />
    </div>
  )
}
