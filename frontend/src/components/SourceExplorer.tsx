import { useState } from "react"
import { sourceCatalog, type SourceFile } from "virtual:source-catalog"
import { CodeBlock } from "./CodeBlock.tsx"

interface SourceExplorerProps {
  /** Recurso da aba ativa: "clients", "vehicles", "services" ou "appointments". */
  resource: string
}

function fileName(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1)
}

function directoryOf(path: string): string {
  return path.slice(0, path.lastIndexOf("/"))
}

export function SourceExplorer({ resource }: SourceExplorerProps) {
  const groups = sourceCatalog[resource] ?? []
  const [openPath, setOpenPath] = useState<string | undefined>(groups[0]?.files[0]?.path)
  const [collapsedGroups, setCollapsedGroups] = useState<readonly string[]>([])

  const openFile: SourceFile | undefined = groups
    .flatMap((group) => group.files)
    .find((file) => file.path === openPath)

  function toggleGroup(label: string): void {
    setCollapsedGroups((collapsed) =>
      collapsed.includes(label) ? collapsed.filter((other) => other !== label) : [...collapsed, label],
    )
  }

  return (
    <div className="source-explorer">
      <nav className="source-tree" aria-label="Arquivos da API deste recurso">
        {groups.map((group) => {
          const isCollapsed = collapsedGroups.includes(group.label)

          return (
            <div key={group.label} className="source-tree-group">
              <button
                type="button"
                className="source-tree-label"
                aria-expanded={!isCollapsed}
                onClick={() => toggleGroup(group.label)}
              >
                <span className={isCollapsed ? "source-chevron" : "source-chevron source-chevron-open"} aria-hidden />
                {group.label}
              </button>

              {isCollapsed
                ? null
                : group.files.map((file) => (
                    <button
                      key={file.path}
                      type="button"
                      className={
                        file.path === openPath ? "source-tree-file source-tree-file-active" : "source-tree-file"
                      }
                      aria-current={file.path === openPath ? "true" : undefined}
                      onClick={() => setOpenPath(file.path)}
                      title={file.path}
                    >
                      <span className="source-file-icon" aria-hidden>
                        TS
                      </span>
                      {fileName(file.path)}
                    </button>
                  ))}
            </div>
          )
        })}
      </nav>

      {openFile === undefined ? (
        <p className="source-empty">Selecione um arquivo.</p>
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
