export const STORAGE_KEY = 'browseros:wallpaper';
export const DEFAULT_WALLPAPER_ID = 'classic-pixel';

/**
 * Theme-friendly procedural wallpapers. They use only CSS gradients so the
 * project stays self-contained and deploys without external image requests.
 * A theme can pair itself with one of these presets, while the Wallpaper app
 * can still override the selection independently.
 */
export const WALLPAPERS = {
  'classic-pixel': {
    label: 'Classic Pixel',
    backgroundImage: `
      linear-gradient(to top, rgba(24,82,42,.98) 0 14%, transparent 14%),
      linear-gradient(to top, rgba(67,125,64,.98) 14% 25%, transparent 25%),
      radial-gradient(ellipse at 23% 28%, rgba(255,255,255,.8) 0 5%, transparent 5.5%),
      radial-gradient(ellipse at 29% 22%, rgba(255,255,255,.75) 0 6%, transparent 6.5%),
      linear-gradient(180deg, #2e75bf 0%, #75bfe1 58%, #cfe5db 100%)
    `,
    backgroundSize: '100% 100%',
  },
  'ukiyoe-calm': {
    label: 'Ukiyo-e Calm',
    backgroundImage: `
      radial-gradient(ellipse at 50% 72%, transparent 0 18%, rgba(38,65,74,.9) 18.5% 20%, transparent 20.5%),
      repeating-radial-gradient(ellipse at 50% 78%, transparent 0 15px, rgba(38,65,74,.62) 16px 18px, transparent 19px 31px),
      linear-gradient(150deg, rgba(177,70,48,.35), transparent 38%),
      linear-gradient(180deg, #d8c99f 0%, #e9dcb9 62%, #bcae87 100%)
    `,
    backgroundSize: '100% 100%',
  },
  'sunset-drive': {
    label: 'Sunset Drive',
    backgroundImage: `
      radial-gradient(circle at 72% 43%, #ffb02e 0 8%, #ff6a8f 8.5% 12%, transparent 12.5%),
      linear-gradient(165deg, transparent 0 52%, rgba(8,8,31,.85) 52.5% 54%, transparent 54.5%),
      repeating-linear-gradient(170deg, transparent 0 17px, rgba(255,72,174,.2) 18px 20px),
      linear-gradient(180deg, #17133d 0%, #4a1d5e 42%, #ef5b8b 65%, #ff9b31 100%)
    `,
    backgroundSize: '100% 100%',
  },
  'cyber-grid': {
    label: 'Cyber Grid',
    backgroundImage: `
      linear-gradient(rgba(0,217,255,.2) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,217,255,.2) 1px, transparent 1px),
      radial-gradient(circle at 70% 42%, rgba(0,217,255,.22), transparent 22%),
      linear-gradient(180deg, #02060d 0%, #061525 100%)
    `,
    backgroundSize: '36px 36px, 36px 36px, 100% 100%, 100% 100%',
  },
  'forest-retreat': {
    label: 'Forest Retreat',
    backgroundImage: `
      radial-gradient(ellipse at 50% 75%, rgba(64,88,56,.9) 0 17%, transparent 17.5%),
      linear-gradient(110deg, transparent 0 31%, rgba(35,62,47,.92) 31.5% 38%, transparent 38.5%),
      linear-gradient(70deg, transparent 0 57%, rgba(35,62,47,.88) 57.5% 64%, transparent 64.5%),
      linear-gradient(180deg, #879a8b 0%, #496b59 58%, #263f31 100%)
    `,
    backgroundSize: '100% 100%',
  },
  'space-explorer': {
    label: 'Space Explorer',
    backgroundImage: `
      radial-gradient(circle at 22% 28%, rgba(255,255,255,.9) 0 1px, transparent 2px),
      radial-gradient(circle at 73% 18%, rgba(255,255,255,.8) 0 1px, transparent 2px),
      radial-gradient(circle at 61% 67%, rgba(255,255,255,.75) 0 1px, transparent 2px),
      radial-gradient(circle at 82% 44%, rgba(200,155,255,.8) 0 1px, transparent 2px),
      radial-gradient(circle at 55% 44%, #bba3ff 0 5%, transparent 5.5%),
      linear-gradient(160deg, #060719 0%, #15143b 58%, #30255d 100%)
    `,
    backgroundSize: '170px 170px, 230px 230px, 190px 190px, 250px 250px, 100% 100%, 100% 100%',
  },
};

export const WALLPAPER_IDS = Object.keys(WALLPAPERS);
