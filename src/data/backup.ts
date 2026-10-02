import { hasErrors, validateMeasurement, type BloodPressureMeasurement } from '../domain/measurement'
import { toDateInputValue } from '../format'

/** Formato del archivo de copia. `version` permite cambiarlo en el futuro sin romper copias antiguas. */
interface BackupFile {
  app: 'blood-pressure'
  version: 1
  exportedAt: string
  measurements: {
    id: string
    measuredAt: string
    systolic: number
    diastolic: number
    pulse: number
    notes?: string
  }[]
}

export function createBackupFile(measurements: BloodPressureMeasurement[], now = new Date()) {
  const content: BackupFile = {
    app: 'blood-pressure',
    version: 1,
    exportedAt: now.toISOString(),
    measurements: measurements.map((m) => ({ ...m, measuredAt: m.measuredAt.toISOString() })),
  }
  return {
    blob: new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' }),
    fileName: `tension-copia-${toDateInputValue(now)}.json`,
  }
}

export class InvalidBackupError extends Error {}

/** Lee un archivo de copia. Lanza InvalidBackupError si no es una copia de esta app o está dañada. */
export function parseBackup(text: string): BloodPressureMeasurement[] {
  let data: Partial<BackupFile>
  try {
    data = JSON.parse(text)
  } catch {
    throw new InvalidBackupError('El archivo no es una copia de seguridad válida.')
  }
  if (data?.app !== 'blood-pressure' || data.version !== 1 || !Array.isArray(data.measurements)) {
    throw new InvalidBackupError('El archivo no es una copia de seguridad de esta app.')
  }

  return data.measurements.map((raw) => {
    const measurement: BloodPressureMeasurement = {
      id: String(raw.id),
      measuredAt: new Date(raw.measuredAt),
      systolic: Number(raw.systolic),
      diastolic: Number(raw.diastolic),
      pulse: Number(raw.pulse),
      ...(raw.notes ? { notes: String(raw.notes) } : {}),
    }
    // Sin comprobar "fecha futura": la copia puede venir de un móvil con otra hora.
    const errors = validateMeasurement(measurement, new Date(8.64e15))
    if (!raw.id || hasErrors(errors)) throw new InvalidBackupError('La copia de seguridad está dañada.')
    return measurement
  })
}
