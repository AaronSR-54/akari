import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const cloudState = vi.hoisted(() => ({
  hasLocalData: false,
  hasUnlinkedLocalData: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signInWithGoogle: vi.fn(),
}));

vi.mock('./cloud-provider', () => ({
  useCloud: () => ({
    enabled: true,
    hasLocalData: cloudState.hasLocalData,
    hasUnlinkedLocalData: cloudState.hasUnlinkedLocalData,
    signIn: cloudState.signIn,
    signUp: cloudState.signUp,
    signInWithGoogle: cloudState.signInWithGoogle,
  }),
}));

vi.mock('@akari/ui', async () => {
  const actual = await vi.importActual<typeof import('@akari/ui')>('@akari/ui');
  return { ...actual, useToast: () => ({ toast: vi.fn() }) };
});

import { CloudAuthDialog, CloudAuthForm } from './account-panel';

describe('CloudAuthDialog', () => {
  beforeEach(() => {
    cloudState.hasLocalData = false;
    cloudState.hasUnlinkedLocalData = false;
    cloudState.signIn.mockReset().mockResolvedValue({ needsConfirmation: false });
    cloudState.signUp.mockReset().mockResolvedValue({ needsConfirmation: false });
    cloudState.signInWithGoogle.mockReset().mockResolvedValue(undefined);
  });

  it('muestra la marca, el acceso con Google y el alta en dos pasos', async () => {
    const user = userEvent.setup();
    render(<CloudAuthDialog open onClose={() => undefined} />);

    const dialog = screen.getByRole('dialog', { name: 'Tu cuenta en la nube' });
    expect(within(dialog).getByRole('img', { name: 'akari' })).toBeVisible();
    expect(within(dialog).getByRole('tab', { name: 'Iniciar sesión' })).toBeVisible();
    expect(within(dialog).getByRole('tab', { name: 'Crear cuenta' })).toBeVisible();
    expect(within(dialog).getByRole('button', { name: 'Registrarse con Google' })).toBeVisible();
    expect(
      within(dialog).getByRole('button', { name: 'Continuar sin registrarte' }),
    ).toBeVisible();
    expect(within(dialog).getByRole('textbox', { name: /Email/ })).toBeVisible();
    expect(within(dialog).queryByLabelText(/Repite la contraseña/)).toBeNull();

    await user.type(within(dialog).getByRole('textbox', { name: /Email/ }), 'ana@example.com');
    await user.click(within(dialog).getByRole('button', { name: 'Continuar' }));

    expect(within(dialog).getByLabelText(/^Contraseña/)).toBeVisible();
    expect(within(dialog).getByLabelText(/Repite la contraseña/)).toBeVisible();
    expect(within(dialog).queryByText(/Creando cuenta para/)).toBeNull();
    expect(within(dialog).queryByRole('button', { name: 'Registrarse con Google' })).toBeNull();
    expect(
      within(dialog).getByRole('button', { name: 'Continuar sin registrarte' }),
    ).toBeVisible();

    await user.click(within(dialog).getByRole('tab', { name: 'Iniciar sesión' }));
    expect(
      within(dialog).getByRole('button', { name: 'Iniciar sesión con Google' }),
    ).toBeVisible();
    expect(within(dialog).getByLabelText(/^Contraseña/)).toBeVisible();
  });

  it('pide qué hacer con los datos locales después de intentar entrar', async () => {
    const user = userEvent.setup();
    cloudState.hasLocalData = true;
    cloudState.hasUnlinkedLocalData = true;

    render(<CloudAuthDialog open onClose={() => undefined} />);
    const dialog = screen.getByRole('dialog', { name: 'Tu cuenta en la nube' });
    await user.click(within(dialog).getByRole('tab', { name: 'Iniciar sesión' }));

    expect(
      within(dialog).queryByRole('group', { name: 'Qué hacer con los datos locales' }),
    ).toBeNull();

    await user.type(within(dialog).getByRole('textbox', { name: /Email/ }), 'ana@example.com');
    await user.type(within(dialog).getByLabelText(/^Contraseña/), 'secreto123');
    await user.click(within(dialog).getByRole('button', { name: 'Entrar' }));

    expect(
      within(dialog).getByRole('group', { name: 'Qué hacer con los datos locales' }),
    ).toBeVisible();
    expect(
      within(dialog).getByText(/Este dispositivo tiene datos que no están en tu cuenta/),
    ).toBeVisible();
    expect(cloudState.signIn).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'Usar los de la cuenta' }));
    await user.click(within(dialog).getByRole('button', { name: 'Continuar' }));

    expect(cloudState.signIn).toHaveBeenCalledWith('ana@example.com', 'secreto123', {
      localData: 'discard',
    });
  });

  it('vuelve a las credenciales sin perder lo escrito', async () => {
    const user = userEvent.setup();
    cloudState.hasLocalData = true;
    cloudState.hasUnlinkedLocalData = true;

    render(<CloudAuthDialog open onClose={() => undefined} />);
    const dialog = screen.getByRole('dialog', { name: 'Tu cuenta en la nube' });
    await user.click(within(dialog).getByRole('tab', { name: 'Iniciar sesión' }));
    await user.type(within(dialog).getByRole('textbox', { name: /Email/ }), 'ana@example.com');
    await user.type(within(dialog).getByLabelText(/^Contraseña/), 'secreto123');
    await user.click(within(dialog).getByRole('button', { name: 'Entrar' }));

    await user.click(within(dialog).getByRole('button', { name: 'Volver' }));

    expect(within(dialog).getByRole('textbox', { name: /Email/ })).toHaveValue('ana@example.com');
    expect(
      within(dialog).queryByRole('group', { name: 'Qué hacer con los datos locales' }),
    ).toBeNull();
  });

  it('no muestra el selector cuando los datos locales ya pertenecen a la cuenta', async () => {
    const user = userEvent.setup();
    cloudState.hasLocalData = true;
    cloudState.hasUnlinkedLocalData = false;

    render(<CloudAuthDialog open onClose={() => undefined} />);
    const dialog = screen.getByRole('dialog', { name: 'Tu cuenta en la nube' });
    await user.click(within(dialog).getByRole('tab', { name: 'Iniciar sesión' }));
    await user.type(within(dialog).getByRole('textbox', { name: /Email/ }), 'ana@example.com');
    await user.type(within(dialog).getByLabelText(/^Contraseña/), 'secreto123');
    await user.click(within(dialog).getByRole('button', { name: 'Entrar' }));

    expect(
      within(dialog).queryByRole('group', { name: 'Qué hacer con los datos locales' }),
    ).toBeNull();
    expect(cloudState.signIn).toHaveBeenCalled();
  });

  it('avisa si el acceso es un alta o un inicio de sesión para enrutar después', async () => {
    const user = userEvent.setup();
    const onAccessIntent = vi.fn();

    render(<CloudAuthForm initialMode="signup" onAccessIntent={onAccessIntent} />);

    await user.type(screen.getByRole('textbox', { name: /Email/ }), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.type(screen.getByLabelText(/^Contraseña/), 'secreto123');
    await user.type(screen.getByLabelText(/Repite la contraseña/), 'secreto123');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(onAccessIntent).toHaveBeenCalledWith('signup');

    await user.click(screen.getByRole('tab', { name: 'Iniciar sesión' }));
    await user.type(screen.getByRole('textbox', { name: /Email/ }), 'ana@example.com');
    await user.type(screen.getByLabelText(/^Contraseña/), 'secreto123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(onAccessIntent).toHaveBeenCalledWith('signin');
  });
});
