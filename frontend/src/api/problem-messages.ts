/**
 * Traduz o erro da API para uma frase que o usuário entende.
 *
 * A API responde em inglês e no vocabulário do protocolo ("record", "resource",
 * "entity") porque o contrato dela é público e estável. Quem fala com pessoa é
 * a interface — e a chave dessa tradução é o campo `type` do Problem Details,
 * que existe justamente para o cliente tratar o erro sem depender do texto.
 */
const MESSAGE_BY_PROBLEM_TYPE: Record<string, string> = {
  "/problems/resource-in-use": "Não foi possível excluir: este cadastro ainda está sendo usado.",
  "/problems/resource-already-exists": "Já existe um cliente com esse e-mail.",
  "/problems/resource-not-found": "Este cadastro não existe mais. Atualize a página para ver a lista atual.",
  "/problems/malformed-request-body": "Não foi possível enviar os dados. Tente novamente.",
  "/problems/payload-too-large": "O conteúdo enviado é grande demais.",
  "/problems/unsupported-media-type": "Não foi possível enviar os dados. Tente novamente.",
  "/problems/method-not-allowed": "Esta ação não está disponível aqui.",
  "/problems/route-not-found": "Não foi possível falar com o servidor. Verifique se a API está no ar.",
  "/problems/internal-server-error": "Algo deu errado no servidor. Tente novamente em instantes.",
}

/** Como cada campo é chamado na tela — o mesmo rótulo que aparece no formulário. */
const LABEL_BY_FIELD: Record<string, string> = {
  fullName: "Nome completo",
  email: "E-mail",
  phoneNumber: "Telefone",
  id: "Identificador",
  body: "Formulário",
}

const FALLBACK_MESSAGE = "Não foi possível concluir a ação. Tente novamente."

function toFieldList(invalidFields: readonly string[]): string {
  const labels = [...new Set(invalidFields.map((field) => LABEL_BY_FIELD[field.split(".")[0] ?? ""] ?? field))]
  return labels.join(", ")
}

/**
 * Falha de validação nomeia os campos a corrigir; o motivo exato fica de fora
 * de propósito, porque a API o descreve em inglês e para quem programa.
 */
export function toUserMessage(problemType: string | undefined, invalidFields: readonly string[]): string {
  if (invalidFields.length > 0) {
    return `Confira estes campos: ${toFieldList(invalidFields)}.`
  }

  return (problemType === undefined ? undefined : MESSAGE_BY_PROBLEM_TYPE[problemType]) ?? FALLBACK_MESSAGE
}
