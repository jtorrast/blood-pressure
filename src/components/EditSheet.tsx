import { useEffect, useState, type FormEvent } from 'react'
import {
  hasErrors,
  toMeasurement,
  validateMeasurement,
  type BloodPressureMeasurement,
  type ValidationErrors,
} from '../domain/measurement'
import { formatLongDay, formatTime, fromDateTimeInputs, toDateInputValue, toTimeInputValue } from '../format'
import { ConfirmDialog } from './ConfirmDialog'
import { DateTimeInputs } from './DateTimeInputs'
import { CloseIcon } from './icons'
import { MeasurementFields } from './MeasurementFields'
import { clearError, parseField, type FieldValues, type NumericField } from './fieldValues'
import { NotesField } from './NotesField'

interface Props {
  measurement: BloodPressureMeasurement
  onSave: (measurement: BloodPressureMeasurement) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function EditSheet({ measurement: m, onSave, onDelete, onClose }: Props) {
  const [values, setValues] = useState<FieldValues>({
    systolic: String(m.systolic),
    diastolic: String(m.diastolic),
    pulse: String(m.pulse),
  })
  const [notes, setNotes] = useState(m.notes ?? '')
  const [date, setDate] = useState(toDateInputValue(m.measuredAt))
  const [time, setTime] = useState(toTimeInputValue(m.measuredAt))
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [confirming, setConfirming] = useState(false)

  // Evita que la página de fondo se desplace mientras el panel está abierto.
  useEffect(() => {
    document.body.classList.add('locked')
    return () => document.body.classList.remove('locked')
  }, [])

  function changeField(field: NumericField, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => clearError(e, field))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const draft = {
      measuredAt: fromDateTimeInputs(date, time),
      systolic: parseField(values.systolic),
      diastolic: parseField(values.diastolic),
      pulse: parseField(values.pulse),
      notes,
    }
    const found = validateMeasurement(draft)
    setErrors(found)
    if (!hasErrors(found)) onSave(toMeasurement(draft, m.id))
  }

  return (
    <div className="backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="edit-title">
        <div className="grab" />
        <div className="sheet-h">
          <h2 id="edit-title">Editar medición</h2>
          <button className="icon-btn" type="button" aria-label="Cerrar" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form id="edit-form" className="card form" onSubmit={handleSubmit} noValidate>
          <div className="when-row">
            <div className="lbl">Fecha y hora</div>
            <DateTimeInputs
              idPrefix="edit"
              date={date}
              time={time}
              onChange={(d, t) => {
                setDate(d)
                setTime(t)
                setErrors((e) => clearError(e, 'measuredAt'))
              }}
            />
            {errors.measuredAt && <div className="when-msg">{errors.measuredAt}</div>}
          </div>
          <MeasurementFields idPrefix="edit" values={values} errors={errors} onChange={changeField} />
          <NotesField id="edit-notes" value={notes} rows={2} onChange={setNotes} />
        </form>

        <div className="sheet-actions">
          <button className="btn primary" type="submit" form="edit-form">
            GUARDAR CAMBIOS
          </button>
          <button className="btn danger" type="button" onClick={() => setConfirming(true)}>
            Eliminar medición
          </button>
        </div>
      </div>

      {confirming && (
        <ConfirmDialog
          title="¿Eliminar esta medición?"
          confirmLabel="Eliminar"
          onCancel={() => setConfirming(false)}
          onConfirm={() => onDelete(m.id)}
        >
          {formatLongDay(m.measuredAt)}, {formatTime(m.measuredAt)} ·{' '}
          <span className="bp-mini">
            {m.systolic}/{m.diastolic} mmHg, {m.pulse} ppm
          </span>
          . No se puede deshacer.
        </ConfirmDialog>
      )}
    </div>
  )
}
