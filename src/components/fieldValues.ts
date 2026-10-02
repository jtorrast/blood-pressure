import type { MeasurementField, ValidationErrors } from '../domain/measurement'

/** Valores de los campos numéricos tal como se teclean. */
export interface FieldValues {
  systolic: string
  diastolic: string
  pulse: string
}

export type NumericField = keyof FieldValues

export const emptyFieldValues: FieldValues = { systolic: '', diastolic: '', pulse: '' }

export const parseField = (value: string): number | null => (value === '' ? null : Number(value))

/** Quita el error de un campo cuando el usuario lo corrige. */
export function clearError(errors: ValidationErrors, field: MeasurementField): ValidationErrors {
  const next = { ...errors }
  delete next[field]
  return next
}
