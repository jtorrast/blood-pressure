import { NUMERIC_COLUMNS, type PdfContent } from '../pdf/pdfContent'

/** Vista previa en HTML del contenido del PDF (mismos datos, maquetación adaptada al móvil). */
export function PdfPreview({ content }: { content: PdfContent }) {
  const align = (i: number) => (NUMERIC_COLUMNS.includes(i) ? 'n' : undefined)

  return (
    <div className="paper" aria-label="Vista previa del PDF">
      <h3>{content.title}</h3>
      <div className="paper-meta">
        {content.patientName && (
          <span>
            <b>Paciente:</b> {content.patientName}
          </span>
        )}
        {content.period && <span>Periodo: {content.period}</span>}
        <span>{content.generated}</span>
      </div>
      <table>
        <thead>
          <tr>
            {content.head.map((h, i) => (
              <th key={h} className={align(i)}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {content.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) => (
                <td key={i} className={align(i)}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
