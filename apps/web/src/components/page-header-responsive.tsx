'use client';

import { PageHeader } from '@akari/ui';
import { useEffect, type ComponentProps } from 'react';
import { useSettings } from './hooks';
import { usePageTitle } from './page-title';

type Props = Omit<ComponentProps<typeof PageHeader>, 'hideTitleAtLg'>;

export function PageHeaderResponsive({ titleAction, ...props }: Props) {
  const settings = useSettings();
  const { setTitle, setMeta, setTitleAction } = usePageTitle();
  const hideTitleAtLg = settings?.shellMode !== 'header';
  const meta = props.meta ?? props.description ?? '';
  useEffect(() => {
    setTitle(props.title);
    setMeta(meta);
  }, [props.title, meta, setTitle, setMeta]);
  useEffect(() => {
    setTitleAction(titleAction ?? null);
  }, [titleAction, setTitleAction]);
  useEffect(() => () => setTitleAction(null), [setTitleAction]);
  return <PageHeader {...props} titleAction={titleAction} hideTitleAtLg={hideTitleAtLg} />;
}
