import { useState } from 'react';
import { useGuestbook } from './hooks/useGuestbook';
import CommunityHeader from './components/CommunityHeader';
import CommunitySearch from './components/CommunitySearch';
import CommunityPostList from './components/CommunityPostList';
import CreatePost from './components/CreatePost';

export default function CommunityApp() {
  const [view, setView] = useState('list'); // 'list' | 'create'

  const {
    posts,
    loading,
    error,
    retry,
    searchInput,
    setSearchInput,
    isSearching,
    submitting,
    submitError,
    clearSubmitError,
    submitPost,
  } = useGuestbook();

  if (view === 'create') {
    return (
      <CreatePost
        onBack={() => setView('list')}
        submitting={submitting}
        submitError={submitError}
        onClearSubmitError={clearSubmitError}
        onSubmit={submitPost}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-os-surface text-os-ink">
      <CommunityHeader onNewPost={() => setView('create')} />
      <CommunitySearch value={searchInput} onChange={setSearchInput} />
      <CommunityPostList
        posts={posts}
        loading={loading}
        error={error}
        isSearching={isSearching}
        onRetry={retry}
      />
    </div>
  );
}
