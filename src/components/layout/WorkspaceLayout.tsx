import { useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { APP_NAME } from "../../shared/constants/app";
import { basename } from "../../shared/utils/path";
import { openDocumentPicker } from "../../features/documents/openDocument";
import styles from "./WorkspaceLayout.module.css";

/**
 * The primary workspace shell: a top toolbar, three resizable columns
 * (left sidebar, document viewer, right sidebar) and a bottom AI chat bar.
 * Layout spec: AGENTS.md §5.1.
 */
export function WorkspaceLayout() {
  const [documentPath, setDocumentPath] = useState<string | null>(null);

  async function handleOpenFile() {
    const path = await openDocumentPicker();
    if (path) {
      setDocumentPath(path);
    }
  }

  return (
    <div className={styles.workspace}>
      <header className={styles.toolbar}>
        <span className={styles.brand}>{APP_NAME}</span>
        <nav className={styles.toolbarActions} aria-label="Workspace actions">
          <button type="button">Workspace</button>
          <button type="button" onClick={handleOpenFile}>
            Open File
          </button>
          <button type="button">Search</button>
          <button type="button">AI Provider</button>
        </nav>
      </header>

      <Group orientation="horizontal" style={{ flex: "1 1 0%", minHeight: 0 }}>
        <Panel id="left-sidebar" defaultSize="20" minSize="14" maxSize="34">
          <Sidebar
            title="Left Sidebar"
            items={["Daily Tasks", "File Library", "Document List"]}
          />
        </Panel>

        <Separator id="left-separator" className={styles.handle} />

        <Panel id="document-viewer" minSize="40">
          {documentPath ? (
            <div className={styles.viewer}>
              <h2>{basename(documentPath)}</h2>
              <p className={styles.viewerPath}>{documentPath}</p>
            </div>
          ) : (
            <div className={styles.viewer}>
              <h2>Document Viewer</h2>
              <p>No document open</p>
            </div>
          )}
        </Panel>

        <Separator id="right-separator" className={styles.handle} />

        <Panel id="right-sidebar" defaultSize="20" minSize="14" maxSize="34">
          <Sidebar
            title="Right Sidebar"
            items={["AI Notes", "User Notes", "Highlights"]}
          />
        </Panel>
      </Group>

      <footer className={styles.chatbar}>
        <span>AI Chat — Current Document + Page + Selected Text</span>
      </footer>
    </div>
  );
}

interface SidebarProps {
  title: string;
  items: string[];
}

function Sidebar({ title, items }: SidebarProps) {
  return (
    <section className={styles.sidebar}>
      <h2 className={styles.sidebarTitle}>{title}</h2>
      <ul className={styles.sidebarList}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
