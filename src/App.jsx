import './apps/registerApps';
import Desktop from './components/desktop/Desktop';
import WindowManagerRoot from './components/window/WindowManagerRoot';
import Dock from './components/dock/Dock';
import MobileDock from './components/dock/MobileDock';
import MobileAppsMenu from './components/dock/MobileAppsMenu';
import ContextMenu from './components/shared/ContextMenu';
import NotificationCenter from './components/notifications/NotificationCenter';
import { useIsMobile } from './hooks/useIsMobile';
import { useViewportGuard } from './hooks/useViewportGuard';

export default function App() {
  const isMobile = useIsMobile();
  // Keeps open windows reachable across resize/orientation change on mobile.
  // No-ops on desktop.
  useViewportGuard();

  return (
    <Desktop isMobile={isMobile}>
      <WindowManagerRoot />
      {isMobile ? (
        <>
          <MobileDock />
          <MobileAppsMenu />
        </>
      ) : (
        <Dock />
      )}
      <ContextMenu />
      <NotificationCenter />
    </Desktop>
  );
}
