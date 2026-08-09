import { useState } from 'react';
import { ArrowLeft, ArrowUp, FolderPlus, FilePlus, Trash2, Pencil } from 'lucide-react';
import { virtualFS } from '../../core/filesystem/virtualFS';
import { joinPath } from '../../core/filesystem/pathUtils';
import { uniqueName } from '../../utils/uniqueName';
import { useContextMenuStore } from '../../store/useContextMenuStore';
import { notify } from '../../store/useNotificationStore';
import { useExplorerNav } from './hooks/useExplorerNav';
import { isTextLike } from './fileIcons';
import Breadcrumb from '../../components/shared/Breadcrumb';
import FileRow from './FileRow';
import TextEditorPane from './TextEditorPane';

export default function ExplorerApp() {
  const { path, entries, loading, canGoBack, navigate, goBack, goUp } = useExplorerNav('/');
  const [selectedName, setSelectedName] = useState(null);
  const [renamingName, setRenamingName] = useState(null);
  const [openFile, setOpenFile] = useState(null); // { path, name } | null
  const openMenu = useContextMenuStore((s) => s.open);

  const existingNames = entries.map((e) => e.name);

  const createFolder = async () => {
    const name = uniqueName('New Folder', existingNames);
    await virtualFS.mkdir(joinPath(path, name));
    setRenamingName(name);
    setSelectedName(name);
  };

  const createFile = async () => {
    const name = uniqueName('New File.txt', existingNames);
    await virtualFS.writeFile(joinPath(path, name), '');
    setRenamingName(name);
    setSelectedName(name);
  };

  const deleteEntry = async (entry) => {
    try {
      await virtualFS.delete(joinPath(path, entry.name), { recursive: entry.type === 'folder' });
      notify({ title: 'Deleted', message: entry.name });
    } catch (err) {
      notify({ title: 'Could not delete', message: err.message });
    }
  };

  const openEntry = (entry) => {
    if (entry.type === 'folder') {
      navigate(joinPath(path, entry.name));
      return;
    }
    if (isTextLike(entry)) {
      setOpenFile({ path: joinPath(path, entry.name), name: entry.name });
    } else {
      notify({ title: 'Cannot preview', message: `No viewer registered for "${entry.name}" yet.` });
    }
  };

  const handleRowContextMenu = (e, entry) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedName(entry.name);
    openMenu(e.clientX, e.clientY, [
      { id: 'open', label: entry.type === 'folder' ? 'Open' : 'Open / Preview', icon: entry.type === 'folder' ? ArrowUp : FilePlus, onSelect: () => openEntry(entry) },
      { id: 'rename', label: 'Rename', icon: Pencil, onSelect: () => setRenamingName(entry.name) },
      { id: 'delete', label: 'Delete', icon: Trash2, onSelect: () => deleteEntry(entry) },
    ]);
  };

  const handleBackgroundContextMenu = (e) => {
    e.preventDefault();
    setSelectedName(null);
    openMenu(e.clientX, e.clientY, [
      { id: 'new-folder', label: 'New Folder', icon: FolderPlus, onSelect: createFolder },
      { id: 'new-file', label: 'New File', icon: FilePlus, onSelect: createFile },
    ]);
  };

  if (openFile) {
    return <TextEditorPane path={openFile.path} name={openFile.name} onClose={() => setOpenFile(null)} />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b-2 border-os-border px-2 py-1.5">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className="rounded p-1 text-os-ink-soft enabled:hover:bg-os-surface-2 enabled:hover:text-os-ink disabled:opacity-30"
          aria-label="Back"
        >
          <ArrowLeft size={15} />
        </button>
        <button
          onClick={goUp}
          disabled={path === '/'}
          className="rounded p-1 text-os-ink-soft enabled:hover:bg-os-surface-2 enabled:hover:text-os-ink disabled:opacity-30"
          aria-label="Up a level"
        >
          <ArrowUp size={15} />
        </button>
        <Breadcrumb path={path} onNavigate={navigate} />
        <div className="flex-1" />
        <button
          onClick={createFolder}
          className="rounded p-1 text-os-ink-soft hover:bg-os-surface-2 hover:text-os-ink"
          aria-label="New folder"
        >
          <FolderPlus size={15} />
        </button>
        <button
          onClick={createFile}
          className="rounded p-1 text-os-ink-soft hover:bg-os-surface-2 hover:text-os-ink"
          aria-label="New file"
        >
          <FilePlus size={15} />
        </button>
      </div>

      <div
        onClick={() => setSelectedName(null)}
        onContextMenu={handleBackgroundContextMenu}
        className="flex-1 overflow-auto p-2"
      >
        {loading ? (
          <p className="p-3 font-mono text-xs text-os-ink-soft">loading…</p>
        ) : entries.length === 0 ? (
          <p className="p-3 font-mono text-xs text-os-ink-soft">This folder is empty.</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {entries.map((entry) => (
              <FileRow
                key={entry.id}
                entry={entry}
                isSelected={selectedName === entry.name}
                isRenaming={renamingName === entry.name}
                onOpen={openEntry}
                onContextMenu={handleRowContextMenu}
                onRenameCommit={async (newName) => {
                  await virtualFS.rename(joinPath(path, entry.name), newName);
                  setRenamingName(null);
                  setSelectedName(newName);
                }}
                onRenameCancel={() => setRenamingName(null)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
