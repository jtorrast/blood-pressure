// Preferencias pequeñas del dispositivo. localStorage basta: si se pierden, solo hay que volver a escribirlas.
const PATIENT_NAME_KEY = 'bp.patientName'

export const settings = {
  getPatientName(): string {
    try {
      return localStorage.getItem(PATIENT_NAME_KEY) ?? ''
    } catch {
      return ''
    }
  },

  setPatientName(name: string): void {
    try {
      if (name.trim()) localStorage.setItem(PATIENT_NAME_KEY, name)
      else localStorage.removeItem(PATIENT_NAME_KEY)
    } catch {
      // Sin almacenamiento disponible: el nombre no se recordará.
    }
  },
}
