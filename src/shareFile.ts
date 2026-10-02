export type ShareResult = 'shared' | 'downloaded' | 'cancelled'

/**
 * Abre el menú Compartir del sistema con el archivo (iOS 15+, Android Chrome).
 * Si el navegador no permite compartir ese tipo de archivo, lo descarga
 * (en Android, a la carpeta Descargas).
 * Debe llamarse directamente desde el gesto del usuario (un toque), sin esperas previas.
 */
export async function shareOrDownloadFile(blob: Blob, fileName: string, title: string): Promise<ShareResult> {
  const file = new File([blob], fileName, { type: blob.type })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title })
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
