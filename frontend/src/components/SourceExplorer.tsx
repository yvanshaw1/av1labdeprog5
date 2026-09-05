import { useState } from "react"
import { sourceCatalog, type SourceFile } from "virtual:source-catalog"

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
  const firstFile = groups[0]?.files[0]
  const [openPath, setOpenPath] = useState<string | undefined>(firstFile?.path)

  const openFile: SourceFile | undefined = groups
    .flatMap((group) => group.files)
    .find((file) => file.path === openPath)

  return (
    <div className="source-explorer">
      <nav className="source-tree" aria-label="Arquivos deste recurso">
        {groups.map((group) => (
          <div key={group.label} className="source-tree-group">
            <p className="source-tree-label">{group.label}</p>
            {group.files.map((file) => (
              <button
                key={file.path}
                type="button"
                className={file.path === openPath ? "source-tree-file source-tree-file-active" : "source-tree-file"}
                aria-current={file.path === openPath ? "true" : undefined}
                onClick={() => setOpenPath(file.path)}
                title={file.path}
              >
                {fileName(file.path)}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {openFile === undefined ? (
        <p className="source-empty">Selecione um arquivo.</p>
      ) : (
        <div className="source-view">
          <p className="source-path">
            <span className="source-path-directory">{directoryOf(openFile.path)}/</span>
            {fileName(openFile.path)}
          </p>
          <pre className="source-code">
            <code>
              {openFile.content.split("\n").map((line, index) => (
                // A lista é estática e nunca reordena: o número da linha é o índice.
                <span key={index} className="source-line">
                  <span className="source-line-number">{index + 1}</span>
                  <span className="source-line-text">{line}</span>
                </span>
              ))}
            </code>
          </pre>
        </div>
      )}
    </div>
  )
}
