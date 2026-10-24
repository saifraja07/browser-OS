/**
 * Single source of truth for the My Socials folder (desktop icon preview +
 * popup). Order here is the order shown in both places.
 *
 * `url` must be the full profile address. Leave it as '' until it is
 * known — the popup then shows that shortcut as unavailable instead of
 * linking to a guessed or generic page.
 */
export const SOCIAL_LINKS = [
  { id: 'github', label: 'GitHub', url: 'https://github.com/saifraja07' },
  { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/saif__a__r' },
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/saif-raja-a89536312' },
  { id: 'website', label: 'Website', url: 'https://saifaliraja.com' },
];
