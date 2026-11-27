const overlayStack: string[] = [];

let scrollLockCount = 0;
let previousBodyOverflow = '';
let previousRootOverflow = '';
let previousScrollLocked = '';

/** Registra un overlay abierto; el último registrado es la capa superior. */
export function pushOverlay(id: string) {
  if (!overlayStack.includes(id)) overlayStack.push(id);
}

/** Retira un overlay de la pila sin alterar el resto. */
export function popOverlay(id: string) {
  const index = overlayStack.lastIndexOf(id);
  if (index >= 0) overlayStack.splice(index, 1);
}

/** Indica si el overlay es la capa superior y, por tanto, atiende teclado. */
export function isTopOverlay(id: string): boolean {
  return overlayStack[overlayStack.length - 1] === id;
}

/** Bloquea el scroll del documento y devuelve la función que lo libera. */
export function acquireScrollLock(): () => void {
  if (scrollLockCount === 0) {
    if (typeof document !== 'undefined') {
      previousBodyOverflow = document.body.style.overflow;
      previousRootOverflow = document.documentElement.style.overflow;
      previousScrollLocked = document.documentElement.dataset.scrollLocked ?? '';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.dataset.scrollLocked = 'true';
    }
  }
  scrollLockCount += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0 && typeof document !== 'undefined') {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      if (previousScrollLocked) {
        document.documentElement.dataset.scrollLocked = previousScrollLocked;
      } else {
        delete document.documentElement.dataset.scrollLocked;
      }
    }
  };
}

/** Número de overlays con el scroll bloqueado; expuesto para pruebas. */
export function scrollLockDepth(): number {
  return scrollLockCount;
}
