'use client';

import { useState } from 'react';
import type { FailPostSummary } from '@/lib/data';

export type FailPostClientComment = {
  id: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    username: string | null;
    name: string | null;
    avatarUrl: string | null;
  };
};

type FailWallPost = Omit<FailPostSummary, 'comments'> & {
  comments: FailPostClientComment[];
};

type FailPostCardProps = {
  post: FailWallPost;
  currentUserId: string | null;
  onLikeUpdate: (
    postId: string,
    payload: { liked: boolean; likesCount: number; commentsCount: number; engagementScore: number },
  ) => void;
  onCommentAdded: (
    postId: string,
    payload: { comment: FailPostClientComment; commentsCount: number; engagementScore: number },
  ) => void;
};

export default function FailPostCard({ post, currentUserId, onLikeUpdate, onCommentAdded }: FailPostCardProps) {
  const [comment, setComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const liked = post.likedByViewer;

  const handleLike = async () => {
    if (!currentUserId) {
      setFeedback('Sign in to send encouragement.');
      return;
    }

    try {
      const res = await fetch(`/api/fail-posts/${post.id}/like`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Unable to react right now.');
      }
      onLikeUpdate(post.id, data.data);
      setFeedback(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Something went wrong.');
    }
  };

  const handleComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUserId) {
      setFeedback('Sign in to leave a comment.');
      return;
    }
    if (!comment.trim()) return;

    setIsCommenting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/fail-posts/${post.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: comment }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Unable to post your comment.');
      }
      const result = data.data as {
        comment: FailPostClientComment;
        commentsCount: number;
        engagementScore: number;
      };
      onCommentAdded(post.id, result);
      setComment('');
      setFeedback('Thanks for cheering them on!');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to post your comment.');
    } finally {
      setIsCommenting(false);
    }
  };

  const authorName = post.author.name || post.author.username || 'Anonymous';
  const createdAt = new Date(post.createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-card backdrop-blur">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={authorName} imageUrl={post.author.avatarUrl} />
          <div>
            <p className="text-sm font-semibold text-white">
              {authorName}
              {post.author.resilienceBadgeCount > 0 ? (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent-foreground">
                  Resilience x{post.author.resilienceBadgeCount}
                </span>
              ) : null}
            </p>
            <p className="text-xs text-white/50">Posted {createdAt}</p>
          </div>
        </div>
        <div className="text-right text-xs text-white/40">
          <p>Engagement score</p>
          <p className="text-base font-semibold text-accent">{post.engagementScore}</p>
        </div>
      </header>

      <div className="space-y-4">
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">I tried to build</h3>
          <p className="mt-2 text-base text-white">{post.projectAttempt}</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">It failed because</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-white/80">{post.failureReason}</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-white/60">I learned</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-white/80">{post.lessonLearned}</p>
        </section>
      </div>

      <footer className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
          <button
            type="button"
            onClick={handleLike}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 transition ${
              liked
                ? 'border-accent bg-accent/20 text-accent-foreground'
                : 'border-white/15 bg-white/5 hover:bg-white/10'
            }`}
          >
            <span>{liked ? 'Encouraged' : 'Send encouragement'}</span>
            <span className="text-xs text-white/50">{post.likesCount}</span>
          </button>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/60">
            {post.commentsCount} comment{post.commentsCount === 1 ? '' : 's'}
          </span>
        </div>

        <form onSubmit={handleComment} className="space-y-2">
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={currentUserId ? 'Add a note of encouragement or a clarifying question…' : 'Sign in to join the conversation'}
            disabled={!currentUserId}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
            rows={2}
          />
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>{feedback}</span>
            <button
              type="submit"
              disabled={!currentUserId || isCommenting || !comment.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCommenting ? 'Posting…' : 'Share support'}
            </button>
          </div>
        </form>

        {post.comments.length ? (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
            {post.comments.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span className="font-semibold text-white/80">{item.author.name ?? item.author.username ?? 'Member'}</span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        ) : null}
      </footer>
    </article>
  );
}

function Avatar({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  if (imageUrl) {
    return (
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white"
        style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        aria-label={name}
      />
    );
  }

  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
      {initials || '?'}
    </span>
  );
}
