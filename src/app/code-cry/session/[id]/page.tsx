import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import LiveSessionClient from './room-client';

export const dynamic = 'force-dynamic';

interface Props { params: { id: string } }

export default async function CodeCrySessionPage({ params }: Props) {
  const [session, viewer] = await Promise.all([
    prisma.codeCrySession.findUnique({ where: { id: params.id } }),
    getCurrentUser(),
  ]);
  if (!session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Session not found</h1>
        <p className="text-muted-foreground">The session may have been removed.</p>
      </div>
    );
  }

  const isHost = Boolean(viewer?.id && session.hostId === viewer.id);
  const isLive = Boolean(session.startedAt && !session.endedAt);
  
  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <LiveSessionClient sessionId={session.id} roomName={session.roomName} title={session.title} description={session.description ?? ''} isHost={isHost} isLiveInitial={isLive} />
    </div>
  );
}
