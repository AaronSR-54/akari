export class KanSyncError extends Error {
  constructor(message, code = 'ERROR') {
    super(message);
    this.name = 'KanSyncError';
    this.code = code;
  }
}
