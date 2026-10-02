interface Props {
  id: string
  value: string
  rows?: number
  onChange: (value: string) => void
}

export function NotesField({ id, value, rows = 1, onChange }: Props) {
  return (
    <div className="notes">
      <label htmlFor={id}>
        Observaciones <small>(opcional)</small>
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder="Ej.: brazo izquierdo, tras caminar"
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => {
          // Espera a que aparezca el teclado y deja el campo a la vista.
          const el = e.currentTarget
          setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300)
        }}
      />
    </div>
  )
}
