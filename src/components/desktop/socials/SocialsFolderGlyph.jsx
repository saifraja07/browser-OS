import { SOCIAL_FOLDER_ICON } from '../../../assets/socialIcons';

/** The My Socials desktop icon: the supplied folder artwork, drawn edge to edge. */
export default function SocialsFolderGlyph({ size = 44, className = '' }) {
  return (
    <img
      src={SOCIAL_FOLDER_ICON}
      width={size}
      height={size}
      alt=""
      draggable="false"
      className={`block ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
