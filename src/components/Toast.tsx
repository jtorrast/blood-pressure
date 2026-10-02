/** Aviso breve. Se monta de nuevo con cada mensaje (key) y la animación CSS lo oculta sola. */
export function Toast({ text }: { text: string }) {
  return (
    <div className="toast" role="status" aria-live="polite">
      {text}
    </div>
  )
}
