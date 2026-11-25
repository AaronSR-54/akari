'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createGroup, type Group, type MemberRole } from '@akari/domain';
import {
  Button,
  Card,
  Inline,
  SelectField,
  Stack,
  TextField,
  useToast,
} from '@akari/ui';
import { useData } from '../providers';
import { currencyOptions, memberRoleOptions } from '../../lib/options';
import { errorMessage } from '../../lib/format';

type DraftMember = { name: string; role: MemberRole };

export function GroupForm({ onCreated }: { onCreated?: (group: Group) => void }) {
  const router = useRouter();
  const { repositories } = useData();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [members, setMembers] = useState<DraftMember[]>([
    { name: '', role: 'admin' },
    { name: '', role: 'editor' },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const updateMember = (index: number, patch: Partial<DraftMember>) => {
    setMembers((current) =>
      current.map((member, position) => (position === index ? { ...member, ...patch } : member)),
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'El nombre del grupo es obligatorio';
    const named = members.filter((member) => member.name.trim());
    if (named.length < 2) nextErrors.members = 'Añade al menos dos miembros';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const group = await createGroup(repositories, { name, currency, members: named });
      toast({ title: 'Grupo creado', tone: 'success' });
      if (onCreated) onCreated(group);
      else router.push(`/grupos/${group.id}`);
    } catch (error) {
      const message = errorMessage(error, 'No se ha podido crear el grupo');
      toast({ title: 'Revisa los datos', description: message, tone: 'error' });
      setSaving(false);
    }
  };

  return (
    <Card padding="lg">
      <form onSubmit={submit} noValidate>
        <Stack gap={4}>
          <TextField
            label="Nombre del grupo"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={errors.name}
            placeholder="Piso compartido"
            required
          />
          <SelectField
            label="Divisa del grupo"
            value={currency}
            onValueChange={setCurrency}
            options={currencyOptions}
          />
          <div className="flex flex-col gap-3">
            <p className="text-ui-11-strong text-text-secondary">Miembros</p>
            {members.map((member, index) => (
              <div key={index} className="grid gap-2 md:grid-cols-[1fr_180px_auto]">
                <TextField
                  label={`Miembro ${index + 1}`}
                  value={member.name}
                  onChange={(event) => updateMember(index, { name: event.target.value })}
                  placeholder="Nombre"
                />
                <SelectField
                  label="Rol"
                  value={member.role}
                  onValueChange={(value) => updateMember(index, { role: value as MemberRole })}
                  options={memberRoleOptions}
                />
                <div className="flex items-end pb-6">
                  <Button
                    variant="tertiary"
                    onClick={() => setMembers((current) => current.filter((_, position) => position !== index))}
                    disabled={members.length <= 2}
                    aria-label={`Quitar miembro ${index + 1}`}
                  >
                    Quitar
                  </Button>
                </div>
              </div>
            ))}
            <Inline>
              <Button
                variant="secondary"
                onClick={() => setMembers((current) => [...current, { name: '', role: 'editor' }])}
              >
                Añadir miembro
              </Button>
            </Inline>
            {errors.members ? (
              <p role="alert" className="text-ui-10 text-status-danger-text">
                {errors.members}
              </p>
            ) : null}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" loading={saving}>
              Crear grupo
            </Button>
          </div>
        </Stack>
      </form>
    </Card>
  );
}
