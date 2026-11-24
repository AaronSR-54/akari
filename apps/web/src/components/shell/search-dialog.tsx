'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Modal, SearchField } from '@akari/ui';
import { useAccounts, useGroups, useMovements } from '../hooks';

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const accounts = useAccounts();
  const movements = useMovements();
  const groups = useGroups();
  const normalized = query.trim().toLowerCase();

  const accountResults = (accounts ?? [])
    .filter((account) => account.name.toLowerCase().includes(normalized))
    .slice(0, 4);
  const movementResults = (movements ?? [])
    .filter((movement) => movement.concept.toLowerCase().includes(normalized))
    .slice(0, 4);
  const groupResults = (groups ?? [])
    .filter((group) => group.name.toLowerCase().includes(normalized))
    .slice(0, 4);

  return (
    <Modal open={open} onClose={onClose} title="Buscar en akari">
      <SearchField
        aria-label="Buscar cuentas, movimientos y grupos"
        placeholder="Cuentas, movimientos y grupos"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        data-autofocus
      />
      <div className="mt-4 flex flex-col gap-4">
        {normalized.length === 0 ? (
          <p className="text-ui-11 text-text-tertiary">
            Escribe para buscar. Atajos: <kbd>⌘K</kbd> abre, <kbd>Esc</kbd> cierra.
          </p>
        ) : null}

        {accountResults.length > 0 ? (
          <section>
            <h3 className="mb-1 text-ui-10-strong uppercase tracking-wide text-text-tertiary">Cuentas</h3>
            <ul className="flex flex-col">
              {accountResults.map((account) => (
                <li key={account.id}>
                  <Link
                    href={`/cuentas/${account.id}`}
                    onClick={onClose}
                    className="block rounded-lg px-2 py-2 text-ui-12 text-text-primary hover:bg-surface-sunken"
                  >
                    {account.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {movementResults.length > 0 ? (
          <section>
            <h3 className="mb-1 text-ui-10-strong uppercase tracking-wide text-text-tertiary">Movimientos</h3>
            <ul className="flex flex-col">
              {movementResults.map((movement) => (
                <li key={movement.id}>
                  <Link
                    href="/movimientos"
                    onClick={onClose}
                    className="block rounded-lg px-2 py-2 text-ui-12 text-text-primary hover:bg-surface-sunken"
                  >
                    {movement.concept} · {movement.category}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {groupResults.length > 0 ? (
          <section>
            <h3 className="mb-1 text-ui-10-strong uppercase tracking-wide text-text-tertiary">Grupos</h3>
            <ul className="flex flex-col">
              {groupResults.map((group) => (
                <li key={group.id}>
                  <Link
                    href={`/grupos/${group.id}`}
                    onClick={onClose}
                    className="block rounded-lg px-2 py-2 text-ui-12 text-text-primary hover:bg-surface-sunken"
                  >
                    {group.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {normalized.length > 0 &&
        accountResults.length + movementResults.length + groupResults.length === 0 ? (
          <p className="text-ui-12 text-text-secondary">No hay resultados para «{query}».</p>
        ) : null}
      </div>
    </Modal>
  );
}
