import { useCallback, useEffect, useState } from 'react'
import { measurementRepository, type MeasurementRepository } from './data'
import type { BloodPressureMeasurement } from './domain/measurement'

/** Estado de las mediciones para la UI. `measurements` es null mientras carga. */
export function useMeasurements(repository: MeasurementRepository = measurementRepository) {
  const [measurements, setMeasurements] = useState<BloodPressureMeasurement[] | null>(null)
  const [loadError, setLoadError] = useState(false)

  const reload = useCallback(async () => {
    setMeasurements(await repository.list())
  }, [repository])

  useEffect(() => {
    repository
      .list()
      .then(setMeasurements)
      .catch(() => setLoadError(true))
  }, [repository])

  const save = useCallback(
    async (measurement: BloodPressureMeasurement) => {
      await repository.save(measurement)
      await reload()
    },
    [repository, reload],
  )

  const remove = useCallback(
    async (id: string) => {
      await repository.delete(id)
      await reload()
    },
    [repository, reload],
  )

  return { measurements, loadError, save, remove }
}
