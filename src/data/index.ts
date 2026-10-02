import { createIndexedDbRepository } from './indexedDbRepository'
import type { MeasurementRepository } from './MeasurementRepository'

/** Único punto donde se elige la implementación de persistencia. */
export const measurementRepository: MeasurementRepository = createIndexedDbRepository()

export type { MeasurementRepository }
export { requestPersistentStorage } from './indexedDbRepository'
export { BACKUP_EVERY, settings } from './settings'
export { createBackupFile, InvalidBackupError, parseBackup } from './backup'
