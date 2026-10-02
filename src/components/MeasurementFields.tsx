import { useRef } from 'react'
import type { ValidationErrors } from '../domain/measurement'
import type { FieldValues, NumericField } from './fieldValues'

const FIELDS: { key: NumericField; label: string; unit: string; idSuffix: string }[] = [
  { key: 'systolic', label: 'Sistólica', unit: 'mmHg', idSuffix: 'sys' },
  { key: 'diastolic', label: 'Diastólica', unit: 'mmHg', idSuffix: 'dia' },
  { key: 'pulse', label: 'Pulso', unit: 'ppm', idSuffix: 'pul' },
]

/**
 * Un valor está completo con 3 cifras, o con 2 cifras si es ≥ 30
 * (un número menor solo puede ser el inicio de un valor de 100 o más).
 */
const isComplete = (value: string) => value.length === 3 || (value.length === 2 && Number(value) >= 30)

interface Props {
  idPrefix: string
  values: FieldValues
  errors: ValidationErrors
  onChange: (field: NumericField, value: string) => void
}

/** Sistólica, diastólica y pulso en una fila, con avance automático al siguiente campo. */
export function MeasurementFields({ idPrefix, values, errors, onChange }: Props) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const messages = FIELDS.map((f) => errors[f.key]).filter(Boolean)

  function handleChange(index: number, input: HTMLInputElement) {
    const value = input.value.replace(/\D/g, '').slice(0, 3)
    onChange(FIELDS[index].key, value)
    if (isComplete(value) && document.activeElement === input) {
      const next = inputs.current[index + 1]
      if (next) next.focus()
      else input.blur() // cierra el teclado tras el pulso
    }
  }

  return (
    <div className="trio">
      {FIELDS.map((f, i) => {
        const id = `${idPrefix}-${f.idSuffix}`
        return (
          <div key={f.key} className={errors[f.key] ? 'cell err' : 'cell'}>
            <label htmlFor={id}>
              {f.label} <small>{f.unit}</small>
            </label>
            <input
              ref={(el) => {
                inputs.current[i] = el
              }}
              id={id}
              className="num"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={3}
              autoComplete="off"
              placeholder="—"
              value={values[f.key]}
              aria-invalid={Boolean(errors[f.key])}
              onChange={(e) => handleChange(i, e.currentTarget)}
            />
          </div>
        )
      })}
      {messages.length > 0 && (
        <div className="trio-msg" role="alert">
          {messages.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      )}
    </div>
  )
}

