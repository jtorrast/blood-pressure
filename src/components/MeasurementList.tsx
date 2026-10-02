import type { BloodPressureMeasurement } from '../domain/measurement'
import { formatDate, formatTime } from '../format'

interface Props {
  measurements: BloodPressureMeasurement[]
  showDate: boolean
  onSelect: (measurement: BloodPressureMeasurement) => void
}

export function MeasurementList({ measurements, showDate, onSelect }: Props) {
  return (
    <div className="card list">
      {measurements.map((m) => (
        <button key={m.id} type="button" className="row" onClick={() => onSelect(m)}>
          <span className="when">
            {showDate && <span>{formatDate(m.measuredAt)}</span>}
            <span className="t">{formatTime(m.measuredAt)}</span>
          </span>
          <span className="bp">
            {m.systolic}
            <i>/</i>
            {m.diastolic}
            <small>mmHg</small>
          </span>
          <span className="pulse">
            {m.pulse}
            <small>ppm</small>
          </span>
          {m.notes && <span className="note">{m.notes}</span>}
        </button>
      ))}
    </div>
  )
}
