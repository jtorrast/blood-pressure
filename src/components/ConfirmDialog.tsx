import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  title: string
  confirmLabel: string
  children: ReactNode
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({ title, confirmLabel, children, onCancel, onConfirm }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelRef.current?.focus()
  }, [])

  return (
    <div className="backdrop dialog-wrap" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <h3 id="confirm-title">{title}</h3>
        <p>{children}</p>
        <div className="acts">
          <button ref={cancelRef} className="btn ghost" type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn danger-solid" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
