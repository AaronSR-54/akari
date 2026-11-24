import type { Metadata } from 'next';
import { GroupsScreen } from '../../../src/components/pages/groups';

export const metadata: Metadata = { title: 'Grupos' };

export default function GroupsPage() {
  return <GroupsScreen />;
}
