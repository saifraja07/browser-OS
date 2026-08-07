import { useWindowResize } from '../../hooks/useWindowResize';

const HANDLES = [
  { dir: 'n', className: 'inset-x-2 top-0 h-1.5 cursor-n-resize' },
  { dir: 's', className: 'inset-x-2 bottom-0 h-1.5 cursor-s-resize' },
  { dir: 'e', className: 'inset-y-2 right-0 w-1.5 cursor-e-resize' },
  { dir: 'w', className: 'inset-y-2 left-0 w-1.5 cursor-w-resize' },
  { dir: 'ne', className: 'right-0 top-0 h-3 w-3 cursor-ne-resize' },
  { dir: 'nw', className: 'left-0 top-0 h-3 w-3 cursor-nw-resize' },
  { dir: 'se', className: 'bottom-0 right-0 h-3 w-3 cursor-se-resize' },
  { dir: 'sw', className: 'bottom-0 left-0 h-3 w-3 cursor-sw-resize' },
];

function Handle({ windowId, dir, className }) {
  const { onPointerDown, onPointerMove, onPointerUp } = useWindowResize(windowId, dir);
  return (
    <div
      className={`absolute z-10 ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  );
}

export default function ResizeHandles({ windowId, resizable }) {
  if (!resizable) return null;
  return (
    <>
      {HANDLES.map((h) => (
        <Handle key={h.dir} windowId={windowId} dir={h.dir} className={h.className} />
      ))}
    </>
  );
}
