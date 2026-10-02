import { useEffect, useState, type FormEvent } from 'react'
import {
  hasErrors,
  toMeasurement,
  validateMeasurement,
  type BloodPressureMeasurement,
  type ValidationErrors,
} from '../domain/measurement'
import { formatTime, formatWeekdayDay, fromDateTimeInputs, toDateInputValue, toTimeInputValue } from '../format'
import { DateTimeInputs } from './DateTimeInputs'
import { MeasurementFields } from './MeasurementFields'
import { clearError, emptyFieldValues, parseField, type FieldValues, type NumericField } from './fieldValues'
import { NotesField } from './NotesField'

interface Props {
  onSave: (measurement: BloodPressureMeasurement) => Promise<boolean>
}

/** Fecha actual, refrescada cada pocos segundos para la etiqueta de hora automática. */
function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10_000)
    return () => clearInterval(timer)
  }, [])
  return now
}

export function NewMeasurementForm({ onSave }: Props) {
  const [values, setValues] = useState<FieldValues>(emptyFieldValues)
  const [notes, setNotes] = useState('')
  const [useCurrentTime, setUseCurrentTime] = useState(true)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [saving, setSaving] = useState(false)
  const now = useNow()

  function toggleTimeMode() {
    if (useCurrentTime) {
      const d = new Date()
      setDate(toDateInputValue(d))
      setTime(toTimeInputValue(d))
    }
    setUseCurrentTime(!useCurrentTime)
    setErrors((e) => clearError(e, 'measuredAt'))
  }

  function changeField(field: NumericField, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => clearError(e, field))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const draft = {
      measuredAt: useCurrentTime ? new Date() : fromDateTimeInputs(date, time),
      systolic: parseField(values.systolic),
      diastolic: parseField(values.diastolic),
      pulse: parseField(values.pulse),
      notes,
    }
    const found = validateMeasurement(draft)
    setErrors(found)
    if (hasErrors(found)) return

    setSaving(true)
    const saved = await onSave(toMeasurement(draft))
    setSaving(false)
    if (saved) {
      setValues(emptyFieldValues)
      setNotes('')
      setUseCurrentTime(true)
      ;(document.activeElement as HTMLElement | null)?.blur()
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <div className="when-row">
        <div>
          <div className="lbl">Fecha y hora</div>
          <div className="val">
            {useCurrentTime ? `${formatWeekdayDay(now)} · ${formatTime(now)}` : 'Fecha y hora manual'}
          </div>
        </div>
        <button className="link" type="button" onClick={toggleTimeMode}>
          {useCurrentTime ? 'Cambiar' : 'Usar hora actual'}
        </button>
        {!useCurrentTime && (
          <DateTimeInputs
            idPrefix="new"
            date={date}
            time={time}
            onChange={(d, t) => {
              setDate(d)
              setTime(t)
              setErrors((e) => clearError(e, 'measuredAt'))
            }}
          />
        )}
        {errors.measuredAt && <div className="when-msg">{errors.measuredAt}</div>}
      </div>

      <MeasurementFields idPrefix="new" values={values} errors={errors} onChange={changeField} />
      <NotesField id="new-notes" value={notes} onChange={setNotes} />

      <div className="form-save">
        <button className="btn primary" type="submit" disabled={saving}>
          GUARDAR MEDICIÓN
        </button>
      </div>
    </form>
  )
}
