import { DEFAULT_APP_IDS } from '../../core/desktopIcons/constants';
import DesktopIcon from './DesktopIcon';

export default function DesktopIcons() {
  return (
    <>
      {DEFAULT_APP_IDS.map((appId) => (
        <DesktopIcon key={appId} appId={appId} />
      ))}
    </>
  );
}
