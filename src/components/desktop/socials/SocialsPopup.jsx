import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { SOCIAL_LINKS } from '../../../core/socials/socialLinks';
import { SOCIAL_ICONS } from '../../../assets/socialIcons';
import { useSocialsStore } from '../../../store/useSocialsStore';
import { useDesktopIconStore } from '../../../store/useDesktopIconStore';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { NAVBAR_HEIGHT } from '../../../core/windowManager/constants';
import { DOCK_RESERVE_HEIGHT, MOBILE_DOCK_HEIGHT } from '../../../core/desktopIcons/constants';

/** Marks the desktop icon that toggles this popup, so its own click isn't treated as "outside". */
export const SOCIALS_TRIGGER_ATTR = 'data-socials-trigger';

const SPRING = { type: 'spring', stiffness: 380, damping: 26, mass: 0.7 };

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.85 },
  show: { opacity: 1, y: 0, scale: 1, transition: SPRING },
};

function SocialShortcut({ link }) {
  const available = Boolean(link.url);
  const body = (
    <>
      <img
        src={SOCIAL_ICONS[link.id]}
        alt=""
        width="48"
        height="48"
        draggable="false"
        className={`h-9 w-9 rounded-[10px] shadow-os-window transition-[transform,box-shadow] duration-150 group-hover:-translate-y-0.5 group-hover:shadow-os-window-focused sm:h-11 sm:w-11 lg:h-12 lg:w-12 ${available ? '' : 'opacity-50 grayscale'
          }`}
      />
      <span className="font-display text-[8px] leading-tight sm:text-[9px] text-os-ink [text-shadow:0_1px_0_rgba(255,255,255,0.35)]">
        {link.label}
      </span>
    </>
  );

  const shared =
    'group flex min-h-11 min-w-0 flex-col items-center gap-1 rounded-[12px] p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-os-accent';
  const common = {
    variants: itemVariants,
    transition: SPRING,
    className: shared,
  };

  if (!available) {
    return (
      <motion.button
        type="button"
        aria-disabled="true"
        title={`${link.label} link not set yet`}
        onClick={(e) => e.preventDefault()}
        {...common}
        className={`${shared} cursor-not-allowed`}
      >
        {body}
      </motion.button>
    );
  }

  return (
    <motion.a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.label} {...common}>
      {body}
    </motion.a>
  );
}

/**
 * Floating My Socials panel. Lives inside Desktop (position: absolute), in
 * a frame spanning exactly the free workspace between the navbar and the
 * dock, so it stays centered there and never overlaps either. The panel
 * uses the dock's look: transparent with a light blur, strong border.
 */
export default function SocialsPopup() {
  const isOpen = useSocialsStore((s) => s.isOpen);
  const close = useSocialsStore((s) => s.close);
  const iconPos = useDesktopIconStore((s) => s.icons.socials);
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const panelRef = useRef(null);
  const [origin, setOrigin] = useState('50% 100%');

  // Grow out of the folder icon: aim the transform origin at it.
  useLayoutEffect(() => {
    if (!isOpen || !panelRef.current || !iconPos) return;
    const rect = panelRef.current.getBoundingClientRect();
    const iconSize = isMobile ? 36 : 44;
    const ox = iconPos.x + iconSize / 2 - rect.left;
    const oy = iconPos.y + iconSize / 2 - rect.top;
    const clamp = (v, max) => Math.min(Math.max(v, 0), max);
    setOrigin(`${clamp(ox, rect.width)}px ${clamp(oy, rect.height)}px`);
  }, [isOpen, iconPos, isMobile]);

  // Outside pointerdown / Escape. Listeners exist only while open and are
  // always torn down on close, so repeated open/close never stacks them.
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      // The icon's own click toggles the popup; closing here too would just reopen it.
      if (e.target instanceof Element && e.target.closest(`[${SOCIALS_TRIGGER_ATTR}]`)) return;
      close();
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') close();
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, close]);

  const dockReserve = isMobile
    ? `calc(${MOBILE_DOCK_HEIGHT}px + env(safe-area-inset-bottom, 0px))`
    : `${DOCK_RESERVE_HEIGHT}px`;

  const panelMotion = reduceMotion
    ? {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.15 } },
      exit: { opacity: 0, transition: { duration: 0.12 } },
    }
    : {
      initial: { opacity: 0, scale: 0.6, y: 8 },
      animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { ...SPRING, opacity: { duration: 0.18, ease: 'easeOut' } },
      },
      exit: { opacity: 0, scale: 0.85, y: 6, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } },
    };

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-250 flex items-center justify-center px-3"
      style={{ top: NAVBAR_HEIGHT, bottom: dockReserve }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="socials-popup"
            ref={panelRef}
            role="dialog"
            aria-label="My Socials"
            {...panelMotion}
            style={{ transformOrigin: origin }}
            className="pointer-events-auto w-full max-w-67.5 sm:max-w-82.5 lg:max-w-92.5 rounded-[18px] border-(length:--os-border-width) border-os-border-strong bg-transparent px-3 pt-2.5 pb-3 sm:px-4 sm:pt-3 sm:pb-3.5 shadow-os-window backdrop-blur-sm"
          >
            <h2 className="mb-1.5 text-center font-display text-[10px] sm:mb-2 sm:text-[11px] text-os-ink [text-shadow:0_1px_0_rgba(255,255,255,0.35)]">
              My Socials
            </h2>
            <motion.div
              className="grid grid-cols-4 gap-0.5"
              variants={listVariants}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
            >
              {SOCIAL_LINKS.map((link) => (
                <SocialShortcut key={link.id} link={link} />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
