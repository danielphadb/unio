// Verlustfreie Serialisierung beliebiger JS-Werte nach JSON (laeuft im Browser).
// Reine JSON-Werte bleiben unveraendert. Alles andere bekommt eine Markierung:
// {"$undefined":true}, {"$num":"NaN"|"-0"|"Infinity"}, {"$fn":"<Quelltext>"},
// {"$regexp":src,"flags":f}, {"$set":[...]}, {"$map":[[k,v],...]},
// {"$class":"Name","props":{...}}, {"$cycle":true}, {"$error":"..."}.
// Schluessel, die mit "$" beginnen, werden als "$$..." geschrieben.
// eslint-disable-next-line no-unused-vars
function __serialize(value, opts = {}) {
  const maxDepth = opts.maxDepth ?? 60;
  let budget = opts.maxNodes ?? Infinity;
  const stack = new Set();
  let special = 0;
  const mark = (o) => {
    special++;
    return o;
  };
  const walk = (v, depth) => {
    if (v === null || typeof v === "boolean" || typeof v === "string") return v;
    if (typeof v === "number") {
      if (Object.is(v, -0)) return mark({ $num: "-0" });
      return Number.isFinite(v) ? v : mark({ $num: String(v) });
    }
    if (v === undefined) return mark({ $undefined: true });
    if (typeof v === "bigint") return mark({ $bigint: String(v) });
    if (typeof v === "symbol") return mark({ $symbol: String(v) });
    if (typeof v === "function") return mark({ $fn: Function.prototype.toString.call(v) });
    if (depth > maxDepth) return mark({ $depth: true });
    if (--budget < 0) throw new Error("__budget__");
    if (typeof window !== "undefined" && v === window) return mark({ $global: "window" });
    if (stack.has(v)) return mark({ $cycle: true });
    stack.add(v);
    try {
      if (v instanceof RegExp) return mark({ $regexp: v.source, flags: v.flags });
      if (v instanceof Date) return mark({ $date: v.toISOString() });
      if (v instanceof Set) return mark({ $set: [...v].map((x) => walk(x, depth + 1)) });
      if (v instanceof Map)
        return mark({ $map: [...v].map(([k, x]) => [walk(k, depth + 1), walk(x, depth + 1)]) });
      if (ArrayBuffer.isView(v) || v instanceof ArrayBuffer)
        return mark({ $typed: v.constructor.name, length: v.byteLength });
      if (Array.isArray(v)) {
        const out = new Array(v.length);
        for (let i = 0; i < v.length; i++) out[i] = i in v ? walk(v[i], depth + 1) : mark({ $hole: true });
        return out;
      }
      if (typeof Node !== "undefined" && v instanceof Node) return mark({ $class: "DOMNode" });
      const proto = Object.getPrototypeOf(v);
      const plain = proto === Object.prototype || proto === null;
      const props = {};
      for (const k of Object.keys(v)) {
        let x;
        try {
          x = v[k];
        } catch (e) {
          x = undefined;
          props[k.startsWith("$") ? "$" + k : k] = mark({ $error: String(e) });
          continue;
        }
        props[k.startsWith("$") ? "$" + k : k] = walk(x, depth + 1);
      }
      if (plain) return props;
      return mark({ $class: proto?.constructor?.name ?? "?", props });
    } finally {
      stack.delete(v);
    }
  };
  try {
    const json = walk(value, 0);
    return { json, special };
  } catch (e) {
    if (String(e.message) === "__budget__") return { json: { $tooLarge: true }, special: 1 };
    throw e;
  }
}
