'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  backupToJson,
  exportBackup,
  getStorageStatus,
  importBackup,
  loadDemoDatabase,
  resetDatabase,
  storageErrorMessage,
  type StorageStatus,
} from '@akari/data';
import { appNow } from '../../lib/clock';
import {
  Badge,
  Banner,
  Button,
  Card,
  Inline,
  Modal,
  SectionHeader,
  SelectPill,
  SettingRow,
  Stack,
  useToast,
  useTheme,
} from '@akari/ui';
import { useSettings } from '../../components/hooks';
import { PageTitle } from '../../components/page-title';
import { PageHeaderResponsive } from '../../components/page-header-responsive';
import { useData } from '../../components/providers';
import { PageSkeleton } from '../../components/page-skeleton';

const DOCS_URL = 'https://github.com/AaronSR-54/akari/blob/main/docs/desarrollo/desviaciones.md';

function formatBytes(value: number | null): string {
  if (value === null) return '—';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export function SettingsScreen() {
  const settings = useSettings();
  const { db, repositories } = useData();
  const { toast } = useToast();
  const { preference, setPreference } = useTheme();
  const router = useRouter();
  const [storage, setStorage] = useState<StorageStatus | null>(null);
  const [confirm, setConfirm] = useState<'reset' | 'demo' | 'import' | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void getStorageStatus().then(setStorage);
  }, []);

  if (!settings) {
    return <PageSkeleton variant="single" />;
  }

  const update = async (patch: Parameters<typeof repositories.settings.update>[0]) => {
    try {
      await repositories.settings.update(patch);
      toast({ title: 'Ajustes guardados', tone: 'success' });
    } catch (error) {
      toast({ title: 'No se han podido guardar', description: storageErrorMessage(error), tone: 'error' });
    }
  };

  const exportData = async () => {
    try {
      const backup = await exportBackup(db);
      const blob = new Blob([backupToJson(backup)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `akari-copia-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Copia exportada', description: 'Recuerda que no está cifrada.', tone: 'success' });
    } catch (error) {
      toast({ title: 'No se ha podido exportar', description: storageErrorMessage(error), tone: 'error' });
    }
  };

  const importData = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const result = await importBackup(db, parsed);
      setConfirm(null);
      toast({ title: 'Copia importada', description: `${result.imported} registros restaurados.`, tone: 'success' });
    } catch (error) {
      toast({
        title: 'No se ha podido importar',
        description: error instanceof Error ? error.message : storageErrorMessage(error),
        tone: 'error',
      });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const loadDemo = async () => {
    setBusy(true);
    try {
      await loadDemoDatabase(db, appNow());
      setConfirm(null);
      toast({ title: 'Datos de ejemplo cargados', tone: 'success' });
      router.replace('/');
    } catch (error) {
      toast({ title: 'No se han podido cargar los datos', description: storageErrorMessage(error), tone: 'error' });
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    try {
      await resetDatabase(db);
      setConfirm(null);
      toast({ title: 'Datos eliminados', tone: 'success' });
      router.replace('/onboarding');
    } catch (error) {
      toast({ title: 'No se han podido eliminar', description: storageErrorMessage(error), tone: 'error' });
      setBusy(false);
    }
  };

  const usagePercent =
    storage?.usage && storage.quota ? Math.min(100, Math.round((storage.usage / storage.quota) * 100)) : 0;

  return (
    <div>
      <PageTitle title="Datos y sincronización" />
      <Stack gap={5}>
        <PageHeaderResponsive
          title="Datos y sincronización"
          meta="La base local vive en este dispositivo. La nube es opcional y aún no está activa."
          actions={
            <Button variant="secondary" onClick={exportData}>
              Exportar copia
            </Button>
          }
        />

        <Banner tone="info" title="Esta fase es local y sin cifrado">
          Los datos se guardan en este navegador. La sincronización, el cifrado y la contraseña local
          llegarán en un cambio posterior. No uses datos reales sensibles.{' '}
          <a href={DOCS_URL} className="underline underline-offset-4" target="_blank" rel="noreferrer">
            Ver desviaciones documentadas
          </a>
          .
        </Banner>

        <div className="grid gap-4 lg:grid-cols-[1.06fr_1fr]">
          <Card padding="none" className="px-5 py-2">
            <div className="flex flex-col divide-y divide-border-subtle">
              <SettingRow
                title="Ubicación de los datos"
                description="Base local en este dispositivo · IndexedDB, sin cifrar"
                action={<Badge tone="neutral">Local</Badge>}
              />
              <SettingRow
                title="Apariencia"
                description={`Tema ${preference} · navegación ${settings.shellMode === 'header' ? 'superior' : 'lateral'}`}
                action={
                  <div className="flex flex-wrap justify-end gap-2">
                    <SelectPill
                      ariaLabel="Tema"
                      value={preference}
                      onChange={(value) => {
                        const next = value as 'light' | 'dark' | 'system';
                        setPreference(next);
                        void update({ theme: next });
                      }}
                      options={[
                        { value: 'system', label: 'Sistema' },
                        { value: 'light', label: 'Claro' },
                        { value: 'dark', label: 'Oscuro' },
                      ]}
                    />
                    <SelectPill
                      ariaLabel="Navegación de escritorio"
                      value={settings.shellMode}
                      onChange={(value) => void update({ shellMode: value as 'sidebar' | 'header' })}
                      options={[
                        { value: 'sidebar', label: 'Sidebar' },
                        { value: 'header', label: 'Header' },
                      ]}
                    />
                  </div>
                }
              />
              <SettingRow
                title="Sincronización en la nube"
                description="Desactivada · no hay servidor ni conflictos remotos"
                action={<Badge tone="neutral">No disponible</Badge>}
              />
              <SettingRow
                title="Contraseña"
                description="No configurada · llegará con el cifrado local"
                action={<Badge tone="warning">Pendiente</Badge>}
              />
              <SettingRow
                title="Exportar copia"
                description="Archivo JSON legible con todos los datos, sin cifrar"
                action={
                  <Button variant="secondary" size="sm" onClick={exportData}>
                    Exportar
                  </Button>
                }
              />
              <SettingRow
                title="Importar copia"
                description="Restaura una copia exportada desde este u otro navegador"
                action={
                  <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} loading={busy}>
                    Importar
                  </Button>
                }
              />
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="sr-only"
                aria-label="Archivo de copia de seguridad"
                onChange={(event) => void importData(event.target.files?.[0] ?? null)}
              />
              <SettingRow
                title="Datos de ejemplo"
                description="Sustituye los datos actuales por cuentas, movimientos y grupos de ejemplo"
                action={
                  <Button variant="secondary" size="sm" onClick={() => setConfirm('demo')}>
                    Cargar
                  </Button>
                }
              />
              <SettingRow
                title="Borrar base local"
                description="Elimina los datos de este dispositivo. No se puede deshacer"
                danger
                action={
                  <Button variant="tertiary" size="sm" onClick={() => setConfirm('reset')}>
                    Borrar
                  </Button>
                }
              />
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            <Card padding="md" className="flex flex-col gap-1.5">
              <p className="text-ui-11 text-text-secondary">Estado del almacenamiento</p>
              <p
                className={
                  storage?.available
                    ? 'text-ui-24-bold text-text-primary'
                    : 'text-ui-24-bold text-status-danger-text'
                }
              >
                {storage?.available ? 'Disponible' : 'No disponible'}
              </p>
              <p className="text-ui-10 text-text-secondary">
                {formatBytes(storage?.usage ?? null)} de {formatBytes(storage?.quota ?? null)} ·{' '}
                {storage?.persisted === null || storage?.persisted === undefined
                  ? 'persistencia no confirmada'
                  : storage.persisted
                    ? 'persistencia concedida'
                    : 'persistencia no concedida'}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-sunken">
                <div className="h-full rounded-full bg-accent-default" style={{ width: `${Math.max(4, usagePercent)}%` }} />
              </div>
              <p className="mt-2 text-ui-10 text-text-secondary">
                {storage?.message ?? 'Comprobando almacenamiento…'}
              </p>
            </Card>

            <Card padding="md" className="flex flex-col gap-1.5">
              <p className="text-ui-11 text-text-secondary">Copia de seguridad</p>
              <p className="text-ui-24-bold text-text-primary">Sin cifrar</p>
              <p className="text-ui-10 text-text-secondary">
                El archivo se puede leer con cualquier editor. Guárdalo en un lugar seguro o espera al
                cambio de cifrado.
              </p>
            </Card>

            <Card padding="md" className="flex flex-col gap-1.5">
              <SectionHeader title="Límites de esta fase" />
              <p className="text-ui-10 text-text-secondary">
                Sin nube, sin contraseña y sin app móvil. Todo se guarda en IndexedDB y se puede
                exportar o borrar desde esta pantalla.
              </p>
              <Inline className="pt-1">
                <a
                  href={DOCS_URL}
                  className="text-ui-11-strong text-accent-strong underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Leer desviaciones
                </a>
              </Inline>
            </Card>
          </div>
        </div>
      </Stack>

      <Modal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={
          confirm === 'demo'
            ? 'Cargar datos de ejemplo'
            : confirm === 'import'
              ? 'Importar copia'
              : 'Borrar base local'
        }
        footer={
          <>
            <Button variant="tertiary" onClick={() => setConfirm(null)}>
              Cancelar
            </Button>
            <Button onClick={confirm === 'demo' ? loadDemo : reset} loading={busy}>
              {confirm === 'demo' ? 'Cargar ejemplos' : 'Borrar datos'}
            </Button>
          </>
        }
      >
        {confirm === 'demo'
          ? 'Los datos actuales se sustituirán por cuentas, movimientos y grupos de ejemplo.'
          : 'Se borrarán todas las cuentas, movimientos y grupos de este navegador. Exporta una copia antes si quieres conservarlos.'}
      </Modal>
    </div>
  );
}
