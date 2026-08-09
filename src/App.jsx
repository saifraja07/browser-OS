import { useState } from 'react';
import './apps/registerApps';
import Desktop from './components/desktop/Desktop';
import WindowManagerRoot from './components/window/WindowManagerRoot';
import Dock from './components/dock/Dock';
import MobileDock from './components/dock/MobileDock';
import MobileAppsMenu from './components/dock/MobileAppsMenu';
import ContextMenu from './components/shared/ContextMenu';
import NotificationCenter from './components/notifications/NotificationCenter';
import BootScreen from './components/system/BootScreen';
import LoginScreen from './components/system/LoginScreen';
import Navbar from './components/system/Navbar';
import { useIsMobile } from './hooks/useIsMobile';
import { useViewportGuard } from './hooks/useViewportGuard';

export default function App() {
  const isMobile = useIsMobile();
  // Keeps open windows reachable across resize/orientation change on mobile.
  // No-ops on desktop.
  useViewportGuard();

  // Purely cosmetic startup flow: boot → login → desktop. Neither boot nor
  // login is real auth — they're just a layer shown before the existing
  // desktop becomes visible. The desktop itself (and all its Zustand
  // stores) is untouched by this and only mounts once we reach "desktop".
  const [systemStage, setSystemStage] = useState('boot');

  if (systemStage === 'boot') {
    return <BootScreen onFinish={() => setSystemStage('login')} />;
  }

  if (systemStage === 'login') {
    return <LoginScreen onUnlock={() => setSystemStage('desktop')} />;
  }

  return (
    <Desktop isMobile={isMobile}>
      <Navbar onShutDown={() => setSystemStage('boot')} />
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
