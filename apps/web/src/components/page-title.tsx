'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type PageTitleContextValue = {
  title: string;
  meta: string;
  titleAction: ReactNode;
  setTitle: (title: string) => void;
  setMeta: (meta: string) => void;
  setTitleAction: (action: ReactNode) => void;
};

const PageTitleContext = createContext<PageTitleContextValue>({
  title: '',
  meta: '',
  titleAction: null,
  setTitle: () => {},
  setMeta: () => {},
  setTitleAction: () => {},
});

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('');
  const [meta, setMeta] = useState('');
  const [titleAction, setTitleAction] = useState<ReactNode>(null);
  return (
    <PageTitleContext.Provider
      value={{ title, meta, titleAction, setTitle, setMeta, setTitleAction }}
    >
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle(): PageTitleContextValue {
  return useContext(PageTitleContext);
}

export function PageTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} · akari`;
  }, [title]);
  return null;
}
