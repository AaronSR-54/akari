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
    const expected = `${title} · akari`;
    const apply = () => {
      // Next puede reaplicar el título por defecto al hidratar; lo corregimos.
      if (document.title !== expected) document.title = expected;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [title]);
  return null;
}
