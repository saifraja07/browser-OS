import { AnimatePresence } from 'framer-motion';
import { useNotificationStore, selectNotificationOrder } from '../../store/useNotificationStore';
import NotificationToast from './NotificationToast';

export default function NotificationCenter() {
  const order = useNotificationStore(selectNotificationOrder);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[10001] flex flex-col-reverse gap-2">
      <AnimatePresence>
        {order.map((id) => (
          <NotificationToast key={id} id={id} />
        ))}
      </AnimatePresence>
    </div>
  );
}
