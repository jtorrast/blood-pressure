// Formatos de fecha y hora en español de España, 24 h.
const LOCALE = 'es-ES'

const timeFormat = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
const dateFormat = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric' })
const weekdayFormat = new Intl.DateTimeFormat(LOCALE, { weekday: 'long' })
const monthShortFormat = new Intl.DateTimeFormat(LOCALE, { month: 'short' })
const longDayFormat = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' })
const mediumDateFormat = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' })

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/** "10:42" */
export const formatTime = (d: Date) => timeFormat.format(d)

/** "02/10/2026" */
export const formatDate = (d: Date) => dateFormat.format(d)

/** "Viernes 2 oct" */
export const formatWeekdayDay = (d: Date) =>
  `${capitalize(weekdayFormat.format(d))} ${d.getDate()} ${monthShortFormat.format(d).replace('.', '')}`

/** "Viernes, 2 de octubre" */
export const formatLongDay = (d: Date) => capitalize(longDayFormat.format(d))

/** "2 oct 2026" */
export const formatMediumDate = (d: Date) => mediumDateFormat.format(d).replace('.', '')

const pad = (n: number) => String(n).padStart(2, '0')

/** Valor para <input type="date">: "2026-10-02" (hora local). */
export const toDateInputValue = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** Valor para <input type="time">: "10:42" (hora local). */
export const toTimeInputValue = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

/** Combina los valores de los inputs de fecha y hora. Devuelve null si falta alguno. */
export function fromDateTimeInputs(date: string, time: string): Date | null {
  if (!date || !time) return null
  const [y, m, d] = date.split('-').map(Number)
  const [h, min] = time.split(':').map(Number)
  return new Date(y, m - 1, d, h, min)
}
