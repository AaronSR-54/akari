export class ValidationError extends Error {
  readonly code = 'VALIDATION';
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class NotFoundError extends Error {
  readonly code = 'NOT_FOUND';

  constructor(message = 'No se ha encontrado el recurso') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class StorageError extends Error {
  readonly code = 'STORAGE';
  readonly reason: 'quota' | 'unavailable' | 'unknown';

  constructor(message: string, reason: 'quota' | 'unavailable' | 'unknown' = 'unknown') {
    super(message);
    this.name = 'StorageError';
    this.reason = reason;
  }
}

export function toStorageError(error: unknown): StorageError {
  if (error instanceof StorageError) return error;
  const name = error instanceof Error ? error.name : '';
  const message = error instanceof Error ? error.message : String(error);

  if (name === 'QuotaExceededError' || /quota/i.test(message)) {
    return new StorageError(
      'No hay espacio suficiente en este navegador. Libera espacio o exporta una copia de tus datos.',
      'quota',
    );
  }
  if (name === 'SecurityError' || name === 'InvalidStateError' || /denied|blocked/i.test(message)) {
    return new StorageError(
      'Este navegador no permite almacenamiento local en este modo. Prueba sin navegación privada.',
      'unavailable',
    );
  }
  if (/indexeddb|indexed db/i.test(message)) {
    return new StorageError('El almacenamiento local no está disponible en este navegador.', 'unavailable');
  }
  return new StorageError('No se han podido guardar los datos en este dispositivo.', 'unknown');
}
