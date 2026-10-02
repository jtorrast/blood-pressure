import { useEffect, useState } from 'react'
import { measurementRepository } from './data'

// Pantalla provisional: la interfaz validada en el prototipo llega en el siguiente paso.
export default function App() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    measurementRepository.list().then((list) => setCount(list.length))
  }, [])

  return (
    <main className="app">
      <h1>Tensión arterial</h1>
      <p>{count === null ? 'Cargando…' : `${count} mediciones guardadas en este dispositivo.`}</p>
    </main>
  )
}
