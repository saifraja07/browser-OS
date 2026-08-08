import aboutIcon from './icons/about.webp';
import calculatorIcon from './icons/calculator.webp';
import calendarIcon from './icons/calendar.webp';
import explorerIcon from './icons/explorer.webp';
import messageIcon from './icons/message.webp';
import musicIcon from './icons/music.webp';
import readmeIcon from './icons/readme.webp';
import settingIcon from './icons/setting.webp';
import terminalIcon from './icons/terminal.webp';
import themeIcon from './icons/theme.webp';

const ICONS = {
  about: aboutIcon, calculator: calculatorIcon, calendar: calendarIcon,
  explorer: explorerIcon, messages: messageIcon, music: musicIcon,
  readme: readmeIcon, settings: settingIcon, terminal: terminalIcon,
  wallpaper: themeIcon,
};

export function AppIcon({ appId, size = 24, className = '', alt = '' }) {
  const src = ICONS[appId];
  if (!src) return null;
  return <img src={src} width={size} height={size} alt={alt} draggable="false"
    className={`block object-contain [image-rendering:pixelated] ${className}`} />;
}
export const APP_ICON_SOURCES = ICONS;
