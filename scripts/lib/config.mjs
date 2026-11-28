import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KanSyncError } from './errors.mjs';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const DEFAULT_CONFIG_FILE = resolve(ROOT, 'kan.config.json');
export const DEFAULT_ENV_FILE = resolve(ROOT, '.env');

export function loadEnvText(text) {
  const values = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    if (!key) continue;
    let value = line.slice(separator + 1).trim();
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (quoted && value.length >= 2) value = value.slice(1, -1);
    values[key] = value;
  }
  return values;
}

function defaultRunGit(args, { cwd } = {}) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

/**
 * Devuelve la raíz del checkout principal. En un worktree enlazado,
 * `--git-common-dir` apunta al `.git` del checkout principal.
 */
export function resolveMainRoot({ cwd = process.cwd(), runGit = defaultRunGit } = {}) {
  const message =
    'No se pudo resolver el directorio común de Git para leer la configuración. ' +
    'Define kan_API_KEY y kan_CURRENT_USER en el entorno o ejecuta la herramienta desde el checkout principal con .env.';
  let commonDir;
  try {
    const result = runGit(['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd });
    commonDir = typeof result === 'string' ? result : result?.stdout;
  } catch {
    throw new KanSyncError(message, 'MAIN_ROOT_UNRESOLVED');
  }
  if (!commonDir || typeof commonDir !== 'string' || !commonDir.trim()) {
    throw new KanSyncError(message, 'MAIN_ROOT_UNRESOLVED');
  }
  return dirname(resolve(cwd, commonDir.trim()));
}

export function resolveEnvFile({ cwd = process.cwd(), runGit = defaultRunGit } = {}) {
  return resolve(resolveMainRoot({ cwd, runGit }), '.env');
}

export function readEnv({ envFile, env = process.env, cwd = process.cwd(), runGit } = {}) {
  const file = envFile === undefined ? resolveEnvFile({ cwd, runGit }) : envFile;
  const fromFile = file && existsSync(file) ? loadEnvText(readFileSync(file, 'utf8')) : {};
  const merged = { ...fromFile };
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string') merged[key] = value;
  }
  return merged;
}

export function parseConfig(text, source = DEFAULT_CONFIG_FILE) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new KanSyncError(`No se pudo leer ${source}: ${error.message}`, 'CONFIG_INVALID');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new KanSyncError(`${source} debe contener un objeto JSON.`, 'CONFIG_INVALID');
  }

  const baseUrl = typeof data.baseUrl === 'string' ? data.baseUrl.trim().replace(/\/+$/, '') : '';
  if (!baseUrl) {
    throw new KanSyncError(`Falta "baseUrl" en ${source}, por ejemplo "https://kan.example.com/api/v1".`, 'CONFIG_INVALID');
  }
  if (!/^https?:\/\//.test(baseUrl)) {
    throw new KanSyncError(`"baseUrl" en ${source} debe empezar por http:// o https://.`, 'CONFIG_INVALID');
  }

  const boardPublicId = typeof data.boardPublicId === 'string' ? data.boardPublicId.trim() : '';
  if (!boardPublicId) {
    throw new KanSyncError(`Falta "boardPublicId" en ${source}; obtenlo con "npm exec -- node scripts/kan-sync.mjs discover".`, 'CONFIG_INVALID');
  }

  const lists = data.lists;
  const normalizedLists = {};
  for (const key of ['todo', 'inProgress', 'done']) {
    const value = typeof lists?.[key] === 'string' ? lists[key].trim() : '';
    if (!value) {
      throw new KanSyncError(`Falta "lists.${key}" en ${source}.`, 'CONFIG_INVALID');
    }
    normalizedLists[key] = value;
  }

  const review = typeof lists?.review === 'string' ? lists.review.trim() : '';
  if (review) normalizedLists.review = review;

  return { baseUrl, boardPublicId, lists: normalizedLists, source };
}

export function readConfig({ configFile = DEFAULT_CONFIG_FILE } = {}) {
  if (!existsSync(configFile)) {
    throw new KanSyncError(
      `No existe ${configFile}. Crea kan.config.json con "baseUrl", "boardPublicId" y "lists". Consulta docs/desarrollo/kanban.md.`,
      'CONFIG_MISSING'
    );
  }
  return parseConfig(readFileSync(configFile, 'utf8'), configFile);
}
