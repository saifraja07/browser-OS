import aboutIcon from './icons/about.webp';
import calculatorIcon from './icons/calculator.webp';
import calendarIcon from './icons/calendar.webp';
import communityIcon from './icons/community.webp';
import explorerIcon from './icons/explorer.webp';
import messageIcon from './icons/message.webp';
import musicIcon from './icons/music.webp';
import readmeIcon from './icons/readme.webp';
import settingIcon from './icons/setting.webp';
import terminalIcon from './icons/terminal.webp';

const ICONS = {
  about: aboutIcon, calculator: calculatorIcon, calendar: calendarIcon,
  community: communityIcon,
  explorer: explorerIcon, messages: messageIcon, music: musicIcon,
  readme: readmeIcon, settings: settingIcon, terminal: terminalIcon,
};

/**
 * A couple of the source icon images have noticeably more built-in padding
 * than the rest, so at the same box size their glyph reads visually
 * smaller. This scales just those up (clipped back to the same box) so
 * every icon looks like a consistent size, without touching the source
 * assets themselves.
 */
const ICON_VISUAL_SCALE = {
  terminal: 1.3,
};

export function AppIcon({ appId, size = 24, className = '', alt = '' }) {
  const src = ICONS[appId];
  if (!src) return null;
  const scale = ICON_VISUAL_SCALE[appId] ?? 1;
  return (
    <span className={`inline-block overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <img
        src={src}
        width={size}
        height={size}
        alt={alt}
        draggable="false"
        className="block h-full w-full object-contain [image-rendering:pixelated]"
        style={scale !== 1 ? { transform: `scale(${scale})`, transformOrigin: 'center' } : undefined}
      />
    </span>
  );
}
export const APP_ICON_SOURCES = ICONS;
