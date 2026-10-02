import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { BloodPressureMeasurement } from '../domain/measurement'
import type { MeasurementRepository } from './MeasurementRepository'

const DB_NAME = 'blood-pressure'
const DB_VERSION = 1
const STORE = 'measurements'

/** Formato almacenado: la fecha como timestamp para indexar y serializar sin ambigüedad. */
interface StoredMeasurement {
  id: string
  measuredAt: number
  systolic: number
  diastolic: number
  pulse: number
  notes?: string
}

interface BloodPressureDB extends DBSchema {
  [STORE]: {
    key: string
    value: StoredMeasurement
    indexes: { 'by-measuredAt': number }
  }
}

function openDatabase(): Promise<IDBPDatabase<BloodPressureDB>> {
  return openDB<BloodPressureDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(STORE, { keyPath: 'id' })
      store.createIndex('by-measuredAt', 'measuredAt')
    },
  })
}

function toStored(m: BloodPressureMeasurement): StoredMeasurement {
  return { ...m, measuredAt: m.measuredAt.getTime() }
}

function fromStored(s: StoredMeasurement): BloodPressureMeasurement {
  return { ...s, measuredAt: new Date(s.measuredAt) }
}

export function createIndexedDbRepository(): MeasurementRepository {
  let dbPromise: Promise<IDBPDatabase<BloodPressureDB>> | undefined
  const db = () => (dbPromise ??= openDatabase())

  return {
    async list() {
      const rows = await (await db()).getAllFromIndex(STORE, 'by-measuredAt')
      return rows.reverse().map(fromStored)
    },
    async get(id) {
      const row = await (await db()).get(STORE, id)
      return row && fromStored(row)
    },
    async save(measurement) {
      await (await db()).put(STORE, toStored(measurement))
    },
    async delete(id) {
      await (await db()).delete(STORE, id)
    },
  }
}

/**
 * Pide al navegador que no borre los datos locales por falta de espacio.
 * En una PWA instalada suele concederse; si no, la app funciona igual.
 */
export async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist()
    }
  } catch {
    // No es crítico.
  }
}
