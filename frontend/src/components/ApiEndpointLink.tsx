interface ApiEndpointLinkProps {
  path: string
}

/**
 * Mostra o endereço da API que alimenta esta tela, para consulta direta.
 *
 * O `href` é relativo de propósito: assim o link funciona tanto no modo
 * demonstração (tudo na 3000) quanto em desenvolvimento (o Vite encaminha da
 * 5173 para a API). O texto exibe o endereço completo da janela atual, que é o
 * que a pessoa vai ver na barra ao abrir.
 */
export function ApiEndpointLink({ path }: ApiEndpointLinkProps) {
  return (
    <p className="api-endpoint">
      <span className="api-endpoint-label">Endpoint</span>
      <a href={path} target="_blank" rel="noreferrer">
        {window.location.origin}
        {path}
      </a>
    </p>
  )
}
