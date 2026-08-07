import { AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useWindowStore, selectWindowIds } from '../../store/useWindowStore';
import WindowFrame from './WindowFrame';

export default function WindowManagerRoot() {
  const windowIds = useWindowStore(
    useShallow(selectWindowIds)
  );

  return (
    <AnimatePresence>
      {windowIds.map((id) => (
        <WindowFrame key={id} id={id} />
      ))}
    </AnimatePresence>
  );
}