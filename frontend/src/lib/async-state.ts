/**
 * Estado de uma leitura assíncrona.
 *
 * União discriminada em vez de `items` + `isLoading` + `error` soltos: assim é
 * impossível representar combinações que não existem, como carregando e com
 * erro ao mesmo tempo, ou uma lista vazia que na verdade ainda nem chegou.
 */
export type AsyncState<Value> =
  | { status: "loading" }
  | { status: "success"; value: Value }
  | { status: "error"; message: string }
