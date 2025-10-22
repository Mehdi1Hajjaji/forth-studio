'use client';

import { useMemo, useState } from 'react';
import type { FailPostSummary } from '@/lib/data';
import FailWallComposer from './FailWallComposer';
import FailPostCard, { type FailPostClientComment } from './FailPostCard';

type Props = {
  initialPosts: FailPostSummary[];
  currentUser: { id: string; name?: string | null } | null;
};

type FailPostClientState = Omit<FailPostSummary, 'comments'> & {
  comments: FailPostClientComment[];
};

export default function FailWallFeed({ initialPosts, currentUser }: Props) {
  const [posts, setPosts] = useState<FailPostClientState[]>(() =>
    initialPosts.map((post) => ({ ...post, comments: [] as FailPostClientComment[] }))
  );

  const currentUserId = currentUser?.id ?? null;

  const handleCreated = (post: FailPostSummary) => {
    setPosts((prev) => [{ ...post, comments: [] }, ...prev]);
  };

  const handleLikeUpdate = (
    postId: string,
    payload: { liked: boolean; likesCount: number; commentsCount: number; engagementScore: number }
  ) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              likedByViewer: payload.liked,
              likesCount: payload.likesCount,
              commentsCount: payload.commentsCount,
              engagementScore: payload.engagementScore,
            }
          : post,
      ),
    );
  };

  const handleCommentAdded = (
    postId: string,
    payload: { comment: FailPostClientComment; commentsCount: number; engagementScore: number }
  ) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [payload.comment, ...post.comments].slice(0, 5),
              commentsCount: payload.commentsCount,
              engagementScore: payload.engagementScore,
            }
          : post,
      ),
    );
  };

  const empty = useMemo(() => posts.length === 0, [posts.length]);

  return (
    <div className="space-y-8">
      <FailWallComposer currentUser={currentUser} onCreated={handleCreated} />

      {empty ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-sm text-white/70">
          <p className="text-lg font-semibold text-white">Be the first to paint the Fail Wall.</p>
          <p className="mt-3">
            Share a recent stumble, the why behind it, and the lesson you’re carrying forward.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <FailPostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onLikeUpdate={handleLikeUpdate}
              onCommentAdded={handleCommentAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
