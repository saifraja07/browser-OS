import './apps/registerApps';
import Desktop from './components/desktop/Desktop';
import WindowManagerRoot from './components/window/WindowManagerRoot';
import Dock from './components/dock/Dock';
import ContextMenu from './components/shared/ContextMenu';
import NotificationCenter from './components/notifications/NotificationCenter';

export default function App() {
  return (
    <Desktop>
      <WindowManagerRoot />
      <Dock />
      <ContextMenu />
      <NotificationCenter />
    </Desktop>
  );
}
