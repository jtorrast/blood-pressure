export type ShareResult = 'shared' | 'downloaded' | 'cancelled'

/**
 * Abre el menú Compartir del sistema con el PDF (iOS 15+, Android Chrome).
 * Si el navegador no permite compartir archivos, lo descarga.
 * Debe llamarse directamente desde el gesto del usuario (un toque), sin esperas previas.
 */
export async function shareOrDownloadPdf(blob: Blob, fileName: string): Promise<ShareResult> {
  const file = new File([blob], fileName, { type: 'application/pdf' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Registro de tensión arterial' })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
      // Cualquier otro fallo: se intenta la descarga.
    }
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return 'downloaded'
}
