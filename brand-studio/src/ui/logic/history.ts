const HISTORY_MAX = 50;

export function createHistory(e: any) {
  return { past: [], present: e, label: "", future: [] };
}

export function pushHistory(e: any, t: any, n: any, a: any = false) {
  if (a && e.past.length) return { ...e, present: t, label: n, future: [] };
  const l = [...e.past, { value: e.present, label: e.label }];
  for (; l.length > HISTORY_MAX; ) l.shift();
  return { past: l, present: t, label: n, future: [] };
}

export function undo(e: any) {
  const t = e.past[e.past.length - 1];
  return t
    ? {
        label: e.label,
        state: {
          past: e.past.slice(0, -1),
          present: t.value,
          label: t.label,
          future: [{ value: e.present, label: e.label }, ...e.future],
        },
      }
    : null;
}

export function redo(e: any) {
  const t = e.future[0];
  return t
    ? {
        label: t.label,
        state: {
          past: [...e.past, { value: e.present, label: e.label }],
          present: t.value,
          label: t.label,
          future: e.future.slice(1),
        },
      }
    : null;
}

const historyKey = (e: any, t: any) => `unio-brand:history:${e}:${t}`;

export function readHistory(e: any, t: any) {
  try {
    const n = sessionStorage.getItem(historyKey(e, t));
    return n ? JSON.parse(n) : null;
  } catch {
    return null;
  }
}

export function writeHistory(e: any, t: any, n: any) {
  try {
    sessionStorage.setItem(historyKey(e, t), JSON.stringify(n));
  } catch {}
}
