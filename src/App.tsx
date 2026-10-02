import { useCallback, useEffect, useRef, useState } from 'react'
import { EditSheet } from './components/EditSheet'
import { HistoryScreen } from './components/HistoryScreen'
import { MeasurementList } from './components/MeasurementList'
import { NewMeasurementForm } from './components/NewMeasurementForm'
import { PdfScreen } from './components/PdfScreen'
import { Toast } from './components/Toast'
import type { BloodPressureMeasurement } from './domain/measurement'
import { useMeasurements } from './useMeasurements'

const RECENT_COUNT = 3

export default function App() {
  const { measurements, loadError, save, remove } = useMeasurements()
  const [screen, setScreen] = useState<'main' | 'history' | 'pdf'>('main')
  const [editing, setEditing] = useState<BloodPressureMeasurement | null>(null)
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)

  const notify = useCallback((text: string) => setToast({ id: Date.now(), text }), [])

  // El botón "atrás" de Android (y el gesto de iOS) cierra primero el panel de edición,
  // después la pantalla del PDF y luego el historial, en lugar de salir de la app. Cada capa abierta añade una
  // entrada al historial del navegador; los botones de cerrar llaman a history.back().
  const layers = useRef({ screen, editing })
  useEffect(() => {
    layers.current = { screen, editing }
  }, [screen, editing])
  useEffect(() => {
    const onPopState = () => {
      const { editing, screen } = layers.current
      if (editing) setEditing(null)
      else if (screen === 'pdf') setScreen('history')
      else if (screen === 'history') setScreen('main')
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const goBack = () => history.back()

  function openScreen(next: 'history' | 'pdf') {
    history.pushState({ layer: next }, '')
    setScreen(next)
  }

  function openEdit(m: BloodPressureMeasurement) {
    history.pushState({ layer: 'edit' }, '')
    setEditing(m)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
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
      {screen === 'pdf' ? (
        <main className="app">
          <PdfScreen measurements={list} onBack={goBack} notify={notify} />
        </main>
      ) : screen === 'history' ? (
        <main className="app">
          <HistoryScreen
            measurements={list}
            onBack={goBack}
            onOpenPdf={() => openScreen('pdf')}
            onSelect={openEdit}
          />
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

          <button className="all-btn" type="button" onClick={() => openScreen('history')}>
            Historial completo y PDF <span>{list.length === 1 ? '1 medición' : `${list.length} mediciones`}</span>
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
