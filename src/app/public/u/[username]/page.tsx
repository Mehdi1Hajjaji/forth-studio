import { redirect } from 'next/navigation';

export default function LegacyPublicProfile({ params }: { params: { username: string } }) {
  redirect(`/profile/${params.username}`);
}
