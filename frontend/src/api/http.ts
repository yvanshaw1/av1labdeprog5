import { toUserMessage } from "./problem-messages.ts"

/** Corpo de erro da API, no formato Problem Details (RFC 9457). */
interface ProblemDetail {
  type?: string
  errors?: { field: string; message: string }[]
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

const NETWORK_FAILURE_STATUS = 0

/**
 * Falha de rede não tem Problem Details: o `fetch` rejeita antes de existir
 * resposta. Sem este tratamento, a tela mostraria o "Failed to fetch" do
 * navegador — em inglês e sem dizer o que fazer.
 */
async function send(path: string, method: string, body: unknown): Promise<Response> {
  try {
    return await fetch(path, {
      method,
      ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    })
  } catch {
    throw new ApiError("Não foi possível falar com o servidor. Verifique se a API está no ar.", NETWORK_FAILURE_STATUS)
  }
}

export async function requestJson<ResponseBody>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<ResponseBody> {
  const response = await send(path, method, body)

  if (!response.ok) {
    const problemDetail = (await response.json().catch(() => ({}))) as ProblemDetail
    const invalidFields = (problemDetail.errors ?? []).map((issue) => issue.field)
    throw new ApiError(toUserMessage(problemDetail.type, invalidFields), response.status)
  }

  // 204 No Content não tem corpo para desserializar.
  if (response.status === 204) {
    return undefined as ResponseBody
  }

  return (await response.json()) as ResponseBody
}
