// Preferencias pequeñas del dispositivo. localStorage basta: si se pierden, solo hay que volver a configurarlas.
const PATIENT_NAME_KEY = 'bp.patientName'
const LAST_BACKUP_KEY = 'bp.lastBackupAt'
const SINCE_BACKUP_KEY = 'bp.newSinceBackup'
const BACKUP_REMINDER_OFF_KEY = 'bp.backupReminderOff'

/** Cada cuántas mediciones nuevas se pregunta por la copia de seguridad. */
export const BACKUP_EVERY = 5

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Sin almacenamiento disponible: la preferencia no se recordará.
  }
}

export const settings = {
  getPatientName(): string {
    return read(PATIENT_NAME_KEY) ?? ''
  },

  setPatientName(name: string): void {
    write(PATIENT_NAME_KEY, name.trim() ? name : null)
  },

  getLastBackupAt(): Date | null {
    const value = read(LAST_BACKUP_KEY)
    return value ? new Date(value) : null
  },

  isBackupReminderOn(): boolean {
    return read(BACKUP_REMINDER_OFF_KEY) !== '1'
  },

  setBackupReminderOn(on: boolean): void {
    write(BACKUP_REMINDER_OFF_KEY, on ? null : '1')
  },

  /** Anota una medición nueva. Devuelve true cuando toca preguntar por la copia. */
  countNewMeasurement(): boolean {
    const count = Number(read(SINCE_BACKUP_KEY) ?? 0) + 1
    if (count >= BACKUP_EVERY && this.isBackupReminderOn()) {
      write(SINCE_BACKUP_KEY, '0')
      return true
    }
    write(SINCE_BACKUP_KEY, String(count))
    return false
  },

  markBackupDone(at = new Date()): void {
    write(LAST_BACKUP_KEY, at.toISOString())
    write(SINCE_BACKUP_KEY, '0')
  },
}
