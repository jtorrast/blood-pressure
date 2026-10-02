import { useRef, useState, type ChangeEvent } from 'react'
import { BACKUP_EVERY, settings } from '../data'
import { formatDate, formatTime } from '../format'

interface Props {
  hasMeasurements: boolean
  lastBackupAt: Date | null
  onBackup: () => void
  onRestore: (file: File) => void
}

export function BackupSection({ hasMeasurements, lastBackupAt, onBackup, onRestore }: Props) {
  const [reminderOn, setReminderOn] = useState(settings.isBackupReminderOn)
  const fileInput = useRef<HTMLInputElement>(null)

  function toggleReminder(on: boolean) {
    setReminderOn(on)
    settings.setBackupReminderOn(on)
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // permite volver a elegir el mismo archivo
    if (file) onRestore(file)
  }

  return (
    <section className="card backup">
      <h3>Copia de seguridad</h3>
      <p className="hint">
        {lastBackupAt
          ? `Última copia: ${formatDate(lastBackupAt)} a las ${formatTime(lastBackupAt)}`
          : 'Aún no has hecho ninguna copia en este móvil.'}
      </p>
      <div className="backup-actions">
        <button className="btn ghost" type="button" disabled={!hasMeasurements} onClick={onBackup}>
          Hacer copia ahora
        </button>
        <button className="btn ghost" type="button" onClick={() => fileInput.current?.click()}>
          Restaurar copia
        </button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={handleFile}
      />
      <label className="check">
        <input type="checkbox" checked={reminderOn} onChange={(e) => toggleReminder(e.target.checked)} />
        Preguntar cada {BACKUP_EVERY} mediciones
      </label>
    </section>
  )
}
