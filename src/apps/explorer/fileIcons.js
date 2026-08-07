import { Folder, FileText, Image as ImageIcon, File as FileIcon } from 'lucide-react';

const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp']);
const TEXT_EXT = new Set(['txt', 'md', 'json', 'js', 'jsx', 'css', 'html', 'log']);

export function iconForEntry(entry) {
  if (entry.type === 'folder') return Folder;
  const ext = entry.name.split('.').pop()?.toLowerCase();
  if (IMAGE_EXT.has(ext)) return ImageIcon;
  if (TEXT_EXT.has(ext)) return FileText;
  return FileIcon;
}

export function isTextLike(entry) {
  if (entry.type !== 'file') return false;
  const ext = entry.name.split('.').pop()?.toLowerCase();
  return TEXT_EXT.has(ext) || !ext;
}
