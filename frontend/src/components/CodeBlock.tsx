import Prism from "prismjs"
import "prismjs/components/prism-typescript"
import type { ReactNode } from "react"

/** Um trecho contíguo de texto com a classe de cor que o Prism atribuiu. */
interface StyledRun {
  text: string
  className: string | undefined
}

/** Achata a árvore de tokens em trechos, ficando com a classe mais interna. */
function toStyledRuns(tokens: (string | Prism.Token)[], inherited: string | undefined): StyledRun[] {
  return tokens.flatMap((token) => {
    if (typeof token === "string") {
      return [{ text: token, className: inherited }]
    }

    const className = `token ${token.type}`

    if (typeof token.content === "string") {
      return [{ text: token.content, className }]
    }

    return toStyledRuns(Array.isArray(token.content) ? token.content : [token.content], className)
  })
}

/**
 * Reparte os trechos em linhas.
 *
 * A tokenização é feita no arquivo inteiro, e não linha a linha, porque token
 * que atravessa quebras — um comentário de bloco, por exemplo — só é
 * reconhecido com o texto completo. O corte por linha vem depois, para que a
 * numeração continue existindo.
 */
function toLines(runs: StyledRun[]): StyledRun[][] {
  const lines: StyledRun[][] = [[]]

  for (const run of runs) {
    const pieces = run.text.split("\n")
    pieces.forEach((piece, index) => {
      if (index > 0) {
        lines.push([])
      }
      if (piece !== "") {
        lines[lines.length - 1]?.push({ text: piece, className: run.className })
      }
    })
  }

  return lines
}

function renderRun(run: StyledRun, key: number): ReactNode {
  return run.className === undefined ? (
    run.text
  ) : (
    <span key={key} className={run.className}>
      {run.text}
    </span>
  )
}

interface CodeBlockProps {
  content: string
}

export function CodeBlock({ content }: CodeBlockProps) {
  const lines = toLines(toStyledRuns(Prism.tokenize(content, Prism.languages["typescript"]!), undefined))

  return (
    <pre className="source-code">
      <code>
        {lines.map((runs, lineIndex) => (
          <span key={lineIndex} className="source-line">
            <span className="source-line-number">{lineIndex + 1}</span>
            <span className="source-line-text">{runs.map(renderRun)}</span>
          </span>
        ))}
      </code>
    </pre>
  )
}
