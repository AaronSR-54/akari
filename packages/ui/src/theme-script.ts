export const THEME_STORAGE_KEY = 'akari-theme';

export function themeScript(): string {
  return `(function(){try{var p=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var r=p==='dark'||(p==='system'&&d)?'dark':'light';document.documentElement.dataset.theme=r;document.documentElement.style.colorScheme=r;}catch(e){document.documentElement.dataset.theme='light';}})();`;
}
