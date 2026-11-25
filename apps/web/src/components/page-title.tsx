'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type PageTitleContextValue = {
  title: string;
  meta: string;
  setTitle: (title: string) => void;
  setMeta: (meta: string) => void;
};

const PageTitleContext = createContext<PageTitleContextValue>({
  title: '',
  meta: '',
  setTitle: () => {},
  setMeta: () => {},
});

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('');
  const [meta, setMeta] = useState('');
  return (
    <PageTitleContext.Provider value={{ title, meta, setTitle, setMeta }}>
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
