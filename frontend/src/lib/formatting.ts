/** Formata em reais sem depender do locale do ambiente: "R$ 320,50". */
export function formatCurrency(amountInReais: number): string {
  return `R$ ${amountInReais.toFixed(2).replace(".", ",")}`
}

export function formatDuration(minutes: number): string {
  return `${minutes} min`
}

/** Data e hora local no formato brasileiro: "15/09/2026 10:30". */
export function formatDateTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp)
  const pad = (value: number): string => String(value).padStart(2, "0")
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * Converte o valor de um `<input type="datetime-local">` (sem fuso) para ISO 8601
 * em UTC, que é o que a API exige. `new Date` interpreta a string como hora
 * local, então o deslocamento do navegador é aplicado corretamente.
 */
export function toIsoTimestamp(localDateTimeValue: string): string {
  return new Date(localDateTimeValue).toISOString()
}

/** Caminho inverso: ISO da API para o formato que o input entende. */
export function toLocalDateTimeValue(isoTimestamp: string): string {
  const date = new Date(isoTimestamp)
  const pad = (value: number): string => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
