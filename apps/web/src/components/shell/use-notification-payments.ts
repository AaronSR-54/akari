'use client';

import { useCallback, useState } from 'react';
import { payRecurrence, registerInstallment, type AppNotification } from '@akari/domain';
import { useToast } from '@akari/ui';
import { useData } from '../providers';
import { appTodayKey } from '../../lib/clock';
import { CURRENT_USER } from '../../lib/current-user';
import { errorMessage } from '../../lib/format';

export function useNotificationPayments() {
  const { repositories } = useData();
  const { toast } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  const pay = useCallback(
    async (notification: AppNotification) => {
      if (notification.href || busyId) return;
      setBusyId(notification.id);
      try {
        if (notification.action.type === 'pay-recurrence') {
          await payRecurrence(repositories, notification.action.recurrenceId, {
            date: appTodayKey(),
            currentMemberName: CURRENT_USER.name,
          });
        } else if (notification.action.type === 'pay-installment') {
          await registerInstallment(repositories, notification.action.planId);
        }
        toast({ title: 'Pago registrado', description: notification.title, tone: 'success' });
      } catch (error) {
        toast({
          title: 'No se ha podido registrar el pago',
          description: errorMessage(error, 'Inténtalo de nuevo.'),
          tone: 'error',
        });
      } finally {
        setBusyId(null);
      }
    },
    [repositories, toast, busyId],
  );

  return { pay, busyId };
}
