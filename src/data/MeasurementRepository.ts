import type { BloodPressureMeasurement } from '../domain/measurement'

/**
 * Contrato de persistencia. La UI solo depende de esta interfaz, de modo que
 * IndexedDB puede sustituirse o complementarse con otro almacenamiento.
 */
export interface MeasurementRepository {
  /** Todas las mediciones, de la más reciente a la más antigua. */
  list(): Promise<BloodPressureMeasurement[]>
  get(id: string): Promise<BloodPressureMeasurement | undefined>
  /** Crea la medición o la sobrescribe si ya existe una con el mismo id. */
  save(measurement: BloodPressureMeasurement): Promise<void>
  delete(id: string): Promise<void>
}
