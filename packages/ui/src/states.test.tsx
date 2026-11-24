import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './states.js';
import { StatePage, type StateType } from './states.js';
import { Button } from './buttons.js';

const types: StateType[] = ['empty', 'error', 'offline', 'insufficient', 'success'];

describe('states', () => {
  it('cada tipo de estado explica la situación y ofrece acción', () => {
    for (const type of types) {
      const { unmount } = render(
        <StatePage
          type={type}
          title={`Estado ${type}`}
          description="Explicación y siguiente paso."
          primaryAction={<Button>Continuar</Button>}
        />,
      );
      expect(screen.getByRole('heading', { name: `Estado ${type}` })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
      unmount();
    }
  });

  it('los esqueletos conservan la forma del contenido', () => {
    for (const type of ['text', 'list', 'card'] as const) {
      const { unmount } = render(<Skeleton type={type} />);
      expect(screen.getByRole('status')).toHaveAccessibleName('Cargando contenido');
      unmount();
    }
  });
});
