import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import PostForm from './PostForm';
import { notify } from '../../../store/useNotificationStore';

export default function CreatePost({ onBack, submitting, submitError, onClearSubmitError, onSubmit }) {
  const [justPosted, setJustPosted] = useState(false);

  useEffect(() => {
    if (!justPosted) return undefined;
    const timer = setTimeout(() => onBack(), 900);
    return () => clearTimeout(timer);
  }, [justPosted, onBack]);

  const handleSubmit = async (payload) => {
    const result = await onSubmit(payload);
    if (result.ok) {
      notify({ title: 'Community', message: 'Message posted successfully!' });
      setJustPosted(true);
    }
    return result;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-os-surface text-os-ink">
      <div className="flex items-center gap-2 border-b-2 border-os-border bg-os-surface-2 px-3.5 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="flex h-7 shrink-0 items-center gap-1 rounded-lg border-2 border-os-border-strong bg-os-surface px-2 font-mono text-[9px] text-os-ink shadow-[0_2px_0_rgba(0,0,0,.1)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <ArrowLeft size={12} aria-hidden="true" />
          Back to Messages
        </button>
      </div>

      <div className="px-3.5 pt-3">
        <h2 className="font-display text-[13px] text-os-ink">Create a Post</h2>
        <p className="mt-0.5 font-mono text-[9px] text-os-ink-soft">
          Share your thoughts with the community
        </p>
      </div>

      {justPosted ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <CheckCircle2 size={24} className="text-os-mint" aria-hidden="true" />
          <p className="font-display text-[11px] text-os-ink">Message posted successfully!</p>
        </div>
      ) : (
        <PostForm
          submitting={submitting}
          submitError={submitError}
          onClearSubmitError={onClearSubmitError}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
