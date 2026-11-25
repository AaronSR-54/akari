'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGroupSummary, useGroups } from '../../components/hooks';
import { formatMinor } from '@akari/domain';
import {
  Card,
  Grid,
  Stack,
  StatePage,
} from '@akari/ui';
import { GroupForm } from '../../components/forms/group-form';
import { PageTitle } from '../../components/page-title';
import { PageHeaderResponsive } from '../../components/page-header-responsive';
import { HeadingMeta } from '../../components/heading-meta';
import { GroupStatusBadge } from '../../components/group-status-badge';
import { PageSkeleton } from '../../components/page-skeleton';
import { Modal, Button } from '@akari/ui';

function GroupCard({
  groupId,
  name,
  currency,
  memberCount,
}: {
  groupId: string;
  name: string;
  currency: string;
  memberCount: number;
}) {
  const summary = useGroupSummary(groupId);
  return (
    <Link
      href={`/grupos/${groupId}`}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
    >
      <Card padding="md" className="flex h-full flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-ui-16-bold text-text-primary">{name}</h2>
            <p className="text-ui-11 text-text-secondary">
              {memberCount} {memberCount === 1 ? 'miembro' : 'miembros'} · {currency}
            </p>
          </div>
          {summary ? <GroupStatusBadge status={summary.status} /> : null}
        </div>
        <div>
          <p className="text-ui-10 text-text-secondary">Pendiente de liquidar</p>
          <p className="font-tabular text-ui-20-bold text-text-primary">
            {summary ? formatMinor(summary.pendingTotalMinor, currency) : '—'}
          </p>
        </div>
      </Card>
    </Link>
  );
}

export function GroupsScreen() {
  const groups = useGroups();
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  if (!groups) {
    return <PageSkeleton variant="cards" />;
  }

  return (
    <div>
      <PageTitle title="Grupos" />
      <Stack gap={5}>
        <div className="hidden md:block">
          <PageHeaderResponsive
            title="Grupos"
            actions={<Button onClick={() => setCreating(true)}>Crear grupo</Button>}
          />
        </div>
        <div className="md:hidden">
          <Button onClick={() => setCreating(true)}>Crear grupo</Button>
        </div>
        <HeadingMeta
          label={`${groups.length} ${groups.length === 1 ? 'grupo' : 'grupos'}`}
          detail="gastos compartidos y liquidaciones"
        />
        {groups.length === 0 ? (
          <StatePage
            type="empty"
            title="Todavía no hay grupos"
            description="Crea un grupo con las personas con las que compartes gastos y empieza a repartir."
            primaryAction={<Button onClick={() => setCreating(true)}>Crear grupo</Button>}
          />
        ) : (
          <Grid columns={3}>
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                groupId={group.id}
                name={group.name}
                currency={group.currency}
                memberCount={group.members.length}
              />
            ))}
          </Grid>
        )}
      </Stack>
      <Modal open={creating} onClose={() => setCreating(false)} title="Nuevo grupo" className="max-w-2xl">
        <GroupForm
          onCreated={(group) => {
            setCreating(false);
            router.push(`/grupos/${group.id}`);
          }}
        />
      </Modal>
    </div>
  );
}
