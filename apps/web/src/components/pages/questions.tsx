'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatMinor } from '@akari/domain';
import {
  Button,
  Card,
  ChartBars,
  SegmentedControl,
  Stack,
  StatePage,
  cn,
} from '@akari/ui';
import { useQuickAnswers } from '../../components/hooks';
import { ActionButton } from '../../components/action-link';
import { useMovementComposer } from '../../components/movement-composer';
import { PageTitle } from '../../components/page-title';
import { PageHeaderResponsive } from '../../components/page-header-responsive';
import { HeadingMeta } from '../../components/heading-meta';
import { PageSkeleton } from '../../components/page-skeleton';
import {
  formatLongDate,
  formatMonthYear,
  formatWeekdayLabels,
} from '../../lib/format';

type QuestionKey = 'biggest' | 'avoidable' | 'category' | 'week';

const questionOptions = [
  { value: 'biggest' as const, label: 'Mayor gasto del mes' },
  { value: 'avoidable' as const, label: 'Gastos evitables' },
  { value: 'category' as const, label: 'Categoría principal' },
  { value: 'week' as const, label: 'Gasto semanal' },
];

export function QuestionsScreen() {
  const answers = useQuickAnswers();
  const openMovement = useMovementComposer();
  const [question, setQuestion] = useState<QuestionKey>('biggest');

  if (!answers) {
    return <PageSkeleton variant="cards" />;
  }

  const currency = answers.currency;
  const hasAny =
    answers.biggestExpense.hasData ||
    answers.topCategory.hasData ||
    answers.avoidable.hasData ||
    answers.weekExpense.hasData;

  const views: Record<
    QuestionKey,
    { title: string; value: string; detail: string; context: string; hasData: boolean; link: string }
  > = {
    biggest: {
      title: `¿Cuál fue tu mayor gasto en ${formatMonthYear()}?`,
      value: answers.biggestExpense.amountMinor
        ? formatMinor(answers.biggestExpense.amountMinor, currency)
        : '—',
      detail: answers.biggestExpense.hasData
        ? `${answers.biggestExpense.concept} · ${answers.biggestExpense.category}`
        : 'Sin gastos registrados este mes',
      context: answers.biggestExpense.date
        ? `Registrado el ${formatLongDate(answers.biggestExpense.date)}. Representa el ${
            answers.summary.monthExpenseMinor > 0
              ? Math.round(
                  ((answers.biggestExpense.amountMinor ?? 0) / answers.summary.monthExpenseMinor) * 100,
                )
              : 0
          } % del gasto del mes.`
        : 'Registra algún gasto este mes para ver la respuesta.',
      hasData: answers.biggestExpense.hasData,
      link: '/movimientos',
    },
    avoidable: {
      title: '¿Cuánto podrías evitar este mes?',
      value: formatMinor(answers.avoidable.amountMinor, currency),
      detail: answers.avoidable.hasData
        ? `${answers.avoidable.items.length} partidas entre suscripciones y categorías Ocio/Compras`
        : 'Sin suscripciones ni gastos de Ocio o Compras',
      context: answers.avoidable.hasData
        ? answers.avoidable.items
            .slice(0, 3)
            .map((item) => `${item.concept} (${item.reason.toLowerCase()})`)
            .join(' · ')
        : 'No hay gastos evitables registrados este mes.',
      hasData: answers.avoidable.hasData,
      link: '/movimientos',
    },
    category: {
      title: '¿Qué categoría se lleva más?',
      value: answers.topCategory.amountMinor
        ? formatMinor(answers.topCategory.amountMinor, currency)
        : '—',
      detail: answers.topCategory.hasData ? answers.topCategory.category ?? '—' : 'Sin categorías con gasto',
      context: answers.topCategory.hasData
        ? `Supone el ${
            answers.summary.monthExpenseMinor > 0
              ? Math.round(((answers.topCategory.amountMinor ?? 0) / answers.summary.monthExpenseMinor) * 100)
              : 0
          } % de tus gastos de ${formatMonthYear()}.`
        : 'Aún no hay categorías con gasto este mes.',
      hasData: answers.topCategory.hasData,
      link: '/movimientos',
    },
    week: {
      title: '¿Cuánto llevas esta semana?',
      value: formatMinor(answers.weekExpense.amountMinor, currency),
      detail: answers.weekExpense.period,
      context: answers.weekExpense.hasData
        ? 'Incluye los gastos registrados desde el lunes hasta hoy.'
        : 'Todavía no hay gastos esta semana.',
      hasData: answers.weekExpense.hasData,
      link: '/movimientos',
    },
  };

  const view = views[question];
  const savings = answers.summary.savingsMinor;
  const savingsPercent = answers.summary.savingsPercent;

  return (
    <div>
      <PageTitle title="Preguntas rápidas" />
      <Stack gap={5}>
        <PageHeaderResponsive title="Preguntas rápidas" />
        <HeadingMeta label="Respuestas directas sobre tus datos" detail={formatMonthYear()} />

        <SegmentedControl
          ariaLabel="Pregunta"
          options={questionOptions}
          value={question}
          onChange={setQuestion}
          size="lg"
          scrollable
        />

        <div className="grid gap-4 lg:grid-cols-[740px_minmax(0,1fr)] xl:grid-cols-[1.06fr_1fr]">
          <Card padding="lg" className="flex flex-col gap-3">
            <p className="text-ui-13-strong text-text-secondary">{view.title}</p>
            <p className="font-tabular text-ui-44-bold text-text-primary">{view.value}</p>
            <p className="text-ui-12 text-text-primary">{view.detail}</p>
            <ChartBars
              title="Gastos por semana"
              total={formatMinor(answers.summary.monthExpenseMinor, currency)}
              values={answers.daily.map((day) => day.totalMinor)}
              labels={formatWeekdayLabels(answers.daily.length)}
              ariaLabel="Gastos por semana del mes"
            />
            <p className="text-ui-12 text-text-secondary">{view.context}</p>
            <Link href={view.link} className="text-ui-11-strong text-accent-strong underline-offset-4 hover:underline">
              Ver los movimientos de {view.detail.split('·')[0]?.trim() || 'este mes'} →
            </Link>
          </Card>

          <div className="flex flex-col gap-4">
            <Card padding="md" className="flex flex-col gap-1.5">
              <p className="text-ui-11 text-text-secondary">Gastos evitables</p>
              <p className="font-tabular text-ui-28-bold text-text-primary">
                {formatMinor(answers.avoidable.amountMinor, currency)}
              </p>
              <p className="text-ui-10 text-text-secondary">
                {answers.avoidable.hasData
                  ? `${answers.avoidable.items.length} partidas detectadas este mes.`
                  : 'Sin partidas detectadas este mes.'}
              </p>
              <div className="pt-2">
                <Button variant="tertiary" size="sm" onClick={() => setQuestion('avoidable')}>
                  Revisar
                </Button>
              </div>
            </Card>

            <Card padding="md" className="flex flex-1 flex-col gap-1.5">
              <p className="text-ui-11 text-text-secondary">Ahorro del mes</p>
              <p
                className={cn(
                  'font-tabular text-ui-28-bold',
                  savings < 0 ? 'text-status-danger-text' : 'text-status-positive-text',
                )}
              >
                {savings >= 0 ? '+' : '−'}
                {formatMinor(Math.abs(savings), currency)}
              </p>
              <p className="text-ui-10 text-text-secondary">
                {savingsPercent === null
                  ? 'Sin ingresos registrados este mes.'
                  : savingsPercent >= 0
                    ? `Has ahorrado el ${savingsPercent} % de tus ingresos.`
                    : `Has gastado un ${Math.abs(savingsPercent)} % más de lo que ingresaste.`}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className={cn('h-full rounded-full', savings < 0 ? 'bg-status-danger' : 'bg-accent-default')}
                  style={{ width: `${Math.min(100, Math.max(4, Math.abs(savingsPercent ?? 0)))}%` }}
                />
              </div>
            </Card>
          </div>
        </div>

        {!hasAny ? (
          <StatePage
            type="insufficient"
            title="Aún no hay datos suficientes"
            description="Registra algunos movimientos del mes y vuelve a estas preguntas."
            primaryAction={<ActionButton onClick={() => openMovement()}>Añadir movimiento</ActionButton>}
          />
        ) : null}
      </Stack>
    </div>
  );
}
