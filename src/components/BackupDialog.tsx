import { useEffect, useRef, useState } from 'react'
import { BACKUP_EVERY } from '../data'

interface Props {
  onBackup: (dontAskAgain: boolean) => void
  onDismiss: (dontAskAgain: boolean) => void
}

/** Aviso que aparece cada BACKUP_EVERY mediciones nuevas. */
export function BackupDialog({ onBackup, onDismiss }: Props) {
  const [dontAskAgain, setDontAskAgain] = useState(false)
  const backupRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    backupRef.current?.focus()
  }, [])

  return (
    <div className="backdrop dialog-wrap">
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="backup-title">
        <h3 id="backup-title">¿Guardar una copia de seguridad?</h3>
        <p>
          Llevas {BACKUP_EVERY} mediciones nuevas desde la última copia. Guárdala en Archivos o en Descargas para
          poder recuperar los datos si se borra la app.
        </p>
        <label className="check">
          <input type="checkbox" checked={dontAskAgain} onChange={(e) => setDontAskAgain(e.target.checked)} />
          No volver a preguntar
        </label>
        <div className="acts">
          <button className="btn ghost" type="button" onClick={() => onDismiss(dontAskAgain)}>
            Ahora no
          </button>
          <button ref={backupRef} className="btn primary" type="button" onClick={() => onBackup(dontAskAgain)}>
            Guardar copia
          </button>
        </div>
      </div>
    </div>
  )
}
