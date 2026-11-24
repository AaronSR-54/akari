'use client';

import { useParams } from 'next/navigation';
import { GroupDetailScreen } from '../../../../src/components/pages/group-detail';

export default function GroupPage() {
  const params = useParams<{ id: string }>();
  return <GroupDetailScreen groupId={params.id} />;
}
