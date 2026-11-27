// Laeuft im Browser in der instrumentierten gesicherten Fassung (siehe golden.mjs).
// Ruft die Funktionen der Bundles mit festen Eingaben auf und gibt reine JSON-Daten zurueck.
// Zuordnung der Minify-Namen zu den Originalfunktionen: docs/23-modulkarte.md.
window.__golden = (() => {
  const files = {
    en: "engine-BhDRZEfO.js",
    ix: "index-BER2gtDe.js",
    nf: "nameFinder-CLppxXuz.js",
    ko: "kompass-bTkyDSpk.js",
    ka: "kitAssets-CN7deWlx.js",
    ps: "PostingsScreen-DENTHyqT.js",
    li: "library-D1LkGQVN.js",
  };
  let M = null;
  const load = async () => {
    if (M) return M;
    M = {};
    for (const [k, f] of Object.entries(files)) M[k] = (await import("./assets/" + f)).__recovered__;
    return M;
  };
  const plain = (v) => JSON.parse(JSON.stringify(v ?? null));

  // Projekt-Eingabe wie im Studio (index Ik = createProject), feste Zeit und ID.
  function projectFor(m, brand) {
    const sc = m.ix.i0(brand.suffix);
    const p = m.ix.Ik(
      {
        rawName: brand.rawName,
        suffixChoice: sc.choice,
        customSuffix: sc.custom,
        keepLegalForm: false,
        place: brand.place,
        nameKind: brand.nameKind,
      },
      Date.parse("2026-10-27T09:00:00Z"),
      `golden${brand.slug.replace(/[^a-z0-9]/g, "")}`.slice(0, 40),
    );
    return { ...p, input: { ...p.input, styles: [...brand.styles] } };
  }
  const briefOf = (brand, withName) => ({
    version: 1,
    ...brand.brief,
    ...(withName ? { hasName: true, name: brand.rawName } : {}),
  });

  // Galerie wie Gallery-Screen (ot/ge): je Seite ein Pool aus Tm, Schriften laden, Rm kuratiert.
  async function gallery(m, input, seed, cfg, entwuerfe) {
    const fonts = m.en.pn;
    const list = [];
    const pools = [];
    for (let T = 0; T < cfg.seiten; T++) {
      const { pkg } = m.en.cm(T);
      const pool = m.en.Tm(input, {
        page: pkg <= 0 ? 0 : pkg + 1,
        seed: (seed ^ m.en.dt(input)) >>> 0,
        signatureEntwuerfe: entwuerfe,
      });
      await fonts.ensure(m.en.Xe(pool, "logo", input));
      const page = m.en.Rm(pool, input, fonts, cfg.seitengroesse, {
        exclude: list.map((c) => c.id),
        pinFirst: false,
      });
      list.push(...page);
      pools.push(pool.map((c) => c.id));
    }
    return { list, pools };
  }
  async function render(m, concepts, input) {
    await m.en.pn.ensure(m.en.Xe(concepts, "logo", input));
    const out = {};
    for (const c of concepts) out[c.id] = m.en.zm(c, input, { variant: "color" });
    return out;
  }

  async function logo(cfg, brand) {
    const m = await load();
    const ent = cfg.einstellungen.signatureEntwuerfe;
    const project = projectFor(m, brand);
    const brief = briefOf(brand, true);
    const routes = m.ko.Dn(brief, {});
    const route = routes[0];
    const routed = m.ko.nr(brief, route, brand.rawName, { suffix: brand.suffix });
    const variants = { ohneRoute: project.input, mitRoute: routed.input };
    const result = { marke: brand.slug, route: { id: route.id, territory: route.territory }, laeufe: {} };
    for (const [vk, input] of Object.entries(variants)) {
      result.laeufe[vk] = { input: plain(input), seeds: {} };
      for (const seed of cfg.seeds) {
        const gc = {};
        for (const page of cfg.generateConcepts.pages)
          gc[`page${page}`] = plain(m.en.Ga(input, { count: cfg.generateConcepts.count, page, seed }));
        const g = await gallery(m, input, seed, cfg.galerie, ent);
        const first = g.list.slice(0, cfg.galerie.svgJeLauf);
        result.laeufe[vk].seeds[seed] = {
          generateConcepts: gc,
          galeriePools: g.pools,
          kuratiert: plain(g.list),
          svg: await render(m, first, input),
        };
      }
    }
    return result;
  }

  async function names(cfg, brand) {
    const m = await load();
    const brief = briefOf(brand, false);
    const routes = m.ko.Dn(brief, {});
    const route = routes[0];
    const nfCfg = brand.namensfinder;
    const res = { marke: brand.slug, route: { id: route.id, territory: route.territory }, laeufe: {} };
    for (const seed of cfg.seeds) {
      const base = {
        ...m.ix.Mg(seed),
        person: brand.brief.person ?? "",
        company: brand.nameKind === "company" ? brand.rawName : "",
        region: brand.place,
        focus: [...nfCfg.focus],
        style: nfCfg.style,
        keywords: nfCfg.keywords,
        submitted: true,
      };
      const forms = {
        ohneRoute: { ...base, batches: [m.ix.$L(base)] },
        mitRoute: m.ko.rr(base, brief, route),
      };
      res.laeufe[seed] = {};
      for (const [vk, form] of Object.entries(forms)) {
        const profile = m.nf.Rd(form);
        const batches = form.batches.length ? form.batches : [m.ix.$L(form)];
        const chargen = m.nf.jd(profile, { ...form, seed }, batches);
        const styles = form.style !== "egal" ? [form.style] : [];
        const routeParams = form.route?.params;
        const first = chargen[0] ?? [];
        let karten = [];
        try {
          karten = m.nf.Yd(first, m.nf.el(seed, 0), styles, cfg.einstellungen.signatureEntwuerfe, routeParams);
        } catch (e) {
          karten = [{ fehler: String(e) }];
        }
        // Namenskarte wie NameCard (p): Eingabe aus Gt(name, stile), Variante aus qs(konzept).
        const kartenSvg = {};
        for (let i = 0; i < Math.min(cfg.galerie.svgJeLauf, karten.length); i++) {
          const c = karten[i];
          if (!c || !c.id) continue;
          const inp = m.nf.Gt(first[i], styles);
          const face = m.en.qs(c);
          await m.en.pn.ensure(m.en.Xe([c], "logo", inp));
          kartenSvg[c.id] = m.en.zm(c, inp, { variant: face?.variant, ground: face?.ground });
        }
        const ctx = {
          ...(form.person ? { person: form.person } : {}),
          ...(form.company ? { company: form.company } : {}),
          region: form.region,
          focus: form.focus,
          styles,
          keywords: m.ix._L(form.keywords),
          ...(routeParams ? { route: routeParams } : {}),
        };
        res.laeufe[seed][vk] = {
          form: plain({ ...form, brief: undefined }),
          profil: plain(profile),
          chargen: plain(chargen),
          karten: plain(karten),
          kartenSvg,
          pruefeEigenenNamen: plain(m.nf.Zd(brand.rawName, ctx)),
          alternativenFuer: plain(m.nf._d(brand.rawName, ctx, 12)),
        };
      }
    }
    return res;
  }

  async function strategy(cfg) {
    const m = await load();
    const briefs = [
      ...cfg.marken.map((b) => ({ slug: b.slug, brief: briefOf(b, true) })),
      ...cfg.zusatzBriefe.map((b) => ({ slug: b.slug, brief: { version: 1, ...b.brief } })),
    ];
    const out = {};
    for (const { slug, brief } of briefs) {
      out[slug] = { brief, laeufe: {} };
      for (const seed of cfg.routenSeeds)
        out[slug].laeufe[seed === null ? "standard" : `seed${seed}`] = plain(
          m.ko.Dn(brief, seed === null ? {} : { seed }),
        );
    }
    return out;
  }

  // Gemeinsamer Kontext fuer Postings und Unterlagen: erstes kuratiertes Konzept der Marke
  // (ohne Route, erster Seed), Kontakt und Objekt aus inputs.json.
  async function kitContext(cfg) {
    const m = await load();
    const pc = cfg.postings;
    const brand = cfg.marken.find((b) => b.slug === pc.marke);
    const project = projectFor(m, brand);
    const input = project.input;
    const g = await gallery(m, input, cfg.seeds[0], { ...cfg.galerie, seiten: 1 }, cfg.einstellungen.signatureEntwuerfe);
    const concept = g.list[0];
    const contact = { ...m.ix.e0(), ...pc.kontakt };
    const assets = m.ka.ju(concept, input, contact);
    await m.ka.ge.ensure([...m.ka.ro([concept], false, input), ...m.ka.co([concept])]);
    await m.ka.cr();
    const t = Date.parse(cfg.zeitpunkt);
    const object = { ...m.li.V(t, pc.objekt.id), ...pc.objekt, statusSince: t, createdAt: t, updatedAt: t };
    return { m, brand, input, concept, contact, assets, object };
  }

  async function postings(cfg) {
    const { m, concept, assets, object } = await kitContext(cfg);
    const kit = m.ka.Et(assets);
    const occasions = m.ps.vn.map((o) => o.id);
    const formats = m.ps.De.map((f) => f.id);
    const out = { konzept: plain(concept), objekt: plain(object), svg: {} };
    for (const look of cfg.postings.looks) {
      for (const occ of occasions) {
        const needs = m.ps.q(occ).needsObject;
        const obj = needs ? object : null;
        let sel = m.ps.mt(m.ps.Pe(obj, look), occ);
        sel = {
          ...sel,
          extras: {
            termin: { datum: "2026-11-07", von: "10:00", bis: "12:00" },
            markt: {
              region: "Wien-Neubau",
              zeitraum: "3. Quartal 2026",
              werte: [
                { label: "Preis je m²", value: "7.850 €" },
                { label: "Vermarktungsdauer", value: "74 Tage" },
              ],
              satz: "Gute Wohnungen gehen weiter schnell weg.",
              quelle: "Eigene Auswertung (erfunden)",
            },
            stimme: { text: "Ruhig, ehrlich und gut vorbereitet.", wer: "Familie M. aus Wien", einwilligung: true },
          },
        };
        const ctx = {
          sel,
          object: obj,
          photos: [],
          contact: kit.contact,
          brandName: kit.brandName,
          route: undefined,
          portrait: undefined,
        };
        for (const f of formats) {
          const n = m.ps.qe(f, ctx);
          for (let p = 0; p < n; p++) {
            let r;
            try {
              r = m.ps.bt(kit, ctx, f, p);
            } catch (e) {
              r = { fehler: String(e) };
            }
            out.svg[`${look}/${occ}/${f}${n > 1 ? `-${p + 1}` : ""}`] = r
              ? { svg: r.svg ?? null, W: r.W, H: r.H, fehler: r.fehler, notes: r.notes, checks: plain(r.checks) }
              : null;
          }
        }
      }
    }
    return out;
  }

  async function unterlagen(cfg) {
    const { m, concept, assets } = await kitContext(cfg);
    const out = { konzept: plain(concept), sets: {} };
    for (const [name, unio] of [["unio", true], ["eigen", false]]) {
      const list = await m.ka.ca(unio);
      const items = {};
      for (const it of list) {
        let pages;
        try {
          if (it.available && !it.available(assets)) {
            items[it.id] = { verfuegbar: false };
            continue;
          }
          pages = it.pages ? it.pages(assets) : [{ label: it.label, svg: it.preview(assets) }];
          items[it.id] = { label: it.label, group: it.group, seiten: pages.map((p) => ({ label: p.label, svg: p.svg })) };
        } catch (e) {
          items[it.id] = { label: it.label, fehler: String(e) };
        }
      }
      out.sets[name] = items;
    }
    return out;
  }

  return { load, logo, names, strategy, postings, unterlagen, projectFor, briefOf, plain, gallery, render };
})();
