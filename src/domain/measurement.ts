export interface BloodPressureMeasurement {
  id: string
  measuredAt: Date
  systolic: number
  diastolic: number
  pulse: number
  notes?: string
}

/** Valores tal como llegan del formulario: un campo vacío es null. */
export interface MeasurementDraft {
  measuredAt: Date | null
  systolic: number | null
  diastolic: number | null
  pulse: number | null
  notes?: string
}

export type MeasurementField = 'measuredAt' | 'systolic' | 'diastolic' | 'pulse'
export type ValidationErrors = Partial<Record<MeasurementField, string>>

/** Rangos físicamente plausibles. Solo detectan errores de tecleo; no clasifican la medición. */
export const LIMITS = {
  systolic: { min: 50, max: 300, label: 'la sistólica' },
  diastolic: { min: 30, max: 200, label: 'la diastólica' },
  pulse: { min: 30, max: 250, label: 'el pulso' },
} as const

/** Margen para no rechazar una hora "actual" por diferencias de segundos. */
const FUTURE_TOLERANCE_MS = 60_000

export function validateMeasurement(draft: MeasurementDraft, now = new Date()): ValidationErrors {
  const errors: ValidationErrors = {}

  for (const field of ['systolic', 'diastolic', 'pulse'] as const) {
    const value = draft[field]
    const { min, max, label } = LIMITS[field]
    if (value === null || Number.isNaN(value)) {
      errors[field] = `Falta ${label}.`
    } else if (!Number.isInteger(value) || value < min || value > max) {
      errors[field] = `${capitalize(label)} debe estar entre ${min} y ${max}.`
    }
  }

  if (!errors.systolic && !errors.diastolic && draft.systolic! <= draft.diastolic!) {
    errors.diastolic = 'La diastólica debe ser menor que la sistólica. Revisa si están intercambiadas.'
  }

  if (!draft.measuredAt || Number.isNaN(draft.measuredAt.getTime())) {
    errors.measuredAt = 'Indica fecha y hora.'
  } else if (draft.measuredAt.getTime() > now.getTime() + FUTURE_TOLERANCE_MS) {
    errors.measuredAt = 'La fecha no puede ser posterior a ahora.'
  }

  return errors
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

/**
 * Construye una medición a partir de un borrador ya validado.
 * Si se pasa `id`, conserva el de una medición existente (edición).
 */
export function toMeasurement(draft: MeasurementDraft, id: string = crypto.randomUUID()): BloodPressureMeasurement {
  const notes = draft.notes?.trim()
  return {
    id,
    measuredAt: draft.measuredAt!,
    systolic: draft.systolic!,
    diastolic: draft.diastolic!,
    pulse: draft.pulse!,
    ...(notes ? { notes } : {}),
  }
}

export function sortMostRecentFirst(list: BloodPressureMeasurement[]): BloodPressureMeasurement[] {
  return [...list].sort((a, b) => b.measuredAt.getTime() - a.measuredAt.getTime())
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
