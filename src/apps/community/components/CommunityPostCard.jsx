import { formatRelativeTime } from '../timeUtils';

// A small, deterministic palette so each name gets a consistent avatar
// color across renders/sessions without storing anything extra.
const AVATAR_COLORS = ['#ff8b5e', '#6fcf97', '#7aa2f7', '#e0607a', '#c9a15e', '#9b7fd4'];

function colorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default function CommunityPostCard({ post }) {
  const initial = post.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <article className="rounded-[14px] border-2 border-os-border-strong bg-os-surface p-3 shadow-[0_2px_0_rgba(0,0,0,.08)]">
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-os-border-strong font-display text-[11px] text-os-ink"
          style={{ backgroundColor: `${colorForName(post.name)}55` }}
        >
          {initial}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
            <span className="truncate font-display text-[10px] text-os-ink">{post.name}</span>
            <time
              dateTime={post.created_at}
              className="shrink-0 font-mono text-[8px] text-os-ink-soft"
            >
              {formatRelativeTime(post.created_at)}
            </time>
          </div>

          {/* Rendered as plain text (never dangerouslySetInnerHTML) so
              user-submitted content can never inject HTML/JS. */}
          <p className="mt-1 whitespace-pre-wrap break-words font-mono text-[10px] leading-[1.5] text-os-ink">
            {post.message}
          </p>
        </div>
      </div>
    </article>
  );
}
