// Vergleich mit der gesicherten Fassung (svg-Chunk): SVG-Dokument, Bounding Box.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { beforeAll, describe, expect, it } from "vitest";
import { recovered } from "../helpers/recovered";
import { rng } from "../../src/engine/rng";
import * as svg from "../../src/engine/svg";

let old: Record<string, any>;
beforeAll(async () => {
  old = await recovered("svg");
});

function files(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) files(p, out);
    else if (f.endsWith(".svg") || f.endsWith(".svg.gz")) out.push(p);
  }
  return out;
}

const golden = join(__dirname, "..", "golden");
const SAMPLES = [
  ...files(join(golden, "logo", "svg")),
  ...files(join(golden, "names", "svg")),
  ...files(join(golden, "postings", "svg")).filter((_, i) => i % 7 === 0),
].map((p) =>
  p.endsWith(".gz")
    ? gunzipSync(readFileSync(p)).toString("utf8")
    : readFileSync(p, "utf8"),
);

function randomPath(seed: number): string {
  const r = rng(seed);
  const cmds = "MmLlHhVvCcSsQqTtAaZz";
  let d = `M${r.int(-50, 50)} ${r.int(-50, 50)}`;
  const n = () => (r.next() * 200 - 100).toFixed(r.int(0, 3));
  for (let i = 0; i < 12; i++) {
    const c = cmds[r.int(0, cmds.length - 1)]!;
    const args: Record<string, () => string> = {
      M: () => `${n()} ${n()}`,
      L: () => `${n()},${n()}`,
      H: n,
      V: n,
      C: () => `${n()} ${n()} ${n()} ${n()} ${n()} ${n()}`,
      S: () => `${n()} ${n()} ${n()} ${n()}`,
      Q: () => `${n()} ${n()} ${n()} ${n()}`,
      T: () => `${n()} ${n()}`,
      A: () =>
        `${Math.abs(+n())} ${Math.abs(+n()) * (r.chance(0.1) ? 0 : 1)} ${r.int(0, 90)} ${r.int(0, 1)} ${r.int(0, 1)} ${n()} ${n()}`,
      Z: () => (r.chance(0.5) ? `${n()} ${n()}` : ""),
    };
    d += c + args[c.toUpperCase()]!();
  }
  return d;
}

describe("SVG-Helfer (bitgenau)", () => {
  it("fmt", () => {
    for (const v of [
      0,
      -0,
      1,
      -1,
      0.5,
      0.005,
      1.995,
      123.456789,
      -0.0001,
      1e21,
      1 / 3,
      NaN,
      Infinity,
    ])
      for (const d of [0, 1, 2, 3, 5]) expect(svg.fmt(v, d)).toBe(old.D(v, d));
  });
  it("svgDocument und placePart", () => {
    const part = {
      body: '<path d="M0 0L10 10"/>',
      width: 120.123,
      height: 33.3,
    };
    const opts = [
      undefined,
      {},
      { padding: 4 },
      { width: 300 },
      { height: 90 },
      { width: 10, height: 10 },
      { background: "#abc" },
      { background: "kaputt" },
      { padding: 2.5, background: " #FAF7F2 ", width: 640 },
    ];
    for (const o of opts)
      expect(svg.svgDocument(part, o)).toBe(old.wt(part, o));
    expect(svg.svgDocument({ body: "", width: -5, height: 0 })).toBe(
      old.wt({ body: "", width: -5, height: 0 }),
    );
    for (const s of [1, 0.123456789, 2])
      expect(svg.placePart(part, 1.234, -5, s)).toBe(
        old.Mt(part, 1.234, -5, s),
      );
    expect(svg.placePart({ body: "" }, 1, 2)).toBe(old.Mt({ body: "" }, 1, 2));
  });
  it("parseTransform und parseAttributes", () => {
    const ts = [
      undefined,
      "",
      "translate(3)",
      "translate(3 4) scale(2)",
      "scale(2,3) rotate(30 5 5)",
      "matrix(1 0.2 0.3 1 5 6)",
      "skewX(10) skewY(-5) rotate(-90)",
      "rotate(45)scale(0.5)",
    ];
    for (const t of ts) expect(svg.parseTransform(t)).toEqual(old.mt(t));
    const attrs = [
      ' d="M0 0" fill="#fff" style="stroke: red; opacity:0.5"',
      " x='1' y=\"2\" data-x:y.z='q'",
      "",
    ];
    for (const a of attrs) expect(svg.parseAttributes(a)).toEqual(old.pt(a));
  });
  it("pathPoints mit zufaelligen Pfaden", () => {
    for (let s = 0; s < 400; s++) {
      const d = randomPath(s);
      expect(svg.pathPoints(d)).toEqual(old.ft(d));
    }
    for (const d of [
      "",
      "garbage",
      "10 20",
      "M1e2-3.5.5L.5.5Z",
      "m0 0 10 0 0 10z m5 5 1 1",
    ])
      expect(svg.pathPoints(d)).toEqual(old.ft(d));
  });
  it(`svgBounds und countShapes an ${SAMPLES.length} Referenz-SVGs`, () => {
    expect(SAMPLES.length).toBeGreaterThan(100);
    for (const s of SAMPLES) {
      expect(svg.svgBounds(s)).toEqual(old.xt(s));
      expect(svg.countShapes(s)).toBe(old.Ct(s));
    }
    const extra = [
      '<g transform="rotate(30)"><rect x="0" y="0" width="10" height="5" stroke="#000" stroke-width="2"/></g>',
      '<circle cx="5" cy="5" r="3" fill="none" stroke="red"/><ellipse cx="1" cy="1" rx="2" ry="1" opacity="0"/>',
      '<g opacity="0.5"><line x1="0" y1="0" x2="10" y2="0" stroke="#000"/></g><polygon points="0,0 5,5 10,0"/>',
      '<g fill="none"><path d="M0 0L10 10"/></g><g/><polyline points="1 2 3" fill="none"/>',
      "",
    ];
    for (const s of extra) expect(svg.svgBounds(s)).toEqual(old.xt(s));
  });
});
