import type { Metadata } from 'next';
import { Stack } from '@akari/ui';
import { AccountForm } from '../../../../src/components/forms/account-form';
import { PageTitle } from '../../../../src/components/page-title';
import { PageHeaderResponsive } from '../../../../src/components/page-header-responsive';

export const metadata: Metadata = { title: 'Nueva cuenta' };

export default function NewAccountPage() {
  return (
    <Stack gap={5}>
      <PageTitle title="Nueva cuenta" />
      <PageHeaderResponsive
        title="Nueva cuenta"
        description="Una cuenta personal, conjunta o de depósito. El saldo inicial es obligatorio."
      />
      <div className="max-w-2xl">
        <AccountForm />
      </div>
    </Stack>
  );
}
