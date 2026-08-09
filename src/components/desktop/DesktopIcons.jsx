import { DEFAULT_APP_IDS } from '../../core/desktopIcons/constants';
import DesktopIcon from './DesktopIcon';

/**
 * Renders every desktop shortcut. Positioning is per-icon (from
 * useDesktopIconStore, defaulting to the left-column/right-row layout —
 * see constants.js), not a fixed group container, since each icon is
 * independently draggable.
 */
export default function DesktopIcons({ isMobile = false }) {
  return (
    <>
      {DEFAULT_APP_IDS.map((appId) => (
        <DesktopIcon key={appId} appId={appId} isMobile={isMobile} />
      ))}
    </>
  );
}
