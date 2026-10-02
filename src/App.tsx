import { useCallback, useEffect, useRef, useState } from 'react'
import { EditSheet } from './components/EditSheet'
import { HistoryScreen } from './components/HistoryScreen'
import { MeasurementList } from './components/MeasurementList'
import { NewMeasurementForm } from './components/NewMeasurementForm'
import { Toast } from './components/Toast'
import type { BloodPressureMeasurement } from './domain/measurement'
import { useMeasurements } from './useMeasurements'

const RECENT_COUNT = 3

export default function App() {
  const { measurements, loadError, save, remove } = useMeasurements()
  const [screen, setScreen] = useState<'main' | 'history'>('main')
  const [editing, setEditing] = useState<BloodPressureMeasurement | null>(null)
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)

  const notify = useCallback((text: string) => setToast({ id: Date.now(), text }), [])

  // El botón "atrás" de Android (y el gesto de iOS) cierra primero el panel de edición
  // y después el historial, en lugar de salir de la app. Cada capa abierta añade una
  // entrada al historial del navegador; los botones de cerrar llaman a history.back().
  const layers = useRef({ screen, editing })
  useEffect(() => {
    layers.current = { screen, editing }
  }, [screen, editing])
  useEffect(() => {
    const onPopState = () => {
      if (layers.current.editing) setEditing(null)
      else if (layers.current.screen === 'history') setScreen('main')
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const goBack = () => history.back()

  function openHistory() {
    history.pushState({ layer: 'history' }, '')
    setScreen('history')
    window.scrollTo(0, 0)
  }

  function openEdit(m: BloodPressureMeasurement) {
    history.pushState({ layer: 'edit' }, '')
    setEditing(m)
  }

  useEffect(() => {
    if (screen === 'main') window.scrollTo(0, 0)
  }, [screen])

  async function handleCreate(m: BloodPressureMeasurement) {
    try {
      await save(m)
      notify(`Medición guardada · ${m.systolic}/${m.diastolic}, ${m.pulse} ppm`)
      return true
    } catch {
      notify('No se pudo guardar. Inténtalo de nuevo.')
      return false
    }
  }

  async function handleUpdate(m: BloodPressureMeasurement) {
    try {
      await save(m)
      goBack()
      notify('Cambios guardados')
    } catch {
      notify('No se pudieron guardar los cambios. Inténtalo de nuevo.')
    }
  }

  async function handleDelete(id: string) {
    try {
      await remove(id)
      goBack()
      notify('Medición eliminada')
    } catch {
      notify('No se pudo eliminar. Inténtalo de nuevo.')
    }
  }

  const list = measurements ?? []

  return (
    <>
      {screen === 'history' ? (
        <main className="app">
          <HistoryScreen measurements={list} onBack={goBack} onSelect={openEdit} />
        </main>
      ) : (
        <main className="app">
          <header className="top">
            <h1>Tensión arterial</h1>
          </header>

          <NewMeasurementForm onSave={handleCreate} />

          <div className="section-h">
            <h2>Últimas mediciones</h2>
          </div>
          {loadError ? (
            <div className="card">
              <div className="empty">No se pudieron cargar las mediciones guardadas. Cierra y vuelve a abrir la app.</div>
            </div>
          ) : measurements === null ? null : list.length === 0 ? (
            <div className="card">
              <div className="empty">Aún no hay mediciones. La primera que guardes aparecerá aquí.</div>
            </div>
          ) : (
            <MeasurementList measurements={list.slice(0, RECENT_COUNT)} showDate onSelect={openEdit} />
          )}

          <button className="all-btn" type="button" onClick={openHistory}>
            Historial completo <span>{list.length === 1 ? '1 medición' : `${list.length} mediciones`}</span>
          </button>
        </main>
      )}

      {editing && (
        <EditSheet
          key={editing.id}
          measurement={editing}
          onSave={handleUpdate}
          onDelete={handleDelete}
          onClose={goBack}
        />
      )}

      {toast && <Toast key={toast.id} text={toast.text} />}
    </>
  )
}
