import { useState } from "react"
import { sourceCatalog, type SourceFile } from "virtual:source-catalog"
import { CodeBlock } from "./CodeBlock.tsx"

function fileName(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1)
}

function directoryOf(path: string): string {
  return path.slice(0, path.lastIndexOf("/"))
}

const ALL_FILES = sourceCatalog.flatMap((group) => group.files)

export function SourceExplorer() {
  const [chosenPath, setChosenPath] = useState<string | undefined>(undefined)
  // Começam recolhidos: a lista inteira de uma vez esconde a divisão por critério.
  const [expandedGroups, setExpandedGroups] = useState<readonly string[]>([])

  const openFile: SourceFile | undefined = ALL_FILES.find((file) => file.path === chosenPath) ?? ALL_FILES[0]

  function toggleGroup(label: string): void {
    setExpandedGroups((expanded) =>
      expanded.includes(label) ? expanded.filter((other) => other !== label) : [...expanded, label],
    )
  }

  return (
    <div className="source-explorer">
      <nav className="source-tree" aria-label="Arquivos da API">
        {sourceCatalog.map((group) => {
          const isExpanded = expandedGroups.includes(group.label)

          return (
            <div key={group.label} className="source-tree-group">
              <button
                type="button"
                className="source-tree-label"
                aria-expanded={isExpanded}
                onClick={() => toggleGroup(group.label)}
              >
                <span className={isExpanded ? "source-chevron source-chevron-open" : "source-chevron"} aria-hidden />
                {group.label}
              </button>

              {isExpanded
                ? group.files.map((file) => (
                    <button
                      key={file.path}
                      type="button"
                      className={
                        file.path === openFile?.path ? "source-tree-file source-tree-file-active" : "source-tree-file"
                      }
                      aria-current={file.path === openFile?.path ? "true" : undefined}
                      onClick={() => setChosenPath(file.path)}
                      title={file.path}
                    >
                      <span className="source-file-icon" aria-hidden>
                        TS
                      </span>
                      {fileName(file.path)}
                    </button>
                  ))
                : null}
            </div>
          )
        })}
      </nav>

      {openFile === undefined ? (
        <p className="source-empty">Nenhum arquivo no catálogo.</p>
      ) : (
        <div className="source-view">
          <p className="source-path">
            <span className="source-path-directory">{directoryOf(openFile.path)}/</span>
            {fileName(openFile.path)}
          </p>
          <CodeBlock content={openFile.content} />
        </div>
      )}
    </div>
  )
}
