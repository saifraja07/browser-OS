import { useState } from 'react';
import { NAME_MAX_LENGTH, MESSAGE_MAX_LENGTH, validatePost } from '../validation';
import { looksInappropriate, MODERATION_REJECTION_MESSAGE } from '../moderation';

export default function PostForm({ submitting, submitError, onClearSubmitError, onSubmit }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // belt-and-suspenders against double clicks/taps

    const { valid, errors } = validatePost({ name, message });

    // Client-side moderation pre-check for instant feedback; the
    // authoritative check happens server-side in the Edge Function.
    if (valid && looksInappropriate(message)) {
      errors.message = MODERATION_REJECTION_MESSAGE;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    onClearSubmitError();

    const result = await onSubmit({ name: name.trim(), message: message.trim() });

    if (result.ok) {
      // Only clear the form after a confirmed success — on failure the
      // user's text is preserved so they don't lose their message.
      setName('');
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-3 overflow-y-auto px-3.5 py-3">
      <div>
        <label htmlFor="community-name" className="mb-1 block font-display text-[9px] text-os-ink">
          Name
        </label>
        <input
          id="community-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={NAME_MAX_LENGTH + 20}
          placeholder="Enter your name..."
          disabled={submitting}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? 'community-name-error' : undefined}
          className="w-full min-w-0 rounded-lg border-2 border-os-border bg-os-surface px-2.5 py-1.5 font-mono text-[11px] text-os-ink outline-none placeholder:text-os-ink-soft focus:border-os-accent disabled:opacity-60"
        />
        {fieldErrors.name && (
          <p id="community-name-error" role="alert" className="mt-1 font-mono text-[9px] text-os-danger">
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <label htmlFor="community-message" className="block font-display text-[9px] text-os-ink">
            Message
          </label>
          <span className="shrink-0 font-mono text-[8px] text-os-ink-soft">
            {message.length}/{MESSAGE_MAX_LENGTH}
          </span>
        </div>
        <textarea
          id="community-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MESSAGE_MAX_LENGTH + 50}
          placeholder="Write your message here..."
          disabled={submitting}
          rows={5}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? 'community-message-error' : undefined}
          className="min-h-[110px] w-full min-w-0 flex-1 resize-none rounded-lg border-2 border-os-border bg-os-surface px-2.5 py-1.5 font-mono text-[11px] leading-[1.5] text-os-ink outline-none placeholder:text-os-ink-soft focus:border-os-accent disabled:opacity-60"
        />
        {fieldErrors.message && (
          <p id="community-message-error" role="alert" className="mt-1 font-mono text-[9px] text-os-danger">
            {fieldErrors.message}
          </p>
        )}
      </div>

      <p className="rounded-lg border-2 border-os-border bg-os-surface-2 px-2.5 py-2 font-mono text-[9px] leading-relaxed text-os-ink-soft">
        Be kind and respectful. Let&rsquo;s keep the BrowserOS community a great place.
      </p>

      {submitError && (
        <p role="alert" className="rounded-lg border-2 border-os-danger bg-os-surface px-2.5 py-2 font-mono text-[9px] leading-relaxed text-os-danger">
          {submitError.message}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="pixel-cut mt-1 inline-flex items-center justify-center border-[length:var(--os-border-width)] border-os-border-strong bg-os-accent px-3 py-2 font-display text-[10px] text-os-accent-ink shadow-[0_2px_0_rgba(0,0,0,.15)] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {submitting ? 'Posting…' : 'Post Message'}
      </button>
    </form>
  );
}
