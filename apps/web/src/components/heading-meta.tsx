'use client';

/** Contexto que antes vivía en el subtítulo de la cabecera, con la misma tipografía que el resumen. */
export function HeadingMeta({ label, detail }: { label?: string; detail?: string }) {
  return (
    <p className="text-ui-13-strong text-text-primary">
      {label ? <span className="font-bold">{label}</span> : null}
      {detail ? (
        <span className="font-normal italic">{label ? ` · ${detail}` : detail}</span>
      ) : null}
    </p>
  );
}
