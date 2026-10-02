interface Props {
  idPrefix: string
  date: string
  time: string
  onChange: (date: string, time: string) => void
}

export function DateTimeInputs({ idPrefix, date, time, onChange }: Props) {
  return (
    <div className="when-edit">
      <input
        id={`${idPrefix}-date`}
        type="date"
        aria-label="Fecha"
        value={date}
        onChange={(e) => onChange(e.target.value, time)}
      />
      <input
        id={`${idPrefix}-time`}
        type="time"
        aria-label="Hora"
        value={time}
        onChange={(e) => onChange(date, e.target.value)}
      />
    </div>
  )
}
