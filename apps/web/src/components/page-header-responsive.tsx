'use client';

import { PageHeader } from '@akari/ui';
import { useEffect, type ComponentProps } from 'react';
import { useSettings } from './hooks';
import { usePageTitle } from './page-title';

type Props = Omit<ComponentProps<typeof PageHeader>, 'hideTitleAtLg'>;

export function PageHeaderResponsive(props: Props) {
  const settings = useSettings();
  const { setTitle, setMeta } = usePageTitle();
  const hideTitleAtLg = settings?.shellMode !== 'header';
  const meta = props.meta ?? props.description ?? '';
  useEffect(() => {
    setTitle(props.title);
    setMeta(meta);
  }, [props.title, meta, setTitle, setMeta]);
  return <PageHeader {...props} hideTitleAtLg={hideTitleAtLg} />;
}
