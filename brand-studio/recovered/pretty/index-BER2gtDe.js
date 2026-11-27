const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      "./migrate-yTmcZ5Wq.js",
      "./objectData-DW9yI24T.js",
      "./energy-DRQ_36b-.js",
      "./library-D1LkGQVN.js",
      "./ProjectPreview-C5WC5Zuf.js",
      "./LogoView-CG3DXWdO.js",
      "./engine-BhDRZEfO.js",
      "./svg-CrwnZnJY.js",
      "./StyleScreen-C_6L_v_z.js",
      "./describe-CrBWccON.js",
      "./Gallery-DQhL1__5.js",
      "./NameCard-BpHDImep.js",
      "./nameFinder-CLppxXuz.js",
      "./Editor-DVnOl_QT.js",
      "./kitAssets-CN7deWlx.js",
      "./imagesize-BHC6N02v.js",
      "./photoStore-D5-LfIN5.js",
      "./prewarm-B0dvGBZL.js",
      "./Kit-DOg_4MCc.js",
      "./postings-Dy1Ye1na.css",
      "./NameFinder-a2JCuNBt.js",
      "./Kompass-15lKj4KF.js",
      "./kompass-bTkyDSpk.js",
      "./texts-B92agAAM.js",
      "./Routes-DauRWys7.js",
      "./PostingsScreen-DENTHyqT.js",
      "./ObjectEditor-2EvMWoQa.js",
      "./ObjectsScreen-Brex7erJ.js",
    ]),
) => i.map((i) => d[i]);
var Pg = Object.defineProperty;
var Dg = (e, t, n) =>
  t in e ? Pg(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : (e[t] = n);
var pn = (e, t, n) => Dg(e, typeof t != "symbol" ? t + "" : t, n);
(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) r(s);
  new MutationObserver((s) => {
    for (const i of s)
      if (i.type === "childList")
        for (const a of i.addedNodes) a.tagName === "LINK" && a.rel === "modulepreload" && r(a);
  }).observe(document, { childList: !0, subtree: !0 });
  function n(s) {
    const i = {};
    return (
      s.integrity && (i.integrity = s.integrity),
      s.referrerPolicy && (i.referrerPolicy = s.referrerPolicy),
      s.crossOrigin === "use-credentials"
        ? (i.credentials = "include")
        : s.crossOrigin === "anonymous"
          ? (i.credentials = "omit")
          : (i.credentials = "same-origin"),
      i
    );
  }
  function r(s) {
    if (s.ep) return;
    s.ep = !0;
    const i = n(s);
    fetch(s.href, i);
  }
})();
var _h = { exports: {} },
  Ja = {},
  zh = { exports: {} },
  J = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var ui = Symbol.for("react.element"),
  Ug = Symbol.for("react.portal"),
  Ag = Symbol.for("react.fragment"),
  Bg = Symbol.for("react.strict_mode"),
  $g = Symbol.for("react.profiler"),
  _g = Symbol.for("react.provider"),
  zg = Symbol.for("react.context"),
  jg = Symbol.for("react.forward_ref"),
  Gg = Symbol.for("react.suspense"),
  Hg = Symbol.for("react.memo"),
  Wg = Symbol.for("react.lazy"),
  Jc = Symbol.iterator;
function Vg(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (Jc && e[Jc]) || e["@@iterator"]), typeof e == "function" ? e : null);
}
var jh = {
    isMounted: function () {
      return !1;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {},
  },
  Gh = Object.assign,
  Hh = {};
function ns(e, t, n) {
  ((this.props = e), (this.context = t), (this.refs = Hh), (this.updater = n || jh));
}
ns.prototype.isReactComponent = {};
ns.prototype.setState = function (e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null)
    throw Error(
      "setState(...): takes an object of state variables to update or a function which returns an object of state variables.",
    );
  this.updater.enqueueSetState(this, e, t, "setState");
};
ns.prototype.forceUpdate = function (e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function Wh() {}
Wh.prototype = ns.prototype;
function Pu(e, t, n) {
  ((this.props = e), (this.context = t), (this.refs = Hh), (this.updater = n || jh));
}
var Du = (Pu.prototype = new Wh());
Du.constructor = Pu;
Gh(Du, ns.prototype);
Du.isPureReactComponent = !0;
var ef = Array.isArray,
  Vh = Object.prototype.hasOwnProperty,
  Uu = { current: null },
  Kh = { key: !0, ref: !0, __self: !0, __source: !0 };
function qh(e, t, n) {
  var r,
    s = {},
    i = null,
    a = null;
  if (t != null)
    for (r in (t.ref !== void 0 && (a = t.ref), t.key !== void 0 && (i = "" + t.key), t))
      Vh.call(t, r) && !Kh.hasOwnProperty(r) && (s[r] = t[r]);
  var o = arguments.length - 2;
  if (o === 1) s.children = n;
  else if (1 < o) {
    for (var l = Array(o), u = 0; u < o; u++) l[u] = arguments[u + 2];
    s.children = l;
  }
  if (e && e.defaultProps) for (r in ((o = e.defaultProps), o)) s[r] === void 0 && (s[r] = o[r]);
  return { $$typeof: ui, type: e, key: i, ref: a, props: s, _owner: Uu.current };
}
function Kg(e, t) {
  return { $$typeof: ui, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function Au(e) {
  return typeof e == "object" && e !== null && e.$$typeof === ui;
}
function qg(e) {
  var t = { "=": "=0", ":": "=2" };
  return (
    "$" +
    e.replace(/[=:]/g, function (n) {
      return t[n];
    })
  );
}
var tf = /\/+/g;
function wo(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? qg("" + e.key) : t.toString(36);
}
function Yi(e, t, n, r, s) {
  var i = typeof e;
  (i === "undefined" || i === "boolean") && (e = null);
  var a = !1;
  if (e === null) a = !0;
  else
    switch (i) {
      case "string":
      case "number":
        a = !0;
        break;
      case "object":
        switch (e.$$typeof) {
          case ui:
          case Ug:
            a = !0;
        }
    }
  if (a)
    return (
      (a = e),
      (s = s(a)),
      (e = r === "" ? "." + wo(a, 0) : r),
      ef(s)
        ? ((n = ""),
          e != null && (n = e.replace(tf, "$&/") + "/"),
          Yi(s, t, n, "", function (u) {
            return u;
          }))
        : s != null &&
          (Au(s) &&
            (s = Kg(
              s,
              n +
                (!s.key || (a && a.key === s.key) ? "" : ("" + s.key).replace(tf, "$&/") + "/") +
                e,
            )),
          t.push(s)),
      1
    );
  if (((a = 0), (r = r === "" ? "." : r + ":"), ef(e)))
    for (var o = 0; o < e.length; o++) {
      i = e[o];
      var l = r + wo(i, o);
      a += Yi(i, t, n, l, s);
    }
  else if (((l = Vg(e)), typeof l == "function"))
    for (e = l.call(e), o = 0; !(i = e.next()).done; )
      ((i = i.value), (l = r + wo(i, o++)), (a += Yi(i, t, n, l, s)));
  else if (i === "object")
    throw (
      (t = String(e)),
      Error(
        "Objects are not valid as a React child (found: " +
          (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) +
          "). If you meant to render a collection of children, use an array instead.",
      )
    );
  return a;
}
function ki(e, t, n) {
  if (e == null) return e;
  var r = [],
    s = 0;
  return (
    Yi(e, r, "", "", function (i) {
      return t.call(n, i, s++);
    }),
    r
  );
}
function Xg(e) {
  if (e._status === -1) {
    var t = e._result;
    ((t = t()),
      t.then(
        function (n) {
          (e._status === 0 || e._status === -1) && ((e._status = 1), (e._result = n));
        },
        function (n) {
          (e._status === 0 || e._status === -1) && ((e._status = 2), (e._result = n));
        },
      ),
      e._status === -1 && ((e._status = 0), (e._result = t)));
  }
  if (e._status === 1) return e._result.default;
  throw e._result;
}
var Ze = { current: null },
  Qi = { transition: null },
  Zg = { ReactCurrentDispatcher: Ze, ReactCurrentBatchConfig: Qi, ReactCurrentOwner: Uu };
function Xh() {
  throw Error("act(...) is not supported in production builds of React.");
}
J.Children = {
  map: ki,
  forEach: function (e, t, n) {
    ki(
      e,
      function () {
        t.apply(this, arguments);
      },
      n,
    );
  },
  count: function (e) {
    var t = 0;
    return (
      ki(e, function () {
        t++;
      }),
      t
    );
  },
  toArray: function (e) {
    return (
      ki(e, function (t) {
        return t;
      }) || []
    );
  },
  only: function (e) {
    if (!Au(e))
      throw Error("React.Children.only expected to receive a single React element child.");
    return e;
  },
};
J.Component = ns;
J.Fragment = Ag;
J.Profiler = $g;
J.PureComponent = Pu;
J.StrictMode = Bg;
J.Suspense = Gg;
J.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Zg;
J.act = Xh;
J.cloneElement = function (e, t, n) {
  if (e == null)
    throw Error(
      "React.cloneElement(...): The argument must be a React element, but you passed " + e + ".",
    );
  var r = Gh({}, e.props),
    s = e.key,
    i = e.ref,
    a = e._owner;
  if (t != null) {
    if (
      (t.ref !== void 0 && ((i = t.ref), (a = Uu.current)),
      t.key !== void 0 && (s = "" + t.key),
      e.type && e.type.defaultProps)
    )
      var o = e.type.defaultProps;
    for (l in t)
      Vh.call(t, l) &&
        !Kh.hasOwnProperty(l) &&
        (r[l] = t[l] === void 0 && o !== void 0 ? o[l] : t[l]);
  }
  var l = arguments.length - 2;
  if (l === 1) r.children = n;
  else if (1 < l) {
    o = Array(l);
    for (var u = 0; u < l; u++) o[u] = arguments[u + 2];
    r.children = o;
  }
  return { $$typeof: ui, type: e.type, key: s, ref: i, props: r, _owner: a };
};
J.createContext = function (e) {
  return (
    (e = {
      $$typeof: zg,
      _currentValue: e,
      _currentValue2: e,
      _threadCount: 0,
      Provider: null,
      Consumer: null,
      _defaultValue: null,
      _globalName: null,
    }),
    (e.Provider = { $$typeof: _g, _context: e }),
    (e.Consumer = e)
  );
};
J.createElement = qh;
J.createFactory = function (e) {
  var t = qh.bind(null, e);
  return ((t.type = e), t);
};
J.createRef = function () {
  return { current: null };
};
J.forwardRef = function (e) {
  return { $$typeof: jg, render: e };
};
J.isValidElement = Au;
J.lazy = function (e) {
  return { $$typeof: Wg, _payload: { _status: -1, _result: e }, _init: Xg };
};
J.memo = function (e, t) {
  return { $$typeof: Hg, type: e, compare: t === void 0 ? null : t };
};
J.startTransition = function (e) {
  var t = Qi.transition;
  Qi.transition = {};
  try {
    e();
  } finally {
    Qi.transition = t;
  }
};
J.unstable_act = Xh;
J.useCallback = function (e, t) {
  return Ze.current.useCallback(e, t);
};
J.useContext = function (e) {
  return Ze.current.useContext(e);
};
J.useDebugValue = function () {};
J.useDeferredValue = function (e) {
  return Ze.current.useDeferredValue(e);
};
J.useEffect = function (e, t) {
  return Ze.current.useEffect(e, t);
};
J.useId = function () {
  return Ze.current.useId();
};
J.useImperativeHandle = function (e, t, n) {
  return Ze.current.useImperativeHandle(e, t, n);
};
J.useInsertionEffect = function (e, t) {
  return Ze.current.useInsertionEffect(e, t);
};
J.useLayoutEffect = function (e, t) {
  return Ze.current.useLayoutEffect(e, t);
};
J.useMemo = function (e, t) {
  return Ze.current.useMemo(e, t);
};
J.useReducer = function (e, t, n) {
  return Ze.current.useReducer(e, t, n);
};
J.useRef = function (e) {
  return Ze.current.useRef(e);
};
J.useState = function (e) {
  return Ze.current.useState(e);
};
J.useSyncExternalStore = function (e, t, n) {
  return Ze.current.useSyncExternalStore(e, t, n);
};
J.useTransition = function () {
  return Ze.current.useTransition();
};
J.version = "18.3.1";
zh.exports = J;
var C = zh.exports;
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Yg = C,
  Qg = Symbol.for("react.element"),
  Jg = Symbol.for("react.fragment"),
  ev = Object.prototype.hasOwnProperty,
  tv = Yg.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
  nv = { key: !0, ref: !0, __self: !0, __source: !0 };
function Zh(e, t, n) {
  var r,
    s = {},
    i = null,
    a = null;
  (n !== void 0 && (i = "" + n),
    t.key !== void 0 && (i = "" + t.key),
    t.ref !== void 0 && (a = t.ref));
  for (r in t) ev.call(t, r) && !nv.hasOwnProperty(r) && (s[r] = t[r]);
  if (e && e.defaultProps) for (r in ((t = e.defaultProps), t)) s[r] === void 0 && (s[r] = t[r]);
  return { $$typeof: Qg, type: e, key: i, ref: a, props: s, _owner: tv.current };
}
Ja.Fragment = Jg;
Ja.jsx = Zh;
Ja.jsxs = Zh;
_h.exports = Ja;
var y = _h.exports,
  Yh = { exports: {} },
  ct = {},
  Qh = { exports: {} },
  Jh = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ (function (e) {
  function t(O, B) {
    var R = O.length;
    O.push(B);
    e: for (; 0 < R; ) {
      var A = (R - 1) >>> 1,
        H = O[A];
      if (0 < s(H, B)) ((O[A] = B), (O[R] = H), (R = A));
      else break e;
    }
  }
  function n(O) {
    return O.length === 0 ? null : O[0];
  }
  function r(O) {
    if (O.length === 0) return null;
    var B = O[0],
      R = O.pop();
    if (R !== B) {
      O[0] = R;
      e: for (var A = 0, H = O.length, He = H >>> 1; A < He; ) {
        var De = 2 * (A + 1) - 1,
          _t = O[De],
          j = De + 1,
          Z = O[j];
        if (0 > s(_t, R))
          j < H && 0 > s(Z, _t)
            ? ((O[A] = Z), (O[j] = R), (A = j))
            : ((O[A] = _t), (O[De] = R), (A = De));
        else if (j < H && 0 > s(Z, R)) ((O[A] = Z), (O[j] = R), (A = j));
        else break e;
      }
    }
    return B;
  }
  function s(O, B) {
    var R = O.sortIndex - B.sortIndex;
    return R !== 0 ? R : O.id - B.id;
  }
  if (typeof performance == "object" && typeof performance.now == "function") {
    var i = performance;
    e.unstable_now = function () {
      return i.now();
    };
  } else {
    var a = Date,
      o = a.now();
    e.unstable_now = function () {
      return a.now() - o;
    };
  }
  var l = [],
    u = [],
    c = 1,
    f = null,
    d = 3,
    h = !1,
    m = !1,
    x = !1,
    k = typeof setTimeout == "function" ? setTimeout : null,
    p = typeof clearTimeout == "function" ? clearTimeout : null,
    g = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" &&
    navigator.scheduling !== void 0 &&
    navigator.scheduling.isInputPending !== void 0 &&
    navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function v(O) {
    for (var B = n(u); B !== null; ) {
      if (B.callback === null) r(u);
      else if (B.startTime <= O) (r(u), (B.sortIndex = B.expirationTime), t(l, B));
      else break;
      B = n(u);
    }
  }
  function S(O) {
    if (((x = !1), v(O), !m))
      if (n(l) !== null) ((m = !0), oe(b));
      else {
        var B = n(u);
        B !== null && le(S, B.startTime - O);
      }
  }
  function b(O, B) {
    ((m = !1), x && ((x = !1), p(E), (E = -1)), (h = !0));
    var R = d;
    try {
      for (v(B), f = n(l); f !== null && (!(f.expirationTime > B) || (O && !q())); ) {
        var A = f.callback;
        if (typeof A == "function") {
          ((f.callback = null), (d = f.priorityLevel));
          var H = A(f.expirationTime <= B);
          ((B = e.unstable_now()),
            typeof H == "function" ? (f.callback = H) : f === n(l) && r(l),
            v(B));
        } else r(l);
        f = n(l);
      }
      if (f !== null) var He = !0;
      else {
        var De = n(u);
        (De !== null && le(S, De.startTime - B), (He = !1));
      }
      return He;
    } finally {
      ((f = null), (d = R), (h = !1));
    }
  }
  var L = !1,
    T = null,
    E = -1,
    I = 5,
    P = -1;
  function q() {
    return !(e.unstable_now() - P < I);
  }
  function Q() {
    if (T !== null) {
      var O = e.unstable_now();
      P = O;
      var B = !0;
      try {
        B = T(!0, O);
      } finally {
        B ? te() : ((L = !1), (T = null));
      }
    } else L = !1;
  }
  var te;
  if (typeof g == "function")
    te = function () {
      g(Q);
    };
  else if (typeof MessageChannel < "u") {
    var ee = new MessageChannel(),
      ae = ee.port2;
    ((ee.port1.onmessage = Q),
      (te = function () {
        ae.postMessage(null);
      }));
  } else
    te = function () {
      k(Q, 0);
    };
  function oe(O) {
    ((T = O), L || ((L = !0), te()));
  }
  function le(O, B) {
    E = k(function () {
      O(e.unstable_now());
    }, B);
  }
  ((e.unstable_IdlePriority = 5),
    (e.unstable_ImmediatePriority = 1),
    (e.unstable_LowPriority = 4),
    (e.unstable_NormalPriority = 3),
    (e.unstable_Profiling = null),
    (e.unstable_UserBlockingPriority = 2),
    (e.unstable_cancelCallback = function (O) {
      O.callback = null;
    }),
    (e.unstable_continueExecution = function () {
      m || h || ((m = !0), oe(b));
    }),
    (e.unstable_forceFrameRate = function (O) {
      0 > O || 125 < O
        ? console.error(
            "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
          )
        : (I = 0 < O ? Math.floor(1e3 / O) : 5);
    }),
    (e.unstable_getCurrentPriorityLevel = function () {
      return d;
    }),
    (e.unstable_getFirstCallbackNode = function () {
      return n(l);
    }),
    (e.unstable_next = function (O) {
      switch (d) {
        case 1:
        case 2:
        case 3:
          var B = 3;
          break;
        default:
          B = d;
      }
      var R = d;
      d = B;
      try {
        return O();
      } finally {
        d = R;
      }
    }),
    (e.unstable_pauseExecution = function () {}),
    (e.unstable_requestPaint = function () {}),
    (e.unstable_runWithPriority = function (O, B) {
      switch (O) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          O = 3;
      }
      var R = d;
      d = O;
      try {
        return B();
      } finally {
        d = R;
      }
    }),
    (e.unstable_scheduleCallback = function (O, B, R) {
      var A = e.unstable_now();
      switch (
        (typeof R == "object" && R !== null
          ? ((R = R.delay), (R = typeof R == "number" && 0 < R ? A + R : A))
          : (R = A),
        O)
      ) {
        case 1:
          var H = -1;
          break;
        case 2:
          H = 250;
          break;
        case 5:
          H = 1073741823;
          break;
        case 4:
          H = 1e4;
          break;
        default:
          H = 5e3;
      }
      return (
        (H = R + H),
        (O = {
          id: c++,
          callback: B,
          priorityLevel: O,
          startTime: R,
          expirationTime: H,
          sortIndex: -1,
        }),
        R > A
          ? ((O.sortIndex = R),
            t(u, O),
            n(l) === null && O === n(u) && (x ? (p(E), (E = -1)) : (x = !0), le(S, R - A)))
          : ((O.sortIndex = H), t(l, O), m || h || ((m = !0), oe(b))),
        O
      );
    }),
    (e.unstable_shouldYield = q),
    (e.unstable_wrapCallback = function (O) {
      var B = d;
      return function () {
        var R = d;
        d = B;
        try {
          return O.apply(this, arguments);
        } finally {
          d = R;
        }
      };
    }));
})(Jh);
Qh.exports = Jh;
var rv = Qh.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var sv = C,
  lt = rv;
function N(e) {
  for (
    var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1;
    n < arguments.length;
    n++
  )
    t += "&args[]=" + encodeURIComponent(arguments[n]);
  return (
    "Minified React error #" +
    e +
    "; visit " +
    t +
    " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  );
}
var ep = new Set(),
  Us = {};
function vr(e, t) {
  (Kr(e, t), Kr(e + "Capture", t));
}
function Kr(e, t) {
  for (Us[e] = t, e = 0; e < t.length; e++) ep.add(t[e]);
}
var ln = !(
    typeof window > "u" ||
    typeof window.document > "u" ||
    typeof window.document.createElement > "u"
  ),
  ml = Object.prototype.hasOwnProperty,
  iv =
    /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
  nf = {},
  rf = {};
function av(e) {
  return ml.call(rf, e) ? !0 : ml.call(nf, e) ? !1 : iv.test(e) ? (rf[e] = !0) : ((nf[e] = !0), !1);
}
function ov(e, t, n, r) {
  if (n !== null && n.type === 0) return !1;
  switch (typeof t) {
    case "function":
    case "symbol":
      return !0;
    case "boolean":
      return r
        ? !1
        : n !== null
          ? !n.acceptsBooleans
          : ((e = e.toLowerCase().slice(0, 5)), e !== "data-" && e !== "aria-");
    default:
      return !1;
  }
}
function lv(e, t, n, r) {
  if (t === null || typeof t > "u" || ov(e, t, n, r)) return !0;
  if (r) return !1;
  if (n !== null)
    switch (n.type) {
      case 3:
        return !t;
      case 4:
        return t === !1;
      case 5:
        return isNaN(t);
      case 6:
        return isNaN(t) || 1 > t;
    }
  return !1;
}
function Ye(e, t, n, r, s, i, a) {
  ((this.acceptsBooleans = t === 2 || t === 3 || t === 4),
    (this.attributeName = r),
    (this.attributeNamespace = s),
    (this.mustUseProperty = n),
    (this.propertyName = e),
    (this.type = t),
    (this.sanitizeURL = i),
    (this.removeEmptyString = a));
}
var Be = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style"
  .split(" ")
  .forEach(function (e) {
    Be[e] = new Ye(e, 0, !1, e, null, !1, !1);
  });
[
  ["acceptCharset", "accept-charset"],
  ["className", "class"],
  ["htmlFor", "for"],
  ["httpEquiv", "http-equiv"],
].forEach(function (e) {
  var t = e[0];
  Be[t] = new Ye(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function (e) {
  Be[e] = new Ye(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function (e) {
  Be[e] = new Ye(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope"
  .split(" ")
  .forEach(function (e) {
    Be[e] = new Ye(e, 3, !1, e.toLowerCase(), null, !1, !1);
  });
["checked", "multiple", "muted", "selected"].forEach(function (e) {
  Be[e] = new Ye(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function (e) {
  Be[e] = new Ye(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function (e) {
  Be[e] = new Ye(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function (e) {
  Be[e] = new Ye(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var Bu = /[\-:]([a-z])/g;
function $u(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height"
  .split(" ")
  .forEach(function (e) {
    var t = e.replace(Bu, $u);
    Be[t] = new Ye(t, 1, !1, e, null, !1, !1);
  });
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type"
  .split(" ")
  .forEach(function (e) {
    var t = e.replace(Bu, $u);
    Be[t] = new Ye(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
  });
["xml:base", "xml:lang", "xml:space"].forEach(function (e) {
  var t = e.replace(Bu, $u);
  Be[t] = new Ye(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function (e) {
  Be[e] = new Ye(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
Be.xlinkHref = new Ye("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
["src", "href", "action", "formAction"].forEach(function (e) {
  Be[e] = new Ye(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function _u(e, t, n, r) {
  var s = Be.hasOwnProperty(t) ? Be[t] : null;
  (s !== null
    ? s.type !== 0
    : r || !(2 < t.length) || (t[0] !== "o" && t[0] !== "O") || (t[1] !== "n" && t[1] !== "N")) &&
    (lv(t, n, s, r) && (n = null),
    r || s === null
      ? av(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n))
      : s.mustUseProperty
        ? (e[s.propertyName] = n === null ? (s.type === 3 ? !1 : "") : n)
        : ((t = s.attributeName),
          (r = s.attributeNamespace),
          n === null
            ? e.removeAttribute(t)
            : ((s = s.type),
              (n = s === 3 || (s === 4 && n === !0) ? "" : "" + n),
              r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var dn = sv.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  Si = Symbol.for("react.element"),
  Tr = Symbol.for("react.portal"),
  Cr = Symbol.for("react.fragment"),
  zu = Symbol.for("react.strict_mode"),
  gl = Symbol.for("react.profiler"),
  tp = Symbol.for("react.provider"),
  np = Symbol.for("react.context"),
  ju = Symbol.for("react.forward_ref"),
  vl = Symbol.for("react.suspense"),
  yl = Symbol.for("react.suspense_list"),
  Gu = Symbol.for("react.memo"),
  kn = Symbol.for("react.lazy"),
  rp = Symbol.for("react.offscreen"),
  sf = Symbol.iterator;
function os(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (sf && e[sf]) || e["@@iterator"]), typeof e == "function" ? e : null);
}
var xe = Object.assign,
  bo;
function ws(e) {
  if (bo === void 0)
    try {
      throw Error();
    } catch (n) {
      var t = n.stack.trim().match(/\n( *(at )?)/);
      bo = (t && t[1]) || "";
    }
  return (
    `
` +
    bo +
    e
  );
}
var Eo = !1;
function To(e, t) {
  if (!e || Eo) return "";
  Eo = !0;
  var n = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    if (t)
      if (
        ((t = function () {
          throw Error();
        }),
        Object.defineProperty(t.prototype, "props", {
          set: function () {
            throw Error();
          },
        }),
        typeof Reflect == "object" && Reflect.construct)
      ) {
        try {
          Reflect.construct(t, []);
        } catch (u) {
          var r = u;
        }
        Reflect.construct(e, [], t);
      } else {
        try {
          t.call();
        } catch (u) {
          r = u;
        }
        e.call(t.prototype);
      }
    else {
      try {
        throw Error();
      } catch (u) {
        r = u;
      }
      e();
    }
  } catch (u) {
    if (u && r && typeof u.stack == "string") {
      for (
        var s = u.stack.split(`
`),
          i = r.stack.split(`
`),
          a = s.length - 1,
          o = i.length - 1;
        1 <= a && 0 <= o && s[a] !== i[o];
      )
        o--;
      for (; 1 <= a && 0 <= o; a--, o--)
        if (s[a] !== i[o]) {
          if (a !== 1 || o !== 1)
            do
              if ((a--, o--, 0 > o || s[a] !== i[o])) {
                var l =
                  `
` + s[a].replace(" at new ", " at ");
                return (
                  e.displayName &&
                    l.includes("<anonymous>") &&
                    (l = l.replace("<anonymous>", e.displayName)),
                  l
                );
              }
            while (1 <= a && 0 <= o);
          break;
        }
    }
  } finally {
    ((Eo = !1), (Error.prepareStackTrace = n));
  }
  return (e = e ? e.displayName || e.name : "") ? ws(e) : "";
}
function uv(e) {
  switch (e.tag) {
    case 5:
      return ws(e.type);
    case 16:
      return ws("Lazy");
    case 13:
      return ws("Suspense");
    case 19:
      return ws("SuspenseList");
    case 0:
    case 2:
    case 15:
      return ((e = To(e.type, !1)), e);
    case 11:
      return ((e = To(e.type.render, !1)), e);
    case 1:
      return ((e = To(e.type, !0)), e);
    default:
      return "";
  }
}
function xl(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case Cr:
      return "Fragment";
    case Tr:
      return "Portal";
    case gl:
      return "Profiler";
    case zu:
      return "StrictMode";
    case vl:
      return "Suspense";
    case yl:
      return "SuspenseList";
  }
  if (typeof e == "object")
    switch (e.$$typeof) {
      case np:
        return (e.displayName || "Context") + ".Consumer";
      case tp:
        return (e._context.displayName || "Context") + ".Provider";
      case ju:
        var t = e.render;
        return (
          (e = e.displayName),
          e ||
            ((e = t.displayName || t.name || ""),
            (e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")),
          e
        );
      case Gu:
        return ((t = e.displayName || null), t !== null ? t : xl(e.type) || "Memo");
      case kn:
        ((t = e._payload), (e = e._init));
        try {
          return xl(e(t));
        } catch {}
    }
  return null;
}
function cv(e) {
  var t = e.type;
  switch (e.tag) {
    case 24:
      return "Cache";
    case 9:
      return (t.displayName || "Context") + ".Consumer";
    case 10:
      return (t._context.displayName || "Context") + ".Provider";
    case 18:
      return "DehydratedFragment";
    case 11:
      return (
        (e = t.render),
        (e = e.displayName || e.name || ""),
        t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")
      );
    case 7:
      return "Fragment";
    case 5:
      return t;
    case 4:
      return "Portal";
    case 3:
      return "Root";
    case 6:
      return "Text";
    case 16:
      return xl(t);
    case 8:
      return t === zu ? "StrictMode" : "Mode";
    case 22:
      return "Offscreen";
    case 12:
      return "Profiler";
    case 21:
      return "Scope";
    case 13:
      return "Suspense";
    case 19:
      return "SuspenseList";
    case 25:
      return "TracingMarker";
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if (typeof t == "function") return t.displayName || t.name || null;
      if (typeof t == "string") return t;
  }
  return null;
}
function Gn(e) {
  switch (typeof e) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return e;
    case "object":
      return e;
    default:
      return "";
  }
}
function sp(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
}
function fv(e) {
  var t = sp(e) ? "checked" : "value",
    n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
    r = "" + e[t];
  if (
    !e.hasOwnProperty(t) &&
    typeof n < "u" &&
    typeof n.get == "function" &&
    typeof n.set == "function"
  ) {
    var s = n.get,
      i = n.set;
    return (
      Object.defineProperty(e, t, {
        configurable: !0,
        get: function () {
          return s.call(this);
        },
        set: function (a) {
          ((r = "" + a), i.call(this, a));
        },
      }),
      Object.defineProperty(e, t, { enumerable: n.enumerable }),
      {
        getValue: function () {
          return r;
        },
        setValue: function (a) {
          r = "" + a;
        },
        stopTracking: function () {
          ((e._valueTracker = null), delete e[t]);
        },
      }
    );
  }
}
function wi(e) {
  e._valueTracker || (e._valueTracker = fv(e));
}
function ip(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(),
    r = "";
  return (
    e && (r = sp(e) ? (e.checked ? "true" : "false") : e.value),
    (e = r),
    e !== n ? (t.setValue(e), !0) : !1
  );
}
function ga(e) {
  if (((e = e || (typeof document < "u" ? document : void 0)), typeof e > "u")) return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function kl(e, t) {
  var n = t.checked;
  return xe({}, t, {
    defaultChecked: void 0,
    defaultValue: void 0,
    value: void 0,
    checked: n ?? e._wrapperState.initialChecked,
  });
}
function af(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue,
    r = t.checked != null ? t.checked : t.defaultChecked;
  ((n = Gn(t.value != null ? t.value : n)),
    (e._wrapperState = {
      initialChecked: r,
      initialValue: n,
      controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null,
    }));
}
function ap(e, t) {
  ((t = t.checked), t != null && _u(e, "checked", t, !1));
}
function Sl(e, t) {
  ap(e, t);
  var n = Gn(t.value),
    r = t.type;
  if (n != null)
    r === "number"
      ? ((n === 0 && e.value === "") || e.value != n) && (e.value = "" + n)
      : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  (t.hasOwnProperty("value")
    ? wl(e, t.type, n)
    : t.hasOwnProperty("defaultValue") && wl(e, t.type, Gn(t.defaultValue)),
    t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked));
}
function of(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (!((r !== "submit" && r !== "reset") || (t.value !== void 0 && t.value !== null))) return;
    ((t = "" + e._wrapperState.initialValue),
      n || t === e.value || (e.value = t),
      (e.defaultValue = t));
  }
  ((n = e.name),
    n !== "" && (e.name = ""),
    (e.defaultChecked = !!e._wrapperState.initialChecked),
    n !== "" && (e.name = n));
}
function wl(e, t, n) {
  (t !== "number" || ga(e.ownerDocument) !== e) &&
    (n == null
      ? (e.defaultValue = "" + e._wrapperState.initialValue)
      : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var bs = Array.isArray;
function Br(e, t, n, r) {
  if (((e = e.options), t)) {
    t = {};
    for (var s = 0; s < n.length; s++) t["$" + n[s]] = !0;
    for (n = 0; n < e.length; n++)
      ((s = t.hasOwnProperty("$" + e[n].value)),
        e[n].selected !== s && (e[n].selected = s),
        s && r && (e[n].defaultSelected = !0));
  } else {
    for (n = "" + Gn(n), t = null, s = 0; s < e.length; s++) {
      if (e[s].value === n) {
        ((e[s].selected = !0), r && (e[s].defaultSelected = !0));
        return;
      }
      t !== null || e[s].disabled || (t = e[s]);
    }
    t !== null && (t.selected = !0);
  }
}
function bl(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(N(91));
  return xe({}, t, {
    value: void 0,
    defaultValue: void 0,
    children: "" + e._wrapperState.initialValue,
  });
}
function lf(e, t) {
  var n = t.value;
  if (n == null) {
    if (((n = t.children), (t = t.defaultValue), n != null)) {
      if (t != null) throw Error(N(92));
      if (bs(n)) {
        if (1 < n.length) throw Error(N(93));
        n = n[0];
      }
      t = n;
    }
    (t == null && (t = ""), (n = t));
  }
  e._wrapperState = { initialValue: Gn(n) };
}
function op(e, t) {
  var n = Gn(t.value),
    r = Gn(t.defaultValue);
  (n != null &&
    ((n = "" + n),
    n !== e.value && (e.value = n),
    t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
    r != null && (e.defaultValue = "" + r));
}
function uf(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function lp(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function El(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml"
    ? lp(t)
    : e === "http://www.w3.org/2000/svg" && t === "foreignObject"
      ? "http://www.w3.org/1999/xhtml"
      : e;
}
var bi,
  up = (function (e) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction
      ? function (t, n, r, s) {
          MSApp.execUnsafeLocalFunction(function () {
            return e(t, n, r, s);
          });
        }
      : e;
  })(function (e, t) {
    if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
    else {
      for (
        bi = bi || document.createElement("div"),
          bi.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>",
          t = bi.firstChild;
        e.firstChild;
      )
        e.removeChild(e.firstChild);
      for (; t.firstChild; ) e.appendChild(t.firstChild);
    }
  });
function As(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var Cs = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0,
  },
  dv = ["Webkit", "ms", "Moz", "O"];
Object.keys(Cs).forEach(function (e) {
  dv.forEach(function (t) {
    ((t = t + e.charAt(0).toUpperCase() + e.substring(1)), (Cs[t] = Cs[e]));
  });
});
function cp(e, t, n) {
  return t == null || typeof t == "boolean" || t === ""
    ? ""
    : n || typeof t != "number" || t === 0 || (Cs.hasOwnProperty(e) && Cs[e])
      ? ("" + t).trim()
      : t + "px";
}
function fp(e, t) {
  e = e.style;
  for (var n in t)
    if (t.hasOwnProperty(n)) {
      var r = n.indexOf("--") === 0,
        s = cp(n, t[n], r);
      (n === "float" && (n = "cssFloat"), r ? e.setProperty(n, s) : (e[n] = s));
    }
}
var hv = xe(
  { menuitem: !0 },
  {
    area: !0,
    base: !0,
    br: !0,
    col: !0,
    embed: !0,
    hr: !0,
    img: !0,
    input: !0,
    keygen: !0,
    link: !0,
    meta: !0,
    param: !0,
    source: !0,
    track: !0,
    wbr: !0,
  },
);
function Tl(e, t) {
  if (t) {
    if (hv[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(N(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(N(60));
      if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML))
        throw Error(N(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(N(62));
  }
}
function Cl(e, t) {
  if (e.indexOf("-") === -1) return typeof t.is == "string";
  switch (e) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return !1;
    default:
      return !0;
  }
}
var Ll = null;
function Hu(e) {
  return (
    (e = e.target || e.srcElement || window),
    e.correspondingUseElement && (e = e.correspondingUseElement),
    e.nodeType === 3 ? e.parentNode : e
  );
}
var Fl = null,
  $r = null,
  _r = null;
function cf(e) {
  if ((e = di(e))) {
    if (typeof Fl != "function") throw Error(N(280));
    var t = e.stateNode;
    t && ((t = so(t)), Fl(e.stateNode, e.type, t));
  }
}
function dp(e) {
  $r ? (_r ? _r.push(e) : (_r = [e])) : ($r = e);
}
function hp() {
  if ($r) {
    var e = $r,
      t = _r;
    if (((_r = $r = null), cf(e), t)) for (e = 0; e < t.length; e++) cf(t[e]);
  }
}
function pp(e, t) {
  return e(t);
}
function mp() {}
var Co = !1;
function gp(e, t, n) {
  if (Co) return e(t, n);
  Co = !0;
  try {
    return pp(e, t, n);
  } finally {
    ((Co = !1), ($r !== null || _r !== null) && (mp(), hp()));
  }
}
function Bs(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = so(n);
  if (r === null) return null;
  n = r[t];
  e: switch (t) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      ((r = !r.disabled) ||
        ((e = e.type),
        (r = !(e === "button" || e === "input" || e === "select" || e === "textarea"))),
        (e = !r));
      break e;
    default:
      e = !1;
  }
  if (e) return null;
  if (n && typeof n != "function") throw Error(N(231, t, typeof n));
  return n;
}
var Ml = !1;
if (ln)
  try {
    var ls = {};
    (Object.defineProperty(ls, "passive", {
      get: function () {
        Ml = !0;
      },
    }),
      window.addEventListener("test", ls, ls),
      window.removeEventListener("test", ls, ls));
  } catch {
    Ml = !1;
  }
function pv(e, t, n, r, s, i, a, o, l) {
  var u = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, u);
  } catch (c) {
    this.onError(c);
  }
}
var Ls = !1,
  va = null,
  ya = !1,
  Nl = null,
  mv = {
    onError: function (e) {
      ((Ls = !0), (va = e));
    },
  };
function gv(e, t, n, r, s, i, a, o, l) {
  ((Ls = !1), (va = null), pv.apply(mv, arguments));
}
function vv(e, t, n, r, s, i, a, o, l) {
  if ((gv.apply(this, arguments), Ls)) {
    if (Ls) {
      var u = va;
      ((Ls = !1), (va = null));
    } else throw Error(N(198));
    ya || ((ya = !0), (Nl = u));
  }
}
function yr(e) {
  var t = e,
    n = e;
  if (e.alternate) for (; t.return; ) t = t.return;
  else {
    e = t;
    do ((t = e), t.flags & 4098 && (n = t.return), (e = t.return));
    while (e);
  }
  return t.tag === 3 ? n : null;
}
function vp(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if ((t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)), t !== null))
      return t.dehydrated;
  }
  return null;
}
function ff(e) {
  if (yr(e) !== e) throw Error(N(188));
}
function yv(e) {
  var t = e.alternate;
  if (!t) {
    if (((t = yr(e)), t === null)) throw Error(N(188));
    return t !== e ? null : e;
  }
  for (var n = e, r = t; ; ) {
    var s = n.return;
    if (s === null) break;
    var i = s.alternate;
    if (i === null) {
      if (((r = s.return), r !== null)) {
        n = r;
        continue;
      }
      break;
    }
    if (s.child === i.child) {
      for (i = s.child; i; ) {
        if (i === n) return (ff(s), e);
        if (i === r) return (ff(s), t);
        i = i.sibling;
      }
      throw Error(N(188));
    }
    if (n.return !== r.return) ((n = s), (r = i));
    else {
      for (var a = !1, o = s.child; o; ) {
        if (o === n) {
          ((a = !0), (n = s), (r = i));
          break;
        }
        if (o === r) {
          ((a = !0), (r = s), (n = i));
          break;
        }
        o = o.sibling;
      }
      if (!a) {
        for (o = i.child; o; ) {
          if (o === n) {
            ((a = !0), (n = i), (r = s));
            break;
          }
          if (o === r) {
            ((a = !0), (r = i), (n = s));
            break;
          }
          o = o.sibling;
        }
        if (!a) throw Error(N(189));
      }
    }
    if (n.alternate !== r) throw Error(N(190));
  }
  if (n.tag !== 3) throw Error(N(188));
  return n.stateNode.current === n ? e : t;
}
function yp(e) {
  return ((e = yv(e)), e !== null ? xp(e) : null);
}
function xp(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = xp(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var kp = lt.unstable_scheduleCallback,
  df = lt.unstable_cancelCallback,
  xv = lt.unstable_shouldYield,
  kv = lt.unstable_requestPaint,
  Te = lt.unstable_now,
  Sv = lt.unstable_getCurrentPriorityLevel,
  Wu = lt.unstable_ImmediatePriority,
  Sp = lt.unstable_UserBlockingPriority,
  xa = lt.unstable_NormalPriority,
  wv = lt.unstable_LowPriority,
  wp = lt.unstable_IdlePriority,
  eo = null,
  Kt = null;
function bv(e) {
  if (Kt && typeof Kt.onCommitFiberRoot == "function")
    try {
      Kt.onCommitFiberRoot(eo, e, void 0, (e.current.flags & 128) === 128);
    } catch {}
}
var Nt = Math.clz32 ? Math.clz32 : Cv,
  Ev = Math.log,
  Tv = Math.LN2;
function Cv(e) {
  return ((e >>>= 0), e === 0 ? 32 : (31 - ((Ev(e) / Tv) | 0)) | 0);
}
var Ei = 64,
  Ti = 4194304;
function Es(e) {
  switch (e & -e) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return e & 4194240;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return e & 130023424;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 1073741824;
    default:
      return e;
  }
}
function ka(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0,
    s = e.suspendedLanes,
    i = e.pingedLanes,
    a = n & 268435455;
  if (a !== 0) {
    var o = a & ~s;
    o !== 0 ? (r = Es(o)) : ((i &= a), i !== 0 && (r = Es(i)));
  } else ((a = n & ~s), a !== 0 ? (r = Es(a)) : i !== 0 && (r = Es(i)));
  if (r === 0) return 0;
  if (
    t !== 0 &&
    t !== r &&
    !(t & s) &&
    ((s = r & -r), (i = t & -t), s >= i || (s === 16 && (i & 4194240) !== 0))
  )
    return t;
  if ((r & 4 && (r |= n & 16), (t = e.entangledLanes), t !== 0))
    for (e = e.entanglements, t &= r; 0 < t; )
      ((n = 31 - Nt(t)), (s = 1 << n), (r |= e[n]), (t &= ~s));
  return r;
}
function Lv(e, t) {
  switch (e) {
    case 1:
    case 2:
    case 4:
      return t + 250;
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return t + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1;
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function Fv(e, t) {
  for (
    var n = e.suspendedLanes, r = e.pingedLanes, s = e.expirationTimes, i = e.pendingLanes;
    0 < i;
  ) {
    var a = 31 - Nt(i),
      o = 1 << a,
      l = s[a];
    (l === -1 ? (!(o & n) || o & r) && (s[a] = Lv(o, t)) : l <= t && (e.expiredLanes |= o),
      (i &= ~o));
  }
}
function Rl(e) {
  return ((e = e.pendingLanes & -1073741825), e !== 0 ? e : e & 1073741824 ? 1073741824 : 0);
}
function bp() {
  var e = Ei;
  return ((Ei <<= 1), !(Ei & 4194240) && (Ei = 64), e);
}
function Lo(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function ci(e, t, n) {
  ((e.pendingLanes |= t),
    t !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
    (e = e.eventTimes),
    (t = 31 - Nt(t)),
    (e[t] = n));
}
function Mv(e, t) {
  var n = e.pendingLanes & ~t;
  ((e.pendingLanes = t),
    (e.suspendedLanes = 0),
    (e.pingedLanes = 0),
    (e.expiredLanes &= t),
    (e.mutableReadLanes &= t),
    (e.entangledLanes &= t),
    (t = e.entanglements));
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var s = 31 - Nt(n),
      i = 1 << s;
    ((t[s] = 0), (r[s] = -1), (e[s] = -1), (n &= ~i));
  }
}
function Vu(e, t) {
  var n = (e.entangledLanes |= t);
  for (e = e.entanglements; n; ) {
    var r = 31 - Nt(n),
      s = 1 << r;
    ((s & t) | (e[r] & t) && (e[r] |= t), (n &= ~s));
  }
}
var ie = 0;
function Ep(e) {
  return ((e &= -e), 1 < e ? (4 < e ? (e & 268435455 ? 16 : 536870912) : 4) : 1);
}
var Tp,
  Ku,
  Cp,
  Lp,
  Fp,
  Ol = !1,
  Ci = [],
  On = null,
  In = null,
  Pn = null,
  $s = new Map(),
  _s = new Map(),
  bn = [],
  Nv =
    "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(
      " ",
    );
function hf(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      On = null;
      break;
    case "dragenter":
    case "dragleave":
      In = null;
      break;
    case "mouseover":
    case "mouseout":
      Pn = null;
      break;
    case "pointerover":
    case "pointerout":
      $s.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      _s.delete(t.pointerId);
  }
}
function us(e, t, n, r, s, i) {
  return e === null || e.nativeEvent !== i
    ? ((e = {
        blockedOn: t,
        domEventName: n,
        eventSystemFlags: r,
        nativeEvent: i,
        targetContainers: [s],
      }),
      t !== null && ((t = di(t)), t !== null && Ku(t)),
      e)
    : ((e.eventSystemFlags |= r),
      (t = e.targetContainers),
      s !== null && t.indexOf(s) === -1 && t.push(s),
      e);
}
function Rv(e, t, n, r, s) {
  switch (t) {
    case "focusin":
      return ((On = us(On, e, t, n, r, s)), !0);
    case "dragenter":
      return ((In = us(In, e, t, n, r, s)), !0);
    case "mouseover":
      return ((Pn = us(Pn, e, t, n, r, s)), !0);
    case "pointerover":
      var i = s.pointerId;
      return ($s.set(i, us($s.get(i) || null, e, t, n, r, s)), !0);
    case "gotpointercapture":
      return ((i = s.pointerId), _s.set(i, us(_s.get(i) || null, e, t, n, r, s)), !0);
  }
  return !1;
}
function Mp(e) {
  var t = rr(e.target);
  if (t !== null) {
    var n = yr(t);
    if (n !== null) {
      if (((t = n.tag), t === 13)) {
        if (((t = vp(n)), t !== null)) {
          ((e.blockedOn = t),
            Fp(e.priority, function () {
              Cp(n);
            }));
          return;
        }
      } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
        e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
        return;
      }
    }
  }
  e.blockedOn = null;
}
function Ji(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = Il(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      ((Ll = r), n.target.dispatchEvent(r), (Ll = null));
    } else return ((t = di(n)), t !== null && Ku(t), (e.blockedOn = n), !1);
    t.shift();
  }
  return !0;
}
function pf(e, t, n) {
  Ji(e) && n.delete(t);
}
function Ov() {
  ((Ol = !1),
    On !== null && Ji(On) && (On = null),
    In !== null && Ji(In) && (In = null),
    Pn !== null && Ji(Pn) && (Pn = null),
    $s.forEach(pf),
    _s.forEach(pf));
}
function cs(e, t) {
  e.blockedOn === t &&
    ((e.blockedOn = null),
    Ol || ((Ol = !0), lt.unstable_scheduleCallback(lt.unstable_NormalPriority, Ov)));
}
function zs(e) {
  function t(s) {
    return cs(s, e);
  }
  if (0 < Ci.length) {
    cs(Ci[0], e);
    for (var n = 1; n < Ci.length; n++) {
      var r = Ci[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (
    On !== null && cs(On, e),
      In !== null && cs(In, e),
      Pn !== null && cs(Pn, e),
      $s.forEach(t),
      _s.forEach(t),
      n = 0;
    n < bn.length;
    n++
  )
    ((r = bn[n]), r.blockedOn === e && (r.blockedOn = null));
  for (; 0 < bn.length && ((n = bn[0]), n.blockedOn === null); )
    (Mp(n), n.blockedOn === null && bn.shift());
}
var zr = dn.ReactCurrentBatchConfig,
  Sa = !0;
function Iv(e, t, n, r) {
  var s = ie,
    i = zr.transition;
  zr.transition = null;
  try {
    ((ie = 1), qu(e, t, n, r));
  } finally {
    ((ie = s), (zr.transition = i));
  }
}
function Pv(e, t, n, r) {
  var s = ie,
    i = zr.transition;
  zr.transition = null;
  try {
    ((ie = 4), qu(e, t, n, r));
  } finally {
    ((ie = s), (zr.transition = i));
  }
}
function qu(e, t, n, r) {
  if (Sa) {
    var s = Il(e, t, n, r);
    if (s === null) (Ao(e, t, r, wa, n), hf(e, r));
    else if (Rv(s, e, t, n, r)) r.stopPropagation();
    else if ((hf(e, r), t & 4 && -1 < Nv.indexOf(e))) {
      for (; s !== null; ) {
        var i = di(s);
        if ((i !== null && Tp(i), (i = Il(e, t, n, r)), i === null && Ao(e, t, r, wa, n), i === s))
          break;
        s = i;
      }
      s !== null && r.stopPropagation();
    } else Ao(e, t, r, null, n);
  }
}
var wa = null;
function Il(e, t, n, r) {
  if (((wa = null), (e = Hu(r)), (e = rr(e)), e !== null))
    if (((t = yr(e)), t === null)) e = null;
    else if (((n = t.tag), n === 13)) {
      if (((e = vp(t)), e !== null)) return e;
      e = null;
    } else if (n === 3) {
      if (t.stateNode.current.memoizedState.isDehydrated)
        return t.tag === 3 ? t.stateNode.containerInfo : null;
      e = null;
    } else t !== e && (e = null);
  return ((wa = e), null);
}
function Np(e) {
  switch (e) {
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 1;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "toggle":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 4;
    case "message":
      switch (Sv()) {
        case Wu:
          return 1;
        case Sp:
          return 4;
        case xa:
        case wv:
          return 16;
        case wp:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var Ln = null,
  Xu = null,
  ea = null;
function Rp() {
  if (ea) return ea;
  var e,
    t = Xu,
    n = t.length,
    r,
    s = "value" in Ln ? Ln.value : Ln.textContent,
    i = s.length;
  for (e = 0; e < n && t[e] === s[e]; e++);
  var a = n - e;
  for (r = 1; r <= a && t[n - r] === s[i - r]; r++);
  return (ea = s.slice(e, 1 < r ? 1 - r : void 0));
}
function ta(e) {
  var t = e.keyCode;
  return (
    "charCode" in e ? ((e = e.charCode), e === 0 && t === 13 && (e = 13)) : (e = t),
    e === 10 && (e = 13),
    32 <= e || e === 13 ? e : 0
  );
}
function Li() {
  return !0;
}
function mf() {
  return !1;
}
function ft(e) {
  function t(n, r, s, i, a) {
    ((this._reactName = n),
      (this._targetInst = s),
      (this.type = r),
      (this.nativeEvent = i),
      (this.target = a),
      (this.currentTarget = null));
    for (var o in e) e.hasOwnProperty(o) && ((n = e[o]), (this[o] = n ? n(i) : i[o]));
    return (
      (this.isDefaultPrevented = (
        i.defaultPrevented != null ? i.defaultPrevented : i.returnValue === !1
      )
        ? Li
        : mf),
      (this.isPropagationStopped = mf),
      this
    );
  }
  return (
    xe(t.prototype, {
      preventDefault: function () {
        this.defaultPrevented = !0;
        var n = this.nativeEvent;
        n &&
          (n.preventDefault
            ? n.preventDefault()
            : typeof n.returnValue != "unknown" && (n.returnValue = !1),
          (this.isDefaultPrevented = Li));
      },
      stopPropagation: function () {
        var n = this.nativeEvent;
        n &&
          (n.stopPropagation
            ? n.stopPropagation()
            : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
          (this.isPropagationStopped = Li));
      },
      persist: function () {},
      isPersistent: Li,
    }),
    t
  );
}
var rs = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function (e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0,
  },
  Zu = ft(rs),
  fi = xe({}, rs, { view: 0, detail: 0 }),
  Dv = ft(fi),
  Fo,
  Mo,
  fs,
  to = xe({}, fi, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: Yu,
    button: 0,
    buttons: 0,
    relatedTarget: function (e) {
      return e.relatedTarget === void 0
        ? e.fromElement === e.srcElement
          ? e.toElement
          : e.fromElement
        : e.relatedTarget;
    },
    movementX: function (e) {
      return "movementX" in e
        ? e.movementX
        : (e !== fs &&
            (fs && e.type === "mousemove"
              ? ((Fo = e.screenX - fs.screenX), (Mo = e.screenY - fs.screenY))
              : (Mo = Fo = 0),
            (fs = e)),
          Fo);
    },
    movementY: function (e) {
      return "movementY" in e ? e.movementY : Mo;
    },
  }),
  gf = ft(to),
  Uv = xe({}, to, { dataTransfer: 0 }),
  Av = ft(Uv),
  Bv = xe({}, fi, { relatedTarget: 0 }),
  No = ft(Bv),
  $v = xe({}, rs, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
  _v = ft($v),
  zv = xe({}, rs, {
    clipboardData: function (e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    },
  }),
  jv = ft(zv),
  Gv = xe({}, rs, { data: 0 }),
  vf = ft(Gv),
  Hv = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified",
  },
  Wv = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta",
  },
  Vv = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function Kv(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = Vv[e]) ? !!t[e] : !1;
}
function Yu() {
  return Kv;
}
var qv = xe({}, fi, {
    key: function (e) {
      if (e.key) {
        var t = Hv[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress"
        ? ((e = ta(e)), e === 13 ? "Enter" : String.fromCharCode(e))
        : e.type === "keydown" || e.type === "keyup"
          ? Wv[e.keyCode] || "Unidentified"
          : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: Yu,
    charCode: function (e) {
      return e.type === "keypress" ? ta(e) : 0;
    },
    keyCode: function (e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function (e) {
      return e.type === "keypress"
        ? ta(e)
        : e.type === "keydown" || e.type === "keyup"
          ? e.keyCode
          : 0;
    },
  }),
  Xv = ft(qv),
  Zv = xe({}, to, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0,
  }),
  yf = ft(Zv),
  Yv = xe({}, fi, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: Yu,
  }),
  Qv = ft(Yv),
  Jv = xe({}, rs, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
  ey = ft(Jv),
  ty = xe({}, to, {
    deltaX: function (e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function (e) {
      return "deltaY" in e
        ? e.deltaY
        : "wheelDeltaY" in e
          ? -e.wheelDeltaY
          : "wheelDelta" in e
            ? -e.wheelDelta
            : 0;
    },
    deltaZ: 0,
    deltaMode: 0,
  }),
  ny = ft(ty),
  ry = [9, 13, 27, 32],
  Qu = ln && "CompositionEvent" in window,
  Fs = null;
ln && "documentMode" in document && (Fs = document.documentMode);
var sy = ln && "TextEvent" in window && !Fs,
  Op = ln && (!Qu || (Fs && 8 < Fs && 11 >= Fs)),
  xf = " ",
  kf = !1;
function Ip(e, t) {
  switch (e) {
    case "keyup":
      return ry.indexOf(t.keyCode) !== -1;
    case "keydown":
      return t.keyCode !== 229;
    case "keypress":
    case "mousedown":
    case "focusout":
      return !0;
    default:
      return !1;
  }
}
function Pp(e) {
  return ((e = e.detail), typeof e == "object" && "data" in e ? e.data : null);
}
var Lr = !1;
function iy(e, t) {
  switch (e) {
    case "compositionend":
      return Pp(t);
    case "keypress":
      return t.which !== 32 ? null : ((kf = !0), xf);
    case "textInput":
      return ((e = t.data), e === xf && kf ? null : e);
    default:
      return null;
  }
}
function ay(e, t) {
  if (Lr)
    return e === "compositionend" || (!Qu && Ip(e, t))
      ? ((e = Rp()), (ea = Xu = Ln = null), (Lr = !1), e)
      : null;
  switch (e) {
    case "paste":
      return null;
    case "keypress":
      if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
        if (t.char && 1 < t.char.length) return t.char;
        if (t.which) return String.fromCharCode(t.which);
      }
      return null;
    case "compositionend":
      return Op && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var oy = {
  color: !0,
  date: !0,
  datetime: !0,
  "datetime-local": !0,
  email: !0,
  month: !0,
  number: !0,
  password: !0,
  range: !0,
  search: !0,
  tel: !0,
  text: !0,
  time: !0,
  url: !0,
  week: !0,
};
function Sf(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!oy[e.type] : t === "textarea";
}
function Dp(e, t, n, r) {
  (dp(r),
    (t = ba(t, "onChange")),
    0 < t.length &&
      ((n = new Zu("onChange", "change", null, n, r)), e.push({ event: n, listeners: t })));
}
var Ms = null,
  js = null;
function ly(e) {
  Vp(e, 0);
}
function no(e) {
  var t = Nr(e);
  if (ip(t)) return e;
}
function uy(e, t) {
  if (e === "change") return t;
}
var Up = !1;
if (ln) {
  var Ro;
  if (ln) {
    var Oo = "oninput" in document;
    if (!Oo) {
      var wf = document.createElement("div");
      (wf.setAttribute("oninput", "return;"), (Oo = typeof wf.oninput == "function"));
    }
    Ro = Oo;
  } else Ro = !1;
  Up = Ro && (!document.documentMode || 9 < document.documentMode);
}
function bf() {
  Ms && (Ms.detachEvent("onpropertychange", Ap), (js = Ms = null));
}
function Ap(e) {
  if (e.propertyName === "value" && no(js)) {
    var t = [];
    (Dp(t, js, e, Hu(e)), gp(ly, t));
  }
}
function cy(e, t, n) {
  e === "focusin"
    ? (bf(), (Ms = t), (js = n), Ms.attachEvent("onpropertychange", Ap))
    : e === "focusout" && bf();
}
function fy(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown") return no(js);
}
function dy(e, t) {
  if (e === "click") return no(t);
}
function hy(e, t) {
  if (e === "input" || e === "change") return no(t);
}
function py(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var Pt = typeof Object.is == "function" ? Object.is : py;
function Gs(e, t) {
  if (Pt(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
  var n = Object.keys(e),
    r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var s = n[r];
    if (!ml.call(t, s) || !Pt(e[s], t[s])) return !1;
  }
  return !0;
}
function Ef(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function Tf(e, t) {
  var n = Ef(e);
  e = 0;
  for (var r; n; ) {
    if (n.nodeType === 3) {
      if (((r = e + n.textContent.length), e <= t && r >= t)) return { node: n, offset: t - e };
      e = r;
    }
    e: {
      for (; n; ) {
        if (n.nextSibling) {
          n = n.nextSibling;
          break e;
        }
        n = n.parentNode;
      }
      n = void 0;
    }
    n = Ef(n);
  }
}
function Bp(e, t) {
  return e && t
    ? e === t
      ? !0
      : e && e.nodeType === 3
        ? !1
        : t && t.nodeType === 3
          ? Bp(e, t.parentNode)
          : "contains" in e
            ? e.contains(t)
            : e.compareDocumentPosition
              ? !!(e.compareDocumentPosition(t) & 16)
              : !1
    : !1;
}
function $p() {
  for (var e = window, t = ga(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = ga(e.document);
  }
  return t;
}
function Ju(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return (
    t &&
    ((t === "input" &&
      (e.type === "text" ||
        e.type === "search" ||
        e.type === "tel" ||
        e.type === "url" ||
        e.type === "password")) ||
      t === "textarea" ||
      e.contentEditable === "true")
  );
}
function my(e) {
  var t = $p(),
    n = e.focusedElem,
    r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && Bp(n.ownerDocument.documentElement, n)) {
    if (r !== null && Ju(n)) {
      if (((t = r.start), (e = r.end), e === void 0 && (e = t), "selectionStart" in n))
        ((n.selectionStart = t), (n.selectionEnd = Math.min(e, n.value.length)));
      else if (
        ((e = ((t = n.ownerDocument || document) && t.defaultView) || window), e.getSelection)
      ) {
        e = e.getSelection();
        var s = n.textContent.length,
          i = Math.min(r.start, s);
        ((r = r.end === void 0 ? i : Math.min(r.end, s)),
          !e.extend && i > r && ((s = r), (r = i), (i = s)),
          (s = Tf(n, i)));
        var a = Tf(n, r);
        s &&
          a &&
          (e.rangeCount !== 1 ||
            e.anchorNode !== s.node ||
            e.anchorOffset !== s.offset ||
            e.focusNode !== a.node ||
            e.focusOffset !== a.offset) &&
          ((t = t.createRange()),
          t.setStart(s.node, s.offset),
          e.removeAllRanges(),
          i > r
            ? (e.addRange(t), e.extend(a.node, a.offset))
            : (t.setEnd(a.node, a.offset), e.addRange(t)));
      }
    }
    for (t = [], e = n; (e = e.parentNode); )
      e.nodeType === 1 && t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
    for (typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++)
      ((e = t[n]), (e.element.scrollLeft = e.left), (e.element.scrollTop = e.top));
  }
}
var gy = ln && "documentMode" in document && 11 >= document.documentMode,
  Fr = null,
  Pl = null,
  Ns = null,
  Dl = !1;
function Cf(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  Dl ||
    Fr == null ||
    Fr !== ga(r) ||
    ((r = Fr),
    "selectionStart" in r && Ju(r)
      ? (r = { start: r.selectionStart, end: r.selectionEnd })
      : ((r = ((r.ownerDocument && r.ownerDocument.defaultView) || window).getSelection()),
        (r = {
          anchorNode: r.anchorNode,
          anchorOffset: r.anchorOffset,
          focusNode: r.focusNode,
          focusOffset: r.focusOffset,
        })),
    (Ns && Gs(Ns, r)) ||
      ((Ns = r),
      (r = ba(Pl, "onSelect")),
      0 < r.length &&
        ((t = new Zu("onSelect", "select", null, t, n)),
        e.push({ event: t, listeners: r }),
        (t.target = Fr))));
}
function Fi(e, t) {
  var n = {};
  return (
    (n[e.toLowerCase()] = t.toLowerCase()),
    (n["Webkit" + e] = "webkit" + t),
    (n["Moz" + e] = "moz" + t),
    n
  );
}
var Mr = {
    animationend: Fi("Animation", "AnimationEnd"),
    animationiteration: Fi("Animation", "AnimationIteration"),
    animationstart: Fi("Animation", "AnimationStart"),
    transitionend: Fi("Transition", "TransitionEnd"),
  },
  Io = {},
  _p = {};
ln &&
  ((_p = document.createElement("div").style),
  "AnimationEvent" in window ||
    (delete Mr.animationend.animation,
    delete Mr.animationiteration.animation,
    delete Mr.animationstart.animation),
  "TransitionEvent" in window || delete Mr.transitionend.transition);
function ro(e) {
  if (Io[e]) return Io[e];
  if (!Mr[e]) return e;
  var t = Mr[e],
    n;
  for (n in t) if (t.hasOwnProperty(n) && n in _p) return (Io[e] = t[n]);
  return e;
}
var zp = ro("animationend"),
  jp = ro("animationiteration"),
  Gp = ro("animationstart"),
  Hp = ro("transitionend"),
  Wp = new Map(),
  Lf =
    "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
      " ",
    );
function qn(e, t) {
  (Wp.set(e, t), vr(t, [e]));
}
for (var Po = 0; Po < Lf.length; Po++) {
  var Do = Lf[Po],
    vy = Do.toLowerCase(),
    yy = Do[0].toUpperCase() + Do.slice(1);
  qn(vy, "on" + yy);
}
qn(zp, "onAnimationEnd");
qn(jp, "onAnimationIteration");
qn(Gp, "onAnimationStart");
qn("dblclick", "onDoubleClick");
qn("focusin", "onFocus");
qn("focusout", "onBlur");
qn(Hp, "onTransitionEnd");
Kr("onMouseEnter", ["mouseout", "mouseover"]);
Kr("onMouseLeave", ["mouseout", "mouseover"]);
Kr("onPointerEnter", ["pointerout", "pointerover"]);
Kr("onPointerLeave", ["pointerout", "pointerover"]);
vr("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
vr(
  "onSelect",
  "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "),
);
vr("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
vr("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
vr("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
vr("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var Ts =
    "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
      " ",
    ),
  xy = new Set("cancel close invalid load scroll toggle".split(" ").concat(Ts));
function Ff(e, t, n) {
  var r = e.type || "unknown-event";
  ((e.currentTarget = n), vv(r, t, void 0, e), (e.currentTarget = null));
}
function Vp(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n],
      s = r.event;
    r = r.listeners;
    e: {
      var i = void 0;
      if (t)
        for (var a = r.length - 1; 0 <= a; a--) {
          var o = r[a],
            l = o.instance,
            u = o.currentTarget;
          if (((o = o.listener), l !== i && s.isPropagationStopped())) break e;
          (Ff(s, o, u), (i = l));
        }
      else
        for (a = 0; a < r.length; a++) {
          if (
            ((o = r[a]),
            (l = o.instance),
            (u = o.currentTarget),
            (o = o.listener),
            l !== i && s.isPropagationStopped())
          )
            break e;
          (Ff(s, o, u), (i = l));
        }
    }
  }
  if (ya) throw ((e = Nl), (ya = !1), (Nl = null), e);
}
function he(e, t) {
  var n = t[_l];
  n === void 0 && (n = t[_l] = new Set());
  var r = e + "__bubble";
  n.has(r) || (Kp(t, e, 2, !1), n.add(r));
}
function Uo(e, t, n) {
  var r = 0;
  (t && (r |= 4), Kp(n, e, r, t));
}
var Mi = "_reactListening" + Math.random().toString(36).slice(2);
function Hs(e) {
  if (!e[Mi]) {
    ((e[Mi] = !0),
      ep.forEach(function (n) {
        n !== "selectionchange" && (xy.has(n) || Uo(n, !1, e), Uo(n, !0, e));
      }));
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[Mi] || ((t[Mi] = !0), Uo("selectionchange", !1, t));
  }
}
function Kp(e, t, n, r) {
  switch (Np(t)) {
    case 1:
      var s = Iv;
      break;
    case 4:
      s = Pv;
      break;
    default:
      s = qu;
  }
  ((n = s.bind(null, t, n, e)),
    (s = void 0),
    !Ml || (t !== "touchstart" && t !== "touchmove" && t !== "wheel") || (s = !0),
    r
      ? s !== void 0
        ? e.addEventListener(t, n, { capture: !0, passive: s })
        : e.addEventListener(t, n, !0)
      : s !== void 0
        ? e.addEventListener(t, n, { passive: s })
        : e.addEventListener(t, n, !1));
}
function Ao(e, t, n, r, s) {
  var i = r;
  if (!(t & 1) && !(t & 2) && r !== null)
    e: for (;;) {
      if (r === null) return;
      var a = r.tag;
      if (a === 3 || a === 4) {
        var o = r.stateNode.containerInfo;
        if (o === s || (o.nodeType === 8 && o.parentNode === s)) break;
        if (a === 4)
          for (a = r.return; a !== null; ) {
            var l = a.tag;
            if (
              (l === 3 || l === 4) &&
              ((l = a.stateNode.containerInfo), l === s || (l.nodeType === 8 && l.parentNode === s))
            )
              return;
            a = a.return;
          }
        for (; o !== null; ) {
          if (((a = rr(o)), a === null)) return;
          if (((l = a.tag), l === 5 || l === 6)) {
            r = i = a;
            continue e;
          }
          o = o.parentNode;
        }
      }
      r = r.return;
    }
  gp(function () {
    var u = i,
      c = Hu(n),
      f = [];
    e: {
      var d = Wp.get(e);
      if (d !== void 0) {
        var h = Zu,
          m = e;
        switch (e) {
          case "keypress":
            if (ta(n) === 0) break e;
          case "keydown":
          case "keyup":
            h = Xv;
            break;
          case "focusin":
            ((m = "focus"), (h = No));
            break;
          case "focusout":
            ((m = "blur"), (h = No));
            break;
          case "beforeblur":
          case "afterblur":
            h = No;
            break;
          case "click":
            if (n.button === 2) break e;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            h = gf;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            h = Av;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            h = Qv;
            break;
          case zp:
          case jp:
          case Gp:
            h = _v;
            break;
          case Hp:
            h = ey;
            break;
          case "scroll":
            h = Dv;
            break;
          case "wheel":
            h = ny;
            break;
          case "copy":
          case "cut":
          case "paste":
            h = jv;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            h = yf;
        }
        var x = (t & 4) !== 0,
          k = !x && e === "scroll",
          p = x ? (d !== null ? d + "Capture" : null) : d;
        x = [];
        for (var g = u, v; g !== null; ) {
          v = g;
          var S = v.stateNode;
          if (
            (v.tag === 5 &&
              S !== null &&
              ((v = S), p !== null && ((S = Bs(g, p)), S != null && x.push(Ws(g, S, v)))),
            k)
          )
            break;
          g = g.return;
        }
        0 < x.length && ((d = new h(d, m, null, n, c)), f.push({ event: d, listeners: x }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (
          ((d = e === "mouseover" || e === "pointerover"),
          (h = e === "mouseout" || e === "pointerout"),
          d && n !== Ll && (m = n.relatedTarget || n.fromElement) && (rr(m) || m[un]))
        )
          break e;
        if (
          (h || d) &&
          ((d =
            c.window === c ? c : (d = c.ownerDocument) ? d.defaultView || d.parentWindow : window),
          h
            ? ((m = n.relatedTarget || n.toElement),
              (h = u),
              (m = m ? rr(m) : null),
              m !== null && ((k = yr(m)), m !== k || (m.tag !== 5 && m.tag !== 6)) && (m = null))
            : ((h = null), (m = u)),
          h !== m)
        ) {
          if (
            ((x = gf),
            (S = "onMouseLeave"),
            (p = "onMouseEnter"),
            (g = "mouse"),
            (e === "pointerout" || e === "pointerover") &&
              ((x = yf), (S = "onPointerLeave"), (p = "onPointerEnter"), (g = "pointer")),
            (k = h == null ? d : Nr(h)),
            (v = m == null ? d : Nr(m)),
            (d = new x(S, g + "leave", h, n, c)),
            (d.target = k),
            (d.relatedTarget = v),
            (S = null),
            rr(c) === u &&
              ((x = new x(p, g + "enter", m, n, c)),
              (x.target = v),
              (x.relatedTarget = k),
              (S = x)),
            (k = S),
            h && m)
          )
            t: {
              for (x = h, p = m, g = 0, v = x; v; v = kr(v)) g++;
              for (v = 0, S = p; S; S = kr(S)) v++;
              for (; 0 < g - v; ) ((x = kr(x)), g--);
              for (; 0 < v - g; ) ((p = kr(p)), v--);
              for (; g--; ) {
                if (x === p || (p !== null && x === p.alternate)) break t;
                ((x = kr(x)), (p = kr(p)));
              }
              x = null;
            }
          else x = null;
          (h !== null && Mf(f, d, h, x, !1), m !== null && k !== null && Mf(f, k, m, x, !0));
        }
      }
      e: {
        if (
          ((d = u ? Nr(u) : window),
          (h = d.nodeName && d.nodeName.toLowerCase()),
          h === "select" || (h === "input" && d.type === "file"))
        )
          var b = uy;
        else if (Sf(d))
          if (Up) b = hy;
          else {
            b = fy;
            var L = cy;
          }
        else
          (h = d.nodeName) &&
            h.toLowerCase() === "input" &&
            (d.type === "checkbox" || d.type === "radio") &&
            (b = dy);
        if (b && (b = b(e, u))) {
          Dp(f, b, n, c);
          break e;
        }
        (L && L(e, d, u),
          e === "focusout" &&
            (L = d._wrapperState) &&
            L.controlled &&
            d.type === "number" &&
            wl(d, "number", d.value));
      }
      switch (((L = u ? Nr(u) : window), e)) {
        case "focusin":
          (Sf(L) || L.contentEditable === "true") && ((Fr = L), (Pl = u), (Ns = null));
          break;
        case "focusout":
          Ns = Pl = Fr = null;
          break;
        case "mousedown":
          Dl = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          ((Dl = !1), Cf(f, n, c));
          break;
        case "selectionchange":
          if (gy) break;
        case "keydown":
        case "keyup":
          Cf(f, n, c);
      }
      var T;
      if (Qu)
        e: {
          switch (e) {
            case "compositionstart":
              var E = "onCompositionStart";
              break e;
            case "compositionend":
              E = "onCompositionEnd";
              break e;
            case "compositionupdate":
              E = "onCompositionUpdate";
              break e;
          }
          E = void 0;
        }
      else
        Lr
          ? Ip(e, n) && (E = "onCompositionEnd")
          : e === "keydown" && n.keyCode === 229 && (E = "onCompositionStart");
      (E &&
        (Op &&
          n.locale !== "ko" &&
          (Lr || E !== "onCompositionStart"
            ? E === "onCompositionEnd" && Lr && (T = Rp())
            : ((Ln = c), (Xu = "value" in Ln ? Ln.value : Ln.textContent), (Lr = !0))),
        (L = ba(u, E)),
        0 < L.length &&
          ((E = new vf(E, e, null, n, c)),
          f.push({ event: E, listeners: L }),
          T ? (E.data = T) : ((T = Pp(n)), T !== null && (E.data = T)))),
        (T = sy ? iy(e, n) : ay(e, n)) &&
          ((u = ba(u, "onBeforeInput")),
          0 < u.length &&
            ((c = new vf("onBeforeInput", "beforeinput", null, n, c)),
            f.push({ event: c, listeners: u }),
            (c.data = T))));
    }
    Vp(f, t);
  });
}
function Ws(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function ba(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var s = e,
      i = s.stateNode;
    (s.tag === 5 &&
      i !== null &&
      ((s = i),
      (i = Bs(e, n)),
      i != null && r.unshift(Ws(e, i, s)),
      (i = Bs(e, t)),
      i != null && r.push(Ws(e, i, s))),
      (e = e.return));
  }
  return r;
}
function kr(e) {
  if (e === null) return null;
  do e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function Mf(e, t, n, r, s) {
  for (var i = t._reactName, a = []; n !== null && n !== r; ) {
    var o = n,
      l = o.alternate,
      u = o.stateNode;
    if (l !== null && l === r) break;
    (o.tag === 5 &&
      u !== null &&
      ((o = u),
      s
        ? ((l = Bs(n, i)), l != null && a.unshift(Ws(n, l, o)))
        : s || ((l = Bs(n, i)), l != null && a.push(Ws(n, l, o)))),
      (n = n.return));
  }
  a.length !== 0 && e.push({ event: t, listeners: a });
}
var ky = /\r\n?/g,
  Sy = /\u0000|\uFFFD/g;
function Nf(e) {
  return (typeof e == "string" ? e : "" + e)
    .replace(
      ky,
      `
`,
    )
    .replace(Sy, "");
}
function Ni(e, t, n) {
  if (((t = Nf(t)), Nf(e) !== t && n)) throw Error(N(425));
}
function Ea() {}
var Ul = null,
  Al = null;
function Bl(e, t) {
  return (
    e === "textarea" ||
    e === "noscript" ||
    typeof t.children == "string" ||
    typeof t.children == "number" ||
    (typeof t.dangerouslySetInnerHTML == "object" &&
      t.dangerouslySetInnerHTML !== null &&
      t.dangerouslySetInnerHTML.__html != null)
  );
}
var $l = typeof setTimeout == "function" ? setTimeout : void 0,
  wy = typeof clearTimeout == "function" ? clearTimeout : void 0,
  Rf = typeof Promise == "function" ? Promise : void 0,
  by =
    typeof queueMicrotask == "function"
      ? queueMicrotask
      : typeof Rf < "u"
        ? function (e) {
            return Rf.resolve(null).then(e).catch(Ey);
          }
        : $l;
function Ey(e) {
  setTimeout(function () {
    throw e;
  });
}
function Bo(e, t) {
  var n = t,
    r = 0;
  do {
    var s = n.nextSibling;
    if ((e.removeChild(n), s && s.nodeType === 8))
      if (((n = s.data), n === "/$")) {
        if (r === 0) {
          (e.removeChild(s), zs(t));
          return;
        }
        r--;
      } else (n !== "$" && n !== "$?" && n !== "$!") || r++;
    n = s;
  } while (n);
  zs(t);
}
function Dn(e) {
  for (; e != null; e = e.nextSibling) {
    var t = e.nodeType;
    if (t === 1 || t === 3) break;
    if (t === 8) {
      if (((t = e.data), t === "$" || t === "$!" || t === "$?")) break;
      if (t === "/$") return null;
    }
  }
  return e;
}
function Of(e) {
  e = e.previousSibling;
  for (var t = 0; e; ) {
    if (e.nodeType === 8) {
      var n = e.data;
      if (n === "$" || n === "$!" || n === "$?") {
        if (t === 0) return e;
        t--;
      } else n === "/$" && t++;
    }
    e = e.previousSibling;
  }
  return null;
}
var ss = Math.random().toString(36).slice(2),
  Wt = "__reactFiber$" + ss,
  Vs = "__reactProps$" + ss,
  un = "__reactContainer$" + ss,
  _l = "__reactEvents$" + ss,
  Ty = "__reactListeners$" + ss,
  Cy = "__reactHandles$" + ss;
function rr(e) {
  var t = e[Wt];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if ((t = n[un] || n[Wt])) {
      if (((n = t.alternate), t.child !== null || (n !== null && n.child !== null)))
        for (e = Of(e); e !== null; ) {
          if ((n = e[Wt])) return n;
          e = Of(e);
        }
      return t;
    }
    ((e = n), (n = e.parentNode));
  }
  return null;
}
function di(e) {
  return (
    (e = e[Wt] || e[un]),
    !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3) ? null : e
  );
}
function Nr(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(N(33));
}
function so(e) {
  return e[Vs] || null;
}
var zl = [],
  Rr = -1;
function Xn(e) {
  return { current: e };
}
function pe(e) {
  0 > Rr || ((e.current = zl[Rr]), (zl[Rr] = null), Rr--);
}
function de(e, t) {
  (Rr++, (zl[Rr] = e.current), (e.current = t));
}
var Hn = {},
  Ge = Xn(Hn),
  et = Xn(!1),
  cr = Hn;
function qr(e, t) {
  var n = e.type.contextTypes;
  if (!n) return Hn;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t)
    return r.__reactInternalMemoizedMaskedChildContext;
  var s = {},
    i;
  for (i in n) s[i] = t[i];
  return (
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = t),
      (e.__reactInternalMemoizedMaskedChildContext = s)),
    s
  );
}
function tt(e) {
  return ((e = e.childContextTypes), e != null);
}
function Ta() {
  (pe(et), pe(Ge));
}
function If(e, t, n) {
  if (Ge.current !== Hn) throw Error(N(168));
  (de(Ge, t), de(et, n));
}
function qp(e, t, n) {
  var r = e.stateNode;
  if (((t = t.childContextTypes), typeof r.getChildContext != "function")) return n;
  r = r.getChildContext();
  for (var s in r) if (!(s in t)) throw Error(N(108, cv(e) || "Unknown", s));
  return xe({}, n, r);
}
function Ca(e) {
  return (
    (e = ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) || Hn),
    (cr = Ge.current),
    de(Ge, e),
    de(et, et.current),
    !0
  );
}
function Pf(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(N(169));
  (n
    ? ((e = qp(e, t, cr)),
      (r.__reactInternalMemoizedMergedChildContext = e),
      pe(et),
      pe(Ge),
      de(Ge, e))
    : pe(et),
    de(et, n));
}
var Jt = null,
  io = !1,
  $o = !1;
function Xp(e) {
  Jt === null ? (Jt = [e]) : Jt.push(e);
}
function Ly(e) {
  ((io = !0), Xp(e));
}
function Zn() {
  if (!$o && Jt !== null) {
    $o = !0;
    var e = 0,
      t = ie;
    try {
      var n = Jt;
      for (ie = 1; e < n.length; e++) {
        var r = n[e];
        do r = r(!0);
        while (r !== null);
      }
      ((Jt = null), (io = !1));
    } catch (s) {
      throw (Jt !== null && (Jt = Jt.slice(e + 1)), kp(Wu, Zn), s);
    } finally {
      ((ie = t), ($o = !1));
    }
  }
  return null;
}
var Or = [],
  Ir = 0,
  La = null,
  Fa = 0,
  gt = [],
  vt = 0,
  fr = null,
  en = 1,
  tn = "";
function Jn(e, t) {
  ((Or[Ir++] = Fa), (Or[Ir++] = La), (La = e), (Fa = t));
}
function Zp(e, t, n) {
  ((gt[vt++] = en), (gt[vt++] = tn), (gt[vt++] = fr), (fr = e));
  var r = en;
  e = tn;
  var s = 32 - Nt(r) - 1;
  ((r &= ~(1 << s)), (n += 1));
  var i = 32 - Nt(t) + s;
  if (30 < i) {
    var a = s - (s % 5);
    ((i = (r & ((1 << a) - 1)).toString(32)),
      (r >>= a),
      (s -= a),
      (en = (1 << (32 - Nt(t) + s)) | (n << s) | r),
      (tn = i + e));
  } else ((en = (1 << i) | (n << s) | r), (tn = e));
}
function ec(e) {
  e.return !== null && (Jn(e, 1), Zp(e, 1, 0));
}
function tc(e) {
  for (; e === La; ) ((La = Or[--Ir]), (Or[Ir] = null), (Fa = Or[--Ir]), (Or[Ir] = null));
  for (; e === fr; )
    ((fr = gt[--vt]),
      (gt[vt] = null),
      (tn = gt[--vt]),
      (gt[vt] = null),
      (en = gt[--vt]),
      (gt[vt] = null));
}
var ot = null,
  it = null,
  me = !1,
  Lt = null;
function Yp(e, t) {
  var n = xt(5, null, null, 0);
  ((n.elementType = "DELETED"),
    (n.stateNode = t),
    (n.return = e),
    (t = e.deletions),
    t === null ? ((e.deletions = [n]), (e.flags |= 16)) : t.push(n));
}
function Df(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return (
        (t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t),
        t !== null ? ((e.stateNode = t), (ot = e), (it = Dn(t.firstChild)), !0) : !1
      );
    case 6:
      return (
        (t = e.pendingProps === "" || t.nodeType !== 3 ? null : t),
        t !== null ? ((e.stateNode = t), (ot = e), (it = null), !0) : !1
      );
    case 13:
      return (
        (t = t.nodeType !== 8 ? null : t),
        t !== null
          ? ((n = fr !== null ? { id: en, overflow: tn } : null),
            (e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }),
            (n = xt(18, null, null, 0)),
            (n.stateNode = t),
            (n.return = e),
            (e.child = n),
            (ot = e),
            (it = null),
            !0)
          : !1
      );
    default:
      return !1;
  }
}
function jl(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function Gl(e) {
  if (me) {
    var t = it;
    if (t) {
      var n = t;
      if (!Df(e, t)) {
        if (jl(e)) throw Error(N(418));
        t = Dn(n.nextSibling);
        var r = ot;
        t && Df(e, t) ? Yp(r, n) : ((e.flags = (e.flags & -4097) | 2), (me = !1), (ot = e));
      }
    } else {
      if (jl(e)) throw Error(N(418));
      ((e.flags = (e.flags & -4097) | 2), (me = !1), (ot = e));
    }
  }
}
function Uf(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
  ot = e;
}
function Ri(e) {
  if (e !== ot) return !1;
  if (!me) return (Uf(e), (me = !0), !1);
  var t;
  if (
    ((t = e.tag !== 3) &&
      !(t = e.tag !== 5) &&
      ((t = e.type), (t = t !== "head" && t !== "body" && !Bl(e.type, e.memoizedProps))),
    t && (t = it))
  ) {
    if (jl(e)) throw (Qp(), Error(N(418)));
    for (; t; ) (Yp(e, t), (t = Dn(t.nextSibling)));
  }
  if ((Uf(e), e.tag === 13)) {
    if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e)) throw Error(N(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              it = Dn(e.nextSibling);
              break e;
            }
            t--;
          } else (n !== "$" && n !== "$!" && n !== "$?") || t++;
        }
        e = e.nextSibling;
      }
      it = null;
    }
  } else it = ot ? Dn(e.stateNode.nextSibling) : null;
  return !0;
}
function Qp() {
  for (var e = it; e; ) e = Dn(e.nextSibling);
}
function Xr() {
  ((it = ot = null), (me = !1));
}
function nc(e) {
  Lt === null ? (Lt = [e]) : Lt.push(e);
}
var Fy = dn.ReactCurrentBatchConfig;
function ds(e, t, n) {
  if (((e = n.ref), e !== null && typeof e != "function" && typeof e != "object")) {
    if (n._owner) {
      if (((n = n._owner), n)) {
        if (n.tag !== 1) throw Error(N(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(N(147, e));
      var s = r,
        i = "" + e;
      return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === i
        ? t.ref
        : ((t = function (a) {
            var o = s.refs;
            a === null ? delete o[i] : (o[i] = a);
          }),
          (t._stringRef = i),
          t);
    }
    if (typeof e != "string") throw Error(N(284));
    if (!n._owner) throw Error(N(290, e));
  }
  return e;
}
function Oi(e, t) {
  throw (
    (e = Object.prototype.toString.call(t)),
    Error(
      N(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e),
    )
  );
}
function Af(e) {
  var t = e._init;
  return t(e._payload);
}
function Jp(e) {
  function t(p, g) {
    if (e) {
      var v = p.deletions;
      v === null ? ((p.deletions = [g]), (p.flags |= 16)) : v.push(g);
    }
  }
  function n(p, g) {
    if (!e) return null;
    for (; g !== null; ) (t(p, g), (g = g.sibling));
    return null;
  }
  function r(p, g) {
    for (p = new Map(); g !== null; )
      (g.key !== null ? p.set(g.key, g) : p.set(g.index, g), (g = g.sibling));
    return p;
  }
  function s(p, g) {
    return ((p = $n(p, g)), (p.index = 0), (p.sibling = null), p);
  }
  function i(p, g, v) {
    return (
      (p.index = v),
      e
        ? ((v = p.alternate),
          v !== null ? ((v = v.index), v < g ? ((p.flags |= 2), g) : v) : ((p.flags |= 2), g))
        : ((p.flags |= 1048576), g)
    );
  }
  function a(p) {
    return (e && p.alternate === null && (p.flags |= 2), p);
  }
  function o(p, g, v, S) {
    return g === null || g.tag !== 6
      ? ((g = Vo(v, p.mode, S)), (g.return = p), g)
      : ((g = s(g, v)), (g.return = p), g);
  }
  function l(p, g, v, S) {
    var b = v.type;
    return b === Cr
      ? c(p, g, v.props.children, S, v.key)
      : g !== null &&
          (g.elementType === b ||
            (typeof b == "object" && b !== null && b.$$typeof === kn && Af(b) === g.type))
        ? ((S = s(g, v.props)), (S.ref = ds(p, g, v)), (S.return = p), S)
        : ((S = la(v.type, v.key, v.props, null, p.mode, S)),
          (S.ref = ds(p, g, v)),
          (S.return = p),
          S);
  }
  function u(p, g, v, S) {
    return g === null ||
      g.tag !== 4 ||
      g.stateNode.containerInfo !== v.containerInfo ||
      g.stateNode.implementation !== v.implementation
      ? ((g = Ko(v, p.mode, S)), (g.return = p), g)
      : ((g = s(g, v.children || [])), (g.return = p), g);
  }
  function c(p, g, v, S, b) {
    return g === null || g.tag !== 7
      ? ((g = or(v, p.mode, S, b)), (g.return = p), g)
      : ((g = s(g, v)), (g.return = p), g);
  }
  function f(p, g, v) {
    if ((typeof g == "string" && g !== "") || typeof g == "number")
      return ((g = Vo("" + g, p.mode, v)), (g.return = p), g);
    if (typeof g == "object" && g !== null) {
      switch (g.$$typeof) {
        case Si:
          return (
            (v = la(g.type, g.key, g.props, null, p.mode, v)),
            (v.ref = ds(p, null, g)),
            (v.return = p),
            v
          );
        case Tr:
          return ((g = Ko(g, p.mode, v)), (g.return = p), g);
        case kn:
          var S = g._init;
          return f(p, S(g._payload), v);
      }
      if (bs(g) || os(g)) return ((g = or(g, p.mode, v, null)), (g.return = p), g);
      Oi(p, g);
    }
    return null;
  }
  function d(p, g, v, S) {
    var b = g !== null ? g.key : null;
    if ((typeof v == "string" && v !== "") || typeof v == "number")
      return b !== null ? null : o(p, g, "" + v, S);
    if (typeof v == "object" && v !== null) {
      switch (v.$$typeof) {
        case Si:
          return v.key === b ? l(p, g, v, S) : null;
        case Tr:
          return v.key === b ? u(p, g, v, S) : null;
        case kn:
          return ((b = v._init), d(p, g, b(v._payload), S));
      }
      if (bs(v) || os(v)) return b !== null ? null : c(p, g, v, S, null);
      Oi(p, v);
    }
    return null;
  }
  function h(p, g, v, S, b) {
    if ((typeof S == "string" && S !== "") || typeof S == "number")
      return ((p = p.get(v) || null), o(g, p, "" + S, b));
    if (typeof S == "object" && S !== null) {
      switch (S.$$typeof) {
        case Si:
          return ((p = p.get(S.key === null ? v : S.key) || null), l(g, p, S, b));
        case Tr:
          return ((p = p.get(S.key === null ? v : S.key) || null), u(g, p, S, b));
        case kn:
          var L = S._init;
          return h(p, g, v, L(S._payload), b);
      }
      if (bs(S) || os(S)) return ((p = p.get(v) || null), c(g, p, S, b, null));
      Oi(g, S);
    }
    return null;
  }
  function m(p, g, v, S) {
    for (var b = null, L = null, T = g, E = (g = 0), I = null; T !== null && E < v.length; E++) {
      T.index > E ? ((I = T), (T = null)) : (I = T.sibling);
      var P = d(p, T, v[E], S);
      if (P === null) {
        T === null && (T = I);
        break;
      }
      (e && T && P.alternate === null && t(p, T),
        (g = i(P, g, E)),
        L === null ? (b = P) : (L.sibling = P),
        (L = P),
        (T = I));
    }
    if (E === v.length) return (n(p, T), me && Jn(p, E), b);
    if (T === null) {
      for (; E < v.length; E++)
        ((T = f(p, v[E], S)),
          T !== null && ((g = i(T, g, E)), L === null ? (b = T) : (L.sibling = T), (L = T)));
      return (me && Jn(p, E), b);
    }
    for (T = r(p, T); E < v.length; E++)
      ((I = h(T, p, E, v[E], S)),
        I !== null &&
          (e && I.alternate !== null && T.delete(I.key === null ? E : I.key),
          (g = i(I, g, E)),
          L === null ? (b = I) : (L.sibling = I),
          (L = I)));
    return (
      e &&
        T.forEach(function (q) {
          return t(p, q);
        }),
      me && Jn(p, E),
      b
    );
  }
  function x(p, g, v, S) {
    var b = os(v);
    if (typeof b != "function") throw Error(N(150));
    if (((v = b.call(v)), v == null)) throw Error(N(151));
    for (
      var L = (b = null), T = g, E = (g = 0), I = null, P = v.next();
      T !== null && !P.done;
      E++, P = v.next()
    ) {
      T.index > E ? ((I = T), (T = null)) : (I = T.sibling);
      var q = d(p, T, P.value, S);
      if (q === null) {
        T === null && (T = I);
        break;
      }
      (e && T && q.alternate === null && t(p, T),
        (g = i(q, g, E)),
        L === null ? (b = q) : (L.sibling = q),
        (L = q),
        (T = I));
    }
    if (P.done) return (n(p, T), me && Jn(p, E), b);
    if (T === null) {
      for (; !P.done; E++, P = v.next())
        ((P = f(p, P.value, S)),
          P !== null && ((g = i(P, g, E)), L === null ? (b = P) : (L.sibling = P), (L = P)));
      return (me && Jn(p, E), b);
    }
    for (T = r(p, T); !P.done; E++, P = v.next())
      ((P = h(T, p, E, P.value, S)),
        P !== null &&
          (e && P.alternate !== null && T.delete(P.key === null ? E : P.key),
          (g = i(P, g, E)),
          L === null ? (b = P) : (L.sibling = P),
          (L = P)));
    return (
      e &&
        T.forEach(function (Q) {
          return t(p, Q);
        }),
      me && Jn(p, E),
      b
    );
  }
  function k(p, g, v, S) {
    if (
      (typeof v == "object" &&
        v !== null &&
        v.type === Cr &&
        v.key === null &&
        (v = v.props.children),
      typeof v == "object" && v !== null)
    ) {
      switch (v.$$typeof) {
        case Si:
          e: {
            for (var b = v.key, L = g; L !== null; ) {
              if (L.key === b) {
                if (((b = v.type), b === Cr)) {
                  if (L.tag === 7) {
                    (n(p, L.sibling), (g = s(L, v.props.children)), (g.return = p), (p = g));
                    break e;
                  }
                } else if (
                  L.elementType === b ||
                  (typeof b == "object" && b !== null && b.$$typeof === kn && Af(b) === L.type)
                ) {
                  (n(p, L.sibling),
                    (g = s(L, v.props)),
                    (g.ref = ds(p, L, v)),
                    (g.return = p),
                    (p = g));
                  break e;
                }
                n(p, L);
                break;
              } else t(p, L);
              L = L.sibling;
            }
            v.type === Cr
              ? ((g = or(v.props.children, p.mode, S, v.key)), (g.return = p), (p = g))
              : ((S = la(v.type, v.key, v.props, null, p.mode, S)),
                (S.ref = ds(p, g, v)),
                (S.return = p),
                (p = S));
          }
          return a(p);
        case Tr:
          e: {
            for (L = v.key; g !== null; ) {
              if (g.key === L)
                if (
                  g.tag === 4 &&
                  g.stateNode.containerInfo === v.containerInfo &&
                  g.stateNode.implementation === v.implementation
                ) {
                  (n(p, g.sibling), (g = s(g, v.children || [])), (g.return = p), (p = g));
                  break e;
                } else {
                  n(p, g);
                  break;
                }
              else t(p, g);
              g = g.sibling;
            }
            ((g = Ko(v, p.mode, S)), (g.return = p), (p = g));
          }
          return a(p);
        case kn:
          return ((L = v._init), k(p, g, L(v._payload), S));
      }
      if (bs(v)) return m(p, g, v, S);
      if (os(v)) return x(p, g, v, S);
      Oi(p, v);
    }
    return (typeof v == "string" && v !== "") || typeof v == "number"
      ? ((v = "" + v),
        g !== null && g.tag === 6
          ? (n(p, g.sibling), (g = s(g, v)), (g.return = p), (p = g))
          : (n(p, g), (g = Vo(v, p.mode, S)), (g.return = p), (p = g)),
        a(p))
      : n(p, g);
  }
  return k;
}
var Zr = Jp(!0),
  em = Jp(!1),
  Ma = Xn(null),
  Na = null,
  Pr = null,
  rc = null;
function sc() {
  rc = Pr = Na = null;
}
function ic(e) {
  var t = Ma.current;
  (pe(Ma), (e._currentValue = t));
}
function Hl(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if (
      ((e.childLanes & t) !== t
        ? ((e.childLanes |= t), r !== null && (r.childLanes |= t))
        : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t),
      e === n)
    )
      break;
    e = e.return;
  }
}
function jr(e, t) {
  ((Na = e),
    (rc = Pr = null),
    (e = e.dependencies),
    e !== null && e.firstContext !== null && (e.lanes & t && (Je = !0), (e.firstContext = null)));
}
function St(e) {
  var t = e._currentValue;
  if (rc !== e)
    if (((e = { context: e, memoizedValue: t, next: null }), Pr === null)) {
      if (Na === null) throw Error(N(308));
      ((Pr = e), (Na.dependencies = { lanes: 0, firstContext: e }));
    } else Pr = Pr.next = e;
  return t;
}
var sr = null;
function ac(e) {
  sr === null ? (sr = [e]) : sr.push(e);
}
function tm(e, t, n, r) {
  var s = t.interleaved;
  return (
    s === null ? ((n.next = n), ac(t)) : ((n.next = s.next), (s.next = n)),
    (t.interleaved = n),
    cn(e, r)
  );
}
function cn(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; )
    ((e.childLanes |= t),
      (n = e.alternate),
      n !== null && (n.childLanes |= t),
      (n = e),
      (e = e.return));
  return n.tag === 3 ? n.stateNode : null;
}
var Sn = !1;
function oc(e) {
  e.updateQueue = {
    baseState: e.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, interleaved: null, lanes: 0 },
    effects: null,
  };
}
function nm(e, t) {
  ((e = e.updateQueue),
    t.updateQueue === e &&
      (t.updateQueue = {
        baseState: e.baseState,
        firstBaseUpdate: e.firstBaseUpdate,
        lastBaseUpdate: e.lastBaseUpdate,
        shared: e.shared,
        effects: e.effects,
      }));
}
function sn(e, t) {
  return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
}
function Un(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (((r = r.shared), re & 2)) {
    var s = r.pending;
    return (
      s === null ? (t.next = t) : ((t.next = s.next), (s.next = t)),
      (r.pending = t),
      cn(e, n)
    );
  }
  return (
    (s = r.interleaved),
    s === null ? ((t.next = t), ac(r)) : ((t.next = s.next), (s.next = t)),
    (r.interleaved = t),
    cn(e, n)
  );
}
function na(e, t, n) {
  if (((t = t.updateQueue), t !== null && ((t = t.shared), (n & 4194240) !== 0))) {
    var r = t.lanes;
    ((r &= e.pendingLanes), (n |= r), (t.lanes = n), Vu(e, n));
  }
}
function Bf(e, t) {
  var n = e.updateQueue,
    r = e.alternate;
  if (r !== null && ((r = r.updateQueue), n === r)) {
    var s = null,
      i = null;
    if (((n = n.firstBaseUpdate), n !== null)) {
      do {
        var a = {
          eventTime: n.eventTime,
          lane: n.lane,
          tag: n.tag,
          payload: n.payload,
          callback: n.callback,
          next: null,
        };
        (i === null ? (s = i = a) : (i = i.next = a), (n = n.next));
      } while (n !== null);
      i === null ? (s = i = t) : (i = i.next = t);
    } else s = i = t;
    ((n = {
      baseState: r.baseState,
      firstBaseUpdate: s,
      lastBaseUpdate: i,
      shared: r.shared,
      effects: r.effects,
    }),
      (e.updateQueue = n));
    return;
  }
  ((e = n.lastBaseUpdate),
    e === null ? (n.firstBaseUpdate = t) : (e.next = t),
    (n.lastBaseUpdate = t));
}
function Ra(e, t, n, r) {
  var s = e.updateQueue;
  Sn = !1;
  var i = s.firstBaseUpdate,
    a = s.lastBaseUpdate,
    o = s.shared.pending;
  if (o !== null) {
    s.shared.pending = null;
    var l = o,
      u = l.next;
    ((l.next = null), a === null ? (i = u) : (a.next = u), (a = l));
    var c = e.alternate;
    c !== null &&
      ((c = c.updateQueue),
      (o = c.lastBaseUpdate),
      o !== a && (o === null ? (c.firstBaseUpdate = u) : (o.next = u), (c.lastBaseUpdate = l)));
  }
  if (i !== null) {
    var f = s.baseState;
    ((a = 0), (c = u = l = null), (o = i));
    do {
      var d = o.lane,
        h = o.eventTime;
      if ((r & d) === d) {
        c !== null &&
          (c = c.next =
            {
              eventTime: h,
              lane: 0,
              tag: o.tag,
              payload: o.payload,
              callback: o.callback,
              next: null,
            });
        e: {
          var m = e,
            x = o;
          switch (((d = t), (h = n), x.tag)) {
            case 1:
              if (((m = x.payload), typeof m == "function")) {
                f = m.call(h, f, d);
                break e;
              }
              f = m;
              break e;
            case 3:
              m.flags = (m.flags & -65537) | 128;
            case 0:
              if (((m = x.payload), (d = typeof m == "function" ? m.call(h, f, d) : m), d == null))
                break e;
              f = xe({}, f, d);
              break e;
            case 2:
              Sn = !0;
          }
        }
        o.callback !== null &&
          o.lane !== 0 &&
          ((e.flags |= 64), (d = s.effects), d === null ? (s.effects = [o]) : d.push(o));
      } else
        ((h = {
          eventTime: h,
          lane: d,
          tag: o.tag,
          payload: o.payload,
          callback: o.callback,
          next: null,
        }),
          c === null ? ((u = c = h), (l = f)) : (c = c.next = h),
          (a |= d));
      if (((o = o.next), o === null)) {
        if (((o = s.shared.pending), o === null)) break;
        ((d = o), (o = d.next), (d.next = null), (s.lastBaseUpdate = d), (s.shared.pending = null));
      }
    } while (!0);
    if (
      (c === null && (l = f),
      (s.baseState = l),
      (s.firstBaseUpdate = u),
      (s.lastBaseUpdate = c),
      (t = s.shared.interleaved),
      t !== null)
    ) {
      s = t;
      do ((a |= s.lane), (s = s.next));
      while (s !== t);
    } else i === null && (s.shared.lanes = 0);
    ((hr |= a), (e.lanes = a), (e.memoizedState = f));
  }
}
function $f(e, t, n) {
  if (((e = t.effects), (t.effects = null), e !== null))
    for (t = 0; t < e.length; t++) {
      var r = e[t],
        s = r.callback;
      if (s !== null) {
        if (((r.callback = null), (r = n), typeof s != "function")) throw Error(N(191, s));
        s.call(r);
      }
    }
}
var hi = {},
  qt = Xn(hi),
  Ks = Xn(hi),
  qs = Xn(hi);
function ir(e) {
  if (e === hi) throw Error(N(174));
  return e;
}
function lc(e, t) {
  switch ((de(qs, t), de(Ks, e), de(qt, hi), (e = t.nodeType), e)) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : El(null, "");
      break;
    default:
      ((e = e === 8 ? t.parentNode : t),
        (t = e.namespaceURI || null),
        (e = e.tagName),
        (t = El(t, e)));
  }
  (pe(qt), de(qt, t));
}
function Yr() {
  (pe(qt), pe(Ks), pe(qs));
}
function rm(e) {
  ir(qs.current);
  var t = ir(qt.current),
    n = El(t, e.type);
  t !== n && (de(Ks, e), de(qt, n));
}
function uc(e) {
  Ks.current === e && (pe(qt), pe(Ks));
}
var ve = Xn(0);
function Oa(e) {
  for (var t = e; t !== null; ) {
    if (t.tag === 13) {
      var n = t.memoizedState;
      if (n !== null && ((n = n.dehydrated), n === null || n.data === "$?" || n.data === "$!"))
        return t;
    } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
      if (t.flags & 128) return t;
    } else if (t.child !== null) {
      ((t.child.return = t), (t = t.child));
      continue;
    }
    if (t === e) break;
    for (; t.sibling === null; ) {
      if (t.return === null || t.return === e) return null;
      t = t.return;
    }
    ((t.sibling.return = t.return), (t = t.sibling));
  }
  return null;
}
var _o = [];
function cc() {
  for (var e = 0; e < _o.length; e++) _o[e]._workInProgressVersionPrimary = null;
  _o.length = 0;
}
var ra = dn.ReactCurrentDispatcher,
  zo = dn.ReactCurrentBatchConfig,
  dr = 0,
  ye = null,
  Me = null,
  Oe = null,
  Ia = !1,
  Rs = !1,
  Xs = 0,
  My = 0;
function $e() {
  throw Error(N(321));
}
function fc(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++) if (!Pt(e[n], t[n])) return !1;
  return !0;
}
function dc(e, t, n, r, s, i) {
  if (
    ((dr = i),
    (ye = t),
    (t.memoizedState = null),
    (t.updateQueue = null),
    (t.lanes = 0),
    (ra.current = e === null || e.memoizedState === null ? Iy : Py),
    (e = n(r, s)),
    Rs)
  ) {
    i = 0;
    do {
      if (((Rs = !1), (Xs = 0), 25 <= i)) throw Error(N(301));
      ((i += 1), (Oe = Me = null), (t.updateQueue = null), (ra.current = Dy), (e = n(r, s)));
    } while (Rs);
  }
  if (
    ((ra.current = Pa),
    (t = Me !== null && Me.next !== null),
    (dr = 0),
    (Oe = Me = ye = null),
    (Ia = !1),
    t)
  )
    throw Error(N(300));
  return e;
}
function hc() {
  var e = Xs !== 0;
  return ((Xs = 0), e);
}
function Gt() {
  var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  return (Oe === null ? (ye.memoizedState = Oe = e) : (Oe = Oe.next = e), Oe);
}
function wt() {
  if (Me === null) {
    var e = ye.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = Me.next;
  var t = Oe === null ? ye.memoizedState : Oe.next;
  if (t !== null) ((Oe = t), (Me = e));
  else {
    if (e === null) throw Error(N(310));
    ((Me = e),
      (e = {
        memoizedState: Me.memoizedState,
        baseState: Me.baseState,
        baseQueue: Me.baseQueue,
        queue: Me.queue,
        next: null,
      }),
      Oe === null ? (ye.memoizedState = Oe = e) : (Oe = Oe.next = e));
  }
  return Oe;
}
function Zs(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function jo(e) {
  var t = wt(),
    n = t.queue;
  if (n === null) throw Error(N(311));
  n.lastRenderedReducer = e;
  var r = Me,
    s = r.baseQueue,
    i = n.pending;
  if (i !== null) {
    if (s !== null) {
      var a = s.next;
      ((s.next = i.next), (i.next = a));
    }
    ((r.baseQueue = s = i), (n.pending = null));
  }
  if (s !== null) {
    ((i = s.next), (r = r.baseState));
    var o = (a = null),
      l = null,
      u = i;
    do {
      var c = u.lane;
      if ((dr & c) === c)
        (l !== null &&
          (l = l.next =
            {
              lane: 0,
              action: u.action,
              hasEagerState: u.hasEagerState,
              eagerState: u.eagerState,
              next: null,
            }),
          (r = u.hasEagerState ? u.eagerState : e(r, u.action)));
      else {
        var f = {
          lane: c,
          action: u.action,
          hasEagerState: u.hasEagerState,
          eagerState: u.eagerState,
          next: null,
        };
        (l === null ? ((o = l = f), (a = r)) : (l = l.next = f), (ye.lanes |= c), (hr |= c));
      }
      u = u.next;
    } while (u !== null && u !== i);
    (l === null ? (a = r) : (l.next = o),
      Pt(r, t.memoizedState) || (Je = !0),
      (t.memoizedState = r),
      (t.baseState = a),
      (t.baseQueue = l),
      (n.lastRenderedState = r));
  }
  if (((e = n.interleaved), e !== null)) {
    s = e;
    do ((i = s.lane), (ye.lanes |= i), (hr |= i), (s = s.next));
    while (s !== e);
  } else s === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function Go(e) {
  var t = wt(),
    n = t.queue;
  if (n === null) throw Error(N(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch,
    s = n.pending,
    i = t.memoizedState;
  if (s !== null) {
    n.pending = null;
    var a = (s = s.next);
    do ((i = e(i, a.action)), (a = a.next));
    while (a !== s);
    (Pt(i, t.memoizedState) || (Je = !0),
      (t.memoizedState = i),
      t.baseQueue === null && (t.baseState = i),
      (n.lastRenderedState = i));
  }
  return [i, r];
}
function sm() {}
function im(e, t) {
  var n = ye,
    r = wt(),
    s = t(),
    i = !Pt(r.memoizedState, s);
  if (
    (i && ((r.memoizedState = s), (Je = !0)),
    (r = r.queue),
    pc(lm.bind(null, n, r, e), [e]),
    r.getSnapshot !== t || i || (Oe !== null && Oe.memoizedState.tag & 1))
  ) {
    if (((n.flags |= 2048), Ys(9, om.bind(null, n, r, s, t), void 0, null), Pe === null))
      throw Error(N(349));
    dr & 30 || am(n, t, s);
  }
  return s;
}
function am(e, t, n) {
  ((e.flags |= 16384),
    (e = { getSnapshot: t, value: n }),
    (t = ye.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }), (ye.updateQueue = t), (t.stores = [e]))
      : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e)));
}
function om(e, t, n, r) {
  ((t.value = n), (t.getSnapshot = r), um(t) && cm(e));
}
function lm(e, t, n) {
  return n(function () {
    um(t) && cm(e);
  });
}
function um(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Pt(e, n);
  } catch {
    return !0;
  }
}
function cm(e) {
  var t = cn(e, 1);
  t !== null && Rt(t, e, 1, -1);
}
function _f(e) {
  var t = Gt();
  return (
    typeof e == "function" && (e = e()),
    (t.memoizedState = t.baseState = e),
    (e = {
      pending: null,
      interleaved: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Zs,
      lastRenderedState: e,
    }),
    (t.queue = e),
    (e = e.dispatch = Oy.bind(null, ye, e)),
    [t.memoizedState, e]
  );
}
function Ys(e, t, n, r) {
  return (
    (e = { tag: e, create: t, destroy: n, deps: r, next: null }),
    (t = ye.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
        (ye.updateQueue = t),
        (t.lastEffect = e.next = e))
      : ((n = t.lastEffect),
        n === null
          ? (t.lastEffect = e.next = e)
          : ((r = n.next), (n.next = e), (e.next = r), (t.lastEffect = e))),
    e
  );
}
function fm() {
  return wt().memoizedState;
}
function sa(e, t, n, r) {
  var s = Gt();
  ((ye.flags |= e), (s.memoizedState = Ys(1 | t, n, void 0, r === void 0 ? null : r)));
}
function ao(e, t, n, r) {
  var s = wt();
  r = r === void 0 ? null : r;
  var i = void 0;
  if (Me !== null) {
    var a = Me.memoizedState;
    if (((i = a.destroy), r !== null && fc(r, a.deps))) {
      s.memoizedState = Ys(t, n, i, r);
      return;
    }
  }
  ((ye.flags |= e), (s.memoizedState = Ys(1 | t, n, i, r)));
}
function zf(e, t) {
  return sa(8390656, 8, e, t);
}
function pc(e, t) {
  return ao(2048, 8, e, t);
}
function dm(e, t) {
  return ao(4, 2, e, t);
}
function hm(e, t) {
  return ao(4, 4, e, t);
}
function pm(e, t) {
  if (typeof t == "function")
    return (
      (e = e()),
      t(e),
      function () {
        t(null);
      }
    );
  if (t != null)
    return (
      (e = e()),
      (t.current = e),
      function () {
        t.current = null;
      }
    );
}
function mm(e, t, n) {
  return ((n = n != null ? n.concat([e]) : null), ao(4, 4, pm.bind(null, t, e), n));
}
function mc() {}
function gm(e, t) {
  var n = wt();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && fc(t, r[1]) ? r[0] : ((n.memoizedState = [e, t]), e);
}
function vm(e, t) {
  var n = wt();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && fc(t, r[1])
    ? r[0]
    : ((e = e()), (n.memoizedState = [e, t]), e);
}
function ym(e, t, n) {
  return dr & 21
    ? (Pt(n, t) || ((n = bp()), (ye.lanes |= n), (hr |= n), (e.baseState = !0)), t)
    : (e.baseState && ((e.baseState = !1), (Je = !0)), (e.memoizedState = n));
}
function Ny(e, t) {
  var n = ie;
  ((ie = n !== 0 && 4 > n ? n : 4), e(!0));
  var r = zo.transition;
  zo.transition = {};
  try {
    (e(!1), t());
  } finally {
    ((ie = n), (zo.transition = r));
  }
}
function xm() {
  return wt().memoizedState;
}
function Ry(e, t, n) {
  var r = Bn(e);
  if (((n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }), km(e)))
    Sm(t, n);
  else if (((n = tm(e, t, n, r)), n !== null)) {
    var s = Xe();
    (Rt(n, e, r, s), wm(n, t, r));
  }
}
function Oy(e, t, n) {
  var r = Bn(e),
    s = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (km(e)) Sm(t, s);
  else {
    var i = e.alternate;
    if (e.lanes === 0 && (i === null || i.lanes === 0) && ((i = t.lastRenderedReducer), i !== null))
      try {
        var a = t.lastRenderedState,
          o = i(a, n);
        if (((s.hasEagerState = !0), (s.eagerState = o), Pt(o, a))) {
          var l = t.interleaved;
          (l === null ? ((s.next = s), ac(t)) : ((s.next = l.next), (l.next = s)),
            (t.interleaved = s));
          return;
        }
      } catch {
      } finally {
      }
    ((n = tm(e, t, s, r)), n !== null && ((s = Xe()), Rt(n, e, r, s), wm(n, t, r)));
  }
}
function km(e) {
  var t = e.alternate;
  return e === ye || (t !== null && t === ye);
}
function Sm(e, t) {
  Rs = Ia = !0;
  var n = e.pending;
  (n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)), (e.pending = t));
}
function wm(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    ((r &= e.pendingLanes), (n |= r), (t.lanes = n), Vu(e, n));
  }
}
var Pa = {
    readContext: St,
    useCallback: $e,
    useContext: $e,
    useEffect: $e,
    useImperativeHandle: $e,
    useInsertionEffect: $e,
    useLayoutEffect: $e,
    useMemo: $e,
    useReducer: $e,
    useRef: $e,
    useState: $e,
    useDebugValue: $e,
    useDeferredValue: $e,
    useTransition: $e,
    useMutableSource: $e,
    useSyncExternalStore: $e,
    useId: $e,
    unstable_isNewReconciler: !1,
  },
  Iy = {
    readContext: St,
    useCallback: function (e, t) {
      return ((Gt().memoizedState = [e, t === void 0 ? null : t]), e);
    },
    useContext: St,
    useEffect: zf,
    useImperativeHandle: function (e, t, n) {
      return ((n = n != null ? n.concat([e]) : null), sa(4194308, 4, pm.bind(null, t, e), n));
    },
    useLayoutEffect: function (e, t) {
      return sa(4194308, 4, e, t);
    },
    useInsertionEffect: function (e, t) {
      return sa(4, 2, e, t);
    },
    useMemo: function (e, t) {
      var n = Gt();
      return ((t = t === void 0 ? null : t), (e = e()), (n.memoizedState = [e, t]), e);
    },
    useReducer: function (e, t, n) {
      var r = Gt();
      return (
        (t = n !== void 0 ? n(t) : t),
        (r.memoizedState = r.baseState = t),
        (e = {
          pending: null,
          interleaved: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: e,
          lastRenderedState: t,
        }),
        (r.queue = e),
        (e = e.dispatch = Ry.bind(null, ye, e)),
        [r.memoizedState, e]
      );
    },
    useRef: function (e) {
      var t = Gt();
      return ((e = { current: e }), (t.memoizedState = e));
    },
    useState: _f,
    useDebugValue: mc,
    useDeferredValue: function (e) {
      return (Gt().memoizedState = e);
    },
    useTransition: function () {
      var e = _f(!1),
        t = e[0];
      return ((e = Ny.bind(null, e[1])), (Gt().memoizedState = e), [t, e]);
    },
    useMutableSource: function () {},
    useSyncExternalStore: function (e, t, n) {
      var r = ye,
        s = Gt();
      if (me) {
        if (n === void 0) throw Error(N(407));
        n = n();
      } else {
        if (((n = t()), Pe === null)) throw Error(N(349));
        dr & 30 || am(r, t, n);
      }
      s.memoizedState = n;
      var i = { value: n, getSnapshot: t };
      return (
        (s.queue = i),
        zf(lm.bind(null, r, i, e), [e]),
        (r.flags |= 2048),
        Ys(9, om.bind(null, r, i, n, t), void 0, null),
        n
      );
    },
    useId: function () {
      var e = Gt(),
        t = Pe.identifierPrefix;
      if (me) {
        var n = tn,
          r = en;
        ((n = (r & ~(1 << (32 - Nt(r) - 1))).toString(32) + n),
          (t = ":" + t + "R" + n),
          (n = Xs++),
          0 < n && (t += "H" + n.toString(32)),
          (t += ":"));
      } else ((n = My++), (t = ":" + t + "r" + n.toString(32) + ":"));
      return (e.memoizedState = t);
    },
    unstable_isNewReconciler: !1,
  },
  Py = {
    readContext: St,
    useCallback: gm,
    useContext: St,
    useEffect: pc,
    useImperativeHandle: mm,
    useInsertionEffect: dm,
    useLayoutEffect: hm,
    useMemo: vm,
    useReducer: jo,
    useRef: fm,
    useState: function () {
      return jo(Zs);
    },
    useDebugValue: mc,
    useDeferredValue: function (e) {
      var t = wt();
      return ym(t, Me.memoizedState, e);
    },
    useTransition: function () {
      var e = jo(Zs)[0],
        t = wt().memoizedState;
      return [e, t];
    },
    useMutableSource: sm,
    useSyncExternalStore: im,
    useId: xm,
    unstable_isNewReconciler: !1,
  },
  Dy = {
    readContext: St,
    useCallback: gm,
    useContext: St,
    useEffect: pc,
    useImperativeHandle: mm,
    useInsertionEffect: dm,
    useLayoutEffect: hm,
    useMemo: vm,
    useReducer: Go,
    useRef: fm,
    useState: function () {
      return Go(Zs);
    },
    useDebugValue: mc,
    useDeferredValue: function (e) {
      var t = wt();
      return Me === null ? (t.memoizedState = e) : ym(t, Me.memoizedState, e);
    },
    useTransition: function () {
      var e = Go(Zs)[0],
        t = wt().memoizedState;
      return [e, t];
    },
    useMutableSource: sm,
    useSyncExternalStore: im,
    useId: xm,
    unstable_isNewReconciler: !1,
  };
function Tt(e, t) {
  if (e && e.defaultProps) {
    ((t = xe({}, t)), (e = e.defaultProps));
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function Wl(e, t, n, r) {
  ((t = e.memoizedState),
    (n = n(r, t)),
    (n = n == null ? t : xe({}, t, n)),
    (e.memoizedState = n),
    e.lanes === 0 && (e.updateQueue.baseState = n));
}
var oo = {
  isMounted: function (e) {
    return (e = e._reactInternals) ? yr(e) === e : !1;
  },
  enqueueSetState: function (e, t, n) {
    e = e._reactInternals;
    var r = Xe(),
      s = Bn(e),
      i = sn(r, s);
    ((i.payload = t),
      n != null && (i.callback = n),
      (t = Un(e, i, s)),
      t !== null && (Rt(t, e, s, r), na(t, e, s)));
  },
  enqueueReplaceState: function (e, t, n) {
    e = e._reactInternals;
    var r = Xe(),
      s = Bn(e),
      i = sn(r, s);
    ((i.tag = 1),
      (i.payload = t),
      n != null && (i.callback = n),
      (t = Un(e, i, s)),
      t !== null && (Rt(t, e, s, r), na(t, e, s)));
  },
  enqueueForceUpdate: function (e, t) {
    e = e._reactInternals;
    var n = Xe(),
      r = Bn(e),
      s = sn(n, r);
    ((s.tag = 2),
      t != null && (s.callback = t),
      (t = Un(e, s, r)),
      t !== null && (Rt(t, e, r, n), na(t, e, r)));
  },
};
function jf(e, t, n, r, s, i, a) {
  return (
    (e = e.stateNode),
    typeof e.shouldComponentUpdate == "function"
      ? e.shouldComponentUpdate(r, i, a)
      : t.prototype && t.prototype.isPureReactComponent
        ? !Gs(n, r) || !Gs(s, i)
        : !0
  );
}
function bm(e, t, n) {
  var r = !1,
    s = Hn,
    i = t.contextType;
  return (
    typeof i == "object" && i !== null
      ? (i = St(i))
      : ((s = tt(t) ? cr : Ge.current),
        (r = t.contextTypes),
        (i = (r = r != null) ? qr(e, s) : Hn)),
    (t = new t(n, i)),
    (e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null),
    (t.updater = oo),
    (e.stateNode = t),
    (t._reactInternals = e),
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = s),
      (e.__reactInternalMemoizedMaskedChildContext = i)),
    t
  );
}
function Gf(e, t, n, r) {
  ((e = t.state),
    typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r),
    typeof t.UNSAFE_componentWillReceiveProps == "function" &&
      t.UNSAFE_componentWillReceiveProps(n, r),
    t.state !== e && oo.enqueueReplaceState(t, t.state, null));
}
function Vl(e, t, n, r) {
  var s = e.stateNode;
  ((s.props = n), (s.state = e.memoizedState), (s.refs = {}), oc(e));
  var i = t.contextType;
  (typeof i == "object" && i !== null
    ? (s.context = St(i))
    : ((i = tt(t) ? cr : Ge.current), (s.context = qr(e, i))),
    (s.state = e.memoizedState),
    (i = t.getDerivedStateFromProps),
    typeof i == "function" && (Wl(e, t, i, n), (s.state = e.memoizedState)),
    typeof t.getDerivedStateFromProps == "function" ||
      typeof s.getSnapshotBeforeUpdate == "function" ||
      (typeof s.UNSAFE_componentWillMount != "function" &&
        typeof s.componentWillMount != "function") ||
      ((t = s.state),
      typeof s.componentWillMount == "function" && s.componentWillMount(),
      typeof s.UNSAFE_componentWillMount == "function" && s.UNSAFE_componentWillMount(),
      t !== s.state && oo.enqueueReplaceState(s, s.state, null),
      Ra(e, n, s, r),
      (s.state = e.memoizedState)),
    typeof s.componentDidMount == "function" && (e.flags |= 4194308));
}
function Qr(e, t) {
  try {
    var n = "",
      r = t;
    do ((n += uv(r)), (r = r.return));
    while (r);
    var s = n;
  } catch (i) {
    s =
      `
Error generating stack: ` +
      i.message +
      `
` +
      i.stack;
  }
  return { value: e, source: t, stack: s, digest: null };
}
function Ho(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function Kl(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function () {
      throw n;
    });
  }
}
var Uy = typeof WeakMap == "function" ? WeakMap : Map;
function Em(e, t, n) {
  ((n = sn(-1, n)), (n.tag = 3), (n.payload = { element: null }));
  var r = t.value;
  return (
    (n.callback = function () {
      (Ua || ((Ua = !0), (ru = r)), Kl(e, t));
    }),
    n
  );
}
function Tm(e, t, n) {
  ((n = sn(-1, n)), (n.tag = 3));
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var s = t.value;
    ((n.payload = function () {
      return r(s);
    }),
      (n.callback = function () {
        Kl(e, t);
      }));
  }
  var i = e.stateNode;
  return (
    i !== null &&
      typeof i.componentDidCatch == "function" &&
      (n.callback = function () {
        (Kl(e, t), typeof r != "function" && (An === null ? (An = new Set([this])) : An.add(this)));
        var a = t.stack;
        this.componentDidCatch(t.value, { componentStack: a !== null ? a : "" });
      }),
    n
  );
}
function Hf(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new Uy();
    var s = new Set();
    r.set(t, s);
  } else ((s = r.get(t)), s === void 0 && ((s = new Set()), r.set(t, s)));
  s.has(n) || (s.add(n), (e = Zy.bind(null, e, t, n)), t.then(e, e));
}
function Wf(e) {
  do {
    var t;
    if (
      ((t = e.tag === 13) && ((t = e.memoizedState), (t = t !== null ? t.dehydrated !== null : !0)),
      t)
    )
      return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function Vf(e, t, n, r, s) {
  return e.mode & 1
    ? ((e.flags |= 65536), (e.lanes = s), e)
    : (e === t
        ? (e.flags |= 65536)
        : ((e.flags |= 128),
          (n.flags |= 131072),
          (n.flags &= -52805),
          n.tag === 1 &&
            (n.alternate === null ? (n.tag = 17) : ((t = sn(-1, 1)), (t.tag = 2), Un(n, t, 1))),
          (n.lanes |= 1)),
      e);
}
var Ay = dn.ReactCurrentOwner,
  Je = !1;
function Ke(e, t, n, r) {
  t.child = e === null ? em(t, null, n, r) : Zr(t, e.child, n, r);
}
function Kf(e, t, n, r, s) {
  n = n.render;
  var i = t.ref;
  return (
    jr(t, s),
    (r = dc(e, t, n, r, i, s)),
    (n = hc()),
    e !== null && !Je
      ? ((t.updateQueue = e.updateQueue), (t.flags &= -2053), (e.lanes &= ~s), fn(e, t, s))
      : (me && n && ec(t), (t.flags |= 1), Ke(e, t, r, s), t.child)
  );
}
function qf(e, t, n, r, s) {
  if (e === null) {
    var i = n.type;
    return typeof i == "function" &&
      !bc(i) &&
      i.defaultProps === void 0 &&
      n.compare === null &&
      n.defaultProps === void 0
      ? ((t.tag = 15), (t.type = i), Cm(e, t, i, r, s))
      : ((e = la(n.type, null, r, t, t.mode, s)), (e.ref = t.ref), (e.return = t), (t.child = e));
  }
  if (((i = e.child), !(e.lanes & s))) {
    var a = i.memoizedProps;
    if (((n = n.compare), (n = n !== null ? n : Gs), n(a, r) && e.ref === t.ref))
      return fn(e, t, s);
  }
  return ((t.flags |= 1), (e = $n(i, r)), (e.ref = t.ref), (e.return = t), (t.child = e));
}
function Cm(e, t, n, r, s) {
  if (e !== null) {
    var i = e.memoizedProps;
    if (Gs(i, r) && e.ref === t.ref)
      if (((Je = !1), (t.pendingProps = r = i), (e.lanes & s) !== 0)) e.flags & 131072 && (Je = !0);
      else return ((t.lanes = e.lanes), fn(e, t, s));
  }
  return ql(e, t, n, r, s);
}
function Lm(e, t, n) {
  var r = t.pendingProps,
    s = r.children,
    i = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden")
    if (!(t.mode & 1))
      ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        de(Ur, st),
        (st |= n));
    else {
      if (!(n & 1073741824))
        return (
          (e = i !== null ? i.baseLanes | n : n),
          (t.lanes = t.childLanes = 1073741824),
          (t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }),
          (t.updateQueue = null),
          de(Ur, st),
          (st |= e),
          null
        );
      ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        (r = i !== null ? i.baseLanes : n),
        de(Ur, st),
        (st |= r));
    }
  else
    (i !== null ? ((r = i.baseLanes | n), (t.memoizedState = null)) : (r = n),
      de(Ur, st),
      (st |= r));
  return (Ke(e, t, s, n), t.child);
}
function Fm(e, t) {
  var n = t.ref;
  ((e === null && n !== null) || (e !== null && e.ref !== n)) &&
    ((t.flags |= 512), (t.flags |= 2097152));
}
function ql(e, t, n, r, s) {
  var i = tt(n) ? cr : Ge.current;
  return (
    (i = qr(t, i)),
    jr(t, s),
    (n = dc(e, t, n, r, i, s)),
    (r = hc()),
    e !== null && !Je
      ? ((t.updateQueue = e.updateQueue), (t.flags &= -2053), (e.lanes &= ~s), fn(e, t, s))
      : (me && r && ec(t), (t.flags |= 1), Ke(e, t, n, s), t.child)
  );
}
function Xf(e, t, n, r, s) {
  if (tt(n)) {
    var i = !0;
    Ca(t);
  } else i = !1;
  if ((jr(t, s), t.stateNode === null)) (ia(e, t), bm(t, n, r), Vl(t, n, r, s), (r = !0));
  else if (e === null) {
    var a = t.stateNode,
      o = t.memoizedProps;
    a.props = o;
    var l = a.context,
      u = n.contextType;
    typeof u == "object" && u !== null
      ? (u = St(u))
      : ((u = tt(n) ? cr : Ge.current), (u = qr(t, u)));
    var c = n.getDerivedStateFromProps,
      f = typeof c == "function" || typeof a.getSnapshotBeforeUpdate == "function";
    (f ||
      (typeof a.UNSAFE_componentWillReceiveProps != "function" &&
        typeof a.componentWillReceiveProps != "function") ||
      ((o !== r || l !== u) && Gf(t, a, r, u)),
      (Sn = !1));
    var d = t.memoizedState;
    ((a.state = d),
      Ra(t, r, a, s),
      (l = t.memoizedState),
      o !== r || d !== l || et.current || Sn
        ? (typeof c == "function" && (Wl(t, n, c, r), (l = t.memoizedState)),
          (o = Sn || jf(t, n, o, r, d, l, u))
            ? (f ||
                (typeof a.UNSAFE_componentWillMount != "function" &&
                  typeof a.componentWillMount != "function") ||
                (typeof a.componentWillMount == "function" && a.componentWillMount(),
                typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()),
              typeof a.componentDidMount == "function" && (t.flags |= 4194308))
            : (typeof a.componentDidMount == "function" && (t.flags |= 4194308),
              (t.memoizedProps = r),
              (t.memoizedState = l)),
          (a.props = r),
          (a.state = l),
          (a.context = u),
          (r = o))
        : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), (r = !1)));
  } else {
    ((a = t.stateNode),
      nm(e, t),
      (o = t.memoizedProps),
      (u = t.type === t.elementType ? o : Tt(t.type, o)),
      (a.props = u),
      (f = t.pendingProps),
      (d = a.context),
      (l = n.contextType),
      typeof l == "object" && l !== null
        ? (l = St(l))
        : ((l = tt(n) ? cr : Ge.current), (l = qr(t, l))));
    var h = n.getDerivedStateFromProps;
    ((c = typeof h == "function" || typeof a.getSnapshotBeforeUpdate == "function") ||
      (typeof a.UNSAFE_componentWillReceiveProps != "function" &&
        typeof a.componentWillReceiveProps != "function") ||
      ((o !== f || d !== l) && Gf(t, a, r, l)),
      (Sn = !1),
      (d = t.memoizedState),
      (a.state = d),
      Ra(t, r, a, s));
    var m = t.memoizedState;
    o !== f || d !== m || et.current || Sn
      ? (typeof h == "function" && (Wl(t, n, h, r), (m = t.memoizedState)),
        (u = Sn || jf(t, n, u, r, d, m, l) || !1)
          ? (c ||
              (typeof a.UNSAFE_componentWillUpdate != "function" &&
                typeof a.componentWillUpdate != "function") ||
              (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, m, l),
              typeof a.UNSAFE_componentWillUpdate == "function" &&
                a.UNSAFE_componentWillUpdate(r, m, l)),
            typeof a.componentDidUpdate == "function" && (t.flags |= 4),
            typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024))
          : (typeof a.componentDidUpdate != "function" ||
              (o === e.memoizedProps && d === e.memoizedState) ||
              (t.flags |= 4),
            typeof a.getSnapshotBeforeUpdate != "function" ||
              (o === e.memoizedProps && d === e.memoizedState) ||
              (t.flags |= 1024),
            (t.memoizedProps = r),
            (t.memoizedState = m)),
        (a.props = r),
        (a.state = m),
        (a.context = l),
        (r = u))
      : (typeof a.componentDidUpdate != "function" ||
          (o === e.memoizedProps && d === e.memoizedState) ||
          (t.flags |= 4),
        typeof a.getSnapshotBeforeUpdate != "function" ||
          (o === e.memoizedProps && d === e.memoizedState) ||
          (t.flags |= 1024),
        (r = !1));
  }
  return Xl(e, t, n, r, i, s);
}
function Xl(e, t, n, r, s, i) {
  Fm(e, t);
  var a = (t.flags & 128) !== 0;
  if (!r && !a) return (s && Pf(t, n, !1), fn(e, t, i));
  ((r = t.stateNode), (Ay.current = t));
  var o = a && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return (
    (t.flags |= 1),
    e !== null && a
      ? ((t.child = Zr(t, e.child, null, i)), (t.child = Zr(t, null, o, i)))
      : Ke(e, t, o, i),
    (t.memoizedState = r.state),
    s && Pf(t, n, !0),
    t.child
  );
}
function Mm(e) {
  var t = e.stateNode;
  (t.pendingContext
    ? If(e, t.pendingContext, t.pendingContext !== t.context)
    : t.context && If(e, t.context, !1),
    lc(e, t.containerInfo));
}
function Zf(e, t, n, r, s) {
  return (Xr(), nc(s), (t.flags |= 256), Ke(e, t, n, r), t.child);
}
var Zl = { dehydrated: null, treeContext: null, retryLane: 0 };
function Yl(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function Nm(e, t, n) {
  var r = t.pendingProps,
    s = ve.current,
    i = !1,
    a = (t.flags & 128) !== 0,
    o;
  if (
    ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : (s & 2) !== 0),
    o ? ((i = !0), (t.flags &= -129)) : (e === null || e.memoizedState !== null) && (s |= 1),
    de(ve, s & 1),
    e === null)
  )
    return (
      Gl(t),
      (e = t.memoizedState),
      e !== null && ((e = e.dehydrated), e !== null)
        ? (t.mode & 1 ? (e.data === "$!" ? (t.lanes = 8) : (t.lanes = 1073741824)) : (t.lanes = 1),
          null)
        : ((a = r.children),
          (e = r.fallback),
          i
            ? ((r = t.mode),
              (i = t.child),
              (a = { mode: "hidden", children: a }),
              !(r & 1) && i !== null
                ? ((i.childLanes = 0), (i.pendingProps = a))
                : (i = co(a, r, 0, null)),
              (e = or(e, r, n, null)),
              (i.return = t),
              (e.return = t),
              (i.sibling = e),
              (t.child = i),
              (t.child.memoizedState = Yl(n)),
              (t.memoizedState = Zl),
              e)
            : gc(t, a))
    );
  if (((s = e.memoizedState), s !== null && ((o = s.dehydrated), o !== null)))
    return By(e, t, a, r, o, s, n);
  if (i) {
    ((i = r.fallback), (a = t.mode), (s = e.child), (o = s.sibling));
    var l = { mode: "hidden", children: r.children };
    return (
      !(a & 1) && t.child !== s
        ? ((r = t.child), (r.childLanes = 0), (r.pendingProps = l), (t.deletions = null))
        : ((r = $n(s, l)), (r.subtreeFlags = s.subtreeFlags & 14680064)),
      o !== null ? (i = $n(o, i)) : ((i = or(i, a, n, null)), (i.flags |= 2)),
      (i.return = t),
      (r.return = t),
      (r.sibling = i),
      (t.child = r),
      (r = i),
      (i = t.child),
      (a = e.child.memoizedState),
      (a =
        a === null
          ? Yl(n)
          : { baseLanes: a.baseLanes | n, cachePool: null, transitions: a.transitions }),
      (i.memoizedState = a),
      (i.childLanes = e.childLanes & ~n),
      (t.memoizedState = Zl),
      r
    );
  }
  return (
    (i = e.child),
    (e = i.sibling),
    (r = $n(i, { mode: "visible", children: r.children })),
    !(t.mode & 1) && (r.lanes = n),
    (r.return = t),
    (r.sibling = null),
    e !== null &&
      ((n = t.deletions), n === null ? ((t.deletions = [e]), (t.flags |= 16)) : n.push(e)),
    (t.child = r),
    (t.memoizedState = null),
    r
  );
}
function gc(e, t) {
  return (
    (t = co({ mode: "visible", children: t }, e.mode, 0, null)),
    (t.return = e),
    (e.child = t)
  );
}
function Ii(e, t, n, r) {
  return (
    r !== null && nc(r),
    Zr(t, e.child, null, n),
    (e = gc(t, t.pendingProps.children)),
    (e.flags |= 2),
    (t.memoizedState = null),
    e
  );
}
function By(e, t, n, r, s, i, a) {
  if (n)
    return t.flags & 256
      ? ((t.flags &= -257), (r = Ho(Error(N(422)))), Ii(e, t, a, r))
      : t.memoizedState !== null
        ? ((t.child = e.child), (t.flags |= 128), null)
        : ((i = r.fallback),
          (s = t.mode),
          (r = co({ mode: "visible", children: r.children }, s, 0, null)),
          (i = or(i, s, a, null)),
          (i.flags |= 2),
          (r.return = t),
          (i.return = t),
          (r.sibling = i),
          (t.child = r),
          t.mode & 1 && Zr(t, e.child, null, a),
          (t.child.memoizedState = Yl(a)),
          (t.memoizedState = Zl),
          i);
  if (!(t.mode & 1)) return Ii(e, t, a, null);
  if (s.data === "$!") {
    if (((r = s.nextSibling && s.nextSibling.dataset), r)) var o = r.dgst;
    return ((r = o), (i = Error(N(419))), (r = Ho(i, r, void 0)), Ii(e, t, a, r));
  }
  if (((o = (a & e.childLanes) !== 0), Je || o)) {
    if (((r = Pe), r !== null)) {
      switch (a & -a) {
        case 4:
          s = 2;
          break;
        case 16:
          s = 8;
          break;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          s = 32;
          break;
        case 536870912:
          s = 268435456;
          break;
        default:
          s = 0;
      }
      ((s = s & (r.suspendedLanes | a) ? 0 : s),
        s !== 0 && s !== i.retryLane && ((i.retryLane = s), cn(e, s), Rt(r, e, s, -1)));
    }
    return (wc(), (r = Ho(Error(N(421)))), Ii(e, t, a, r));
  }
  return s.data === "$?"
    ? ((t.flags |= 128), (t.child = e.child), (t = Yy.bind(null, e)), (s._reactRetry = t), null)
    : ((e = i.treeContext),
      (it = Dn(s.nextSibling)),
      (ot = t),
      (me = !0),
      (Lt = null),
      e !== null &&
        ((gt[vt++] = en),
        (gt[vt++] = tn),
        (gt[vt++] = fr),
        (en = e.id),
        (tn = e.overflow),
        (fr = t)),
      (t = gc(t, r.children)),
      (t.flags |= 4096),
      t);
}
function Yf(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  (r !== null && (r.lanes |= t), Hl(e.return, t, n));
}
function Wo(e, t, n, r, s) {
  var i = e.memoizedState;
  i === null
    ? (e.memoizedState = {
        isBackwards: t,
        rendering: null,
        renderingStartTime: 0,
        last: r,
        tail: n,
        tailMode: s,
      })
    : ((i.isBackwards = t),
      (i.rendering = null),
      (i.renderingStartTime = 0),
      (i.last = r),
      (i.tail = n),
      (i.tailMode = s));
}
function Rm(e, t, n) {
  var r = t.pendingProps,
    s = r.revealOrder,
    i = r.tail;
  if ((Ke(e, t, r.children, n), (r = ve.current), r & 2)) ((r = (r & 1) | 2), (t.flags |= 128));
  else {
    if (e !== null && e.flags & 128)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && Yf(e, n, t);
        else if (e.tag === 19) Yf(e, n, t);
        else if (e.child !== null) {
          ((e.child.return = e), (e = e.child));
          continue;
        }
        if (e === t) break e;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === t) break e;
          e = e.return;
        }
        ((e.sibling.return = e.return), (e = e.sibling));
      }
    r &= 1;
  }
  if ((de(ve, r), !(t.mode & 1))) t.memoizedState = null;
  else
    switch (s) {
      case "forwards":
        for (n = t.child, s = null; n !== null; )
          ((e = n.alternate), e !== null && Oa(e) === null && (s = n), (n = n.sibling));
        ((n = s),
          n === null ? ((s = t.child), (t.child = null)) : ((s = n.sibling), (n.sibling = null)),
          Wo(t, !1, s, n, i));
        break;
      case "backwards":
        for (n = null, s = t.child, t.child = null; s !== null; ) {
          if (((e = s.alternate), e !== null && Oa(e) === null)) {
            t.child = s;
            break;
          }
          ((e = s.sibling), (s.sibling = n), (n = s), (s = e));
        }
        Wo(t, !0, n, null, i);
        break;
      case "together":
        Wo(t, !1, null, null, void 0);
        break;
      default:
        t.memoizedState = null;
    }
  return t.child;
}
function ia(e, t) {
  !(t.mode & 1) && e !== null && ((e.alternate = null), (t.alternate = null), (t.flags |= 2));
}
function fn(e, t, n) {
  if ((e !== null && (t.dependencies = e.dependencies), (hr |= t.lanes), !(n & t.childLanes)))
    return null;
  if (e !== null && t.child !== e.child) throw Error(N(153));
  if (t.child !== null) {
    for (e = t.child, n = $n(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; )
      ((e = e.sibling), (n = n.sibling = $n(e, e.pendingProps)), (n.return = t));
    n.sibling = null;
  }
  return t.child;
}
function $y(e, t, n) {
  switch (t.tag) {
    case 3:
      (Mm(t), Xr());
      break;
    case 5:
      rm(t);
      break;
    case 1:
      tt(t.type) && Ca(t);
      break;
    case 4:
      lc(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context,
        s = t.memoizedProps.value;
      (de(Ma, r._currentValue), (r._currentValue = s));
      break;
    case 13:
      if (((r = t.memoizedState), r !== null))
        return r.dehydrated !== null
          ? (de(ve, ve.current & 1), (t.flags |= 128), null)
          : n & t.child.childLanes
            ? Nm(e, t, n)
            : (de(ve, ve.current & 1), (e = fn(e, t, n)), e !== null ? e.sibling : null);
      de(ve, ve.current & 1);
      break;
    case 19:
      if (((r = (n & t.childLanes) !== 0), e.flags & 128)) {
        if (r) return Rm(e, t, n);
        t.flags |= 128;
      }
      if (
        ((s = t.memoizedState),
        s !== null && ((s.rendering = null), (s.tail = null), (s.lastEffect = null)),
        de(ve, ve.current),
        r)
      )
        break;
      return null;
    case 22:
    case 23:
      return ((t.lanes = 0), Lm(e, t, n));
  }
  return fn(e, t, n);
}
var Om, Ql, Im, Pm;
Om = function (e, t) {
  for (var n = t.child; n !== null; ) {
    if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
    else if (n.tag !== 4 && n.child !== null) {
      ((n.child.return = n), (n = n.child));
      continue;
    }
    if (n === t) break;
    for (; n.sibling === null; ) {
      if (n.return === null || n.return === t) return;
      n = n.return;
    }
    ((n.sibling.return = n.return), (n = n.sibling));
  }
};
Ql = function () {};
Im = function (e, t, n, r) {
  var s = e.memoizedProps;
  if (s !== r) {
    ((e = t.stateNode), ir(qt.current));
    var i = null;
    switch (n) {
      case "input":
        ((s = kl(e, s)), (r = kl(e, r)), (i = []));
        break;
      case "select":
        ((s = xe({}, s, { value: void 0 })), (r = xe({}, r, { value: void 0 })), (i = []));
        break;
      case "textarea":
        ((s = bl(e, s)), (r = bl(e, r)), (i = []));
        break;
      default:
        typeof s.onClick != "function" && typeof r.onClick == "function" && (e.onclick = Ea);
    }
    Tl(n, r);
    var a;
    n = null;
    for (u in s)
      if (!r.hasOwnProperty(u) && s.hasOwnProperty(u) && s[u] != null)
        if (u === "style") {
          var o = s[u];
          for (a in o) o.hasOwnProperty(a) && (n || (n = {}), (n[a] = ""));
        } else
          u !== "dangerouslySetInnerHTML" &&
            u !== "children" &&
            u !== "suppressContentEditableWarning" &&
            u !== "suppressHydrationWarning" &&
            u !== "autoFocus" &&
            (Us.hasOwnProperty(u) ? i || (i = []) : (i = i || []).push(u, null));
    for (u in r) {
      var l = r[u];
      if (
        ((o = s != null ? s[u] : void 0),
        r.hasOwnProperty(u) && l !== o && (l != null || o != null))
      )
        if (u === "style")
          if (o) {
            for (a in o)
              !o.hasOwnProperty(a) || (l && l.hasOwnProperty(a)) || (n || (n = {}), (n[a] = ""));
            for (a in l) l.hasOwnProperty(a) && o[a] !== l[a] && (n || (n = {}), (n[a] = l[a]));
          } else (n || (i || (i = []), i.push(u, n)), (n = l));
        else
          u === "dangerouslySetInnerHTML"
            ? ((l = l ? l.__html : void 0),
              (o = o ? o.__html : void 0),
              l != null && o !== l && (i = i || []).push(u, l))
            : u === "children"
              ? (typeof l != "string" && typeof l != "number") || (i = i || []).push(u, "" + l)
              : u !== "suppressContentEditableWarning" &&
                u !== "suppressHydrationWarning" &&
                (Us.hasOwnProperty(u)
                  ? (l != null && u === "onScroll" && he("scroll", e), i || o === l || (i = []))
                  : (i = i || []).push(u, l));
    }
    n && (i = i || []).push("style", n);
    var u = i;
    (t.updateQueue = u) && (t.flags |= 4);
  }
};
Pm = function (e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function hs(e, t) {
  if (!me)
    switch (e.tailMode) {
      case "hidden":
        t = e.tail;
        for (var n = null; t !== null; ) (t.alternate !== null && (n = t), (t = t.sibling));
        n === null ? (e.tail = null) : (n.sibling = null);
        break;
      case "collapsed":
        n = e.tail;
        for (var r = null; n !== null; ) (n.alternate !== null && (r = n), (n = n.sibling));
        r === null
          ? t || e.tail === null
            ? (e.tail = null)
            : (e.tail.sibling = null)
          : (r.sibling = null);
    }
}
function _e(e) {
  var t = e.alternate !== null && e.alternate.child === e.child,
    n = 0,
    r = 0;
  if (t)
    for (var s = e.child; s !== null; )
      ((n |= s.lanes | s.childLanes),
        (r |= s.subtreeFlags & 14680064),
        (r |= s.flags & 14680064),
        (s.return = e),
        (s = s.sibling));
  else
    for (s = e.child; s !== null; )
      ((n |= s.lanes | s.childLanes),
        (r |= s.subtreeFlags),
        (r |= s.flags),
        (s.return = e),
        (s = s.sibling));
  return ((e.subtreeFlags |= r), (e.childLanes = n), t);
}
function _y(e, t, n) {
  var r = t.pendingProps;
  switch ((tc(t), t.tag)) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return (_e(t), null);
    case 1:
      return (tt(t.type) && Ta(), _e(t), null);
    case 3:
      return (
        (r = t.stateNode),
        Yr(),
        pe(et),
        pe(Ge),
        cc(),
        r.pendingContext && ((r.context = r.pendingContext), (r.pendingContext = null)),
        (e === null || e.child === null) &&
          (Ri(t)
            ? (t.flags |= 4)
            : e === null ||
              (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
              ((t.flags |= 1024), Lt !== null && (au(Lt), (Lt = null)))),
        Ql(e, t),
        _e(t),
        null
      );
    case 5:
      uc(t);
      var s = ir(qs.current);
      if (((n = t.type), e !== null && t.stateNode != null))
        (Im(e, t, n, r, s), e.ref !== t.ref && ((t.flags |= 512), (t.flags |= 2097152)));
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(N(166));
          return (_e(t), null);
        }
        if (((e = ir(qt.current)), Ri(t))) {
          ((r = t.stateNode), (n = t.type));
          var i = t.memoizedProps;
          switch (((r[Wt] = t), (r[Vs] = i), (e = (t.mode & 1) !== 0), n)) {
            case "dialog":
              (he("cancel", r), he("close", r));
              break;
            case "iframe":
            case "object":
            case "embed":
              he("load", r);
              break;
            case "video":
            case "audio":
              for (s = 0; s < Ts.length; s++) he(Ts[s], r);
              break;
            case "source":
              he("error", r);
              break;
            case "img":
            case "image":
            case "link":
              (he("error", r), he("load", r));
              break;
            case "details":
              he("toggle", r);
              break;
            case "input":
              (af(r, i), he("invalid", r));
              break;
            case "select":
              ((r._wrapperState = { wasMultiple: !!i.multiple }), he("invalid", r));
              break;
            case "textarea":
              (lf(r, i), he("invalid", r));
          }
          (Tl(n, i), (s = null));
          for (var a in i)
            if (i.hasOwnProperty(a)) {
              var o = i[a];
              a === "children"
                ? typeof o == "string"
                  ? r.textContent !== o &&
                    (i.suppressHydrationWarning !== !0 && Ni(r.textContent, o, e),
                    (s = ["children", o]))
                  : typeof o == "number" &&
                    r.textContent !== "" + o &&
                    (i.suppressHydrationWarning !== !0 && Ni(r.textContent, o, e),
                    (s = ["children", "" + o]))
                : Us.hasOwnProperty(a) && o != null && a === "onScroll" && he("scroll", r);
            }
          switch (n) {
            case "input":
              (wi(r), of(r, i, !0));
              break;
            case "textarea":
              (wi(r), uf(r));
              break;
            case "select":
            case "option":
              break;
            default:
              typeof i.onClick == "function" && (r.onclick = Ea);
          }
          ((r = s), (t.updateQueue = r), r !== null && (t.flags |= 4));
        } else {
          ((a = s.nodeType === 9 ? s : s.ownerDocument),
            e === "http://www.w3.org/1999/xhtml" && (e = lp(n)),
            e === "http://www.w3.org/1999/xhtml"
              ? n === "script"
                ? ((e = a.createElement("div")),
                  (e.innerHTML = "<script><\/script>"),
                  (e = e.removeChild(e.firstChild)))
                : typeof r.is == "string"
                  ? (e = a.createElement(n, { is: r.is }))
                  : ((e = a.createElement(n)),
                    n === "select" &&
                      ((a = e), r.multiple ? (a.multiple = !0) : r.size && (a.size = r.size)))
              : (e = a.createElementNS(e, n)),
            (e[Wt] = t),
            (e[Vs] = r),
            Om(e, t, !1, !1),
            (t.stateNode = e));
          e: {
            switch (((a = Cl(n, r)), n)) {
              case "dialog":
                (he("cancel", e), he("close", e), (s = r));
                break;
              case "iframe":
              case "object":
              case "embed":
                (he("load", e), (s = r));
                break;
              case "video":
              case "audio":
                for (s = 0; s < Ts.length; s++) he(Ts[s], e);
                s = r;
                break;
              case "source":
                (he("error", e), (s = r));
                break;
              case "img":
              case "image":
              case "link":
                (he("error", e), he("load", e), (s = r));
                break;
              case "details":
                (he("toggle", e), (s = r));
                break;
              case "input":
                (af(e, r), (s = kl(e, r)), he("invalid", e));
                break;
              case "option":
                s = r;
                break;
              case "select":
                ((e._wrapperState = { wasMultiple: !!r.multiple }),
                  (s = xe({}, r, { value: void 0 })),
                  he("invalid", e));
                break;
              case "textarea":
                (lf(e, r), (s = bl(e, r)), he("invalid", e));
                break;
              default:
                s = r;
            }
            (Tl(n, s), (o = s));
            for (i in o)
              if (o.hasOwnProperty(i)) {
                var l = o[i];
                i === "style"
                  ? fp(e, l)
                  : i === "dangerouslySetInnerHTML"
                    ? ((l = l ? l.__html : void 0), l != null && up(e, l))
                    : i === "children"
                      ? typeof l == "string"
                        ? (n !== "textarea" || l !== "") && As(e, l)
                        : typeof l == "number" && As(e, "" + l)
                      : i !== "suppressContentEditableWarning" &&
                        i !== "suppressHydrationWarning" &&
                        i !== "autoFocus" &&
                        (Us.hasOwnProperty(i)
                          ? l != null && i === "onScroll" && he("scroll", e)
                          : l != null && _u(e, i, l, a));
              }
            switch (n) {
              case "input":
                (wi(e), of(e, r, !1));
                break;
              case "textarea":
                (wi(e), uf(e));
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + Gn(r.value));
                break;
              case "select":
                ((e.multiple = !!r.multiple),
                  (i = r.value),
                  i != null
                    ? Br(e, !!r.multiple, i, !1)
                    : r.defaultValue != null && Br(e, !!r.multiple, r.defaultValue, !0));
                break;
              default:
                typeof s.onClick == "function" && (e.onclick = Ea);
            }
            switch (n) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                r = !!r.autoFocus;
                break e;
              case "img":
                r = !0;
                break e;
              default:
                r = !1;
            }
          }
          r && (t.flags |= 4);
        }
        t.ref !== null && ((t.flags |= 512), (t.flags |= 2097152));
      }
      return (_e(t), null);
    case 6:
      if (e && t.stateNode != null) Pm(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(N(166));
        if (((n = ir(qs.current)), ir(qt.current), Ri(t))) {
          if (
            ((r = t.stateNode),
            (n = t.memoizedProps),
            (r[Wt] = t),
            (i = r.nodeValue !== n) && ((e = ot), e !== null))
          )
            switch (e.tag) {
              case 3:
                Ni(r.nodeValue, n, (e.mode & 1) !== 0);
                break;
              case 5:
                e.memoizedProps.suppressHydrationWarning !== !0 &&
                  Ni(r.nodeValue, n, (e.mode & 1) !== 0);
            }
          i && (t.flags |= 4);
        } else
          ((r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r)),
            (r[Wt] = t),
            (t.stateNode = r));
      }
      return (_e(t), null);
    case 13:
      if (
        (pe(ve),
        (r = t.memoizedState),
        e === null || (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
      ) {
        if (me && it !== null && t.mode & 1 && !(t.flags & 128))
          (Qp(), Xr(), (t.flags |= 98560), (i = !1));
        else if (((i = Ri(t)), r !== null && r.dehydrated !== null)) {
          if (e === null) {
            if (!i) throw Error(N(318));
            if (((i = t.memoizedState), (i = i !== null ? i.dehydrated : null), !i))
              throw Error(N(317));
            i[Wt] = t;
          } else (Xr(), !(t.flags & 128) && (t.memoizedState = null), (t.flags |= 4));
          (_e(t), (i = !1));
        } else (Lt !== null && (au(Lt), (Lt = null)), (i = !0));
        if (!i) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128
        ? ((t.lanes = n), t)
        : ((r = r !== null),
          r !== (e !== null && e.memoizedState !== null) &&
            r &&
            ((t.child.flags |= 8192),
            t.mode & 1 && (e === null || ve.current & 1 ? Ne === 0 && (Ne = 3) : wc())),
          t.updateQueue !== null && (t.flags |= 4),
          _e(t),
          null);
    case 4:
      return (Yr(), Ql(e, t), e === null && Hs(t.stateNode.containerInfo), _e(t), null);
    case 10:
      return (ic(t.type._context), _e(t), null);
    case 17:
      return (tt(t.type) && Ta(), _e(t), null);
    case 19:
      if ((pe(ve), (i = t.memoizedState), i === null)) return (_e(t), null);
      if (((r = (t.flags & 128) !== 0), (a = i.rendering), a === null))
        if (r) hs(i, !1);
        else {
          if (Ne !== 0 || (e !== null && e.flags & 128))
            for (e = t.child; e !== null; ) {
              if (((a = Oa(e)), a !== null)) {
                for (
                  t.flags |= 128,
                    hs(i, !1),
                    r = a.updateQueue,
                    r !== null && ((t.updateQueue = r), (t.flags |= 4)),
                    t.subtreeFlags = 0,
                    r = n,
                    n = t.child;
                  n !== null;
                )
                  ((i = n),
                    (e = r),
                    (i.flags &= 14680066),
                    (a = i.alternate),
                    a === null
                      ? ((i.childLanes = 0),
                        (i.lanes = e),
                        (i.child = null),
                        (i.subtreeFlags = 0),
                        (i.memoizedProps = null),
                        (i.memoizedState = null),
                        (i.updateQueue = null),
                        (i.dependencies = null),
                        (i.stateNode = null))
                      : ((i.childLanes = a.childLanes),
                        (i.lanes = a.lanes),
                        (i.child = a.child),
                        (i.subtreeFlags = 0),
                        (i.deletions = null),
                        (i.memoizedProps = a.memoizedProps),
                        (i.memoizedState = a.memoizedState),
                        (i.updateQueue = a.updateQueue),
                        (i.type = a.type),
                        (e = a.dependencies),
                        (i.dependencies =
                          e === null ? null : { lanes: e.lanes, firstContext: e.firstContext })),
                    (n = n.sibling));
                return (de(ve, (ve.current & 1) | 2), t.child);
              }
              e = e.sibling;
            }
          i.tail !== null &&
            Te() > Jr &&
            ((t.flags |= 128), (r = !0), hs(i, !1), (t.lanes = 4194304));
        }
      else {
        if (!r)
          if (((e = Oa(a)), e !== null)) {
            if (
              ((t.flags |= 128),
              (r = !0),
              (n = e.updateQueue),
              n !== null && ((t.updateQueue = n), (t.flags |= 4)),
              hs(i, !0),
              i.tail === null && i.tailMode === "hidden" && !a.alternate && !me)
            )
              return (_e(t), null);
          } else
            2 * Te() - i.renderingStartTime > Jr &&
              n !== 1073741824 &&
              ((t.flags |= 128), (r = !0), hs(i, !1), (t.lanes = 4194304));
        i.isBackwards
          ? ((a.sibling = t.child), (t.child = a))
          : ((n = i.last), n !== null ? (n.sibling = a) : (t.child = a), (i.last = a));
      }
      return i.tail !== null
        ? ((t = i.tail),
          (i.rendering = t),
          (i.tail = t.sibling),
          (i.renderingStartTime = Te()),
          (t.sibling = null),
          (n = ve.current),
          de(ve, r ? (n & 1) | 2 : n & 1),
          t)
        : (_e(t), null);
    case 22:
    case 23:
      return (
        Sc(),
        (r = t.memoizedState !== null),
        e !== null && (e.memoizedState !== null) !== r && (t.flags |= 8192),
        r && t.mode & 1
          ? st & 1073741824 && (_e(t), t.subtreeFlags & 6 && (t.flags |= 8192))
          : _e(t),
        null
      );
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(N(156, t.tag));
}
function zy(e, t) {
  switch ((tc(t), t.tag)) {
    case 1:
      return (
        tt(t.type) && Ta(),
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 3:
      return (
        Yr(),
        pe(et),
        pe(Ge),
        cc(),
        (e = t.flags),
        e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 5:
      return (uc(t), null);
    case 13:
      if ((pe(ve), (e = t.memoizedState), e !== null && e.dehydrated !== null)) {
        if (t.alternate === null) throw Error(N(340));
        Xr();
      }
      return ((e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null);
    case 19:
      return (pe(ve), null);
    case 4:
      return (Yr(), null);
    case 10:
      return (ic(t.type._context), null);
    case 22:
    case 23:
      return (Sc(), null);
    case 24:
      return null;
    default:
      return null;
  }
}
var Pi = !1,
  je = !1,
  jy = typeof WeakSet == "function" ? WeakSet : Set,
  $ = null;
function Dr(e, t) {
  var n = e.ref;
  if (n !== null)
    if (typeof n == "function")
      try {
        n(null);
      } catch (r) {
        Se(e, t, r);
      }
    else n.current = null;
}
function Jl(e, t, n) {
  try {
    n();
  } catch (r) {
    Se(e, t, r);
  }
}
var Qf = !1;
function Gy(e, t) {
  if (((Ul = Sa), (e = $p()), Ju(e))) {
    if ("selectionStart" in e) var n = { start: e.selectionStart, end: e.selectionEnd };
    else
      e: {
        n = ((n = e.ownerDocument) && n.defaultView) || window;
        var r = n.getSelection && n.getSelection();
        if (r && r.rangeCount !== 0) {
          n = r.anchorNode;
          var s = r.anchorOffset,
            i = r.focusNode;
          r = r.focusOffset;
          try {
            (n.nodeType, i.nodeType);
          } catch {
            n = null;
            break e;
          }
          var a = 0,
            o = -1,
            l = -1,
            u = 0,
            c = 0,
            f = e,
            d = null;
          t: for (;;) {
            for (
              var h;
              f !== n || (s !== 0 && f.nodeType !== 3) || (o = a + s),
                f !== i || (r !== 0 && f.nodeType !== 3) || (l = a + r),
                f.nodeType === 3 && (a += f.nodeValue.length),
                (h = f.firstChild) !== null;
            )
              ((d = f), (f = h));
            for (;;) {
              if (f === e) break t;
              if (
                (d === n && ++u === s && (o = a),
                d === i && ++c === r && (l = a),
                (h = f.nextSibling) !== null)
              )
                break;
              ((f = d), (d = f.parentNode));
            }
            f = h;
          }
          n = o === -1 || l === -1 ? null : { start: o, end: l };
        } else n = null;
      }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (Al = { focusedElem: e, selectionRange: n }, Sa = !1, $ = t; $ !== null; )
    if (((t = $), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null))
      ((e.return = t), ($ = e));
    else
      for (; $ !== null; ) {
        t = $;
        try {
          var m = t.alternate;
          if (t.flags & 1024)
            switch (t.tag) {
              case 0:
              case 11:
              case 15:
                break;
              case 1:
                if (m !== null) {
                  var x = m.memoizedProps,
                    k = m.memoizedState,
                    p = t.stateNode,
                    g = p.getSnapshotBeforeUpdate(t.elementType === t.type ? x : Tt(t.type, x), k);
                  p.__reactInternalSnapshotBeforeUpdate = g;
                }
                break;
              case 3:
                var v = t.stateNode.containerInfo;
                v.nodeType === 1
                  ? (v.textContent = "")
                  : v.nodeType === 9 && v.documentElement && v.removeChild(v.documentElement);
                break;
              case 5:
              case 6:
              case 4:
              case 17:
                break;
              default:
                throw Error(N(163));
            }
        } catch (S) {
          Se(t, t.return, S);
        }
        if (((e = t.sibling), e !== null)) {
          ((e.return = t.return), ($ = e));
          break;
        }
        $ = t.return;
      }
  return ((m = Qf), (Qf = !1), m);
}
function Os(e, t, n) {
  var r = t.updateQueue;
  if (((r = r !== null ? r.lastEffect : null), r !== null)) {
    var s = (r = r.next);
    do {
      if ((s.tag & e) === e) {
        var i = s.destroy;
        ((s.destroy = void 0), i !== void 0 && Jl(t, n, i));
      }
      s = s.next;
    } while (s !== r);
  }
}
function lo(e, t) {
  if (((t = t.updateQueue), (t = t !== null ? t.lastEffect : null), t !== null)) {
    var n = (t = t.next);
    do {
      if ((n.tag & e) === e) {
        var r = n.create;
        n.destroy = r();
      }
      n = n.next;
    } while (n !== t);
  }
}
function eu(e) {
  var t = e.ref;
  if (t !== null) {
    var n = e.stateNode;
    switch (e.tag) {
      case 5:
        e = n;
        break;
      default:
        e = n;
    }
    typeof t == "function" ? t(e) : (t.current = e);
  }
}
function Dm(e) {
  var t = e.alternate;
  (t !== null && ((e.alternate = null), Dm(t)),
    (e.child = null),
    (e.deletions = null),
    (e.sibling = null),
    e.tag === 5 &&
      ((t = e.stateNode),
      t !== null && (delete t[Wt], delete t[Vs], delete t[_l], delete t[Ty], delete t[Cy])),
    (e.stateNode = null),
    (e.return = null),
    (e.dependencies = null),
    (e.memoizedProps = null),
    (e.memoizedState = null),
    (e.pendingProps = null),
    (e.stateNode = null),
    (e.updateQueue = null));
}
function Um(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function Jf(e) {
  e: for (;;) {
    for (; e.sibling === null; ) {
      if (e.return === null || Um(e.return)) return null;
      e = e.return;
    }
    for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      ((e.child.return = e), (e = e.child));
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function tu(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6)
    ((e = e.stateNode),
      t
        ? n.nodeType === 8
          ? n.parentNode.insertBefore(e, t)
          : n.insertBefore(e, t)
        : (n.nodeType === 8
            ? ((t = n.parentNode), t.insertBefore(e, n))
            : ((t = n), t.appendChild(e)),
          (n = n._reactRootContainer),
          n != null || t.onclick !== null || (t.onclick = Ea)));
  else if (r !== 4 && ((e = e.child), e !== null))
    for (tu(e, t, n), e = e.sibling; e !== null; ) (tu(e, t, n), (e = e.sibling));
}
function nu(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) ((e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e));
  else if (r !== 4 && ((e = e.child), e !== null))
    for (nu(e, t, n), e = e.sibling; e !== null; ) (nu(e, t, n), (e = e.sibling));
}
var Ue = null,
  Ct = !1;
function mn(e, t, n) {
  for (n = n.child; n !== null; ) (Am(e, t, n), (n = n.sibling));
}
function Am(e, t, n) {
  if (Kt && typeof Kt.onCommitFiberUnmount == "function")
    try {
      Kt.onCommitFiberUnmount(eo, n);
    } catch {}
  switch (n.tag) {
    case 5:
      je || Dr(n, t);
    case 6:
      var r = Ue,
        s = Ct;
      ((Ue = null),
        mn(e, t, n),
        (Ue = r),
        (Ct = s),
        Ue !== null &&
          (Ct
            ? ((e = Ue),
              (n = n.stateNode),
              e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n))
            : Ue.removeChild(n.stateNode)));
      break;
    case 18:
      Ue !== null &&
        (Ct
          ? ((e = Ue),
            (n = n.stateNode),
            e.nodeType === 8 ? Bo(e.parentNode, n) : e.nodeType === 1 && Bo(e, n),
            zs(e))
          : Bo(Ue, n.stateNode));
      break;
    case 4:
      ((r = Ue),
        (s = Ct),
        (Ue = n.stateNode.containerInfo),
        (Ct = !0),
        mn(e, t, n),
        (Ue = r),
        (Ct = s));
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!je && ((r = n.updateQueue), r !== null && ((r = r.lastEffect), r !== null))) {
        s = r = r.next;
        do {
          var i = s,
            a = i.destroy;
          ((i = i.tag), a !== void 0 && (i & 2 || i & 4) && Jl(n, t, a), (s = s.next));
        } while (s !== r);
      }
      mn(e, t, n);
      break;
    case 1:
      if (!je && (Dr(n, t), (r = n.stateNode), typeof r.componentWillUnmount == "function"))
        try {
          ((r.props = n.memoizedProps), (r.state = n.memoizedState), r.componentWillUnmount());
        } catch (o) {
          Se(n, t, o);
        }
      mn(e, t, n);
      break;
    case 21:
      mn(e, t, n);
      break;
    case 22:
      n.mode & 1
        ? ((je = (r = je) || n.memoizedState !== null), mn(e, t, n), (je = r))
        : mn(e, t, n);
      break;
    default:
      mn(e, t, n);
  }
}
function ed(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    (n === null && (n = e.stateNode = new jy()),
      t.forEach(function (r) {
        var s = Qy.bind(null, e, r);
        n.has(r) || (n.add(r), r.then(s, s));
      }));
  }
}
function Et(e, t) {
  var n = t.deletions;
  if (n !== null)
    for (var r = 0; r < n.length; r++) {
      var s = n[r];
      try {
        var i = e,
          a = t,
          o = a;
        e: for (; o !== null; ) {
          switch (o.tag) {
            case 5:
              ((Ue = o.stateNode), (Ct = !1));
              break e;
            case 3:
              ((Ue = o.stateNode.containerInfo), (Ct = !0));
              break e;
            case 4:
              ((Ue = o.stateNode.containerInfo), (Ct = !0));
              break e;
          }
          o = o.return;
        }
        if (Ue === null) throw Error(N(160));
        (Am(i, a, s), (Ue = null), (Ct = !1));
        var l = s.alternate;
        (l !== null && (l.return = null), (s.return = null));
      } catch (u) {
        Se(s, t, u);
      }
    }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) (Bm(t, e), (t = t.sibling));
}
function Bm(e, t) {
  var n = e.alternate,
    r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if ((Et(t, e), zt(e), r & 4)) {
        try {
          (Os(3, e, e.return), lo(3, e));
        } catch (x) {
          Se(e, e.return, x);
        }
        try {
          Os(5, e, e.return);
        } catch (x) {
          Se(e, e.return, x);
        }
      }
      break;
    case 1:
      (Et(t, e), zt(e), r & 512 && n !== null && Dr(n, n.return));
      break;
    case 5:
      if ((Et(t, e), zt(e), r & 512 && n !== null && Dr(n, n.return), e.flags & 32)) {
        var s = e.stateNode;
        try {
          As(s, "");
        } catch (x) {
          Se(e, e.return, x);
        }
      }
      if (r & 4 && ((s = e.stateNode), s != null)) {
        var i = e.memoizedProps,
          a = n !== null ? n.memoizedProps : i,
          o = e.type,
          l = e.updateQueue;
        if (((e.updateQueue = null), l !== null))
          try {
            (o === "input" && i.type === "radio" && i.name != null && ap(s, i), Cl(o, a));
            var u = Cl(o, i);
            for (a = 0; a < l.length; a += 2) {
              var c = l[a],
                f = l[a + 1];
              c === "style"
                ? fp(s, f)
                : c === "dangerouslySetInnerHTML"
                  ? up(s, f)
                  : c === "children"
                    ? As(s, f)
                    : _u(s, c, f, u);
            }
            switch (o) {
              case "input":
                Sl(s, i);
                break;
              case "textarea":
                op(s, i);
                break;
              case "select":
                var d = s._wrapperState.wasMultiple;
                s._wrapperState.wasMultiple = !!i.multiple;
                var h = i.value;
                h != null
                  ? Br(s, !!i.multiple, h, !1)
                  : d !== !!i.multiple &&
                    (i.defaultValue != null
                      ? Br(s, !!i.multiple, i.defaultValue, !0)
                      : Br(s, !!i.multiple, i.multiple ? [] : "", !1));
            }
            s[Vs] = i;
          } catch (x) {
            Se(e, e.return, x);
          }
      }
      break;
    case 6:
      if ((Et(t, e), zt(e), r & 4)) {
        if (e.stateNode === null) throw Error(N(162));
        ((s = e.stateNode), (i = e.memoizedProps));
        try {
          s.nodeValue = i;
        } catch (x) {
          Se(e, e.return, x);
        }
      }
      break;
    case 3:
      if ((Et(t, e), zt(e), r & 4 && n !== null && n.memoizedState.isDehydrated))
        try {
          zs(t.containerInfo);
        } catch (x) {
          Se(e, e.return, x);
        }
      break;
    case 4:
      (Et(t, e), zt(e));
      break;
    case 13:
      (Et(t, e),
        zt(e),
        (s = e.child),
        s.flags & 8192 &&
          ((i = s.memoizedState !== null),
          (s.stateNode.isHidden = i),
          !i || (s.alternate !== null && s.alternate.memoizedState !== null) || (xc = Te())),
        r & 4 && ed(e));
      break;
    case 22:
      if (
        ((c = n !== null && n.memoizedState !== null),
        e.mode & 1 ? ((je = (u = je) || c), Et(t, e), (je = u)) : Et(t, e),
        zt(e),
        r & 8192)
      ) {
        if (((u = e.memoizedState !== null), (e.stateNode.isHidden = u) && !c && e.mode & 1))
          for ($ = e, c = e.child; c !== null; ) {
            for (f = $ = c; $ !== null; ) {
              switch (((d = $), (h = d.child), d.tag)) {
                case 0:
                case 11:
                case 14:
                case 15:
                  Os(4, d, d.return);
                  break;
                case 1:
                  Dr(d, d.return);
                  var m = d.stateNode;
                  if (typeof m.componentWillUnmount == "function") {
                    ((r = d), (n = d.return));
                    try {
                      ((t = r),
                        (m.props = t.memoizedProps),
                        (m.state = t.memoizedState),
                        m.componentWillUnmount());
                    } catch (x) {
                      Se(r, n, x);
                    }
                  }
                  break;
                case 5:
                  Dr(d, d.return);
                  break;
                case 22:
                  if (d.memoizedState !== null) {
                    nd(f);
                    continue;
                  }
              }
              h !== null ? ((h.return = d), ($ = h)) : nd(f);
            }
            c = c.sibling;
          }
        e: for (c = null, f = e; ; ) {
          if (f.tag === 5) {
            if (c === null) {
              c = f;
              try {
                ((s = f.stateNode),
                  u
                    ? ((i = s.style),
                      typeof i.setProperty == "function"
                        ? i.setProperty("display", "none", "important")
                        : (i.display = "none"))
                    : ((o = f.stateNode),
                      (l = f.memoizedProps.style),
                      (a = l != null && l.hasOwnProperty("display") ? l.display : null),
                      (o.style.display = cp("display", a))));
              } catch (x) {
                Se(e, e.return, x);
              }
            }
          } else if (f.tag === 6) {
            if (c === null)
              try {
                f.stateNode.nodeValue = u ? "" : f.memoizedProps;
              } catch (x) {
                Se(e, e.return, x);
              }
          } else if (
            ((f.tag !== 22 && f.tag !== 23) || f.memoizedState === null || f === e) &&
            f.child !== null
          ) {
            ((f.child.return = f), (f = f.child));
            continue;
          }
          if (f === e) break e;
          for (; f.sibling === null; ) {
            if (f.return === null || f.return === e) break e;
            (c === f && (c = null), (f = f.return));
          }
          (c === f && (c = null), (f.sibling.return = f.return), (f = f.sibling));
        }
      }
      break;
    case 19:
      (Et(t, e), zt(e), r & 4 && ed(e));
      break;
    case 21:
      break;
    default:
      (Et(t, e), zt(e));
  }
}
function zt(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (Um(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(N(160));
      }
      switch (r.tag) {
        case 5:
          var s = r.stateNode;
          r.flags & 32 && (As(s, ""), (r.flags &= -33));
          var i = Jf(e);
          nu(e, i, s);
          break;
        case 3:
        case 4:
          var a = r.stateNode.containerInfo,
            o = Jf(e);
          tu(e, o, a);
          break;
        default:
          throw Error(N(161));
      }
    } catch (l) {
      Se(e, e.return, l);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function Hy(e, t, n) {
  (($ = e), $m(e));
}
function $m(e, t, n) {
  for (var r = (e.mode & 1) !== 0; $ !== null; ) {
    var s = $,
      i = s.child;
    if (s.tag === 22 && r) {
      var a = s.memoizedState !== null || Pi;
      if (!a) {
        var o = s.alternate,
          l = (o !== null && o.memoizedState !== null) || je;
        o = Pi;
        var u = je;
        if (((Pi = a), (je = l) && !u))
          for ($ = s; $ !== null; )
            ((a = $),
              (l = a.child),
              a.tag === 22 && a.memoizedState !== null
                ? rd(s)
                : l !== null
                  ? ((l.return = a), ($ = l))
                  : rd(s));
        for (; i !== null; ) (($ = i), $m(i), (i = i.sibling));
        (($ = s), (Pi = o), (je = u));
      }
      td(e);
    } else s.subtreeFlags & 8772 && i !== null ? ((i.return = s), ($ = i)) : td(e);
  }
}
function td(e) {
  for (; $ !== null; ) {
    var t = $;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772)
          switch (t.tag) {
            case 0:
            case 11:
            case 15:
              je || lo(5, t);
              break;
            case 1:
              var r = t.stateNode;
              if (t.flags & 4 && !je)
                if (n === null) r.componentDidMount();
                else {
                  var s = t.elementType === t.type ? n.memoizedProps : Tt(t.type, n.memoizedProps);
                  r.componentDidUpdate(s, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
                }
              var i = t.updateQueue;
              i !== null && $f(t, i, r);
              break;
            case 3:
              var a = t.updateQueue;
              if (a !== null) {
                if (((n = null), t.child !== null))
                  switch (t.child.tag) {
                    case 5:
                      n = t.child.stateNode;
                      break;
                    case 1:
                      n = t.child.stateNode;
                  }
                $f(t, a, n);
              }
              break;
            case 5:
              var o = t.stateNode;
              if (n === null && t.flags & 4) {
                n = o;
                var l = t.memoizedProps;
                switch (t.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    l.autoFocus && n.focus();
                    break;
                  case "img":
                    l.src && (n.src = l.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (t.memoizedState === null) {
                var u = t.alternate;
                if (u !== null) {
                  var c = u.memoizedState;
                  if (c !== null) {
                    var f = c.dehydrated;
                    f !== null && zs(f);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(N(163));
          }
        je || (t.flags & 512 && eu(t));
      } catch (d) {
        Se(t, t.return, d);
      }
    }
    if (t === e) {
      $ = null;
      break;
    }
    if (((n = t.sibling), n !== null)) {
      ((n.return = t.return), ($ = n));
      break;
    }
    $ = t.return;
  }
}
function nd(e) {
  for (; $ !== null; ) {
    var t = $;
    if (t === e) {
      $ = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      ((n.return = t.return), ($ = n));
      break;
    }
    $ = t.return;
  }
}
function rd(e) {
  for (; $ !== null; ) {
    var t = $;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            lo(4, t);
          } catch (l) {
            Se(t, n, l);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var s = t.return;
            try {
              r.componentDidMount();
            } catch (l) {
              Se(t, s, l);
            }
          }
          var i = t.return;
          try {
            eu(t);
          } catch (l) {
            Se(t, i, l);
          }
          break;
        case 5:
          var a = t.return;
          try {
            eu(t);
          } catch (l) {
            Se(t, a, l);
          }
      }
    } catch (l) {
      Se(t, t.return, l);
    }
    if (t === e) {
      $ = null;
      break;
    }
    var o = t.sibling;
    if (o !== null) {
      ((o.return = t.return), ($ = o));
      break;
    }
    $ = t.return;
  }
}
var Wy = Math.ceil,
  Da = dn.ReactCurrentDispatcher,
  vc = dn.ReactCurrentOwner,
  kt = dn.ReactCurrentBatchConfig,
  re = 0,
  Pe = null,
  Ce = null,
  Ae = 0,
  st = 0,
  Ur = Xn(0),
  Ne = 0,
  Qs = null,
  hr = 0,
  uo = 0,
  yc = 0,
  Is = null,
  Qe = null,
  xc = 0,
  Jr = 1 / 0,
  Qt = null,
  Ua = !1,
  ru = null,
  An = null,
  Di = !1,
  Fn = null,
  Aa = 0,
  Ps = 0,
  su = null,
  aa = -1,
  oa = 0;
function Xe() {
  return re & 6 ? Te() : aa !== -1 ? aa : (aa = Te());
}
function Bn(e) {
  return e.mode & 1
    ? re & 2 && Ae !== 0
      ? Ae & -Ae
      : Fy.transition !== null
        ? (oa === 0 && (oa = bp()), oa)
        : ((e = ie), e !== 0 || ((e = window.event), (e = e === void 0 ? 16 : Np(e.type))), e)
    : 1;
}
function Rt(e, t, n, r) {
  if (50 < Ps) throw ((Ps = 0), (su = null), Error(N(185)));
  (ci(e, n, r),
    (!(re & 2) || e !== Pe) &&
      (e === Pe && (!(re & 2) && (uo |= n), Ne === 4 && En(e, Ae)),
      nt(e, r),
      n === 1 && re === 0 && !(t.mode & 1) && ((Jr = Te() + 500), io && Zn())));
}
function nt(e, t) {
  var n = e.callbackNode;
  Fv(e, t);
  var r = ka(e, e === Pe ? Ae : 0);
  if (r === 0) (n !== null && df(n), (e.callbackNode = null), (e.callbackPriority = 0));
  else if (((t = r & -r), e.callbackPriority !== t)) {
    if ((n != null && df(n), t === 1))
      (e.tag === 0 ? Ly(sd.bind(null, e)) : Xp(sd.bind(null, e)),
        by(function () {
          !(re & 6) && Zn();
        }),
        (n = null));
    else {
      switch (Ep(r)) {
        case 1:
          n = Wu;
          break;
        case 4:
          n = Sp;
          break;
        case 16:
          n = xa;
          break;
        case 536870912:
          n = wp;
          break;
        default:
          n = xa;
      }
      n = Km(n, _m.bind(null, e));
    }
    ((e.callbackPriority = t), (e.callbackNode = n));
  }
}
function _m(e, t) {
  if (((aa = -1), (oa = 0), re & 6)) throw Error(N(327));
  var n = e.callbackNode;
  if (Gr() && e.callbackNode !== n) return null;
  var r = ka(e, e === Pe ? Ae : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = Ba(e, r);
  else {
    t = r;
    var s = re;
    re |= 2;
    var i = jm();
    (Pe !== e || Ae !== t) && ((Qt = null), (Jr = Te() + 500), ar(e, t));
    do
      try {
        qy();
        break;
      } catch (o) {
        zm(e, o);
      }
    while (!0);
    (sc(), (Da.current = i), (re = s), Ce !== null ? (t = 0) : ((Pe = null), (Ae = 0), (t = Ne)));
  }
  if (t !== 0) {
    if ((t === 2 && ((s = Rl(e)), s !== 0 && ((r = s), (t = iu(e, s)))), t === 1))
      throw ((n = Qs), ar(e, 0), En(e, r), nt(e, Te()), n);
    if (t === 6) En(e, r);
    else {
      if (
        ((s = e.current.alternate),
        !(r & 30) &&
          !Vy(s) &&
          ((t = Ba(e, r)), t === 2 && ((i = Rl(e)), i !== 0 && ((r = i), (t = iu(e, i)))), t === 1))
      )
        throw ((n = Qs), ar(e, 0), En(e, r), nt(e, Te()), n);
      switch (((e.finishedWork = s), (e.finishedLanes = r), t)) {
        case 0:
        case 1:
          throw Error(N(345));
        case 2:
          er(e, Qe, Qt);
          break;
        case 3:
          if ((En(e, r), (r & 130023424) === r && ((t = xc + 500 - Te()), 10 < t))) {
            if (ka(e, 0) !== 0) break;
            if (((s = e.suspendedLanes), (s & r) !== r)) {
              (Xe(), (e.pingedLanes |= e.suspendedLanes & s));
              break;
            }
            e.timeoutHandle = $l(er.bind(null, e, Qe, Qt), t);
            break;
          }
          er(e, Qe, Qt);
          break;
        case 4:
          if ((En(e, r), (r & 4194240) === r)) break;
          for (t = e.eventTimes, s = -1; 0 < r; ) {
            var a = 31 - Nt(r);
            ((i = 1 << a), (a = t[a]), a > s && (s = a), (r &= ~i));
          }
          if (
            ((r = s),
            (r = Te() - r),
            (r =
              (120 > r
                ? 120
                : 480 > r
                  ? 480
                  : 1080 > r
                    ? 1080
                    : 1920 > r
                      ? 1920
                      : 3e3 > r
                        ? 3e3
                        : 4320 > r
                          ? 4320
                          : 1960 * Wy(r / 1960)) - r),
            10 < r)
          ) {
            e.timeoutHandle = $l(er.bind(null, e, Qe, Qt), r);
            break;
          }
          er(e, Qe, Qt);
          break;
        case 5:
          er(e, Qe, Qt);
          break;
        default:
          throw Error(N(329));
      }
    }
  }
  return (nt(e, Te()), e.callbackNode === n ? _m.bind(null, e) : null);
}
function iu(e, t) {
  var n = Is;
  return (
    e.current.memoizedState.isDehydrated && (ar(e, t).flags |= 256),
    (e = Ba(e, t)),
    e !== 2 && ((t = Qe), (Qe = n), t !== null && au(t)),
    e
  );
}
function au(e) {
  Qe === null ? (Qe = e) : Qe.push.apply(Qe, e);
}
function Vy(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && ((n = n.stores), n !== null))
        for (var r = 0; r < n.length; r++) {
          var s = n[r],
            i = s.getSnapshot;
          s = s.value;
          try {
            if (!Pt(i(), s)) return !1;
          } catch {
            return !1;
          }
        }
    }
    if (((n = t.child), t.subtreeFlags & 16384 && n !== null)) ((n.return = t), (t = n));
    else {
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return !0;
        t = t.return;
      }
      ((t.sibling.return = t.return), (t = t.sibling));
    }
  }
  return !0;
}
function En(e, t) {
  for (
    t &= ~yc, t &= ~uo, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes;
    0 < t;
  ) {
    var n = 31 - Nt(t),
      r = 1 << n;
    ((e[n] = -1), (t &= ~r));
  }
}
function sd(e) {
  if (re & 6) throw Error(N(327));
  Gr();
  var t = ka(e, 0);
  if (!(t & 1)) return (nt(e, Te()), null);
  var n = Ba(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = Rl(e);
    r !== 0 && ((t = r), (n = iu(e, r)));
  }
  if (n === 1) throw ((n = Qs), ar(e, 0), En(e, t), nt(e, Te()), n);
  if (n === 6) throw Error(N(345));
  return (
    (e.finishedWork = e.current.alternate),
    (e.finishedLanes = t),
    er(e, Qe, Qt),
    nt(e, Te()),
    null
  );
}
function kc(e, t) {
  var n = re;
  re |= 1;
  try {
    return e(t);
  } finally {
    ((re = n), re === 0 && ((Jr = Te() + 500), io && Zn()));
  }
}
function pr(e) {
  Fn !== null && Fn.tag === 0 && !(re & 6) && Gr();
  var t = re;
  re |= 1;
  var n = kt.transition,
    r = ie;
  try {
    if (((kt.transition = null), (ie = 1), e)) return e();
  } finally {
    ((ie = r), (kt.transition = n), (re = t), !(re & 6) && Zn());
  }
}
function Sc() {
  ((st = Ur.current), pe(Ur));
}
function ar(e, t) {
  ((e.finishedWork = null), (e.finishedLanes = 0));
  var n = e.timeoutHandle;
  if ((n !== -1 && ((e.timeoutHandle = -1), wy(n)), Ce !== null))
    for (n = Ce.return; n !== null; ) {
      var r = n;
      switch ((tc(r), r.tag)) {
        case 1:
          ((r = r.type.childContextTypes), r != null && Ta());
          break;
        case 3:
          (Yr(), pe(et), pe(Ge), cc());
          break;
        case 5:
          uc(r);
          break;
        case 4:
          Yr();
          break;
        case 13:
          pe(ve);
          break;
        case 19:
          pe(ve);
          break;
        case 10:
          ic(r.type._context);
          break;
        case 22:
        case 23:
          Sc();
      }
      n = n.return;
    }
  if (
    ((Pe = e),
    (Ce = e = $n(e.current, null)),
    (Ae = st = t),
    (Ne = 0),
    (Qs = null),
    (yc = uo = hr = 0),
    (Qe = Is = null),
    sr !== null)
  ) {
    for (t = 0; t < sr.length; t++)
      if (((n = sr[t]), (r = n.interleaved), r !== null)) {
        n.interleaved = null;
        var s = r.next,
          i = n.pending;
        if (i !== null) {
          var a = i.next;
          ((i.next = s), (r.next = a));
        }
        n.pending = r;
      }
    sr = null;
  }
  return e;
}
function zm(e, t) {
  do {
    var n = Ce;
    try {
      if ((sc(), (ra.current = Pa), Ia)) {
        for (var r = ye.memoizedState; r !== null; ) {
          var s = r.queue;
          (s !== null && (s.pending = null), (r = r.next));
        }
        Ia = !1;
      }
      if (
        ((dr = 0),
        (Oe = Me = ye = null),
        (Rs = !1),
        (Xs = 0),
        (vc.current = null),
        n === null || n.return === null)
      ) {
        ((Ne = 1), (Qs = t), (Ce = null));
        break;
      }
      e: {
        var i = e,
          a = n.return,
          o = n,
          l = t;
        if (
          ((t = Ae),
          (o.flags |= 32768),
          l !== null && typeof l == "object" && typeof l.then == "function")
        ) {
          var u = l,
            c = o,
            f = c.tag;
          if (!(c.mode & 1) && (f === 0 || f === 11 || f === 15)) {
            var d = c.alternate;
            d
              ? ((c.updateQueue = d.updateQueue),
                (c.memoizedState = d.memoizedState),
                (c.lanes = d.lanes))
              : ((c.updateQueue = null), (c.memoizedState = null));
          }
          var h = Wf(a);
          if (h !== null) {
            ((h.flags &= -257), Vf(h, a, o, i, t), h.mode & 1 && Hf(i, u, t), (t = h), (l = u));
            var m = t.updateQueue;
            if (m === null) {
              var x = new Set();
              (x.add(l), (t.updateQueue = x));
            } else m.add(l);
            break e;
          } else {
            if (!(t & 1)) {
              (Hf(i, u, t), wc());
              break e;
            }
            l = Error(N(426));
          }
        } else if (me && o.mode & 1) {
          var k = Wf(a);
          if (k !== null) {
            (!(k.flags & 65536) && (k.flags |= 256), Vf(k, a, o, i, t), nc(Qr(l, o)));
            break e;
          }
        }
        ((i = l = Qr(l, o)), Ne !== 4 && (Ne = 2), Is === null ? (Is = [i]) : Is.push(i), (i = a));
        do {
          switch (i.tag) {
            case 3:
              ((i.flags |= 65536), (t &= -t), (i.lanes |= t));
              var p = Em(i, l, t);
              Bf(i, p);
              break e;
            case 1:
              o = l;
              var g = i.type,
                v = i.stateNode;
              if (
                !(i.flags & 128) &&
                (typeof g.getDerivedStateFromError == "function" ||
                  (v !== null &&
                    typeof v.componentDidCatch == "function" &&
                    (An === null || !An.has(v))))
              ) {
                ((i.flags |= 65536), (t &= -t), (i.lanes |= t));
                var S = Tm(i, o, t);
                Bf(i, S);
                break e;
              }
          }
          i = i.return;
        } while (i !== null);
      }
      Hm(n);
    } catch (b) {
      ((t = b), Ce === n && n !== null && (Ce = n = n.return));
      continue;
    }
    break;
  } while (!0);
}
function jm() {
  var e = Da.current;
  return ((Da.current = Pa), e === null ? Pa : e);
}
function wc() {
  ((Ne === 0 || Ne === 3 || Ne === 2) && (Ne = 4),
    Pe === null || (!(hr & 268435455) && !(uo & 268435455)) || En(Pe, Ae));
}
function Ba(e, t) {
  var n = re;
  re |= 2;
  var r = jm();
  (Pe !== e || Ae !== t) && ((Qt = null), ar(e, t));
  do
    try {
      Ky();
      break;
    } catch (s) {
      zm(e, s);
    }
  while (!0);
  if ((sc(), (re = n), (Da.current = r), Ce !== null)) throw Error(N(261));
  return ((Pe = null), (Ae = 0), Ne);
}
function Ky() {
  for (; Ce !== null; ) Gm(Ce);
}
function qy() {
  for (; Ce !== null && !xv(); ) Gm(Ce);
}
function Gm(e) {
  var t = Vm(e.alternate, e, st);
  ((e.memoizedProps = e.pendingProps), t === null ? Hm(e) : (Ce = t), (vc.current = null));
}
function Hm(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (((e = t.return), t.flags & 32768)) {
      if (((n = zy(n, t)), n !== null)) {
        ((n.flags &= 32767), (Ce = n));
        return;
      }
      if (e !== null) ((e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null));
      else {
        ((Ne = 6), (Ce = null));
        return;
      }
    } else if (((n = _y(n, t, st)), n !== null)) {
      Ce = n;
      return;
    }
    if (((t = t.sibling), t !== null)) {
      Ce = t;
      return;
    }
    Ce = t = e;
  } while (t !== null);
  Ne === 0 && (Ne = 5);
}
function er(e, t, n) {
  var r = ie,
    s = kt.transition;
  try {
    ((kt.transition = null), (ie = 1), Xy(e, t, n, r));
  } finally {
    ((kt.transition = s), (ie = r));
  }
  return null;
}
function Xy(e, t, n, r) {
  do Gr();
  while (Fn !== null);
  if (re & 6) throw Error(N(327));
  n = e.finishedWork;
  var s = e.finishedLanes;
  if (n === null) return null;
  if (((e.finishedWork = null), (e.finishedLanes = 0), n === e.current)) throw Error(N(177));
  ((e.callbackNode = null), (e.callbackPriority = 0));
  var i = n.lanes | n.childLanes;
  if (
    (Mv(e, i),
    e === Pe && ((Ce = Pe = null), (Ae = 0)),
    (!(n.subtreeFlags & 2064) && !(n.flags & 2064)) ||
      Di ||
      ((Di = !0),
      Km(xa, function () {
        return (Gr(), null);
      })),
    (i = (n.flags & 15990) !== 0),
    n.subtreeFlags & 15990 || i)
  ) {
    ((i = kt.transition), (kt.transition = null));
    var a = ie;
    ie = 1;
    var o = re;
    ((re |= 4),
      (vc.current = null),
      Gy(e, n),
      Bm(n, e),
      my(Al),
      (Sa = !!Ul),
      (Al = Ul = null),
      (e.current = n),
      Hy(n),
      kv(),
      (re = o),
      (ie = a),
      (kt.transition = i));
  } else e.current = n;
  if (
    (Di && ((Di = !1), (Fn = e), (Aa = s)),
    (i = e.pendingLanes),
    i === 0 && (An = null),
    bv(n.stateNode),
    nt(e, Te()),
    t !== null)
  )
    for (r = e.onRecoverableError, n = 0; n < t.length; n++)
      ((s = t[n]), r(s.value, { componentStack: s.stack, digest: s.digest }));
  if (Ua) throw ((Ua = !1), (e = ru), (ru = null), e);
  return (
    Aa & 1 && e.tag !== 0 && Gr(),
    (i = e.pendingLanes),
    i & 1 ? (e === su ? Ps++ : ((Ps = 0), (su = e))) : (Ps = 0),
    Zn(),
    null
  );
}
function Gr() {
  if (Fn !== null) {
    var e = Ep(Aa),
      t = kt.transition,
      n = ie;
    try {
      if (((kt.transition = null), (ie = 16 > e ? 16 : e), Fn === null)) var r = !1;
      else {
        if (((e = Fn), (Fn = null), (Aa = 0), re & 6)) throw Error(N(331));
        var s = re;
        for (re |= 4, $ = e.current; $ !== null; ) {
          var i = $,
            a = i.child;
          if ($.flags & 16) {
            var o = i.deletions;
            if (o !== null) {
              for (var l = 0; l < o.length; l++) {
                var u = o[l];
                for ($ = u; $ !== null; ) {
                  var c = $;
                  switch (c.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Os(8, c, i);
                  }
                  var f = c.child;
                  if (f !== null) ((f.return = c), ($ = f));
                  else
                    for (; $ !== null; ) {
                      c = $;
                      var d = c.sibling,
                        h = c.return;
                      if ((Dm(c), c === u)) {
                        $ = null;
                        break;
                      }
                      if (d !== null) {
                        ((d.return = h), ($ = d));
                        break;
                      }
                      $ = h;
                    }
                }
              }
              var m = i.alternate;
              if (m !== null) {
                var x = m.child;
                if (x !== null) {
                  m.child = null;
                  do {
                    var k = x.sibling;
                    ((x.sibling = null), (x = k));
                  } while (x !== null);
                }
              }
              $ = i;
            }
          }
          if (i.subtreeFlags & 2064 && a !== null) ((a.return = i), ($ = a));
          else
            e: for (; $ !== null; ) {
              if (((i = $), i.flags & 2048))
                switch (i.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Os(9, i, i.return);
                }
              var p = i.sibling;
              if (p !== null) {
                ((p.return = i.return), ($ = p));
                break e;
              }
              $ = i.return;
            }
        }
        var g = e.current;
        for ($ = g; $ !== null; ) {
          a = $;
          var v = a.child;
          if (a.subtreeFlags & 2064 && v !== null) ((v.return = a), ($ = v));
          else
            e: for (a = g; $ !== null; ) {
              if (((o = $), o.flags & 2048))
                try {
                  switch (o.tag) {
                    case 0:
                    case 11:
                    case 15:
                      lo(9, o);
                  }
                } catch (b) {
                  Se(o, o.return, b);
                }
              if (o === a) {
                $ = null;
                break e;
              }
              var S = o.sibling;
              if (S !== null) {
                ((S.return = o.return), ($ = S));
                break e;
              }
              $ = o.return;
            }
        }
        if (((re = s), Zn(), Kt && typeof Kt.onPostCommitFiberRoot == "function"))
          try {
            Kt.onPostCommitFiberRoot(eo, e);
          } catch {}
        r = !0;
      }
      return r;
    } finally {
      ((ie = n), (kt.transition = t));
    }
  }
  return !1;
}
function id(e, t, n) {
  ((t = Qr(n, t)),
    (t = Em(e, t, 1)),
    (e = Un(e, t, 1)),
    (t = Xe()),
    e !== null && (ci(e, 1, t), nt(e, t)));
}
function Se(e, t, n) {
  if (e.tag === 3) id(e, e, n);
  else
    for (; t !== null; ) {
      if (t.tag === 3) {
        id(t, e, n);
        break;
      } else if (t.tag === 1) {
        var r = t.stateNode;
        if (
          typeof t.type.getDerivedStateFromError == "function" ||
          (typeof r.componentDidCatch == "function" && (An === null || !An.has(r)))
        ) {
          ((e = Qr(n, e)),
            (e = Tm(t, e, 1)),
            (t = Un(t, e, 1)),
            (e = Xe()),
            t !== null && (ci(t, 1, e), nt(t, e)));
          break;
        }
      }
      t = t.return;
    }
}
function Zy(e, t, n) {
  var r = e.pingCache;
  (r !== null && r.delete(t),
    (t = Xe()),
    (e.pingedLanes |= e.suspendedLanes & n),
    Pe === e &&
      (Ae & n) === n &&
      (Ne === 4 || (Ne === 3 && (Ae & 130023424) === Ae && 500 > Te() - xc) ? ar(e, 0) : (yc |= n)),
    nt(e, t));
}
function Wm(e, t) {
  t === 0 && (e.mode & 1 ? ((t = Ti), (Ti <<= 1), !(Ti & 130023424) && (Ti = 4194304)) : (t = 1));
  var n = Xe();
  ((e = cn(e, t)), e !== null && (ci(e, t, n), nt(e, n)));
}
function Yy(e) {
  var t = e.memoizedState,
    n = 0;
  (t !== null && (n = t.retryLane), Wm(e, n));
}
function Qy(e, t) {
  var n = 0;
  switch (e.tag) {
    case 13:
      var r = e.stateNode,
        s = e.memoizedState;
      s !== null && (n = s.retryLane);
      break;
    case 19:
      r = e.stateNode;
      break;
    default:
      throw Error(N(314));
  }
  (r !== null && r.delete(t), Wm(e, n));
}
var Vm;
Vm = function (e, t, n) {
  if (e !== null)
    if (e.memoizedProps !== t.pendingProps || et.current) Je = !0;
    else {
      if (!(e.lanes & n) && !(t.flags & 128)) return ((Je = !1), $y(e, t, n));
      Je = !!(e.flags & 131072);
    }
  else ((Je = !1), me && t.flags & 1048576 && Zp(t, Fa, t.index));
  switch (((t.lanes = 0), t.tag)) {
    case 2:
      var r = t.type;
      (ia(e, t), (e = t.pendingProps));
      var s = qr(t, Ge.current);
      (jr(t, n), (s = dc(null, t, r, e, s, n)));
      var i = hc();
      return (
        (t.flags |= 1),
        typeof s == "object" && s !== null && typeof s.render == "function" && s.$$typeof === void 0
          ? ((t.tag = 1),
            (t.memoizedState = null),
            (t.updateQueue = null),
            tt(r) ? ((i = !0), Ca(t)) : (i = !1),
            (t.memoizedState = s.state !== null && s.state !== void 0 ? s.state : null),
            oc(t),
            (s.updater = oo),
            (t.stateNode = s),
            (s._reactInternals = t),
            Vl(t, r, e, n),
            (t = Xl(null, t, r, !0, i, n)))
          : ((t.tag = 0), me && i && ec(t), Ke(null, t, s, n), (t = t.child)),
        t
      );
    case 16:
      r = t.elementType;
      e: {
        switch (
          (ia(e, t),
          (e = t.pendingProps),
          (s = r._init),
          (r = s(r._payload)),
          (t.type = r),
          (s = t.tag = e1(r)),
          (e = Tt(r, e)),
          s)
        ) {
          case 0:
            t = ql(null, t, r, e, n);
            break e;
          case 1:
            t = Xf(null, t, r, e, n);
            break e;
          case 11:
            t = Kf(null, t, r, e, n);
            break e;
          case 14:
            t = qf(null, t, r, Tt(r.type, e), n);
            break e;
        }
        throw Error(N(306, r, ""));
      }
      return t;
    case 0:
      return (
        (r = t.type),
        (s = t.pendingProps),
        (s = t.elementType === r ? s : Tt(r, s)),
        ql(e, t, r, s, n)
      );
    case 1:
      return (
        (r = t.type),
        (s = t.pendingProps),
        (s = t.elementType === r ? s : Tt(r, s)),
        Xf(e, t, r, s, n)
      );
    case 3:
      e: {
        if ((Mm(t), e === null)) throw Error(N(387));
        ((r = t.pendingProps), (i = t.memoizedState), (s = i.element), nm(e, t), Ra(t, r, null, n));
        var a = t.memoizedState;
        if (((r = a.element), i.isDehydrated))
          if (
            ((i = {
              element: r,
              isDehydrated: !1,
              cache: a.cache,
              pendingSuspenseBoundaries: a.pendingSuspenseBoundaries,
              transitions: a.transitions,
            }),
            (t.updateQueue.baseState = i),
            (t.memoizedState = i),
            t.flags & 256)
          ) {
            ((s = Qr(Error(N(423)), t)), (t = Zf(e, t, r, n, s)));
            break e;
          } else if (r !== s) {
            ((s = Qr(Error(N(424)), t)), (t = Zf(e, t, r, n, s)));
            break e;
          } else
            for (
              it = Dn(t.stateNode.containerInfo.firstChild),
                ot = t,
                me = !0,
                Lt = null,
                n = em(t, null, r, n),
                t.child = n;
              n;
            )
              ((n.flags = (n.flags & -3) | 4096), (n = n.sibling));
        else {
          if ((Xr(), r === s)) {
            t = fn(e, t, n);
            break e;
          }
          Ke(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return (
        rm(t),
        e === null && Gl(t),
        (r = t.type),
        (s = t.pendingProps),
        (i = e !== null ? e.memoizedProps : null),
        (a = s.children),
        Bl(r, s) ? (a = null) : i !== null && Bl(r, i) && (t.flags |= 32),
        Fm(e, t),
        Ke(e, t, a, n),
        t.child
      );
    case 6:
      return (e === null && Gl(t), null);
    case 13:
      return Nm(e, t, n);
    case 4:
      return (
        lc(t, t.stateNode.containerInfo),
        (r = t.pendingProps),
        e === null ? (t.child = Zr(t, null, r, n)) : Ke(e, t, r, n),
        t.child
      );
    case 11:
      return (
        (r = t.type),
        (s = t.pendingProps),
        (s = t.elementType === r ? s : Tt(r, s)),
        Kf(e, t, r, s, n)
      );
    case 7:
      return (Ke(e, t, t.pendingProps, n), t.child);
    case 8:
      return (Ke(e, t, t.pendingProps.children, n), t.child);
    case 12:
      return (Ke(e, t, t.pendingProps.children, n), t.child);
    case 10:
      e: {
        if (
          ((r = t.type._context),
          (s = t.pendingProps),
          (i = t.memoizedProps),
          (a = s.value),
          de(Ma, r._currentValue),
          (r._currentValue = a),
          i !== null)
        )
          if (Pt(i.value, a)) {
            if (i.children === s.children && !et.current) {
              t = fn(e, t, n);
              break e;
            }
          } else
            for (i = t.child, i !== null && (i.return = t); i !== null; ) {
              var o = i.dependencies;
              if (o !== null) {
                a = i.child;
                for (var l = o.firstContext; l !== null; ) {
                  if (l.context === r) {
                    if (i.tag === 1) {
                      ((l = sn(-1, n & -n)), (l.tag = 2));
                      var u = i.updateQueue;
                      if (u !== null) {
                        u = u.shared;
                        var c = u.pending;
                        (c === null ? (l.next = l) : ((l.next = c.next), (c.next = l)),
                          (u.pending = l));
                      }
                    }
                    ((i.lanes |= n),
                      (l = i.alternate),
                      l !== null && (l.lanes |= n),
                      Hl(i.return, n, t),
                      (o.lanes |= n));
                    break;
                  }
                  l = l.next;
                }
              } else if (i.tag === 10) a = i.type === t.type ? null : i.child;
              else if (i.tag === 18) {
                if (((a = i.return), a === null)) throw Error(N(341));
                ((a.lanes |= n),
                  (o = a.alternate),
                  o !== null && (o.lanes |= n),
                  Hl(a, n, t),
                  (a = i.sibling));
              } else a = i.child;
              if (a !== null) a.return = i;
              else
                for (a = i; a !== null; ) {
                  if (a === t) {
                    a = null;
                    break;
                  }
                  if (((i = a.sibling), i !== null)) {
                    ((i.return = a.return), (a = i));
                    break;
                  }
                  a = a.return;
                }
              i = a;
            }
        (Ke(e, t, s.children, n), (t = t.child));
      }
      return t;
    case 9:
      return (
        (s = t.type),
        (r = t.pendingProps.children),
        jr(t, n),
        (s = St(s)),
        (r = r(s)),
        (t.flags |= 1),
        Ke(e, t, r, n),
        t.child
      );
    case 14:
      return ((r = t.type), (s = Tt(r, t.pendingProps)), (s = Tt(r.type, s)), qf(e, t, r, s, n));
    case 15:
      return Cm(e, t, t.type, t.pendingProps, n);
    case 17:
      return (
        (r = t.type),
        (s = t.pendingProps),
        (s = t.elementType === r ? s : Tt(r, s)),
        ia(e, t),
        (t.tag = 1),
        tt(r) ? ((e = !0), Ca(t)) : (e = !1),
        jr(t, n),
        bm(t, r, s),
        Vl(t, r, s, n),
        Xl(null, t, r, !0, e, n)
      );
    case 19:
      return Rm(e, t, n);
    case 22:
      return Lm(e, t, n);
  }
  throw Error(N(156, t.tag));
};
function Km(e, t) {
  return kp(e, t);
}
function Jy(e, t, n, r) {
  ((this.tag = e),
    (this.key = n),
    (this.sibling =
      this.child =
      this.return =
      this.stateNode =
      this.type =
      this.elementType =
        null),
    (this.index = 0),
    (this.ref = null),
    (this.pendingProps = t),
    (this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null),
    (this.mode = r),
    (this.subtreeFlags = this.flags = 0),
    (this.deletions = null),
    (this.childLanes = this.lanes = 0),
    (this.alternate = null));
}
function xt(e, t, n, r) {
  return new Jy(e, t, n, r);
}
function bc(e) {
  return ((e = e.prototype), !(!e || !e.isReactComponent));
}
function e1(e) {
  if (typeof e == "function") return bc(e) ? 1 : 0;
  if (e != null) {
    if (((e = e.$$typeof), e === ju)) return 11;
    if (e === Gu) return 14;
  }
  return 2;
}
function $n(e, t) {
  var n = e.alternate;
  return (
    n === null
      ? ((n = xt(e.tag, t, e.key, e.mode)),
        (n.elementType = e.elementType),
        (n.type = e.type),
        (n.stateNode = e.stateNode),
        (n.alternate = e),
        (e.alternate = n))
      : ((n.pendingProps = t),
        (n.type = e.type),
        (n.flags = 0),
        (n.subtreeFlags = 0),
        (n.deletions = null)),
    (n.flags = e.flags & 14680064),
    (n.childLanes = e.childLanes),
    (n.lanes = e.lanes),
    (n.child = e.child),
    (n.memoizedProps = e.memoizedProps),
    (n.memoizedState = e.memoizedState),
    (n.updateQueue = e.updateQueue),
    (t = e.dependencies),
    (n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
    (n.sibling = e.sibling),
    (n.index = e.index),
    (n.ref = e.ref),
    n
  );
}
function la(e, t, n, r, s, i) {
  var a = 2;
  if (((r = e), typeof e == "function")) bc(e) && (a = 1);
  else if (typeof e == "string") a = 5;
  else
    e: switch (e) {
      case Cr:
        return or(n.children, s, i, t);
      case zu:
        ((a = 8), (s |= 8));
        break;
      case gl:
        return ((e = xt(12, n, t, s | 2)), (e.elementType = gl), (e.lanes = i), e);
      case vl:
        return ((e = xt(13, n, t, s)), (e.elementType = vl), (e.lanes = i), e);
      case yl:
        return ((e = xt(19, n, t, s)), (e.elementType = yl), (e.lanes = i), e);
      case rp:
        return co(n, s, i, t);
      default:
        if (typeof e == "object" && e !== null)
          switch (e.$$typeof) {
            case tp:
              a = 10;
              break e;
            case np:
              a = 9;
              break e;
            case ju:
              a = 11;
              break e;
            case Gu:
              a = 14;
              break e;
            case kn:
              ((a = 16), (r = null));
              break e;
          }
        throw Error(N(130, e == null ? e : typeof e, ""));
    }
  return ((t = xt(a, n, t, s)), (t.elementType = e), (t.type = r), (t.lanes = i), t);
}
function or(e, t, n, r) {
  return ((e = xt(7, e, r, t)), (e.lanes = n), e);
}
function co(e, t, n, r) {
  return (
    (e = xt(22, e, r, t)),
    (e.elementType = rp),
    (e.lanes = n),
    (e.stateNode = { isHidden: !1 }),
    e
  );
}
function Vo(e, t, n) {
  return ((e = xt(6, e, null, t)), (e.lanes = n), e);
}
function Ko(e, t, n) {
  return (
    (t = xt(4, e.children !== null ? e.children : [], e.key, t)),
    (t.lanes = n),
    (t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation,
    }),
    t
  );
}
function t1(e, t, n, r, s) {
  ((this.tag = t),
    (this.containerInfo = e),
    (this.finishedWork = this.pingCache = this.current = this.pendingChildren = null),
    (this.timeoutHandle = -1),
    (this.callbackNode = this.pendingContext = this.context = null),
    (this.callbackPriority = 0),
    (this.eventTimes = Lo(0)),
    (this.expirationTimes = Lo(-1)),
    (this.entangledLanes =
      this.finishedLanes =
      this.mutableReadLanes =
      this.expiredLanes =
      this.pingedLanes =
      this.suspendedLanes =
      this.pendingLanes =
        0),
    (this.entanglements = Lo(0)),
    (this.identifierPrefix = r),
    (this.onRecoverableError = s),
    (this.mutableSourceEagerHydrationData = null));
}
function Ec(e, t, n, r, s, i, a, o, l) {
  return (
    (e = new t1(e, t, n, o, l)),
    t === 1 ? ((t = 1), i === !0 && (t |= 8)) : (t = 0),
    (i = xt(3, null, null, t)),
    (e.current = i),
    (i.stateNode = e),
    (i.memoizedState = {
      element: r,
      isDehydrated: n,
      cache: null,
      transitions: null,
      pendingSuspenseBoundaries: null,
    }),
    oc(i),
    e
  );
}
function n1(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return {
    $$typeof: Tr,
    key: r == null ? null : "" + r,
    children: e,
    containerInfo: t,
    implementation: n,
  };
}
function qm(e) {
  if (!e) return Hn;
  e = e._reactInternals;
  e: {
    if (yr(e) !== e || e.tag !== 1) throw Error(N(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (tt(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(N(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (tt(n)) return qp(e, n, t);
  }
  return t;
}
function Xm(e, t, n, r, s, i, a, o, l) {
  return (
    (e = Ec(n, r, !0, e, s, i, a, o, l)),
    (e.context = qm(null)),
    (n = e.current),
    (r = Xe()),
    (s = Bn(n)),
    (i = sn(r, s)),
    (i.callback = t ?? null),
    Un(n, i, s),
    (e.current.lanes = s),
    ci(e, s, r),
    nt(e, r),
    e
  );
}
function fo(e, t, n, r) {
  var s = t.current,
    i = Xe(),
    a = Bn(s);
  return (
    (n = qm(n)),
    t.context === null ? (t.context = n) : (t.pendingContext = n),
    (t = sn(i, a)),
    (t.payload = { element: e }),
    (r = r === void 0 ? null : r),
    r !== null && (t.callback = r),
    (e = Un(s, t, a)),
    e !== null && (Rt(e, s, a, i), na(e, s, a)),
    a
  );
}
function $a(e) {
  if (((e = e.current), !e.child)) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function ad(e, t) {
  if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function Tc(e, t) {
  (ad(e, t), (e = e.alternate) && ad(e, t));
}
function r1() {
  return null;
}
var Zm =
  typeof reportError == "function"
    ? reportError
    : function (e) {
        console.error(e);
      };
function Cc(e) {
  this._internalRoot = e;
}
ho.prototype.render = Cc.prototype.render = function (e) {
  var t = this._internalRoot;
  if (t === null) throw Error(N(409));
  fo(e, t, null, null);
};
ho.prototype.unmount = Cc.prototype.unmount = function () {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    (pr(function () {
      fo(null, e, null, null);
    }),
      (t[un] = null));
  }
};
function ho(e) {
  this._internalRoot = e;
}
ho.prototype.unstable_scheduleHydration = function (e) {
  if (e) {
    var t = Lp();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < bn.length && t !== 0 && t < bn[n].priority; n++);
    (bn.splice(n, 0, e), n === 0 && Mp(e));
  }
};
function Lc(e) {
  return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
}
function po(e) {
  return !(
    !e ||
    (e.nodeType !== 1 &&
      e.nodeType !== 9 &&
      e.nodeType !== 11 &&
      (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "))
  );
}
function od() {}
function s1(e, t, n, r, s) {
  if (s) {
    if (typeof r == "function") {
      var i = r;
      r = function () {
        var u = $a(a);
        i.call(u);
      };
    }
    var a = Xm(t, r, e, 0, null, !1, !1, "", od);
    return (
      (e._reactRootContainer = a),
      (e[un] = a.current),
      Hs(e.nodeType === 8 ? e.parentNode : e),
      pr(),
      a
    );
  }
  for (; (s = e.lastChild); ) e.removeChild(s);
  if (typeof r == "function") {
    var o = r;
    r = function () {
      var u = $a(l);
      o.call(u);
    };
  }
  var l = Ec(e, 0, !1, null, null, !1, !1, "", od);
  return (
    (e._reactRootContainer = l),
    (e[un] = l.current),
    Hs(e.nodeType === 8 ? e.parentNode : e),
    pr(function () {
      fo(t, l, n, r);
    }),
    l
  );
}
function mo(e, t, n, r, s) {
  var i = n._reactRootContainer;
  if (i) {
    var a = i;
    if (typeof s == "function") {
      var o = s;
      s = function () {
        var l = $a(a);
        o.call(l);
      };
    }
    fo(t, a, e, s);
  } else a = s1(n, t, e, s, r);
  return $a(a);
}
Tp = function (e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = Es(t.pendingLanes);
        n !== 0 && (Vu(t, n | 1), nt(t, Te()), !(re & 6) && ((Jr = Te() + 500), Zn()));
      }
      break;
    case 13:
      (pr(function () {
        var r = cn(e, 1);
        if (r !== null) {
          var s = Xe();
          Rt(r, e, 1, s);
        }
      }),
        Tc(e, 1));
  }
};
Ku = function (e) {
  if (e.tag === 13) {
    var t = cn(e, 134217728);
    if (t !== null) {
      var n = Xe();
      Rt(t, e, 134217728, n);
    }
    Tc(e, 134217728);
  }
};
Cp = function (e) {
  if (e.tag === 13) {
    var t = Bn(e),
      n = cn(e, t);
    if (n !== null) {
      var r = Xe();
      Rt(n, e, t, r);
    }
    Tc(e, t);
  }
};
Lp = function () {
  return ie;
};
Fp = function (e, t) {
  var n = ie;
  try {
    return ((ie = e), t());
  } finally {
    ie = n;
  }
};
Fl = function (e, t, n) {
  switch (t) {
    case "input":
      if ((Sl(e, n), (t = n.name), n.type === "radio" && t != null)) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (
          n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0;
          t < n.length;
          t++
        ) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var s = so(r);
            if (!s) throw Error(N(90));
            (ip(r), Sl(r, s));
          }
        }
      }
      break;
    case "textarea":
      op(e, n);
      break;
    case "select":
      ((t = n.value), t != null && Br(e, !!n.multiple, t, !1));
  }
};
pp = kc;
mp = pr;
var i1 = { usingClientEntryPoint: !1, Events: [di, Nr, so, dp, hp, kc] },
  ps = {
    findFiberByHostInstance: rr,
    bundleType: 0,
    version: "18.3.1",
    rendererPackageName: "react-dom",
  },
  a1 = {
    bundleType: ps.bundleType,
    version: ps.version,
    rendererPackageName: ps.rendererPackageName,
    rendererConfig: ps.rendererConfig,
    overrideHookState: null,
    overrideHookStateDeletePath: null,
    overrideHookStateRenamePath: null,
    overrideProps: null,
    overridePropsDeletePath: null,
    overridePropsRenamePath: null,
    setErrorHandler: null,
    setSuspenseHandler: null,
    scheduleUpdate: null,
    currentDispatcherRef: dn.ReactCurrentDispatcher,
    findHostInstanceByFiber: function (e) {
      return ((e = yp(e)), e === null ? null : e.stateNode);
    },
    findFiberByHostInstance: ps.findFiberByHostInstance || r1,
    findHostInstancesForRefresh: null,
    scheduleRefresh: null,
    scheduleRoot: null,
    setRefreshHandler: null,
    getCurrentFiber: null,
    reconcilerVersion: "18.3.1-next-f1338f8080-20240426",
  };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var Ui = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!Ui.isDisabled && Ui.supportsFiber)
    try {
      ((eo = Ui.inject(a1)), (Kt = Ui));
    } catch {}
}
ct.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = i1;
ct.createPortal = function (e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!Lc(t)) throw Error(N(200));
  return n1(e, t, null, n);
};
ct.createRoot = function (e, t) {
  if (!Lc(e)) throw Error(N(299));
  var n = !1,
    r = "",
    s = Zm;
  return (
    t != null &&
      (t.unstable_strictMode === !0 && (n = !0),
      t.identifierPrefix !== void 0 && (r = t.identifierPrefix),
      t.onRecoverableError !== void 0 && (s = t.onRecoverableError)),
    (t = Ec(e, 1, !1, null, null, n, !1, r, s)),
    (e[un] = t.current),
    Hs(e.nodeType === 8 ? e.parentNode : e),
    new Cc(t)
  );
};
ct.findDOMNode = function (e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function"
      ? Error(N(188))
      : ((e = Object.keys(e).join(",")), Error(N(268, e)));
  return ((e = yp(t)), (e = e === null ? null : e.stateNode), e);
};
ct.flushSync = function (e) {
  return pr(e);
};
ct.hydrate = function (e, t, n) {
  if (!po(t)) throw Error(N(200));
  return mo(null, e, t, !0, n);
};
ct.hydrateRoot = function (e, t, n) {
  if (!Lc(e)) throw Error(N(405));
  var r = (n != null && n.hydratedSources) || null,
    s = !1,
    i = "",
    a = Zm;
  if (
    (n != null &&
      (n.unstable_strictMode === !0 && (s = !0),
      n.identifierPrefix !== void 0 && (i = n.identifierPrefix),
      n.onRecoverableError !== void 0 && (a = n.onRecoverableError)),
    (t = Xm(t, null, e, 1, n ?? null, s, !1, i, a)),
    (e[un] = t.current),
    Hs(e),
    r)
  )
    for (e = 0; e < r.length; e++)
      ((n = r[e]),
        (s = n._getVersion),
        (s = s(n._source)),
        t.mutableSourceEagerHydrationData == null
          ? (t.mutableSourceEagerHydrationData = [n, s])
          : t.mutableSourceEagerHydrationData.push(n, s));
  return new ho(t);
};
ct.render = function (e, t, n) {
  if (!po(t)) throw Error(N(200));
  return mo(null, e, t, !1, n);
};
ct.unmountComponentAtNode = function (e) {
  if (!po(e)) throw Error(N(40));
  return e._reactRootContainer
    ? (pr(function () {
        mo(null, null, e, !1, function () {
          ((e._reactRootContainer = null), (e[un] = null));
        });
      }),
      !0)
    : !1;
};
ct.unstable_batchedUpdates = kc;
ct.unstable_renderSubtreeIntoContainer = function (e, t, n, r) {
  if (!po(n)) throw Error(N(200));
  if (e == null || e._reactInternals === void 0) throw Error(N(38));
  return mo(e, t, n, !1, r);
};
ct.version = "18.3.1-next-f1338f8080-20240426";
function Ym() {
  if (
    !(
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
    )
  )
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Ym);
    } catch (e) {
      console.error(e);
    }
}
(Ym(), (Yh.exports = ct));
var Qm = Yh.exports,
  Jm,
  ld = Qm;
((Jm = ld.createRoot), ld.hydrateRoot);
const o1 = "modulepreload",
  l1 = function (e, t) {
    return new URL(e, t).href;
  },
  ud = {},
  bt = function (t, n, r) {
    let s = Promise.resolve();
    if (n && n.length > 0) {
      const a = document.getElementsByTagName("link"),
        o = document.querySelector("meta[property=csp-nonce]"),
        l = (o == null ? void 0 : o.nonce) || (o == null ? void 0 : o.getAttribute("nonce"));
      s = Promise.allSettled(
        n.map((u) => {
          if (((u = l1(u, r)), u in ud)) return;
          ud[u] = !0;
          const c = u.endsWith(".css"),
            f = c ? '[rel="stylesheet"]' : "";
          if (!!r)
            for (let m = a.length - 1; m >= 0; m--) {
              const x = a[m];
              if (x.href === u && (!c || x.rel === "stylesheet")) return;
            }
          else if (document.querySelector(`link[href="${u}"]${f}`)) return;
          const h = document.createElement("link");
          if (
            ((h.rel = c ? "stylesheet" : o1),
            c || (h.as = "script"),
            (h.crossOrigin = ""),
            (h.href = u),
            l && h.setAttribute("nonce", l),
            document.head.appendChild(h),
            c)
          )
            return new Promise((m, x) => {
              (h.addEventListener("load", m),
                h.addEventListener("error", () => x(new Error(`Unable to preload CSS for ${u}`))));
            });
        }),
      );
    }
    function i(a) {
      const o = new Event("vite:preloadError", { cancelable: !0 });
      if (((o.payload = a), window.dispatchEvent(o), !o.defaultPrevented)) throw a;
    }
    return s.then((a) => {
      for (const o of a || []) o.status === "rejected" && i(o.reason);
      return t().catch(i);
    });
  },
  e0 = () => ({
    person: "",
    role: "",
    phone: "",
    email: "",
    web: "",
    street: "",
    city: "",
    unioPartner: !1,
    legal: "",
  });
function cd(e) {
  if (e.length <= 4) return e;
  const t = [e.slice(0, 3)];
  let n = e.slice(3);
  for (; n.length > 3; ) (t.push(n.slice(0, 2)), (n = n.slice(2)));
  return (n && t.push(n), t.join(" "));
}
function u1(e) {
  const t = e.trim();
  if (!t) return "";
  let n = t.replace(/[^\d+]/g, "");
  if (
    (n.startsWith("00") && (n = "+" + n.slice(2)),
    /^0\d/.test(n) && (n = "+43" + n.slice(1)),
    !n.startsWith("+"))
  )
    return t;
  if (((n = "+" + n.slice(1).replace(/\+/g, "")), n.startsWith("+43"))) {
    const i = n.slice(3).replace(/^0/, "");
    if (!i) return t;
    let a = 4;
    i.startsWith("1")
      ? (a = 1)
      : (i.startsWith("6") || i.startsWith("7") || i.startsWith("5")) && (a = 3);
    const o = i.slice(0, a),
      l = i.slice(a);
    return `+43 ${o}${l ? " " + cd(l) : ""}`;
  }
  const r = n.slice(1, 3),
    s = n.slice(3);
  return `+${r}${s ? " " + cd(s) : ""}`;
}
function c1(e) {
  if (!e.trim()) return !0;
  const t = e.replace(/\D/g, "");
  return /^[+\d\s()/-]+$/.test(e.trim()) && t.length >= 9 && t.length <= 15;
}
function f1(e) {
  return e.trim() ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim()) : !0;
}
function t0(e) {
  return e
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}
function d1(e) {
  const t = t0(e);
  return t ? /^([\p{L}\d-]+\.)+[\p{L}]{2,}(\/\S*)?$/iu.test(t) : !0;
}
const h1 = 160,
  Ai = {
    phone: "Diese Nummer sieht unvollständig aus. Beispiel: +43 660 123 45 67",
    email: "Bitte prüf die E-Mail-Adresse. Beispiel: anna@berger-immobilien.at",
    web: "Diese Adresse können wir nicht lesen. Beispiel: berger-immobilien.at",
    legal: "Maximal 160 Zeichen, sonst passt die Zeile nicht aufs Briefpapier.",
  };
function p1(e) {
  const t = {};
  return (
    c1(e.phone) || (t.phone = Ai.phone),
    f1(e.email) || (t.email = Ai.email),
    d1(e.web) || (t.web = Ai.web),
    (e.legal ?? "").length > h1 && (t.legal = Ai.legal),
    t
  );
}
function qC(e) {
  const t = p1(e);
  return {
    ...e,
    person: e.person.trim(),
    role: e.role.trim(),
    phone: t.phone ? "" : u1(e.phone),
    email: t.email ? "" : e.email.trim(),
    web: t.web ? "" : t0(e.web),
    street: e.street.trim(),
    city: e.city.trim(),
    legal: t.legal ? "" : (e.legal ?? "").trim(),
  };
}
function XC(e) {
  return e ? !!e.person.trim() && (!!e.phone.trim() || !!e.email.trim()) : !1;
}
function ZC(e) {
  const t = e.trim().split(/\s+/).filter(Boolean);
  return t.length >= 2 && t.length <= 4 ? t.join(" ") : "";
}
function YC(e) {
  return e.replace(/^\s*(A-)?\d{4,5}\s*/i, "").trim();
}
const m1 = [
    {
      key: "playfair",
      family: "Playfair Display",
      pkg: "playfair-display",
      cat: "serif",
      form: "didone",
      weights: [400, 700],
      styles: ["elegant", "luxus"],
      tags: ["edel", "kontrastreich", "klassisch"],
      italics: [400],
    },
    {
      key: "cormorant",
      family: "Cormorant Garamond",
      pkg: "cormorant-garamond",
      cat: "serif",
      form: "antiqua",
      weights: [500, 700],
      styles: ["luxus", "elegant"],
      tags: ["edel", "fein", "klassisch", "zeitlos"],
      italics: [500],
    },
    {
      key: "dmserif",
      family: "DM Serif Display",
      pkg: "dm-serif-display",
      cat: "serif",
      form: "didone",
      weights: [400],
      styles: ["elegant", "warm"],
      tags: ["kräftig", "kontrastreich", "klassisch"],
      italics: [400],
    },
    {
      key: "baskerville",
      family: "Libre Baskerville",
      pkg: "libre-baskerville",
      cat: "serif",
      form: "antiqua",
      weights: [400, 700],
      styles: ["elegant", "natur"],
      tags: ["klassisch", "zeitlos"],
      italics: [400],
    },
    {
      key: "fraunces",
      family: "Fraunces",
      pkg: "fraunces",
      cat: "serif",
      form: "antiqua",
      weights: [400, 600, 800],
      styles: ["warm", "natur"],
      tags: ["rund", "verspielt", "freundlich", "klassisch"],
      italics: [400],
    },
    {
      key: "bodoni",
      family: "Bodoni Moda",
      pkg: "bodoni-moda",
      cat: "serif",
      form: "didone",
      weights: [500, 700],
      styles: ["luxus"],
      tags: ["edel", "kontrastreich", "fein", "klassisch"],
      italics: [500],
    },
    {
      key: "cinzel",
      family: "Cinzel",
      pkg: "cinzel",
      cat: "serif",
      form: "antiqua",
      weights: [500, 700],
      styles: ["luxus", "elegant"],
      capsOnly: !0,
      tags: ["edel", "klassisch", "zeitlos", "versalien"],
    },
    {
      key: "marcellus",
      family: "Marcellus",
      pkg: "marcellus",
      cat: "serif",
      form: "antiqua",
      weights: [400],
      styles: ["luxus", "natur"],
      tags: ["edel", "klassisch", "fein"],
    },
    {
      key: "italiana",
      family: "Italiana",
      pkg: "italiana",
      cat: "serif",
      form: "didone",
      weights: [400],
      styles: ["luxus"],
      tags: ["edel", "fein", "schmal"],
    },
    {
      key: "tenor",
      family: "Tenor Sans",
      pkg: "tenor-sans",
      cat: "sans",
      form: "geometric",
      weights: [400],
      styles: ["luxus", "modern"],
      tags: ["edel", "fein", "modern"],
    },
    {
      key: "inter",
      family: "Inter",
      pkg: "inter",
      cat: "sans",
      form: "grotesk",
      weights: [400, 600],
      styles: ["modern"],
      body: !0,
      tags: ["sachlich", "modern", "zeitlos"],
    },
    {
      key: "manrope",
      family: "Manrope",
      pkg: "manrope",
      cat: "sans",
      form: "grotesk",
      weights: [400, 700],
      styles: ["modern"],
      body: !0,
      tags: ["modern", "geometrisch", "sachlich"],
    },
    {
      key: "montserrat",
      family: "Montserrat",
      pkg: "montserrat",
      cat: "sans",
      form: "geometric",
      weights: [400, 600],
      styles: ["modern", "mutig"],
      body: !0,
      tags: ["geometrisch", "breit", "modern"],
    },
    {
      key: "poppins",
      family: "Poppins",
      pkg: "poppins",
      cat: "sans",
      form: "geometric",
      weights: [400, 600],
      styles: ["modern", "warm"],
      body: !0,
      tags: ["geometrisch", "rund", "freundlich"],
    },
    {
      key: "outfit",
      family: "Outfit",
      pkg: "outfit",
      cat: "sans",
      form: "geometric",
      weights: [400, 600],
      styles: ["modern", "warm"],
      tags: ["geometrisch", "modern", "rund"],
    },
    {
      key: "sora",
      family: "Sora",
      pkg: "sora",
      cat: "sans",
      form: "geometric",
      weights: [400, 600],
      styles: ["modern", "mutig"],
      tags: ["modern", "breit", "technisch"],
    },
    {
      key: "spacegrotesk",
      family: "Space Grotesk",
      pkg: "space-grotesk",
      cat: "sans",
      form: "grotesk",
      weights: [500, 700],
      styles: ["mutig", "modern"],
      tags: ["technisch", "modern", "verspielt"],
    },
    {
      key: "worksans",
      family: "Work Sans",
      pkg: "work-sans",
      cat: "sans",
      form: "grotesk",
      weights: [400, 600],
      styles: ["modern", "natur"],
      body: !0,
      tags: ["sachlich", "zeitlos", "modern"],
    },
    {
      key: "raleway",
      family: "Raleway",
      pkg: "raleway",
      cat: "sans",
      form: "geometric",
      weights: [400, 600],
      styles: ["elegant", "modern"],
      tags: ["fein", "edel", "geometrisch"],
    },
    {
      key: "josefin",
      family: "Josefin Sans",
      pkg: "josefin-sans",
      cat: "sans",
      form: "geometric",
      weights: [400, 600],
      styles: ["elegant", "natur"],
      tags: ["geometrisch", "fein", "edel"],
    },
    {
      key: "urbanist",
      family: "Urbanist",
      pkg: "urbanist",
      cat: "sans",
      form: "geometric",
      weights: [500, 700],
      styles: ["modern"],
      tags: ["geometrisch", "modern"],
    },
    {
      key: "jakarta",
      family: "Plus Jakarta Sans",
      pkg: "plus-jakarta-sans",
      cat: "sans",
      form: "geometric",
      weights: [400, 700],
      styles: ["modern", "warm"],
      body: !0,
      tags: ["modern", "freundlich"],
    },
    {
      key: "syne",
      family: "Syne",
      pkg: "syne",
      cat: "display",
      form: "grotesk",
      weights: [600, 800],
      styles: ["mutig"],
      tags: ["verspielt", "breit", "kräftig"],
    },
    {
      key: "archivo",
      family: "Archivo",
      pkg: "archivo",
      cat: "sans",
      form: "grotesk",
      weights: [400, 800],
      styles: ["mutig"],
      body: !0,
      tags: ["kräftig", "sachlich"],
    },
    {
      key: "nunito",
      family: "Nunito",
      pkg: "nunito",
      cat: "sans",
      form: "geometric",
      weights: [400, 800],
      styles: ["warm"],
      body: !0,
      tags: ["rund", "freundlich"],
    },
    {
      key: "quicksand",
      family: "Quicksand",
      pkg: "quicksand",
      cat: "sans",
      form: "geometric",
      weights: [500, 700],
      styles: ["warm", "natur"],
      tags: ["rund", "fein", "freundlich"],
    },
    {
      key: "comfortaa",
      family: "Comfortaa",
      pkg: "comfortaa",
      cat: "display",
      form: "geometric",
      weights: [400, 700],
      styles: ["warm"],
      tags: ["rund", "verspielt", "geometrisch"],
    },
    {
      key: "bebas",
      family: "Bebas Neue",
      pkg: "bebas-neue",
      cat: "display",
      form: "condensed",
      weights: [400],
      styles: ["mutig"],
      capsOnly: !0,
      tags: ["schmal", "kräftig", "versalien"],
    },
    {
      key: "oswald",
      family: "Oswald",
      pkg: "oswald",
      cat: "display",
      form: "condensed",
      weights: [500, 700],
      styles: ["mutig"],
      tags: ["schmal", "kräftig"],
    },
    {
      key: "parisienne",
      family: "Parisienne",
      pkg: "parisienne",
      cat: "script",
      form: "script",
      weights: [400],
      styles: ["luxus", "elegant"],
      noCaps: !0,
      tags: ["handschriftlich", "edel", "fein"],
    },
    {
      key: "greatvibes",
      family: "Great Vibes",
      pkg: "great-vibes",
      cat: "script",
      form: "script",
      weights: [400],
      styles: ["elegant", "warm"],
      noCaps: !0,
      tags: ["handschriftlich", "verspielt", "edel"],
    },
    {
      key: "lora",
      family: "Lora",
      pkg: "lora",
      cat: "serif",
      form: "antiqua",
      weights: [400, 600],
      styles: ["natur", "warm"],
      body: !0,
      tags: ["klassisch", "zeitlos", "freundlich"],
      italics: [400],
    },
    {
      key: "dmsans",
      family: "DM Sans",
      pkg: "dm-sans",
      cat: "sans",
      form: "geometric",
      weights: [400, 700],
      styles: ["modern", "warm"],
      body: !0,
      tags: ["geometrisch", "modern", "sachlich"],
      italics: [400],
    },
    {
      key: "karla",
      family: "Karla",
      pkg: "karla",
      cat: "sans",
      form: "grotesk",
      weights: [400, 700],
      styles: ["natur"],
      body: !0,
      tags: ["sachlich", "freundlich"],
    },
    {
      key: "lexend",
      family: "Lexend",
      pkg: "lexend",
      cat: "sans",
      form: "geometric",
      weights: [400, 600],
      styles: ["modern"],
      body: !0,
      tags: ["rund", "modern", "sachlich"],
    },
    {
      key: "ebgaramond",
      family: "EB Garamond",
      pkg: "eb-garamond",
      cat: "serif",
      form: "antiqua",
      weights: [400, 600],
      styles: ["elegant", "luxus", "natur", "modern"],
      body: !0,
      tags: ["klassisch", "zeitlos", "edel"],
      italics: [400],
    },
    {
      key: "spectral",
      family: "Spectral",
      pkg: "spectral",
      cat: "serif",
      form: "antiqua",
      weights: [300, 600],
      styles: ["elegant", "natur"],
      body: !0,
      tags: ["fein", "klassisch", "zeitlos"],
      italics: [300],
    },
    {
      key: "newsreader",
      family: "Newsreader",
      pkg: "newsreader",
      cat: "serif",
      form: "antiqua",
      weights: [400, 600],
      styles: ["elegant", "warm", "modern"],
      body: !0,
      tags: ["klassisch", "zeitlos"],
      italics: [400],
    },
    {
      key: "gloock",
      family: "Gloock",
      pkg: "gloock",
      cat: "serif",
      form: "didone",
      weights: [400],
      styles: ["luxus", "elegant", "mutig"],
      tags: ["kontrastreich", "kräftig", "edel"],
    },
    {
      key: "youngserif",
      family: "Young Serif",
      pkg: "young-serif",
      cat: "serif",
      form: "antiqua",
      weights: [400],
      styles: ["warm", "natur"],
      tags: ["kräftig", "rund", "freundlich", "klassisch"],
    },
    {
      key: "instrumentserif",
      family: "Instrument Serif",
      pkg: "instrument-serif",
      cat: "serif",
      form: "antiqua",
      weights: [400],
      styles: ["elegant", "modern", "luxus"],
      tags: ["schmal", "edel", "modern"],
      italics: [400],
    },
    {
      key: "caslon",
      family: "Libre Caslon Display",
      pkg: "libre-caslon-display",
      cat: "serif",
      form: "didone",
      weights: [400],
      styles: ["luxus", "elegant"],
      tags: ["klassisch", "edel", "fein"],
    },
    {
      key: "gilda",
      family: "Gilda Display",
      pkg: "gilda-display",
      cat: "serif",
      form: "didone",
      weights: [400],
      styles: ["luxus", "elegant"],
      tags: ["edel", "fein", "klassisch"],
    },
    {
      key: "castoro",
      family: "Castoro",
      pkg: "castoro",
      cat: "serif",
      form: "antiqua",
      weights: [400],
      styles: ["warm", "natur", "elegant"],
      body: !0,
      tags: ["klassisch", "freundlich", "zeitlos"],
      italics: [400],
    },
    {
      key: "figtree",
      family: "Figtree",
      pkg: "figtree",
      cat: "sans",
      form: "geometric",
      weights: [400, 700],
      styles: ["modern", "warm"],
      body: !0,
      tags: ["geometrisch", "freundlich", "modern"],
    },
    {
      key: "albertsans",
      family: "Albert Sans",
      pkg: "albert-sans",
      cat: "sans",
      form: "geometric",
      weights: [400, 700],
      styles: ["modern", "natur"],
      body: !0,
      tags: ["geometrisch", "sachlich", "modern"],
    },
    {
      key: "hanken",
      family: "Hanken Grotesk",
      pkg: "hanken-grotesk",
      cat: "sans",
      form: "grotesk",
      weights: [400, 700],
      styles: ["modern", "elegant"],
      body: !0,
      tags: ["sachlich", "modern", "zeitlos"],
      italics: [400],
    },
    {
      key: "schibsted",
      family: "Schibsted Grotesk",
      pkg: "schibsted-grotesk",
      cat: "sans",
      form: "grotesk",
      weights: [400, 700],
      styles: ["modern", "mutig"],
      body: !0,
      tags: ["kräftig", "modern", "sachlich"],
      italics: [700],
    },
    {
      key: "familjen",
      family: "Familjen Grotesk",
      pkg: "familjen-grotesk",
      cat: "sans",
      form: "grotesk",
      weights: [400, 700],
      styles: ["modern", "warm"],
      tags: ["modern", "freundlich"],
    },
    {
      key: "mona",
      family: "Mona Sans",
      pkg: "mona-sans",
      cat: "sans",
      form: "grotesk",
      weights: [400, 700],
      styles: ["modern", "mutig"],
      body: !0,
      tags: ["modern", "breit", "sachlich"],
    },
    {
      key: "instrumentsans",
      family: "Instrument Sans",
      pkg: "instrument-sans",
      cat: "sans",
      form: "grotesk",
      weights: [400, 600],
      styles: ["modern", "elegant"],
      body: !0,
      tags: ["schmal", "modern", "sachlich"],
    },
    {
      key: "bricolage",
      family: "Bricolage Grotesque",
      pkg: "bricolage-grotesque",
      cat: "display",
      form: "grotesk",
      weights: [400, 700],
      styles: ["mutig", "warm"],
      tags: ["verspielt", "kräftig", "modern"],
    },
    {
      key: "unbounded",
      family: "Unbounded",
      pkg: "unbounded",
      cat: "display",
      form: "grotesk",
      weights: [400, 700],
      styles: ["mutig"],
      tags: ["breit", "kräftig", "rund"],
    },
    {
      key: "bigshoulders",
      family: "Big Shoulders Display",
      pkg: "big-shoulders-display",
      cat: "display",
      form: "condensed",
      weights: [500, 800],
      styles: ["mutig"],
      capsOnly: !0,
      tags: ["schmal", "kräftig", "versalien"],
    },
    {
      key: "fjalla",
      family: "Fjalla One",
      pkg: "fjalla-one",
      cat: "display",
      form: "condensed",
      weights: [400],
      styles: ["mutig"],
      tags: ["schmal", "kräftig"],
    },
    {
      key: "pinyon",
      family: "Pinyon Script",
      pkg: "pinyon-script",
      cat: "script",
      form: "script",
      weights: [400],
      styles: ["luxus", "elegant"],
      noCaps: !0,
      tags: ["handschriftlich", "edel", "klassisch"],
    },
    {
      key: "allura",
      family: "Allura",
      pkg: "allura",
      cat: "script",
      form: "script",
      weights: [400],
      styles: ["elegant", "warm"],
      noCaps: !0,
      tags: ["handschriftlich", "freundlich"],
    },
    {
      key: "italianno",
      family: "Italianno",
      pkg: "italianno",
      cat: "script",
      form: "script",
      weights: [400],
      styles: ["elegant", "natur"],
      noCaps: !0,
      tags: ["handschriftlich", "fein", "schmal"],
    },
    {
      key: "notoserifdisplay",
      family: "Noto Serif Display",
      pkg: "noto-serif-display",
      cat: "serif",
      form: "didone",
      weights: [400, 600],
      styles: ["luxus", "elegant", "modern", "mutig"],
      tags: ["edel", "kontrastreich", "fein"],
      italics: [400],
    },
    {
      key: "librebodoni",
      family: "Libre Bodoni",
      pkg: "libre-bodoni",
      cat: "serif",
      form: "didone",
      weights: [500, 700],
      styles: ["luxus", "elegant", "mutig", "modern"],
      tags: ["edel", "kontrastreich", "kräftig", "klassisch"],
      italics: [500],
    },
    {
      key: "ibarra",
      family: "Ibarra Real Nova",
      pkg: "ibarra-real-nova",
      cat: "serif",
      form: "antiqua",
      weights: [400, 600],
      styles: ["luxus", "elegant", "warm", "modern", "natur"],
      tags: ["klassisch", "zeitlos", "edel"],
      italics: [400],
    },
    {
      key: "caslontext",
      family: "Libre Caslon Text",
      pkg: "libre-caslon-text",
      cat: "serif",
      form: "antiqua",
      weights: [400, 700],
      styles: ["elegant", "luxus", "warm"],
      tags: ["klassisch", "zeitlos"],
      body: !0,
      italics: [400],
    },
    {
      key: "crimson",
      family: "Crimson Pro",
      pkg: "crimson-pro",
      cat: "serif",
      form: "antiqua",
      weights: [400, 600],
      styles: ["elegant", "luxus", "natur", "modern"],
      tags: ["klassisch", "fein", "zeitlos"],
      body: !0,
      italics: [400],
    },
    {
      key: "cormorantsc",
      family: "Cormorant SC",
      pkg: "cormorant-sc",
      cat: "serif",
      form: "antiqua",
      weights: [500],
      styles: ["luxus", "elegant"],
      capsOnly: !0,
      tags: ["versalien", "edel", "fein", "klassisch"],
    },
    {
      key: "bellefair",
      family: "Bellefair",
      pkg: "bellefair",
      cat: "serif",
      form: "antiqua",
      weights: [400],
      styles: ["luxus", "elegant"],
      tags: ["fein", "edel", "zeitlos"],
    },
    {
      key: "jost",
      family: "Jost",
      pkg: "jost",
      cat: "sans",
      form: "geometric",
      weights: [300, 500],
      styles: ["luxus", "modern", "elegant", "natur"],
      tags: ["geometrisch", "modern", "zeitlos", "fein"],
      body: !0,
    },
    {
      key: "kumbh",
      family: "Kumbh Sans",
      pkg: "kumbh-sans",
      cat: "sans",
      form: "geometric",
      weights: [400, 600],
      styles: ["modern", "luxus", "elegant"],
      tags: ["geometrisch", "modern", "sachlich"],
      body: !0,
    },
    {
      key: "intertight",
      family: "Inter Tight",
      pkg: "inter-tight",
      cat: "sans",
      form: "grotesk",
      weights: [400, 800],
      styles: ["modern", "mutig", "luxus"],
      tags: ["sachlich", "modern", "kräftig"],
      body: !0,
    },
    {
      key: "geist",
      family: "Geist",
      pkg: "geist",
      cat: "sans",
      form: "grotesk",
      weights: [300, 600],
      styles: ["modern", "elegant", "luxus", "natur"],
      tags: ["sachlich", "modern", "zeitlos"],
      body: !0,
    },
    {
      key: "hostgrotesk",
      family: "Host Grotesk",
      pkg: "host-grotesk",
      cat: "sans",
      form: "grotesk",
      weights: [400, 700],
      styles: ["modern", "mutig", "warm"],
      tags: ["sachlich", "modern", "freundlich"],
      body: !0,
    },
    {
      key: "julius",
      family: "Julius Sans One",
      pkg: "julius-sans-one",
      cat: "sans",
      form: "geometric",
      weights: [400],
      styles: ["luxus", "elegant", "modern"],
      capsOnly: !0,
      tags: ["versalien", "fein", "geometrisch", "edel"],
    },
    {
      key: "abrilfatface",
      family: "Abril Fatface",
      pkg: "abril-fatface",
      cat: "serif",
      form: "didone",
      weights: [400],
      styles: ["mutig", "elegant"],
      tags: ["kontrastreich", "kräftig", "edel"],
    },
    {
      key: "yeseva",
      family: "Yeseva One",
      pkg: "yeseva-one",
      cat: "serif",
      form: "didone",
      weights: [400],
      styles: ["elegant", "warm"],
      tags: ["kontrastreich", "kräftig", "verspielt"],
    },
    {
      key: "rozha",
      family: "Rozha One",
      pkg: "rozha-one",
      cat: "serif",
      form: "didone",
      weights: [400],
      styles: ["mutig", "elegant"],
      tags: ["kontrastreich", "kräftig"],
    },
    {
      key: "oldstandard",
      family: "Old Standard TT",
      pkg: "old-standard-tt",
      cat: "serif",
      form: "didone",
      weights: [400, 700],
      styles: ["elegant", "luxus"],
      tags: ["klassisch", "kontrastreich", "edel"],
      italics: [400],
    },
    {
      key: "rufina",
      family: "Rufina",
      pkg: "rufina",
      cat: "serif",
      form: "antiqua",
      weights: [400, 700],
      styles: ["elegant", "luxus"],
      tags: ["klassisch", "edel"],
    },
    {
      key: "bonanova",
      family: "Bona Nova",
      pkg: "bona-nova",
      cat: "serif",
      form: "antiqua",
      weights: [400, 700],
      styles: ["elegant", "warm", "luxus", "natur"],
      tags: ["klassisch", "edel", "zeitlos"],
      italics: [400],
    },
    {
      key: "brygada",
      family: "Brygada 1918",
      pkg: "brygada-1918",
      cat: "serif",
      form: "antiqua",
      weights: [400, 600],
      styles: ["elegant", "warm", "natur"],
      tags: ["klassisch", "zeitlos", "freundlich"],
      body: !0,
      italics: [400],
    },
    {
      key: "forum",
      family: "Forum",
      pkg: "forum",
      cat: "serif",
      form: "antiqua",
      weights: [400],
      styles: ["luxus", "elegant", "natur"],
      tags: ["edel", "klassisch", "fein"],
    },
    {
      key: "lindenhill",
      family: "Linden Hill",
      pkg: "linden-hill",
      cat: "serif",
      form: "antiqua",
      weights: [400],
      styles: ["elegant", "warm"],
      tags: ["klassisch", "fein"],
      italics: [400],
    },
    {
      key: "sortsmill",
      family: "Sorts Mill Goudy",
      pkg: "sorts-mill-goudy",
      cat: "serif",
      form: "antiqua",
      weights: [400],
      styles: ["elegant", "warm", "natur"],
      tags: ["klassisch", "freundlich"],
      italics: [400],
    },
    {
      key: "poiret",
      family: "Poiret One",
      pkg: "poiret-one",
      cat: "display",
      form: "geometric",
      weights: [400],
      styles: ["elegant", "warm"],
      tags: ["fein", "geometrisch", "verspielt"],
    },
    {
      key: "aboreto",
      family: "Aboreto",
      pkg: "aboreto",
      cat: "display",
      form: "geometric",
      weights: [400],
      styles: ["luxus", "elegant"],
      capsOnly: !0,
      tags: ["versalien", "fein", "edel", "breit"],
    },
    {
      key: "redhat",
      family: "Red Hat Display",
      pkg: "red-hat-display",
      cat: "sans",
      form: "geometric",
      weights: [400, 700],
      styles: ["modern", "luxus", "mutig"],
      tags: ["geometrisch", "modern"],
      body: !0,
    },
    {
      key: "afacad",
      family: "Afacad",
      pkg: "afacad",
      cat: "sans",
      form: "grotesk",
      weights: [400, 600],
      styles: ["modern", "elegant"],
      tags: ["sachlich", "modern", "schmal"],
    },
    {
      key: "epilogue",
      family: "Epilogue",
      pkg: "epilogue",
      cat: "sans",
      form: "grotesk",
      weights: [300, 700],
      styles: ["modern", "mutig"],
      tags: ["modern", "sachlich", "breit"],
      body: !0,
    },
    {
      key: "wixmadefor",
      family: "Wix Madefor Display",
      pkg: "wix-madefor-display",
      cat: "sans",
      form: "grotesk",
      weights: [400, 700],
      styles: ["modern", "mutig"],
      tags: ["modern", "technisch"],
    },
    {
      key: "funnel",
      family: "Funnel Display",
      pkg: "funnel-display",
      cat: "display",
      form: "grotesk",
      weights: [400, 700],
      styles: ["mutig", "modern"],
      tags: ["verspielt", "modern"],
    },
    {
      key: "archivonarrow",
      family: "Archivo Narrow",
      pkg: "archivo-narrow",
      cat: "sans",
      form: "condensed",
      weights: [400, 700],
      styles: ["modern", "mutig"],
      tags: ["schmal", "sachlich"],
    },
    {
      key: "barlowcondensed",
      family: "Barlow Condensed",
      pkg: "barlow-condensed",
      cat: "sans",
      form: "condensed",
      weights: [500, 700],
      styles: ["mutig", "modern"],
      tags: ["schmal", "technisch"],
    },
    {
      key: "antonio",
      family: "Antonio",
      pkg: "antonio",
      cat: "display",
      form: "condensed",
      weights: [400, 700],
      styles: ["mutig", "modern"],
      tags: ["schmal", "kräftig"],
    },
    {
      key: "krona",
      family: "Krona One",
      pkg: "krona-one",
      cat: "display",
      form: "grotesk",
      weights: [400],
      styles: ["mutig", "modern"],
      tags: ["breit", "technisch", "kräftig"],
    },
    {
      key: "dmmono",
      family: "DM Mono",
      pkg: "dm-mono",
      cat: "sans",
      form: "mono",
      weights: [300, 500],
      styles: ["modern"],
      tags: ["technisch", "sachlich"],
    },
    {
      key: "plexmono",
      family: "IBM Plex Mono",
      pkg: "ibm-plex-mono",
      cat: "sans",
      form: "mono",
      weights: [400, 600],
      styles: ["modern", "mutig"],
      tags: ["technisch", "sachlich"],
    },
    {
      key: "geistmono",
      family: "Geist Mono",
      pkg: "geist-mono",
      cat: "sans",
      form: "mono",
      weights: [300, 600],
      styles: ["modern"],
      tags: ["technisch", "modern"],
    },
    {
      key: "zillaslab",
      family: "Zilla Slab",
      pkg: "zilla-slab",
      cat: "serif",
      form: "slab",
      weights: [400, 700],
      styles: ["mutig", "modern", "warm"],
      tags: ["kräftig", "sachlich", "modern"],
      italics: [400],
    },
    {
      key: "rokkitt",
      family: "Rokkitt",
      pkg: "rokkitt",
      cat: "serif",
      form: "slab",
      weights: [400, 700],
      styles: ["mutig", "modern", "warm"],
      tags: ["kräftig", "geometrisch", "klassisch"],
    },
    {
      key: "bigshouldersstencil",
      family: "Big Shoulders Stencil Display",
      pkg: "big-shoulders-stencil-display",
      cat: "display",
      form: "stencil",
      weights: [700],
      styles: ["mutig"],
      capsOnly: !0,
      tags: ["schmal", "kräftig", "versalien", "technisch"],
      nurVorlage: !0,
    },
    {
      key: "sairastencil",
      family: "Saira Stencil One",
      pkg: "saira-stencil-one",
      cat: "display",
      form: "stencil",
      weights: [400],
      styles: ["mutig", "modern"],
      tags: ["technisch", "kräftig"],
      nurVorlage: !0,
    },
    {
      key: "lexendzetta",
      family: "Lexend Zetta",
      pkg: "lexend-zetta",
      cat: "sans",
      form: "extended",
      weights: [300, 600],
      styles: ["modern", "luxus"],
      tags: ["breit", "modern", "sachlich", "versalien"],
      nurVorlageSchnitte: [600],
      capsOnly: !0,
    },
    {
      key: "michroma",
      family: "Michroma",
      pkg: "michroma",
      cat: "display",
      form: "extended",
      weights: [400],
      styles: ["modern", "mutig"],
      tags: ["breit", "technisch"],
      nurVorlage: !0,
    },
    {
      key: "courierprime",
      family: "Courier Prime",
      pkg: "courier-prime",
      cat: "serif",
      form: "mono",
      weights: [400, 700],
      styles: ["modern", "warm"],
      tags: ["technisch", "sachlich", "klassisch"],
      nurVorlage: !0,
    },
    {
      key: "belleza",
      family: "Belleza",
      pkg: "belleza",
      cat: "sans",
      form: "grotesk",
      weights: [400],
      styles: ["elegant", "natur"],
      tags: ["fein", "edel", "zeitlos"],
    },
    {
      key: "playfairsc",
      family: "Playfair Display SC",
      pkg: "playfair-display-sc",
      cat: "serif",
      form: "didone",
      weights: [400, 700],
      styles: ["elegant", "luxus"],
      capsOnly: !0,
      tags: ["versalien", "edel", "kontrastreich", "klassisch"],
      nurVorlage: !0,
    },
    {
      key: "bodonisc",
      family: "Bodoni Moda SC",
      pkg: "bodoni-moda-sc",
      cat: "serif",
      form: "didone",
      weights: [500],
      styles: ["luxus", "elegant"],
      capsOnly: !0,
      tags: ["versalien", "edel", "kontrastreich", "fein"],
      nurVorlage: !0,
    },
  ],
  g1 = { ext: !0, missing: "µ", capSharpS: !0 },
  v1 = { ext: !0, missing: "µ", capSharpS: !0 },
  y1 = { ext: !0, missing: "ĈĉĊċĔĕĜĝĠġĤĥĦħĨĩĬĭĲĳĴĵĸŉŊŋŎŏŜŝŦŧŨũŬŭŴŵŶŷſ", capSharpS: !1 },
  x1 = { ext: !0, missing: "­ŉſ", capSharpS: !0 },
  k1 = { ext: !0, missing: "ŉſ", capSharpS: !0 },
  S1 = { ext: !0, missing: "­", capSharpS: !0 },
  w1 = { ext: !0, missing: "ĈĉĔĕĜĝĤĥĨĩĬĭĴĵĸŉŎŏŜŝŨũŬŭſ", capSharpS: !1 },
  b1 = { ext: !0, missing: "ſȘșȚț", capSharpS: !1 },
  E1 = {
    ext: !1,
    missing:
      " ­ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſȘșȚț€",
    capSharpS: !1,
  },
  T1 = { ext: !0, missing: "²³¹¼½¾ĭĲĳŊŋſ", capSharpS: !1 },
  C1 = { ext: !0, missing: "­ŉ", capSharpS: !0 },
  L1 = { ext: !0, missing: "ĔĕĬĭĲĳĸĿŀŉŎŏſ", capSharpS: !0 },
  F1 = { ext: !0, missing: "­", capSharpS: !0 },
  M1 = { ext: !0, missing: "ĈĉĜĝĤĥĦħĲĳĴĵĸŉŊŋŜŝŦŧſ", capSharpS: !1 },
  N1 = { ext: !0, missing: "­ĈĉĔĕĜĝĤĥĨĩĬĭĴĵĸĿŀŉŎŏŜŝŢţŦŧŨũſ", capSharpS: !0 },
  R1 = { ext: !0, missing: "ĤĥĲĳĸĿŀŉſ", capSharpS: !0 },
  O1 = { ext: !0, missing: "", capSharpS: !0 },
  I1 = { ext: !0, missing: "ŉ", capSharpS: !0 },
  P1 = { ext: !0, missing: "ſ", capSharpS: !0 },
  D1 = { ext: !0, missing: "ſ", capSharpS: !0 },
  U1 = { ext: !0, missing: "ĐđĔĕģĦħĬĭĸĿŀŁłŉŊŋŎŏŦŧſ", capSharpS: !0 },
  A1 = { ext: !0, missing: "­ŉſ", capSharpS: !0 },
  B1 = { ext: !0, missing: "ĈĉĔĕĜĝĤĥĨĩĬĭĴĵĸŉŎŏŜŝŨũŬŭſ", capSharpS: !1 },
  $1 = { ext: !0, missing: "", capSharpS: !0 },
  _1 = { ext: !0, missing: "ĳſ", capSharpS: !0 },
  z1 = { ext: !0, missing: "ſ", capSharpS: !0 },
  j1 = { ext: !0, missing: "ŉ", capSharpS: !0 },
  G1 = { ext: !0, missing: "ſ", capSharpS: !0 },
  H1 = { ext: !0, missing: "­", capSharpS: !0 },
  W1 = { ext: !0, missing: "ſȘșȚț", capSharpS: !1 },
  V1 = { ext: !0, missing: "­ŉſ", capSharpS: !0 },
  K1 = { ext: !0, missing: "­ĸ", capSharpS: !0 },
  q1 = { ext: !0, missing: "­ĈĉĜĝĤĥĴĵĸŉŜŝŦŧſ", capSharpS: !0 },
  X1 = { ext: !0, missing: "­ĈĉĔĕĜĝĤĥĨĩĬĭĴĵĸĿŀŉŎŏŜŝŨũſ", capSharpS: !0 },
  Z1 = { ext: !0, missing: "ſ", capSharpS: !0 },
  Y1 = { ext: !0, missing: "²³¹", capSharpS: !0 },
  Q1 = { ext: !0, missing: "­ŉ", capSharpS: !0 },
  J1 = { ext: !0, missing: "Ĳĳŉſ", capSharpS: !0 },
  ex = { ext: !0, missing: "­ĈĉĔĕĜĝĤĥĨĩĬĭĴĵĸĿŀŉŎŏŜŝŢţŦŧŨũſ", capSharpS: !0 },
  tx = { ext: !0, missing: "­ſ", capSharpS: !0 },
  nx = { ext: !0, missing: "¤¦¬­±²³µ¹¼½¾ĈĉĔĕĜĝĤĥĨĩĬĭĴĵĸĿŀŉŎŏŜŝŢţŦŧŨũſ", capSharpS: !0 },
  rx = { ext: !0, missing: "ſ", capSharpS: !1 },
  sx = { ext: !0, missing: "­ſ", capSharpS: !1 },
  ix = { ext: !0, missing: "ŉ", capSharpS: !0 },
  ax = { ext: !0, missing: "­ĔĕĨĩĬĭĸĿŀŉŎŏŢţŦŧŨũſ", capSharpS: !0 },
  ox = { ext: !0, missing: "ĦħĲĳĸŉŦŧſ", capSharpS: !1 },
  lx = { ext: !0, missing: "ſ", capSharpS: !0 },
  ux = { ext: !0, missing: "­ſ", capSharpS: !0 },
  cx = { ext: !0, missing: "Ĳĳŉſ", capSharpS: !0 },
  fx = { ext: !0, missing: "­µĸŉŎŏſ", capSharpS: !0 },
  dx = { ext: !0, missing: "¤¦¬­±²³µ¹¼½¾ĈĉĔĕĜĝĤĥĨĩĬĭĴĵĸĿŀŉŎŏŜŝŢţŦŧŨũſ", capSharpS: !0 },
  hx = { ext: !0, missing: "¤­ĈĉĔĕĜĝĤĥĬĭĴĵĸĿŀŉŎŏŜŝŢţŦŧſ", capSharpS: !0 },
  px = { ext: !0, missing: "µ", capSharpS: !0 },
  mx = { ext: !0, missing: "Ĳĳŉſ", capSharpS: !0 },
  gx = { ext: !0, missing: "ŉſ", capSharpS: !0 },
  vx = { ext: !0, missing: "­ŉ", capSharpS: !0 },
  yx = { ext: !0, missing: "", capSharpS: !0 },
  xx = { ext: !0, missing: "ĔĕĬĭĲĳĿŀŉŎŏ", capSharpS: !0 },
  kx = { ext: !0, missing: "", capSharpS: !0 },
  Sx = { ext: !0, missing: "ſ", capSharpS: !1 },
  wx = { ext: !0, missing: "ĈĉĔĕĜĝĤĥĨĩĬĭĲĳĸĿŀŉŎŏŜŝŨũŬŭ", capSharpS: !1 },
  bx = { ext: !0, missing: "ſ", capSharpS: !1 },
  Ex = { ext: !0, missing: "ſ", capSharpS: !0 },
  Tx = { ext: !0, missing: "µ", capSharpS: !0 },
  Cx = { ext: !0, missing: "", capSharpS: !0 },
  Lx = { ext: !0, missing: "ſ", capSharpS: !0 },
  Fx = { ext: !0, missing: "Ĭĭ", capSharpS: !0 },
  Mx = { ext: !0, missing: "ŉ", capSharpS: !0 },
  Nx = { ext: !0, missing: "­ĔĕĬĭĸĿŀŉŎŏſ", capSharpS: !0 },
  Rx = { ext: !0, missing: "­ĈĉĜĝĤĥĴĵĸŉŜŝŦŧſ", capSharpS: !0 },
  Ox = {
    ext: !0,
    missing:
      "ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİĲĳĴĵĶķĸĹĺĻļĽľĿŀŃńŅņŇňŉŊŋŌōŎŏŐőŔŕŖŗŘřŚśŜŝŞşŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŹźŻżſȘșȚț",
    capSharpS: !1,
  },
  Ix = { ext: !0, missing: "", capSharpS: !1 },
  Px = { ext: !0, missing: "ĦĲŉŊŋŢţŦŧſ", capSharpS: !1 },
  Dx = { ext: !0, missing: "ª­ºĈĉĤĸŉſȚț", capSharpS: !1 },
  Ux = { ext: !0, missing: "Ĳĳŉſ", capSharpS: !0 },
  Ax = {
    ext: !0,
    missing:
      " ­ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŔŕŖŗŘřŚśŜŝŞşŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŹźŻżſȘșȚț",
    capSharpS: !1,
  },
  Bx = { ext: !0, missing: "ŉſ", capSharpS: !0 },
  $x = { ext: !0, missing: "Ĳĳŉſ", capSharpS: !0 },
  _x = { ext: !0, missing: "ª²³µ¹º¼½¾Ĳĳſ", capSharpS: !1 },
  zx = { ext: !0, missing: "ĸŊŋ", capSharpS: !1 },
  jx = { ext: !0, missing: "ĸŊŋ", capSharpS: !1 },
  Gx = { ext: !0, missing: " ª²³¹º¼½¾ĲĳĸŊŋſȚț", capSharpS: !1 },
  Hx = { ext: !0, missing: "ŉſ", capSharpS: !0 },
  Wx = { ext: !0, missing: "­Ŀŀŉſ", capSharpS: !0 },
  Vx = { ext: !0, missing: "­ŉſ", capSharpS: !0 },
  Kx = { ext: !0, missing: "Ĳĳŉſ", capSharpS: !0 },
  qx = { ext: !0, missing: "ĈĉĔĕĜĝĤĥĬĭĴĵĿŀŉŌōŎŏŖŗŜŝŬŭſ", capSharpS: !0 },
  Xx = { ext: !0, missing: "­µĈĉĔĕĜĝĤĥĨĩĬĭĴĵĸĿŀŉŎŏŜŝŢţŦŧŨũſ", capSharpS: !0 },
  Zx = { ext: !0, missing: "", capSharpS: !0 },
  Yx = { ext: !0, missing: "ĔĕĬĲĸĿŉŎſ", capSharpS: !1 },
  Qx = { ext: !0, missing: "ŉŊŋŢţŦŧſ", capSharpS: !1 },
  Jx = { ext: !0, missing: "ŉſȚț", capSharpS: !1 },
  ek = { ext: !0, missing: "ĈĉĜĝĤĥĦħĲĳĴĵĸŉŊŋŜŝŦŧſ", capSharpS: !1 },
  tk = { ext: !0, missing: "", capSharpS: !0 },
  nk = { ext: !0, missing: "­ĔĕĬĭĲĳĸĿŀŉŎŏſ", capSharpS: !0 },
  rk = { ext: !0, missing: "­ĸſ", capSharpS: !1 },
  sk = { ext: !0, missing: "ſ", capSharpS: !0 },
  ik = { ext: !0, missing: "Ĳĳŉſ", capSharpS: !0 },
  ak = { ext: !0, missing: "", capSharpS: !0 },
  ok = { ext: !0, missing: "ſ", capSharpS: !0 },
  lk = { ext: !0, missing: "­Ţţſ", capSharpS: !0 },
  uk = { ext: !0, missing: "ĸŉſ", capSharpS: !1 },
  ck = { ext: !0, missing: "­ſ", capSharpS: !1 },
  fk = { ext: !0, missing: "µŉ", capSharpS: !0 },
  dk = { ext: !0, missing: "­", capSharpS: !0 },
  hk = {
    playfair: g1,
    cormorant: v1,
    dmserif: y1,
    baskerville: x1,
    fraunces: k1,
    bodoni: S1,
    cinzel: w1,
    marcellus: b1,
    italiana: E1,
    tenor: T1,
    inter: C1,
    manrope: L1,
    montserrat: F1,
    poppins: M1,
    outfit: N1,
    sora: R1,
    spacegrotesk: O1,
    worksans: I1,
    raleway: P1,
    josefin: D1,
    urbanist: U1,
    jakarta: A1,
    syne: B1,
    archivo: $1,
    nunito: _1,
    quicksand: z1,
    comfortaa: j1,
    bebas: G1,
    oswald: H1,
    parisienne: W1,
    greatvibes: V1,
    lora: K1,
    dmsans: q1,
    karla: X1,
    lexend: Z1,
    ebgaramond: Y1,
    spectral: Q1,
    newsreader: J1,
    gloock: ex,
    youngserif: tx,
    instrumentserif: nx,
    caslon: rx,
    gilda: sx,
    castoro: ix,
    figtree: ax,
    albertsans: ox,
    hanken: lx,
    schibsted: ux,
    familjen: cx,
    mona: fx,
    instrumentsans: dx,
    bricolage: hx,
    unbounded: px,
    bigshoulders: mx,
    fjalla: gx,
    pinyon: vx,
    allura: yx,
    italianno: xx,
    notoserifdisplay: kx,
    librebodoni: Sx,
    ibarra: wx,
    caslontext: bx,
    crimson: Ex,
    cormorantsc: Tx,
    bellefair: Cx,
    jost: Lx,
    kumbh: Fx,
    intertight: Mx,
    geist: Nx,
    hostgrotesk: Rx,
    julius: Ox,
    abrilfatface: Ix,
    yeseva: Px,
    rozha: Dx,
    oldstandard: Ux,
    rufina: Ax,
    bonanova: Bx,
    brygada: $x,
    forum: _x,
    lindenhill: zx,
    sortsmill: jx,
    poiret: Gx,
    aboreto: Hx,
    redhat: Wx,
    afacad: Vx,
    epilogue: Kx,
    wixmadefor: qx,
    funnel: Xx,
    archivonarrow: Zx,
    barlowcondensed: Yx,
    antonio: Qx,
    krona: Jx,
    dmmono: ek,
    plexmono: tk,
    geistmono: nk,
    zillaslab: rk,
    rokkitt: sk,
    bigshouldersstencil: ik,
    sairastencil: ak,
    lexendzetta: ok,
    michroma: lk,
    courierprime: uk,
    belleza: ck,
    playfairsc: fk,
    bodonisc: dk,
  },
  Mn = m1,
  pk = Mn.filter((e) => !e.nurVorlage).map((e) => {
    var t;
    return (t = e.nurVorlageSchnitte) != null && t.length
      ? { ...e, weights: e.weights.filter((n) => !e.nurVorlageSchnitte.includes(n)) }
      : e;
  }),
  n0 = new Map(pk.map((e) => [e.key, e]));
function QC(e) {
  return n0.get(e) ?? Yn(e);
}
function JC(e) {
  var n;
  const t = n0.get(e.key);
  return t
    ? e.style === "italic"
      ? !!((n = t.italics) != null && n.includes(e.weight))
      : t.weights.includes(e.weight)
    : !1;
}
const eL = [
    "montserrat",
    "poppins",
    "inter",
    "raleway",
    "nunito",
    "oswald",
    "playfair",
    "worksans",
  ],
  tL = ["haus", "dach", "schluessel", "tuer", "stadt"],
  mk = new Map(Mn.map((e) => [e.key, e]));
function Yn(e) {
  const t = mk.get(e);
  if (!t) throw new Error(`Unbekannte Schrift: ${e}`);
  return t;
}
function gk(e) {
  return `${Yn(e.key).pkg}-latin-${e.weight}-${e.style === "italic" ? "italic" : "normal"}.woff`;
}
function vk(e) {
  return `${e.key}@${e.weight}${e.style === "italic" ? "i" : ""}`;
}
function nL(e) {
  var n;
  const t = Yn(e);
  return t.cat === "serif" && !!((n = t.italics) != null && n.length);
}
function rL(e, t) {
  const n = Yn(e).italics;
  if (!(n != null && n.length)) return null;
  const r =
    t === void 0 ? n[0] : n.reduce((s, i) => (Math.abs(i - t) < Math.abs(s - t) ? i : s), n[0]);
  return { key: e, weight: r, style: "italic" };
}
function sL(e, t) {
  var n;
  return !(t ?? "").includes("ß") || !!((n = go[e]) != null && n.capSharpS);
}
const go = hk;
function yk(e) {
  var t;
  return (t = go[e.key]) != null && t.ext
    ? `${Yn(e.key).pkg}-latin-ext-${e.weight}-${e.style === "italic" ? "italic" : "normal"}.woff`
    : null;
}
const Bi = (e, t) => e.family.localeCompare(t.family, "de"),
  iL = [
    { key: "serif", label: "Serif", fonts: Mn.filter((e) => e.cat === "serif").sort(Bi) },
    { key: "grotesk", label: "Grotesk", fonts: Mn.filter((e) => e.cat === "sans").sort(Bi) },
    { key: "display", label: "Display", fonts: Mn.filter((e) => e.cat === "display").sort(Bi) },
    {
      key: "script",
      label: "Schreibschrift",
      fonts: Mn.filter((e) => e.cat === "script").sort(Bi),
    },
  ];
function aL(e) {
  const t = Yn(e).cat;
  return t === "sans" ? "grotesk" : t;
}
function xk() {
  const e = [];
  for (let t = 32; t <= 126; t++) e.push(t);
  for (let t = 160; t <= 255; t++) t !== 173 && e.push(t);
  for (let t = 256; t <= 383; t++) e.push(t);
  return (
    e.push(536, 537, 538, 539, 8211, 8212, 8216, 8217, 8218, 8220, 8221, 8222, 8230, 8364),
    new Set(e.map((t) => String.fromCodePoint(t)))
  );
}
const kk = xk();
function pi(e, t) {
  var s;
  const n = [],
    r = t ? (((s = go[t]) == null ? void 0 : s.missing) ?? "") : "";
  for (const i of Array.from(e.normalize("NFC")))
    /^[ \t\n\r]$/.test(i) || n.includes(i) || ((!kk.has(i) || (r && r.includes(i))) && n.push(i));
  return n;
}
function oL(e, ...t) {
  for (const n of t) {
    if (!n) continue;
    const r = `${n}${n.toLocaleUpperCase("de-AT")}${n.toLocaleLowerCase("de-AT")}`;
    if (pi(r, e).length) return !1;
  }
  return !0;
}
function Sk(e) {
  for (const t of e.normalize("NFC")) {
    const n = t.codePointAt(0) ?? 0;
    if (n === 223) return !0;
    if (
      !(n <= 255 || (n >= 8192 && n <= 8303)) &&
      ![305, 338, 339, 699, 700, 710, 730, 732, 8364, 8482, 8722, 65279].includes(n) &&
      ((n >= 256 && n <= 591) ||
        (n >= 7680 && n <= 7935) ||
        (n >= 11360 && n <= 11391) ||
        (n >= 42784 && n <= 43007))
    )
      return !0;
  }
  return !1;
}
const wk = 40,
  bk = {
    empty: "Bitte gib einen Namen ein. Er kommt in dein Logo.",
    long: "Das sind mehr als 40 Zeichen. Kürzere Namen wirken im Logo stärker.",
    chars: "Bitte verwende Buchstaben. Zahlen und & sind auch erlaubt.",
    glyphs:
      "Diese Zeichen können unsere Logo-Schriften nicht darstellen. Bitte schreib den Namen mit lateinischen Buchstaben.",
  };
function Ek(e) {
  const t = [];
  let n = 0,
    r = 0;
  for (const o of e)
    new RegExp("\\p{M}", "u").test(o)
      ? n++
      : /[\p{Cc}\p{Cf}\p{Z}]/u.test(o) || !/[\p{L}\p{N}\p{P}\p{S}]/u.test(o)
        ? r++
        : t.push(`„${o}“`);
  const s = t.slice(0, 4);
  (n &&
    s.push(
      n === 1
        ? "ein aufgesetztes Zeichen über oder unter einem Buchstaben"
        : "aufgesetzte Zeichen über oder unter Buchstaben",
    ),
    r && s.push(r === 1 ? "ein unsichtbares Steuerzeichen" : "unsichtbare Steuerzeichen"));
  const i = t.length + n + r > 1;
  return {
    list: s.length > 1 ? `${s.slice(0, -1).join(", ")} und ${s[s.length - 1]}` : (s[0] ?? ""),
    plural: i,
  };
}
function ou(e, t, n = "den Namen") {
  if (e !== "glyphs") return bk[e];
  const { list: r, plural: s } = Ek(pi(t.trim()));
  return `Unsere Logo-Schriften können ${s ? "diese Zeichen" : "dieses Zeichen"} nicht darstellen: ${r}. Bitte schreib ${n} mit lateinischen Buchstaben. Umlaute und Akzente wie ä, é oder č sind möglich.`;
}
const ua = (e) => e.replace(/[\u2012-\u2015\u2212]/g, "-");
function Tk(e) {
  const t = e.trim();
  return t
    ? t.length > wk
      ? "long"
      : /[\p{L}\p{N}]/u.test(t)
        ? pi(t).length
          ? "glyphs"
          : null
        : "chars"
    : "empty";
}
const fd = String.raw`(?:GmbH|GesbR|KG|OG|AG|e\.\s?U\.|Co\.?)`,
  Ck = new RegExp(String.raw`(?:^|[\s,]+)(${fd}(?:\s*(?:&|und|,)?\s*${fd})*)\s*$`, "u");
function vo(e) {
  const t = e.trim(),
    n = Ck.exec(t);
  if (!n) return null;
  const r = t
    .slice(0, n.index)
    .replace(/[\s,&-]+$/u, "")
    .trim();
  return r ? { form: n[1].trim(), stripped: r } : null;
}
function Lk(e) {
  const t = { ä: "ae", ö: "oe", ü: "ue", ß: "ss", Ä: "ae", Ö: "oe", Ü: "ue" };
  return (
    e
      .replace(/[äöüßÄÖÜ]/g, (n) => t[n])
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/&/g, "und")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "marke"
  );
}
const lL = (e) => String(e).padStart(3, "0");
function Fk(e, t = Date.now()) {
  const n = new Date(e),
    r = new Date(t),
    s = `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`,
    i = (o) => new Date(o.getFullYear(), o.getMonth(), o.getDate()).getTime(),
    a = Math.round((i(r) - i(n)) / 864e5);
  return a === 0
    ? `HEUTE, ${s}`
    : a === 1
      ? `GESTERN, ${s}`
      : `${String(n.getDate()).padStart(2, "0")}.${String(n.getMonth() + 1).padStart(2, "0")}.${n.getFullYear()}, ${s}`;
}
function Mk(e) {
  return pi(e.trim()).length ? ou("glyphs", e, "den Zusatz") : null;
}
const Nk = ["wohnen", "haeuser", "luxus", "anleger", "gewerbe", "neubau", "land"],
  r0 = 1,
  Rk = ["Immobilien", "Real Estate", "Immobilienberatung", "none", "custom"],
  uL = ["logo", "visitenkarte", "instagram", "schild", "unio-flyer"],
  cL = ["full", "upper", "surname", "stacked", "initial", "monogram", "district"];
function Ok(e, t) {
  const n = { ...e };
  return (t ? (n.nameKind = t) : delete n.nameKind, n);
}
function fL(e) {
  const t = (a, o) => (a ?? "").trim().slice(0, o),
    n = [...new Set((e.keywords ?? []).map((a) => t(a, 40)).filter(Boolean))].slice(0, 7),
    r = [...new Set((e.focus ?? []).filter((a) => Nk.includes(a)))],
    s = t(e.person, 80),
    i = t(e.company, 80);
  if (!(!n.length && !r.length && !s && !i))
    return { ...(s ? { person: s } : {}), ...(i ? { company: i } : {}), keywords: n, focus: r };
}
const dL = (e) => ({
  rawName: e.rawName,
  legalForm: e.legalForm,
  legalFormInLogo: e.legalFormInLogo,
  suffixChoice: e.suffixChoice,
  input: e.input,
  pinned: e.pinned,
});
function hL(e, t, n) {
  const r = i0(t.suffix),
    s = l0(e, {
      rawName: t.name,
      suffixChoice: r.choice,
      customSuffix: r.custom,
      keepLegalForm: !0,
      nameKind: t.kind,
    });
  return { ...s, pinned: n, ui: { ...s.ui, galleryCount: 6, lastConceptIndex: 0 } };
}
function s0(e, t) {
  return e === "none" ? "" : e === "custom" ? t.trim().slice(0, 30) : e;
}
function i0(e) {
  const t = (e ?? "").trim();
  return t
    ? Rk.includes(t)
      ? { choice: t, custom: "" }
      : { choice: "custom", custom: t }
    : { choice: "none", custom: "" };
}
function a0(e, t) {
  const n = vo(e);
  return n && !t ? n.stripped : e.trim();
}
function o0() {
  const e = Math.random().toString(36).slice(2, 8);
  return `${Date.now().toString(36)}${e}`;
}
function Ik(e, t = Date.now(), n = o0()) {
  var i;
  const r = vo(e.rawName),
    s = {
      name: a0(e.rawName, e.keepLegalForm),
      suffix: s0(e.suffixChoice, e.customSuffix),
      tagline: "",
      styles: [],
      colorMoods: [],
      themes: [],
      ...((i = e.place) != null && i.trim() ? { place: e.place.trim().slice(0, 60) } : {}),
      ...(e.nameKind ? { nameKind: e.nameKind } : {}),
    };
  return {
    id: n,
    schemaVersion: r0,
    createdAt: t,
    updatedAt: t,
    input: s,
    contact: e0(),
    favorites: [],
    selected: null,
    rawName: e.rawName.trim(),
    legalForm: (r == null ? void 0 : r.form) ?? null,
    legalFormInLogo: e.keepLegalForm,
    suffixChoice: e.suffixChoice,
    styleChoice: null,
    seed: (t ^ Math.floor(Math.random() * 16777215)) >>> 0,
    showTaglineInLogo: !1,
    wordmarkOnly: !1,
    nameFormats: [],
    templateSet: "unio",
    templateChosen: !1,
    object: null,
    nameCandidates: [],
    pinned: null,
    numbers: {},
    editing: null,
    selectedBaseId: null,
    kitDone: !1,
    contactSaved: !1,
    firstEditToastShown: !1,
    persistRequested: !1,
    ui: {
      route: `#/p/${n}/stil`,
      editorTab: "symbol",
      galleryCount: 6,
      previewMode: "logo",
      lastConceptIndex: 0,
    },
  };
}
function l0(e, t) {
  const n = vo(t.rawName);
  return {
    ...e,
    rawName: t.rawName.trim(),
    legalForm: (n == null ? void 0 : n.form) ?? null,
    legalFormInLogo: t.keepLegalForm,
    suffixChoice: t.suffixChoice,
    input: Ok(
      Pk(
        {
          ...e.input,
          name: a0(t.rawName, t.keepLegalForm),
          suffix: s0(t.suffixChoice, t.customSuffix),
        },
        t.place,
      ),
      t.nameKind,
    ),
  };
}
function Pk(e, t) {
  if (t === void 0) return e;
  const n = { ...e };
  return (t.trim() ? (n.place = t.trim().slice(0, 60)) : delete n.place, n);
}
function pL(e, t) {
  const n = t === "mix" ? [] : [t],
    r = e.styleChoice === t;
  return {
    ...e,
    styleChoice: t,
    input: { ...e.input, styles: n },
    ui: {
      ...e.ui,
      galleryCount: r ? e.ui.galleryCount : 6,
      lastConceptIndex: r ? e.ui.lastConceptIndex : 0,
    },
  };
}
function mL(e, t) {
  return {
    ...e,
    wordmarkOnly: t.wordmarkOnly,
    nameFormats: t.nameFormats ?? e.nameFormats,
    input: { ...e.input, styles: t.styles, colorMoods: t.colorMoods, themes: t.themes },
    ui: { ...e.ui, galleryCount: 6, lastConceptIndex: 0 },
  };
}
const u0 = (e, t) => e.favorites.some((n) => n.id === t);
function gL(e, t, n) {
  return u0(e, t.id)
    ? { ...e, favorites: e.favorites.filter((r) => r.id !== t.id) }
    : { ...e, favorites: [...e.favorites, t], numbers: { ...e.numbers, [t.id]: n } };
}
function vL(e, t, n) {
  if (e.editing && e.editing.baseId === t.id) return e;
  const r = { ...e.numbers, [t.id]: n };
  return e.selected && e.selectedBaseId === t.id
    ? {
        ...e,
        numbers: r,
        editing: {
          baseId: t.id,
          baseNo: n,
          base: t,
          concept: e.selected,
          edited: e.selected.id !== t.id,
        },
      }
    : { ...e, numbers: r, editing: { baseId: t.id, baseNo: n, base: t, concept: t, edited: !1 } };
}
function yL(e, t) {
  if (!e.editing) return e;
  const n = { ...e.editing, concept: t, edited: t.id !== e.editing.baseId },
    r = u0(e, n.baseId) ? e.favorites : [...e.favorites, n.base];
  return {
    ...e,
    editing: n,
    favorites: r,
    selected: t,
    selectedBaseId: n.baseId,
    numbers: { ...e.numbers, [t.id]: n.baseNo },
  };
}
function xL(e) {
  return e.editing ? { ...e, selected: e.editing.concept, selectedBaseId: e.editing.baseId } : e;
}
function Dk(e) {
  return e.kitDone
    ? "Brand Kit fertig"
    : e.selected || e.editing
      ? "Logo ausgewählt"
      : e.styleChoice
        ? "Stil gewählt"
        : "Name eingegeben";
}
function Uk(e, t = Date.now(), n = o0()) {
  const r = JSON.parse(JSON.stringify(e));
  return (
    (r.id = n),
    (r.createdAt = t),
    (r.updatedAt = t),
    (r.rawName = `${e.rawName} (Kopie)`),
    (r.ui = { ...r.ui, route: r.ui.route.replace(`/p/${e.id}/`, `/p/${n}/`) }),
    r
  );
}
function kL(e) {
  const t = { ...e0(), ...e.contact };
  return (!t.legal && e.legalForm && !e.legalFormInLogo && (t.legal = e.rawName), t);
}
function lr(e) {
  return e.rawName || e.input.name;
}
const _a = "unio-brand:project:",
  Fc = "unio-brand:index",
  Ak = "unio-brand-studio",
  Bk = ".unio-brand.json";
function $k() {
  try {
    const e = window.localStorage,
      t = "unio-brand:probe";
    return (e.setItem(t, "1"), e.removeItem(t), e);
  } catch {
    return null;
  }
}
function _k(e) {
  return JSON.stringify(e);
}
function Mc(e) {
  const t = e.getItem(Fc);
  if (!t) return [];
  const n = JSON.parse(t);
  return Array.isArray(n) ? n.filter((r) => typeof r == "string") : [];
}
function zk(e, t) {
  e.setItem(_a + t.id, _k(t));
  const n = Mc(e);
  n.includes(t.id) || e.setItem(Fc, JSON.stringify([...n, t.id]));
}
function jk(e, t) {
  (e.removeItem(_a + t), e.setItem(Fc, JSON.stringify(Mc(e).filter((n) => n !== t))));
}
function Gk(e) {
  const t = e == null ? void 0 : e.name;
  return t === "QuotaExceededError" || t === "NS_ERROR_DOM_QUOTA_REACHED";
}
function Hk(e, t = Date.now()) {
  return JSON.stringify({ kind: Ak, version: r0, exportedAt: t, project: e }, null, 2);
}
class Wk extends Error {}
const dd = {
    foreign:
      "Diese Datei ist keine Brand-Studio-Sicherung. Wähle eine Datei, die auf .unio-brand.json endet.",
    invalid:
      "Diese Sicherung enthält ungültige oder veränderte Daten und wurde deshalb nicht geöffnet. Nimm eine Sicherung, die du direkt im Brand Studio heruntergeladen hast.",
  },
  Vk = ["symbol", "schrift", "farbe", "aufbau"];
function Kk(e) {
  return e === "schriftdetails"
    ? { tab: "schrift", feinheiten: !0 }
    : e === "anordnung"
      ? { tab: "aufbau" }
      : e === "text"
        ? { tab: "aufbau", texte: !0 }
        : { tab: e && Vk.includes(e) ? e : "symbol" };
}
const qk = 6;
function wn(e) {
  const t = e.replace(/^#/, ""),
    [n, r = ""] = t.split("?"),
    s = new URLSearchParams(r),
    i = n.split("/").filter(Boolean).map(decodeURIComponent);
  if (i.length === 0) return { name: "home" };
  if (i[0] === "neu" && i[1] === "name" && i.length === 2) return { name: "new" };
  if (i[0] === "kompass") {
    if (i.length === 1) return { name: "kompass", step: 1 };
    if (i[1] === "routen" && i.length === 2) return { name: "routen" };
    const a = Number(i[1]);
    return i.length === 2 && Number.isInteger(a) && a >= 1 && a <= qk
      ? { name: "kompass", step: a }
      : { name: "kompass", step: 1 };
  }
  if (i[0] === "neu" && (i.length === 1 || (i[1] === "namen" && i.length === 2))) {
    const a = (s.get("art") ?? "").split(",").filter((u) => /^[a-z-]{1,30}$/.test(u)),
      o = s.get("name"),
      l = { name: "names", gemerkt: s.get("ansicht") === "gemerkt", kinds: a };
    return (
      o &&
        /^[A-Za-z0-9_:.|-]{1,120}$/.test(o) &&
        ((l.detail = o), s.get("mehr") === "1" && (l.mehr = !0)),
      l
    );
  }
  if (i[0] === "p" && i[1]) {
    const a = i[1];
    switch (i[2]) {
      case "name":
        return { name: "name", id: a };
      case "stil":
        return { name: "stil", id: a };
      case "auswahl":
        return { name: "auswahl", id: a, gemerkt: s.get("ansicht") === "gemerkt" };
      case "logo": {
        if (!i[3]) break;
        const o = Kk(s.get("tab")),
          l = { name: "logo", id: a, conceptId: i[3], tab: o.tab };
        return (
          (o.texte || s.get("texte") === "1") && (l.texte = !0),
          o.feinheiten && (l.feinheiten = !0),
          l
        );
      }
      case "kit":
        return { name: "kit", id: a };
      case "postings": {
        const o = { name: "postings", id: a },
          l = s.get("objekt"),
          u = s.get("anlass");
        return (
          l && /^[a-z0-9]{4,40}$/.test(l) && (o.objekt = l),
          u && /^[a-z-]{2,20}$/.test(u) && (o.anlass = u),
          o
        );
      }
      case "objekte": {
        const o = s.get("objekt");
        return o && /^[a-z0-9]{4,40}$/.test(o)
          ? { name: "objekte", id: a, objekt: o }
          : { name: "objekte", id: a };
      }
    }
  }
  return { name: "home" };
}
function za(e) {
  switch (e.name) {
    case "home":
      return "#/";
    case "new":
      return "#/neu/name";
    case "kompass":
      return e.step > 1 ? `#/kompass/${e.step}` : "#/kompass";
    case "routen":
      return "#/kompass/routen";
    case "names": {
      const t = new URLSearchParams();
      (e.kinds.length && t.set("art", e.kinds.join(",")),
        e.gemerkt && t.set("ansicht", "gemerkt"),
        e.detail && (t.set("name", e.detail), e.mehr && t.set("mehr", "1")));
      const n = t.toString().replace(/%2C/g, ",");
      return `#/neu/namen${n ? `?${n}` : ""}`;
    }
    case "name":
    case "stil":
    case "kit":
      return `#/p/${encodeURIComponent(e.id)}/${e.name}`;
    case "auswahl":
      return `#/p/${encodeURIComponent(e.id)}/auswahl${e.gemerkt ? "?ansicht=gemerkt" : ""}`;
    case "postings": {
      const t = [e.objekt ? `objekt=${e.objekt}` : "", e.anlass ? `anlass=${e.anlass}` : ""]
        .filter(Boolean)
        .join("&");
      return `#/p/${encodeURIComponent(e.id)}/postings${t ? `?${t}` : ""}`;
    }
    case "objekte":
      return `#/p/${encodeURIComponent(e.id)}/objekte${e.objekt ? `?objekt=${e.objekt}` : ""}`;
    case "logo":
      return `#/p/${encodeURIComponent(e.id)}/logo/${encodeURIComponent(e.conceptId)}${e.tab !== "symbol" ? `?tab=${e.tab}` : ""}${e.texte ? `${e.tab !== "symbol" ? "&" : "?"}texte=1` : ""}`;
  }
}
const qo = {
  home: "Deine Marken",
  new: "Name",
  kompass: "Markenkompass",
  routen: "Drei Richtungen",
  names: "Namen finden",
  name: "Name",
  stil: "Stil",
  auswahl: "Auswahl",
  logo: "Feinschliff",
  kit: "Brand Kit",
  postings: "Postings",
  objekte: "Objekte",
};
function lu(e) {
  switch (e.name) {
    case "new":
    case "names":
    case "name":
      return 1;
    case "stil":
      return 2;
    case "auswahl":
      return 3;
    case "logo":
      return 4;
    case "kit":
      return 5;
    default:
      return 0;
  }
}
function Xk(e, t) {
  switch (t.type) {
    case "load":
      return {
        loaded: !0,
        loadError: t.error,
        projects: Object.fromEntries(t.projects.map((n) => [n.id, n])),
      };
    case "upsert":
      return { ...e, projects: { ...e.projects, [t.project.id]: t.project } };
    case "remove": {
      const n = { ...e.projects };
      return (delete n[t.id], { ...e, projects: n });
    }
  }
}
const Nc = C.createContext(null);
function Zt() {
  const e = C.useContext(Nc);
  if (!e) throw new Error("StudioProvider fehlt");
  return e;
}
const c0 = new Map();
let Xo = !1,
  hd = 0,
  Zo = !1;
function uu() {
  return (
    Zo ||
      ((Zo = !0),
      setTimeout(() => {
        ((Zo = !1), (hd += 1));
      }, 0)),
    hd
  );
}
let f0 = -1;
function Zk() {
  const [e, t] = C.useState(() => wn(location.hash)),
    [n, r] = C.useState(!1);
  C.useEffect(() => {
    const i = () => {
      const a = !Xo;
      if (((Xo = !1), !a)) return t((o) => (za(o) === location.hash ? o : wn(location.hash)));
      (r(a), t(wn(location.hash)));
    };
    return (
      window.addEventListener("hashchange", i),
      () => window.removeEventListener("hashchange", i)
    );
  }, []);
  const s = C.useCallback((i, a = {}) => {
    f0 = uu();
    const o = za(i);
    if ((c0.set(location.hash || "#/", window.scrollY), o === location.hash)) {
      t(wn(o));
      return;
    }
    a.replace
      ? (history.replaceState(null, "", o), r(!1), t(wn(o)))
      : ((Xo = !0), (location.hash = o), r(!1), t(wn(o)));
  }, []);
  return { route: e, navigate: s, isBack: n };
}
function Yk(e) {
  return c0.get(e);
}
function Qk({ children: e, store: t }) {
  const n = C.useRef(t === void 0 ? $k() : t),
    r = !!n.current,
    [s, i] = C.useReducer(Xk, { projects: {}, loaded: !1, loadError: !1 }),
    [a, o] = C.useState("idle"),
    [l, u] = C.useState(!1),
    [c, f] = C.useState(!1),
    [d, h] = C.useState(null),
    [m, x] = C.useState(!1),
    k = C.useRef(new Set()),
    p = C.useRef(new Set()),
    g = C.useRef(void 0),
    v = C.useRef(s);
  v.current = s;
  const S = C.useRef(new Set()),
    b = C.useRef(!1);
  C.useEffect(() => {
    const j = n.current;
    if (!j) {
      i({ type: "load", projects: [], error: !1 });
      return;
    }
    let Z = [];
    try {
      Z = Mc(j);
    } catch {
      i({ type: "load", projects: [], error: !0 });
      return;
    }
    if (!Z.length) {
      i({ type: "load", projects: [], error: !1 });
      return;
    }
    bt(
      async () => {
        const { loadAll: fe } = await import("./migrate-yTmcZ5Wq.js");
        return { loadAll: fe };
      },
      __vite__mapDeps([0, 1, 2, 3]),
      import.meta.url,
    )
      .then(({ loadAll: fe }) => {
        const ke = fe(j);
        i({ type: "load", projects: ke.projects, error: !1 });
      })
      .catch(() => i({ type: "load", projects: [], error: !0 }));
  }, []);
  const L = C.useCallback(() => {
      (window.clearTimeout(g.current), (g.current = void 0));
      const j = n.current;
      if (!j || (!k.current.size && !p.current.size)) return;
      const Z = performance.now();
      o("saving");
      try {
        for (const ke of p.current) jk(j, ke);
        p.current.clear();
        for (const ke of k.current) {
          const xr = v.current.projects[ke];
          xr && (S.current.add(_a + ke), zk(j, xr));
        }
        k.current.clear();
        const fe = Math.max(0, 400 - (performance.now() - Z));
        window.setTimeout(() => o((ke) => (ke === "saving" ? "saved" : ke)), fe);
      } catch (fe) {
        (o("error"), Gk(fe) && !b.current && ((b.current = !0), u(!0)));
      }
    }, []),
    T = C.useRef(0),
    E = C.useCallback(
      (j = !1) => {
        (window.clearTimeout(g.current), T.current || (T.current = performance.now()));
        const Z = performance.now() - T.current,
          fe = j ? 0 : Math.max(0, Math.min(500, 900 - Z));
        g.current = window.setTimeout(() => {
          ((T.current = 0), L());
        }, fe);
      },
      [L],
    );
  C.useEffect(() => {
    const j = () => {
      document.visibilityState === "hidden" && L();
    };
    return (
      document.addEventListener("visibilitychange", j),
      window.addEventListener("pagehide", L),
      () => {
        (document.removeEventListener("visibilitychange", j),
          window.removeEventListener("pagehide", L));
      }
    );
  }, [L]);
  const I = Zk(),
    P = "id" in I.route ? I.route.id : void 0;
  C.useEffect(() => {
    const j = (Z) => {
      !Z.key || !P || (Z.key === _a + P && x(!0));
    };
    return (window.addEventListener("storage", j), () => window.removeEventListener("storage", j));
  }, [P]);
  const q = C.useCallback(
      (j, Z, fe = !0) => {
        const ke = v.current.projects[j];
        if (!ke) return;
        const xr = Z(ke);
        if (xr === ke) return;
        const Qc = fe ? { ...xr, updatedAt: Date.now() } : xr;
        ((v.current = { ...v.current, projects: { ...v.current.projects, [j]: Qc } }),
          i({ type: "upsert", project: Qc }),
          k.current.add(j),
          E());
      },
      [E],
    ),
    Q = C.useCallback(
      (j) => {
        ((v.current = { ...v.current, projects: { ...v.current.projects, [j.id]: j } }),
          i({ type: "upsert", project: j }),
          k.current.add(j.id),
          E(!0));
      },
      [E],
    ),
    te = C.useCallback(
      (j) => {
        const Z = { ...v.current.projects };
        (delete Z[j],
          (v.current = { ...v.current, projects: Z }),
          i({ type: "remove", id: j }),
          k.current.delete(j),
          p.current.add(j),
          L());
      },
      [L],
    ),
    [ee, ae] = C.useState(null),
    oe = C.useRef(0),
    le = C.useCallback((j, Z, fe) => {
      ((oe.current += 1),
        ae({ id: oe.current, text: j, action: Z, action2: fe, at: Date.now(), task: uu() }));
    }, []),
    O = I.route.name;
  C.useEffect(() => {
    const j = uu();
    ae((Z) => (Z && Z.task !== f0 && Z.task !== j ? null : Z));
  }, [O]);
  const [B, R] = C.useState({ polite: "", assertive: "" }),
    A = C.useCallback((j, Z = !1) => {
      (R((fe) => (Z ? { ...fe, assertive: "" } : { ...fe, polite: "" })),
        window.setTimeout(
          () => R((fe) => (Z ? { ...fe, assertive: j } : { ...fe, polite: j })),
          60,
        ));
    }, []),
    H = C.useRef(!1),
    He = C.useCallback(() => {
      var j, Z;
      if (!H.current) {
        H.current = !0;
        try {
          (Z = (j = navigator.storage) == null ? void 0 : j.persist) == null ||
            Z.call(j).catch(() => {});
        } catch {}
      }
    }, []),
    De = C.useCallback((j, Z) => {
      (f(j), h(Z ?? null));
    }, []),
    _t = C.useMemo(
      () => ({
        state: s,
        storageOk: r,
        save: a,
        quotaFull: l,
        dismissQuota: () => u(!1),
        update: q,
        put: Q,
        remove: te,
        toast: le,
        announce: A,
        route: I.route,
        navigate: I.navigate,
        helpOpen: c,
        setHelpOpen: De,
        helpTopic: d,
        otherTabChanged: m,
        requestPersist: He,
      }),
      [s, r, a, l, q, Q, te, le, A, I.route, I.navigate, c, De, d, m, He],
    );
  return y.jsxs(Nc.Provider, {
    value: _t,
    children: [
      y.jsx(eS, { isBack: I.isBack }),
      e,
      y.jsx(tS, { msg: ee, onDone: () => ae(null) }),
      y.jsx("div", {
        className: "sr-only",
        role: "status",
        "aria-live": "polite",
        "aria-atomic": "true",
        children: B.polite,
      }),
      y.jsx("div", {
        className: "sr-only",
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        children: B.assertive,
      }),
    ],
  });
}
function Jk(e) {
  return e.name === "home" ? [qo.home, qo.names] : [qo[e.name]];
}
function eS({ isBack: e }) {
  const { route: t } = C.useContext(Nc),
    n = C.useRef(!0),
    r = [t.name, "id" in t ? t.id : "", t.name === "logo" ? t.conceptId : ""].join("|");
  return (
    C.useEffect(() => {
      const s = n.current;
      n.current = !1;
      const i = location.hash || "#/",
        a = e ? Yk(i) : 0,
        o = Jk(t);
      let l = 0,
        u = 0;
      const c = (d) => {
          var h;
          return d.dataset.title ?? ((h = d.textContent) == null ? void 0 : h.trim()) ?? "";
        },
        f = () => {
          const d = Array.from(document.querySelectorAll("main h1")),
            h = d.find((x) => o.includes(c(x)));
          if (!h && l++ < 120) {
            u = requestAnimationFrame(f);
            return;
          }
          const m = h ?? d[0];
          (m &&
            ((document.title = `${c(m)} · Brand Studio`),
            (!s || document.activeElement === document.body) &&
              (s ||
                (m.hasAttribute("tabindex") || m.setAttribute("tabindex", "-1"),
                m.focus({ preventScroll: !0 })))),
            a !== void 0 && window.scrollTo(0, a));
        };
      return ((u = requestAnimationFrame(f)), () => cancelAnimationFrame(u));
    }, [r]),
    null
  );
}
function tS({ msg: e, onDone: t }) {
  const [n, r] = C.useState(!1);
  return (
    C.useEffect(() => {
      if (!e || n) return;
      const s = window.setTimeout(t, e.action ? 1e4 : 6e3);
      return () => window.clearTimeout(s);
    }, [e, n, t]),
    y.jsx("div", {
      className: "toast-host",
      role: "status",
      "aria-live": "polite",
      children:
        e &&
        y.jsxs(
          "div",
          {
            className: `toast${e.action && e.action2 ? " has-two" : ""}`,
            onMouseEnter: () => r(!0),
            onMouseLeave: () => r(!1),
            onFocus: () => r(!0),
            onBlur: () => r(!1),
            children: [
              y.jsx("span", { className: "toast-text", children: e.text }),
              [e.action, e.action2].map(
                (s) =>
                  s &&
                  y.jsx(
                    "button",
                    {
                      type: "button",
                      className: "btn btn-text on-dark",
                      onClick: () => {
                        (s.run(), t());
                      },
                      children: s.label,
                    },
                    s.label,
                  ),
              ),
              y.jsx("button", {
                type: "button",
                className: "btn btn-text on-dark toast-close",
                "aria-label": "Hinweis schließen",
                onClick: t,
                children: y.jsx("span", {
                  className: "glyph",
                  "aria-hidden": "true",
                  children: "×",
                }),
              }),
            ],
          },
          e.id,
        ),
    })
  );
}
function Rc({
  open: e,
  onClose: t,
  title: n,
  children: r,
  footer: s,
  size: i = "default",
  sub: a,
  closeLabel: o = "Schließen",
  className: l = "",
}) {
  const u = C.useRef(null),
    c = C.useId(),
    f = C.useRef(null),
    d = C.useRef(t);
  ((d.current = t),
    C.useEffect(() => {
      const m = u.current;
      m &&
        (e && !m.open
          ? ((f.current = document.activeElement),
            m.showModal(),
            requestAnimationFrame(() => {
              var x;
              return (x = m.querySelector(".dlg-title")) == null ? void 0 : x.focus();
            }))
          : !e && m.open && m.close());
    }, [e]),
    C.useEffect(() => {
      const m = u.current;
      if (!m) return;
      const x = (p) => {
          (p.preventDefault(), d.current());
        },
        k = () => {
          const p = f.current;
          p && document.contains(p) && p.focus();
        };
      return (
        m.addEventListener("cancel", x),
        m.addEventListener("close", k),
        () => {
          (m.removeEventListener("cancel", x), m.removeEventListener("close", k));
        }
      );
    }, []));
  const h = i === "default" ? "" : ` is-${i}`;
  return y.jsxs("dialog", {
    ref: u,
    className: `dlg${h} ${l}`,
    "aria-labelledby": c,
    onClick: (m) => {
      m.target === u.current && t();
    },
    children: [
      y.jsx("div", { className: "dlg-grip", "aria-hidden": "true" }),
      y.jsxs("div", {
        className: "dlg-head",
        children: [
          y.jsx("h2", { className: "h2 dlg-title", id: c, tabIndex: -1, children: n }),
          y.jsxs("button", {
            type: "button",
            className: "btn btn-text",
            onClick: t,
            children: [
              y.jsx("span", { className: "glyph", "aria-hidden": "true", children: "×" }),
              " ",
              o,
            ],
          }),
        ],
      }),
      a && y.jsx("p", { className: "small dlg-sub", children: a }),
      y.jsx("div", { className: "dlg-body", children: e && r }),
      s && e && y.jsx("div", { className: "dlg-foot", children: s }),
    ],
  });
}
const Hr = C.forwardRef(function (
    { children: t, className: n = "", reveal: r, knob: s = "→", busy: i, ...a },
    o,
  ) {
    return y.jsxs("button", {
      ref: o,
      type: "button",
      className: `btn btn-primary${r ? " btn-reveal" : ""}${i ? " is-busy" : ""} ${n}`,
      ...a,
      children: [
        y.jsx("span", { className: "btn-label", children: t }),
        y.jsx("span", { className: "knob", "aria-hidden": "true", children: s }),
      ],
    });
  }),
  Yo = C.forwardRef(function ({ children: t, className: n = "", ...r }, s) {
    return y.jsx("button", {
      ref: s,
      type: "button",
      className: `btn btn-ghost ${n}`,
      ...r,
      children: t,
    });
  }),
  Oc = C.forwardRef(function ({ children: t, className: n = "", ...r }, s) {
    return y.jsx("button", {
      ref: s,
      type: "button",
      className: `btn btn-text ${n}`,
      ...r,
      children: t,
    });
  });
function d0(e, t, n, r, s = 1, i) {
  const a = Math.max(0, t.indexOf(n));
  let o = a;
  switch (e.key) {
    case "ArrowRight":
      o = a + 1;
      break;
    case "ArrowLeft":
      o = a - 1;
      break;
    case "ArrowDown":
      o = a + (s > 1 ? s : 1);
      break;
    case "ArrowUp":
      o = a - (s > 1 ? s : 1);
      break;
    case "Home":
      o = 0;
      break;
    case "End":
      o = t.length - 1;
      break;
    default:
      return;
  }
  (e.preventDefault(),
    s > 1 ? (o = Math.min(t.length - 1, Math.max(0, o))) : (o = (o + t.length) % t.length),
    r(t[o]),
    i == null || i(o));
}
function h0() {
  const e = C.useRef(null);
  return {
    ref: e,
    focusAt: (n) => {
      var s, i;
      const r = (s = e.current) == null ? void 0 : s.querySelectorAll('[role="radio"]');
      (i = r == null ? void 0 : r[n]) == null || i.focus();
    },
  };
}
function nS({ options: e, value: t, onChange: n, label: r, labelledBy: s, scroll: i }) {
  const { ref: a, focusAt: o } = h0(),
    l = e.map((c) => c.value),
    u = t ?? l[0];
  return y.jsx("div", {
    ref: a,
    className: `chips${i ? " is-scroll" : ""}`,
    role: "radiogroup",
    "aria-label": r,
    "aria-labelledby": s,
    children: e.map((c) =>
      y.jsx(
        "button",
        {
          type: "button",
          role: "radio",
          className: "chip",
          "aria-checked": c.value === t,
          "aria-label": c.ariaLabel,
          lang: c.lang,
          tabIndex: c.value === u ? 0 : -1,
          onClick: () => n(c.value),
          onKeyDown: (f) => d0(f, l, u, n, 1, o),
          children: c.label,
        },
        c.value,
      ),
    ),
  });
}
function SL({ options: e, values: t, onToggle: n, label: r }) {
  return y.jsx("div", {
    className: "chips",
    role: "group",
    "aria-label": r,
    children: e.map((s) =>
      y.jsx(
        "button",
        {
          type: "button",
          className: "chip",
          "aria-pressed": t.includes(s.value),
          onClick: () => n(s.value),
          "aria-label": s.ariaLabel,
          children: s.label,
        },
        s.value,
      ),
    ),
  });
}
function rS({ options: e, value: t, onChange: n, label: r, labelledBy: s, scroll: i }) {
  const { ref: a, focusAt: o } = h0(),
    l = e.map((c) => c.value),
    u = l.includes(t) ? t : l[0];
  return y.jsx("div", {
    ref: a,
    className: `seg${i ? " is-scroll" : ""}`,
    role: "radiogroup",
    "aria-label": r,
    "aria-labelledby": s,
    children: e.map((c) =>
      y.jsx(
        "button",
        {
          type: "button",
          role: "radio",
          className: "seg-opt",
          "aria-checked": c.value === t,
          tabIndex: c.value === u ? 0 : -1,
          onClick: () => n(c.value),
          onKeyDown: (f) => d0(f, l, u, n, 1, o),
          children: c.label,
        },
        c.value,
      ),
    ),
  });
}
function wL(e) {
  const t = C.useId();
  return y.jsxs("div", {
    className: "tool-section",
    children: [
      y.jsx("span", { className: "label", id: t, children: e.title }),
      y.jsx(rS, { options: e.options, value: e.value, onChange: e.onChange, labelledBy: t }),
    ],
  });
}
function bL({ checked: e, onChange: t, children: n, describedBy: r }) {
  return y.jsxs("button", {
    type: "button",
    role: "switch",
    "aria-checked": e,
    className: "switch",
    onClick: () => t(!e),
    "aria-describedby": r,
    children: [
      y.jsx("span", { className: "track", "aria-hidden": "true" }),
      y.jsx("span", { children: n }),
    ],
  });
}
const pd = C.forwardRef(function (
  { label: t, help: n, error: r, large: s, id: i, className: a = "", ...o },
  l,
) {
  const u = C.useId(),
    c = i ?? u,
    f = n ? `${c}-help` : void 0,
    d = r ? `${c}-err` : void 0;
  return y.jsxs("div", {
    className: "field",
    children: [
      y.jsx("label", { className: "label field-label", htmlFor: c, children: t }),
      y.jsx("input", {
        ref: l,
        id: c,
        className: `input${s ? " input-lg" : ""} ${a}`,
        "aria-invalid": r ? !0 : void 0,
        "aria-describedby": [d, f].filter(Boolean).join(" ") || void 0,
        ...o,
      }),
      r && y.jsx("p", { className: "field-error", id: d, children: r }),
      n && y.jsx("p", { className: "field-help", id: f, children: n }),
    ],
  });
});
function sS({
  label: e,
  items: t,
  className: n = "btn btn-text",
  menuLabel: r,
  placement: s = "below-end",
  children: i,
}) {
  const [a, o] = C.useState(!1),
    l = C.useRef(null),
    u = C.useRef(null),
    c = t.filter((d) => d.show !== !1);
  C.useEffect(() => {
    var h, m;
    if (!a) return;
    (m = (h = u.current) == null ? void 0 : h.querySelector("button")) == null || m.focus();
    const d = (x) => {
      var k, p;
      !((k = u.current) != null && k.contains(x.target)) &&
        !((p = l.current) != null && p.contains(x.target)) &&
        o(!1);
    };
    return (
      document.addEventListener("mousedown", d),
      () => document.removeEventListener("mousedown", d)
    );
  }, [a]);
  const f = (d = !0) => {
    var h;
    (o(!1), d && ((h = l.current) == null || h.focus()));
  };
  return y.jsxs("span", {
    className: "menu-wrap",
    children: [
      y.jsx("button", {
        ref: l,
        type: "button",
        className: n,
        "aria-haspopup": "menu",
        "aria-expanded": a,
        "aria-label": i ? e : void 0,
        onClick: () => o((d) => !d),
        children: i ?? e,
      }),
      a &&
        y.jsx("div", {
          ref: u,
          className: `menu is-${s}`,
          role: "menu",
          "aria-label": r ?? e,
          onKeyDown: (d) => {
            var x, k, p;
            const h = Array.from(
                ((x = u.current) == null ? void 0 : x.querySelectorAll("button")) ?? [],
              ),
              m = h.indexOf(document.activeElement);
            if (d.key === "ArrowDown") (k = h[(m + 1) % h.length]) == null || k.focus();
            else if (d.key === "ArrowUp")
              (p = h[(m - 1 + h.length) % h.length]) == null || p.focus();
            else if (d.key === "Escape") f();
            else return d.key === "Tab" ? f(!1) : void 0;
            d.preventDefault();
          },
          children: c.map((d) =>
            y.jsx(
              "button",
              {
                type: "button",
                role: "menuitem",
                onClick: () => {
                  (f(), d.run());
                },
                children: d.label,
              },
              d.label,
            ),
          ),
        }),
    ],
  });
}
function p0({ children: e }) {
  const [t, n] = C.useState(null);
  return (
    C.useEffect(() => n(document.getElementById("main") ?? document.body), []),
    t ? Qm.createPortal(y.jsx("div", { className: "actionbar", children: e }), t) : null
  );
}
let Qo = null;
function iS() {
  if (!Qo) {
    const e = globalThis.claude;
    Qo =
      typeof (e == null ? void 0 : e.use) == "function"
        ? e.use("downloads").then(
            (t) => t ?? null,
            () => null,
          )
        : Promise.resolve(null);
  }
  return Qo;
}
function aS(e, t) {
  const n = URL.createObjectURL(t),
    r = document.createElement("a");
  ((r.href = n),
    (r.download = e),
    document.body.appendChild(r),
    r.click(),
    r.remove(),
    setTimeout(() => URL.revokeObjectURL(n), 2e3));
}
async function oS(e, t) {
  const n = await iS();
  if (!n) return aS(e, t);
  try {
    await n.save({ filename: e, data: t });
  } catch (r) {
    console.info("Download nicht gespeichert:", r.code ?? r);
  }
}
const lS = C.lazy(() =>
  bt(() => import("./ProjectPreview-C5WC5Zuf.js"), __vite__mapDeps([4, 5, 6, 7]), import.meta.url),
);
function uS(e, t, n = "application/json") {
  oS(e, new Blob([t], { type: n }));
}
function m0(e) {
  uS(`${Lk(lr(e))}${Bk}`, Hk(e));
}
function cS({ project: e, onDelete: t }) {
  const { put: n, toast: r, navigate: s } = Zt(),
    [i, a] = C.useState(!1),
    o = C.useRef(null),
    l = C.useRef(null);
  C.useEffect(() => {
    var d, h;
    if (!i) return;
    (h = (d = l.current) == null ? void 0 : d.querySelector("button")) == null || h.focus();
    const f = (m) => {
      var x;
      !((x = l.current) != null && x.contains(m.target)) && m.target !== o.current && a(!1);
    };
    return (
      document.addEventListener("mousedown", f),
      () => document.removeEventListener("mousedown", f)
    );
  }, [i]);
  const u = () => {
      var f;
      (a(!1), (f = o.current) == null || f.focus());
    },
    c = [
      {
        label: "Duplizieren",
        run: () => {
          const f = Uk(e);
          (n(f), r(`Kopie angelegt: „${lr(f)}“`));
        },
      },
      { label: "Sicherung herunterladen", run: () => m0(e) },
      ...(e.selected
        ? [{ label: "Postings erstellen", run: () => s({ name: "postings", id: e.id }) }]
        : []),
      { label: "Löschen", run: t },
    ];
  return y.jsxs(y.Fragment, {
    children: [
      y.jsx(Oc, {
        ref: o,
        "aria-haspopup": "menu",
        "aria-expanded": i,
        "aria-label": `Mehr zu ${lr(e)}`,
        onClick: () => a((f) => !f),
        children: "Mehr",
      }),
      i &&
        y.jsx("div", {
          ref: l,
          className: "menu",
          role: "menu",
          "aria-label": `Mehr zu ${lr(e)}`,
          onKeyDown: (f) => {
            var m, x, k;
            const d = Array.from(
                ((m = l.current) == null ? void 0 : m.querySelectorAll("button")) ?? [],
              ),
              h = d.indexOf(document.activeElement);
            if (f.key === "ArrowDown") (x = d[(h + 1) % d.length]) == null || x.focus();
            else if (f.key === "ArrowUp")
              (k = d[(h - 1 + d.length) % d.length]) == null || k.focus();
            else return f.key === "Escape" || f.key === "Tab" ? u() : void 0;
            f.preventDefault();
          },
          children: c.map((f) =>
            y.jsx(
              "button",
              {
                type: "button",
                role: "menuitem",
                onClick: () => {
                  (u(), f.run());
                },
                children: f.label,
              },
              f.label,
            ),
          ),
        }),
    ],
  });
}
function fS({ project: e, onDelete: t }) {
  const { navigate: n } = Zt(),
    r = lr(e),
    s = wn(e.ui.route);
  return y.jsxs("article", {
    className: "project-card",
    "aria-label": r,
    children: [
      y.jsx(C.Suspense, {
        fallback: y.jsx("div", { className: "preview riffel" }),
        children: y.jsx(lS, { project: e }),
      }),
      y.jsxs("div", {
        className: "meta",
        children: [
          y.jsx("h2", {
            className: "name",
            children: y.jsx("a", {
              className: "pc-link",
              href: za(s),
              onClick: (i) => {
                (i.preventDefault(), n(s));
              },
              "aria-label": `Weiterarbeiten an ${r}`,
              children: r,
            }),
          }),
          y.jsxs("p", {
            className: "small",
            style: { marginTop: 4 },
            children: [Dk(e), " · zuletzt ", Fk(e.updatedAt).toLocaleLowerCase("de-AT")],
          }),
        ],
      }),
      y.jsx("div", { className: "pc-more", children: y.jsx(cS, { project: e, onDelete: t }) }),
    ],
  });
}
function dS() {
  const { state: e, navigate: t, remove: n, put: r } = Zt(),
    [s, i] = C.useState(null),
    [a, o] = C.useState(null),
    l = C.useRef(null),
    u = Object.values(e.projects).sort((d, h) => h.updatedAt - d.updatedAt),
    c = () => {
      var d;
      (o(null), (d = l.current) == null || d.click());
    },
    f = async (d) => {
      if (d)
        try {
          const h = await d.text(),
            { readBackup: m } = await bt(
              async () => {
                const { readBackup: k } = await import("./migrate-yTmcZ5Wq.js");
                return { readBackup: k };
              },
              __vite__mapDeps([0, 1, 2, 3]),
              import.meta.url,
            ),
            x = m(h, Object.keys(e.projects));
          (r(x), t(wn(x.ui.route)));
        } catch (h) {
          o(h instanceof Wk && h.message === "invalid" ? dd.invalid : dd.foreign);
        } finally {
          l.current && (l.current.value = "");
        }
    };
  return y.jsxs("div", {
    className: "container screen",
    children: [
      y.jsxs("div", {
        className: "home-head",
        children: [
          y.jsx("h1", { className: "h1", "data-title": "Deine Marken", children: "Deine Marken" }),
          y.jsx("div", {
            className: "desk-flex",
            children: y.jsx(Hr, {
              onClick: () => t({ name: "names", gemerkt: !1, kinds: [] }),
              children: "Neue Marke beginnen",
            }),
          }),
        ],
      }),
      e.loadError
        ? y.jsxs("div", {
            className: "empty-state",
            children: [
              y.jsx("p", {
                children:
                  "Deine Marken konnten nicht geladen werden. Lade die Seite neu. Wenn das nicht hilft, öffne eine Sicherungsdatei.",
              }),
              y.jsxs("div", {
                className: "row",
                children: [
                  y.jsx(Yo, { onClick: () => location.reload(), children: "Neu laden" }),
                  y.jsx(Yo, { onClick: c, children: "Sicherung öffnen" }),
                ],
              }),
            ],
          })
        : y.jsx("div", {
            className: "project-grid",
            children: u.map((d) => y.jsx(fS, { project: d, onDelete: () => i(d) }, d.id)),
          }),
      y.jsxs("div", {
        className: "storage-note",
        children: [
          y.jsx("p", {
            className: "small",
            children:
              "Deine Marken sind nur in diesem Browser auf diesem Gerät gespeichert. Tipp: Lade dein Brand Kit herunter oder sichere deine Marke als Datei.",
          }),
          y.jsxs("div", {
            children: [
              y.jsx(Oc, { onClick: c, children: "Sicherung öffnen" }),
              y.jsx("input", {
                ref: l,
                type: "file",
                accept: ".json,application/json",
                hidden: !0,
                onChange: (d) => {
                  var h;
                  return f((h = d.target.files) == null ? void 0 : h[0]);
                },
                "aria-label": "Sicherungsdatei wählen",
              }),
            ],
          }),
        ],
      }),
      a &&
        y.jsx("p", {
          className: "field-error",
          role: "alert",
          style: { marginTop: 12 },
          children: a,
        }),
      y.jsx(Rc, {
        open: !!s,
        onClose: () => i(null),
        title: s ? `„${lr(s)}“ löschen?` : "",
        footer: y.jsxs(y.Fragment, {
          children: [
            y.jsx(Yo, { onClick: () => i(null), children: "Abbrechen" }),
            y.jsx(Hr, {
              knob: "×",
              onClick: () => {
                (s && n(s.id), i(null));
              },
              children: "Endgültig löschen",
            }),
          ],
        }),
        children: y.jsx("p", {
          children:
            "Die Marke und alle Entwürfe werden aus diesem Browser entfernt. Dateien, die du schon heruntergeladen hast, bleiben erhalten.",
        }),
      }),
      y.jsx(p0, {
        children: y.jsx(Hr, {
          onClick: () => t({ name: "names", gemerkt: !1, kinds: [] }),
          children: "Neue Marke beginnen",
        }),
      }),
    ],
  });
}
const hS = ["NAME", "STIL", "AUSWAHL", "FEINSCHLIFF", "BRAND KIT"],
  pS = ["Name", "Stil", "Auswahl", "Feinschliff", "Brand Kit"],
  mS = "./";
function gS(e, t) {
  switch (t) {
    case 1:
      return { name: "name", id: e.id };
    case 2:
      return { name: "stil", id: e.id };
    case 3:
      return e.styleChoice ? { name: "auswahl", id: e.id, gemerkt: !1 } : null;
    case 4:
      return e.editing
        ? { name: "logo", id: e.id, conceptId: e.editing.baseId, tab: e.ui.editorTab }
        : null;
    case 5:
      return e.selected ? { name: "kit", id: e.id } : null;
  }
  return null;
}
function md({ route: e, project: t, mobileOnly: n }) {
  const r = lu(e);
  if (!r) return null;
  if (n) {
    const s = e.name === "names" ? "Name finden" : pS[r - 1];
    return y.jsxs("span", {
      className: "steps-compact label",
      "aria-label": `Schritt ${r} von 5: ${s}`,
      children: [r, " / 5 · ", s],
    });
  }
  return y.jsx("nav", {
    className: "steps",
    "aria-label": "Fortschritt",
    children: y.jsx("ol", {
      children: hS.map((s, i) => {
        const a = i + 1,
          o = `${String(a).padStart(2, "0")} ${a === 1 && e.name === "names" ? "NAME FINDEN" : s}`;
        if (a === r)
          return y.jsx(
            "li",
            {
              children: y.jsxs("span", {
                className: "step",
                "aria-current": "step",
                children: [y.jsx("span", { className: "dot", "aria-hidden": "true" }), o],
              }),
            },
            s,
          );
        const l = t && a < r ? gS(t, a) : null;
        return y.jsx(
          "li",
          {
            children: l
              ? y.jsx("a", { className: "step", href: za(l), children: o })
              : y.jsx("span", { className: "step", children: o }),
          },
          s,
        );
      }),
    }),
  });
}
function vS({ changedAt: e }) {
  const { save: t, storageOk: n, navigate: r } = Zt(),
    [s, i] = C.useState(!1);
  return n
    ? t === "error"
      ? y.jsxs(y.Fragment, {
          children: [
            y.jsxs("button", {
              type: "button",
              className: "btn btn-text save-status is-error",
              onClick: () => i(!0),
              children: [
                y.jsx("span", { className: "dot", "aria-hidden": "true" }),
                "NICHT GESPEICHERT",
              ],
            }),
            y.jsx(Rc, {
              open: s,
              onClose: () => i(!1),
              title: "Nicht gespeichert",
              footer: y.jsx(Hr, {
                onClick: () => {
                  (i(!1), r({ name: "home" }));
                },
                children: "Zu deinen Marken",
              }),
              children: y.jsx("p", {
                children:
                  "Dein Browser-Speicher ist voll. Lösche alte Marken oder entferne eingesetzte Fotos.",
              }),
            }),
          ],
        })
      : y.jsx(yS, { save: t, changedAt: e })
    : null;
}
function yS({ save: e, changedAt: t }) {
  const [n, r] = C.useState(!1),
    s = C.useRef(Date.now() + 1500);
  C.useEffect(() => {
    const a = () => (s.current = Date.now() + 1500);
    return (
      window.addEventListener("hashchange", a),
      () => window.removeEventListener("hashchange", a)
    );
  }, []);
  const i = C.useRef(t);
  return (
    C.useEffect(() => {
      if (Date.now() < s.current || t === i.current) {
        ((i.current = t), e !== "saving" && r(!1));
        return;
      }
      if (e === "saving") {
        r(!0);
        return;
      }
      if (e !== "saved") {
        r(!1);
        return;
      }
      i.current = t;
      const a = window.setTimeout(() => r(!1), 1500);
      return () => window.clearTimeout(a);
    }, [e]),
    y.jsx("span", {
      className: "save-status",
      role: "status",
      children: n ? (e === "saving" ? "Speichert ..." : "Gespeichert") : "",
    })
  );
}
function xS({ route: e, project: t, sticky: n }) {
  const { setHelpOpen: r, navigate: s } = Zt(),
    i = lu(e) >= 2,
    a = lu(e);
  return y.jsx(y.Fragment, {
    children: y.jsxs("header", {
      className: `app-header${n ? " is-sticky" : ""}`,
      children: [
        y.jsxs("div", {
          className: "container",
          children: [
            y.jsxs("a", {
              className: "brandlink",
              href: "#/",
              "aria-label": "Brand Studio, zu deinen Marken",
              children: [
                y.jsx("img", { src: `${mS}unio-logo-black.svg`, alt: "", width: 72, height: 18 }),
                y.jsx("span", {
                  className: "label",
                  "aria-hidden": "true",
                  children: "BRAND STUDIO",
                }),
              ],
            }),
            t &&
              y.jsx("span", {
                className: "project-switch desk-only",
                children: y.jsx(sS, {
                  label: lr(t),
                  menuLabel: "Marke wechseln",
                  placement: "below-start",
                  items: [
                    { label: "Deine Marken", run: () => s({ name: "home" }) },
                    {
                      label: "Neue Marke beginnen",
                      run: () => s({ name: "names", gemerkt: !1, kinds: [] }),
                    },
                    { label: "Sicherung herunterladen", run: () => m0(t) },
                  ],
                }),
              }),
            y.jsx(md, { route: e, project: t }),
            y.jsx(md, { route: e, project: t, mobileOnly: !0 }),
            y.jsxs("div", {
              className: "header-right",
              children: [
                i && y.jsx(vS, { changedAt: t == null ? void 0 : t.updatedAt }),
                y.jsx("button", {
                  type: "button",
                  className: "btn btn-text help-btn",
                  onClick: () => r(!0),
                  children: "Hilfe",
                }),
              ],
            }),
          ],
        }),
        a > 0 &&
          y.jsx("div", {
            className: "header-progress",
            "aria-hidden": "true",
            children: y.jsx("span", { style: { width: `${(a / 5) * 100}%` } }),
          }),
      ],
    }),
  });
}
const $i = ({ href: e, children: t, long: n }) =>
  y.jsxs("a", {
    href: e,
    target: "_blank",
    rel: "noopener noreferrer",
    className: n ? "bd-long" : void 0,
    children: [
      t,
      " ",
      y.jsx("span", { "aria-hidden": "true", children: "↗" }),
      y.jsx("span", { className: "sr-only", children: " (öffnet ein neues Fenster)" }),
    ],
  });
function kS({ open: e }) {
  return y.jsxs("details", {
    className: "disclosure before-decide",
    open: e,
    children: [
      y.jsx("summary", {
        children: y.jsxs("span", {
          children: [
            y.jsx("span", { className: "bd-title", children: "Bevor du dich festlegst" }),
            y.jsx("span", {
              className: "small bd-lead",
              children: "Prüf kurz, ob es deinen Wunschnamen schon gibt.",
            }),
          ],
        }),
      }),
      y.jsxs("div", {
        className: "disclosure-body",
        children: [
          y.jsx("p", {
            children:
              "Prüf kurz, ob es deinen Wunschnamen schon gibt. Das dauert zehn Minuten und kann dir viel Ärger ersparen. Wir können das nicht für dich prüfen und geben keine Rechtsberatung.",
          }),
          y.jsxs("ol", {
            className: "steps-list",
            children: [
              y.jsxs("li", {
                children: [
                  y.jsx("span", { className: "label", "aria-hidden": "true", children: "01" }),
                  y.jsxs("span", {
                    children: [
                      "Marken: Such den Namen im österreichischen Markenregister des Patentamts (",
                      y.jsx($i, { href: "https://seeip.patentamt.at", children: "see.ip" }),
                      ") und EU-weit in ",
                      y.jsx($i, { href: "https://www.tmdn.org/tmview/", children: "TMview" }),
                      ".",
                    ],
                  }),
                ],
              }),
              y.jsxs("li", {
                children: [
                  y.jsx("span", { className: "label", "aria-hidden": "true", children: "02" }),
                  y.jsxs("span", {
                    children: [
                      "Firmen: Schau im ",
                      y.jsx($i, {
                        href: "https://firmen.wko.at",
                        long: !0,
                        children: "Firmen A-Z der Wirtschaftskammer",
                      }),
                      ", ob ein Makler in deiner Nähe ähnlich heißt.",
                    ],
                  }),
                ],
              }),
              y.jsxs("li", {
                children: [
                  y.jsx("span", { className: "label", "aria-hidden": "true", children: "03" }),
                  y.jsxs("span", {
                    children: [
                      "Domain: Prüf bei ",
                      y.jsx($i, { href: "https://www.nic.at", children: "nic.at" }),
                      ", ob deine .at-Adresse noch frei ist.",
                    ],
                  }),
                ],
              }),
              y.jsxs("li", {
                children: [
                  y.jsx("span", { className: "label", "aria-hidden": "true", children: "04" }),
                  y.jsx("span", {
                    children:
                      "Dein eigener Name: Auch mit einem Fantasienamen steht dein eigener Name in der Regel im Impressum und auf deinem Geschäftspapier.",
                  }),
                ],
              }),
              y.jsxs("li", {
                children: [
                  y.jsx("span", { className: "label", "aria-hidden": "true", children: "05" }),
                  y.jsx("span", {
                    children:
                      "Im Zweifel: Frag eine Anwältin oder einen Anwalt für Markenrecht. Die Wirtschaftskammer hilft beim ersten Schritt.",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function EL() {
  return y.jsxs("details", {
    className: "disclosure before-decide mark-legal",
    children: [
      y.jsx("summary", {
        children: y.jsxs("span", {
          children: [
            y.jsx("span", { className: "bd-title", children: "Vor der Nutzung als Marke" }),
            y.jsx("span", {
              className: "small bd-lead",
              children: "Logo und Name rechtlich prüfen lassen (Marken- und Designrecht).",
            }),
          ],
        }),
      }),
      y.jsxs("div", {
        className: "disclosure-body",
        children: [
          y.jsx("p", {
            children:
              "Vor der Nutzung als Marke: Logo und Name rechtlich prüfen lassen (Marken- und Designrecht).",
          }),
          y.jsx("p", {
            children:
              "Dein Logo beruht auf einer Gestaltungsvorlage des Studios. Andere können dieselbe Vorlage mit ihrem Namen nutzen, ein exklusives Zeichen ist es deshalb nicht. Wir geben keine Rechtsberatung; frag im Zweifel eine Anwältin oder einen Anwalt für Marken- und Designrecht.",
          }),
        ],
      }),
    ],
  });
}
const SS = [
  {
    id: "daten",
    q: "Wo werden meine Daten gespeichert?",
    a: [
      "Nur in diesem Browser auf diesem Gerät. Wir haben keinen Server und kein Konto, niemand außer dir sieht deine Marke.",
      "Tipp: Lade dein Brand Kit herunter oder sichere deine Marke als Datei (unter „Deine Marken“, Menü „Mehr“).",
    ],
  },
  {
    id: "nutzung",
    q: "Darf ich das Logo überall verwenden?",
    a: [
      "Ja. Alle Schriften sind frei lizenziert und alle Symbole sind eigens gezeichnet. Du kannst dein Logo für Drucksachen, Website und Social Media nutzen.",
      "Prüf vor einem großen Druckauftrag kurz, ob es eine ähnliche Marke in deiner Region schon gibt.",
    ],
  },
  {
    id: "format",
    q: "Welches Format brauche ich?",
    a: [
      "PNG: für Word, PowerPoint, Social Media und WhatsApp. SVG: für deine Website und für Grafiker, bleibt in jeder Größe scharf. PDF: für die Druckerei.",
    ],
  },
  {
    id: "signatur",
    q: "Wie richte ich die E-Mail-Signatur ein?",
    a: [
      "Im Brand Kit bei „E-Mail-Signatur“ auf „Signatur einrichten“ tippen. Dort kopierst du die Signatur und findest eine Anleitung für Outlook, Apple Mail, Gmail und iPhone.",
    ],
  },
  {
    id: "kompass",
    q: "Was ist der Markenkompass?",
    a: [
      "Die Ausrichtung deiner Personal Brand in etwa 8 Minuten: wofür du stehst, wen du erreichst und wie du auftrittst. Danach zeigen wir dir drei Richtungen, eine sichere, eine mutige und eine überraschende, jeweils mit Versprechen, Themen für deine Inhalte und dem visuellen Auftritt.",
      "Er ist ein Angebot, kein Pflichtschritt. Du kannst jederzeit „Direkt zu den Richtungen“ springen. Mit „Diese Richtung vertiefen“ geht es in den Namensfinder bzw. zu deinen Logos, mit der Richtung als Vorgabe.",
    ],
  },
  {
    id: "probe",
    q: "Was bringt „Namen auf die Probe stellen“?",
    a: [
      "Unter deinen Logos prüfen wir deinen Namen in sieben Punkten, etwa Länge, Aussprache, Domain und ob ein Mitbewerber genauso heißen könnte. Dazu zeigen wir Alternativen als fertige Logos.",
      "Die Prüfung ersetzt keine Markenrecherche. Einen Tausch kannst du rückgängig machen.",
    ],
  },
  {
    id: "weg",
    q: "Ich sehe meine Marke nicht mehr.",
    a: [
      "Deine Marken liegen im Browser, in dem du sie erstellt hast. In einem anderen Browser, im privaten Fenster oder nach dem Löschen der Website-Daten sind sie nicht sichtbar.",
      "Hast du eine Sicherungsdatei (.unio-brand.json), öffne sie unter „Deine Marken“ mit „Sicherung öffnen“.",
    ],
  },
];
function wS() {
  const { helpOpen: e, setHelpOpen: t, helpTopic: n } = Zt(),
    r = C.useRef(null);
  return (
    C.useEffect(() => {
      e &&
        n &&
        r.current &&
        ((r.current.open = !0),
        setTimeout(() => {
          var s;
          return (s = r.current) == null ? void 0 : s.scrollIntoView({ block: "nearest" });
        }, 50));
    }, [e, n]),
    C.useEffect(() => {
      const s = (i) => {
        i.key !== "?" ||
          i.ctrlKey ||
          i.metaKey ||
          i.altKey ||
          i.target.closest("input, textarea, select, [contenteditable]") ||
          (i.preventDefault(), t(!0, "tasten"));
      };
      return (
        window.addEventListener("keydown", s),
        () => window.removeEventListener("keydown", s)
      );
    }, [t]),
    y.jsxs(Rc, {
      open: e,
      onClose: () => t(!1),
      title: "Hilfe",
      size: "side",
      children: [
        y.jsxs("div", {
          className: "stack",
          children: [
            y.jsx("h3", { className: "label label-strong", children: "SO FUNKTIONIERT'S" }),
            y.jsx("p", {
              children:
                "Du wählst ein Logo aus unseren Vorschlägen, passt es an und lädst alles herunter, was du brauchst.",
            }),
          ],
        }),
        y.jsxs("div", {
          style: { marginTop: 32 },
          children: [
            y.jsx("h3", {
              className: "label label-strong",
              style: { marginBottom: 8 },
              children: "HÄUFIGE FRAGEN",
            }),
            SS.map((s) =>
              y.jsxs(
                "details",
                {
                  className: "faq",
                  ref: n === s.id ? r : void 0,
                  children: [
                    y.jsx("summary", { children: s.q }),
                    y.jsx("div", {
                      className: "faq-body stack",
                      children: s.a.map((i) => y.jsx("p", { children: i }, i)),
                    }),
                  ],
                },
                s.id,
              ),
            ),
          ],
        }),
        y.jsx("div", { style: { marginTop: 32 }, children: y.jsx(kS, {}) }),
        y.jsxs("div", {
          className: "stack",
          style: { marginTop: 32 },
          children: [
            y.jsx("h3", { className: "label label-strong", children: "PERSÖNLICHE HILFE" }),
            y.jsx("p", { children: "Persönliche Hilfe vom UNIO CIRCLE Team" }),
            y.jsx("p", { className: "small", children: "[PLATZHALTER: Support-Kontakt CIRCLE]" }),
          ],
        }),
        y.jsxs("details", {
          className: "faq desk-only",
          style: { marginTop: 32 },
          ref: n === "tasten" ? r : void 0,
          children: [
            y.jsx("summary", { children: "Tastenkürzel" }),
            y.jsx("ul", {
              className: "steps-list faq-body",
              children: [
                ["?", "Hilfe öffnen"],
                ["Strg + Z", "Rückgängig im Editor"],
                ["Strg + Umschalt + Z", "Wiederholen im Editor"],
                ["Pfeiltasten", "Zwischen Logos und Optionen wechseln"],
                ["M", "Logo merken (Galerie, Fokus auf Karte)"],
                ["V", "Ähnliche Logos (Galerie, Fokus auf Karte)"],
                ["Esc", "Dialog schließen"],
              ].map(([s, i]) =>
                y.jsxs(
                  "li",
                  {
                    style: { gridTemplateColumns: "180px 1fr" },
                    children: [
                      y.jsx("span", { className: "label label-strong", children: s }),
                      y.jsx("span", { children: i }),
                    ],
                  },
                  s,
                ),
              ),
            }),
          ],
        }),
      ],
    })
  );
}
const bS = /^(dr|mag|di|ing|prof|dipl|mmag|ddr|dkfm|kr|msc|mba)\.?$/i,
  ES = new Set([
    "immobilien",
    "immobilie",
    "immo",
    "realitäten",
    "realitaeten",
    "realität",
    "real",
    "estate",
    "realestate",
    "wohnen",
    "wohnbau",
    "haus",
    "häuser",
    "home",
    "homes",
    "living",
    "invest",
    "investment",
    "projekt",
    "projekte",
    "partner",
    "partners",
    "raum",
    "räume",
    "werk",
    "wohnwerk",
    "bau",
    "group",
    "gruppe",
    "makler",
    "property",
    "properties",
    "objekt",
    "objekte",
    "gmbh",
    "og",
    "kg",
    "co",
    "büro",
    "agentur",
    "consulting",
    "service",
    "services",
    "team",
    "verwaltung",
    "grund",
    "boden",
  ]),
  TS = new Set([
    "palais",
    "villa",
    "villen",
    "schloss",
    "residenz",
    "residence",
    "residences",
    "quartier",
    "quartiere",
    "atelier",
    "studio",
    "manufaktur",
    "kontor",
    "loft",
    "lofts",
    "domus",
    "casa",
    "capital",
    "holding",
    "estates",
    "realty",
    "development",
    "developments",
    "collection",
    "select",
    "prime",
    "premium",
    "exklusiv",
    "exclusive",
    "concept",
    "konzept",
    "wohnungen",
    "bauträger",
    "baumeister",
    "architektur",
    "edition",
    "maison",
    "domaine",
    "stiftung",
    "genossenschaft",
    "verein",
    "ag",
    "se",
    "llc",
    "ltd",
    "inc",
    "kollektiv",
  ]),
  CS = new Set([
    "hof",
    "gut",
    "garten",
    "gärten",
    "park",
    "blick",
    "see",
    "berg",
    "tal",
    "land",
    "stadt",
    "markt",
    "platz",
    "turm",
    "haus",
    "villa",
  ]),
  LS = [
    "werk",
    "haus",
    "häuser",
    "bau",
    "blick",
    "hof",
    "raum",
    "räume",
    "wohnen",
    "immobilien",
    "realitäten",
    "gruppe",
    "group",
    "invest",
    "quartier",
    "garten",
    "park",
    "land",
    "stadt",
    "palais",
    "living",
    "home",
    "homes",
  ],
  FS = new Set([
    "wiener",
    "grazer",
    "linzer",
    "salzburger",
    "innsbrucker",
    "klagenfurter",
    "villacher",
    "welser",
    "badener",
    "mödlinger",
    "tiroler",
    "kärntner",
    "steirer",
    "vorarlberger",
    "burgenländer",
    "niederösterreicher",
    "oberösterreicher",
    "döblinger",
    "hietzinger",
    "währinger",
    "josefstädter",
    "leopoldstädter",
    "alsergrunder",
    "favoritner",
    "floridsdorfer",
    "penzinger",
    "ottakringer",
    "meidlinger",
    "simmeringer",
    "liesinger",
    "hernalser",
    "brigittenauer",
    "donaustädter",
    "gmundner",
    "wachauer",
    "münchner",
    "berliner",
    "hamburger",
    "kölner",
    "zürcher",
    "züricher",
    "basler",
    "luzerner",
  ]);
function g0(e) {
  return (e ?? "")
    .normalize("NFC")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}
function Ic(e) {
  return g0(e)
    .split(" ")
    .filter((t, n, r) => t && !(bS.test(t) && n < r.length - 1));
}
function v0(e) {
  const t = Ic(e);
  if (!t.length) return !1;
  if (/&|\+|\d/.test(g0(e))) return !0;
  const n = t.map((s) => s.toLocaleLowerCase("de-AT").replace(/[.,]$/, ""));
  if (n.some((s) => ES.has(s) || TS.has(s)) || FS.has(n[0]) || (t.length > 1 && CS.has(n[0])))
    return !0;
  const r = n[0];
  return LS.some((s) => r.length >= s.length + 3 && r.endsWith(s));
}
function y0(e) {
  const t = Ic(e);
  return t.length < 2 || t.length > 3 || v0(e)
    ? !1
    : t.every((n) => {
        const r = n.toLocaleLowerCase("de-AT");
        return (
          new RegExp("^(\\p{Lu}[\\p{Ll}'’]+)(-\\p{Lu}[\\p{Ll}'’]+)*$", "u").test(n) ||
          /^(von|van|de|der|zu|di|da|le|la)$/.test(r)
        );
      });
}
function TL(e) {
  return e.nameKind === "company"
    ? !1
    : e.nameKind === "person"
      ? Ic(e.name).length >= 2
      : y0(e.name);
}
const MS = 7;
function M(e) {
  const t = Math.round(e * 100) / 100;
  return (Object.is(t, -0) ? 0 : t).toString();
}
const Le = (e) => `${M(e[0])} ${M(e[1])}`;
function ur(e, t = !0) {
  return e.map((n, r) => (r ? "L" : "M") + Le(n)).join("") + (t ? "Z" : "");
}
function ne(e, t) {
  const n = e.length;
  let r = "";
  for (let s = 0; s < n; s++) {
    const i = e[(s - 1 + n) % n],
      a = e[s],
      o = e[(s + 1) % n],
      l = Array.isArray(t) ? (t[s] ?? 0) : t,
      u = _n(Ot(i, a)),
      c = _n(Ot(o, a)),
      f = Js(i, a),
      d = Js(o, a),
      h = Math.max(-1, Math.min(1, u[0] * c[0] + u[1] * c[1])),
      m = Math.acos(h);
    if (l <= 0 || m < 0.001 || Math.abs(Math.PI - m) < 0.001) {
      r += (s ? "L" : "M") + Le(a);
      continue;
    }
    let x = l / Math.tan(m / 2);
    x = Math.min(x, f / 2, d / 2);
    const k = x * Math.tan(m / 2),
      p = ut(a, rt(u, x)),
      g = ut(a, rt(c, x)),
      v = (a[0] - i[0]) * (o[1] - a[1]) - (a[1] - i[1]) * (o[0] - a[0]);
    r += (s ? "L" : "M") + Le(p) + `A${M(k)} ${M(k)} 0 0 ${v > 0 ? 1 : 0} ` + Le(g);
  }
  return r + "Z";
}
function we(e, t, n, r, s = 0) {
  const i = [
    [e, t],
    [e + n, t],
    [e + n, t + r],
    [e, t + r],
  ];
  return s > 0 ? ne(i, s) : ur(i);
}
function at(e, t, n) {
  return `M${M(e - n)} ${M(t)}A${M(n)} ${M(n)} 0 1 0 ${M(e + n)} ${M(t)}A${M(n)} ${M(n)} 0 1 0 ${M(e - n)} ${M(t)}Z`;
}
function G(e, t, n = MS, r = "round", s = "round") {
  return `<path d="${e}" fill="none" stroke="${t}" stroke-width="${M(n)}" stroke-linecap="${r}" stroke-linejoin="${s}"/>`;
}
function W(e, t) {
  return `<path d="${e}" fill="${t}" fill-rule="evenodd"/>`;
}
function Wn(e, t, n, r) {
  return `<circle cx="${M(e)}" cy="${M(t)}" r="${M(n)}" fill="${r}"/>`;
}
const ut = (e, t) => [e[0] + t[0], e[1] + t[1]],
  Ot = (e, t) => [e[0] - t[0], e[1] - t[1]],
  rt = (e, t) => [e[0] * t, e[1] * t],
  Js = (e, t) => Math.hypot(e[0] - t[0], e[1] - t[1]),
  x0 = (e, t, n) => [e[0] + (t[0] - e[0]) * n, e[1] + (t[1] - e[1]) * n];
function _n(e) {
  const t = Math.hypot(e[0], e[1]) || 1;
  return [e[0] / t, e[1] / t];
}
function NS(e, t, n = [50, 50]) {
  const r = (t * Math.PI) / 180,
    s = e[0] - n[0],
    i = e[1] - n[1];
  return [n[0] + s * Math.cos(r) - i * Math.sin(r), n[1] + s * Math.sin(r) + i * Math.cos(r)];
}
const Jo = (e, t, n) => e.map((r) => [r[0] + t, r[1] + n]);
function ei(e, t, n) {
  const r = (n * Math.PI) / 180;
  return [e[0] + t * Math.cos(r), e[1] + t * Math.sin(r)];
}
function RS(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    const r = e[n],
      s = e[(n + 1) % e.length];
    t += r[0] * s[1] - s[0] * r[1];
  }
  return t / 2;
}
function k0(e, t, n, r) {
  const s = t[0] * r[1] - t[1] * r[0];
  if (Math.abs(s) < 1e-9) return null;
  const i = ((n[0] - e[0]) * r[1] - (n[1] - e[1]) * r[0]) / s;
  return [e[0] + t[0] * i, e[1] + t[1] * i];
}
function OS(e, t) {
  const n = e.length,
    r = RS(e) > 0,
    s = e.map((i, a) => {
      const o = e[(a + 1) % n],
        l = _n(Ot(o, i)),
        u = r ? [-l[1], l[0]] : [l[1], -l[0]],
        c = Array.isArray(t) ? t[a] : t;
      return { o: ut(i, rt(u, c)), dir: l, nrm: u, di: c };
    });
  return e.map((i, a) => {
    const o = s[(a - 1 + n) % n],
      l = s[a];
    return k0(o.o, o.dir, l.o, l.dir) ?? ut(i, rt(l.nrm, l.di));
  });
}
function IS(e, t, n) {
  const r = Ot(n, t),
    s = r[0] * r[0] + r[1] * r[1];
  if (s < 1e-9) return !1;
  const i = ((e[0] - t[0]) * r[0] + (e[1] - t[1]) * r[1]) / s;
  return i < -1e-6 || i > 1 + 1e-6 ? !1 : Js(e, ut(t, rt(r, i))) < 0.05;
}
function ca(e, t, n = 0) {
  return e
    .map((r, s) => {
      const i = r.map((o, l) => {
          const u = r[(l + 1) % r.length],
            c = x0(o, u, 0.5);
          return e.some((d, h) => h !== s && d.some((m, x) => IS(c, m, d[(x + 1) % d.length])))
            ? t / 2
            : 0;
        }),
        a = OS(r, i);
      return n > 0 ? ne(a, n) : ur(a);
    })
    .join("");
}
function el(e, t) {
  const n = t / 2,
    r = [],
    s = [];
  for (let i = 0; i < e.length; i++) {
    const a = i > 0 ? _n(Ot(e[i], e[i - 1])) : null,
      o = i < e.length - 1 ? _n(Ot(e[i + 1], e[i])) : null,
      l = a ? [-a[1], a[0]] : null,
      u = o ? [-o[1], o[0]] : null;
    let c;
    if (l && u) {
      const f = _n(ut(l, u)),
        d = f[0] * u[0] + f[1] * u[1];
      c = rt(f, n / d);
    } else c = rt(l ?? u, n);
    (r.push(ut(e[i], c)), s.push(Ot(e[i], c)));
  }
  return ur([...r, ...s.reverse()]);
}
function PS(e, t, n) {
  const r = n / 1.708,
    s = t + 0.07 * r,
    i = (o, l) => [e + o * r, s + l * r],
    a = M(0.5 * r);
  return `M${Le(i(0, 0.707))}L${Le(i(-0.707, 0))}A${a} ${a} 0 0 1 ${Le(i(0, -0.707))}A${a} ${a} 0 0 1 ${Le(i(0.707, 0))}Z`;
}
function cu(e, t, n) {
  const r = Js(e, t) / 2,
    s = n / 2,
    i = M((r * r + s * s) / (2 * s));
  return `M${Le(e)}A${i} ${i} 0 0 1 ${Le(t)}A${i} ${i} 0 0 1 ${Le(e)}Z`;
}
function DS(e, t, n, r) {
  const s = Js(e, t) / 2,
    i = n / 2,
    a = (s * s + i * i) / (2 * i),
    o = _n(Ot(t, e)),
    l = [-o[1], o[0]],
    u = x0(e, t, 0.5),
    c = a - i + r / 2,
    f = Math.sqrt(Math.max(0, a * a - c * c)),
    d = (h) => {
      const m = ut(u, rt(l, (h * r) / 2)),
        x = Ot(m, rt(o, f)),
        k = ut(m, rt(o, f));
      return `M${Le(x)}A${M(a)} ${M(a)} 0 0 ${h > 0 ? 0 : 1} ${Le(k)}Z`;
    };
  return d(1) + d(-1);
}
function tl(e, t, n, r, s) {
  const i = n * 0.45,
    a = t + Math.sqrt(n * n - i * i);
  return `M${Le([e - i, a])}A${M(n)} ${M(n)} 0 1 1 ${Le([e + i, a])}L${Le([e + s, t + r])}L${Le([e - s, t + r])}Z`;
}
function It(e, t, n, r, s) {
  return [
    [e, t],
    [e + r, n],
    [e + r, s],
    [e - r, s],
    [e - r, n],
  ];
}
function gd(e, t, n, r, s = !0) {
  const i = ei(e, t, n),
    a = ei(e, t, r),
    o = r - n,
    l = Math.abs(o) > 180 ? 1 : 0,
    u = o > 0 ? 1 : 0;
  return (s ? `M${Le(i)}` : `L${Le(i)}`) + `A${M(t)} ${M(t)} 0 ${l} ${u} ${Le(a)}`;
}
function US(e, t, n, r, s) {
  return gd(e, n, r, s) + gd(e, t, s, r, !1) + "Z";
}
function nn(e, t, n, r, s = !0) {
  const i = M((t - e) / 2);
  return `M${M(e)} ${M(r)}V${M(n)}A${i} ${i} 0 0 1 ${M(t)} ${M(n)}V${M(r)}` + (s ? "Z" : "");
}
function vd(e, t, n, r) {
  return k0(e, Ot(t, e), n, Ot(r, n)) ?? e;
}
function yd(e, t, n, r) {
  const s = 1 - r,
    i = [
      s * s * e[0] + 2 * s * r * t[0] + r * r * n[0],
      s * s * e[1] + 2 * s * r * t[1] + r * r * n[1],
    ],
    a = _n([
      2 * s * (t[0] - e[0]) + 2 * r * (n[0] - t[0]),
      2 * s * (t[1] - e[1]) + 2 * r * (n[1] - t[1]),
    ]);
  return { p: i, tan: a };
}
function ms(e, t, n, r, s) {
  const i = r / 2;
  let a = `M${M(e)} ${M(n)}Q${M(e + i / 2)} ${M(n - s * 2)} ${M(e + i)} ${M(n)}`;
  for (let o = e + i; o + i <= t + 0.01; o += i) a += `T${M(o + i)} ${M(n)}`;
  return a;
}
const gn = 4,
  AS = ["elegant", "modern", "luxus", "warm", "mutig", "natur"],
  xd = (e) => {
    const t = 4 + e,
      n = 96 - e * 1.1,
      r = 10 + e,
      s = 90 - e;
    return `M50 ${M(t)}L${M(s)} ${M(t + 10)}V46C${M(s)} ${M(72 - e * 0.6)} ${M(74 - e * 0.6)} ${M(87 - e * 0.6)} 50 ${M(n)}C${M(26 + e * 0.6)} ${M(87 - e * 0.6)} ${M(r)} ${M(72 - e * 0.6)} ${M(r)} 46V${M(t + 10)}Z`;
  },
  kd = (e) => [0, 1, 2, 3, 4, 5].map((t) => ei([50, 50], e, -90 + t * 60)),
  Yt = (e) => `fill="${e}"`,
  fu = [
    {
      key: "none",
      label: "Ohne",
      styles: [...AS],
      inner: { x: 0, y: 0, w: 100, h: 100 },
      render: () => "",
    },
    {
      key: "circle",
      label: "Kreis",
      styles: ["modern", "warm", "natur", "elegant"],
      inner: { x: 20, y: 20, w: 60, h: 60 },
      render: (e, t) =>
        t ? `<circle cx="50" cy="50" r="48" ${Yt(e.main)}/>` : G(at(50, 50, 46), e.main, gn),
    },
    {
      key: "ring",
      label: "Doppelter Ring",
      styles: ["elegant", "luxus", "natur"],
      inner: { x: 24, y: 24, w: 52, h: 52 },
      render: (e, t) =>
        t
          ? `<circle cx="50" cy="50" r="48" ${Yt(e.main)}/>` + G(at(50, 50, 42.5), e.knockout, 1.6)
          : G(at(50, 50, 46.5), e.main, 3) + G(at(50, 50, 40.5), e.main, 1.4),
    },
    {
      key: "square",
      label: "Quadrat",
      styles: ["modern", "mutig"],
      inner: { x: 20, y: 20, w: 60, h: 60 },
      render: (e, t) =>
        t
          ? `<rect x="4" y="4" width="92" height="92" ${Yt(e.main)}/>`
          : `<rect x="6" y="6" width="88" height="88" fill="none" stroke="${e.main}" stroke-width="${gn}"/>`,
    },
    {
      key: "rounded",
      label: "Abgerundet",
      styles: ["modern", "warm", "mutig"],
      inner: { x: 20, y: 20, w: 60, h: 60 },
      render: (e, t) =>
        t
          ? `<rect x="4" y="4" width="92" height="92" rx="24" ${Yt(e.main)}/>`
          : `<rect x="6" y="6" width="88" height="88" rx="22" fill="none" stroke="${e.main}" stroke-width="${gn}"/>`,
    },
    {
      key: "arch",
      label: "Rundbogen",
      styles: ["elegant", "luxus", "warm", "natur"],
      inner: { x: 23, y: 32, w: 54, h: 54 },
      render: (e, t) =>
        t ? `<path d="${nn(8, 92, 50, 96)}" ${Yt(e.main)}/>` : G(nn(10, 90, 50, 94), e.main, gn),
    },
    {
      key: "shield",
      label: "Schild",
      styles: ["luxus", "elegant", "mutig"],
      inner: { x: 24, y: 20, w: 52, h: 52 },
      render: (e, t) => (t ? `<path d="${xd(0)}" ${Yt(e.main)}/>` : G(xd(2.2), e.main, gn)),
    },
    {
      key: "hexagon",
      label: "Sechseck",
      styles: ["modern", "mutig", "natur"],
      inner: { x: 24, y: 24, w: 52, h: 52 },
      render: (e, t) =>
        t ? `<path d="${ne(kd(48), 5)}" ${Yt(e.main)}/>` : G(ne(kd(46), 4), e.main, gn),
    },
    {
      key: "diamond",
      label: "Raute",
      styles: ["luxus", "mutig", "elegant"],
      inner: { x: 29, y: 29, w: 42, h: 42 },
      render: (e, t) => {
        const n = (r) => [
          [50, 50 - r],
          [50 + r, 50],
          [50, 50 + r],
          [50 - r, 50],
        ];
        return t ? `<path d="${ne(n(48), 7)}" ${Yt(e.main)}/>` : G(ne(n(46), 6), e.main, gn);
      },
    },
    {
      key: "house",
      label: "Hausumriss",
      styles: ["warm", "modern", "natur"],
      inner: { x: 25, y: 36, w: 50, h: 50 },
      render: (e, t) =>
        t
          ? `<path d="${ne(It(50, 4, 42, 46, 96), [5, 4, 5, 5, 4])}" ${Yt(e.main)}/>`
          : G(ne(It(50, 7, 43, 44, 94), [3, 3, 4, 4, 3]), e.main, gn),
    },
  ];
/*! https://mths.be/codepointat v0.2.0 by @mathias */ String.prototype.codePointAt ||
  (function () {
    var e = (function () {
        try {
          var n = {},
            r = Object.defineProperty,
            s = r(n, n, n) && r;
        } catch {}
        return s;
      })(),
      t = function (n) {
        if (this == null) throw TypeError();
        var r = String(this),
          s = r.length,
          i = n ? Number(n) : 0;
        if ((i != i && (i = 0), !(i < 0 || i >= s))) {
          var a = r.charCodeAt(i),
            o;
          return a >= 55296 &&
            a <= 56319 &&
            s > i + 1 &&
            ((o = r.charCodeAt(i + 1)), o >= 56320 && o <= 57343)
            ? (a - 55296) * 1024 + o - 56320 + 65536
            : a;
        }
      };
    e
      ? e(String.prototype, "codePointAt", { value: t, configurable: !0, writable: !0 })
      : (String.prototype.codePointAt = t);
  })();
var Pc = 0,
  S0 = -3;
function ti() {
  ((this.table = new Uint16Array(16)), (this.trans = new Uint16Array(288)));
}
function BS(e, t) {
  ((this.source = e),
    (this.sourceIndex = 0),
    (this.tag = 0),
    (this.bitcount = 0),
    (this.dest = t),
    (this.destLen = 0),
    (this.ltree = new ti()),
    (this.dtree = new ti()));
}
var w0 = new ti(),
  b0 = new ti(),
  Dc = new Uint8Array(30),
  Uc = new Uint16Array(30),
  E0 = new Uint8Array(30),
  T0 = new Uint16Array(30),
  $S = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]),
  Sd = new ti(),
  jt = new Uint8Array(320);
function C0(e, t, n, r) {
  var s, i;
  for (s = 0; s < n; ++s) e[s] = 0;
  for (s = 0; s < 30 - n; ++s) e[s + n] = (s / n) | 0;
  for (i = r, s = 0; s < 30; ++s) ((t[s] = i), (i += 1 << e[s]));
}
function _S(e, t) {
  var n;
  for (n = 0; n < 7; ++n) e.table[n] = 0;
  for (e.table[7] = 24, e.table[8] = 152, e.table[9] = 112, n = 0; n < 24; ++n)
    e.trans[n] = 256 + n;
  for (n = 0; n < 144; ++n) e.trans[24 + n] = n;
  for (n = 0; n < 8; ++n) e.trans[168 + n] = 280 + n;
  for (n = 0; n < 112; ++n) e.trans[176 + n] = 144 + n;
  for (n = 0; n < 5; ++n) t.table[n] = 0;
  for (t.table[5] = 32, n = 0; n < 32; ++n) t.trans[n] = n;
}
var wd = new Uint16Array(16);
function nl(e, t, n, r) {
  var s, i;
  for (s = 0; s < 16; ++s) e.table[s] = 0;
  for (s = 0; s < r; ++s) e.table[t[n + s]]++;
  for (e.table[0] = 0, i = 0, s = 0; s < 16; ++s) ((wd[s] = i), (i += e.table[s]));
  for (s = 0; s < r; ++s) t[n + s] && (e.trans[wd[t[n + s]]++] = s);
}
function zS(e) {
  e.bitcount-- || ((e.tag = e.source[e.sourceIndex++]), (e.bitcount = 7));
  var t = e.tag & 1;
  return ((e.tag >>>= 1), t);
}
function Ht(e, t, n) {
  if (!t) return n;
  for (; e.bitcount < 24; ) ((e.tag |= e.source[e.sourceIndex++] << e.bitcount), (e.bitcount += 8));
  var r = e.tag & (65535 >>> (16 - t));
  return ((e.tag >>>= t), (e.bitcount -= t), r + n);
}
function du(e, t) {
  for (; e.bitcount < 24; ) ((e.tag |= e.source[e.sourceIndex++] << e.bitcount), (e.bitcount += 8));
  var n = 0,
    r = 0,
    s = 0,
    i = e.tag;
  do ((r = 2 * r + (i & 1)), (i >>>= 1), ++s, (n += t.table[s]), (r -= t.table[s]));
  while (r >= 0);
  return ((e.tag = i), (e.bitcount -= s), t.trans[n + r]);
}
function jS(e, t, n) {
  var r, s, i, a, o, l;
  for (r = Ht(e, 5, 257), s = Ht(e, 5, 1), i = Ht(e, 4, 4), a = 0; a < 19; ++a) jt[a] = 0;
  for (a = 0; a < i; ++a) {
    var u = Ht(e, 3, 0);
    jt[$S[a]] = u;
  }
  for (nl(Sd, jt, 0, 19), o = 0; o < r + s; ) {
    var c = du(e, Sd);
    switch (c) {
      case 16:
        var f = jt[o - 1];
        for (l = Ht(e, 2, 3); l; --l) jt[o++] = f;
        break;
      case 17:
        for (l = Ht(e, 3, 3); l; --l) jt[o++] = 0;
        break;
      case 18:
        for (l = Ht(e, 7, 11); l; --l) jt[o++] = 0;
        break;
      default:
        jt[o++] = c;
        break;
    }
  }
  (nl(t, jt, 0, r), nl(n, jt, r, s));
}
function bd(e, t, n) {
  for (;;) {
    var r = du(e, t);
    if (r === 256) return Pc;
    if (r < 256) e.dest[e.destLen++] = r;
    else {
      var s, i, a, o;
      for (
        r -= 257, s = Ht(e, Dc[r], Uc[r]), i = du(e, n), a = e.destLen - Ht(e, E0[i], T0[i]), o = a;
        o < a + s;
        ++o
      )
        e.dest[e.destLen++] = e.dest[o];
    }
  }
}
function GS(e) {
  for (var t, n, r; e.bitcount > 8; ) (e.sourceIndex--, (e.bitcount -= 8));
  if (
    ((t = e.source[e.sourceIndex + 1]),
    (t = 256 * t + e.source[e.sourceIndex]),
    (n = e.source[e.sourceIndex + 3]),
    (n = 256 * n + e.source[e.sourceIndex + 2]),
    t !== (~n & 65535))
  )
    return S0;
  for (e.sourceIndex += 4, r = t; r; --r) e.dest[e.destLen++] = e.source[e.sourceIndex++];
  return ((e.bitcount = 0), Pc);
}
function HS(e, t) {
  var n = new BS(e, t),
    r,
    s,
    i;
  do {
    switch (((r = zS(n)), (s = Ht(n, 2, 0)), s)) {
      case 0:
        i = GS(n);
        break;
      case 1:
        i = bd(n, w0, b0);
        break;
      case 2:
        (jS(n, n.ltree, n.dtree), (i = bd(n, n.ltree, n.dtree)));
        break;
      default:
        i = S0;
    }
    if (i !== Pc) throw new Error("Data error");
  } while (!r);
  return n.destLen < n.dest.length
    ? typeof n.dest.slice == "function"
      ? n.dest.slice(0, n.destLen)
      : n.dest.subarray(0, n.destLen)
    : n.dest;
}
_S(w0, b0);
C0(Dc, Uc, 4, 3);
C0(E0, T0, 2, 1);
Dc[28] = 0;
Uc[28] = 258;
var WS = HS;
function Sr(e, t, n, r, s) {
  return (
    Math.pow(1 - s, 3) * e +
    3 * Math.pow(1 - s, 2) * s * t +
    3 * (1 - s) * Math.pow(s, 2) * n +
    Math.pow(s, 3) * r
  );
}
function hn() {
  ((this.x1 = Number.NaN), (this.y1 = Number.NaN), (this.x2 = Number.NaN), (this.y2 = Number.NaN));
}
hn.prototype.isEmpty = function () {
  return isNaN(this.x1) || isNaN(this.y1) || isNaN(this.x2) || isNaN(this.y2);
};
hn.prototype.addPoint = function (e, t) {
  (typeof e == "number" &&
    ((isNaN(this.x1) || isNaN(this.x2)) && ((this.x1 = e), (this.x2 = e)),
    e < this.x1 && (this.x1 = e),
    e > this.x2 && (this.x2 = e)),
    typeof t == "number" &&
      ((isNaN(this.y1) || isNaN(this.y2)) && ((this.y1 = t), (this.y2 = t)),
      t < this.y1 && (this.y1 = t),
      t > this.y2 && (this.y2 = t)));
};
hn.prototype.addX = function (e) {
  this.addPoint(e, null);
};
hn.prototype.addY = function (e) {
  this.addPoint(null, e);
};
hn.prototype.addBezier = function (e, t, n, r, s, i, a, o) {
  var l = [e, t],
    u = [n, r],
    c = [s, i],
    f = [a, o];
  (this.addPoint(e, t), this.addPoint(a, o));
  for (var d = 0; d <= 1; d++) {
    var h = 6 * l[d] - 12 * u[d] + 6 * c[d],
      m = -3 * l[d] + 9 * u[d] - 9 * c[d] + 3 * f[d],
      x = 3 * u[d] - 3 * l[d];
    if (m === 0) {
      if (h === 0) continue;
      var k = -x / h;
      0 < k &&
        k < 1 &&
        (d === 0 && this.addX(Sr(l[d], u[d], c[d], f[d], k)),
        d === 1 && this.addY(Sr(l[d], u[d], c[d], f[d], k)));
      continue;
    }
    var p = Math.pow(h, 2) - 4 * x * m;
    if (!(p < 0)) {
      var g = (-h + Math.sqrt(p)) / (2 * m);
      0 < g &&
        g < 1 &&
        (d === 0 && this.addX(Sr(l[d], u[d], c[d], f[d], g)),
        d === 1 && this.addY(Sr(l[d], u[d], c[d], f[d], g)));
      var v = (-h - Math.sqrt(p)) / (2 * m);
      0 < v &&
        v < 1 &&
        (d === 0 && this.addX(Sr(l[d], u[d], c[d], f[d], v)),
        d === 1 && this.addY(Sr(l[d], u[d], c[d], f[d], v)));
    }
  }
};
hn.prototype.addQuad = function (e, t, n, r, s, i) {
  var a = e + 0.6666666666666666 * (n - e),
    o = t + (2 / 3) * (r - t),
    l = a + (1 / 3) * (s - e),
    u = o + (1 / 3) * (i - t);
  this.addBezier(e, t, a, o, l, u, s, i);
};
function Fe() {
  ((this.commands = []), (this.fill = "black"), (this.stroke = null), (this.strokeWidth = 1));
}
Fe.prototype.moveTo = function (e, t) {
  this.commands.push({ type: "M", x: e, y: t });
};
Fe.prototype.lineTo = function (e, t) {
  this.commands.push({ type: "L", x: e, y: t });
};
Fe.prototype.curveTo = Fe.prototype.bezierCurveTo = function (e, t, n, r, s, i) {
  this.commands.push({ type: "C", x1: e, y1: t, x2: n, y2: r, x: s, y: i });
};
Fe.prototype.quadTo = Fe.prototype.quadraticCurveTo = function (e, t, n, r) {
  this.commands.push({ type: "Q", x1: e, y1: t, x: n, y: r });
};
Fe.prototype.close = Fe.prototype.closePath = function () {
  this.commands.push({ type: "Z" });
};
Fe.prototype.extend = function (e) {
  if (e.commands) e = e.commands;
  else if (e instanceof hn) {
    var t = e;
    (this.moveTo(t.x1, t.y1),
      this.lineTo(t.x2, t.y1),
      this.lineTo(t.x2, t.y2),
      this.lineTo(t.x1, t.y2),
      this.close());
    return;
  }
  Array.prototype.push.apply(this.commands, e);
};
Fe.prototype.getBoundingBox = function () {
  for (var e = new hn(), t = 0, n = 0, r = 0, s = 0, i = 0; i < this.commands.length; i++) {
    var a = this.commands[i];
    switch (a.type) {
      case "M":
        (e.addPoint(a.x, a.y), (t = r = a.x), (n = s = a.y));
        break;
      case "L":
        (e.addPoint(a.x, a.y), (r = a.x), (s = a.y));
        break;
      case "Q":
        (e.addQuad(r, s, a.x1, a.y1, a.x, a.y), (r = a.x), (s = a.y));
        break;
      case "C":
        (e.addBezier(r, s, a.x1, a.y1, a.x2, a.y2, a.x, a.y), (r = a.x), (s = a.y));
        break;
      case "Z":
        ((r = t), (s = n));
        break;
      default:
        throw new Error("Unexpected path command " + a.type);
    }
  }
  return (e.isEmpty() && e.addPoint(0, 0), e);
};
Fe.prototype.draw = function (e) {
  e.beginPath();
  for (var t = 0; t < this.commands.length; t += 1) {
    var n = this.commands[t];
    n.type === "M"
      ? e.moveTo(n.x, n.y)
      : n.type === "L"
        ? e.lineTo(n.x, n.y)
        : n.type === "C"
          ? e.bezierCurveTo(n.x1, n.y1, n.x2, n.y2, n.x, n.y)
          : n.type === "Q"
            ? e.quadraticCurveTo(n.x1, n.y1, n.x, n.y)
            : n.type === "Z" && e.closePath();
  }
  (this.fill && ((e.fillStyle = this.fill), e.fill()),
    this.stroke && ((e.strokeStyle = this.stroke), (e.lineWidth = this.strokeWidth), e.stroke()));
};
Fe.prototype.toPathData = function (e) {
  e = e !== void 0 ? e : 2;
  function t(a) {
    return Math.round(a) === a ? "" + Math.round(a) : a.toFixed(e);
  }
  function n() {
    for (var a = arguments, o = "", l = 0; l < arguments.length; l += 1) {
      var u = a[l];
      (u >= 0 && l > 0 && (o += " "), (o += t(u)));
    }
    return o;
  }
  for (var r = "", s = 0; s < this.commands.length; s += 1) {
    var i = this.commands[s];
    i.type === "M"
      ? (r += "M" + n(i.x, i.y))
      : i.type === "L"
        ? (r += "L" + n(i.x, i.y))
        : i.type === "C"
          ? (r += "C" + n(i.x1, i.y1, i.x2, i.y2, i.x, i.y))
          : i.type === "Q"
            ? (r += "Q" + n(i.x1, i.y1, i.x, i.y))
            : i.type === "Z" && (r += "Z");
  }
  return r;
};
Fe.prototype.toSVG = function (e) {
  var t = '<path d="';
  return (
    (t += this.toPathData(e)),
    (t += '"'),
    this.fill &&
      this.fill !== "black" &&
      (this.fill === null ? (t += ' fill="none"') : (t += ' fill="' + this.fill + '"')),
    this.stroke && (t += ' stroke="' + this.stroke + '" stroke-width="' + this.strokeWidth + '"'),
    (t += "/>"),
    t
  );
};
Fe.prototype.toDOMElement = function (e) {
  var t = this.toPathData(e),
    n = document.createElementNS("http://www.w3.org/2000/svg", "path");
  return (n.setAttribute("d", t), n);
};
function L0(e) {
  throw new Error(e);
}
function Ed(e, t) {
  e || L0(t);
}
var V = { fail: L0, argument: Ed, assert: Ed },
  Td = 32768,
  Cd = 2147483648,
  es = {},
  D = {},
  K = {};
function Bt(e) {
  return function () {
    return e;
  };
}
D.BYTE = function (e) {
  return (V.argument(e >= 0 && e <= 255, "Byte value should be between 0 and 255."), [e]);
};
K.BYTE = Bt(1);
D.CHAR = function (e) {
  return [e.charCodeAt(0)];
};
K.CHAR = Bt(1);
D.CHARARRAY = function (e) {
  typeof e > "u" &&
    ((e = ""),
    console.warn(
      "Undefined CHARARRAY encountered and treated as an empty string. This is probably caused by a missing glyph name.",
    ));
  for (var t = [], n = 0; n < e.length; n += 1) t[n] = e.charCodeAt(n);
  return t;
};
K.CHARARRAY = function (e) {
  return typeof e > "u" ? 0 : e.length;
};
D.USHORT = function (e) {
  return [(e >> 8) & 255, e & 255];
};
K.USHORT = Bt(2);
D.SHORT = function (e) {
  return (e >= Td && (e = -(2 * Td - e)), [(e >> 8) & 255, e & 255]);
};
K.SHORT = Bt(2);
D.UINT24 = function (e) {
  return [(e >> 16) & 255, (e >> 8) & 255, e & 255];
};
K.UINT24 = Bt(3);
D.ULONG = function (e) {
  return [(e >> 24) & 255, (e >> 16) & 255, (e >> 8) & 255, e & 255];
};
K.ULONG = Bt(4);
D.LONG = function (e) {
  return (
    e >= Cd && (e = -(2 * Cd - e)),
    [(e >> 24) & 255, (e >> 16) & 255, (e >> 8) & 255, e & 255]
  );
};
K.LONG = Bt(4);
D.FIXED = D.ULONG;
K.FIXED = K.ULONG;
D.FWORD = D.SHORT;
K.FWORD = K.SHORT;
D.UFWORD = D.USHORT;
K.UFWORD = K.USHORT;
D.LONGDATETIME = function (e) {
  return [0, 0, 0, 0, (e >> 24) & 255, (e >> 16) & 255, (e >> 8) & 255, e & 255];
};
K.LONGDATETIME = Bt(8);
D.TAG = function (e) {
  return (
    V.argument(e.length === 4, "Tag should be exactly 4 ASCII characters."),
    [e.charCodeAt(0), e.charCodeAt(1), e.charCodeAt(2), e.charCodeAt(3)]
  );
};
K.TAG = Bt(4);
D.Card8 = D.BYTE;
K.Card8 = K.BYTE;
D.Card16 = D.USHORT;
K.Card16 = K.USHORT;
D.OffSize = D.BYTE;
K.OffSize = K.BYTE;
D.SID = D.USHORT;
K.SID = K.USHORT;
D.NUMBER = function (e) {
  return e >= -107 && e <= 107
    ? [e + 139]
    : e >= 108 && e <= 1131
      ? ((e = e - 108), [(e >> 8) + 247, e & 255])
      : e >= -1131 && e <= -108
        ? ((e = -e - 108), [(e >> 8) + 251, e & 255])
        : e >= -32768 && e <= 32767
          ? D.NUMBER16(e)
          : D.NUMBER32(e);
};
K.NUMBER = function (e) {
  return D.NUMBER(e).length;
};
D.NUMBER16 = function (e) {
  return [28, (e >> 8) & 255, e & 255];
};
K.NUMBER16 = Bt(3);
D.NUMBER32 = function (e) {
  return [29, (e >> 24) & 255, (e >> 16) & 255, (e >> 8) & 255, e & 255];
};
K.NUMBER32 = Bt(5);
D.REAL = function (e) {
  var t = e.toString(),
    n = /\.(\d*?)(?:9{5,20}|0{5,20})\d{0,2}(?:e(.+)|$)/.exec(t);
  if (n) {
    var r = parseFloat("1e" + ((n[2] ? +n[2] : 0) + n[1].length));
    t = (Math.round(e * r) / r).toString();
  }
  for (var s = "", i = 0, a = t.length; i < a; i += 1) {
    var o = t[i];
    o === "e"
      ? (s += t[++i] === "-" ? "c" : "b")
      : o === "."
        ? (s += "a")
        : o === "-"
          ? (s += "e")
          : (s += o);
  }
  s += s.length & 1 ? "f" : "ff";
  for (var l = [30], u = 0, c = s.length; u < c; u += 2) l.push(parseInt(s.substr(u, 2), 16));
  return l;
};
K.REAL = function (e) {
  return D.REAL(e).length;
};
D.NAME = D.CHARARRAY;
K.NAME = K.CHARARRAY;
D.STRING = D.CHARARRAY;
K.STRING = K.CHARARRAY;
es.UTF8 = function (e, t, n) {
  for (var r = [], s = n, i = 0; i < s; i++, t += 1) r[i] = e.getUint8(t);
  return String.fromCharCode.apply(null, r);
};
es.UTF16 = function (e, t, n) {
  for (var r = [], s = n / 2, i = 0; i < s; i++, t += 2) r[i] = e.getUint16(t);
  return String.fromCharCode.apply(null, r);
};
D.UTF16 = function (e) {
  for (var t = [], n = 0; n < e.length; n += 1) {
    var r = e.charCodeAt(n);
    ((t[t.length] = (r >> 8) & 255), (t[t.length] = r & 255));
  }
  return t;
};
K.UTF16 = function (e) {
  return e.length * 2;
};
var hu = {
  "x-mac-croatian":
    "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®Š™´¨≠ŽØ∞±≤≥∆µ∂∑∏š∫ªºΩžø¿¡¬√ƒ≈Ć«Č… ÀÃÕŒœĐ—“”‘’÷◊©⁄€‹›Æ»–·‚„‰ÂćÁčÈÍÎÏÌÓÔđÒÚÛÙıˆ˜¯πË˚¸Êæˇ",
  "x-mac-cyrillic":
    "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ†°Ґ£§•¶І®©™Ђђ≠Ѓѓ∞±≤≥іµґЈЄєЇїЉљЊњјЅ¬√ƒ≈∆«»… ЋћЌќѕ–—“”‘’÷„ЎўЏџ№Ёёяабвгдежзийклмнопрстуфхцчшщъыьэю",
  "x-mac-gaelic":
    "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØḂ±≤≥ḃĊċḊḋḞḟĠġṀæøṁṖṗɼƒſṠ«»… ÀÃÕŒœ–—“”‘’ṡẛÿŸṪ€‹›Ŷŷṫ·Ỳỳ⁊ÂÊÁËÈÍÎÏÌÓÔ♣ÒÚÛÙıÝýŴŵẄẅẀẁẂẃ",
  "x-mac-greek":
    "Ä¹²É³ÖÜ΅àâä΄¨çéèêë£™îï•½‰ôö¦€ùûü†ΓΔΘΛΞΠß®©ΣΪ§≠°·Α±≤≥¥ΒΕΖΗΙΚΜΦΫΨΩάΝ¬ΟΡ≈Τ«»… ΥΧΆΈœ–―“”‘’÷ΉΊΌΎέήίόΏύαβψδεφγηιξκλμνοπώρστθωςχυζϊϋΐΰ­",
  "x-mac-icelandic":
    "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûüÝ°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€ÐðÞþý·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ",
  "x-mac-inuit":
    "ᐃᐄᐅᐆᐊᐋᐱᐲᐳᐴᐸᐹᑉᑎᑏᑐᑑᑕᑖᑦᑭᑮᑯᑰᑲᑳᒃᒋᒌᒍᒎᒐᒑ°ᒡᒥᒦ•¶ᒧ®©™ᒨᒪᒫᒻᓂᓃᓄᓅᓇᓈᓐᓯᓰᓱᓲᓴᓵᔅᓕᓖᓗᓘᓚᓛᓪᔨᔩᔪᔫᔭ… ᔮᔾᕕᕖᕗ–—“”‘’ᕘᕙᕚᕝᕆᕇᕈᕉᕋᕌᕐᕿᖀᖁᖂᖃᖄᖅᖏᖐᖑᖒᖓᖔᖕᙱᙲᙳᙴᙵᙶᖖᖠᖡᖢᖣᖤᖥᖦᕼŁł",
  "x-mac-ce":
    "ÄĀāÉĄÖÜáąČäčĆćéŹźĎíďĒēĖóėôöõúĚěü†°Ę£§•¶ß®©™ę¨≠ģĮįĪ≤≥īĶ∂∑łĻļĽľĹĺŅņŃ¬√ńŇ∆«»… ňŐÕőŌ–—“”‘’÷◊ōŔŕŘ‹›řŖŗŠ‚„šŚśÁŤťÍŽžŪÓÔūŮÚůŰűŲųÝýķŻŁżĢˇ",
  macintosh:
    "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€‹›ﬁﬂ‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ",
  "x-mac-romanian":
    "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ĂȘ∞±≤≥¥µ∂∑∏π∫ªºΩăș¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€‹›Țț‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ",
  "x-mac-turkish":
    "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸĞğİıŞş‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙˆ˜¯˘˙˚¸˝˛ˇ",
};
es.MACSTRING = function (e, t, n, r) {
  var s = hu[r];
  if (s !== void 0) {
    for (var i = "", a = 0; a < n; a++) {
      var o = e.getUint8(t + a);
      o <= 127 ? (i += String.fromCharCode(o)) : (i += s[o & 127]);
    }
    return i;
  }
};
var _i = typeof WeakMap == "function" && new WeakMap(),
  zi,
  VS = function (e) {
    if (!zi) {
      zi = {};
      for (var t in hu) zi[t] = new String(t);
    }
    var n = zi[e];
    if (n !== void 0) {
      if (_i) {
        var r = _i.get(n);
        if (r !== void 0) return r;
      }
      var s = hu[e];
      if (s !== void 0) {
        for (var i = {}, a = 0; a < s.length; a++) i[s.charCodeAt(a)] = a + 128;
        return (_i && _i.set(n, i), i);
      }
    }
  };
D.MACSTRING = function (e, t) {
  var n = VS(t);
  if (n !== void 0) {
    for (var r = [], s = 0; s < e.length; s++) {
      var i = e.charCodeAt(s);
      if (i >= 128 && ((i = n[i]), i === void 0)) return;
      r[s] = i;
    }
    return r;
  }
};
K.MACSTRING = function (e, t) {
  var n = D.MACSTRING(e, t);
  return n !== void 0 ? n.length : 0;
};
function pu(e) {
  return e >= -128 && e <= 127;
}
function KS(e, t, n) {
  for (var r = 0, s = e.length; t < s && r < 64 && e[t] === 0; ) (++t, ++r);
  return (n.push(128 | (r - 1)), t);
}
function qS(e, t, n) {
  for (var r = 0, s = e.length, i = t; i < s && r < 64; ) {
    var a = e[i];
    if (!pu(a) || (a === 0 && i + 1 < s && e[i + 1] === 0)) break;
    (++i, ++r);
  }
  n.push(r - 1);
  for (var o = t; o < i; ++o) n.push((e[o] + 256) & 255);
  return i;
}
function XS(e, t, n) {
  for (var r = 0, s = e.length, i = t; i < s && r < 64; ) {
    var a = e[i];
    if (a === 0 || (pu(a) && i + 1 < s && pu(e[i + 1]))) break;
    (++i, ++r);
  }
  n.push(64 | (r - 1));
  for (var o = t; o < i; ++o) {
    var l = e[o];
    n.push(((l + 65536) >> 8) & 255, (l + 256) & 255);
  }
  return i;
}
D.VARDELTAS = function (e) {
  for (var t = 0, n = []; t < e.length; ) {
    var r = e[t];
    r === 0 ? (t = KS(e, t, n)) : r >= -128 && r <= 127 ? (t = qS(e, t, n)) : (t = XS(e, t, n));
  }
  return n;
};
D.INDEX = function (e) {
  for (var t = 1, n = [t], r = [], s = 0; s < e.length; s += 1) {
    var i = D.OBJECT(e[s]);
    (Array.prototype.push.apply(r, i), (t += i.length), n.push(t));
  }
  if (r.length === 0) return [0, 0];
  for (
    var a = [],
      o = (1 + Math.floor(Math.log(t) / Math.log(2)) / 8) | 0,
      l = [void 0, D.BYTE, D.USHORT, D.UINT24, D.ULONG][o],
      u = 0;
    u < n.length;
    u += 1
  ) {
    var c = l(n[u]);
    Array.prototype.push.apply(a, c);
  }
  return Array.prototype.concat(D.Card16(e.length), D.OffSize(o), a, r);
};
K.INDEX = function (e) {
  return D.INDEX(e).length;
};
D.DICT = function (e) {
  for (var t = [], n = Object.keys(e), r = n.length, s = 0; s < r; s += 1) {
    var i = parseInt(n[s], 0),
      a = e[i];
    ((t = t.concat(D.OPERAND(a.value, a.type))), (t = t.concat(D.OPERATOR(i))));
  }
  return t;
};
K.DICT = function (e) {
  return D.DICT(e).length;
};
D.OPERATOR = function (e) {
  return e < 1200 ? [e] : [12, e - 1200];
};
D.OPERAND = function (e, t) {
  var n = [];
  if (Array.isArray(t))
    for (var r = 0; r < t.length; r += 1)
      (V.argument(e.length === t.length, "Not enough arguments given for type" + t),
        (n = n.concat(D.OPERAND(e[r], t[r]))));
  else if (t === "SID") n = n.concat(D.NUMBER(e));
  else if (t === "offset") n = n.concat(D.NUMBER32(e));
  else if (t === "number") n = n.concat(D.NUMBER(e));
  else if (t === "real") n = n.concat(D.REAL(e));
  else throw new Error("Unknown operand type " + t);
  return n;
};
D.OP = D.BYTE;
K.OP = K.BYTE;
var ji = typeof WeakMap == "function" && new WeakMap();
D.CHARSTRING = function (e) {
  if (ji) {
    var t = ji.get(e);
    if (t !== void 0) return t;
  }
  for (var n = [], r = e.length, s = 0; s < r; s += 1) {
    var i = e[s];
    n = n.concat(D[i.type](i.value));
  }
  return (ji && ji.set(e, n), n);
};
K.CHARSTRING = function (e) {
  return D.CHARSTRING(e).length;
};
D.OBJECT = function (e) {
  var t = D[e.type];
  return (V.argument(t !== void 0, "No encoding function for type " + e.type), t(e.value));
};
K.OBJECT = function (e) {
  var t = K[e.type];
  return (V.argument(t !== void 0, "No sizeOf function for type " + e.type), t(e.value));
};
D.TABLE = function (e) {
  for (var t = [], n = e.fields.length, r = [], s = [], i = 0; i < n; i += 1) {
    var a = e.fields[i],
      o = D[a.type];
    V.argument(o !== void 0, "No encoding function for field type " + a.type + " (" + a.name + ")");
    var l = e[a.name];
    l === void 0 && (l = a.value);
    var u = o(l);
    a.type === "TABLE" ? (s.push(t.length), (t = t.concat([0, 0])), r.push(u)) : (t = t.concat(u));
  }
  for (var c = 0; c < r.length; c += 1) {
    var f = s[c],
      d = t.length;
    (V.argument(d < 65536, "Table " + e.tableName + " too big."),
      (t[f] = d >> 8),
      (t[f + 1] = d & 255),
      (t = t.concat(r[c])));
  }
  return t;
};
K.TABLE = function (e) {
  for (var t = 0, n = e.fields.length, r = 0; r < n; r += 1) {
    var s = e.fields[r],
      i = K[s.type];
    V.argument(i !== void 0, "No sizeOf function for field type " + s.type + " (" + s.name + ")");
    var a = e[s.name];
    (a === void 0 && (a = s.value), (t += i(a)), s.type === "TABLE" && (t += 2));
  }
  return t;
};
D.RECORD = D.TABLE;
K.RECORD = K.TABLE;
D.LITERAL = function (e) {
  return e;
};
K.LITERAL = function (e) {
  return e.length;
};
function Ie(e, t, n) {
  if (t.length && (t[0].name !== "coverageFormat" || t[0].value === 1))
    for (var r = 0; r < t.length; r += 1) {
      var s = t[r];
      this[s.name] = s.value;
    }
  if (((this.tableName = e), (this.fields = t), n))
    for (var i = Object.keys(n), a = 0; a < i.length; a += 1) {
      var o = i[a],
        l = n[o];
      this[o] !== void 0 && (this[o] = l);
    }
}
Ie.prototype.encode = function () {
  return D.TABLE(this);
};
Ie.prototype.sizeOf = function () {
  return K.TABLE(this);
};
function ni(e, t, n) {
  n === void 0 && (n = t.length);
  var r = new Array(t.length + 1);
  r[0] = { name: e + "Count", type: "USHORT", value: n };
  for (var s = 0; s < t.length; s++) r[s + 1] = { name: e + s, type: "USHORT", value: t[s] };
  return r;
}
function mu(e, t, n) {
  var r = t.length,
    s = new Array(r + 1);
  s[0] = { name: e + "Count", type: "USHORT", value: r };
  for (var i = 0; i < r; i++) s[i + 1] = { name: e + i, type: "TABLE", value: n(t[i], i) };
  return s;
}
function ri(e, t, n) {
  var r = t.length,
    s = [];
  s[0] = { name: e + "Count", type: "USHORT", value: r };
  for (var i = 0; i < r; i++) s = s.concat(n(t[i], i));
  return s;
}
function ja(e) {
  e.format === 1
    ? Ie.call(
        this,
        "coverageTable",
        [{ name: "coverageFormat", type: "USHORT", value: 1 }].concat(ni("glyph", e.glyphs)),
      )
    : e.format === 2
      ? Ie.call(
          this,
          "coverageTable",
          [{ name: "coverageFormat", type: "USHORT", value: 2 }].concat(
            ri("rangeRecord", e.ranges, function (t) {
              return [
                { name: "startGlyphID", type: "USHORT", value: t.start },
                { name: "endGlyphID", type: "USHORT", value: t.end },
                { name: "startCoverageIndex", type: "USHORT", value: t.index },
              ];
            }),
          ),
        )
      : V.assert(!1, "Coverage format must be 1 or 2.");
}
ja.prototype = Object.create(Ie.prototype);
ja.prototype.constructor = ja;
function Ga(e) {
  Ie.call(
    this,
    "scriptListTable",
    ri("scriptRecord", e, function (t, n) {
      var r = t.script,
        s = r.defaultLangSys;
      return (
        V.assert(!!s, "Unable to write GSUB: script " + t.tag + " has no default language system."),
        [
          { name: "scriptTag" + n, type: "TAG", value: t.tag },
          {
            name: "script" + n,
            type: "TABLE",
            value: new Ie(
              "scriptTable",
              [
                {
                  name: "defaultLangSys",
                  type: "TABLE",
                  value: new Ie(
                    "defaultLangSys",
                    [
                      { name: "lookupOrder", type: "USHORT", value: 0 },
                      { name: "reqFeatureIndex", type: "USHORT", value: s.reqFeatureIndex },
                    ].concat(ni("featureIndex", s.featureIndexes)),
                  ),
                },
              ].concat(
                ri("langSys", r.langSysRecords, function (i, a) {
                  var o = i.langSys;
                  return [
                    { name: "langSysTag" + a, type: "TAG", value: i.tag },
                    {
                      name: "langSys" + a,
                      type: "TABLE",
                      value: new Ie(
                        "langSys",
                        [
                          { name: "lookupOrder", type: "USHORT", value: 0 },
                          { name: "reqFeatureIndex", type: "USHORT", value: o.reqFeatureIndex },
                        ].concat(ni("featureIndex", o.featureIndexes)),
                      ),
                    },
                  ];
                }),
              ),
            ),
          },
        ]
      );
    }),
  );
}
Ga.prototype = Object.create(Ie.prototype);
Ga.prototype.constructor = Ga;
function Ha(e) {
  Ie.call(
    this,
    "featureListTable",
    ri("featureRecord", e, function (t, n) {
      var r = t.feature;
      return [
        { name: "featureTag" + n, type: "TAG", value: t.tag },
        {
          name: "feature" + n,
          type: "TABLE",
          value: new Ie(
            "featureTable",
            [{ name: "featureParams", type: "USHORT", value: r.featureParams }].concat(
              ni("lookupListIndex", r.lookupListIndexes),
            ),
          ),
        },
      ];
    }),
  );
}
Ha.prototype = Object.create(Ie.prototype);
Ha.prototype.constructor = Ha;
function Wa(e, t) {
  Ie.call(
    this,
    "lookupListTable",
    mu("lookup", e, function (n) {
      var r = t[n.lookupType];
      return (
        V.assert(!!r, "Unable to write GSUB lookup type " + n.lookupType + " tables."),
        new Ie(
          "lookupTable",
          [
            { name: "lookupType", type: "USHORT", value: n.lookupType },
            { name: "lookupFlag", type: "USHORT", value: n.lookupFlag },
          ].concat(mu("subtable", n.subtables, r)),
        )
      );
    }),
  );
}
Wa.prototype = Object.create(Ie.prototype);
Wa.prototype.constructor = Wa;
var U = {
  Table: Ie,
  Record: Ie,
  Coverage: ja,
  ScriptList: Ga,
  FeatureList: Ha,
  LookupList: Wa,
  ushortList: ni,
  tableList: mu,
  recordList: ri,
};
function Ld(e, t) {
  return e.getUint8(t);
}
function Va(e, t) {
  return e.getUint16(t, !1);
}
function ZS(e, t) {
  return e.getInt16(t, !1);
}
function Ac(e, t) {
  return e.getUint32(t, !1);
}
function F0(e, t) {
  var n = e.getInt16(t, !1),
    r = e.getUint16(t + 2, !1);
  return n + r / 65535;
}
function YS(e, t) {
  for (var n = "", r = t; r < t + 4; r += 1) n += String.fromCharCode(e.getInt8(r));
  return n;
}
function QS(e, t, n) {
  for (var r = 0, s = 0; s < n; s += 1) ((r <<= 8), (r += e.getUint8(t + s)));
  return r;
}
function JS(e, t, n) {
  for (var r = [], s = t; s < n; s += 1) r.push(e.getUint8(s));
  return r;
}
function ew(e) {
  for (var t = "", n = 0; n < e.length; n += 1) t += String.fromCharCode(e[n]);
  return t;
}
var tw = { byte: 1, uShort: 2, short: 2, uLong: 4, fixed: 4, longDateTime: 8, tag: 4 };
function w(e, t) {
  ((this.data = e), (this.offset = t), (this.relativeOffset = 0));
}
w.prototype.parseByte = function () {
  var e = this.data.getUint8(this.offset + this.relativeOffset);
  return ((this.relativeOffset += 1), e);
};
w.prototype.parseChar = function () {
  var e = this.data.getInt8(this.offset + this.relativeOffset);
  return ((this.relativeOffset += 1), e);
};
w.prototype.parseCard8 = w.prototype.parseByte;
w.prototype.parseUShort = function () {
  var e = this.data.getUint16(this.offset + this.relativeOffset);
  return ((this.relativeOffset += 2), e);
};
w.prototype.parseCard16 = w.prototype.parseUShort;
w.prototype.parseSID = w.prototype.parseUShort;
w.prototype.parseOffset16 = w.prototype.parseUShort;
w.prototype.parseShort = function () {
  var e = this.data.getInt16(this.offset + this.relativeOffset);
  return ((this.relativeOffset += 2), e);
};
w.prototype.parseF2Dot14 = function () {
  var e = this.data.getInt16(this.offset + this.relativeOffset) / 16384;
  return ((this.relativeOffset += 2), e);
};
w.prototype.parseULong = function () {
  var e = Ac(this.data, this.offset + this.relativeOffset);
  return ((this.relativeOffset += 4), e);
};
w.prototype.parseOffset32 = w.prototype.parseULong;
w.prototype.parseFixed = function () {
  var e = F0(this.data, this.offset + this.relativeOffset);
  return ((this.relativeOffset += 4), e);
};
w.prototype.parseString = function (e) {
  var t = this.data,
    n = this.offset + this.relativeOffset,
    r = "";
  this.relativeOffset += e;
  for (var s = 0; s < e; s++) r += String.fromCharCode(t.getUint8(n + s));
  return r;
};
w.prototype.parseTag = function () {
  return this.parseString(4);
};
w.prototype.parseLongDateTime = function () {
  var e = Ac(this.data, this.offset + this.relativeOffset + 4);
  return ((e -= 2082844800), (this.relativeOffset += 8), e);
};
w.prototype.parseVersion = function (e) {
  var t = Va(this.data, this.offset + this.relativeOffset),
    n = Va(this.data, this.offset + this.relativeOffset + 2);
  return ((this.relativeOffset += 4), e === void 0 && (e = 4096), t + n / e / 10);
};
w.prototype.skip = function (e, t) {
  (t === void 0 && (t = 1), (this.relativeOffset += tw[e] * t));
};
w.prototype.parseULongList = function (e) {
  e === void 0 && (e = this.parseULong());
  for (
    var t = new Array(e), n = this.data, r = this.offset + this.relativeOffset, s = 0;
    s < e;
    s++
  )
    ((t[s] = n.getUint32(r)), (r += 4));
  return ((this.relativeOffset += e * 4), t);
};
w.prototype.parseOffset16List = w.prototype.parseUShortList = function (e) {
  e === void 0 && (e = this.parseUShort());
  for (
    var t = new Array(e), n = this.data, r = this.offset + this.relativeOffset, s = 0;
    s < e;
    s++
  )
    ((t[s] = n.getUint16(r)), (r += 2));
  return ((this.relativeOffset += e * 2), t);
};
w.prototype.parseShortList = function (e) {
  for (
    var t = new Array(e), n = this.data, r = this.offset + this.relativeOffset, s = 0;
    s < e;
    s++
  )
    ((t[s] = n.getInt16(r)), (r += 2));
  return ((this.relativeOffset += e * 2), t);
};
w.prototype.parseByteList = function (e) {
  for (
    var t = new Array(e), n = this.data, r = this.offset + this.relativeOffset, s = 0;
    s < e;
    s++
  )
    t[s] = n.getUint8(r++);
  return ((this.relativeOffset += e), t);
};
w.prototype.parseList = function (e, t) {
  t || ((t = e), (e = this.parseUShort()));
  for (var n = new Array(e), r = 0; r < e; r++) n[r] = t.call(this);
  return n;
};
w.prototype.parseList32 = function (e, t) {
  t || ((t = e), (e = this.parseULong()));
  for (var n = new Array(e), r = 0; r < e; r++) n[r] = t.call(this);
  return n;
};
w.prototype.parseRecordList = function (e, t) {
  t || ((t = e), (e = this.parseUShort()));
  for (var n = new Array(e), r = Object.keys(t), s = 0; s < e; s++) {
    for (var i = {}, a = 0; a < r.length; a++) {
      var o = r[a],
        l = t[o];
      i[o] = l.call(this);
    }
    n[s] = i;
  }
  return n;
};
w.prototype.parseRecordList32 = function (e, t) {
  t || ((t = e), (e = this.parseULong()));
  for (var n = new Array(e), r = Object.keys(t), s = 0; s < e; s++) {
    for (var i = {}, a = 0; a < r.length; a++) {
      var o = r[a],
        l = t[o];
      i[o] = l.call(this);
    }
    n[s] = i;
  }
  return n;
};
w.prototype.parseStruct = function (e) {
  if (typeof e == "function") return e.call(this);
  for (var t = Object.keys(e), n = {}, r = 0; r < t.length; r++) {
    var s = t[r],
      i = e[s];
    n[s] = i.call(this);
  }
  return n;
};
w.prototype.parseValueRecord = function (e) {
  if ((e === void 0 && (e = this.parseUShort()), e !== 0)) {
    var t = {};
    return (
      e & 1 && (t.xPlacement = this.parseShort()),
      e & 2 && (t.yPlacement = this.parseShort()),
      e & 4 && (t.xAdvance = this.parseShort()),
      e & 8 && (t.yAdvance = this.parseShort()),
      e & 16 && ((t.xPlaDevice = void 0), this.parseShort()),
      e & 32 && ((t.yPlaDevice = void 0), this.parseShort()),
      e & 64 && ((t.xAdvDevice = void 0), this.parseShort()),
      e & 128 && ((t.yAdvDevice = void 0), this.parseShort()),
      t
    );
  }
};
w.prototype.parseValueRecordList = function () {
  for (var e = this.parseUShort(), t = this.parseUShort(), n = new Array(t), r = 0; r < t; r++)
    n[r] = this.parseValueRecord(e);
  return n;
};
w.prototype.parsePointer = function (e) {
  var t = this.parseOffset16();
  if (t > 0) return new w(this.data, this.offset + t).parseStruct(e);
};
w.prototype.parsePointer32 = function (e) {
  var t = this.parseOffset32();
  if (t > 0) return new w(this.data, this.offset + t).parseStruct(e);
};
w.prototype.parseListOfLists = function (e) {
  for (
    var t = this.parseOffset16List(),
      n = t.length,
      r = this.relativeOffset,
      s = new Array(n),
      i = 0;
    i < n;
    i++
  ) {
    var a = t[i];
    if (a === 0) {
      s[i] = void 0;
      continue;
    }
    if (((this.relativeOffset = a), e)) {
      for (var o = this.parseOffset16List(), l = new Array(o.length), u = 0; u < o.length; u++)
        ((this.relativeOffset = a + o[u]), (l[u] = e.call(this)));
      s[i] = l;
    } else s[i] = this.parseUShortList();
  }
  return ((this.relativeOffset = r), s);
};
w.prototype.parseCoverage = function () {
  var e = this.offset + this.relativeOffset,
    t = this.parseUShort(),
    n = this.parseUShort();
  if (t === 1) return { format: 1, glyphs: this.parseUShortList(n) };
  if (t === 2) {
    for (var r = new Array(n), s = 0; s < n; s++)
      r[s] = { start: this.parseUShort(), end: this.parseUShort(), index: this.parseUShort() };
    return { format: 2, ranges: r };
  }
  throw new Error("0x" + e.toString(16) + ": Coverage format must be 1 or 2.");
};
w.prototype.parseClassDef = function () {
  var e = this.offset + this.relativeOffset,
    t = this.parseUShort();
  if (t === 1)
    return { format: 1, startGlyph: this.parseUShort(), classes: this.parseUShortList() };
  if (t === 2)
    return {
      format: 2,
      ranges: this.parseRecordList({ start: w.uShort, end: w.uShort, classId: w.uShort }),
    };
  throw new Error("0x" + e.toString(16) + ": ClassDef format must be 1 or 2.");
};
w.list = function (e, t) {
  return function () {
    return this.parseList(e, t);
  };
};
w.list32 = function (e, t) {
  return function () {
    return this.parseList32(e, t);
  };
};
w.recordList = function (e, t) {
  return function () {
    return this.parseRecordList(e, t);
  };
};
w.recordList32 = function (e, t) {
  return function () {
    return this.parseRecordList32(e, t);
  };
};
w.pointer = function (e) {
  return function () {
    return this.parsePointer(e);
  };
};
w.pointer32 = function (e) {
  return function () {
    return this.parsePointer32(e);
  };
};
w.tag = w.prototype.parseTag;
w.byte = w.prototype.parseByte;
w.uShort = w.offset16 = w.prototype.parseUShort;
w.uShortList = w.prototype.parseUShortList;
w.uLong = w.offset32 = w.prototype.parseULong;
w.uLongList = w.prototype.parseULongList;
w.struct = w.prototype.parseStruct;
w.coverage = w.prototype.parseCoverage;
w.classDef = w.prototype.parseClassDef;
var Fd = { reserved: w.uShort, reqFeatureIndex: w.uShort, featureIndexes: w.uShortList };
w.prototype.parseScriptList = function () {
  return (
    this.parsePointer(
      w.recordList({
        tag: w.tag,
        script: w.pointer({
          defaultLangSys: w.pointer(Fd),
          langSysRecords: w.recordList({ tag: w.tag, langSys: w.pointer(Fd) }),
        }),
      }),
    ) || []
  );
};
w.prototype.parseFeatureList = function () {
  return (
    this.parsePointer(
      w.recordList({
        tag: w.tag,
        feature: w.pointer({ featureParams: w.offset16, lookupListIndexes: w.uShortList }),
      }),
    ) || []
  );
};
w.prototype.parseLookupList = function (e) {
  return (
    this.parsePointer(
      w.list(
        w.pointer(function () {
          var t = this.parseUShort();
          V.argument(1 <= t && t <= 9, "GPOS/GSUB lookup type " + t + " unknown.");
          var n = this.parseUShort(),
            r = n & 16;
          return {
            lookupType: t,
            lookupFlag: n,
            subtables: this.parseList(w.pointer(e[t])),
            markFilteringSet: r ? this.parseUShort() : void 0,
          };
        }),
      ),
    ) || []
  );
};
w.prototype.parseFeatureVariationsList = function () {
  return (
    this.parsePointer32(function () {
      var e = this.parseUShort(),
        t = this.parseUShort();
      V.argument(e === 1 && t < 1, "GPOS/GSUB feature variations table unknown.");
      var n = this.parseRecordList32({
        conditionSetOffset: w.offset32,
        featureTableSubstitutionOffset: w.offset32,
      });
      return n;
    }) || []
  );
};
var z = {
  getByte: Ld,
  getCard8: Ld,
  getUShort: Va,
  getCard16: Va,
  getShort: ZS,
  getULong: Ac,
  getFixed: F0,
  getTag: YS,
  getOffset: QS,
  getBytes: JS,
  bytesToString: ew,
  Parser: w,
};
function nw(e, t) {
  (t.parseUShort(), (e.length = t.parseULong()), (e.language = t.parseULong()));
  var n;
  ((e.groupCount = n = t.parseULong()), (e.glyphIndexMap = {}));
  for (var r = 0; r < n; r += 1)
    for (var s = t.parseULong(), i = t.parseULong(), a = t.parseULong(), o = s; o <= i; o += 1)
      ((e.glyphIndexMap[o] = a), a++);
}
function rw(e, t, n, r, s) {
  ((e.length = t.parseUShort()), (e.language = t.parseUShort()));
  var i;
  ((e.segCount = i = t.parseUShort() >> 1), t.skip("uShort", 3), (e.glyphIndexMap = {}));
  for (
    var a = new z.Parser(n, r + s + 14),
      o = new z.Parser(n, r + s + 16 + i * 2),
      l = new z.Parser(n, r + s + 16 + i * 4),
      u = new z.Parser(n, r + s + 16 + i * 6),
      c = r + s + 16 + i * 8,
      f = 0;
    f < i - 1;
    f += 1
  )
    for (
      var d = void 0,
        h = a.parseUShort(),
        m = o.parseUShort(),
        x = l.parseShort(),
        k = u.parseUShort(),
        p = m;
      p <= h;
      p += 1
    )
      (k !== 0
        ? ((c = u.offset + u.relativeOffset - 2),
          (c += k),
          (c += (p - m) * 2),
          (d = z.getUShort(n, c)),
          d !== 0 && (d = (d + x) & 65535))
        : (d = (p + x) & 65535),
        (e.glyphIndexMap[p] = d));
}
function sw(e, t) {
  var n = {};
  ((n.version = z.getUShort(e, t)),
    V.argument(n.version === 0, "cmap table version should be 0."),
    (n.numTables = z.getUShort(e, t + 2)));
  for (var r = -1, s = n.numTables - 1; s >= 0; s -= 1) {
    var i = z.getUShort(e, t + 4 + s * 8),
      a = z.getUShort(e, t + 4 + s * 8 + 2);
    if (
      (i === 3 && (a === 0 || a === 1 || a === 10)) ||
      (i === 0 && (a === 0 || a === 1 || a === 2 || a === 3 || a === 4))
    ) {
      r = z.getULong(e, t + 4 + s * 8 + 4);
      break;
    }
  }
  if (r === -1) throw new Error("No valid cmap sub-tables found.");
  var o = new z.Parser(e, t + r);
  if (((n.format = o.parseUShort()), n.format === 12)) nw(n, o);
  else if (n.format === 4) rw(n, o, e, t, r);
  else
    throw new Error(
      "Only format 4 and 12 cmap tables are supported (found format " + n.format + ").",
    );
  return n;
}
function iw(e, t, n) {
  e.segments.push({ end: t, start: t, delta: -(t - n), offset: 0, glyphIndex: n });
}
function aw(e) {
  e.segments.push({ end: 65535, start: 65535, delta: 1, offset: 0 });
}
function ow(e) {
  var t = !0,
    n;
  for (n = e.length - 1; n > 0; n -= 1) {
    var r = e.get(n);
    if (r.unicode > 65535) {
      (console.log("Adding CMAP format 12 (needed!)"), (t = !1));
      break;
    }
  }
  var s = [
    { name: "version", type: "USHORT", value: 0 },
    { name: "numTables", type: "USHORT", value: t ? 1 : 2 },
    { name: "platformID", type: "USHORT", value: 3 },
    { name: "encodingID", type: "USHORT", value: 1 },
    { name: "offset", type: "ULONG", value: t ? 12 : 20 },
  ];
  (t ||
    (s = s.concat([
      { name: "cmap12PlatformID", type: "USHORT", value: 3 },
      { name: "cmap12EncodingID", type: "USHORT", value: 10 },
      { name: "cmap12Offset", type: "ULONG", value: 0 },
    ])),
    (s = s.concat([
      { name: "format", type: "USHORT", value: 4 },
      { name: "cmap4Length", type: "USHORT", value: 0 },
      { name: "language", type: "USHORT", value: 0 },
      { name: "segCountX2", type: "USHORT", value: 0 },
      { name: "searchRange", type: "USHORT", value: 0 },
      { name: "entrySelector", type: "USHORT", value: 0 },
      { name: "rangeShift", type: "USHORT", value: 0 },
    ])));
  var i = new U.Table("cmap", s);
  for (i.segments = [], n = 0; n < e.length; n += 1) {
    for (var a = e.get(n), o = 0; o < a.unicodes.length; o += 1) iw(i, a.unicodes[o], n);
    i.segments = i.segments.sort(function (g, v) {
      return g.start - v.start;
    });
  }
  aw(i);
  var l = i.segments.length,
    u = 0,
    c = [],
    f = [],
    d = [],
    h = [],
    m = [],
    x = [];
  for (n = 0; n < l; n += 1) {
    var k = i.segments[n];
    (k.end <= 65535 && k.start <= 65535
      ? ((c = c.concat({ name: "end_" + n, type: "USHORT", value: k.end })),
        (f = f.concat({ name: "start_" + n, type: "USHORT", value: k.start })),
        (d = d.concat({ name: "idDelta_" + n, type: "SHORT", value: k.delta })),
        (h = h.concat({ name: "idRangeOffset_" + n, type: "USHORT", value: k.offset })),
        k.glyphId !== void 0 &&
          (m = m.concat({ name: "glyph_" + n, type: "USHORT", value: k.glyphId })))
      : (u += 1),
      !t &&
        k.glyphIndex !== void 0 &&
        ((x = x.concat({ name: "cmap12Start_" + n, type: "ULONG", value: k.start })),
        (x = x.concat({ name: "cmap12End_" + n, type: "ULONG", value: k.end })),
        (x = x.concat({ name: "cmap12Glyph_" + n, type: "ULONG", value: k.glyphIndex }))));
  }
  if (
    ((i.segCountX2 = (l - u) * 2),
    (i.searchRange = Math.pow(2, Math.floor(Math.log(l - u) / Math.log(2))) * 2),
    (i.entrySelector = Math.log(i.searchRange / 2) / Math.log(2)),
    (i.rangeShift = i.segCountX2 - i.searchRange),
    (i.fields = i.fields.concat(c)),
    i.fields.push({ name: "reservedPad", type: "USHORT", value: 0 }),
    (i.fields = i.fields.concat(f)),
    (i.fields = i.fields.concat(d)),
    (i.fields = i.fields.concat(h)),
    (i.fields = i.fields.concat(m)),
    (i.cmap4Length =
      14 + c.length * 2 + 2 + f.length * 2 + d.length * 2 + h.length * 2 + m.length * 2),
    !t)
  ) {
    var p = 16 + x.length * 4;
    ((i.cmap12Offset = 12 + 2 * 2 + 4 + i.cmap4Length),
      (i.fields = i.fields.concat([
        { name: "cmap12Format", type: "USHORT", value: 12 },
        { name: "cmap12Reserved", type: "USHORT", value: 0 },
        { name: "cmap12Length", type: "ULONG", value: p },
        { name: "cmap12Language", type: "ULONG", value: 0 },
        { name: "cmap12nGroups", type: "ULONG", value: x.length / 3 },
      ])),
      (i.fields = i.fields.concat(x)));
  }
  return i;
}
var M0 = { parse: sw, make: ow },
  fa = [
    ".notdef",
    "space",
    "exclam",
    "quotedbl",
    "numbersign",
    "dollar",
    "percent",
    "ampersand",
    "quoteright",
    "parenleft",
    "parenright",
    "asterisk",
    "plus",
    "comma",
    "hyphen",
    "period",
    "slash",
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "colon",
    "semicolon",
    "less",
    "equal",
    "greater",
    "question",
    "at",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "bracketleft",
    "backslash",
    "bracketright",
    "asciicircum",
    "underscore",
    "quoteleft",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "braceleft",
    "bar",
    "braceright",
    "asciitilde",
    "exclamdown",
    "cent",
    "sterling",
    "fraction",
    "yen",
    "florin",
    "section",
    "currency",
    "quotesingle",
    "quotedblleft",
    "guillemotleft",
    "guilsinglleft",
    "guilsinglright",
    "fi",
    "fl",
    "endash",
    "dagger",
    "daggerdbl",
    "periodcentered",
    "paragraph",
    "bullet",
    "quotesinglbase",
    "quotedblbase",
    "quotedblright",
    "guillemotright",
    "ellipsis",
    "perthousand",
    "questiondown",
    "grave",
    "acute",
    "circumflex",
    "tilde",
    "macron",
    "breve",
    "dotaccent",
    "dieresis",
    "ring",
    "cedilla",
    "hungarumlaut",
    "ogonek",
    "caron",
    "emdash",
    "AE",
    "ordfeminine",
    "Lslash",
    "Oslash",
    "OE",
    "ordmasculine",
    "ae",
    "dotlessi",
    "lslash",
    "oslash",
    "oe",
    "germandbls",
    "onesuperior",
    "logicalnot",
    "mu",
    "trademark",
    "Eth",
    "onehalf",
    "plusminus",
    "Thorn",
    "onequarter",
    "divide",
    "brokenbar",
    "degree",
    "thorn",
    "threequarters",
    "twosuperior",
    "registered",
    "minus",
    "eth",
    "multiply",
    "threesuperior",
    "copyright",
    "Aacute",
    "Acircumflex",
    "Adieresis",
    "Agrave",
    "Aring",
    "Atilde",
    "Ccedilla",
    "Eacute",
    "Ecircumflex",
    "Edieresis",
    "Egrave",
    "Iacute",
    "Icircumflex",
    "Idieresis",
    "Igrave",
    "Ntilde",
    "Oacute",
    "Ocircumflex",
    "Odieresis",
    "Ograve",
    "Otilde",
    "Scaron",
    "Uacute",
    "Ucircumflex",
    "Udieresis",
    "Ugrave",
    "Yacute",
    "Ydieresis",
    "Zcaron",
    "aacute",
    "acircumflex",
    "adieresis",
    "agrave",
    "aring",
    "atilde",
    "ccedilla",
    "eacute",
    "ecircumflex",
    "edieresis",
    "egrave",
    "iacute",
    "icircumflex",
    "idieresis",
    "igrave",
    "ntilde",
    "oacute",
    "ocircumflex",
    "odieresis",
    "ograve",
    "otilde",
    "scaron",
    "uacute",
    "ucircumflex",
    "udieresis",
    "ugrave",
    "yacute",
    "ydieresis",
    "zcaron",
    "exclamsmall",
    "Hungarumlautsmall",
    "dollaroldstyle",
    "dollarsuperior",
    "ampersandsmall",
    "Acutesmall",
    "parenleftsuperior",
    "parenrightsuperior",
    "266 ff",
    "onedotenleader",
    "zerooldstyle",
    "oneoldstyle",
    "twooldstyle",
    "threeoldstyle",
    "fouroldstyle",
    "fiveoldstyle",
    "sixoldstyle",
    "sevenoldstyle",
    "eightoldstyle",
    "nineoldstyle",
    "commasuperior",
    "threequartersemdash",
    "periodsuperior",
    "questionsmall",
    "asuperior",
    "bsuperior",
    "centsuperior",
    "dsuperior",
    "esuperior",
    "isuperior",
    "lsuperior",
    "msuperior",
    "nsuperior",
    "osuperior",
    "rsuperior",
    "ssuperior",
    "tsuperior",
    "ff",
    "ffi",
    "ffl",
    "parenleftinferior",
    "parenrightinferior",
    "Circumflexsmall",
    "hyphensuperior",
    "Gravesmall",
    "Asmall",
    "Bsmall",
    "Csmall",
    "Dsmall",
    "Esmall",
    "Fsmall",
    "Gsmall",
    "Hsmall",
    "Ismall",
    "Jsmall",
    "Ksmall",
    "Lsmall",
    "Msmall",
    "Nsmall",
    "Osmall",
    "Psmall",
    "Qsmall",
    "Rsmall",
    "Ssmall",
    "Tsmall",
    "Usmall",
    "Vsmall",
    "Wsmall",
    "Xsmall",
    "Ysmall",
    "Zsmall",
    "colonmonetary",
    "onefitted",
    "rupiah",
    "Tildesmall",
    "exclamdownsmall",
    "centoldstyle",
    "Lslashsmall",
    "Scaronsmall",
    "Zcaronsmall",
    "Dieresissmall",
    "Brevesmall",
    "Caronsmall",
    "Dotaccentsmall",
    "Macronsmall",
    "figuredash",
    "hypheninferior",
    "Ogoneksmall",
    "Ringsmall",
    "Cedillasmall",
    "questiondownsmall",
    "oneeighth",
    "threeeighths",
    "fiveeighths",
    "seveneighths",
    "onethird",
    "twothirds",
    "zerosuperior",
    "foursuperior",
    "fivesuperior",
    "sixsuperior",
    "sevensuperior",
    "eightsuperior",
    "ninesuperior",
    "zeroinferior",
    "oneinferior",
    "twoinferior",
    "threeinferior",
    "fourinferior",
    "fiveinferior",
    "sixinferior",
    "seveninferior",
    "eightinferior",
    "nineinferior",
    "centinferior",
    "dollarinferior",
    "periodinferior",
    "commainferior",
    "Agravesmall",
    "Aacutesmall",
    "Acircumflexsmall",
    "Atildesmall",
    "Adieresissmall",
    "Aringsmall",
    "AEsmall",
    "Ccedillasmall",
    "Egravesmall",
    "Eacutesmall",
    "Ecircumflexsmall",
    "Edieresissmall",
    "Igravesmall",
    "Iacutesmall",
    "Icircumflexsmall",
    "Idieresissmall",
    "Ethsmall",
    "Ntildesmall",
    "Ogravesmall",
    "Oacutesmall",
    "Ocircumflexsmall",
    "Otildesmall",
    "Odieresissmall",
    "OEsmall",
    "Oslashsmall",
    "Ugravesmall",
    "Uacutesmall",
    "Ucircumflexsmall",
    "Udieresissmall",
    "Yacutesmall",
    "Thornsmall",
    "Ydieresissmall",
    "001.000",
    "001.001",
    "001.002",
    "001.003",
    "Black",
    "Bold",
    "Book",
    "Light",
    "Medium",
    "Regular",
    "Roman",
    "Semibold",
  ],
  lw = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "space",
    "exclam",
    "quotedbl",
    "numbersign",
    "dollar",
    "percent",
    "ampersand",
    "quoteright",
    "parenleft",
    "parenright",
    "asterisk",
    "plus",
    "comma",
    "hyphen",
    "period",
    "slash",
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "colon",
    "semicolon",
    "less",
    "equal",
    "greater",
    "question",
    "at",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "bracketleft",
    "backslash",
    "bracketright",
    "asciicircum",
    "underscore",
    "quoteleft",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "braceleft",
    "bar",
    "braceright",
    "asciitilde",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "exclamdown",
    "cent",
    "sterling",
    "fraction",
    "yen",
    "florin",
    "section",
    "currency",
    "quotesingle",
    "quotedblleft",
    "guillemotleft",
    "guilsinglleft",
    "guilsinglright",
    "fi",
    "fl",
    "",
    "endash",
    "dagger",
    "daggerdbl",
    "periodcentered",
    "",
    "paragraph",
    "bullet",
    "quotesinglbase",
    "quotedblbase",
    "quotedblright",
    "guillemotright",
    "ellipsis",
    "perthousand",
    "",
    "questiondown",
    "",
    "grave",
    "acute",
    "circumflex",
    "tilde",
    "macron",
    "breve",
    "dotaccent",
    "dieresis",
    "",
    "ring",
    "cedilla",
    "",
    "hungarumlaut",
    "ogonek",
    "caron",
    "emdash",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "AE",
    "",
    "ordfeminine",
    "",
    "",
    "",
    "",
    "Lslash",
    "Oslash",
    "OE",
    "ordmasculine",
    "",
    "",
    "",
    "",
    "",
    "ae",
    "",
    "",
    "",
    "dotlessi",
    "",
    "",
    "lslash",
    "oslash",
    "oe",
    "germandbls",
  ],
  uw = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "space",
    "exclamsmall",
    "Hungarumlautsmall",
    "",
    "dollaroldstyle",
    "dollarsuperior",
    "ampersandsmall",
    "Acutesmall",
    "parenleftsuperior",
    "parenrightsuperior",
    "twodotenleader",
    "onedotenleader",
    "comma",
    "hyphen",
    "period",
    "fraction",
    "zerooldstyle",
    "oneoldstyle",
    "twooldstyle",
    "threeoldstyle",
    "fouroldstyle",
    "fiveoldstyle",
    "sixoldstyle",
    "sevenoldstyle",
    "eightoldstyle",
    "nineoldstyle",
    "colon",
    "semicolon",
    "commasuperior",
    "threequartersemdash",
    "periodsuperior",
    "questionsmall",
    "",
    "asuperior",
    "bsuperior",
    "centsuperior",
    "dsuperior",
    "esuperior",
    "",
    "",
    "isuperior",
    "",
    "",
    "lsuperior",
    "msuperior",
    "nsuperior",
    "osuperior",
    "",
    "",
    "rsuperior",
    "ssuperior",
    "tsuperior",
    "",
    "ff",
    "fi",
    "fl",
    "ffi",
    "ffl",
    "parenleftinferior",
    "",
    "parenrightinferior",
    "Circumflexsmall",
    "hyphensuperior",
    "Gravesmall",
    "Asmall",
    "Bsmall",
    "Csmall",
    "Dsmall",
    "Esmall",
    "Fsmall",
    "Gsmall",
    "Hsmall",
    "Ismall",
    "Jsmall",
    "Ksmall",
    "Lsmall",
    "Msmall",
    "Nsmall",
    "Osmall",
    "Psmall",
    "Qsmall",
    "Rsmall",
    "Ssmall",
    "Tsmall",
    "Usmall",
    "Vsmall",
    "Wsmall",
    "Xsmall",
    "Ysmall",
    "Zsmall",
    "colonmonetary",
    "onefitted",
    "rupiah",
    "Tildesmall",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "exclamdownsmall",
    "centoldstyle",
    "Lslashsmall",
    "",
    "",
    "Scaronsmall",
    "Zcaronsmall",
    "Dieresissmall",
    "Brevesmall",
    "Caronsmall",
    "",
    "Dotaccentsmall",
    "",
    "",
    "Macronsmall",
    "",
    "",
    "figuredash",
    "hypheninferior",
    "",
    "",
    "Ogoneksmall",
    "Ringsmall",
    "Cedillasmall",
    "",
    "",
    "",
    "onequarter",
    "onehalf",
    "threequarters",
    "questiondownsmall",
    "oneeighth",
    "threeeighths",
    "fiveeighths",
    "seveneighths",
    "onethird",
    "twothirds",
    "",
    "",
    "zerosuperior",
    "onesuperior",
    "twosuperior",
    "threesuperior",
    "foursuperior",
    "fivesuperior",
    "sixsuperior",
    "sevensuperior",
    "eightsuperior",
    "ninesuperior",
    "zeroinferior",
    "oneinferior",
    "twoinferior",
    "threeinferior",
    "fourinferior",
    "fiveinferior",
    "sixinferior",
    "seveninferior",
    "eightinferior",
    "nineinferior",
    "centinferior",
    "dollarinferior",
    "periodinferior",
    "commainferior",
    "Agravesmall",
    "Aacutesmall",
    "Acircumflexsmall",
    "Atildesmall",
    "Adieresissmall",
    "Aringsmall",
    "AEsmall",
    "Ccedillasmall",
    "Egravesmall",
    "Eacutesmall",
    "Ecircumflexsmall",
    "Edieresissmall",
    "Igravesmall",
    "Iacutesmall",
    "Icircumflexsmall",
    "Idieresissmall",
    "Ethsmall",
    "Ntildesmall",
    "Ogravesmall",
    "Oacutesmall",
    "Ocircumflexsmall",
    "Otildesmall",
    "Odieresissmall",
    "OEsmall",
    "Oslashsmall",
    "Ugravesmall",
    "Uacutesmall",
    "Ucircumflexsmall",
    "Udieresissmall",
    "Yacutesmall",
    "Thornsmall",
    "Ydieresissmall",
  ],
  tr = [
    ".notdef",
    ".null",
    "nonmarkingreturn",
    "space",
    "exclam",
    "quotedbl",
    "numbersign",
    "dollar",
    "percent",
    "ampersand",
    "quotesingle",
    "parenleft",
    "parenright",
    "asterisk",
    "plus",
    "comma",
    "hyphen",
    "period",
    "slash",
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "colon",
    "semicolon",
    "less",
    "equal",
    "greater",
    "question",
    "at",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "bracketleft",
    "backslash",
    "bracketright",
    "asciicircum",
    "underscore",
    "grave",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "braceleft",
    "bar",
    "braceright",
    "asciitilde",
    "Adieresis",
    "Aring",
    "Ccedilla",
    "Eacute",
    "Ntilde",
    "Odieresis",
    "Udieresis",
    "aacute",
    "agrave",
    "acircumflex",
    "adieresis",
    "atilde",
    "aring",
    "ccedilla",
    "eacute",
    "egrave",
    "ecircumflex",
    "edieresis",
    "iacute",
    "igrave",
    "icircumflex",
    "idieresis",
    "ntilde",
    "oacute",
    "ograve",
    "ocircumflex",
    "odieresis",
    "otilde",
    "uacute",
    "ugrave",
    "ucircumflex",
    "udieresis",
    "dagger",
    "degree",
    "cent",
    "sterling",
    "section",
    "bullet",
    "paragraph",
    "germandbls",
    "registered",
    "copyright",
    "trademark",
    "acute",
    "dieresis",
    "notequal",
    "AE",
    "Oslash",
    "infinity",
    "plusminus",
    "lessequal",
    "greaterequal",
    "yen",
    "mu",
    "partialdiff",
    "summation",
    "product",
    "pi",
    "integral",
    "ordfeminine",
    "ordmasculine",
    "Omega",
    "ae",
    "oslash",
    "questiondown",
    "exclamdown",
    "logicalnot",
    "radical",
    "florin",
    "approxequal",
    "Delta",
    "guillemotleft",
    "guillemotright",
    "ellipsis",
    "nonbreakingspace",
    "Agrave",
    "Atilde",
    "Otilde",
    "OE",
    "oe",
    "endash",
    "emdash",
    "quotedblleft",
    "quotedblright",
    "quoteleft",
    "quoteright",
    "divide",
    "lozenge",
    "ydieresis",
    "Ydieresis",
    "fraction",
    "currency",
    "guilsinglleft",
    "guilsinglright",
    "fi",
    "fl",
    "daggerdbl",
    "periodcentered",
    "quotesinglbase",
    "quotedblbase",
    "perthousand",
    "Acircumflex",
    "Ecircumflex",
    "Aacute",
    "Edieresis",
    "Egrave",
    "Iacute",
    "Icircumflex",
    "Idieresis",
    "Igrave",
    "Oacute",
    "Ocircumflex",
    "apple",
    "Ograve",
    "Uacute",
    "Ucircumflex",
    "Ugrave",
    "dotlessi",
    "circumflex",
    "tilde",
    "macron",
    "breve",
    "dotaccent",
    "ring",
    "cedilla",
    "hungarumlaut",
    "ogonek",
    "caron",
    "Lslash",
    "lslash",
    "Scaron",
    "scaron",
    "Zcaron",
    "zcaron",
    "brokenbar",
    "Eth",
    "eth",
    "Yacute",
    "yacute",
    "Thorn",
    "thorn",
    "minus",
    "multiply",
    "onesuperior",
    "twosuperior",
    "threesuperior",
    "onehalf",
    "onequarter",
    "threequarters",
    "franc",
    "Gbreve",
    "gbreve",
    "Idotaccent",
    "Scedilla",
    "scedilla",
    "Cacute",
    "cacute",
    "Ccaron",
    "ccaron",
    "dcroat",
  ];
function N0(e) {
  this.font = e;
}
N0.prototype.charToGlyphIndex = function (e) {
  var t = e.codePointAt(0),
    n = this.font.glyphs;
  if (n) {
    for (var r = 0; r < n.length; r += 1)
      for (var s = n.get(r), i = 0; i < s.unicodes.length; i += 1)
        if (s.unicodes[i] === t) return r;
  }
  return null;
};
function R0(e) {
  this.cmap = e;
}
R0.prototype.charToGlyphIndex = function (e) {
  return this.cmap.glyphIndexMap[e.codePointAt(0)] || 0;
};
function Ka(e, t) {
  ((this.encoding = e), (this.charset = t));
}
Ka.prototype.charToGlyphIndex = function (e) {
  var t = e.codePointAt(0),
    n = this.encoding[t];
  return this.charset.indexOf(n);
};
function Bc(e) {
  switch (e.version) {
    case 1:
      this.names = tr.slice();
      break;
    case 2:
      this.names = new Array(e.numberOfGlyphs);
      for (var t = 0; t < e.numberOfGlyphs; t++)
        e.glyphNameIndex[t] < tr.length
          ? (this.names[t] = tr[e.glyphNameIndex[t]])
          : (this.names[t] = e.names[e.glyphNameIndex[t] - tr.length]);
      break;
    case 2.5:
      this.names = new Array(e.numberOfGlyphs);
      for (var n = 0; n < e.numberOfGlyphs; n++) this.names[n] = tr[n + e.glyphNameIndex[n]];
      break;
    case 3:
      this.names = [];
      break;
    default:
      this.names = [];
      break;
  }
}
Bc.prototype.nameToGlyphIndex = function (e) {
  return this.names.indexOf(e);
};
Bc.prototype.glyphIndexToName = function (e) {
  return this.names[e];
};
function cw(e) {
  for (var t, n = e.tables.cmap.glyphIndexMap, r = Object.keys(n), s = 0; s < r.length; s += 1) {
    var i = r[s],
      a = n[i];
    ((t = e.glyphs.get(a)), t.addUnicode(parseInt(i)));
  }
  for (var o = 0; o < e.glyphs.length; o += 1)
    ((t = e.glyphs.get(o)),
      e.cffEncoding
        ? e.isCIDFont
          ? (t.name = "gid" + o)
          : (t.name = e.cffEncoding.charset[o])
        : e.glyphNames.names && (t.name = e.glyphNames.glyphIndexToName(o)));
}
function fw(e) {
  e._IndexToUnicodeMap = {};
  for (var t = e.tables.cmap.glyphIndexMap, n = Object.keys(t), r = 0; r < n.length; r += 1) {
    var s = n[r],
      i = t[s];
    e._IndexToUnicodeMap[i] === void 0
      ? (e._IndexToUnicodeMap[i] = { unicodes: [parseInt(s)] })
      : e._IndexToUnicodeMap[i].unicodes.push(parseInt(s));
  }
}
function dw(e, t) {
  t.lowMemory ? fw(e) : cw(e);
}
function hw(e, t, n, r, s) {
  (e.beginPath(), e.moveTo(t, n), e.lineTo(r, s), e.stroke());
}
var Qn = { line: hw };
function pw(e, t) {
  var n = t || new Fe();
  return {
    configurable: !0,
    get: function () {
      return (typeof n == "function" && (n = n()), n);
    },
    set: function (r) {
      n = r;
    },
  };
}
function dt(e) {
  this.bindConstructorValues(e);
}
dt.prototype.bindConstructorValues = function (e) {
  ((this.index = e.index || 0),
    (this.name = e.name || null),
    (this.unicode = e.unicode || void 0),
    (this.unicodes = e.unicodes || e.unicode !== void 0 ? [e.unicode] : []),
    "xMin" in e && (this.xMin = e.xMin),
    "yMin" in e && (this.yMin = e.yMin),
    "xMax" in e && (this.xMax = e.xMax),
    "yMax" in e && (this.yMax = e.yMax),
    "advanceWidth" in e && (this.advanceWidth = e.advanceWidth),
    Object.defineProperty(this, "path", pw(this, e.path)));
};
dt.prototype.addUnicode = function (e) {
  (this.unicodes.length === 0 && (this.unicode = e), this.unicodes.push(e));
};
dt.prototype.getBoundingBox = function () {
  return this.path.getBoundingBox();
};
dt.prototype.getPath = function (e, t, n, r, s) {
  ((e = e !== void 0 ? e : 0), (t = t !== void 0 ? t : 0), (n = n !== void 0 ? n : 72));
  var i, a;
  r || (r = {});
  var o = r.xScale,
    l = r.yScale;
  if ((r.hinting && s && s.hinting && (a = this.path && s.hinting.exec(this, n)), a))
    ((i = s.hinting.getCommands(a)), (e = Math.round(e)), (t = Math.round(t)), (o = l = 1));
  else {
    i = this.path.commands;
    var u = (1 / (this.path.unitsPerEm || 1e3)) * n;
    (o === void 0 && (o = u), l === void 0 && (l = u));
  }
  for (var c = new Fe(), f = 0; f < i.length; f += 1) {
    var d = i[f];
    d.type === "M"
      ? c.moveTo(e + d.x * o, t + -d.y * l)
      : d.type === "L"
        ? c.lineTo(e + d.x * o, t + -d.y * l)
        : d.type === "Q"
          ? c.quadraticCurveTo(e + d.x1 * o, t + -d.y1 * l, e + d.x * o, t + -d.y * l)
          : d.type === "C"
            ? c.curveTo(
                e + d.x1 * o,
                t + -d.y1 * l,
                e + d.x2 * o,
                t + -d.y2 * l,
                e + d.x * o,
                t + -d.y * l,
              )
            : d.type === "Z" && c.closePath();
  }
  return c;
};
dt.prototype.getContours = function () {
  if (this.points === void 0) return [];
  for (var e = [], t = [], n = 0; n < this.points.length; n += 1) {
    var r = this.points[n];
    (t.push(r), r.lastPointOfContour && (e.push(t), (t = [])));
  }
  return (V.argument(t.length === 0, "There are still points left in the current contour."), e);
};
dt.prototype.getMetrics = function () {
  for (var e = this.path.commands, t = [], n = [], r = 0; r < e.length; r += 1) {
    var s = e[r];
    (s.type !== "Z" && (t.push(s.x), n.push(s.y)),
      (s.type === "Q" || s.type === "C") && (t.push(s.x1), n.push(s.y1)),
      s.type === "C" && (t.push(s.x2), n.push(s.y2)));
  }
  var i = {
    xMin: Math.min.apply(null, t),
    yMin: Math.min.apply(null, n),
    xMax: Math.max.apply(null, t),
    yMax: Math.max.apply(null, n),
    leftSideBearing: this.leftSideBearing,
  };
  return (
    isFinite(i.xMin) || (i.xMin = 0),
    isFinite(i.xMax) || (i.xMax = this.advanceWidth),
    isFinite(i.yMin) || (i.yMin = 0),
    isFinite(i.yMax) || (i.yMax = 0),
    (i.rightSideBearing = this.advanceWidth - i.leftSideBearing - (i.xMax - i.xMin)),
    i
  );
};
dt.prototype.draw = function (e, t, n, r, s) {
  this.getPath(t, n, r, s).draw(e);
};
dt.prototype.drawPoints = function (e, t, n, r) {
  function s(f, d, h, m) {
    e.beginPath();
    for (var x = 0; x < f.length; x += 1)
      (e.moveTo(d + f[x].x * m, h + f[x].y * m),
        e.arc(d + f[x].x * m, h + f[x].y * m, 2, 0, Math.PI * 2, !1));
    (e.closePath(), e.fill());
  }
  ((t = t !== void 0 ? t : 0), (n = n !== void 0 ? n : 0), (r = r !== void 0 ? r : 24));
  for (
    var i = (1 / this.path.unitsPerEm) * r, a = [], o = [], l = this.path, u = 0;
    u < l.commands.length;
    u += 1
  ) {
    var c = l.commands[u];
    (c.x !== void 0 && a.push({ x: c.x, y: -c.y }),
      c.x1 !== void 0 && o.push({ x: c.x1, y: -c.y1 }),
      c.x2 !== void 0 && o.push({ x: c.x2, y: -c.y2 }));
  }
  ((e.fillStyle = "blue"), s(a, t, n, i), (e.fillStyle = "red"), s(o, t, n, i));
};
dt.prototype.drawMetrics = function (e, t, n, r) {
  var s;
  ((t = t !== void 0 ? t : 0),
    (n = n !== void 0 ? n : 0),
    (r = r !== void 0 ? r : 24),
    (s = (1 / this.path.unitsPerEm) * r),
    (e.lineWidth = 1),
    (e.strokeStyle = "black"),
    Qn.line(e, t, -1e4, t, 1e4),
    Qn.line(e, -1e4, n, 1e4, n));
  var i = this.xMin || 0,
    a = this.yMin || 0,
    o = this.xMax || 0,
    l = this.yMax || 0,
    u = this.advanceWidth || 0;
  ((e.strokeStyle = "blue"),
    Qn.line(e, t + i * s, -1e4, t + i * s, 1e4),
    Qn.line(e, t + o * s, -1e4, t + o * s, 1e4),
    Qn.line(e, -1e4, n + -a * s, 1e4, n + -a * s),
    Qn.line(e, -1e4, n + -l * s, 1e4, n + -l * s),
    (e.strokeStyle = "green"),
    Qn.line(e, t + u * s, -1e4, t + u * s, 1e4));
};
function Gi(e, t, n) {
  Object.defineProperty(e, t, {
    get: function () {
      return (e.path, e[n]);
    },
    set: function (r) {
      e[n] = r;
    },
    enumerable: !0,
    configurable: !0,
  });
}
function $c(e, t) {
  if (((this.font = e), (this.glyphs = {}), Array.isArray(t)))
    for (var n = 0; n < t.length; n++) {
      var r = t[n];
      ((r.path.unitsPerEm = e.unitsPerEm), (this.glyphs[n] = r));
    }
  this.length = (t && t.length) || 0;
}
$c.prototype.get = function (e) {
  if (this.glyphs[e] === void 0) {
    (this.font._push(e),
      typeof this.glyphs[e] == "function" && (this.glyphs[e] = this.glyphs[e]()));
    var t = this.glyphs[e],
      n = this.font._IndexToUnicodeMap[e];
    if (n) for (var r = 0; r < n.unicodes.length; r++) t.addUnicode(n.unicodes[r]);
    (this.font.cffEncoding
      ? this.font.isCIDFont
        ? (t.name = "gid" + e)
        : (t.name = this.font.cffEncoding.charset[e])
      : this.font.glyphNames.names && (t.name = this.font.glyphNames.glyphIndexToName(e)),
      (this.glyphs[e].advanceWidth = this.font._hmtxTableData[e].advanceWidth),
      (this.glyphs[e].leftSideBearing = this.font._hmtxTableData[e].leftSideBearing));
  } else typeof this.glyphs[e] == "function" && (this.glyphs[e] = this.glyphs[e]());
  return this.glyphs[e];
};
$c.prototype.push = function (e, t) {
  ((this.glyphs[e] = t), this.length++);
};
function mw(e, t) {
  return new dt({ index: t, font: e });
}
function gw(e, t, n, r, s, i) {
  return function () {
    var a = new dt({ index: t, font: e });
    return (
      (a.path = function () {
        n(a, r, s);
        var o = i(e.glyphs, a);
        return ((o.unitsPerEm = e.unitsPerEm), o);
      }),
      Gi(a, "xMin", "_xMin"),
      Gi(a, "xMax", "_xMax"),
      Gi(a, "yMin", "_yMin"),
      Gi(a, "yMax", "_yMax"),
      a
    );
  };
}
function vw(e, t, n, r) {
  return function () {
    var s = new dt({ index: t, font: e });
    return (
      (s.path = function () {
        var i = n(e, s, r);
        return ((i.unitsPerEm = e.unitsPerEm), i);
      }),
      s
    );
  };
}
var Xt = { GlyphSet: $c, glyphLoader: mw, ttfGlyphLoader: gw, cffGlyphLoader: vw };
function O0(e, t) {
  if (e === t) return !0;
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length) return !1;
    for (var n = 0; n < e.length; n += 1) if (!O0(e[n], t[n])) return !1;
    return !0;
  } else return !1;
}
function gu(e) {
  var t;
  return (e.length < 1240 ? (t = 107) : e.length < 33900 ? (t = 1131) : (t = 32768), t);
}
function xn(e, t, n) {
  var r = [],
    s = [],
    i = z.getCard16(e, t),
    a,
    o;
  if (i !== 0) {
    var l = z.getByte(e, t + 2);
    a = t + (i + 1) * l + 2;
    for (var u = t + 3, c = 0; c < i + 1; c += 1) (r.push(z.getOffset(e, u, l)), (u += l));
    o = a + r[i];
  } else o = t + 2;
  for (var f = 0; f < r.length - 1; f += 1) {
    var d = z.getBytes(e, a + r[f], a + r[f + 1]);
    (n && (d = n(d)), s.push(d));
  }
  return { objects: s, startOffset: t, endOffset: o };
}
function yw(e, t) {
  var n = [],
    r = z.getCard16(e, t),
    s,
    i;
  if (r !== 0) {
    var a = z.getByte(e, t + 2);
    s = t + (r + 1) * a + 2;
    for (var o = t + 3, l = 0; l < r + 1; l += 1) (n.push(z.getOffset(e, o, a)), (o += a));
    i = s + n[r];
  } else i = t + 2;
  return { offsets: n, startOffset: t, endOffset: i };
}
function xw(e, t, n, r, s) {
  var i = z.getCard16(n, r),
    a = 0;
  if (i !== 0) {
    var o = z.getByte(n, r + 2);
    a = r + (i + 1) * o + 2;
  }
  var l = z.getBytes(n, a + t[e], a + t[e + 1]);
  return l;
}
function kw(e) {
  for (
    var t = "",
      n = 15,
      r = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "E", "E-", null, "-"];
    ;
  ) {
    var s = e.parseByte(),
      i = s >> 4,
      a = s & 15;
    if (i === n || ((t += r[i]), a === n)) break;
    t += r[a];
  }
  return parseFloat(t);
}
function Sw(e, t) {
  var n, r, s, i;
  if (t === 28) return ((n = e.parseByte()), (r = e.parseByte()), (n << 8) | r);
  if (t === 29)
    return (
      (n = e.parseByte()),
      (r = e.parseByte()),
      (s = e.parseByte()),
      (i = e.parseByte()),
      (n << 24) | (r << 16) | (s << 8) | i
    );
  if (t === 30) return kw(e);
  if (t >= 32 && t <= 246) return t - 139;
  if (t >= 247 && t <= 250) return ((n = e.parseByte()), (t - 247) * 256 + n + 108);
  if (t >= 251 && t <= 254) return ((n = e.parseByte()), -(t - 251) * 256 - n - 108);
  throw new Error("Invalid b0 " + t);
}
function ww(e) {
  for (var t = {}, n = 0; n < e.length; n += 1) {
    var r = e[n][0],
      s = e[n][1],
      i = void 0;
    if ((s.length === 1 ? (i = s[0]) : (i = s), t.hasOwnProperty(r) && !isNaN(t[r])))
      throw new Error("Object " + t + " already has key " + r);
    t[r] = i;
  }
  return t;
}
function I0(e, t, n) {
  t = t !== void 0 ? t : 0;
  var r = new z.Parser(e, t),
    s = [],
    i = [];
  for (n = n !== void 0 ? n : e.length; r.relativeOffset < n; ) {
    var a = r.parseByte();
    a <= 21 ? (a === 12 && (a = 1200 + r.parseByte()), s.push([a, i]), (i = [])) : i.push(Sw(r, a));
  }
  return ww(s);
}
function Ds(e, t) {
  return (t <= 390 ? (t = fa[t]) : (t = e[t - 391]), t);
}
function P0(e, t, n) {
  for (var r = {}, s, i = 0; i < t.length; i += 1) {
    var a = t[i];
    if (Array.isArray(a.type)) {
      var o = [];
      o.length = a.type.length;
      for (var l = 0; l < a.type.length; l++)
        ((s = e[a.op] !== void 0 ? e[a.op][l] : void 0),
          s === void 0 && (s = a.value !== void 0 && a.value[l] !== void 0 ? a.value[l] : null),
          a.type[l] === "SID" && (s = Ds(n, s)),
          (o[l] = s));
      r[a.name] = o;
    } else
      ((s = e[a.op]),
        s === void 0 && (s = a.value !== void 0 ? a.value : null),
        a.type === "SID" && (s = Ds(n, s)),
        (r[a.name] = s));
  }
  return r;
}
function bw(e, t) {
  var n = {};
  return (
    (n.formatMajor = z.getCard8(e, t)),
    (n.formatMinor = z.getCard8(e, t + 1)),
    (n.size = z.getCard8(e, t + 2)),
    (n.offsetSize = z.getCard8(e, t + 3)),
    (n.startOffset = t),
    (n.endOffset = t + 4),
    n
  );
}
var D0 = [
    { name: "version", op: 0, type: "SID" },
    { name: "notice", op: 1, type: "SID" },
    { name: "copyright", op: 1200, type: "SID" },
    { name: "fullName", op: 2, type: "SID" },
    { name: "familyName", op: 3, type: "SID" },
    { name: "weight", op: 4, type: "SID" },
    { name: "isFixedPitch", op: 1201, type: "number", value: 0 },
    { name: "italicAngle", op: 1202, type: "number", value: 0 },
    { name: "underlinePosition", op: 1203, type: "number", value: -100 },
    { name: "underlineThickness", op: 1204, type: "number", value: 50 },
    { name: "paintType", op: 1205, type: "number", value: 0 },
    { name: "charstringType", op: 1206, type: "number", value: 2 },
    {
      name: "fontMatrix",
      op: 1207,
      type: ["real", "real", "real", "real", "real", "real"],
      value: [0.001, 0, 0, 0.001, 0, 0],
    },
    { name: "uniqueId", op: 13, type: "number" },
    {
      name: "fontBBox",
      op: 5,
      type: ["number", "number", "number", "number"],
      value: [0, 0, 0, 0],
    },
    { name: "strokeWidth", op: 1208, type: "number", value: 0 },
    { name: "xuid", op: 14, type: [], value: null },
    { name: "charset", op: 15, type: "offset", value: 0 },
    { name: "encoding", op: 16, type: "offset", value: 0 },
    { name: "charStrings", op: 17, type: "offset", value: 0 },
    { name: "private", op: 18, type: ["number", "offset"], value: [0, 0] },
    { name: "ros", op: 1230, type: ["SID", "SID", "number"] },
    { name: "cidFontVersion", op: 1231, type: "number", value: 0 },
    { name: "cidFontRevision", op: 1232, type: "number", value: 0 },
    { name: "cidFontType", op: 1233, type: "number", value: 0 },
    { name: "cidCount", op: 1234, type: "number", value: 8720 },
    { name: "uidBase", op: 1235, type: "number" },
    { name: "fdArray", op: 1236, type: "offset" },
    { name: "fdSelect", op: 1237, type: "offset" },
    { name: "fontName", op: 1238, type: "SID" },
  ],
  U0 = [
    { name: "subrs", op: 19, type: "offset", value: 0 },
    { name: "defaultWidthX", op: 20, type: "number", value: 0 },
    { name: "nominalWidthX", op: 21, type: "number", value: 0 },
  ];
function Ew(e, t) {
  var n = I0(e, 0, e.byteLength);
  return P0(n, D0, t);
}
function A0(e, t, n, r) {
  var s = I0(e, t, n);
  return P0(s, U0, r);
}
function Md(e, t, n, r) {
  for (var s = [], i = 0; i < n.length; i += 1) {
    var a = new DataView(new Uint8Array(n[i]).buffer),
      o = Ew(a, r);
    ((o._subrs = []), (o._subrsBias = 0), (o._defaultWidthX = 0), (o._nominalWidthX = 0));
    var l = o.private[0],
      u = o.private[1];
    if (l !== 0 && u !== 0) {
      var c = A0(e, u + t, l, r);
      if (
        ((o._defaultWidthX = c.defaultWidthX), (o._nominalWidthX = c.nominalWidthX), c.subrs !== 0)
      ) {
        var f = u + c.subrs,
          d = xn(e, f + t);
        ((o._subrs = d.objects), (o._subrsBias = gu(o._subrs)));
      }
      o._privateDict = c;
    }
    s.push(o);
  }
  return s;
}
function Tw(e, t, n, r) {
  var s,
    i,
    a = new z.Parser(e, t);
  n -= 1;
  var o = [".notdef"],
    l = a.parseCard8();
  if (l === 0) for (var u = 0; u < n; u += 1) ((s = a.parseSID()), o.push(Ds(r, s)));
  else if (l === 1)
    for (; o.length <= n; ) {
      ((s = a.parseSID()), (i = a.parseCard8()));
      for (var c = 0; c <= i; c += 1) (o.push(Ds(r, s)), (s += 1));
    }
  else if (l === 2)
    for (; o.length <= n; ) {
      ((s = a.parseSID()), (i = a.parseCard16()));
      for (var f = 0; f <= i; f += 1) (o.push(Ds(r, s)), (s += 1));
    }
  else throw new Error("Unknown charset format " + l);
  return o;
}
function Cw(e, t, n) {
  var r,
    s = {},
    i = new z.Parser(e, t),
    a = i.parseCard8();
  if (a === 0)
    for (var o = i.parseCard8(), l = 0; l < o; l += 1) ((r = i.parseCard8()), (s[r] = l));
  else if (a === 1) {
    var u = i.parseCard8();
    r = 1;
    for (var c = 0; c < u; c += 1)
      for (var f = i.parseCard8(), d = i.parseCard8(), h = f; h <= f + d; h += 1)
        ((s[h] = r), (r += 1));
  } else throw new Error("Unknown encoding format " + a);
  return new Ka(s, n);
}
function Nd(e, t, n) {
  var r,
    s,
    i,
    a,
    o = new Fe(),
    l = [],
    u = 0,
    c = !1,
    f = !1,
    d = 0,
    h = 0,
    m,
    x,
    k,
    p;
  if (e.isCIDFont) {
    var g = e.tables.cff.topDict._fdSelect[t.index],
      v = e.tables.cff.topDict._fdArray[g];
    ((m = v._subrs), (x = v._subrsBias), (k = v._defaultWidthX), (p = v._nominalWidthX));
  } else
    ((m = e.tables.cff.topDict._subrs),
      (x = e.tables.cff.topDict._subrsBias),
      (k = e.tables.cff.topDict._defaultWidthX),
      (p = e.tables.cff.topDict._nominalWidthX));
  var S = k;
  function b(E, I) {
    (f && o.closePath(), o.moveTo(E, I), (f = !0));
  }
  function L() {
    var E;
    ((E = l.length % 2 !== 0),
      E && !c && (S = l.shift() + p),
      (u += l.length >> 1),
      (l.length = 0),
      (c = !0));
  }
  function T(E) {
    for (var I, P, q, Q, te, ee, ae, oe, le, O, B, R, A = 0; A < E.length; ) {
      var H = E[A];
      switch (((A += 1), H)) {
        case 1:
          L();
          break;
        case 3:
          L();
          break;
        case 4:
          (l.length > 1 && !c && ((S = l.shift() + p), (c = !0)), (h += l.pop()), b(d, h));
          break;
        case 5:
          for (; l.length > 0; ) ((d += l.shift()), (h += l.shift()), o.lineTo(d, h));
          break;
        case 6:
          for (; l.length > 0 && ((d += l.shift()), o.lineTo(d, h), l.length !== 0); )
            ((h += l.shift()), o.lineTo(d, h));
          break;
        case 7:
          for (; l.length > 0 && ((h += l.shift()), o.lineTo(d, h), l.length !== 0); )
            ((d += l.shift()), o.lineTo(d, h));
          break;
        case 8:
          for (; l.length > 0; )
            ((r = d + l.shift()),
              (s = h + l.shift()),
              (i = r + l.shift()),
              (a = s + l.shift()),
              (d = i + l.shift()),
              (h = a + l.shift()),
              o.curveTo(r, s, i, a, d, h));
          break;
        case 10:
          ((te = l.pop() + x), (ee = m[te]), ee && T(ee));
          break;
        case 11:
          return;
        case 12:
          switch (((H = E[A]), (A += 1), H)) {
            case 35:
              ((r = d + l.shift()),
                (s = h + l.shift()),
                (i = r + l.shift()),
                (a = s + l.shift()),
                (ae = i + l.shift()),
                (oe = a + l.shift()),
                (le = ae + l.shift()),
                (O = oe + l.shift()),
                (B = le + l.shift()),
                (R = O + l.shift()),
                (d = B + l.shift()),
                (h = R + l.shift()),
                l.shift(),
                o.curveTo(r, s, i, a, ae, oe),
                o.curveTo(le, O, B, R, d, h));
              break;
            case 34:
              ((r = d + l.shift()),
                (s = h),
                (i = r + l.shift()),
                (a = s + l.shift()),
                (ae = i + l.shift()),
                (oe = a),
                (le = ae + l.shift()),
                (O = a),
                (B = le + l.shift()),
                (R = h),
                (d = B + l.shift()),
                o.curveTo(r, s, i, a, ae, oe),
                o.curveTo(le, O, B, R, d, h));
              break;
            case 36:
              ((r = d + l.shift()),
                (s = h + l.shift()),
                (i = r + l.shift()),
                (a = s + l.shift()),
                (ae = i + l.shift()),
                (oe = a),
                (le = ae + l.shift()),
                (O = a),
                (B = le + l.shift()),
                (R = O + l.shift()),
                (d = B + l.shift()),
                o.curveTo(r, s, i, a, ae, oe),
                o.curveTo(le, O, B, R, d, h));
              break;
            case 37:
              ((r = d + l.shift()),
                (s = h + l.shift()),
                (i = r + l.shift()),
                (a = s + l.shift()),
                (ae = i + l.shift()),
                (oe = a + l.shift()),
                (le = ae + l.shift()),
                (O = oe + l.shift()),
                (B = le + l.shift()),
                (R = O + l.shift()),
                Math.abs(B - d) > Math.abs(R - h) ? (d = B + l.shift()) : (h = R + l.shift()),
                o.curveTo(r, s, i, a, ae, oe),
                o.curveTo(le, O, B, R, d, h));
              break;
            default:
              (console.log("Glyph " + t.index + ": unknown operator 1200" + H), (l.length = 0));
          }
          break;
        case 14:
          (l.length > 0 && !c && ((S = l.shift() + p), (c = !0)), f && (o.closePath(), (f = !1)));
          break;
        case 18:
          L();
          break;
        case 19:
        case 20:
          (L(), (A += (u + 7) >> 3));
          break;
        case 21:
          (l.length > 2 && !c && ((S = l.shift() + p), (c = !0)),
            (h += l.pop()),
            (d += l.pop()),
            b(d, h));
          break;
        case 22:
          (l.length > 1 && !c && ((S = l.shift() + p), (c = !0)), (d += l.pop()), b(d, h));
          break;
        case 23:
          L();
          break;
        case 24:
          for (; l.length > 2; )
            ((r = d + l.shift()),
              (s = h + l.shift()),
              (i = r + l.shift()),
              (a = s + l.shift()),
              (d = i + l.shift()),
              (h = a + l.shift()),
              o.curveTo(r, s, i, a, d, h));
          ((d += l.shift()), (h += l.shift()), o.lineTo(d, h));
          break;
        case 25:
          for (; l.length > 6; ) ((d += l.shift()), (h += l.shift()), o.lineTo(d, h));
          ((r = d + l.shift()),
            (s = h + l.shift()),
            (i = r + l.shift()),
            (a = s + l.shift()),
            (d = i + l.shift()),
            (h = a + l.shift()),
            o.curveTo(r, s, i, a, d, h));
          break;
        case 26:
          for (l.length % 2 && (d += l.shift()); l.length > 0; )
            ((r = d),
              (s = h + l.shift()),
              (i = r + l.shift()),
              (a = s + l.shift()),
              (d = i),
              (h = a + l.shift()),
              o.curveTo(r, s, i, a, d, h));
          break;
        case 27:
          for (l.length % 2 && (h += l.shift()); l.length > 0; )
            ((r = d + l.shift()),
              (s = h),
              (i = r + l.shift()),
              (a = s + l.shift()),
              (d = i + l.shift()),
              (h = a),
              o.curveTo(r, s, i, a, d, h));
          break;
        case 28:
          ((I = E[A]), (P = E[A + 1]), l.push(((I << 24) | (P << 16)) >> 16), (A += 2));
          break;
        case 29:
          ((te = l.pop() + e.gsubrsBias), (ee = e.gsubrs[te]), ee && T(ee));
          break;
        case 30:
          for (
            ;
            l.length > 0 &&
            ((r = d),
            (s = h + l.shift()),
            (i = r + l.shift()),
            (a = s + l.shift()),
            (d = i + l.shift()),
            (h = a + (l.length === 1 ? l.shift() : 0)),
            o.curveTo(r, s, i, a, d, h),
            l.length !== 0);
          )
            ((r = d + l.shift()),
              (s = h),
              (i = r + l.shift()),
              (a = s + l.shift()),
              (h = a + l.shift()),
              (d = i + (l.length === 1 ? l.shift() : 0)),
              o.curveTo(r, s, i, a, d, h));
          break;
        case 31:
          for (
            ;
            l.length > 0 &&
            ((r = d + l.shift()),
            (s = h),
            (i = r + l.shift()),
            (a = s + l.shift()),
            (h = a + l.shift()),
            (d = i + (l.length === 1 ? l.shift() : 0)),
            o.curveTo(r, s, i, a, d, h),
            l.length !== 0);
          )
            ((r = d),
              (s = h + l.shift()),
              (i = r + l.shift()),
              (a = s + l.shift()),
              (d = i + l.shift()),
              (h = a + (l.length === 1 ? l.shift() : 0)),
              o.curveTo(r, s, i, a, d, h));
          break;
        default:
          H < 32
            ? console.log("Glyph " + t.index + ": unknown operator " + H)
            : H < 247
              ? l.push(H - 139)
              : H < 251
                ? ((I = E[A]), (A += 1), l.push((H - 247) * 256 + I + 108))
                : H < 255
                  ? ((I = E[A]), (A += 1), l.push(-(H - 251) * 256 - I - 108))
                  : ((I = E[A]),
                    (P = E[A + 1]),
                    (q = E[A + 2]),
                    (Q = E[A + 3]),
                    (A += 4),
                    l.push(((I << 24) | (P << 16) | (q << 8) | Q) / 65536));
      }
    }
  }
  return (T(n), (t.advanceWidth = S), o);
}
function Lw(e, t, n, r) {
  var s = [],
    i,
    a = new z.Parser(e, t),
    o = a.parseCard8();
  if (o === 0)
    for (var l = 0; l < n; l++) {
      if (((i = a.parseCard8()), i >= r))
        throw new Error(
          "CFF table CID Font FDSelect has bad FD index value " + i + " (FD count " + r + ")",
        );
      s.push(i);
    }
  else if (o === 3) {
    var u = a.parseCard16(),
      c = a.parseCard16();
    if (c !== 0)
      throw new Error("CFF Table CID Font FDSelect format 3 range has bad initial GID " + c);
    for (var f, d = 0; d < u; d++) {
      if (((i = a.parseCard8()), (f = a.parseCard16()), i >= r))
        throw new Error(
          "CFF table CID Font FDSelect has bad FD index value " + i + " (FD count " + r + ")",
        );
      if (f > n) throw new Error("CFF Table CID Font FDSelect format 3 range has bad GID " + f);
      for (; c < f; c++) s.push(i);
      c = f;
    }
    if (f !== n)
      throw new Error("CFF Table CID Font FDSelect format 3 range has bad final GID " + f);
  } else throw new Error("CFF Table CID Font FDSelect table has unsupported format " + o);
  return s;
}
function Fw(e, t, n, r) {
  n.tables.cff = {};
  var s = bw(e, t),
    i = xn(e, s.endOffset, z.bytesToString),
    a = xn(e, i.endOffset),
    o = xn(e, a.endOffset, z.bytesToString),
    l = xn(e, o.endOffset);
  ((n.gsubrs = l.objects), (n.gsubrsBias = gu(n.gsubrs)));
  var u = Md(e, t, a.objects, o.objects);
  if (u.length !== 1)
    throw new Error(
      "CFF table has too many fonts in 'FontSet' - count of fonts NameIndex.length = " + u.length,
    );
  var c = u[0];
  if (
    ((n.tables.cff.topDict = c),
    c._privateDict &&
      ((n.defaultWidthX = c._privateDict.defaultWidthX),
      (n.nominalWidthX = c._privateDict.nominalWidthX)),
    c.ros[0] !== void 0 && c.ros[1] !== void 0 && (n.isCIDFont = !0),
    n.isCIDFont)
  ) {
    var f = c.fdArray,
      d = c.fdSelect;
    if (f === 0 || d === 0)
      throw new Error(
        "Font is marked as a CID font, but FDArray and/or FDSelect information is missing",
      );
    f += t;
    var h = xn(e, f),
      m = Md(e, t, h.objects, o.objects);
    ((c._fdArray = m), (d += t), (c._fdSelect = Lw(e, d, n.numGlyphs, m.length)));
  }
  var x = t + c.private[1],
    k = A0(e, x, c.private[0], o.objects);
  if (((n.defaultWidthX = k.defaultWidthX), (n.nominalWidthX = k.nominalWidthX), k.subrs !== 0)) {
    var p = x + k.subrs,
      g = xn(e, p);
    ((n.subrs = g.objects), (n.subrsBias = gu(n.subrs)));
  } else ((n.subrs = []), (n.subrsBias = 0));
  var v;
  r.lowMemory
    ? ((v = yw(e, t + c.charStrings)), (n.nGlyphs = v.offsets.length))
    : ((v = xn(e, t + c.charStrings)), (n.nGlyphs = v.objects.length));
  var S = Tw(e, t + c.charset, n.nGlyphs, o.objects);
  if (
    (c.encoding === 0
      ? (n.cffEncoding = new Ka(lw, S))
      : c.encoding === 1
        ? (n.cffEncoding = new Ka(uw, S))
        : (n.cffEncoding = Cw(e, t + c.encoding, S)),
    (n.encoding = n.encoding || n.cffEncoding),
    (n.glyphs = new Xt.GlyphSet(n)),
    r.lowMemory)
  )
    n._push = function (T) {
      var E = xw(T, v.offsets, e, t + c.charStrings);
      n.glyphs.push(T, Xt.cffGlyphLoader(n, T, Nd, E));
    };
  else
    for (var b = 0; b < n.nGlyphs; b += 1) {
      var L = v.objects[b];
      n.glyphs.push(b, Xt.cffGlyphLoader(n, b, Nd, L));
    }
}
function B0(e, t) {
  var n,
    r = fa.indexOf(e);
  return (
    r >= 0 && (n = r),
    (r = t.indexOf(e)),
    r >= 0 ? (n = r + fa.length) : ((n = fa.length + t.length), t.push(e)),
    n
  );
}
function Mw() {
  return new U.Record("Header", [
    { name: "major", type: "Card8", value: 1 },
    { name: "minor", type: "Card8", value: 0 },
    { name: "hdrSize", type: "Card8", value: 4 },
    { name: "major", type: "Card8", value: 1 },
  ]);
}
function Nw(e) {
  var t = new U.Record("Name INDEX", [{ name: "names", type: "INDEX", value: [] }]);
  t.names = [];
  for (var n = 0; n < e.length; n += 1)
    t.names.push({ name: "name_" + n, type: "NAME", value: e[n] });
  return t;
}
function $0(e, t, n) {
  for (var r = {}, s = 0; s < e.length; s += 1) {
    var i = e[s],
      a = t[i.name];
    a !== void 0 &&
      !O0(a, i.value) &&
      (i.type === "SID" && (a = B0(a, n)), (r[i.op] = { name: i.name, type: i.type, value: a }));
  }
  return r;
}
function Rd(e, t) {
  var n = new U.Record("Top DICT", [{ name: "dict", type: "DICT", value: {} }]);
  return ((n.dict = $0(D0, e, t)), n);
}
function Od(e) {
  var t = new U.Record("Top DICT INDEX", [{ name: "topDicts", type: "INDEX", value: [] }]);
  return ((t.topDicts = [{ name: "topDict_0", type: "TABLE", value: e }]), t);
}
function Rw(e) {
  var t = new U.Record("String INDEX", [{ name: "strings", type: "INDEX", value: [] }]);
  t.strings = [];
  for (var n = 0; n < e.length; n += 1)
    t.strings.push({ name: "string_" + n, type: "STRING", value: e[n] });
  return t;
}
function Ow() {
  return new U.Record("Global Subr INDEX", [{ name: "subrs", type: "INDEX", value: [] }]);
}
function Iw(e, t) {
  for (
    var n = new U.Record("Charsets", [{ name: "format", type: "Card8", value: 0 }]), r = 0;
    r < e.length;
    r += 1
  ) {
    var s = e[r],
      i = B0(s, t);
    n.fields.push({ name: "glyph_" + r, type: "SID", value: i });
  }
  return n;
}
function Pw(e) {
  var t = [],
    n = e.path;
  t.push({ name: "width", type: "NUMBER", value: e.advanceWidth });
  for (var r = 0, s = 0, i = 0; i < n.commands.length; i += 1) {
    var a = void 0,
      o = void 0,
      l = n.commands[i];
    if (l.type === "Q") {
      var u = 0.3333333333333333,
        c = 2 / 3;
      l = {
        type: "C",
        x: l.x,
        y: l.y,
        x1: Math.round(u * r + c * l.x1),
        y1: Math.round(u * s + c * l.y1),
        x2: Math.round(u * l.x + c * l.x1),
        y2: Math.round(u * l.y + c * l.y1),
      };
    }
    if (l.type === "M")
      ((a = Math.round(l.x - r)),
        (o = Math.round(l.y - s)),
        t.push({ name: "dx", type: "NUMBER", value: a }),
        t.push({ name: "dy", type: "NUMBER", value: o }),
        t.push({ name: "rmoveto", type: "OP", value: 21 }),
        (r = Math.round(l.x)),
        (s = Math.round(l.y)));
    else if (l.type === "L")
      ((a = Math.round(l.x - r)),
        (o = Math.round(l.y - s)),
        t.push({ name: "dx", type: "NUMBER", value: a }),
        t.push({ name: "dy", type: "NUMBER", value: o }),
        t.push({ name: "rlineto", type: "OP", value: 5 }),
        (r = Math.round(l.x)),
        (s = Math.round(l.y)));
    else if (l.type === "C") {
      var f = Math.round(l.x1 - r),
        d = Math.round(l.y1 - s),
        h = Math.round(l.x2 - l.x1),
        m = Math.round(l.y2 - l.y1);
      ((a = Math.round(l.x - l.x2)),
        (o = Math.round(l.y - l.y2)),
        t.push({ name: "dx1", type: "NUMBER", value: f }),
        t.push({ name: "dy1", type: "NUMBER", value: d }),
        t.push({ name: "dx2", type: "NUMBER", value: h }),
        t.push({ name: "dy2", type: "NUMBER", value: m }),
        t.push({ name: "dx", type: "NUMBER", value: a }),
        t.push({ name: "dy", type: "NUMBER", value: o }),
        t.push({ name: "rrcurveto", type: "OP", value: 8 }),
        (r = Math.round(l.x)),
        (s = Math.round(l.y)));
    }
  }
  return (t.push({ name: "endchar", type: "OP", value: 14 }), t);
}
function Dw(e) {
  for (
    var t = new U.Record("CharStrings INDEX", [{ name: "charStrings", type: "INDEX", value: [] }]),
      n = 0;
    n < e.length;
    n += 1
  ) {
    var r = e.get(n),
      s = Pw(r);
    t.charStrings.push({ name: r.name, type: "CHARSTRING", value: s });
  }
  return t;
}
function Uw(e, t) {
  var n = new U.Record("Private DICT", [{ name: "dict", type: "DICT", value: {} }]);
  return ((n.dict = $0(U0, e, t)), n);
}
function Aw(e, t) {
  for (
    var n = new U.Table("CFF ", [
        { name: "header", type: "RECORD" },
        { name: "nameIndex", type: "RECORD" },
        { name: "topDictIndex", type: "RECORD" },
        { name: "stringIndex", type: "RECORD" },
        { name: "globalSubrIndex", type: "RECORD" },
        { name: "charsets", type: "RECORD" },
        { name: "charStringsIndex", type: "RECORD" },
        { name: "privateDict", type: "RECORD" },
      ]),
      r = 1 / t.unitsPerEm,
      s = {
        version: t.version,
        fullName: t.fullName,
        familyName: t.familyName,
        weight: t.weightName,
        fontBBox: t.fontBBox || [0, 0, 0, 0],
        fontMatrix: [r, 0, 0, r, 0, 0],
        charset: 999,
        encoding: 0,
        charStrings: 999,
        private: [0, 999],
      },
      i = {},
      a = [],
      o,
      l = 1;
    l < e.length;
    l += 1
  )
    ((o = e.get(l)), a.push(o.name));
  var u = [];
  ((n.header = Mw()), (n.nameIndex = Nw([t.postScriptName])));
  var c = Rd(s, u);
  ((n.topDictIndex = Od(c)),
    (n.globalSubrIndex = Ow()),
    (n.charsets = Iw(a, u)),
    (n.charStringsIndex = Dw(e)),
    (n.privateDict = Uw(i, u)),
    (n.stringIndex = Rw(u)));
  var f =
    n.header.sizeOf() +
    n.nameIndex.sizeOf() +
    n.topDictIndex.sizeOf() +
    n.stringIndex.sizeOf() +
    n.globalSubrIndex.sizeOf();
  return (
    (s.charset = f),
    (s.encoding = 0),
    (s.charStrings = s.charset + n.charsets.sizeOf()),
    (s.private[1] = s.charStrings + n.charStringsIndex.sizeOf()),
    (c = Rd(s, u)),
    (n.topDictIndex = Od(c)),
    n
  );
}
var _0 = { parse: Fw, make: Aw };
function Bw(e, t) {
  var n = {},
    r = new z.Parser(e, t);
  return (
    (n.version = r.parseVersion()),
    (n.fontRevision = Math.round(r.parseFixed() * 1e3) / 1e3),
    (n.checkSumAdjustment = r.parseULong()),
    (n.magicNumber = r.parseULong()),
    V.argument(n.magicNumber === 1594834165, "Font header has wrong magic number."),
    (n.flags = r.parseUShort()),
    (n.unitsPerEm = r.parseUShort()),
    (n.created = r.parseLongDateTime()),
    (n.modified = r.parseLongDateTime()),
    (n.xMin = r.parseShort()),
    (n.yMin = r.parseShort()),
    (n.xMax = r.parseShort()),
    (n.yMax = r.parseShort()),
    (n.macStyle = r.parseUShort()),
    (n.lowestRecPPEM = r.parseUShort()),
    (n.fontDirectionHint = r.parseShort()),
    (n.indexToLocFormat = r.parseShort()),
    (n.glyphDataFormat = r.parseShort()),
    n
  );
}
function $w(e) {
  var t = Math.round(new Date().getTime() / 1e3) + 2082844800,
    n = t;
  return (
    e.createdTimestamp && (n = e.createdTimestamp + 2082844800),
    new U.Table(
      "head",
      [
        { name: "version", type: "FIXED", value: 65536 },
        { name: "fontRevision", type: "FIXED", value: 65536 },
        { name: "checkSumAdjustment", type: "ULONG", value: 0 },
        { name: "magicNumber", type: "ULONG", value: 1594834165 },
        { name: "flags", type: "USHORT", value: 0 },
        { name: "unitsPerEm", type: "USHORT", value: 1e3 },
        { name: "created", type: "LONGDATETIME", value: n },
        { name: "modified", type: "LONGDATETIME", value: t },
        { name: "xMin", type: "SHORT", value: 0 },
        { name: "yMin", type: "SHORT", value: 0 },
        { name: "xMax", type: "SHORT", value: 0 },
        { name: "yMax", type: "SHORT", value: 0 },
        { name: "macStyle", type: "USHORT", value: 0 },
        { name: "lowestRecPPEM", type: "USHORT", value: 0 },
        { name: "fontDirectionHint", type: "SHORT", value: 2 },
        { name: "indexToLocFormat", type: "SHORT", value: 0 },
        { name: "glyphDataFormat", type: "SHORT", value: 0 },
      ],
      e,
    )
  );
}
var z0 = { parse: Bw, make: $w };
function _w(e, t) {
  var n = {},
    r = new z.Parser(e, t);
  return (
    (n.version = r.parseVersion()),
    (n.ascender = r.parseShort()),
    (n.descender = r.parseShort()),
    (n.lineGap = r.parseShort()),
    (n.advanceWidthMax = r.parseUShort()),
    (n.minLeftSideBearing = r.parseShort()),
    (n.minRightSideBearing = r.parseShort()),
    (n.xMaxExtent = r.parseShort()),
    (n.caretSlopeRise = r.parseShort()),
    (n.caretSlopeRun = r.parseShort()),
    (n.caretOffset = r.parseShort()),
    (r.relativeOffset += 8),
    (n.metricDataFormat = r.parseShort()),
    (n.numberOfHMetrics = r.parseUShort()),
    n
  );
}
function zw(e) {
  return new U.Table(
    "hhea",
    [
      { name: "version", type: "FIXED", value: 65536 },
      { name: "ascender", type: "FWORD", value: 0 },
      { name: "descender", type: "FWORD", value: 0 },
      { name: "lineGap", type: "FWORD", value: 0 },
      { name: "advanceWidthMax", type: "UFWORD", value: 0 },
      { name: "minLeftSideBearing", type: "FWORD", value: 0 },
      { name: "minRightSideBearing", type: "FWORD", value: 0 },
      { name: "xMaxExtent", type: "FWORD", value: 0 },
      { name: "caretSlopeRise", type: "SHORT", value: 1 },
      { name: "caretSlopeRun", type: "SHORT", value: 0 },
      { name: "caretOffset", type: "SHORT", value: 0 },
      { name: "reserved1", type: "SHORT", value: 0 },
      { name: "reserved2", type: "SHORT", value: 0 },
      { name: "reserved3", type: "SHORT", value: 0 },
      { name: "reserved4", type: "SHORT", value: 0 },
      { name: "metricDataFormat", type: "SHORT", value: 0 },
      { name: "numberOfHMetrics", type: "USHORT", value: 0 },
    ],
    e,
  );
}
var j0 = { parse: _w, make: zw };
function jw(e, t, n, r, s) {
  for (var i, a, o = new z.Parser(e, t), l = 0; l < r; l += 1) {
    l < n && ((i = o.parseUShort()), (a = o.parseShort()));
    var u = s.get(l);
    ((u.advanceWidth = i), (u.leftSideBearing = a));
  }
}
function Gw(e, t, n, r, s) {
  e._hmtxTableData = {};
  for (var i, a, o = new z.Parser(t, n), l = 0; l < s; l += 1)
    (l < r && ((i = o.parseUShort()), (a = o.parseShort())),
      (e._hmtxTableData[l] = { advanceWidth: i, leftSideBearing: a }));
}
function Hw(e, t, n, r, s, i, a) {
  a.lowMemory ? Gw(e, t, n, r, s) : jw(t, n, r, s, i);
}
function Ww(e) {
  for (var t = new U.Table("hmtx", []), n = 0; n < e.length; n += 1) {
    var r = e.get(n),
      s = r.advanceWidth || 0,
      i = r.leftSideBearing || 0;
    (t.fields.push({ name: "advanceWidth_" + n, type: "USHORT", value: s }),
      t.fields.push({ name: "leftSideBearing_" + n, type: "SHORT", value: i }));
  }
  return t;
}
var G0 = { parse: Hw, make: Ww };
function Vw(e) {
  for (
    var t = new U.Table("ltag", [
        { name: "version", type: "ULONG", value: 1 },
        { name: "flags", type: "ULONG", value: 0 },
        { name: "numTags", type: "ULONG", value: e.length },
      ]),
      n = "",
      r = 12 + e.length * 4,
      s = 0;
    s < e.length;
    ++s
  ) {
    var i = n.indexOf(e[s]);
    (i < 0 && ((i = n.length), (n += e[s])),
      t.fields.push({ name: "offset " + s, type: "USHORT", value: r + i }),
      t.fields.push({ name: "length " + s, type: "USHORT", value: e[s].length }));
  }
  return (t.fields.push({ name: "stringPool", type: "CHARARRAY", value: n }), t);
}
function Kw(e, t) {
  var n = new z.Parser(e, t),
    r = n.parseULong();
  (V.argument(r === 1, "Unsupported ltag table version."), n.skip("uLong", 1));
  for (var s = n.parseULong(), i = [], a = 0; a < s; a++) {
    for (var o = "", l = t + n.parseUShort(), u = n.parseUShort(), c = l; c < l + u; ++c)
      o += String.fromCharCode(e.getInt8(c));
    i.push(o);
  }
  return i;
}
var H0 = { make: Vw, parse: Kw };
function qw(e, t) {
  var n = {},
    r = new z.Parser(e, t);
  return (
    (n.version = r.parseVersion()),
    (n.numGlyphs = r.parseUShort()),
    n.version === 1 &&
      ((n.maxPoints = r.parseUShort()),
      (n.maxContours = r.parseUShort()),
      (n.maxCompositePoints = r.parseUShort()),
      (n.maxCompositeContours = r.parseUShort()),
      (n.maxZones = r.parseUShort()),
      (n.maxTwilightPoints = r.parseUShort()),
      (n.maxStorage = r.parseUShort()),
      (n.maxFunctionDefs = r.parseUShort()),
      (n.maxInstructionDefs = r.parseUShort()),
      (n.maxStackElements = r.parseUShort()),
      (n.maxSizeOfInstructions = r.parseUShort()),
      (n.maxComponentElements = r.parseUShort()),
      (n.maxComponentDepth = r.parseUShort())),
    n
  );
}
function Xw(e) {
  return new U.Table("maxp", [
    { name: "version", type: "FIXED", value: 20480 },
    { name: "numGlyphs", type: "USHORT", value: e },
  ]);
}
var W0 = { parse: qw, make: Xw },
  V0 = [
    "copyright",
    "fontFamily",
    "fontSubfamily",
    "uniqueID",
    "fullName",
    "version",
    "postScriptName",
    "trademark",
    "manufacturer",
    "designer",
    "description",
    "manufacturerURL",
    "designerURL",
    "license",
    "licenseURL",
    "reserved",
    "preferredFamily",
    "preferredSubfamily",
    "compatibleFullName",
    "sampleText",
    "postScriptFindFontName",
    "wwsFamily",
    "wwsSubfamily",
  ],
  K0 = {
    0: "en",
    1: "fr",
    2: "de",
    3: "it",
    4: "nl",
    5: "sv",
    6: "es",
    7: "da",
    8: "pt",
    9: "no",
    10: "he",
    11: "ja",
    12: "ar",
    13: "fi",
    14: "el",
    15: "is",
    16: "mt",
    17: "tr",
    18: "hr",
    19: "zh-Hant",
    20: "ur",
    21: "hi",
    22: "th",
    23: "ko",
    24: "lt",
    25: "pl",
    26: "hu",
    27: "es",
    28: "lv",
    29: "se",
    30: "fo",
    31: "fa",
    32: "ru",
    33: "zh",
    34: "nl-BE",
    35: "ga",
    36: "sq",
    37: "ro",
    38: "cz",
    39: "sk",
    40: "si",
    41: "yi",
    42: "sr",
    43: "mk",
    44: "bg",
    45: "uk",
    46: "be",
    47: "uz",
    48: "kk",
    49: "az-Cyrl",
    50: "az-Arab",
    51: "hy",
    52: "ka",
    53: "mo",
    54: "ky",
    55: "tg",
    56: "tk",
    57: "mn-CN",
    58: "mn",
    59: "ps",
    60: "ks",
    61: "ku",
    62: "sd",
    63: "bo",
    64: "ne",
    65: "sa",
    66: "mr",
    67: "bn",
    68: "as",
    69: "gu",
    70: "pa",
    71: "or",
    72: "ml",
    73: "kn",
    74: "ta",
    75: "te",
    76: "si",
    77: "my",
    78: "km",
    79: "lo",
    80: "vi",
    81: "id",
    82: "tl",
    83: "ms",
    84: "ms-Arab",
    85: "am",
    86: "ti",
    87: "om",
    88: "so",
    89: "sw",
    90: "rw",
    91: "rn",
    92: "ny",
    93: "mg",
    94: "eo",
    128: "cy",
    129: "eu",
    130: "ca",
    131: "la",
    132: "qu",
    133: "gn",
    134: "ay",
    135: "tt",
    136: "ug",
    137: "dz",
    138: "jv",
    139: "su",
    140: "gl",
    141: "af",
    142: "br",
    143: "iu",
    144: "gd",
    145: "gv",
    146: "ga",
    147: "to",
    148: "el-polyton",
    149: "kl",
    150: "az",
    151: "nn",
  },
  Zw = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 5,
    11: 1,
    12: 4,
    13: 0,
    14: 6,
    15: 0,
    16: 0,
    17: 0,
    18: 0,
    19: 2,
    20: 4,
    21: 9,
    22: 21,
    23: 3,
    24: 29,
    25: 29,
    26: 29,
    27: 29,
    28: 29,
    29: 0,
    30: 0,
    31: 4,
    32: 7,
    33: 25,
    34: 0,
    35: 0,
    36: 0,
    37: 0,
    38: 29,
    39: 29,
    40: 0,
    41: 5,
    42: 7,
    43: 7,
    44: 7,
    45: 7,
    46: 7,
    47: 7,
    48: 7,
    49: 7,
    50: 4,
    51: 24,
    52: 23,
    53: 7,
    54: 7,
    55: 7,
    56: 7,
    57: 27,
    58: 7,
    59: 4,
    60: 4,
    61: 4,
    62: 4,
    63: 26,
    64: 9,
    65: 9,
    66: 9,
    67: 13,
    68: 13,
    69: 11,
    70: 10,
    71: 12,
    72: 17,
    73: 16,
    74: 14,
    75: 15,
    76: 18,
    77: 19,
    78: 20,
    79: 22,
    80: 30,
    81: 0,
    82: 0,
    83: 0,
    84: 4,
    85: 28,
    86: 28,
    87: 28,
    88: 0,
    89: 0,
    90: 0,
    91: 0,
    92: 0,
    93: 0,
    94: 0,
    128: 0,
    129: 0,
    130: 0,
    131: 0,
    132: 0,
    133: 0,
    134: 0,
    135: 7,
    136: 4,
    137: 26,
    138: 0,
    139: 0,
    140: 0,
    141: 0,
    142: 0,
    143: 28,
    144: 0,
    145: 0,
    146: 0,
    147: 0,
    148: 6,
    149: 0,
    150: 0,
    151: 0,
  },
  q0 = {
    1078: "af",
    1052: "sq",
    1156: "gsw",
    1118: "am",
    5121: "ar-DZ",
    15361: "ar-BH",
    3073: "ar",
    2049: "ar-IQ",
    11265: "ar-JO",
    13313: "ar-KW",
    12289: "ar-LB",
    4097: "ar-LY",
    6145: "ary",
    8193: "ar-OM",
    16385: "ar-QA",
    1025: "ar-SA",
    10241: "ar-SY",
    7169: "aeb",
    14337: "ar-AE",
    9217: "ar-YE",
    1067: "hy",
    1101: "as",
    2092: "az-Cyrl",
    1068: "az",
    1133: "ba",
    1069: "eu",
    1059: "be",
    2117: "bn",
    1093: "bn-IN",
    8218: "bs-Cyrl",
    5146: "bs",
    1150: "br",
    1026: "bg",
    1027: "ca",
    3076: "zh-HK",
    5124: "zh-MO",
    2052: "zh",
    4100: "zh-SG",
    1028: "zh-TW",
    1155: "co",
    1050: "hr",
    4122: "hr-BA",
    1029: "cs",
    1030: "da",
    1164: "prs",
    1125: "dv",
    2067: "nl-BE",
    1043: "nl",
    3081: "en-AU",
    10249: "en-BZ",
    4105: "en-CA",
    9225: "en-029",
    16393: "en-IN",
    6153: "en-IE",
    8201: "en-JM",
    17417: "en-MY",
    5129: "en-NZ",
    13321: "en-PH",
    18441: "en-SG",
    7177: "en-ZA",
    11273: "en-TT",
    2057: "en-GB",
    1033: "en",
    12297: "en-ZW",
    1061: "et",
    1080: "fo",
    1124: "fil",
    1035: "fi",
    2060: "fr-BE",
    3084: "fr-CA",
    1036: "fr",
    5132: "fr-LU",
    6156: "fr-MC",
    4108: "fr-CH",
    1122: "fy",
    1110: "gl",
    1079: "ka",
    3079: "de-AT",
    1031: "de",
    5127: "de-LI",
    4103: "de-LU",
    2055: "de-CH",
    1032: "el",
    1135: "kl",
    1095: "gu",
    1128: "ha",
    1037: "he",
    1081: "hi",
    1038: "hu",
    1039: "is",
    1136: "ig",
    1057: "id",
    1117: "iu",
    2141: "iu-Latn",
    2108: "ga",
    1076: "xh",
    1077: "zu",
    1040: "it",
    2064: "it-CH",
    1041: "ja",
    1099: "kn",
    1087: "kk",
    1107: "km",
    1158: "quc",
    1159: "rw",
    1089: "sw",
    1111: "kok",
    1042: "ko",
    1088: "ky",
    1108: "lo",
    1062: "lv",
    1063: "lt",
    2094: "dsb",
    1134: "lb",
    1071: "mk",
    2110: "ms-BN",
    1086: "ms",
    1100: "ml",
    1082: "mt",
    1153: "mi",
    1146: "arn",
    1102: "mr",
    1148: "moh",
    1104: "mn",
    2128: "mn-CN",
    1121: "ne",
    1044: "nb",
    2068: "nn",
    1154: "oc",
    1096: "or",
    1123: "ps",
    1045: "pl",
    1046: "pt",
    2070: "pt-PT",
    1094: "pa",
    1131: "qu-BO",
    2155: "qu-EC",
    3179: "qu",
    1048: "ro",
    1047: "rm",
    1049: "ru",
    9275: "smn",
    4155: "smj-NO",
    5179: "smj",
    3131: "se-FI",
    1083: "se",
    2107: "se-SE",
    8251: "sms",
    6203: "sma-NO",
    7227: "sms",
    1103: "sa",
    7194: "sr-Cyrl-BA",
    3098: "sr",
    6170: "sr-Latn-BA",
    2074: "sr-Latn",
    1132: "nso",
    1074: "tn",
    1115: "si",
    1051: "sk",
    1060: "sl",
    11274: "es-AR",
    16394: "es-BO",
    13322: "es-CL",
    9226: "es-CO",
    5130: "es-CR",
    7178: "es-DO",
    12298: "es-EC",
    17418: "es-SV",
    4106: "es-GT",
    18442: "es-HN",
    2058: "es-MX",
    19466: "es-NI",
    6154: "es-PA",
    15370: "es-PY",
    10250: "es-PE",
    20490: "es-PR",
    3082: "es",
    1034: "es",
    21514: "es-US",
    14346: "es-UY",
    8202: "es-VE",
    2077: "sv-FI",
    1053: "sv",
    1114: "syr",
    1064: "tg",
    2143: "tzm",
    1097: "ta",
    1092: "tt",
    1098: "te",
    1054: "th",
    1105: "bo",
    1055: "tr",
    1090: "tk",
    1152: "ug",
    1058: "uk",
    1070: "hsb",
    1056: "ur",
    2115: "uz-Cyrl",
    1091: "uz",
    1066: "vi",
    1106: "cy",
    1160: "wo",
    1157: "sah",
    1144: "ii",
    1130: "yo",
  };
function Yw(e, t, n) {
  switch (e) {
    case 0:
      if (t === 65535) return "und";
      if (n) return n[t];
      break;
    case 1:
      return K0[t];
    case 3:
      return q0[t];
  }
}
var vu = "utf-16",
  Qw = {
    0: "macintosh",
    1: "x-mac-japanese",
    2: "x-mac-chinesetrad",
    3: "x-mac-korean",
    6: "x-mac-greek",
    7: "x-mac-cyrillic",
    9: "x-mac-devanagai",
    10: "x-mac-gurmukhi",
    11: "x-mac-gujarati",
    12: "x-mac-oriya",
    13: "x-mac-bengali",
    14: "x-mac-tamil",
    15: "x-mac-telugu",
    16: "x-mac-kannada",
    17: "x-mac-malayalam",
    18: "x-mac-sinhalese",
    19: "x-mac-burmese",
    20: "x-mac-khmer",
    21: "x-mac-thai",
    22: "x-mac-lao",
    23: "x-mac-georgian",
    24: "x-mac-armenian",
    25: "x-mac-chinesesimp",
    26: "x-mac-tibetan",
    27: "x-mac-mongolian",
    28: "x-mac-ethiopic",
    29: "x-mac-ce",
    30: "x-mac-vietnamese",
    31: "x-mac-extarabic",
  },
  Jw = {
    15: "x-mac-icelandic",
    17: "x-mac-turkish",
    18: "x-mac-croatian",
    24: "x-mac-ce",
    25: "x-mac-ce",
    26: "x-mac-ce",
    27: "x-mac-ce",
    28: "x-mac-ce",
    30: "x-mac-icelandic",
    37: "x-mac-romanian",
    38: "x-mac-ce",
    39: "x-mac-ce",
    40: "x-mac-ce",
    143: "x-mac-inuit",
    146: "x-mac-gaelic",
  };
function X0(e, t, n) {
  switch (e) {
    case 0:
      return vu;
    case 1:
      return Jw[n] || Qw[t];
    case 3:
      if (t === 1 || t === 10) return vu;
      break;
  }
}
function eb(e, t, n) {
  for (
    var r = {},
      s = new z.Parser(e, t),
      i = s.parseUShort(),
      a = s.parseUShort(),
      o = s.offset + s.parseUShort(),
      l = 0;
    l < a;
    l++
  ) {
    var u = s.parseUShort(),
      c = s.parseUShort(),
      f = s.parseUShort(),
      d = s.parseUShort(),
      h = V0[d] || d,
      m = s.parseUShort(),
      x = s.parseUShort(),
      k = Yw(u, f, n),
      p = X0(u, c, f);
    if (p !== void 0 && k !== void 0) {
      var g = void 0;
      if ((p === vu ? (g = es.UTF16(e, o + x, m)) : (g = es.MACSTRING(e, o + x, m, p)), g)) {
        var v = r[h];
        (v === void 0 && (v = r[h] = {}), (v[k] = g));
      }
    }
  }
  return (i === 1 && s.parseUShort(), r);
}
function rl(e) {
  var t = {};
  for (var n in e) t[e[n]] = parseInt(n);
  return t;
}
function Id(e, t, n, r, s, i) {
  return new U.Record("NameRecord", [
    { name: "platformID", type: "USHORT", value: e },
    { name: "encodingID", type: "USHORT", value: t },
    { name: "languageID", type: "USHORT", value: n },
    { name: "nameID", type: "USHORT", value: r },
    { name: "length", type: "USHORT", value: s },
    { name: "offset", type: "USHORT", value: i },
  ]);
}
function tb(e, t) {
  var n = e.length,
    r = t.length - n + 1;
  e: for (var s = 0; s < r; s++)
    for (; s < r; s++) {
      for (var i = 0; i < n; i++) if (t[s + i] !== e[i]) continue e;
      return s;
    }
  return -1;
}
function Pd(e, t) {
  var n = tb(e, t);
  if (n < 0) {
    n = t.length;
    for (var r = 0, s = e.length; r < s; ++r) t.push(e[r]);
  }
  return n;
}
function nb(e, t) {
  var n,
    r = [],
    s = {},
    i = rl(V0);
  for (var a in e) {
    var o = i[a];
    if ((o === void 0 && (o = a), (n = parseInt(o)), isNaN(n)))
      throw new Error(
        'Name table entry "' + a + '" does not exist, see nameTableNames for complete list.',
      );
    ((s[n] = e[a]), r.push(n));
  }
  for (var l = rl(K0), u = rl(q0), c = [], f = [], d = 0; d < r.length; d++) {
    n = r[d];
    var h = s[n];
    for (var m in h) {
      var x = h[m],
        k = 1,
        p = l[m],
        g = Zw[p],
        v = X0(k, g, p),
        S = D.MACSTRING(x, v);
      S === void 0 &&
        ((k = 0),
        (p = t.indexOf(m)),
        p < 0 && ((p = t.length), t.push(m)),
        (g = 4),
        (S = D.UTF16(x)));
      var b = Pd(S, f);
      c.push(Id(k, g, p, n, S.length, b));
      var L = u[m];
      if (L !== void 0) {
        var T = D.UTF16(x),
          E = Pd(T, f);
        c.push(Id(3, 1, L, n, T.length, E));
      }
    }
  }
  c.sort(function (q, Q) {
    return (
      q.platformID - Q.platformID ||
      q.encodingID - Q.encodingID ||
      q.languageID - Q.languageID ||
      q.nameID - Q.nameID
    );
  });
  for (
    var I = new U.Table("name", [
        { name: "format", type: "USHORT", value: 0 },
        { name: "count", type: "USHORT", value: c.length },
        { name: "stringOffset", type: "USHORT", value: 6 + c.length * 12 },
      ]),
      P = 0;
    P < c.length;
    P++
  )
    I.fields.push({ name: "record_" + P, type: "RECORD", value: c[P] });
  return (I.fields.push({ name: "strings", type: "LITERAL", value: f }), I);
}
var Z0 = { parse: eb, make: nb },
  yu = [
    { begin: 0, end: 127 },
    { begin: 128, end: 255 },
    { begin: 256, end: 383 },
    { begin: 384, end: 591 },
    { begin: 592, end: 687 },
    { begin: 688, end: 767 },
    { begin: 768, end: 879 },
    { begin: 880, end: 1023 },
    { begin: 11392, end: 11519 },
    { begin: 1024, end: 1279 },
    { begin: 1328, end: 1423 },
    { begin: 1424, end: 1535 },
    { begin: 42240, end: 42559 },
    { begin: 1536, end: 1791 },
    { begin: 1984, end: 2047 },
    { begin: 2304, end: 2431 },
    { begin: 2432, end: 2559 },
    { begin: 2560, end: 2687 },
    { begin: 2688, end: 2815 },
    { begin: 2816, end: 2943 },
    { begin: 2944, end: 3071 },
    { begin: 3072, end: 3199 },
    { begin: 3200, end: 3327 },
    { begin: 3328, end: 3455 },
    { begin: 3584, end: 3711 },
    { begin: 3712, end: 3839 },
    { begin: 4256, end: 4351 },
    { begin: 6912, end: 7039 },
    { begin: 4352, end: 4607 },
    { begin: 7680, end: 7935 },
    { begin: 7936, end: 8191 },
    { begin: 8192, end: 8303 },
    { begin: 8304, end: 8351 },
    { begin: 8352, end: 8399 },
    { begin: 8400, end: 8447 },
    { begin: 8448, end: 8527 },
    { begin: 8528, end: 8591 },
    { begin: 8592, end: 8703 },
    { begin: 8704, end: 8959 },
    { begin: 8960, end: 9215 },
    { begin: 9216, end: 9279 },
    { begin: 9280, end: 9311 },
    { begin: 9312, end: 9471 },
    { begin: 9472, end: 9599 },
    { begin: 9600, end: 9631 },
    { begin: 9632, end: 9727 },
    { begin: 9728, end: 9983 },
    { begin: 9984, end: 10175 },
    { begin: 12288, end: 12351 },
    { begin: 12352, end: 12447 },
    { begin: 12448, end: 12543 },
    { begin: 12544, end: 12591 },
    { begin: 12592, end: 12687 },
    { begin: 43072, end: 43135 },
    { begin: 12800, end: 13055 },
    { begin: 13056, end: 13311 },
    { begin: 44032, end: 55215 },
    { begin: 55296, end: 57343 },
    { begin: 67840, end: 67871 },
    { begin: 19968, end: 40959 },
    { begin: 57344, end: 63743 },
    { begin: 12736, end: 12783 },
    { begin: 64256, end: 64335 },
    { begin: 64336, end: 65023 },
    { begin: 65056, end: 65071 },
    { begin: 65040, end: 65055 },
    { begin: 65104, end: 65135 },
    { begin: 65136, end: 65279 },
    { begin: 65280, end: 65519 },
    { begin: 65520, end: 65535 },
    { begin: 3840, end: 4095 },
    { begin: 1792, end: 1871 },
    { begin: 1920, end: 1983 },
    { begin: 3456, end: 3583 },
    { begin: 4096, end: 4255 },
    { begin: 4608, end: 4991 },
    { begin: 5024, end: 5119 },
    { begin: 5120, end: 5759 },
    { begin: 5760, end: 5791 },
    { begin: 5792, end: 5887 },
    { begin: 6016, end: 6143 },
    { begin: 6144, end: 6319 },
    { begin: 10240, end: 10495 },
    { begin: 40960, end: 42127 },
    { begin: 5888, end: 5919 },
    { begin: 66304, end: 66351 },
    { begin: 66352, end: 66383 },
    { begin: 66560, end: 66639 },
    { begin: 118784, end: 119039 },
    { begin: 119808, end: 120831 },
    { begin: 1044480, end: 1048573 },
    { begin: 65024, end: 65039 },
    { begin: 917504, end: 917631 },
    { begin: 6400, end: 6479 },
    { begin: 6480, end: 6527 },
    { begin: 6528, end: 6623 },
    { begin: 6656, end: 6687 },
    { begin: 11264, end: 11359 },
    { begin: 11568, end: 11647 },
    { begin: 19904, end: 19967 },
    { begin: 43008, end: 43055 },
    { begin: 65536, end: 65663 },
    { begin: 65856, end: 65935 },
    { begin: 66432, end: 66463 },
    { begin: 66464, end: 66527 },
    { begin: 66640, end: 66687 },
    { begin: 66688, end: 66735 },
    { begin: 67584, end: 67647 },
    { begin: 68096, end: 68191 },
    { begin: 119552, end: 119647 },
    { begin: 73728, end: 74751 },
    { begin: 119648, end: 119679 },
    { begin: 7040, end: 7103 },
    { begin: 7168, end: 7247 },
    { begin: 7248, end: 7295 },
    { begin: 43136, end: 43231 },
    { begin: 43264, end: 43311 },
    { begin: 43312, end: 43359 },
    { begin: 43520, end: 43615 },
    { begin: 65936, end: 65999 },
    { begin: 66e3, end: 66047 },
    { begin: 66208, end: 66271 },
    { begin: 127024, end: 127135 },
  ];
function rb(e) {
  for (var t = 0; t < yu.length; t += 1) {
    var n = yu[t];
    if (e >= n.begin && e < n.end) return t;
  }
  return -1;
}
function sb(e, t) {
  var n = {},
    r = new z.Parser(e, t);
  ((n.version = r.parseUShort()),
    (n.xAvgCharWidth = r.parseShort()),
    (n.usWeightClass = r.parseUShort()),
    (n.usWidthClass = r.parseUShort()),
    (n.fsType = r.parseUShort()),
    (n.ySubscriptXSize = r.parseShort()),
    (n.ySubscriptYSize = r.parseShort()),
    (n.ySubscriptXOffset = r.parseShort()),
    (n.ySubscriptYOffset = r.parseShort()),
    (n.ySuperscriptXSize = r.parseShort()),
    (n.ySuperscriptYSize = r.parseShort()),
    (n.ySuperscriptXOffset = r.parseShort()),
    (n.ySuperscriptYOffset = r.parseShort()),
    (n.yStrikeoutSize = r.parseShort()),
    (n.yStrikeoutPosition = r.parseShort()),
    (n.sFamilyClass = r.parseShort()),
    (n.panose = []));
  for (var s = 0; s < 10; s++) n.panose[s] = r.parseByte();
  return (
    (n.ulUnicodeRange1 = r.parseULong()),
    (n.ulUnicodeRange2 = r.parseULong()),
    (n.ulUnicodeRange3 = r.parseULong()),
    (n.ulUnicodeRange4 = r.parseULong()),
    (n.achVendID = String.fromCharCode(r.parseByte(), r.parseByte(), r.parseByte(), r.parseByte())),
    (n.fsSelection = r.parseUShort()),
    (n.usFirstCharIndex = r.parseUShort()),
    (n.usLastCharIndex = r.parseUShort()),
    (n.sTypoAscender = r.parseShort()),
    (n.sTypoDescender = r.parseShort()),
    (n.sTypoLineGap = r.parseShort()),
    (n.usWinAscent = r.parseUShort()),
    (n.usWinDescent = r.parseUShort()),
    n.version >= 1 &&
      ((n.ulCodePageRange1 = r.parseULong()), (n.ulCodePageRange2 = r.parseULong())),
    n.version >= 2 &&
      ((n.sxHeight = r.parseShort()),
      (n.sCapHeight = r.parseShort()),
      (n.usDefaultChar = r.parseUShort()),
      (n.usBreakChar = r.parseUShort()),
      (n.usMaxContent = r.parseUShort())),
    n
  );
}
function ib(e) {
  return new U.Table(
    "OS/2",
    [
      { name: "version", type: "USHORT", value: 3 },
      { name: "xAvgCharWidth", type: "SHORT", value: 0 },
      { name: "usWeightClass", type: "USHORT", value: 0 },
      { name: "usWidthClass", type: "USHORT", value: 0 },
      { name: "fsType", type: "USHORT", value: 0 },
      { name: "ySubscriptXSize", type: "SHORT", value: 650 },
      { name: "ySubscriptYSize", type: "SHORT", value: 699 },
      { name: "ySubscriptXOffset", type: "SHORT", value: 0 },
      { name: "ySubscriptYOffset", type: "SHORT", value: 140 },
      { name: "ySuperscriptXSize", type: "SHORT", value: 650 },
      { name: "ySuperscriptYSize", type: "SHORT", value: 699 },
      { name: "ySuperscriptXOffset", type: "SHORT", value: 0 },
      { name: "ySuperscriptYOffset", type: "SHORT", value: 479 },
      { name: "yStrikeoutSize", type: "SHORT", value: 49 },
      { name: "yStrikeoutPosition", type: "SHORT", value: 258 },
      { name: "sFamilyClass", type: "SHORT", value: 0 },
      { name: "bFamilyType", type: "BYTE", value: 0 },
      { name: "bSerifStyle", type: "BYTE", value: 0 },
      { name: "bWeight", type: "BYTE", value: 0 },
      { name: "bProportion", type: "BYTE", value: 0 },
      { name: "bContrast", type: "BYTE", value: 0 },
      { name: "bStrokeVariation", type: "BYTE", value: 0 },
      { name: "bArmStyle", type: "BYTE", value: 0 },
      { name: "bLetterform", type: "BYTE", value: 0 },
      { name: "bMidline", type: "BYTE", value: 0 },
      { name: "bXHeight", type: "BYTE", value: 0 },
      { name: "ulUnicodeRange1", type: "ULONG", value: 0 },
      { name: "ulUnicodeRange2", type: "ULONG", value: 0 },
      { name: "ulUnicodeRange3", type: "ULONG", value: 0 },
      { name: "ulUnicodeRange4", type: "ULONG", value: 0 },
      { name: "achVendID", type: "CHARARRAY", value: "XXXX" },
      { name: "fsSelection", type: "USHORT", value: 0 },
      { name: "usFirstCharIndex", type: "USHORT", value: 0 },
      { name: "usLastCharIndex", type: "USHORT", value: 0 },
      { name: "sTypoAscender", type: "SHORT", value: 0 },
      { name: "sTypoDescender", type: "SHORT", value: 0 },
      { name: "sTypoLineGap", type: "SHORT", value: 0 },
      { name: "usWinAscent", type: "USHORT", value: 0 },
      { name: "usWinDescent", type: "USHORT", value: 0 },
      { name: "ulCodePageRange1", type: "ULONG", value: 0 },
      { name: "ulCodePageRange2", type: "ULONG", value: 0 },
      { name: "sxHeight", type: "SHORT", value: 0 },
      { name: "sCapHeight", type: "SHORT", value: 0 },
      { name: "usDefaultChar", type: "USHORT", value: 0 },
      { name: "usBreakChar", type: "USHORT", value: 0 },
      { name: "usMaxContext", type: "USHORT", value: 0 },
    ],
    e,
  );
}
var xu = { parse: sb, make: ib, unicodeRanges: yu, getUnicodeRange: rb };
function ab(e, t) {
  var n = {},
    r = new z.Parser(e, t);
  switch (
    ((n.version = r.parseVersion()),
    (n.italicAngle = r.parseFixed()),
    (n.underlinePosition = r.parseShort()),
    (n.underlineThickness = r.parseShort()),
    (n.isFixedPitch = r.parseULong()),
    (n.minMemType42 = r.parseULong()),
    (n.maxMemType42 = r.parseULong()),
    (n.minMemType1 = r.parseULong()),
    (n.maxMemType1 = r.parseULong()),
    n.version)
  ) {
    case 1:
      n.names = tr.slice();
      break;
    case 2:
      ((n.numberOfGlyphs = r.parseUShort()), (n.glyphNameIndex = new Array(n.numberOfGlyphs)));
      for (var s = 0; s < n.numberOfGlyphs; s++) n.glyphNameIndex[s] = r.parseUShort();
      n.names = [];
      for (var i = 0; i < n.numberOfGlyphs; i++)
        if (n.glyphNameIndex[i] >= tr.length) {
          var a = r.parseChar();
          n.names.push(r.parseString(a));
        }
      break;
    case 2.5:
      ((n.numberOfGlyphs = r.parseUShort()), (n.offset = new Array(n.numberOfGlyphs)));
      for (var o = 0; o < n.numberOfGlyphs; o++) n.offset[o] = r.parseChar();
      break;
  }
  return n;
}
function ob() {
  return new U.Table("post", [
    { name: "version", type: "FIXED", value: 196608 },
    { name: "italicAngle", type: "FIXED", value: 0 },
    { name: "underlinePosition", type: "FWORD", value: 0 },
    { name: "underlineThickness", type: "FWORD", value: 0 },
    { name: "isFixedPitch", type: "ULONG", value: 0 },
    { name: "minMemType42", type: "ULONG", value: 0 },
    { name: "maxMemType42", type: "ULONG", value: 0 },
    { name: "minMemType1", type: "ULONG", value: 0 },
    { name: "maxMemType1", type: "ULONG", value: 0 },
  ]);
}
var Y0 = { parse: ab, make: ob },
  Dt = new Array(9);
Dt[1] = function () {
  var t = this.offset + this.relativeOffset,
    n = this.parseUShort();
  if (n === 1)
    return {
      substFormat: 1,
      coverage: this.parsePointer(w.coverage),
      deltaGlyphId: this.parseUShort(),
    };
  if (n === 2)
    return {
      substFormat: 2,
      coverage: this.parsePointer(w.coverage),
      substitute: this.parseOffset16List(),
    };
  V.assert(!1, "0x" + t.toString(16) + ": lookup type 1 format must be 1 or 2.");
};
Dt[2] = function () {
  var t = this.parseUShort();
  return (
    V.argument(t === 1, "GSUB Multiple Substitution Subtable identifier-format must be 1"),
    { substFormat: t, coverage: this.parsePointer(w.coverage), sequences: this.parseListOfLists() }
  );
};
Dt[3] = function () {
  var t = this.parseUShort();
  return (
    V.argument(t === 1, "GSUB Alternate Substitution Subtable identifier-format must be 1"),
    {
      substFormat: t,
      coverage: this.parsePointer(w.coverage),
      alternateSets: this.parseListOfLists(),
    }
  );
};
Dt[4] = function () {
  var t = this.parseUShort();
  return (
    V.argument(t === 1, "GSUB ligature table identifier-format must be 1"),
    {
      substFormat: t,
      coverage: this.parsePointer(w.coverage),
      ligatureSets: this.parseListOfLists(function () {
        return {
          ligGlyph: this.parseUShort(),
          components: this.parseUShortList(this.parseUShort() - 1),
        };
      }),
    }
  );
};
var Wr = { sequenceIndex: w.uShort, lookupListIndex: w.uShort };
Dt[5] = function () {
  var t = this.offset + this.relativeOffset,
    n = this.parseUShort();
  if (n === 1)
    return {
      substFormat: n,
      coverage: this.parsePointer(w.coverage),
      ruleSets: this.parseListOfLists(function () {
        var i = this.parseUShort(),
          a = this.parseUShort();
        return { input: this.parseUShortList(i - 1), lookupRecords: this.parseRecordList(a, Wr) };
      }),
    };
  if (n === 2)
    return {
      substFormat: n,
      coverage: this.parsePointer(w.coverage),
      classDef: this.parsePointer(w.classDef),
      classSets: this.parseListOfLists(function () {
        var i = this.parseUShort(),
          a = this.parseUShort();
        return { classes: this.parseUShortList(i - 1), lookupRecords: this.parseRecordList(a, Wr) };
      }),
    };
  if (n === 3) {
    var r = this.parseUShort(),
      s = this.parseUShort();
    return {
      substFormat: n,
      coverages: this.parseList(r, w.pointer(w.coverage)),
      lookupRecords: this.parseRecordList(s, Wr),
    };
  }
  V.assert(!1, "0x" + t.toString(16) + ": lookup type 5 format must be 1, 2 or 3.");
};
Dt[6] = function () {
  var t = this.offset + this.relativeOffset,
    n = this.parseUShort();
  if (n === 1)
    return {
      substFormat: 1,
      coverage: this.parsePointer(w.coverage),
      chainRuleSets: this.parseListOfLists(function () {
        return {
          backtrack: this.parseUShortList(),
          input: this.parseUShortList(this.parseShort() - 1),
          lookahead: this.parseUShortList(),
          lookupRecords: this.parseRecordList(Wr),
        };
      }),
    };
  if (n === 2)
    return {
      substFormat: 2,
      coverage: this.parsePointer(w.coverage),
      backtrackClassDef: this.parsePointer(w.classDef),
      inputClassDef: this.parsePointer(w.classDef),
      lookaheadClassDef: this.parsePointer(w.classDef),
      chainClassSet: this.parseListOfLists(function () {
        return {
          backtrack: this.parseUShortList(),
          input: this.parseUShortList(this.parseShort() - 1),
          lookahead: this.parseUShortList(),
          lookupRecords: this.parseRecordList(Wr),
        };
      }),
    };
  if (n === 3)
    return {
      substFormat: 3,
      backtrackCoverage: this.parseList(w.pointer(w.coverage)),
      inputCoverage: this.parseList(w.pointer(w.coverage)),
      lookaheadCoverage: this.parseList(w.pointer(w.coverage)),
      lookupRecords: this.parseRecordList(Wr),
    };
  V.assert(!1, "0x" + t.toString(16) + ": lookup type 6 format must be 1, 2 or 3.");
};
Dt[7] = function () {
  var t = this.parseUShort();
  V.argument(t === 1, "GSUB Extension Substitution subtable identifier-format must be 1");
  var n = this.parseUShort(),
    r = new w(this.data, this.offset + this.parseULong());
  return { substFormat: 1, lookupType: n, extension: Dt[n].call(r) };
};
Dt[8] = function () {
  var t = this.parseUShort();
  return (
    V.argument(
      t === 1,
      "GSUB Reverse Chaining Contextual Single Substitution Subtable identifier-format must be 1",
    ),
    {
      substFormat: t,
      coverage: this.parsePointer(w.coverage),
      backtrackCoverage: this.parseList(w.pointer(w.coverage)),
      lookaheadCoverage: this.parseList(w.pointer(w.coverage)),
      substitutes: this.parseUShortList(),
    }
  );
};
function lb(e, t) {
  t = t || 0;
  var n = new w(e, t),
    r = n.parseVersion(1);
  return (
    V.argument(r === 1 || r === 1.1, "Unsupported GSUB table version."),
    r === 1
      ? {
          version: r,
          scripts: n.parseScriptList(),
          features: n.parseFeatureList(),
          lookups: n.parseLookupList(Dt),
        }
      : {
          version: r,
          scripts: n.parseScriptList(),
          features: n.parseFeatureList(),
          lookups: n.parseLookupList(Dt),
          variations: n.parseFeatureVariationsList(),
        }
  );
}
var is = new Array(9);
is[1] = function (t) {
  return t.substFormat === 1
    ? new U.Table("substitutionTable", [
        { name: "substFormat", type: "USHORT", value: 1 },
        { name: "coverage", type: "TABLE", value: new U.Coverage(t.coverage) },
        { name: "deltaGlyphID", type: "USHORT", value: t.deltaGlyphId },
      ])
    : new U.Table(
        "substitutionTable",
        [
          { name: "substFormat", type: "USHORT", value: 2 },
          { name: "coverage", type: "TABLE", value: new U.Coverage(t.coverage) },
        ].concat(U.ushortList("substitute", t.substitute)),
      );
};
is[2] = function (t) {
  return (
    V.assert(t.substFormat === 1, "Lookup type 2 substFormat must be 1."),
    new U.Table(
      "substitutionTable",
      [
        { name: "substFormat", type: "USHORT", value: 1 },
        { name: "coverage", type: "TABLE", value: new U.Coverage(t.coverage) },
      ].concat(
        U.tableList("seqSet", t.sequences, function (n) {
          return new U.Table("sequenceSetTable", U.ushortList("sequence", n));
        }),
      ),
    )
  );
};
is[3] = function (t) {
  return (
    V.assert(t.substFormat === 1, "Lookup type 3 substFormat must be 1."),
    new U.Table(
      "substitutionTable",
      [
        { name: "substFormat", type: "USHORT", value: 1 },
        { name: "coverage", type: "TABLE", value: new U.Coverage(t.coverage) },
      ].concat(
        U.tableList("altSet", t.alternateSets, function (n) {
          return new U.Table("alternateSetTable", U.ushortList("alternate", n));
        }),
      ),
    )
  );
};
is[4] = function (t) {
  return (
    V.assert(t.substFormat === 1, "Lookup type 4 substFormat must be 1."),
    new U.Table(
      "substitutionTable",
      [
        { name: "substFormat", type: "USHORT", value: 1 },
        { name: "coverage", type: "TABLE", value: new U.Coverage(t.coverage) },
      ].concat(
        U.tableList("ligSet", t.ligatureSets, function (n) {
          return new U.Table(
            "ligatureSetTable",
            U.tableList("ligature", n, function (r) {
              return new U.Table(
                "ligatureTable",
                [{ name: "ligGlyph", type: "USHORT", value: r.ligGlyph }].concat(
                  U.ushortList("component", r.components, r.components.length + 1),
                ),
              );
            }),
          );
        }),
      ),
    )
  );
};
is[6] = function (t) {
  if (t.substFormat === 1) {
    var n = new U.Table(
      "chainContextTable",
      [
        { name: "substFormat", type: "USHORT", value: t.substFormat },
        { name: "coverage", type: "TABLE", value: new U.Coverage(t.coverage) },
      ].concat(
        U.tableList("chainRuleSet", t.chainRuleSets, function (i) {
          return new U.Table(
            "chainRuleSetTable",
            U.tableList("chainRule", i, function (a) {
              var o = U.ushortList("backtrackGlyph", a.backtrack, a.backtrack.length)
                .concat(U.ushortList("inputGlyph", a.input, a.input.length + 1))
                .concat(U.ushortList("lookaheadGlyph", a.lookahead, a.lookahead.length))
                .concat(U.ushortList("substitution", [], a.lookupRecords.length));
              return (
                a.lookupRecords.forEach(function (l, u) {
                  o = o
                    .concat({ name: "sequenceIndex" + u, type: "USHORT", value: l.sequenceIndex })
                    .concat({
                      name: "lookupListIndex" + u,
                      type: "USHORT",
                      value: l.lookupListIndex,
                    });
                }),
                new U.Table("chainRuleTable", o)
              );
            }),
          );
        }),
      ),
    );
    return n;
  } else if (t.substFormat === 2) V.assert(!1, "lookup type 6 format 2 is not yet supported.");
  else if (t.substFormat === 3) {
    var r = [{ name: "substFormat", type: "USHORT", value: t.substFormat }];
    (r.push({ name: "backtrackGlyphCount", type: "USHORT", value: t.backtrackCoverage.length }),
      t.backtrackCoverage.forEach(function (i, a) {
        r.push({ name: "backtrackCoverage" + a, type: "TABLE", value: new U.Coverage(i) });
      }),
      r.push({ name: "inputGlyphCount", type: "USHORT", value: t.inputCoverage.length }),
      t.inputCoverage.forEach(function (i, a) {
        r.push({ name: "inputCoverage" + a, type: "TABLE", value: new U.Coverage(i) });
      }),
      r.push({ name: "lookaheadGlyphCount", type: "USHORT", value: t.lookaheadCoverage.length }),
      t.lookaheadCoverage.forEach(function (i, a) {
        r.push({ name: "lookaheadCoverage" + a, type: "TABLE", value: new U.Coverage(i) });
      }),
      r.push({ name: "substitutionCount", type: "USHORT", value: t.lookupRecords.length }),
      t.lookupRecords.forEach(function (i, a) {
        r = r
          .concat({ name: "sequenceIndex" + a, type: "USHORT", value: i.sequenceIndex })
          .concat({ name: "lookupListIndex" + a, type: "USHORT", value: i.lookupListIndex });
      }));
    var s = new U.Table("chainContextTable", r);
    return s;
  }
  V.assert(!1, "lookup type 6 format must be 1, 2 or 3.");
};
function ub(e) {
  return new U.Table("GSUB", [
    { name: "version", type: "ULONG", value: 65536 },
    { name: "scripts", type: "TABLE", value: new U.ScriptList(e.scripts) },
    { name: "features", type: "TABLE", value: new U.FeatureList(e.features) },
    { name: "lookups", type: "TABLE", value: new U.LookupList(e.lookups, is) },
  ]);
}
var Q0 = { parse: lb, make: ub };
function cb(e, t) {
  var n = new z.Parser(e, t),
    r = n.parseULong();
  (V.argument(r === 1, "Unsupported META table version."), n.parseULong(), n.parseULong());
  for (var s = n.parseULong(), i = {}, a = 0; a < s; a++) {
    var o = n.parseTag(),
      l = n.parseULong(),
      u = n.parseULong(),
      c = es.UTF8(e, t + l, u);
    i[o] = c;
  }
  return i;
}
function fb(e) {
  var t = Object.keys(e).length,
    n = "",
    r = 16 + t * 12,
    s = new U.Table("meta", [
      { name: "version", type: "ULONG", value: 1 },
      { name: "flags", type: "ULONG", value: 0 },
      { name: "offset", type: "ULONG", value: r },
      { name: "numTags", type: "ULONG", value: t },
    ]);
  for (var i in e) {
    var a = n.length;
    ((n += e[i]),
      s.fields.push({ name: "tag " + i, type: "TAG", value: i }),
      s.fields.push({ name: "offset " + i, type: "ULONG", value: r + a }),
      s.fields.push({ name: "length " + i, type: "ULONG", value: e[i].length }));
  }
  return (s.fields.push({ name: "stringPool", type: "CHARARRAY", value: n }), s);
}
var J0 = { parse: cb, make: fb };
function Dd(e) {
  return (Math.log(e) / Math.log(2)) | 0;
}
function _c(e) {
  for (; e.length % 4 !== 0; ) e.push(0);
  for (var t = 0, n = 0; n < e.length; n += 4)
    t += (e[n] << 24) + (e[n + 1] << 16) + (e[n + 2] << 8) + e[n + 3];
  return ((t %= Math.pow(2, 32)), t);
}
function Ud(e, t, n, r) {
  return new U.Record("Table Record", [
    { name: "tag", type: "TAG", value: e !== void 0 ? e : "" },
    { name: "checkSum", type: "ULONG", value: t !== void 0 ? t : 0 },
    { name: "offset", type: "ULONG", value: n !== void 0 ? n : 0 },
    { name: "length", type: "ULONG", value: r !== void 0 ? r : 0 },
  ]);
}
function eg(e) {
  var t = new U.Table("sfnt", [
    { name: "version", type: "TAG", value: "OTTO" },
    { name: "numTables", type: "USHORT", value: 0 },
    { name: "searchRange", type: "USHORT", value: 0 },
    { name: "entrySelector", type: "USHORT", value: 0 },
    { name: "rangeShift", type: "USHORT", value: 0 },
  ]);
  ((t.tables = e), (t.numTables = e.length));
  var n = Math.pow(2, Dd(t.numTables));
  ((t.searchRange = 16 * n),
    (t.entrySelector = Dd(n)),
    (t.rangeShift = t.numTables * 16 - t.searchRange));
  for (var r = [], s = [], i = t.sizeOf() + Ud().sizeOf() * t.numTables; i % 4 !== 0; )
    ((i += 1), s.push({ name: "padding", type: "BYTE", value: 0 }));
  for (var a = 0; a < e.length; a += 1) {
    var o = e[a];
    V.argument(o.tableName.length === 4, "Table name" + o.tableName + " is invalid.");
    var l = o.sizeOf(),
      u = Ud(o.tableName, _c(o.encode()), i, l);
    for (
      r.push({ name: u.tag + " Table Record", type: "RECORD", value: u }),
        s.push({ name: o.tableName + " table", type: "RECORD", value: o }),
        i += l,
        V.argument(!isNaN(i), "Something went wrong calculating the offset.");
      i % 4 !== 0;
    )
      ((i += 1), s.push({ name: "padding", type: "BYTE", value: 0 }));
  }
  return (
    r.sort(function (c, f) {
      return c.value.tag > f.value.tag ? 1 : -1;
    }),
    (t.fields = t.fields.concat(r)),
    (t.fields = t.fields.concat(s)),
    t
  );
}
function Ad(e, t, n) {
  for (var r = 0; r < t.length; r += 1) {
    var s = e.charToGlyphIndex(t[r]);
    if (s > 0) {
      var i = e.glyphs.get(s);
      return i.getMetrics();
    }
  }
  return n;
}
function db(e) {
  for (var t = 0, n = 0; n < e.length; n += 1) t += e[n];
  return t / e.length;
}
function hb(e) {
  for (
    var t = [],
      n = [],
      r = [],
      s = [],
      i = [],
      a = [],
      o = [],
      l,
      u = 0,
      c = 0,
      f = 0,
      d = 0,
      h = 0,
      m = 0;
    m < e.glyphs.length;
    m += 1
  ) {
    var x = e.glyphs.get(m),
      k = x.unicode | 0;
    if (isNaN(x.advanceWidth))
      throw new Error("Glyph " + x.name + " (" + m + "): advanceWidth is not a number.");
    ((l > k || l === void 0) && k > 0 && (l = k), u < k && (u = k));
    var p = xu.getUnicodeRange(k);
    if (p < 32) c |= 1 << p;
    else if (p < 64) f |= 1 << (p - 32);
    else if (p < 96) d |= 1 << (p - 64);
    else if (p < 123) h |= 1 << (p - 96);
    else throw new Error("Unicode ranges bits > 123 are reserved for internal usage");
    if (x.name !== ".notdef") {
      var g = x.getMetrics();
      (t.push(g.xMin),
        n.push(g.yMin),
        r.push(g.xMax),
        s.push(g.yMax),
        a.push(g.leftSideBearing),
        o.push(g.rightSideBearing),
        i.push(x.advanceWidth));
    }
  }
  var v = {
    xMin: Math.min.apply(null, t),
    yMin: Math.min.apply(null, n),
    xMax: Math.max.apply(null, r),
    yMax: Math.max.apply(null, s),
    advanceWidthMax: Math.max.apply(null, i),
    advanceWidthAvg: db(i),
    minLeftSideBearing: Math.min.apply(null, a),
    maxLeftSideBearing: Math.max.apply(null, a),
    minRightSideBearing: Math.min.apply(null, o),
  };
  ((v.ascender = e.ascender), (v.descender = e.descender));
  var S = z0.make({
      flags: 3,
      unitsPerEm: e.unitsPerEm,
      xMin: v.xMin,
      yMin: v.yMin,
      xMax: v.xMax,
      yMax: v.yMax,
      lowestRecPPEM: 3,
      createdTimestamp: e.createdTimestamp,
    }),
    b = j0.make({
      ascender: v.ascender,
      descender: v.descender,
      advanceWidthMax: v.advanceWidthMax,
      minLeftSideBearing: v.minLeftSideBearing,
      minRightSideBearing: v.minRightSideBearing,
      xMaxExtent: v.maxLeftSideBearing + (v.xMax - v.xMin),
      numberOfHMetrics: e.glyphs.length,
    }),
    L = W0.make(e.glyphs.length),
    T = xu.make(
      Object.assign(
        {
          xAvgCharWidth: Math.round(v.advanceWidthAvg),
          usFirstCharIndex: l,
          usLastCharIndex: u,
          ulUnicodeRange1: c,
          ulUnicodeRange2: f,
          ulUnicodeRange3: d,
          ulUnicodeRange4: h,
          sTypoAscender: v.ascender,
          sTypoDescender: v.descender,
          sTypoLineGap: 0,
          usWinAscent: v.yMax,
          usWinDescent: Math.abs(v.yMin),
          ulCodePageRange1: 1,
          sxHeight: Ad(e, "xyvw", { yMax: Math.round(v.ascender / 2) }).yMax,
          sCapHeight: Ad(e, "HIKLEFJMNTZBDPRAGOQSUVWXY", v).yMax,
          usDefaultChar: e.hasChar(" ") ? 32 : 0,
          usBreakChar: e.hasChar(" ") ? 32 : 0,
        },
        e.tables.os2,
      ),
    ),
    E = G0.make(e.glyphs),
    I = M0.make(e.glyphs),
    P = e.getEnglishName("fontFamily"),
    q = e.getEnglishName("fontSubfamily"),
    Q = P + " " + q,
    te = e.getEnglishName("postScriptName");
  te || (te = P.replace(/\s/g, "") + "-" + q);
  var ee = {};
  for (var ae in e.names) ee[ae] = e.names[ae];
  (ee.uniqueID || (ee.uniqueID = { en: e.getEnglishName("manufacturer") + ":" + Q }),
    ee.postScriptName || (ee.postScriptName = { en: te }),
    ee.preferredFamily || (ee.preferredFamily = e.names.fontFamily),
    ee.preferredSubfamily || (ee.preferredSubfamily = e.names.fontSubfamily));
  var oe = [],
    le = Z0.make(ee, oe),
    O = oe.length > 0 ? H0.make(oe) : void 0,
    B = Y0.make(),
    R = _0.make(e.glyphs, {
      version: e.getEnglishName("version"),
      fullName: Q,
      familyName: P,
      weightName: q,
      postScriptName: te,
      unitsPerEm: e.unitsPerEm,
      fontBBox: [0, v.yMin, v.ascender, v.advanceWidthMax],
    }),
    A = e.metas && Object.keys(e.metas).length > 0 ? J0.make(e.metas) : void 0,
    H = [S, b, L, T, le, I, B, R, E];
  (O && H.push(O), e.tables.gsub && H.push(Q0.make(e.tables.gsub)), A && H.push(A));
  for (
    var He = eg(H), De = He.encode(), _t = _c(De), j = He.fields, Z = !1, fe = 0;
    fe < j.length;
    fe += 1
  )
    if (j[fe].name === "head table") {
      ((j[fe].value.checkSumAdjustment = 2981146554 - _t), (Z = !0));
      break;
    }
  if (!Z) throw new Error("Could not find head table with checkSum to adjust.");
  return He;
}
var pb = { make: eg, fontToTable: hb, computeCheckSum: _c };
function sl(e, t) {
  for (var n = 0, r = e.length - 1; n <= r; ) {
    var s = (n + r) >>> 1,
      i = e[s].tag;
    if (i === t) return s;
    i < t ? (n = s + 1) : (r = s - 1);
  }
  return -n - 1;
}
function Bd(e, t) {
  for (var n = 0, r = e.length - 1; n <= r; ) {
    var s = (n + r) >>> 1,
      i = e[s];
    if (i === t) return s;
    i < t ? (n = s + 1) : (r = s - 1);
  }
  return -n - 1;
}
function $d(e, t) {
  for (var n, r = 0, s = e.length - 1; r <= s; ) {
    var i = (r + s) >>> 1;
    n = e[i];
    var a = n.start;
    if (a === t) return n;
    a < t ? (r = i + 1) : (s = i - 1);
  }
  if (r > 0) return ((n = e[r - 1]), t > n.end ? 0 : n);
}
function mi(e, t) {
  ((this.font = e), (this.tableName = t));
}
mi.prototype = {
  searchTag: sl,
  binSearch: Bd,
  getTable: function (e) {
    var t = this.font.tables[this.tableName];
    return (!t && e && (t = this.font.tables[this.tableName] = this.createDefaultTable()), t);
  },
  getScriptNames: function () {
    var e = this.getTable();
    return e
      ? e.scripts.map(function (t) {
          return t.tag;
        })
      : [];
  },
  getDefaultScriptName: function () {
    var e = this.getTable();
    if (e) {
      for (var t = !1, n = 0; n < e.scripts.length; n++) {
        var r = e.scripts[n].tag;
        if (r === "DFLT") return r;
        r === "latn" && (t = !0);
      }
      if (t) return "latn";
    }
  },
  getScriptTable: function (e, t) {
    var n = this.getTable(t);
    if (n) {
      e = e || "DFLT";
      var r = n.scripts,
        s = sl(n.scripts, e);
      if (s >= 0) return r[s].script;
      if (t) {
        var i = {
          tag: e,
          script: {
            defaultLangSys: { reserved: 0, reqFeatureIndex: 65535, featureIndexes: [] },
            langSysRecords: [],
          },
        };
        return (r.splice(-1 - s, 0, i), i.script);
      }
    }
  },
  getLangSysTable: function (e, t, n) {
    var r = this.getScriptTable(e, n);
    if (r) {
      if (!t || t === "dflt" || t === "DFLT") return r.defaultLangSys;
      var s = sl(r.langSysRecords, t);
      if (s >= 0) return r.langSysRecords[s].langSys;
      if (n) {
        var i = { tag: t, langSys: { reserved: 0, reqFeatureIndex: 65535, featureIndexes: [] } };
        return (r.langSysRecords.splice(-1 - s, 0, i), i.langSys);
      }
    }
  },
  getFeatureTable: function (e, t, n, r) {
    var s = this.getLangSysTable(e, t, r);
    if (s) {
      for (
        var i, a = s.featureIndexes, o = this.font.tables[this.tableName].features, l = 0;
        l < a.length;
        l++
      )
        if (((i = o[a[l]]), i.tag === n)) return i.feature;
      if (r) {
        var u = o.length;
        return (
          V.assert(u === 0 || n >= o[u - 1].tag, "Features must be added in alphabetical order."),
          (i = { tag: n, feature: { params: 0, lookupListIndexes: [] } }),
          o.push(i),
          a.push(u),
          i.feature
        );
      }
    }
  },
  getLookupTables: function (e, t, n, r, s) {
    var i = this.getFeatureTable(e, t, n, s),
      a = [];
    if (i) {
      for (
        var o, l = i.lookupListIndexes, u = this.font.tables[this.tableName].lookups, c = 0;
        c < l.length;
        c++
      )
        ((o = u[l[c]]), o.lookupType === r && a.push(o));
      if (a.length === 0 && s) {
        o = { lookupType: r, lookupFlag: 0, subtables: [], markFilteringSet: void 0 };
        var f = u.length;
        return (u.push(o), l.push(f), [o]);
      }
    }
    return a;
  },
  getGlyphClass: function (e, t) {
    switch (e.format) {
      case 1:
        return e.startGlyph <= t && t < e.startGlyph + e.classes.length
          ? e.classes[t - e.startGlyph]
          : 0;
      case 2:
        var n = $d(e.ranges, t);
        return n ? n.classId : 0;
    }
  },
  getCoverageIndex: function (e, t) {
    switch (e.format) {
      case 1:
        var n = Bd(e.glyphs, t);
        return n >= 0 ? n : -1;
      case 2:
        var r = $d(e.ranges, t);
        return r ? r.index + t - r.start : -1;
    }
  },
  expandCoverage: function (e) {
    if (e.format === 1) return e.glyphs;
    for (var t = [], n = e.ranges, r = 0; r < n.length; r++)
      for (var s = n[r], i = s.start, a = s.end, o = i; o <= a; o++) t.push(o);
    return t;
  },
};
function gi(e) {
  mi.call(this, e, "gpos");
}
gi.prototype = mi.prototype;
gi.prototype.init = function () {
  var e = this.getDefaultScriptName();
  this.defaultKerningTables = this.getKerningTables(e);
};
gi.prototype.getKerningValue = function (e, t, n) {
  for (var r = 0; r < e.length; r++)
    for (var s = e[r].subtables, i = 0; i < s.length; i++) {
      var a = s[i],
        o = this.getCoverageIndex(a.coverage, t);
      if (!(o < 0))
        switch (a.posFormat) {
          case 1:
            for (var l = a.pairSets[o], u = 0; u < l.length; u++) {
              var c = l[u];
              if (c.secondGlyph === n) return (c.value1 && c.value1.xAdvance) || 0;
            }
            break;
          case 2:
            var f = this.getGlyphClass(a.classDef1, t),
              d = this.getGlyphClass(a.classDef2, n),
              h = a.classRecords[f][d];
            return (h.value1 && h.value1.xAdvance) || 0;
        }
    }
  return 0;
};
gi.prototype.getKerningTables = function (e, t) {
  if (this.font.tables.gpos) return this.getLookupTables(e, t, "kern", 2);
};
function ht(e) {
  mi.call(this, e, "gsub");
}
function mb(e, t) {
  var n = e.length;
  if (n !== t.length) return !1;
  for (var r = 0; r < n; r++) if (e[r] !== t[r]) return !1;
  return !0;
}
function zc(e, t, n) {
  for (var r = e.subtables, s = 0; s < r.length; s++) {
    var i = r[s];
    if (i.substFormat === t) return i;
  }
  if (n) return (r.push(n), n);
}
ht.prototype = mi.prototype;
ht.prototype.createDefaultTable = function () {
  return {
    version: 1,
    scripts: [
      {
        tag: "DFLT",
        script: {
          defaultLangSys: { reserved: 0, reqFeatureIndex: 65535, featureIndexes: [] },
          langSysRecords: [],
        },
      },
    ],
    features: [],
    lookups: [],
  };
};
ht.prototype.getSingle = function (e, t, n) {
  for (var r = [], s = this.getLookupTables(t, n, e, 1), i = 0; i < s.length; i++)
    for (var a = s[i].subtables, o = 0; o < a.length; o++) {
      var l = a[o],
        u = this.expandCoverage(l.coverage),
        c = void 0;
      if (l.substFormat === 1) {
        var f = l.deltaGlyphId;
        for (c = 0; c < u.length; c++) {
          var d = u[c];
          r.push({ sub: d, by: d + f });
        }
      } else {
        var h = l.substitute;
        for (c = 0; c < u.length; c++) r.push({ sub: u[c], by: h[c] });
      }
    }
  return r;
};
ht.prototype.getMultiple = function (e, t, n) {
  for (var r = [], s = this.getLookupTables(t, n, e, 2), i = 0; i < s.length; i++)
    for (var a = s[i].subtables, o = 0; o < a.length; o++) {
      var l = a[o],
        u = this.expandCoverage(l.coverage),
        c = void 0;
      for (c = 0; c < u.length; c++) {
        var f = u[c],
          d = l.sequences[c];
        r.push({ sub: f, by: d });
      }
    }
  return r;
};
ht.prototype.getAlternates = function (e, t, n) {
  for (var r = [], s = this.getLookupTables(t, n, e, 3), i = 0; i < s.length; i++)
    for (var a = s[i].subtables, o = 0; o < a.length; o++)
      for (
        var l = a[o], u = this.expandCoverage(l.coverage), c = l.alternateSets, f = 0;
        f < u.length;
        f++
      )
        r.push({ sub: u[f], by: c[f] });
  return r;
};
ht.prototype.getLigatures = function (e, t, n) {
  for (var r = [], s = this.getLookupTables(t, n, e, 4), i = 0; i < s.length; i++)
    for (var a = s[i].subtables, o = 0; o < a.length; o++)
      for (
        var l = a[o], u = this.expandCoverage(l.coverage), c = l.ligatureSets, f = 0;
        f < u.length;
        f++
      )
        for (var d = u[f], h = c[f], m = 0; m < h.length; m++) {
          var x = h[m];
          r.push({ sub: [d].concat(x.components), by: x.ligGlyph });
        }
  return r;
};
ht.prototype.addSingle = function (e, t, n, r) {
  var s = this.getLookupTables(n, r, e, 1, !0)[0],
    i = zc(s, 2, { substFormat: 2, coverage: { format: 1, glyphs: [] }, substitute: [] });
  V.assert(
    i.coverage.format === 1,
    "Single: unable to modify coverage table format " + i.coverage.format,
  );
  var a = t.sub,
    o = this.binSearch(i.coverage.glyphs, a);
  (o < 0 && ((o = -1 - o), i.coverage.glyphs.splice(o, 0, a), i.substitute.splice(o, 0, 0)),
    (i.substitute[o] = t.by));
};
ht.prototype.addMultiple = function (e, t, n, r) {
  V.assert(
    t.by instanceof Array && t.by.length > 1,
    'Multiple: "by" must be an array of two or more ids',
  );
  var s = this.getLookupTables(n, r, e, 2, !0)[0],
    i = zc(s, 1, { substFormat: 1, coverage: { format: 1, glyphs: [] }, sequences: [] });
  V.assert(
    i.coverage.format === 1,
    "Multiple: unable to modify coverage table format " + i.coverage.format,
  );
  var a = t.sub,
    o = this.binSearch(i.coverage.glyphs, a);
  (o < 0 && ((o = -1 - o), i.coverage.glyphs.splice(o, 0, a), i.sequences.splice(o, 0, 0)),
    (i.sequences[o] = t.by));
};
ht.prototype.addAlternate = function (e, t, n, r) {
  var s = this.getLookupTables(n, r, e, 3, !0)[0],
    i = zc(s, 1, { substFormat: 1, coverage: { format: 1, glyphs: [] }, alternateSets: [] });
  V.assert(
    i.coverage.format === 1,
    "Alternate: unable to modify coverage table format " + i.coverage.format,
  );
  var a = t.sub,
    o = this.binSearch(i.coverage.glyphs, a);
  (o < 0 && ((o = -1 - o), i.coverage.glyphs.splice(o, 0, a), i.alternateSets.splice(o, 0, 0)),
    (i.alternateSets[o] = t.by));
};
ht.prototype.addLigature = function (e, t, n, r) {
  var s = this.getLookupTables(n, r, e, 4, !0)[0],
    i = s.subtables[0];
  (i ||
    ((i = { substFormat: 1, coverage: { format: 1, glyphs: [] }, ligatureSets: [] }),
    (s.subtables[0] = i)),
    V.assert(
      i.coverage.format === 1,
      "Ligature: unable to modify coverage table format " + i.coverage.format,
    ));
  var a = t.sub[0],
    o = t.sub.slice(1),
    l = { ligGlyph: t.by, components: o },
    u = this.binSearch(i.coverage.glyphs, a);
  if (u >= 0) {
    for (var c = i.ligatureSets[u], f = 0; f < c.length; f++) if (mb(c[f].components, o)) return;
    c.push(l);
  } else ((u = -1 - u), i.coverage.glyphs.splice(u, 0, a), i.ligatureSets.splice(u, 0, [l]));
};
ht.prototype.getFeature = function (e, t, n) {
  if (/ss\d\d/.test(e)) return this.getSingle(e, t, n);
  switch (e) {
    case "aalt":
    case "salt":
      return this.getSingle(e, t, n).concat(this.getAlternates(e, t, n));
    case "dlig":
    case "liga":
    case "rlig":
      return this.getLigatures(e, t, n);
    case "ccmp":
      return this.getMultiple(e, t, n).concat(this.getLigatures(e, t, n));
    case "stch":
      return this.getMultiple(e, t, n);
  }
};
ht.prototype.add = function (e, t, n, r) {
  if (/ss\d\d/.test(e)) return this.addSingle(e, t, n, r);
  switch (e) {
    case "aalt":
    case "salt":
      return typeof t.by == "number" ? this.addSingle(e, t, n, r) : this.addAlternate(e, t, n, r);
    case "dlig":
    case "liga":
    case "rlig":
      return this.addLigature(e, t, n, r);
    case "ccmp":
      return t.by instanceof Array ? this.addMultiple(e, t, n, r) : this.addLigature(e, t, n, r);
  }
};
function gb() {
  return typeof window < "u";
}
function tg(e) {
  for (var t = new ArrayBuffer(e.length), n = new Uint8Array(t), r = 0; r < e.length; ++r)
    n[r] = e[r];
  return t;
}
function vb(e) {
  for (var t = new Buffer(e.byteLength), n = new Uint8Array(e), r = 0; r < t.length; ++r)
    t[r] = n[r];
  return t;
}
function gs(e, t) {
  if (!e) throw t;
}
function _d(e, t, n, r, s) {
  var i;
  return (
    (t & r) > 0
      ? ((i = e.parseByte()), t & s || (i = -i), (i = n + i))
      : (t & s) > 0
        ? (i = n)
        : (i = n + e.parseShort()),
    i
  );
}
function ng(e, t, n) {
  var r = new z.Parser(t, n);
  ((e.numberOfContours = r.parseShort()),
    (e._xMin = r.parseShort()),
    (e._yMin = r.parseShort()),
    (e._xMax = r.parseShort()),
    (e._yMax = r.parseShort()));
  var s, i;
  if (e.numberOfContours > 0) {
    for (var a = (e.endPointIndices = []), o = 0; o < e.numberOfContours; o += 1)
      a.push(r.parseUShort());
    ((e.instructionLength = r.parseUShort()), (e.instructions = []));
    for (var l = 0; l < e.instructionLength; l += 1) e.instructions.push(r.parseByte());
    var u = a[a.length - 1] + 1;
    s = [];
    for (var c = 0; c < u; c += 1)
      if (((i = r.parseByte()), s.push(i), (i & 8) > 0))
        for (var f = r.parseByte(), d = 0; d < f; d += 1) (s.push(i), (c += 1));
    if ((V.argument(s.length === u, "Bad flags."), a.length > 0)) {
      var h = [],
        m;
      if (u > 0) {
        for (var x = 0; x < u; x += 1)
          ((i = s[x]),
            (m = {}),
            (m.onCurve = !!(i & 1)),
            (m.lastPointOfContour = a.indexOf(x) >= 0),
            h.push(m));
        for (var k = 0, p = 0; p < u; p += 1)
          ((i = s[p]), (m = h[p]), (m.x = _d(r, i, k, 2, 16)), (k = m.x));
        for (var g = 0, v = 0; v < u; v += 1)
          ((i = s[v]), (m = h[v]), (m.y = _d(r, i, g, 4, 32)), (g = m.y));
      }
      e.points = h;
    } else e.points = [];
  } else if (e.numberOfContours === 0) e.points = [];
  else {
    ((e.isComposite = !0), (e.points = []), (e.components = []));
    for (var S = !0; S; ) {
      s = r.parseUShort();
      var b = {
        glyphIndex: r.parseUShort(),
        xScale: 1,
        scale01: 0,
        scale10: 0,
        yScale: 1,
        dx: 0,
        dy: 0,
      };
      ((s & 1) > 0
        ? (s & 2) > 0
          ? ((b.dx = r.parseShort()), (b.dy = r.parseShort()))
          : (b.matchedPoints = [r.parseUShort(), r.parseUShort()])
        : (s & 2) > 0
          ? ((b.dx = r.parseChar()), (b.dy = r.parseChar()))
          : (b.matchedPoints = [r.parseByte(), r.parseByte()]),
        (s & 8) > 0
          ? (b.xScale = b.yScale = r.parseF2Dot14())
          : (s & 64) > 0
            ? ((b.xScale = r.parseF2Dot14()), (b.yScale = r.parseF2Dot14()))
            : (s & 128) > 0 &&
              ((b.xScale = r.parseF2Dot14()),
              (b.scale01 = r.parseF2Dot14()),
              (b.scale10 = r.parseF2Dot14()),
              (b.yScale = r.parseF2Dot14())),
        e.components.push(b),
        (S = !!(s & 32)));
    }
    if (s & 256) {
      ((e.instructionLength = r.parseUShort()), (e.instructions = []));
      for (var L = 0; L < e.instructionLength; L += 1) e.instructions.push(r.parseByte());
    }
  }
}
function il(e, t) {
  for (var n = [], r = 0; r < e.length; r += 1) {
    var s = e[r],
      i = {
        x: t.xScale * s.x + t.scale01 * s.y + t.dx,
        y: t.scale10 * s.x + t.yScale * s.y + t.dy,
        onCurve: s.onCurve,
        lastPointOfContour: s.lastPointOfContour,
      };
    n.push(i);
  }
  return n;
}
function yb(e) {
  for (var t = [], n = [], r = 0; r < e.length; r += 1) {
    var s = e[r];
    (n.push(s), s.lastPointOfContour && (t.push(n), (n = [])));
  }
  return (V.argument(n.length === 0, "There are still points left in the current contour."), t);
}
function rg(e) {
  var t = new Fe();
  if (!e) return t;
  for (var n = yb(e), r = 0; r < n.length; ++r) {
    var s = n[r],
      i = null,
      a = s[s.length - 1],
      o = s[0];
    if (a.onCurve) t.moveTo(a.x, a.y);
    else if (o.onCurve) t.moveTo(o.x, o.y);
    else {
      var l = { x: (a.x + o.x) * 0.5, y: (a.y + o.y) * 0.5 };
      t.moveTo(l.x, l.y);
    }
    for (var u = 0; u < s.length; ++u)
      if (((i = a), (a = o), (o = s[(u + 1) % s.length]), a.onCurve)) t.lineTo(a.x, a.y);
      else {
        var c = o;
        (i.onCurve || ((a.x + i.x) * 0.5, (a.y + i.y) * 0.5),
          o.onCurve || (c = { x: (a.x + o.x) * 0.5, y: (a.y + o.y) * 0.5 }),
          t.quadraticCurveTo(a.x, a.y, c.x, c.y));
      }
    t.closePath();
  }
  return t;
}
function sg(e, t) {
  if (t.isComposite)
    for (var n = 0; n < t.components.length; n += 1) {
      var r = t.components[n],
        s = e.get(r.glyphIndex);
      if ((s.getPath(), s.points)) {
        var i = void 0;
        if (r.matchedPoints === void 0) i = il(s.points, r);
        else {
          if (r.matchedPoints[0] > t.points.length - 1 || r.matchedPoints[1] > s.points.length - 1)
            throw Error("Matched points out of range in " + t.name);
          var a = t.points[r.matchedPoints[0]],
            o = s.points[r.matchedPoints[1]],
            l = {
              xScale: r.xScale,
              scale01: r.scale01,
              scale10: r.scale10,
              yScale: r.yScale,
              dx: 0,
              dy: 0,
            };
          ((o = il([o], l)[0]), (l.dx = a.x - o.x), (l.dy = a.y - o.y), (i = il(s.points, l)));
        }
        t.points = t.points.concat(i);
      }
    }
  return rg(t.points);
}
function xb(e, t, n, r) {
  for (var s = new Xt.GlyphSet(r), i = 0; i < n.length - 1; i += 1) {
    var a = n[i],
      o = n[i + 1];
    a !== o
      ? s.push(i, Xt.ttfGlyphLoader(r, i, ng, e, t + a, sg))
      : s.push(i, Xt.glyphLoader(r, i));
  }
  return s;
}
function kb(e, t, n, r) {
  var s = new Xt.GlyphSet(r);
  return (
    (r._push = function (i) {
      var a = n[i],
        o = n[i + 1];
      a !== o
        ? s.push(i, Xt.ttfGlyphLoader(r, i, ng, e, t + a, sg))
        : s.push(i, Xt.glyphLoader(r, i));
    }),
    s
  );
}
function Sb(e, t, n, r, s) {
  return s.lowMemory ? kb(e, t, n, r) : xb(e, t, n, r);
}
var ig = { getPath: rg, parse: Sb },
  ag,
  mr,
  og,
  ku;
function lg(e) {
  ((this.font = e),
    (this.getCommands = function (t) {
      return ig.getPath(t).commands;
    }),
    (this._fpgmState = this._prepState = void 0),
    (this._errorState = 0));
}
function wb(e) {
  return e;
}
function ug(e) {
  return Math.sign(e) * Math.round(Math.abs(e));
}
function bb(e) {
  return (Math.sign(e) * Math.round(Math.abs(e * 2))) / 2;
}
function Eb(e) {
  return Math.sign(e) * (Math.round(Math.abs(e) + 0.5) - 0.5);
}
function Tb(e) {
  return Math.sign(e) * Math.ceil(Math.abs(e));
}
function Cb(e) {
  return Math.sign(e) * Math.floor(Math.abs(e));
}
var cg = function (e) {
    var t = this.srPeriod,
      n = this.srPhase,
      r = this.srThreshold,
      s = 1;
    return (
      e < 0 && ((e = -e), (s = -1)),
      (e += r - n),
      (e = Math.trunc(e / t) * t),
      (e += n),
      e < 0 ? n * s : e * s
    );
  },
  Vt = {
    x: 1,
    y: 0,
    axis: "x",
    distance: function (e, t, n, r) {
      return (n ? e.xo : e.x) - (r ? t.xo : t.x);
    },
    interpolate: function (e, t, n, r) {
      var s, i, a, o, l, u, c;
      if (!r || r === this) {
        if (
          ((s = e.xo - t.xo),
          (i = e.xo - n.xo),
          (l = t.x - t.xo),
          (u = n.x - n.xo),
          (a = Math.abs(s)),
          (o = Math.abs(i)),
          (c = a + o),
          c === 0)
        ) {
          e.x = e.xo + (l + u) / 2;
          return;
        }
        e.x = e.xo + (l * o + u * a) / c;
        return;
      }
      if (
        ((s = r.distance(e, t, !0, !0)),
        (i = r.distance(e, n, !0, !0)),
        (l = r.distance(t, t, !1, !0)),
        (u = r.distance(n, n, !1, !0)),
        (a = Math.abs(s)),
        (o = Math.abs(i)),
        (c = a + o),
        c === 0)
      ) {
        Vt.setRelative(e, e, (l + u) / 2, r, !0);
        return;
      }
      Vt.setRelative(e, e, (l * o + u * a) / c, r, !0);
    },
    normalSlope: Number.NEGATIVE_INFINITY,
    setRelative: function (e, t, n, r, s) {
      if (!r || r === this) {
        e.x = (s ? t.xo : t.x) + n;
        return;
      }
      var i = s ? t.xo : t.x,
        a = s ? t.yo : t.y,
        o = i + n * r.x,
        l = a + n * r.y;
      e.x = o + (e.y - l) / r.normalSlope;
    },
    slope: 0,
    touch: function (e) {
      e.xTouched = !0;
    },
    touched: function (e) {
      return e.xTouched;
    },
    untouch: function (e) {
      e.xTouched = !1;
    },
  },
  rn = {
    x: 0,
    y: 1,
    axis: "y",
    distance: function (e, t, n, r) {
      return (n ? e.yo : e.y) - (r ? t.yo : t.y);
    },
    interpolate: function (e, t, n, r) {
      var s, i, a, o, l, u, c;
      if (!r || r === this) {
        if (
          ((s = e.yo - t.yo),
          (i = e.yo - n.yo),
          (l = t.y - t.yo),
          (u = n.y - n.yo),
          (a = Math.abs(s)),
          (o = Math.abs(i)),
          (c = a + o),
          c === 0)
        ) {
          e.y = e.yo + (l + u) / 2;
          return;
        }
        e.y = e.yo + (l * o + u * a) / c;
        return;
      }
      if (
        ((s = r.distance(e, t, !0, !0)),
        (i = r.distance(e, n, !0, !0)),
        (l = r.distance(t, t, !1, !0)),
        (u = r.distance(n, n, !1, !0)),
        (a = Math.abs(s)),
        (o = Math.abs(i)),
        (c = a + o),
        c === 0)
      ) {
        rn.setRelative(e, e, (l + u) / 2, r, !0);
        return;
      }
      rn.setRelative(e, e, (l * o + u * a) / c, r, !0);
    },
    normalSlope: 0,
    setRelative: function (e, t, n, r, s) {
      if (!r || r === this) {
        e.y = (s ? t.yo : t.y) + n;
        return;
      }
      var i = s ? t.xo : t.x,
        a = s ? t.yo : t.y,
        o = i + n * r.x,
        l = a + n * r.y;
      e.y = l + r.normalSlope * (e.x - o);
    },
    slope: Number.POSITIVE_INFINITY,
    touch: function (e) {
      e.yTouched = !0;
    },
    touched: function (e) {
      return e.yTouched;
    },
    untouch: function (e) {
      e.yTouched = !1;
    },
  };
Object.freeze(Vt);
Object.freeze(rn);
function vi(e, t) {
  ((this.x = e),
    (this.y = t),
    (this.axis = void 0),
    (this.slope = t / e),
    (this.normalSlope = -e / t),
    Object.freeze(this));
}
vi.prototype.distance = function (e, t, n, r) {
  return this.x * Vt.distance(e, t, n, r) + this.y * rn.distance(e, t, n, r);
};
vi.prototype.interpolate = function (e, t, n, r) {
  var s, i, a, o, l, u, c;
  if (
    ((a = r.distance(e, t, !0, !0)),
    (o = r.distance(e, n, !0, !0)),
    (s = r.distance(t, t, !1, !0)),
    (i = r.distance(n, n, !1, !0)),
    (l = Math.abs(a)),
    (u = Math.abs(o)),
    (c = l + u),
    c === 0)
  ) {
    this.setRelative(e, e, (s + i) / 2, r, !0);
    return;
  }
  this.setRelative(e, e, (s * u + i * l) / c, r, !0);
};
vi.prototype.setRelative = function (e, t, n, r, s) {
  r = r || this;
  var i = s ? t.xo : t.x,
    a = s ? t.yo : t.y,
    o = i + n * r.x,
    l = a + n * r.y,
    u = r.normalSlope,
    c = this.slope,
    f = e.x,
    d = e.y;
  ((e.x = (c * f - u * o + l - d) / (c - u)), (e.y = c * (e.x - f) + d));
};
vi.prototype.touch = function (e) {
  ((e.xTouched = !0), (e.yTouched = !0));
};
function yi(e, t) {
  var n = Math.sqrt(e * e + t * t);
  return ((e /= n), (t /= n), e === 1 && t === 0 ? Vt : e === 0 && t === 1 ? rn : new vi(e, t));
}
function an(e, t, n, r) {
  ((this.x = this.xo = Math.round(e * 64) / 64),
    (this.y = this.yo = Math.round(t * 64) / 64),
    (this.lastPointOfContour = n),
    (this.onCurve = r),
    (this.prevPointOnContour = void 0),
    (this.nextPointOnContour = void 0),
    (this.xTouched = !1),
    (this.yTouched = !1),
    Object.preventExtensions(this));
}
an.prototype.nextTouched = function (e) {
  for (var t = this.nextPointOnContour; !e.touched(t) && t !== this; ) t = t.nextPointOnContour;
  return t;
};
an.prototype.prevTouched = function (e) {
  for (var t = this.prevPointOnContour; !e.touched(t) && t !== this; ) t = t.prevPointOnContour;
  return t;
};
var si = Object.freeze(new an(0, 0)),
  Lb = { cvCutIn: 17 / 16, deltaBase: 9, deltaShift: 0.125, loop: 1, minDis: 1, autoFlip: !0 };
function Nn(e, t) {
  switch (((this.env = e), (this.stack = []), (this.prog = t), e)) {
    case "glyf":
      ((this.zp0 = this.zp1 = this.zp2 = 1), (this.rp0 = this.rp1 = this.rp2 = 0));
    case "prep":
      ((this.fv = this.pv = this.dpv = Vt), (this.round = ug));
  }
}
lg.prototype.exec = function (e, t) {
  if (typeof t != "number") throw new Error("Point size is not a number!");
  if (!(this._errorState > 2)) {
    var n = this.font,
      r = this._prepState;
    if (!r || r.ppem !== t) {
      var s = this._fpgmState;
      if (!s) {
        ((Nn.prototype = Lb),
          (s = this._fpgmState = new Nn("fpgm", n.tables.fpgm)),
          (s.funcs = []),
          (s.font = n),
          exports.DEBUG && (console.log("---EXEC FPGM---"), (s.step = -1)));
        try {
          mr(s);
        } catch (u) {
          (console.log("Hinting error in FPGM:" + u), (this._errorState = 3));
          return;
        }
      }
      ((Nn.prototype = s), (r = this._prepState = new Nn("prep", n.tables.prep)), (r.ppem = t));
      var i = n.tables.cvt;
      if (i)
        for (var a = (r.cvt = new Array(i.length)), o = t / n.unitsPerEm, l = 0; l < i.length; l++)
          a[l] = i[l] * o;
      else r.cvt = [];
      exports.DEBUG && (console.log("---EXEC PREP---"), (r.step = -1));
      try {
        mr(r);
      } catch (u) {
        (this._errorState < 2 && console.log("Hinting error in PREP:" + u), (this._errorState = 2));
      }
    }
    if (!(this._errorState > 1))
      try {
        return og(e, r);
      } catch (u) {
        (this._errorState < 1 &&
          (console.log("Hinting error:" + u),
          console.log("Note: further hinting errors are silenced")),
          (this._errorState = 1));
        return;
      }
  }
};
og = function (e, t) {
  var n = t.ppem / t.font.unitsPerEm,
    r = n,
    s = e.components,
    i,
    a,
    o;
  if (((Nn.prototype = t), !s))
    ((o = new Nn("glyf", e.instructions)),
      exports.DEBUG && (console.log("---EXEC GLYPH---"), (o.step = -1)),
      ku(e, o, n, r),
      (a = o.gZone));
  else {
    var l = t.font;
    ((a = []), (i = []));
    for (var u = 0; u < s.length; u++) {
      var c = s[u],
        f = l.glyphs.get(c.glyphIndex);
      ((o = new Nn("glyf", f.instructions)),
        exports.DEBUG && (console.log("---EXEC COMP " + u + "---"), (o.step = -1)),
        ku(f, o, n, r));
      for (
        var d = Math.round(c.dx * n), h = Math.round(c.dy * r), m = o.gZone, x = o.contours, k = 0;
        k < m.length;
        k++
      ) {
        var p = m[k];
        ((p.xTouched = p.yTouched = !1), (p.xo = p.x = p.x + d), (p.yo = p.y = p.y + h));
      }
      var g = a.length;
      a.push.apply(a, m);
      for (var v = 0; v < x.length; v++) i.push(x[v] + g);
    }
    e.instructions &&
      !o.inhibitGridFit &&
      ((o = new Nn("glyf", e.instructions)),
      (o.gZone = o.z0 = o.z1 = o.z2 = a),
      (o.contours = i),
      a.push(new an(0, 0), new an(Math.round(e.advanceWidth * n), 0)),
      exports.DEBUG && (console.log("---EXEC COMPOSITE---"), (o.step = -1)),
      mr(o),
      (a.length -= 2));
  }
  return a;
};
ku = function (e, t, n, r) {
  for (
    var s = e.points || [],
      i = s.length,
      a = (t.gZone = t.z0 = t.z1 = t.z2 = []),
      o = (t.contours = []),
      l,
      u = 0;
    u < i;
    u++
  )
    ((l = s[u]), (a[u] = new an(l.x * n, l.y * r, l.lastPointOfContour, l.onCurve)));
  for (var c, f, d = 0; d < i; d++)
    ((l = a[d]),
      c || ((c = l), o.push(d)),
      l.lastPointOfContour
        ? ((l.nextPointOnContour = c), (c.prevPointOnContour = l), (c = void 0))
        : ((f = a[d + 1]), (l.nextPointOnContour = f), (f.prevPointOnContour = l)));
  if (!t.inhibitGridFit) {
    if (exports.DEBUG) {
      console.log("PROCESSING GLYPH", t.stack);
      for (var h = 0; h < i; h++) console.log(h, a[h].x, a[h].y);
    }
    if (
      (a.push(new an(0, 0), new an(Math.round(e.advanceWidth * n), 0)),
      mr(t),
      (a.length -= 2),
      exports.DEBUG)
    ) {
      console.log("FINISHED GLYPH", t.stack);
      for (var m = 0; m < i; m++) console.log(m, a[m].x, a[m].y);
    }
  }
};
mr = function (e) {
  var t = e.prog;
  if (t) {
    var n = t.length,
      r;
    for (e.ip = 0; e.ip < n; e.ip++) {
      if ((exports.DEBUG && e.step++, (r = ag[t[e.ip]]), !r))
        throw new Error("unknown instruction: 0x" + Number(t[e.ip]).toString(16));
      r(e);
    }
  }
};
function yo(e) {
  for (var t = (e.tZone = new Array(e.gZone.length)), n = 0; n < t.length; n++) t[n] = new an(0, 0);
}
function fg(e, t) {
  var n = e.prog,
    r = e.ip,
    s = 1,
    i;
  do
    if (((i = n[++r]), i === 88)) s++;
    else if (i === 89) s--;
    else if (i === 64) r += n[r + 1] + 1;
    else if (i === 65) r += 2 * n[r + 1] + 1;
    else if (i >= 176 && i <= 183) r += i - 176 + 1;
    else if (i >= 184 && i <= 191) r += (i - 184 + 1) * 2;
    else if (t && s === 1 && i === 27) break;
  while (s > 0);
  e.ip = r;
}
function zd(e, t) {
  (exports.DEBUG && console.log(t.step, "SVTCA[" + e.axis + "]"), (t.fv = t.pv = t.dpv = e));
}
function jd(e, t) {
  (exports.DEBUG && console.log(t.step, "SPVTCA[" + e.axis + "]"), (t.pv = t.dpv = e));
}
function Gd(e, t) {
  (exports.DEBUG && console.log(t.step, "SFVTCA[" + e.axis + "]"), (t.fv = e));
}
function Hd(e, t) {
  var n = t.stack,
    r = n.pop(),
    s = n.pop(),
    i = t.z2[r],
    a = t.z1[s];
  exports.DEBUG && console.log("SPVTL[" + e + "]", r, s);
  var o, l;
  (e ? ((o = i.y - a.y), (l = a.x - i.x)) : ((o = a.x - i.x), (l = a.y - i.y)),
    (t.pv = t.dpv = yi(o, l)));
}
function Wd(e, t) {
  var n = t.stack,
    r = n.pop(),
    s = n.pop(),
    i = t.z2[r],
    a = t.z1[s];
  exports.DEBUG && console.log("SFVTL[" + e + "]", r, s);
  var o, l;
  (e ? ((o = i.y - a.y), (l = a.x - i.x)) : ((o = a.x - i.x), (l = a.y - i.y)), (t.fv = yi(o, l)));
}
function Fb(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "SPVFS[]", n, r), (e.pv = e.dpv = yi(r, n)));
}
function Mb(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "SPVFS[]", n, r), (e.fv = yi(r, n)));
}
function Nb(e) {
  var t = e.stack,
    n = e.pv;
  (exports.DEBUG && console.log(e.step, "GPV[]"), t.push(n.x * 16384), t.push(n.y * 16384));
}
function Rb(e) {
  var t = e.stack,
    n = e.fv;
  (exports.DEBUG && console.log(e.step, "GFV[]"), t.push(n.x * 16384), t.push(n.y * 16384));
}
function Ob(e) {
  ((e.fv = e.pv), exports.DEBUG && console.log(e.step, "SFVTPV[]"));
}
function Ib(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop(),
    s = t.pop(),
    i = t.pop(),
    a = t.pop(),
    o = e.z0,
    l = e.z1,
    u = o[n],
    c = o[r],
    f = l[s],
    d = l[i],
    h = e.z2[a];
  exports.DEBUG && console.log("ISECT[], ", n, r, s, i, a);
  var m = u.x,
    x = u.y,
    k = c.x,
    p = c.y,
    g = f.x,
    v = f.y,
    S = d.x,
    b = d.y,
    L = (m - k) * (v - b) - (x - p) * (g - S),
    T = m * p - x * k,
    E = g * b - v * S;
  ((h.x = (T * (g - S) - E * (m - k)) / L), (h.y = (T * (v - b) - E * (x - p)) / L));
}
function Pb(e) {
  ((e.rp0 = e.stack.pop()), exports.DEBUG && console.log(e.step, "SRP0[]", e.rp0));
}
function Db(e) {
  ((e.rp1 = e.stack.pop()), exports.DEBUG && console.log(e.step, "SRP1[]", e.rp1));
}
function Ub(e) {
  ((e.rp2 = e.stack.pop()), exports.DEBUG && console.log(e.step, "SRP2[]", e.rp2));
}
function Ab(e) {
  var t = e.stack.pop();
  switch ((exports.DEBUG && console.log(e.step, "SZP0[]", t), (e.zp0 = t), t)) {
    case 0:
      (e.tZone || yo(e), (e.z0 = e.tZone));
      break;
    case 1:
      e.z0 = e.gZone;
      break;
    default:
      throw new Error("Invalid zone pointer");
  }
}
function Bb(e) {
  var t = e.stack.pop();
  switch ((exports.DEBUG && console.log(e.step, "SZP1[]", t), (e.zp1 = t), t)) {
    case 0:
      (e.tZone || yo(e), (e.z1 = e.tZone));
      break;
    case 1:
      e.z1 = e.gZone;
      break;
    default:
      throw new Error("Invalid zone pointer");
  }
}
function $b(e) {
  var t = e.stack.pop();
  switch ((exports.DEBUG && console.log(e.step, "SZP2[]", t), (e.zp2 = t), t)) {
    case 0:
      (e.tZone || yo(e), (e.z2 = e.tZone));
      break;
    case 1:
      e.z2 = e.gZone;
      break;
    default:
      throw new Error("Invalid zone pointer");
  }
}
function _b(e) {
  var t = e.stack.pop();
  switch ((exports.DEBUG && console.log(e.step, "SZPS[]", t), (e.zp0 = e.zp1 = e.zp2 = t), t)) {
    case 0:
      (e.tZone || yo(e), (e.z0 = e.z1 = e.z2 = e.tZone));
      break;
    case 1:
      e.z0 = e.z1 = e.z2 = e.gZone;
      break;
    default:
      throw new Error("Invalid zone pointer");
  }
}
function zb(e) {
  ((e.loop = e.stack.pop()), exports.DEBUG && console.log(e.step, "SLOOP[]", e.loop));
}
function jb(e) {
  (exports.DEBUG && console.log(e.step, "RTG[]"), (e.round = ug));
}
function Gb(e) {
  (exports.DEBUG && console.log(e.step, "RTHG[]"), (e.round = Eb));
}
function Hb(e) {
  var t = e.stack.pop();
  (exports.DEBUG && console.log(e.step, "SMD[]", t), (e.minDis = t / 64));
}
function Wb(e) {
  (exports.DEBUG && console.log(e.step, "ELSE[]"), fg(e, !1));
}
function Vb(e) {
  var t = e.stack.pop();
  (exports.DEBUG && console.log(e.step, "JMPR[]", t), (e.ip += t - 1));
}
function Kb(e) {
  var t = e.stack.pop();
  (exports.DEBUG && console.log(e.step, "SCVTCI[]", t), (e.cvCutIn = t / 64));
}
function qb(e) {
  var t = e.stack;
  (exports.DEBUG && console.log(e.step, "DUP[]"), t.push(t[t.length - 1]));
}
function al(e) {
  (exports.DEBUG && console.log(e.step, "POP[]"), e.stack.pop());
}
function Xb(e) {
  (exports.DEBUG && console.log(e.step, "CLEAR[]"), (e.stack.length = 0));
}
function Zb(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "SWAP[]"), t.push(n), t.push(r));
}
function Yb(e) {
  var t = e.stack;
  (exports.DEBUG && console.log(e.step, "DEPTH[]"), t.push(t.length));
}
function Qb(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  exports.DEBUG && console.log(e.step, "LOOPCALL[]", n, r);
  var s = e.ip,
    i = e.prog;
  e.prog = e.funcs[n];
  for (var a = 0; a < r; a++)
    (mr(e),
      exports.DEBUG && console.log(++e.step, a + 1 < r ? "next loopcall" : "done loopcall", a));
  ((e.ip = s), (e.prog = i));
}
function Jb(e) {
  var t = e.stack.pop();
  exports.DEBUG && console.log(e.step, "CALL[]", t);
  var n = e.ip,
    r = e.prog;
  ((e.prog = e.funcs[t]),
    mr(e),
    (e.ip = n),
    (e.prog = r),
    exports.DEBUG && console.log(++e.step, "returning from", t));
}
function e2(e) {
  var t = e.stack,
    n = t.pop();
  (exports.DEBUG && console.log(e.step, "CINDEX[]", n), t.push(t[t.length - n]));
}
function t2(e) {
  var t = e.stack,
    n = t.pop();
  (exports.DEBUG && console.log(e.step, "MINDEX[]", n), t.push(t.splice(t.length - n, 1)[0]));
}
function n2(e) {
  if (e.env !== "fpgm") throw new Error("FDEF not allowed here");
  var t = e.stack,
    n = e.prog,
    r = e.ip,
    s = t.pop(),
    i = r;
  for (exports.DEBUG && console.log(e.step, "FDEF[]", s); n[++r] !== 45; );
  ((e.ip = r), (e.funcs[s] = n.slice(i + 1, r)));
}
function Vd(e, t) {
  var n = t.stack.pop(),
    r = t.z0[n],
    s = t.fv,
    i = t.pv;
  exports.DEBUG && console.log(t.step, "MDAP[" + e + "]", n);
  var a = i.distance(r, si);
  (e && (a = t.round(a)), s.setRelative(r, si, a, i), s.touch(r), (t.rp0 = t.rp1 = n));
}
function Kd(e, t) {
  var n = t.z2,
    r = n.length - 2,
    s,
    i,
    a;
  exports.DEBUG && console.log(t.step, "IUP[" + e.axis + "]");
  for (var o = 0; o < r; o++)
    ((s = n[o]),
      !e.touched(s) &&
        ((i = s.prevTouched(e)),
        i !== s &&
          ((a = s.nextTouched(e)),
          i === a && e.setRelative(s, s, e.distance(i, i, !1, !0), e, !0),
          e.interpolate(s, i, a, e))));
}
function qd(e, t) {
  for (
    var n = t.stack,
      r = e ? t.rp1 : t.rp2,
      s = (e ? t.z0 : t.z1)[r],
      i = t.fv,
      a = t.pv,
      o = t.loop,
      l = t.z2;
    o--;
  ) {
    var u = n.pop(),
      c = l[u],
      f = a.distance(s, s, !1, !0);
    (i.setRelative(c, c, f, a),
      i.touch(c),
      exports.DEBUG &&
        console.log(
          t.step,
          (t.loop > 1 ? "loop " + (t.loop - o) + ": " : "") + "SHP[" + (e ? "rp1" : "rp2") + "]",
          u,
        ));
  }
  t.loop = 1;
}
function Xd(e, t) {
  var n = t.stack,
    r = e ? t.rp1 : t.rp2,
    s = (e ? t.z0 : t.z1)[r],
    i = t.fv,
    a = t.pv,
    o = n.pop(),
    l = t.z2[t.contours[o]],
    u = l;
  exports.DEBUG && console.log(t.step, "SHC[" + e + "]", o);
  var c = a.distance(s, s, !1, !0);
  do (u !== s && i.setRelative(u, u, c, a), (u = u.nextPointOnContour));
  while (u !== l);
}
function Zd(e, t) {
  var n = t.stack,
    r = e ? t.rp1 : t.rp2,
    s = (e ? t.z0 : t.z1)[r],
    i = t.fv,
    a = t.pv,
    o = n.pop();
  exports.DEBUG && console.log(t.step, "SHZ[" + e + "]", o);
  var l;
  switch (o) {
    case 0:
      l = t.tZone;
      break;
    case 1:
      l = t.gZone;
      break;
    default:
      throw new Error("Invalid zone");
  }
  for (var u, c = a.distance(s, s, !1, !0), f = l.length - 2, d = 0; d < f; d++)
    ((u = l[d]), i.setRelative(u, u, c, a));
}
function r2(e) {
  for (var t = e.stack, n = e.loop, r = e.fv, s = t.pop() / 64, i = e.z2; n--; ) {
    var a = t.pop(),
      o = i[a];
    (exports.DEBUG &&
      console.log(e.step, (e.loop > 1 ? "loop " + (e.loop - n) + ": " : "") + "SHPIX[]", a, s),
      r.setRelative(o, o, s),
      r.touch(o));
  }
  e.loop = 1;
}
function s2(e) {
  for (
    var t = e.stack,
      n = e.rp1,
      r = e.rp2,
      s = e.loop,
      i = e.z0[n],
      a = e.z1[r],
      o = e.fv,
      l = e.dpv,
      u = e.z2;
    s--;
  ) {
    var c = t.pop(),
      f = u[c];
    (exports.DEBUG &&
      console.log(
        e.step,
        (e.loop > 1 ? "loop " + (e.loop - s) + ": " : "") + "IP[]",
        c,
        n,
        "<->",
        r,
      ),
      o.interpolate(f, i, a, l),
      o.touch(f));
  }
  e.loop = 1;
}
function Yd(e, t) {
  var n = t.stack,
    r = n.pop() / 64,
    s = n.pop(),
    i = t.z1[s],
    a = t.z0[t.rp0],
    o = t.fv,
    l = t.pv;
  (o.setRelative(i, a, r, l),
    o.touch(i),
    exports.DEBUG && console.log(t.step, "MSIRP[" + e + "]", r, s),
    (t.rp1 = t.rp0),
    (t.rp2 = s),
    e && (t.rp0 = s));
}
function i2(e) {
  for (var t = e.stack, n = e.rp0, r = e.z0[n], s = e.loop, i = e.fv, a = e.pv, o = e.z1; s--; ) {
    var l = t.pop(),
      u = o[l];
    (exports.DEBUG &&
      console.log(e.step, (e.loop > 1 ? "loop " + (e.loop - s) + ": " : "") + "ALIGNRP[]", l),
      i.setRelative(u, r, 0, a),
      i.touch(u));
  }
  e.loop = 1;
}
function a2(e) {
  (exports.DEBUG && console.log(e.step, "RTDG[]"), (e.round = bb));
}
function Qd(e, t) {
  var n = t.stack,
    r = n.pop(),
    s = n.pop(),
    i = t.z0[s],
    a = t.fv,
    o = t.pv,
    l = t.cvt[r];
  exports.DEBUG && console.log(t.step, "MIAP[" + e + "]", r, "(", l, ")", s);
  var u = o.distance(i, si);
  (e && (Math.abs(u - l) < t.cvCutIn && (u = l), (u = t.round(u))),
    a.setRelative(i, si, u, o),
    t.zp0 === 0 && ((i.xo = i.x), (i.yo = i.y)),
    a.touch(i),
    (t.rp0 = t.rp1 = s));
}
function o2(e) {
  var t = e.prog,
    n = e.ip,
    r = e.stack,
    s = t[++n];
  exports.DEBUG && console.log(e.step, "NPUSHB[]", s);
  for (var i = 0; i < s; i++) r.push(t[++n]);
  e.ip = n;
}
function l2(e) {
  var t = e.ip,
    n = e.prog,
    r = e.stack,
    s = n[++t];
  exports.DEBUG && console.log(e.step, "NPUSHW[]", s);
  for (var i = 0; i < s; i++) {
    var a = (n[++t] << 8) | n[++t];
    (a & 32768 && (a = -((a ^ 65535) + 1)), r.push(a));
  }
  e.ip = t;
}
function u2(e) {
  var t = e.stack,
    n = e.store;
  n || (n = e.store = []);
  var r = t.pop(),
    s = t.pop();
  (exports.DEBUG && console.log(e.step, "WS", r, s), (n[s] = r));
}
function c2(e) {
  var t = e.stack,
    n = e.store,
    r = t.pop();
  exports.DEBUG && console.log(e.step, "RS", r);
  var s = (n && n[r]) || 0;
  t.push(s);
}
function f2(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "WCVTP", n, r), (e.cvt[r] = n / 64));
}
function d2(e) {
  var t = e.stack,
    n = t.pop();
  (exports.DEBUG && console.log(e.step, "RCVT", n), t.push(e.cvt[n] * 64));
}
function Jd(e, t) {
  var n = t.stack,
    r = n.pop(),
    s = t.z2[r];
  (exports.DEBUG && console.log(t.step, "GC[" + e + "]", r),
    n.push(t.dpv.distance(s, si, e, !1) * 64));
}
function eh(e, t) {
  var n = t.stack,
    r = n.pop(),
    s = n.pop(),
    i = t.z1[r],
    a = t.z0[s],
    o = t.dpv.distance(a, i, e, e);
  (exports.DEBUG && console.log(t.step, "MD[" + e + "]", r, s, "->", o),
    t.stack.push(Math.round(o * 64)));
}
function h2(e) {
  (exports.DEBUG && console.log(e.step, "MPPEM[]"), e.stack.push(e.ppem));
}
function p2(e) {
  (exports.DEBUG && console.log(e.step, "FLIPON[]"), (e.autoFlip = !0));
}
function m2(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "LT[]", n, r), t.push(r < n ? 1 : 0));
}
function g2(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "LTEQ[]", n, r), t.push(r <= n ? 1 : 0));
}
function v2(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "GT[]", n, r), t.push(r > n ? 1 : 0));
}
function y2(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "GTEQ[]", n, r), t.push(r >= n ? 1 : 0));
}
function x2(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "EQ[]", n, r), t.push(n === r ? 1 : 0));
}
function k2(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "NEQ[]", n, r), t.push(n !== r ? 1 : 0));
}
function S2(e) {
  var t = e.stack,
    n = t.pop();
  (exports.DEBUG && console.log(e.step, "ODD[]", n), t.push(Math.trunc(n) % 2 ? 1 : 0));
}
function w2(e) {
  var t = e.stack,
    n = t.pop();
  (exports.DEBUG && console.log(e.step, "EVEN[]", n), t.push(Math.trunc(n) % 2 ? 0 : 1));
}
function b2(e) {
  var t = e.stack.pop();
  (exports.DEBUG && console.log(e.step, "IF[]", t),
    t || (fg(e, !0), exports.DEBUG && console.log(e.step, "EIF[]")));
}
function E2(e) {
  exports.DEBUG && console.log(e.step, "EIF[]");
}
function T2(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "AND[]", n, r), t.push(n && r ? 1 : 0));
}
function C2(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "OR[]", n, r), t.push(n || r ? 1 : 0));
}
function L2(e) {
  var t = e.stack,
    n = t.pop();
  (exports.DEBUG && console.log(e.step, "NOT[]", n), t.push(n ? 0 : 1));
}
function ol(e, t) {
  var n = t.stack,
    r = n.pop(),
    s = t.fv,
    i = t.pv,
    a = t.ppem,
    o = t.deltaBase + (e - 1) * 16,
    l = t.deltaShift,
    u = t.z0;
  exports.DEBUG && console.log(t.step, "DELTAP[" + e + "]", r, n);
  for (var c = 0; c < r; c++) {
    var f = n.pop(),
      d = n.pop(),
      h = o + ((d & 240) >> 4);
    if (h === a) {
      var m = (d & 15) - 8;
      (m >= 0 && m++, exports.DEBUG && console.log(t.step, "DELTAPFIX", f, "by", m * l));
      var x = u[f];
      s.setRelative(x, x, m * l, i);
    }
  }
}
function F2(e) {
  var t = e.stack,
    n = t.pop();
  (exports.DEBUG && console.log(e.step, "SDB[]", n), (e.deltaBase = n));
}
function M2(e) {
  var t = e.stack,
    n = t.pop();
  (exports.DEBUG && console.log(e.step, "SDS[]", n), (e.deltaShift = Math.pow(0.5, n)));
}
function N2(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "ADD[]", n, r), t.push(r + n));
}
function R2(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "SUB[]", n, r), t.push(r - n));
}
function O2(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "DIV[]", n, r), t.push((r * 64) / n));
}
function I2(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "MUL[]", n, r), t.push((r * n) / 64));
}
function P2(e) {
  var t = e.stack,
    n = t.pop();
  (exports.DEBUG && console.log(e.step, "ABS[]", n), t.push(Math.abs(n)));
}
function D2(e) {
  var t = e.stack,
    n = t.pop();
  (exports.DEBUG && console.log(e.step, "NEG[]", n), t.push(-n));
}
function U2(e) {
  var t = e.stack,
    n = t.pop();
  (exports.DEBUG && console.log(e.step, "FLOOR[]", n), t.push(Math.floor(n / 64) * 64));
}
function A2(e) {
  var t = e.stack,
    n = t.pop();
  (exports.DEBUG && console.log(e.step, "CEILING[]", n), t.push(Math.ceil(n / 64) * 64));
}
function Hi(e, t) {
  var n = t.stack,
    r = n.pop();
  (exports.DEBUG && console.log(t.step, "ROUND[]"), n.push(t.round(r / 64) * 64));
}
function B2(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "WCVTF[]", n, r),
    (e.cvt[r] = (n * e.ppem) / e.font.unitsPerEm));
}
function ll(e, t) {
  var n = t.stack,
    r = n.pop(),
    s = t.ppem,
    i = t.deltaBase + (e - 1) * 16,
    a = t.deltaShift;
  exports.DEBUG && console.log(t.step, "DELTAC[" + e + "]", r, n);
  for (var o = 0; o < r; o++) {
    var l = n.pop(),
      u = n.pop(),
      c = i + ((u & 240) >> 4);
    if (c === s) {
      var f = (u & 15) - 8;
      f >= 0 && f++;
      var d = f * a;
      (exports.DEBUG && console.log(t.step, "DELTACFIX", l, "by", d), (t.cvt[l] += d));
    }
  }
}
function $2(e) {
  var t = e.stack.pop();
  (exports.DEBUG && console.log(e.step, "SROUND[]", t), (e.round = cg));
  var n;
  switch (t & 192) {
    case 0:
      n = 0.5;
      break;
    case 64:
      n = 1;
      break;
    case 128:
      n = 2;
      break;
    default:
      throw new Error("invalid SROUND value");
  }
  switch (((e.srPeriod = n), t & 48)) {
    case 0:
      e.srPhase = 0;
      break;
    case 16:
      e.srPhase = 0.25 * n;
      break;
    case 32:
      e.srPhase = 0.5 * n;
      break;
    case 48:
      e.srPhase = 0.75 * n;
      break;
    default:
      throw new Error("invalid SROUND value");
  }
  ((t &= 15), t === 0 ? (e.srThreshold = 0) : (e.srThreshold = (t / 8 - 0.5) * n));
}
function _2(e) {
  var t = e.stack.pop();
  (exports.DEBUG && console.log(e.step, "S45ROUND[]", t), (e.round = cg));
  var n;
  switch (t & 192) {
    case 0:
      n = Math.sqrt(2) / 2;
      break;
    case 64:
      n = Math.sqrt(2);
      break;
    case 128:
      n = 2 * Math.sqrt(2);
      break;
    default:
      throw new Error("invalid S45ROUND value");
  }
  switch (((e.srPeriod = n), t & 48)) {
    case 0:
      e.srPhase = 0;
      break;
    case 16:
      e.srPhase = 0.25 * n;
      break;
    case 32:
      e.srPhase = 0.5 * n;
      break;
    case 48:
      e.srPhase = 0.75 * n;
      break;
    default:
      throw new Error("invalid S45ROUND value");
  }
  ((t &= 15), t === 0 ? (e.srThreshold = 0) : (e.srThreshold = (t / 8 - 0.5) * n));
}
function z2(e) {
  (exports.DEBUG && console.log(e.step, "ROFF[]"), (e.round = wb));
}
function j2(e) {
  (exports.DEBUG && console.log(e.step, "RUTG[]"), (e.round = Tb));
}
function G2(e) {
  (exports.DEBUG && console.log(e.step, "RDTG[]"), (e.round = Cb));
}
function H2(e) {
  var t = e.stack.pop();
  exports.DEBUG && console.log(e.step, "SCANCTRL[]", t);
}
function th(e, t) {
  var n = t.stack,
    r = n.pop(),
    s = n.pop(),
    i = t.z2[r],
    a = t.z1[s];
  exports.DEBUG && console.log(t.step, "SDPVTL[" + e + "]", r, s);
  var o, l;
  (e ? ((o = i.y - a.y), (l = a.x - i.x)) : ((o = a.x - i.x), (l = a.y - i.y)), (t.dpv = yi(o, l)));
}
function W2(e) {
  var t = e.stack,
    n = t.pop(),
    r = 0;
  (exports.DEBUG && console.log(e.step, "GETINFO[]", n),
    n & 1 && (r = 35),
    n & 32 && (r |= 4096),
    t.push(r));
}
function V2(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop(),
    s = t.pop();
  (exports.DEBUG && console.log(e.step, "ROLL[]"), t.push(r), t.push(n), t.push(s));
}
function K2(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "MAX[]", n, r), t.push(Math.max(r, n)));
}
function q2(e) {
  var t = e.stack,
    n = t.pop(),
    r = t.pop();
  (exports.DEBUG && console.log(e.step, "MIN[]", n, r), t.push(Math.min(r, n)));
}
function X2(e) {
  var t = e.stack.pop();
  exports.DEBUG && console.log(e.step, "SCANTYPE[]", t);
}
function Z2(e) {
  var t = e.stack.pop(),
    n = e.stack.pop();
  switch ((exports.DEBUG && console.log(e.step, "INSTCTRL[]", t, n), t)) {
    case 1:
      e.inhibitGridFit = !!n;
      return;
    case 2:
      e.ignoreCvt = !!n;
      return;
    default:
      throw new Error("invalid INSTCTRL[] selector");
  }
}
function vn(e, t) {
  var n = t.stack,
    r = t.prog,
    s = t.ip;
  exports.DEBUG && console.log(t.step, "PUSHB[" + e + "]");
  for (var i = 0; i < e; i++) n.push(r[++s]);
  t.ip = s;
}
function yn(e, t) {
  var n = t.ip,
    r = t.prog,
    s = t.stack;
  exports.DEBUG && console.log(t.ip, "PUSHW[" + e + "]");
  for (var i = 0; i < e; i++) {
    var a = (r[++n] << 8) | r[++n];
    (a & 32768 && (a = -((a ^ 65535) + 1)), s.push(a));
  }
  t.ip = n;
}
function _(e, t, n, r, s, i) {
  var a = i.stack,
    o = e && a.pop(),
    l = a.pop(),
    u = i.rp0,
    c = i.z0[u],
    f = i.z1[l],
    d = i.minDis,
    h = i.fv,
    m = i.dpv,
    x,
    k,
    p,
    g;
  ((k = x = m.distance(f, c, !0, !0)),
    (p = k >= 0 ? 1 : -1),
    (k = Math.abs(k)),
    e && ((g = i.cvt[o]), r && Math.abs(k - g) < i.cvCutIn && (k = g)),
    n && k < d && (k = d),
    r && (k = i.round(k)),
    h.setRelative(f, c, p * k, m),
    h.touch(f),
    exports.DEBUG &&
      console.log(
        i.step,
        (e ? "MIRP[" : "MDRP[") +
          (t ? "M" : "m") +
          (n ? ">" : "_") +
          (r ? "R" : "_") +
          (s === 0 ? "Gr" : s === 1 ? "Bl" : s === 2 ? "Wh" : "") +
          "]",
        e ? o + "(" + i.cvt[o] + "," + g + ")" : "",
        l,
        "(d =",
        x,
        "->",
        p * k,
        ")",
      ),
    (i.rp1 = i.rp0),
    (i.rp2 = l),
    t && (i.rp0 = l));
}
ag = [
  zd.bind(void 0, rn),
  zd.bind(void 0, Vt),
  jd.bind(void 0, rn),
  jd.bind(void 0, Vt),
  Gd.bind(void 0, rn),
  Gd.bind(void 0, Vt),
  Hd.bind(void 0, 0),
  Hd.bind(void 0, 1),
  Wd.bind(void 0, 0),
  Wd.bind(void 0, 1),
  Fb,
  Mb,
  Nb,
  Rb,
  Ob,
  Ib,
  Pb,
  Db,
  Ub,
  Ab,
  Bb,
  $b,
  _b,
  zb,
  jb,
  Gb,
  Hb,
  Wb,
  Vb,
  Kb,
  void 0,
  void 0,
  qb,
  al,
  Xb,
  Zb,
  Yb,
  e2,
  t2,
  void 0,
  void 0,
  void 0,
  Qb,
  Jb,
  n2,
  void 0,
  Vd.bind(void 0, 0),
  Vd.bind(void 0, 1),
  Kd.bind(void 0, rn),
  Kd.bind(void 0, Vt),
  qd.bind(void 0, 0),
  qd.bind(void 0, 1),
  Xd.bind(void 0, 0),
  Xd.bind(void 0, 1),
  Zd.bind(void 0, 0),
  Zd.bind(void 0, 1),
  r2,
  s2,
  Yd.bind(void 0, 0),
  Yd.bind(void 0, 1),
  i2,
  a2,
  Qd.bind(void 0, 0),
  Qd.bind(void 0, 1),
  o2,
  l2,
  u2,
  c2,
  f2,
  d2,
  Jd.bind(void 0, 0),
  Jd.bind(void 0, 1),
  void 0,
  eh.bind(void 0, 0),
  eh.bind(void 0, 1),
  h2,
  void 0,
  p2,
  void 0,
  void 0,
  m2,
  g2,
  v2,
  y2,
  x2,
  k2,
  S2,
  w2,
  b2,
  E2,
  T2,
  C2,
  L2,
  ol.bind(void 0, 1),
  F2,
  M2,
  N2,
  R2,
  O2,
  I2,
  P2,
  D2,
  U2,
  A2,
  Hi.bind(void 0, 0),
  Hi.bind(void 0, 1),
  Hi.bind(void 0, 2),
  Hi.bind(void 0, 3),
  void 0,
  void 0,
  void 0,
  void 0,
  B2,
  ol.bind(void 0, 2),
  ol.bind(void 0, 3),
  ll.bind(void 0, 1),
  ll.bind(void 0, 2),
  ll.bind(void 0, 3),
  $2,
  _2,
  void 0,
  void 0,
  z2,
  void 0,
  j2,
  G2,
  al,
  al,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  H2,
  th.bind(void 0, 0),
  th.bind(void 0, 1),
  W2,
  void 0,
  V2,
  K2,
  q2,
  X2,
  Z2,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  void 0,
  vn.bind(void 0, 1),
  vn.bind(void 0, 2),
  vn.bind(void 0, 3),
  vn.bind(void 0, 4),
  vn.bind(void 0, 5),
  vn.bind(void 0, 6),
  vn.bind(void 0, 7),
  vn.bind(void 0, 8),
  yn.bind(void 0, 1),
  yn.bind(void 0, 2),
  yn.bind(void 0, 3),
  yn.bind(void 0, 4),
  yn.bind(void 0, 5),
  yn.bind(void 0, 6),
  yn.bind(void 0, 7),
  yn.bind(void 0, 8),
  _.bind(void 0, 0, 0, 0, 0, 0),
  _.bind(void 0, 0, 0, 0, 0, 1),
  _.bind(void 0, 0, 0, 0, 0, 2),
  _.bind(void 0, 0, 0, 0, 0, 3),
  _.bind(void 0, 0, 0, 0, 1, 0),
  _.bind(void 0, 0, 0, 0, 1, 1),
  _.bind(void 0, 0, 0, 0, 1, 2),
  _.bind(void 0, 0, 0, 0, 1, 3),
  _.bind(void 0, 0, 0, 1, 0, 0),
  _.bind(void 0, 0, 0, 1, 0, 1),
  _.bind(void 0, 0, 0, 1, 0, 2),
  _.bind(void 0, 0, 0, 1, 0, 3),
  _.bind(void 0, 0, 0, 1, 1, 0),
  _.bind(void 0, 0, 0, 1, 1, 1),
  _.bind(void 0, 0, 0, 1, 1, 2),
  _.bind(void 0, 0, 0, 1, 1, 3),
  _.bind(void 0, 0, 1, 0, 0, 0),
  _.bind(void 0, 0, 1, 0, 0, 1),
  _.bind(void 0, 0, 1, 0, 0, 2),
  _.bind(void 0, 0, 1, 0, 0, 3),
  _.bind(void 0, 0, 1, 0, 1, 0),
  _.bind(void 0, 0, 1, 0, 1, 1),
  _.bind(void 0, 0, 1, 0, 1, 2),
  _.bind(void 0, 0, 1, 0, 1, 3),
  _.bind(void 0, 0, 1, 1, 0, 0),
  _.bind(void 0, 0, 1, 1, 0, 1),
  _.bind(void 0, 0, 1, 1, 0, 2),
  _.bind(void 0, 0, 1, 1, 0, 3),
  _.bind(void 0, 0, 1, 1, 1, 0),
  _.bind(void 0, 0, 1, 1, 1, 1),
  _.bind(void 0, 0, 1, 1, 1, 2),
  _.bind(void 0, 0, 1, 1, 1, 3),
  _.bind(void 0, 1, 0, 0, 0, 0),
  _.bind(void 0, 1, 0, 0, 0, 1),
  _.bind(void 0, 1, 0, 0, 0, 2),
  _.bind(void 0, 1, 0, 0, 0, 3),
  _.bind(void 0, 1, 0, 0, 1, 0),
  _.bind(void 0, 1, 0, 0, 1, 1),
  _.bind(void 0, 1, 0, 0, 1, 2),
  _.bind(void 0, 1, 0, 0, 1, 3),
  _.bind(void 0, 1, 0, 1, 0, 0),
  _.bind(void 0, 1, 0, 1, 0, 1),
  _.bind(void 0, 1, 0, 1, 0, 2),
  _.bind(void 0, 1, 0, 1, 0, 3),
  _.bind(void 0, 1, 0, 1, 1, 0),
  _.bind(void 0, 1, 0, 1, 1, 1),
  _.bind(void 0, 1, 0, 1, 1, 2),
  _.bind(void 0, 1, 0, 1, 1, 3),
  _.bind(void 0, 1, 1, 0, 0, 0),
  _.bind(void 0, 1, 1, 0, 0, 1),
  _.bind(void 0, 1, 1, 0, 0, 2),
  _.bind(void 0, 1, 1, 0, 0, 3),
  _.bind(void 0, 1, 1, 0, 1, 0),
  _.bind(void 0, 1, 1, 0, 1, 1),
  _.bind(void 0, 1, 1, 0, 1, 2),
  _.bind(void 0, 1, 1, 0, 1, 3),
  _.bind(void 0, 1, 1, 1, 0, 0),
  _.bind(void 0, 1, 1, 1, 0, 1),
  _.bind(void 0, 1, 1, 1, 0, 2),
  _.bind(void 0, 1, 1, 1, 0, 3),
  _.bind(void 0, 1, 1, 1, 1, 0),
  _.bind(void 0, 1, 1, 1, 1, 1),
  _.bind(void 0, 1, 1, 1, 1, 2),
  _.bind(void 0, 1, 1, 1, 1, 3),
];
function as(e) {
  ((this.char = e), (this.state = {}), (this.activeState = null));
}
function jc(e, t, n) {
  ((this.contextName = n), (this.startIndex = e), (this.endOffset = t));
}
function Y2(e, t, n) {
  ((this.contextName = e),
    (this.openRange = null),
    (this.ranges = []),
    (this.checkStart = t),
    (this.checkEnd = n));
}
function Ut(e, t) {
  ((this.context = e),
    (this.index = t),
    (this.length = e.length),
    (this.current = e[t]),
    (this.backtrack = e.slice(0, t)),
    (this.lookahead = e.slice(t + 1)));
}
function xo(e) {
  ((this.eventId = e), (this.subscribers = []));
}
function Q2(e) {
  var t = this,
    n = [
      "start",
      "end",
      "next",
      "newToken",
      "contextStart",
      "contextEnd",
      "insertToken",
      "removeToken",
      "removeRange",
      "replaceToken",
      "replaceRange",
      "composeRUD",
      "updateContextsRanges",
    ];
  (n.forEach(function (s) {
    Object.defineProperty(t.events, s, { value: new xo(s) });
  }),
    e &&
      n.forEach(function (s) {
        var i = e[s];
        typeof i == "function" && t.events[s].subscribe(i);
      }));
  var r = [
    "insertToken",
    "removeToken",
    "removeRange",
    "replaceToken",
    "replaceRange",
    "composeRUD",
  ];
  r.forEach(function (s) {
    t.events[s].subscribe(t.updateContextsRanges);
  });
}
function be(e) {
  ((this.tokens = []),
    (this.registeredContexts = {}),
    (this.contextCheckers = []),
    (this.events = {}),
    (this.registeredModifiers = []),
    Q2.call(this, e));
}
as.prototype.setState = function (e, t) {
  return (
    (this.state[e] = t),
    (this.activeState = { key: e, value: this.state[e] }),
    this.activeState
  );
};
as.prototype.getState = function (e) {
  return this.state[e] || null;
};
be.prototype.inboundIndex = function (e) {
  return e >= 0 && e < this.tokens.length;
};
be.prototype.composeRUD = function (e) {
  var t = this,
    n = !0,
    r = e.map(function (i) {
      return t[i[0]].apply(t, i.slice(1).concat(n));
    }),
    s = function (i) {
      return typeof i == "object" && i.hasOwnProperty("FAIL");
    };
  if (r.every(s))
    return {
      FAIL: "composeRUD: one or more operations hasn't completed successfully",
      report: r.filter(s),
    };
  this.dispatch("composeRUD", [
    r.filter(function (i) {
      return !s(i);
    }),
  ]);
};
be.prototype.replaceRange = function (e, t, n, r) {
  t = t !== null ? t : this.tokens.length;
  var s = n.every(function (a) {
    return a instanceof as;
  });
  if (!isNaN(e) && this.inboundIndex(e) && s) {
    var i = this.tokens.splice.apply(this.tokens, [e, t].concat(n));
    return (r || this.dispatch("replaceToken", [e, t, n]), [i, n]);
  } else return { FAIL: "replaceRange: invalid tokens or startIndex." };
};
be.prototype.replaceToken = function (e, t, n) {
  if (!isNaN(e) && this.inboundIndex(e) && t instanceof as) {
    var r = this.tokens.splice(e, 1, t);
    return (n || this.dispatch("replaceToken", [e, t]), [r[0], t]);
  } else return { FAIL: "replaceToken: invalid token or index." };
};
be.prototype.removeRange = function (e, t, n) {
  t = isNaN(t) ? this.tokens.length : t;
  var r = this.tokens.splice(e, t);
  return (n || this.dispatch("removeRange", [r, e, t]), r);
};
be.prototype.removeToken = function (e, t) {
  if (!isNaN(e) && this.inboundIndex(e)) {
    var n = this.tokens.splice(e, 1);
    return (t || this.dispatch("removeToken", [n, e]), n);
  } else return { FAIL: "removeToken: invalid token index." };
};
be.prototype.insertToken = function (e, t, n) {
  var r = e.every(function (s) {
    return s instanceof as;
  });
  return r
    ? (this.tokens.splice.apply(this.tokens, [t, 0].concat(e)),
      n || this.dispatch("insertToken", [e, t]),
      e)
    : { FAIL: "insertToken: invalid token(s)." };
};
be.prototype.registerModifier = function (e, t, n) {
  (this.events.newToken.subscribe(function (r, s) {
    var i = [r, s],
      a = t === null || t.apply(this, i) === !0,
      o = [r, s];
    if (a) {
      var l = n.apply(this, o);
      r.setState(e, l);
    }
  }),
    this.registeredModifiers.push(e));
};
xo.prototype.subscribe = function (e) {
  return typeof e == "function"
    ? this.subscribers.push(e) - 1
    : { FAIL: "invalid '" + this.eventId + "' event handler" };
};
xo.prototype.unsubscribe = function (e) {
  this.subscribers.splice(e, 1);
};
Ut.prototype.setCurrentIndex = function (e) {
  ((this.index = e),
    (this.current = this.context[e]),
    (this.backtrack = this.context.slice(0, e)),
    (this.lookahead = this.context.slice(e + 1)));
};
Ut.prototype.get = function (e) {
  switch (!0) {
    case e === 0:
      return this.current;
    case e < 0 && Math.abs(e) <= this.backtrack.length:
      return this.backtrack.slice(e)[0];
    case e > 0 && e <= this.lookahead.length:
      return this.lookahead[e - 1];
    default:
      return null;
  }
};
be.prototype.rangeToText = function (e) {
  if (e instanceof jc)
    return this.getRangeTokens(e)
      .map(function (t) {
        return t.char;
      })
      .join("");
};
be.prototype.getText = function () {
  return this.tokens
    .map(function (e) {
      return e.char;
    })
    .join("");
};
be.prototype.getContext = function (e) {
  var t = this.registeredContexts[e];
  return t || null;
};
be.prototype.on = function (e, t) {
  var n = this.events[e];
  return n ? n.subscribe(t) : null;
};
be.prototype.dispatch = function (e, t) {
  var n = this,
    r = this.events[e];
  r instanceof xo &&
    r.subscribers.forEach(function (s) {
      s.apply(n, t || []);
    });
};
be.prototype.registerContextChecker = function (e, t, n) {
  if (this.getContext(e)) return { FAIL: "context name '" + e + "' is already registered." };
  if (typeof t != "function") return { FAIL: "missing context start check." };
  if (typeof n != "function") return { FAIL: "missing context end check." };
  var r = new Y2(e, t, n);
  return ((this.registeredContexts[e] = r), this.contextCheckers.push(r), r);
};
be.prototype.getRangeTokens = function (e) {
  var t = e.startIndex + e.endOffset;
  return [].concat(this.tokens.slice(e.startIndex, t));
};
be.prototype.getContextRanges = function (e) {
  var t = this.getContext(e);
  return t ? t.ranges : { FAIL: "context checker '" + e + "' is not registered." };
};
be.prototype.resetContextsRanges = function () {
  var e = this.registeredContexts;
  for (var t in e)
    if (e.hasOwnProperty(t)) {
      var n = e[t];
      n.ranges = [];
    }
};
be.prototype.updateContextsRanges = function () {
  this.resetContextsRanges();
  for (
    var e = this.tokens.map(function (r) {
        return r.char;
      }),
      t = 0;
    t < e.length;
    t++
  ) {
    var n = new Ut(e, t);
    this.runContextCheck(n);
  }
  this.dispatch("updateContextsRanges", [this.registeredContexts]);
};
be.prototype.setEndOffset = function (e, t) {
  var n = this.getContext(t).openRange.startIndex,
    r = new jc(n, e, t),
    s = this.getContext(t).ranges;
  return ((r.rangeId = t + "." + s.length), s.push(r), (this.getContext(t).openRange = null), r);
};
be.prototype.runContextCheck = function (e) {
  var t = this,
    n = e.index;
  this.contextCheckers.forEach(function (r) {
    var s = r.contextName,
      i = t.getContext(s).openRange;
    if (
      (!i &&
        r.checkStart(e) &&
        ((i = new jc(n, null, s)),
        (t.getContext(s).openRange = i),
        t.dispatch("contextStart", [s, n])),
      i && r.checkEnd(e))
    ) {
      var a = n - i.startIndex + 1,
        o = t.setEndOffset(a, s);
      t.dispatch("contextEnd", [s, o]);
    }
  });
};
be.prototype.tokenize = function (e) {
  ((this.tokens = []), this.resetContextsRanges());
  var t = Array.from(e);
  this.dispatch("start");
  for (var n = 0; n < t.length; n++) {
    var r = t[n],
      s = new Ut(t, n);
    (this.dispatch("next", [s]), this.runContextCheck(s));
    var i = new as(r);
    (this.tokens.push(i), this.dispatch("newToken", [i, s]));
  }
  return (this.dispatch("end", [this.tokens]), this.tokens);
};
function zn(e) {
  return /[\u0600-\u065F\u066A-\u06D2\u06FA-\u06FF]/.test(e);
}
function dg(e) {
  return /[\u0630\u0690\u0621\u0631\u0661\u0671\u0622\u0632\u0672\u0692\u06C2\u0623\u0673\u0693\u06C3\u0624\u0694\u06C4\u0625\u0675\u0695\u06C5\u06E5\u0676\u0696\u06C6\u0627\u0677\u0697\u06C7\u0648\u0688\u0698\u06C8\u0689\u0699\u06C9\u068A\u06CA\u066B\u068B\u06CB\u068C\u068D\u06CD\u06FD\u068E\u06EE\u06FE\u062F\u068F\u06CF\u06EF]/.test(
    e,
  );
}
function Vn(e) {
  return /[\u0600-\u0605\u060C-\u060E\u0610-\u061B\u061E\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/.test(
    e,
  );
}
function da(e) {
  return /[A-z]/.test(e);
}
function J2(e) {
  return /\s/.test(e);
}
function pt(e) {
  ((this.font = e), (this.features = {}));
}
function nr(e) {
  ((this.id = e.id), (this.tag = e.tag), (this.substitution = e.substitution));
}
function xi(e, t) {
  if (!e) return -1;
  switch (t.format) {
    case 1:
      return t.glyphs.indexOf(e);
    case 2:
      for (var n = t.ranges, r = 0; r < n.length; r++) {
        var s = n[r];
        if (e >= s.start && e <= s.end) {
          var i = e - s.start;
          return s.index + i;
        }
      }
      break;
    default:
      return -1;
  }
  return -1;
}
function eE(e, t) {
  var n = xi(e, t.coverage);
  return n === -1 ? null : e + t.deltaGlyphId;
}
function tE(e, t) {
  var n = xi(e, t.coverage);
  return n === -1 ? null : t.substitute[n];
}
function ul(e, t) {
  for (var n = [], r = 0; r < e.length; r++) {
    var s = e[r],
      i = t.current;
    i = Array.isArray(i) ? i[0] : i;
    var a = xi(i, s);
    a !== -1 && n.push(a);
  }
  return n.length !== e.length ? -1 : n;
}
function nE(e, t) {
  var n = t.inputCoverage.length + t.lookaheadCoverage.length + t.backtrackCoverage.length;
  if (e.context.length < n) return [];
  var r = ul(t.inputCoverage, e);
  if (r === -1) return [];
  var s = t.inputCoverage.length - 1;
  if (e.lookahead.length < t.lookaheadCoverage.length) return [];
  for (var i = e.lookahead.slice(s); i.length && Vn(i[0].char); ) i.shift();
  var a = new Ut(i, 0),
    o = ul(t.lookaheadCoverage, a),
    l = [].concat(e.backtrack);
  for (l.reverse(); l.length && Vn(l[0].char); ) l.shift();
  if (l.length < t.backtrackCoverage.length) return [];
  var u = new Ut(l, 0),
    c = ul(t.backtrackCoverage, u),
    f =
      r.length === t.inputCoverage.length &&
      o.length === t.lookaheadCoverage.length &&
      c.length === t.backtrackCoverage.length,
    d = [];
  if (f)
    for (var h = 0; h < t.lookupRecords.length; h++)
      for (
        var m = t.lookupRecords[h], x = m.lookupListIndex, k = this.getLookupByIndex(x), p = 0;
        p < k.subtables.length;
        p++
      ) {
        var g = k.subtables[p],
          v = this.getLookupMethod(k, g),
          S = this.getSubstitutionType(k, g);
        if (S === "12")
          for (var b = 0; b < r.length; b++) {
            var L = e.get(b),
              T = v(L);
            T && d.push(T);
          }
      }
  return d;
}
function rE(e, t) {
  var n = e.current,
    r = xi(n, t.coverage);
  if (r === -1) return null;
  for (var s, i = t.ligatureSets[r], a = 0; a < i.length; a++) {
    s = i[a];
    for (var o = 0; o < s.components.length; o++) {
      var l = e.lookahead[o],
        u = s.components[o];
      if (l !== u) break;
      if (o === s.components.length - 1) return s;
    }
  }
  return null;
}
function sE(e, t) {
  var n = xi(e, t.coverage);
  return n === -1 ? null : t.sequences[n];
}
pt.prototype.getDefaultScriptFeaturesIndexes = function () {
  for (var e = this.font.tables.gsub.scripts, t = 0; t < e.length; t++) {
    var n = e[t];
    if (n.tag === "DFLT") return n.script.defaultLangSys.featureIndexes;
  }
  return [];
};
pt.prototype.getScriptFeaturesIndexes = function (e) {
  var t = this.font.tables;
  if (!t.gsub) return [];
  if (!e) return this.getDefaultScriptFeaturesIndexes();
  for (var n = this.font.tables.gsub.scripts, r = 0; r < n.length; r++) {
    var s = n[r];
    if (s.tag === e && s.script.defaultLangSys) return s.script.defaultLangSys.featureIndexes;
    var i = s.langSysRecords;
    if (i)
      for (var a = 0; a < i.length; a++) {
        var o = i[a];
        if (o.tag === e) {
          var l = o.langSys;
          return l.featureIndexes;
        }
      }
  }
  return this.getDefaultScriptFeaturesIndexes();
};
pt.prototype.mapTagsToFeatures = function (e, t) {
  for (var n = {}, r = 0; r < e.length; r++) {
    var s = e[r].tag,
      i = e[r].feature;
    n[s] = i;
  }
  this.features[t].tags = n;
};
pt.prototype.getScriptFeatures = function (e) {
  var t = this.features[e];
  if (this.features.hasOwnProperty(e)) return t;
  var n = this.getScriptFeaturesIndexes(e);
  if (!n) return null;
  var r = this.font.tables.gsub;
  return (
    (t = n.map(function (s) {
      return r.features[s];
    })),
    (this.features[e] = t),
    this.mapTagsToFeatures(t, e),
    t
  );
};
pt.prototype.getSubstitutionType = function (e, t) {
  var n = e.lookupType.toString(),
    r = t.substFormat.toString();
  return n + r;
};
pt.prototype.getLookupMethod = function (e, t) {
  var n = this,
    r = this.getSubstitutionType(e, t);
  switch (r) {
    case "11":
      return function (s) {
        return eE.apply(n, [s, t]);
      };
    case "12":
      return function (s) {
        return tE.apply(n, [s, t]);
      };
    case "63":
      return function (s) {
        return nE.apply(n, [s, t]);
      };
    case "41":
      return function (s) {
        return rE.apply(n, [s, t]);
      };
    case "21":
      return function (s) {
        return sE.apply(n, [s, t]);
      };
    default:
      throw new Error(
        "lookupType: " +
          e.lookupType +
          " - substFormat: " +
          t.substFormat +
          " is not yet supported",
      );
  }
};
pt.prototype.lookupFeature = function (e) {
  var t = e.contextParams,
    n = t.index,
    r = this.getFeature({ tag: e.tag, script: e.script });
  if (!r)
    return new Error(
      "font '" +
        this.font.names.fullName.en +
        "' doesn't support feature '" +
        e.tag +
        "' for script '" +
        e.script +
        "'.",
    );
  for (var s = this.getFeatureLookups(r), i = [].concat(t.context), a = 0; a < s.length; a++)
    for (var o = s[a], l = this.getLookupSubtables(o), u = 0; u < l.length; u++) {
      var c = l[u],
        f = this.getSubstitutionType(o, c),
        d = this.getLookupMethod(o, c),
        h = void 0;
      switch (f) {
        case "11":
          ((h = d(t.current)),
            h && i.splice(n, 1, new nr({ id: 11, tag: e.tag, substitution: h })));
          break;
        case "12":
          ((h = d(t.current)),
            h && i.splice(n, 1, new nr({ id: 12, tag: e.tag, substitution: h })));
          break;
        case "63":
          ((h = d(t)),
            Array.isArray(h) &&
              h.length &&
              i.splice(n, 1, new nr({ id: 63, tag: e.tag, substitution: h })));
          break;
        case "41":
          ((h = d(t)), h && i.splice(n, 1, new nr({ id: 41, tag: e.tag, substitution: h })));
          break;
        case "21":
          ((h = d(t.current)),
            h && i.splice(n, 1, new nr({ id: 21, tag: e.tag, substitution: h })));
          break;
      }
      ((t = new Ut(i, n)), !(Array.isArray(h) && !h.length) && (h = null));
    }
  return i.length ? i : null;
};
pt.prototype.supports = function (e) {
  if (!e.script) return !1;
  this.getScriptFeatures(e.script);
  var t = this.features.hasOwnProperty(e.script);
  if (!e.tag) return t;
  var n = this.features[e.script].some(function (r) {
    return r.tag === e.tag;
  });
  return t && n;
};
pt.prototype.getLookupSubtables = function (e) {
  return e.subtables || null;
};
pt.prototype.getLookupByIndex = function (e) {
  var t = this.font.tables.gsub.lookups;
  return t[e] || null;
};
pt.prototype.getFeatureLookups = function (e) {
  return e.lookupListIndexes.map(this.getLookupByIndex.bind(this));
};
pt.prototype.getFeature = function (t) {
  if (!this.font) return { FAIL: "No font was found" };
  this.features.hasOwnProperty(t.script) || this.getScriptFeatures(t.script);
  var n = this.features[t.script];
  return n
    ? n.tags[t.tag]
      ? this.features[t.script].tags[t.tag]
      : null
    : { FAIL: "No feature for script " + t.script };
};
function iE(e) {
  var t = e.current,
    n = e.get(-1);
  return (n === null && zn(t)) || (!zn(n) && zn(t));
}
function aE(e) {
  var t = e.get(1);
  return t === null || !zn(t);
}
var oE = { startCheck: iE, endCheck: aE };
function lE(e) {
  var t = e.current,
    n = e.get(-1);
  return (zn(t) || Vn(t)) && !zn(n);
}
function uE(e) {
  var t = e.get(1);
  switch (!0) {
    case t === null:
      return !0;
    case !zn(t) && !Vn(t):
      var n = J2(t);
      if (!n) return !0;
      if (n) {
        var r = !1;
        if (
          ((r = e.lookahead.some(function (s) {
            return zn(s) || Vn(s);
          })),
          !r)
        )
          return !0;
      }
      break;
    default:
      return !1;
  }
}
var cE = { startCheck: lE, endCheck: uE };
function fE(e, t, n) {
  t[n].setState(e.tag, e.substitution);
}
function dE(e, t, n) {
  t[n].setState(e.tag, e.substitution);
}
function hE(e, t, n) {
  e.substitution.forEach(function (r, s) {
    var i = t[n + s];
    i.setState(e.tag, r);
  });
}
function pE(e, t, n) {
  var r = t[n];
  r.setState(e.tag, e.substitution.ligGlyph);
  for (var s = e.substitution.components.length, i = 0; i < s; i++)
    ((r = t[n + i + 1]), r.setState("deleted", !0));
}
var nh = { 11: fE, 12: dE, 63: hE, 41: pE };
function Gc(e, t, n) {
  e instanceof nr && nh[e.id] && nh[e.id](e, t, n);
}
function mE(e) {
  for (var t = [].concat(e.backtrack), n = t.length - 1; n >= 0; n--) {
    var r = t[n],
      s = dg(r),
      i = Vn(r);
    if (!s && !i) return !0;
    if (s) return !1;
  }
  return !1;
}
function gE(e) {
  if (dg(e.current)) return !1;
  for (var t = 0; t < e.lookahead.length; t++) {
    var n = e.lookahead[t],
      r = Vn(n);
    if (!r) return !0;
  }
  return !1;
}
function vE(e) {
  var t = this,
    n = "arab",
    r = this.featuresTags[n],
    s = this.tokenizer.getRangeTokens(e);
  if (s.length !== 1) {
    var i = new Ut(
        s.map(function (o) {
          return o.getState("glyphIndex");
        }),
        0,
      ),
      a = new Ut(
        s.map(function (o) {
          return o.char;
        }),
        0,
      );
    s.forEach(function (o, l) {
      if (!Vn(o.char)) {
        (i.setCurrentIndex(l), a.setCurrentIndex(l));
        var u = 0;
        (mE(a) && (u |= 1), gE(a) && (u |= 2));
        var c;
        switch (u) {
          case 1:
            c = "fina";
            break;
          case 2:
            c = "init";
            break;
          case 3:
            c = "medi";
            break;
        }
        if (r.indexOf(c) !== -1) {
          var f = t.query.lookupFeature({ tag: c, script: n, contextParams: i });
          if (f instanceof Error) return console.info(f.message);
          f.forEach(function (d, h) {
            d instanceof nr && (Gc(d, s, h), (i.context[h] = d.substitution));
          });
        }
      }
    });
  }
}
function rh(e, t) {
  var n = e.map(function (r) {
    return r.activeState.value;
  });
  return new Ut(n, 0);
}
function yE(e) {
  var t = this,
    n = "arab",
    r = this.tokenizer.getRangeTokens(e),
    s = rh(r);
  s.context.forEach(function (i, a) {
    s.setCurrentIndex(a);
    var o = t.query.lookupFeature({ tag: "rlig", script: n, contextParams: s });
    o.length &&
      (o.forEach(function (l) {
        return Gc(l, r, a);
      }),
      (s = rh(r)));
  });
}
function xE(e) {
  var t = e.current,
    n = e.get(-1);
  return (n === null && da(t)) || (!da(n) && da(t));
}
function kE(e) {
  var t = e.get(1);
  return t === null || !da(t);
}
var SE = { startCheck: xE, endCheck: kE };
function sh(e, t) {
  var n = e.map(function (r) {
    return r.activeState.value;
  });
  return new Ut(n, 0);
}
function wE(e) {
  var t = this,
    n = "latn",
    r = this.tokenizer.getRangeTokens(e),
    s = sh(r);
  s.context.forEach(function (i, a) {
    s.setCurrentIndex(a);
    var o = t.query.lookupFeature({ tag: "liga", script: n, contextParams: s });
    o.length &&
      (o.forEach(function (l) {
        return Gc(l, r, a);
      }),
      (s = sh(r)));
  });
}
function $t(e) {
  ((this.baseDir = e || "ltr"), (this.tokenizer = new be()), (this.featuresTags = {}));
}
$t.prototype.setText = function (e) {
  this.text = e;
};
$t.prototype.contextChecks = { latinWordCheck: SE, arabicWordCheck: oE, arabicSentenceCheck: cE };
function cl(e) {
  var t = this.contextChecks[e + "Check"];
  return this.tokenizer.registerContextChecker(e, t.startCheck, t.endCheck);
}
function bE() {
  return (
    cl.call(this, "latinWord"),
    cl.call(this, "arabicWord"),
    cl.call(this, "arabicSentence"),
    this.tokenizer.tokenize(this.text)
  );
}
function EE() {
  var e = this,
    t = this.tokenizer.getContextRanges("arabicSentence");
  t.forEach(function (n) {
    var r = e.tokenizer.getRangeTokens(n);
    e.tokenizer.replaceRange(n.startIndex, n.endOffset, r.reverse());
  });
}
$t.prototype.registerFeatures = function (e, t) {
  var n = this,
    r = t.filter(function (s) {
      return n.query.supports({ script: e, tag: s });
    });
  this.featuresTags.hasOwnProperty(e)
    ? (this.featuresTags[e] = this.featuresTags[e].concat(r))
    : (this.featuresTags[e] = r);
};
$t.prototype.applyFeatures = function (e, t) {
  if (!e) throw new Error("No valid font was provided to apply features");
  this.query || (this.query = new pt(e));
  for (var n = 0; n < t.length; n++) {
    var r = t[n];
    this.query.supports({ script: r.script }) && this.registerFeatures(r.script, r.tags);
  }
};
$t.prototype.registerModifier = function (e, t, n) {
  this.tokenizer.registerModifier(e, t, n);
};
function Hc() {
  if (this.tokenizer.registeredModifiers.indexOf("glyphIndex") === -1)
    throw new Error("glyphIndex modifier is required to apply arabic presentation features.");
}
function TE() {
  var e = this,
    t = "arab";
  if (this.featuresTags.hasOwnProperty(t)) {
    Hc.call(this);
    var n = this.tokenizer.getContextRanges("arabicWord");
    n.forEach(function (r) {
      vE.call(e, r);
    });
  }
}
function CE() {
  var e = this,
    t = "arab";
  if (this.featuresTags.hasOwnProperty(t)) {
    var n = this.featuresTags[t];
    if (n.indexOf("rlig") !== -1) {
      Hc.call(this);
      var r = this.tokenizer.getContextRanges("arabicWord");
      r.forEach(function (s) {
        yE.call(e, s);
      });
    }
  }
}
function LE() {
  var e = this,
    t = "latn";
  if (this.featuresTags.hasOwnProperty(t)) {
    var n = this.featuresTags[t];
    if (n.indexOf("liga") !== -1) {
      Hc.call(this);
      var r = this.tokenizer.getContextRanges("latinWord");
      r.forEach(function (s) {
        wE.call(e, s);
      });
    }
  }
}
$t.prototype.checkContextReady = function (e) {
  return !!this.tokenizer.getContext(e);
};
$t.prototype.applyFeaturesToContexts = function () {
  (this.checkContextReady("arabicWord") && (TE.call(this), CE.call(this)),
    this.checkContextReady("latinWord") && LE.call(this),
    this.checkContextReady("arabicSentence") && EE.call(this));
};
$t.prototype.processText = function (e) {
  (!this.text || this.text !== e) &&
    (this.setText(e), bE.call(this), this.applyFeaturesToContexts());
};
$t.prototype.getBidiText = function (e) {
  return (this.processText(e), this.tokenizer.getText());
};
$t.prototype.getTextGlyphs = function (e) {
  this.processText(e);
  for (var t = [], n = 0; n < this.tokenizer.tokens.length; n++) {
    var r = this.tokenizer.tokens[n];
    if (!r.state.deleted) {
      var s = r.activeState.value;
      t.push(Array.isArray(s) ? s[0] : s);
    }
  }
  return t;
};
function ce(e) {
  ((e = e || {}),
    (e.tables = e.tables || {}),
    e.empty ||
      (gs(e.familyName, "When creating a new Font object, familyName is required."),
      gs(e.styleName, "When creating a new Font object, styleName is required."),
      gs(e.unitsPerEm, "When creating a new Font object, unitsPerEm is required."),
      gs(e.ascender, "When creating a new Font object, ascender is required."),
      gs(
        e.descender <= 0,
        "When creating a new Font object, negative descender value is required.",
      ),
      (this.names = {
        fontFamily: { en: e.familyName || " " },
        fontSubfamily: { en: e.styleName || " " },
        fullName: { en: e.fullName || e.familyName + " " + e.styleName },
        postScriptName: { en: e.postScriptName || (e.familyName + e.styleName).replace(/\s/g, "") },
        designer: { en: e.designer || " " },
        designerURL: { en: e.designerURL || " " },
        manufacturer: { en: e.manufacturer || " " },
        manufacturerURL: { en: e.manufacturerURL || " " },
        license: { en: e.license || " " },
        licenseURL: { en: e.licenseURL || " " },
        version: { en: e.version || "Version 0.1" },
        description: { en: e.description || " " },
        copyright: { en: e.copyright || " " },
        trademark: { en: e.trademark || " " },
      }),
      (this.unitsPerEm = e.unitsPerEm || 1e3),
      (this.ascender = e.ascender),
      (this.descender = e.descender),
      (this.createdTimestamp = e.createdTimestamp),
      (this.tables = Object.assign(e.tables, {
        os2: Object.assign(
          {
            usWeightClass: e.weightClass || this.usWeightClasses.MEDIUM,
            usWidthClass: e.widthClass || this.usWidthClasses.MEDIUM,
            fsSelection: e.fsSelection || this.fsSelectionValues.REGULAR,
          },
          e.tables.os2,
        ),
      }))),
    (this.supported = !0),
    (this.glyphs = new Xt.GlyphSet(this, e.glyphs || [])),
    (this.encoding = new N0(this)),
    (this.position = new gi(this)),
    (this.substitution = new ht(this)),
    (this.tables = this.tables || {}),
    (this._push = null),
    (this._hmtxTableData = {}),
    Object.defineProperty(this, "hinting", {
      get: function () {
        if (this._hinting) return this._hinting;
        if (this.outlinesFormat === "truetype") return (this._hinting = new lg(this));
      },
    }));
}
ce.prototype.hasChar = function (e) {
  return this.encoding.charToGlyphIndex(e) !== null;
};
ce.prototype.charToGlyphIndex = function (e) {
  return this.encoding.charToGlyphIndex(e);
};
ce.prototype.charToGlyph = function (e) {
  var t = this.charToGlyphIndex(e),
    n = this.glyphs.get(t);
  return (n || (n = this.glyphs.get(0)), n);
};
ce.prototype.updateFeatures = function (e) {
  return this.defaultRenderOptions.features.map(function (t) {
    return t.script === "latn"
      ? {
          script: "latn",
          tags: t.tags.filter(function (n) {
            return e[n];
          }),
        }
      : t;
  });
};
ce.prototype.stringToGlyphs = function (e, t) {
  var n = this,
    r = new $t(),
    s = function (f) {
      return n.charToGlyphIndex(f.char);
    };
  r.registerModifier("glyphIndex", null, s);
  var i = t ? this.updateFeatures(t.features) : this.defaultRenderOptions.features;
  r.applyFeatures(this, i);
  for (
    var a = r.getTextGlyphs(e), o = a.length, l = new Array(o), u = this.glyphs.get(0), c = 0;
    c < o;
    c += 1
  )
    l[c] = this.glyphs.get(a[c]) || u;
  return l;
};
ce.prototype.nameToGlyphIndex = function (e) {
  return this.glyphNames.nameToGlyphIndex(e);
};
ce.prototype.nameToGlyph = function (e) {
  var t = this.nameToGlyphIndex(e),
    n = this.glyphs.get(t);
  return (n || (n = this.glyphs.get(0)), n);
};
ce.prototype.glyphIndexToName = function (e) {
  return this.glyphNames.glyphIndexToName ? this.glyphNames.glyphIndexToName(e) : "";
};
ce.prototype.getKerningValue = function (e, t) {
  ((e = e.index || e), (t = t.index || t));
  var n = this.position.defaultKerningTables;
  return n ? this.position.getKerningValue(n, e, t) : this.kerningPairs[e + "," + t] || 0;
};
ce.prototype.defaultRenderOptions = {
  kerning: !0,
  features: [
    { script: "arab", tags: ["init", "medi", "fina", "rlig"] },
    { script: "latn", tags: ["liga", "rlig"] },
  ],
};
ce.prototype.forEachGlyph = function (e, t, n, r, s, i) {
  ((t = t !== void 0 ? t : 0),
    (n = n !== void 0 ? n : 0),
    (r = r !== void 0 ? r : 72),
    (s = Object.assign({}, this.defaultRenderOptions, s)));
  var a = (1 / this.unitsPerEm) * r,
    o = this.stringToGlyphs(e, s),
    l;
  if (s.kerning) {
    var u = s.script || this.position.getDefaultScriptName();
    l = this.position.getKerningTables(u, s.language);
  }
  for (var c = 0; c < o.length; c += 1) {
    var f = o[c];
    if (
      (i.call(this, f, t, n, r, s),
      f.advanceWidth && (t += f.advanceWidth * a),
      s.kerning && c < o.length - 1)
    ) {
      var d = l
        ? this.position.getKerningValue(l, f.index, o[c + 1].index)
        : this.getKerningValue(f, o[c + 1]);
      t += d * a;
    }
    s.letterSpacing ? (t += s.letterSpacing * r) : s.tracking && (t += (s.tracking / 1e3) * r);
  }
  return t;
};
ce.prototype.getPath = function (e, t, n, r, s) {
  var i = new Fe();
  return (
    this.forEachGlyph(e, t, n, r, s, function (a, o, l, u) {
      var c = a.getPath(o, l, u, s, this);
      i.extend(c);
    }),
    i
  );
};
ce.prototype.getPaths = function (e, t, n, r, s) {
  var i = [];
  return (
    this.forEachGlyph(e, t, n, r, s, function (a, o, l, u) {
      var c = a.getPath(o, l, u, s, this);
      i.push(c);
    }),
    i
  );
};
ce.prototype.getAdvanceWidth = function (e, t, n) {
  return this.forEachGlyph(e, 0, 0, t, n, function () {});
};
ce.prototype.draw = function (e, t, n, r, s, i) {
  this.getPath(t, n, r, s, i).draw(e);
};
ce.prototype.drawPoints = function (e, t, n, r, s, i) {
  this.forEachGlyph(t, n, r, s, i, function (a, o, l, u) {
    a.drawPoints(e, o, l, u);
  });
};
ce.prototype.drawMetrics = function (e, t, n, r, s, i) {
  this.forEachGlyph(t, n, r, s, i, function (a, o, l, u) {
    a.drawMetrics(e, o, l, u);
  });
};
ce.prototype.getEnglishName = function (e) {
  var t = this.names[e];
  if (t) return t.en;
};
ce.prototype.validate = function () {
  var e = this;
  function t(r, s) {}
  function n(r) {
    var s = e.getEnglishName(r);
    s && s.trim().length > 0;
  }
  (n("fontFamily"),
    n("weightName"),
    n("manufacturer"),
    n("copyright"),
    n("version"),
    this.unitsPerEm > 0);
};
ce.prototype.toTables = function () {
  return pb.fontToTable(this);
};
ce.prototype.toBuffer = function () {
  return (
    console.warn("Font.toBuffer is deprecated. Use Font.toArrayBuffer instead."),
    this.toArrayBuffer()
  );
};
ce.prototype.toArrayBuffer = function () {
  for (
    var e = this.toTables(),
      t = e.encode(),
      n = new ArrayBuffer(t.length),
      r = new Uint8Array(n),
      s = 0;
    s < t.length;
    s++
  )
    r[s] = t[s];
  return n;
};
ce.prototype.download = function (e) {
  var t = this.getEnglishName("fontFamily"),
    n = this.getEnglishName("fontSubfamily");
  e = e || t.replace(/\s/g, "") + "-" + n + ".otf";
  var r = this.toArrayBuffer();
  if (gb())
    if (((window.URL = window.URL || window.webkitURL), window.URL)) {
      var s = new DataView(r),
        i = new Blob([s], { type: "font/opentype" }),
        a = document.createElement("a");
      ((a.href = window.URL.createObjectURL(i)), (a.download = e));
      var o = document.createEvent("MouseEvents");
      (o.initEvent("click", !0, !1), a.dispatchEvent(o));
    } else console.warn("Font file could not be downloaded. Try using a different browser.");
  else {
    var l = require("fs"),
      u = vb(r);
    l.writeFileSync(e, u);
  }
};
ce.prototype.fsSelectionValues = {
  ITALIC: 1,
  UNDERSCORE: 2,
  NEGATIVE: 4,
  OUTLINED: 8,
  STRIKEOUT: 16,
  BOLD: 32,
  REGULAR: 64,
  USER_TYPO_METRICS: 128,
  WWS: 256,
  OBLIQUE: 512,
};
ce.prototype.usWidthClasses = {
  ULTRA_CONDENSED: 1,
  EXTRA_CONDENSED: 2,
  CONDENSED: 3,
  SEMI_CONDENSED: 4,
  MEDIUM: 5,
  SEMI_EXPANDED: 6,
  EXPANDED: 7,
  EXTRA_EXPANDED: 8,
  ULTRA_EXPANDED: 9,
};
ce.prototype.usWeightClasses = {
  THIN: 100,
  EXTRA_LIGHT: 200,
  LIGHT: 300,
  NORMAL: 400,
  MEDIUM: 500,
  SEMI_BOLD: 600,
  BOLD: 700,
  EXTRA_BOLD: 800,
  BLACK: 900,
};
function hg(e, t) {
  var n = JSON.stringify(e),
    r = 256;
  for (var s in t) {
    var i = parseInt(s);
    if (!(!i || i < 256)) {
      if (JSON.stringify(t[s]) === n) return i;
      r <= i && (r = i + 1);
    }
  }
  return ((t[r] = e), r);
}
function FE(e, t, n) {
  var r = hg(t.name, n);
  return [
    { name: "tag_" + e, type: "TAG", value: t.tag },
    { name: "minValue_" + e, type: "FIXED", value: t.minValue << 16 },
    { name: "defaultValue_" + e, type: "FIXED", value: t.defaultValue << 16 },
    { name: "maxValue_" + e, type: "FIXED", value: t.maxValue << 16 },
    { name: "flags_" + e, type: "USHORT", value: 0 },
    { name: "nameID_" + e, type: "USHORT", value: r },
  ];
}
function ME(e, t, n) {
  var r = {},
    s = new z.Parser(e, t);
  return (
    (r.tag = s.parseTag()),
    (r.minValue = s.parseFixed()),
    (r.defaultValue = s.parseFixed()),
    (r.maxValue = s.parseFixed()),
    s.skip("uShort", 1),
    (r.name = n[s.parseUShort()] || {}),
    r
  );
}
function NE(e, t, n, r) {
  for (
    var s = hg(t.name, r),
      i = [
        { name: "nameID_" + e, type: "USHORT", value: s },
        { name: "flags_" + e, type: "USHORT", value: 0 },
      ],
      a = 0;
    a < n.length;
    ++a
  ) {
    var o = n[a].tag;
    i.push({ name: "axis_" + e + " " + o, type: "FIXED", value: t.coordinates[o] << 16 });
  }
  return i;
}
function RE(e, t, n, r) {
  var s = {},
    i = new z.Parser(e, t);
  ((s.name = r[i.parseUShort()] || {}), i.skip("uShort", 1), (s.coordinates = {}));
  for (var a = 0; a < n.length; ++a) s.coordinates[n[a].tag] = i.parseFixed();
  return s;
}
function OE(e, t) {
  var n = new U.Table("fvar", [
    { name: "version", type: "ULONG", value: 65536 },
    { name: "offsetToData", type: "USHORT", value: 0 },
    { name: "countSizePairs", type: "USHORT", value: 2 },
    { name: "axisCount", type: "USHORT", value: e.axes.length },
    { name: "axisSize", type: "USHORT", value: 20 },
    { name: "instanceCount", type: "USHORT", value: e.instances.length },
    { name: "instanceSize", type: "USHORT", value: 4 + e.axes.length * 4 },
  ]);
  n.offsetToData = n.sizeOf();
  for (var r = 0; r < e.axes.length; r++) n.fields = n.fields.concat(FE(r, e.axes[r], t));
  for (var s = 0; s < e.instances.length; s++)
    n.fields = n.fields.concat(NE(s, e.instances[s], e.axes, t));
  return n;
}
function IE(e, t, n) {
  var r = new z.Parser(e, t),
    s = r.parseULong();
  V.argument(s === 65536, "Unsupported fvar table version.");
  var i = r.parseOffset16();
  r.skip("uShort", 1);
  for (
    var a = r.parseUShort(),
      o = r.parseUShort(),
      l = r.parseUShort(),
      u = r.parseUShort(),
      c = [],
      f = 0;
    f < a;
    f++
  )
    c.push(ME(e, t + i + f * o, n));
  for (var d = [], h = t + i + a * o, m = 0; m < l; m++) d.push(RE(e, h + m * u, c, n));
  return { axes: c, instances: d };
}
var PE = { make: OE, parse: IE },
  DE = function () {
    return {
      coverage: this.parsePointer(w.coverage),
      attachPoints: this.parseList(w.pointer(w.uShortList)),
    };
  },
  UE = function () {
    var e = this.parseUShort();
    if (
      (V.argument(e === 1 || e === 2 || e === 3, "Unsupported CaretValue table version."), e === 1)
    )
      return { coordinate: this.parseShort() };
    if (e === 2) return { pointindex: this.parseShort() };
    if (e === 3) return { coordinate: this.parseShort() };
  },
  AE = function () {
    return this.parseList(w.pointer(UE));
  },
  BE = function () {
    return { coverage: this.parsePointer(w.coverage), ligGlyphs: this.parseList(w.pointer(AE)) };
  },
  $E = function () {
    return (this.parseUShort(), this.parseList(w.pointer(w.coverage)));
  };
function _E(e, t) {
  t = t || 0;
  var n = new w(e, t),
    r = n.parseVersion(1);
  V.argument(r === 1 || r === 1.2 || r === 1.3, "Unsupported GDEF table version.");
  var s = {
    version: r,
    classDef: n.parsePointer(w.classDef),
    attachList: n.parsePointer(DE),
    ligCaretList: n.parsePointer(BE),
    markAttachClassDef: n.parsePointer(w.classDef),
  };
  return (r >= 1.2 && (s.markGlyphSets = n.parsePointer($E)), s);
}
var zE = { parse: _E },
  At = new Array(10);
At[1] = function () {
  var t = this.offset + this.relativeOffset,
    n = this.parseUShort();
  if (n === 1)
    return {
      posFormat: 1,
      coverage: this.parsePointer(w.coverage),
      value: this.parseValueRecord(),
    };
  if (n === 2)
    return {
      posFormat: 2,
      coverage: this.parsePointer(w.coverage),
      values: this.parseValueRecordList(),
    };
  V.assert(!1, "0x" + t.toString(16) + ": GPOS lookup type 1 format must be 1 or 2.");
};
At[2] = function () {
  var t = this.offset + this.relativeOffset,
    n = this.parseUShort();
  V.assert(
    n === 1 || n === 2,
    "0x" + t.toString(16) + ": GPOS lookup type 2 format must be 1 or 2.",
  );
  var r = this.parsePointer(w.coverage),
    s = this.parseUShort(),
    i = this.parseUShort();
  if (n === 1)
    return {
      posFormat: n,
      coverage: r,
      valueFormat1: s,
      valueFormat2: i,
      pairSets: this.parseList(
        w.pointer(
          w.list(function () {
            return {
              secondGlyph: this.parseUShort(),
              value1: this.parseValueRecord(s),
              value2: this.parseValueRecord(i),
            };
          }),
        ),
      ),
    };
  if (n === 2) {
    var a = this.parsePointer(w.classDef),
      o = this.parsePointer(w.classDef),
      l = this.parseUShort(),
      u = this.parseUShort();
    return {
      posFormat: n,
      coverage: r,
      valueFormat1: s,
      valueFormat2: i,
      classDef1: a,
      classDef2: o,
      class1Count: l,
      class2Count: u,
      classRecords: this.parseList(
        l,
        w.list(u, function () {
          return { value1: this.parseValueRecord(s), value2: this.parseValueRecord(i) };
        }),
      ),
    };
  }
};
At[3] = function () {
  return { error: "GPOS Lookup 3 not supported" };
};
At[4] = function () {
  return { error: "GPOS Lookup 4 not supported" };
};
At[5] = function () {
  return { error: "GPOS Lookup 5 not supported" };
};
At[6] = function () {
  return { error: "GPOS Lookup 6 not supported" };
};
At[7] = function () {
  return { error: "GPOS Lookup 7 not supported" };
};
At[8] = function () {
  return { error: "GPOS Lookup 8 not supported" };
};
At[9] = function () {
  return { error: "GPOS Lookup 9 not supported" };
};
function jE(e, t) {
  t = t || 0;
  var n = new w(e, t),
    r = n.parseVersion(1);
  return (
    V.argument(r === 1 || r === 1.1, "Unsupported GPOS table version " + r),
    r === 1
      ? {
          version: r,
          scripts: n.parseScriptList(),
          features: n.parseFeatureList(),
          lookups: n.parseLookupList(At),
        }
      : {
          version: r,
          scripts: n.parseScriptList(),
          features: n.parseFeatureList(),
          lookups: n.parseLookupList(At),
          variations: n.parseFeatureVariationsList(),
        }
  );
}
var GE = new Array(10);
function HE(e) {
  return new U.Table("GPOS", [
    { name: "version", type: "ULONG", value: 65536 },
    { name: "scripts", type: "TABLE", value: new U.ScriptList(e.scripts) },
    { name: "features", type: "TABLE", value: new U.FeatureList(e.features) },
    { name: "lookups", type: "TABLE", value: new U.LookupList(e.lookups, GE) },
  ]);
}
var WE = { parse: jE, make: HE };
function VE(e) {
  var t = {};
  e.skip("uShort");
  var n = e.parseUShort();
  (V.argument(n === 0, "Unsupported kern sub-table version."), e.skip("uShort", 2));
  var r = e.parseUShort();
  e.skip("uShort", 3);
  for (var s = 0; s < r; s += 1) {
    var i = e.parseUShort(),
      a = e.parseUShort(),
      o = e.parseShort();
    t[i + "," + a] = o;
  }
  return t;
}
function KE(e) {
  var t = {};
  e.skip("uShort");
  var n = e.parseULong();
  (n > 1 && console.warn("Only the first kern subtable is supported."), e.skip("uLong"));
  var r = e.parseUShort(),
    s = r & 255;
  if ((e.skip("uShort"), s === 0)) {
    var i = e.parseUShort();
    e.skip("uShort", 3);
    for (var a = 0; a < i; a += 1) {
      var o = e.parseUShort(),
        l = e.parseUShort(),
        u = e.parseShort();
      t[o + "," + l] = u;
    }
  }
  return t;
}
function qE(e, t) {
  var n = new z.Parser(e, t),
    r = n.parseUShort();
  if (r === 0) return VE(n);
  if (r === 1) return KE(n);
  throw new Error("Unsupported kern table version (" + r + ").");
}
var XE = { parse: qE };
function ZE(e, t, n, r) {
  for (
    var s = new z.Parser(e, t), i = r ? s.parseUShort : s.parseULong, a = [], o = 0;
    o < n + 1;
    o += 1
  ) {
    var l = i.call(s);
    (r && (l *= 2), a.push(l));
  }
  return a;
}
var YE = { parse: ZE };
function QE(e, t) {
  var n = require("fs");
  n.readFile(e, function (r, s) {
    if (r) return t(r.message);
    t(null, tg(s));
  });
}
function JE(e, t) {
  var n = new XMLHttpRequest();
  (n.open("get", e, !0),
    (n.responseType = "arraybuffer"),
    (n.onload = function () {
      return n.response ? t(null, n.response) : t("Font could not be loaded: " + n.statusText);
    }),
    (n.onerror = function () {
      t("Font could not be loaded");
    }),
    n.send());
}
function ih(e, t) {
  for (var n = [], r = 12, s = 0; s < t; s += 1) {
    var i = z.getTag(e, r),
      a = z.getULong(e, r + 4),
      o = z.getULong(e, r + 8),
      l = z.getULong(e, r + 12);
    (n.push({ tag: i, checksum: a, offset: o, length: l, compression: !1 }), (r += 16));
  }
  return n;
}
function e4(e, t) {
  for (var n = [], r = 44, s = 0; s < t; s += 1) {
    var i = z.getTag(e, r),
      a = z.getULong(e, r + 4),
      o = z.getULong(e, r + 8),
      l = z.getULong(e, r + 12),
      u = void 0;
    (o < l ? (u = "WOFF") : (u = !1),
      n.push({ tag: i, offset: a, compression: u, compressedLength: o, length: l }),
      (r += 20));
  }
  return n;
}
function Ee(e, t) {
  if (t.compression === "WOFF") {
    var n = new Uint8Array(e.buffer, t.offset + 2, t.compressedLength - 2),
      r = new Uint8Array(t.length);
    if ((WS(n, r), r.byteLength !== t.length))
      throw new Error(
        "Decompression error: " + t.tag + " decompressed length doesn't match recorded length",
      );
    var s = new DataView(r.buffer, 0);
    return { data: s, offset: 0 };
  } else return { data: e, offset: t.offset };
}
function Wc(e, t) {
  t = t ?? {};
  var n,
    r,
    s = new ce({ empty: !0 }),
    i = new DataView(e, 0),
    a,
    o = [],
    l = z.getTag(i, 0);
  if (l === "\0\0\0" || l === "true" || l === "typ1")
    ((s.outlinesFormat = "truetype"), (a = z.getUShort(i, 4)), (o = ih(i, a)));
  else if (l === "OTTO") ((s.outlinesFormat = "cff"), (a = z.getUShort(i, 4)), (o = ih(i, a)));
  else if (l === "wOFF") {
    var u = z.getTag(i, 4);
    if (u === "\0\0\0") s.outlinesFormat = "truetype";
    else if (u === "OTTO") s.outlinesFormat = "cff";
    else throw new Error("Unsupported OpenType flavor " + l);
    ((a = z.getUShort(i, 12)), (o = e4(i, a)));
  } else throw new Error("Unsupported OpenType signature " + l);
  for (var c, f, d, h, m, x, k, p, g, v, S, b, L = 0; L < a; L += 1) {
    var T = o[L],
      E = void 0;
    switch (T.tag) {
      case "cmap":
        ((E = Ee(i, T)),
          (s.tables.cmap = M0.parse(E.data, E.offset)),
          (s.encoding = new R0(s.tables.cmap)));
        break;
      case "cvt ":
        ((E = Ee(i, T)),
          (b = new z.Parser(E.data, E.offset)),
          (s.tables.cvt = b.parseShortList(T.length / 2)));
        break;
      case "fvar":
        f = T;
        break;
      case "fpgm":
        ((E = Ee(i, T)),
          (b = new z.Parser(E.data, E.offset)),
          (s.tables.fpgm = b.parseByteList(T.length)));
        break;
      case "head":
        ((E = Ee(i, T)),
          (s.tables.head = z0.parse(E.data, E.offset)),
          (s.unitsPerEm = s.tables.head.unitsPerEm),
          (n = s.tables.head.indexToLocFormat));
        break;
      case "hhea":
        ((E = Ee(i, T)),
          (s.tables.hhea = j0.parse(E.data, E.offset)),
          (s.ascender = s.tables.hhea.ascender),
          (s.descender = s.tables.hhea.descender),
          (s.numberOfHMetrics = s.tables.hhea.numberOfHMetrics));
        break;
      case "hmtx":
        k = T;
        break;
      case "ltag":
        ((E = Ee(i, T)), (r = H0.parse(E.data, E.offset)));
        break;
      case "maxp":
        ((E = Ee(i, T)),
          (s.tables.maxp = W0.parse(E.data, E.offset)),
          (s.numGlyphs = s.tables.maxp.numGlyphs));
        break;
      case "name":
        v = T;
        break;
      case "OS/2":
        ((E = Ee(i, T)), (s.tables.os2 = xu.parse(E.data, E.offset)));
        break;
      case "post":
        ((E = Ee(i, T)),
          (s.tables.post = Y0.parse(E.data, E.offset)),
          (s.glyphNames = new Bc(s.tables.post)));
        break;
      case "prep":
        ((E = Ee(i, T)),
          (b = new z.Parser(E.data, E.offset)),
          (s.tables.prep = b.parseByteList(T.length)));
        break;
      case "glyf":
        d = T;
        break;
      case "loca":
        g = T;
        break;
      case "CFF ":
        c = T;
        break;
      case "kern":
        p = T;
        break;
      case "GDEF":
        h = T;
        break;
      case "GPOS":
        m = T;
        break;
      case "GSUB":
        x = T;
        break;
      case "meta":
        S = T;
        break;
    }
  }
  var I = Ee(i, v);
  if (((s.tables.name = Z0.parse(I.data, I.offset, r)), (s.names = s.tables.name), d && g)) {
    var P = n === 0,
      q = Ee(i, g),
      Q = YE.parse(q.data, q.offset, s.numGlyphs, P),
      te = Ee(i, d);
    s.glyphs = ig.parse(te.data, te.offset, Q, s, t);
  } else if (c) {
    var ee = Ee(i, c);
    _0.parse(ee.data, ee.offset, s, t);
  } else throw new Error("Font doesn't contain TrueType or CFF outlines.");
  var ae = Ee(i, k);
  if (
    (G0.parse(s, ae.data, ae.offset, s.numberOfHMetrics, s.numGlyphs, s.glyphs, t), dw(s, t), p)
  ) {
    var oe = Ee(i, p);
    s.kerningPairs = XE.parse(oe.data, oe.offset);
  } else s.kerningPairs = {};
  if (h) {
    var le = Ee(i, h);
    s.tables.gdef = zE.parse(le.data, le.offset);
  }
  if (m) {
    var O = Ee(i, m);
    ((s.tables.gpos = WE.parse(O.data, O.offset)), s.position.init());
  }
  if (x) {
    var B = Ee(i, x);
    s.tables.gsub = Q0.parse(B.data, B.offset);
  }
  if (f) {
    var R = Ee(i, f);
    s.tables.fvar = PE.parse(R.data, R.offset, s.names);
  }
  if (S) {
    var A = Ee(i, S);
    ((s.tables.meta = J0.parse(A.data, A.offset)), (s.metas = s.tables.meta));
  }
  return s;
}
function t4(e, t, n) {
  n = n ?? {};
  var r = typeof window > "u",
    s = r && !n.isUrl ? QE : JE;
  return new Promise(function (i, a) {
    s(e, function (o, l) {
      if (o) {
        if (t) return t(o);
        a(o);
      }
      var u;
      try {
        u = Wc(l, n);
      } catch (c) {
        if (t) return t(c, null);
        a(c);
      }
      if (t) return t(null, u);
      i(u);
    });
  });
}
function n4(e, t) {
  var n = require("fs"),
    r = n.readFileSync(e);
  return Wc(tg(r), t);
}
var ii = Object.freeze({
  __proto__: null,
  Font: ce,
  Glyph: dt,
  Path: Fe,
  BoundingBox: hn,
  _parse: z,
  parse: Wc,
  load: t4,
  loadSync: n4,
});
const vs = vk;
class r4 {
  constructor(t) {
    pn(this, "fonts", new Map());
    pn(this, "pending", new Map());
    pn(this, "extDone", new Set());
    pn(this, "extPending", new Map());
    pn(this, "extWanted", !1);
    pn(this, "version", 0);
    pn(this, "listeners", new Set());
    this.loader = t;
  }
  setTexts(...t) {
    !this.extWanted && t.some((n) => !!n && Sk(n)) && ((this.extWanted = !0), this.notify());
  }
  wantExt(t = !0) {
    ((this.extWanted = t), this.notify());
  }
  subscribe(t) {
    return (this.listeners.add(t), () => void this.listeners.delete(t));
  }
  notify() {
    this.listeners.size && queueMicrotask(() => this.listeners.forEach((t) => t()));
  }
  get needsExt() {
    return this.extWanted;
  }
  has(t) {
    const n = vs(t);
    return this.fonts.has(n) && (!this.extWanted || this.extDone.has(n));
  }
  get(t) {
    const n = this.fonts.get(vs(t));
    if (!n) throw new Error(`Schrift nicht geladen: ${vs(t)} (vorher ensure() aufrufen)`);
    return n;
  }
  async ensure(t, n) {
    (n && this.setTexts(...n),
      await Promise.all(
        t.map((r) => this.load(r).then((s) => (this.extWanted ? this.loadExt(r, s) : void 0))),
      ));
  }
  load(t) {
    const n = vs(t),
      r = this.fonts.get(n);
    if (r) return Promise.resolve(r);
    let s = this.pending.get(n);
    return (
      s ||
        ((s = this.loader(gk(t)).then((i) => {
          const a = ii.parse(i);
          return (this.fonts.set(n, a), this.pending.delete(n), a);
        })),
        this.pending.set(n, s)),
      s
    );
  }
  loadExt(t, n) {
    const r = vs(t);
    if (this.extDone.has(r)) return Promise.resolve();
    let s = this.extPending.get(r);
    if (!s) {
      const i = yk(t);
      ((s = (
        i
          ? this.loader(i).then(
              (a) => void s4(n, ii.parse(a)),
              () => {},
            )
          : Promise.resolve()
      ).then(() => {
        (Su.delete(n),
          this.version++,
          this.extDone.add(r),
          this.extPending.delete(r),
          this.notify());
      })),
        this.extPending.set(r, s));
    }
    return s;
  }
}
function s4(e, t) {
  var o, l;
  if (e.unitsPerEm !== t.unitsPerEm) return 0;
  const n = (o = e.tables.cmap) == null ? void 0 : o.glyphIndexMap,
    r = (l = t.tables.cmap) == null ? void 0 : l.glyphIndexMap;
  if (!n || !r) return 0;
  const s = e.glyphs,
    i = new Map();
  let a = 0;
  for (const [u, c] of Object.entries(r)) {
    const f = Number(u);
    if (n[f] || !c) continue;
    let d = i.get(c);
    if (d === void 0) {
      const h = s.length;
      ((s.glyphs[h] = () => {
        const m = t.glyphs.get(c);
        return ((m.index = h), m);
      }),
        (d = h),
        s.length++,
        i.set(c, d));
    }
    ((n[f] = d), a++);
  }
  return ((e.numGlyphs = s.length), a);
}
function CL(e = "./") {
  return new r4(async (t) => {
    const n = await fetch(`${e}fonts/brand/${t}`);
    if (!n.ok) throw new Error(`Schrift konnte nicht geladen werden: ${t}`);
    return n.arrayBuffer();
  });
}
function LL(e, t, n) {
  var i;
  const r = n ? Yn(n) : void 0;
  let s = t;
  switch (
    (r != null && r.capsOnly && (s = "upper"),
    r != null && r.noCaps && s === "upper" && (s = "title"),
    s)
  ) {
    case "upper":
      return (n && (i = go[n]) != null && i.capSharpS ? e.replace(/ß/g, "ẞ") : e).toLocaleUpperCase(
        "de-AT",
      );
    case "lower":
      return e.toLocaleLowerCase("de-AT");
    case "title":
      return e.replace(/\S+/g, (a) => a.charAt(0).toLocaleUpperCase("de-AT") + a.slice(1));
    default:
      return e;
  }
}
function pg(e) {
  return e.normalize("NFC").replace(/[\u2013\u2014]/g, "-");
}
function ah(e, t) {
  return /\s/.test(t) || e.charToGlyphIndex(t) > 0;
}
function Vc(e, t, n) {
  const r = [];
  for (const s of Array.from(t)) {
    const i = ah(e, s) ? e : (n.find((o) => ah(o, s)) ?? null),
      a = r[r.length - 1];
    a && a.font === i ? (a.text += s) : r.push({ font: i, text: s });
  }
  return r;
}
function mg(e, t, n) {
  return t === e ? n : (n * ai(e, 1)) / ai(t, 1);
}
function gg(e, t, n, r) {
  const s = ai(e, r),
    i = s * 0.62,
    a = Math.max(s * 0.08, 0.5),
    o = new ii.Path(),
    l = (c, f, d, h, m) => {
      (o.moveTo(c, f),
        m
          ? (o.lineTo(d, f), o.lineTo(d, h), o.lineTo(c, h))
          : (o.lineTo(c, h), o.lineTo(d, h), o.lineTo(d, f)),
        o.close());
    },
    u = t + s * 0.08;
  return (
    l(u, n - s, u + i, n, !0),
    l(u + a, n - s + a, u + i - a, n - a, !1),
    { path: o, advance: i + s * 0.16 }
  );
}
function vg(e, t, n, r, s, i) {
  if (t.length === 1 && t[0].font === e)
    return e.getPath(t[0].text, n, r, s, { kerning: !0, letterSpacing: i });
  const a = new ii.Path();
  let o = n;
  for (const l of t) {
    if (!l.font) {
      for (const f of Array.from(l.text)) {
        const d = gg(e, o, r, s);
        (a.extend(d.path), (o += d.advance + i * s));
      }
      continue;
    }
    const u = mg(e, l.font, s),
      c = { kerning: !0, letterSpacing: (i * s) / u };
    (a.extend(l.font.getPath(l.text, o, r, u, c)), (o += l.font.getAdvanceWidth(l.text, u, c)));
  }
  return a;
}
function yg(e, t, n, r) {
  let s = 0;
  for (const i of t) {
    if (!i.font) {
      s += Array.from(i.text).length * (gg(e, 0, 0, n).advance + r * n);
      continue;
    }
    const a = mg(e, i.font, n);
    s += i.font.getAdvanceWidth(i.text, a, { kerning: !0, letterSpacing: (r * n) / a });
  }
  return s;
}
const oh = new WeakMap();
let i4 = 1;
const a4 = (e) => {
  let t = oh.get(e);
  return (t || oh.set(e, (t = i4++)), t);
};
function FL(e, t, n, r = 0, s = []) {
  const i = pg(t);
  let a = Su.get(e);
  a || Su.set(e, (a = new Map()));
  const o = `${i}\0${n.toFixed(3)}\0${r}\0${s.map(a4).join(",")}`,
    l = a.get(o);
  if (l) return l;
  const u = Vc(e, i, s),
    c = xg(e, i, n, r),
    f = (x, k) => (c > 0 ? l4(e, i, s, x, k, n, r, c) : vg(e, u, x, k, n, r)),
    d = f(0, 0).getBoundingBox();
  let h;
  const m = o4(e, i, n, r, s);
  return (
    !isFinite(d.x1) || d.x2 - d.x1 <= 0
      ? (h = { d: "", width: 0, height: 0, ascent: 0, left: 0, advance: m })
      : (h = {
          d: f(-d.x1, -d.y1).toPathData(1),
          width: d.x2 - d.x1,
          height: d.y2 - d.y1,
          ascent: -d.y1,
          left: d.x1,
          advance: m,
        }),
    a.size > 800 && a.clear(),
    a.set(o, h),
    h
  );
}
const Su = new WeakMap();
function o4(e, t, n, r = 0, s = []) {
  const i = pg(t),
    a = Vc(e, i, s),
    o = (i.match(/ /g) ?? []).length * xg(e, i, n, r);
  return a.length <= 1 && (!a.length || a[0].font === e)
    ? e.getAdvanceWidth(i, n, { kerning: !0, letterSpacing: r }) + o
    : yg(e, a, n, r) + o;
}
function xg(e, t, n, r) {
  if (!t.includes(" ") || !t.trim().includes(" ")) return 0;
  const s = new RegExp("\\p{L}", "u").test(t) && t === t.toLocaleUpperCase("de-AT"),
    i = ai(e, n) * (s ? 0.5 : 0.33) - Math.min(0, r) * n,
    a = e.getAdvanceWidth(" ", n, { letterSpacing: r });
  return Math.max(0, i - a);
}
function l4(e, t, n, r, s, i, a, o) {
  const l = new ii.Path();
  let u = r;
  const c = t.split(" ");
  return (
    c.forEach((f, d) => {
      if (f) {
        const h = Vc(e, f, n);
        (l.extend(vg(e, h, u, s, i, a)),
          (u +=
            h.length <= 1 && (!h.length || h[0].font === e)
              ? e.getAdvanceWidth(f, i, { kerning: !0, letterSpacing: a })
              : yg(e, h, i, a)));
      }
      d < c.length - 1 && (u += e.getAdvanceWidth(" ", i, { letterSpacing: a }) + o);
    }),
    l
  );
}
function ai(e, t) {
  const n = e.tables.os2;
  return (((n == null ? void 0 : n.sCapHeight) || e.ascender * 0.7) / e.unitsPerEm) * t;
}
const wu = 100,
  ha = 24;
function u4(e) {
  const t = [];
  let n = 0,
    r = 0,
    s = 0,
    i = 0;
  const a = (o, l) => {
    const u = Math.max(2, Math.ceil(l / 1.2));
    for (let c = 1; c <= u; c++) t.push(o(c / u));
  };
  for (const o of e.commands)
    if (o.type === "M") ((n = s = o.x), (r = i = o.y), t.push([n, r]));
    else if (o.type === "L" || o.type === "Z") {
      const l = o.type === "Z" ? s : o.x,
        u = o.type === "Z" ? i : o.y,
        c = n,
        f = r;
      (a((d) => [c + (l - c) * d, f + (u - f) * d], Math.hypot(l - c, u - f)), (n = l), (r = u));
    } else if (o.type === "Q") {
      const l = n,
        u = r;
      (a(
        (c) => {
          const f = 1 - c;
          return [
            f * f * l + 2 * f * c * o.x1 + c * c * o.x,
            f * f * u + 2 * f * c * o.y1 + c * c * o.y,
          ];
        },
        Math.hypot(o.x1 - l, o.y1 - u) + Math.hypot(o.x - o.x1, o.y - o.y1),
      ),
        (n = o.x),
        (r = o.y));
    } else if (o.type === "C") {
      const l = n,
        u = r;
      (a(
        (c) => {
          const f = 1 - c;
          return [
            f * f * f * l + 3 * f * f * c * o.x1 + 3 * f * c * c * o.x2 + c * c * c * o.x,
            f * f * f * u + 3 * f * f * c * o.y1 + 3 * f * c * c * o.y2 + c * c * c * o.y,
          ];
        },
        Math.hypot(o.x1 - l, o.y1 - u) +
          Math.hypot(o.x2 - o.x1, o.y2 - o.y1) +
          Math.hypot(o.x - o.x2, o.y - o.y2),
      ),
        (n = o.x),
        (r = o.y));
    }
  return t;
}
function c4(e, t) {
  const n = u4(e.getPath(t, 0, 0, wu));
  if (!n.length) return { ch: t, minX: 0, maxX: 0, minY: 0, maxY: 0, pts: n };
  let r = 1 / 0,
    s = -1 / 0,
    i = 1 / 0,
    a = -1 / 0;
  for (const [o, l] of n)
    ((r = Math.min(r, o)), (s = Math.max(s, o)), (i = Math.min(i, l)), (a = Math.max(a, l)));
  return { ch: t, minX: r, maxX: s, minY: i, maxY: a, pts: n };
}
function lh(e, t, n) {
  const r = -t * 1.02,
    s = (t * 1.04) / ha,
    i = new Array(ha).fill(null);
  for (const [a, o] of e.pts) {
    const l = Math.floor((o - r) / s);
    if (l < 0 || l >= ha) continue;
    const u = i[l];
    u === null ? (i[l] = a) : (i[l] = n === "right" ? Math.max(u, a) : Math.min(u, a));
  }
  return i;
}
const f4 = {
  sans: { target: 0.14, min: 0.07 },
  display: { target: 0.11, min: 0.06 },
  serif: { target: 0.12, min: 0.045 },
  script: { target: -0.04, min: -0.3 },
};
function d4(e, t, n, r) {
  const s = lh(e, n, "right"),
    i = lh(t, n, "left"),
    a = [];
  for (let f = 0; f < ha; f++) {
    const d = s[f],
      h = i[f];
    d !== null && h !== null && a.push(h - d);
  }
  const o = f4[r];
  if (a.length < 4) return e.maxX - t.minX + o.target * n;
  const l = Math.min(...a),
    u = a.reduce((f, d) => f + d, 0) / a.length;
  let c = o.target * n - (0.5 * l + 0.5 * u);
  return (l + c < o.min * n && (c = o.min * n - l), c);
}
function h4(e) {
  return Array.from(e.replace(/\s+/g, ""))
    .slice(0, 2)
    .map((n) => n.toLocaleUpperCase("de-AT").charAt(0))
    .join("");
}
function p4(e, t, n, r, s = "sans") {
  const i = Array.from(h4(t));
  if (!i.length) return "";
  const a = ai(e, wu),
    o = i.map((I) => c4(e, I)),
    l = [0];
  o.length === 2 && l.push(d4(o[0], o[1], a, s));
  let u = 1 / 0,
    c = -1 / 0,
    f = 1 / 0,
    d = -1 / 0;
  if (
    (o.forEach((I, P) => {
      I.pts.length &&
        ((u = Math.min(u, I.minX + l[P])),
        (c = Math.max(c, I.maxX + l[P])),
        (f = Math.min(f, I.minY)),
        (d = Math.max(d, I.maxY)));
    }),
    !isFinite(u))
  )
    return "";
  let h = -a,
    m = 0;
  s === "script"
    ? ((h = f), (m = d))
    : (f < -a * 1.1 && (h = (-a + f) / 2), d > a * 0.08 && (m = d / 2));
  const x = m - h,
    k = c - u,
    p = d - f,
    g = o.length === 1,
    v = Math.min(
      (n.w * (g ? 0.72 : s === "script" ? 0.92 : 0.84)) / k,
      (n.h * (g || s === "script" ? 0.66 : 0.6)) / x,
      (n.h * 0.9) / p,
    ),
    S = n.x + n.w / 2,
    b = n.y + n.h / 2,
    L = S - ((u + c) / 2) * v,
    T = b - ((h + m) / 2) * v;
  return `<path d="${o.map((I, P) => e.getPath(I.ch, L + l[P] * v, T, wu * v).toPathData(2)).join("")}" fill="${r}"/>`;
}
const uh = new Set([
    "gmbh",
    "mbh",
    "ag",
    "kg",
    "og",
    "eu",
    "e.u.",
    "gesmbh",
    "ges.m.b.h.",
    "co",
    "co.",
    "&",
    "und",
    "ltd",
    "inc",
    "se",
    "gbr",
    "ohg",
    "kgaa",
  ]),
  m4 = new Set([
    "dr",
    "dra",
    "drin",
    "mag",
    "maga",
    "mmaga",
    "ing",
    "inga",
    "di",
    "dipl",
    "prof",
    "mba",
    "msc",
    "bsc",
    "ba",
    "ma",
    "mmag",
    "dkfm",
    "kr",
    "ddr",
    "llm",
  ]);
function ML(e) {
  const t = e
      .split(/[\s,/+]+/)
      .map((r) => r.trim())
      .filter((r) => {
        if (!r) return !1;
        const s = r.toLocaleLowerCase("de-AT").replace(/\.$/, "");
        return uh.has(s) || uh.has(r.toLocaleLowerCase("de-AT")) || m4.has(s.replace(/\./g, ""))
          ? !1
          : new RegExp("\\p{L}", "u").test(r);
      }),
    n = (r) => {
      const s = r.match(new RegExp("\\p{L}", "u"));
      return s ? s[0].toLocaleUpperCase("de-AT").charAt(0) : "";
    };
  if (!t.length) {
    const r = e.match(/[\p{L}\p{N}]/u);
    return r ? r[0].toLocaleUpperCase("de-AT").charAt(0) : "";
  }
  return t.length === 1 ? n(t[0]) : n(t[0]) + n(t[t.length - 1]);
}
class Kn {
  constructor(t, n) {
    ((this.next = null), (this.key = t), (this.data = n), (this.left = null), (this.right = null));
  }
}
function g4(e, t) {
  return e > t ? 1 : e < t ? -1 : 0;
}
function Tn(e, t, n) {
  const r = new Kn(null, null);
  let s = r,
    i = r;
  for (;;) {
    const a = n(e, t.key);
    if (a < 0) {
      if (t.left === null) break;
      if (n(e, t.left.key) < 0) {
        const o = t.left;
        if (((t.left = o.right), (o.right = t), (t = o), t.left === null)) break;
      }
      ((i.left = t), (i = t), (t = t.left));
    } else if (a > 0) {
      if (t.right === null) break;
      if (n(e, t.right.key) > 0) {
        const o = t.right;
        if (((t.right = o.left), (o.left = t), (t = o), t.right === null)) break;
      }
      ((s.right = t), (s = t), (t = t.right));
    } else break;
  }
  return ((s.right = t.left), (i.left = t.right), (t.left = r.right), (t.right = r.left), t);
}
function fl(e, t, n, r) {
  const s = new Kn(e, t);
  if (n === null) return ((s.left = s.right = null), s);
  n = Tn(e, n, r);
  const i = r(e, n.key);
  return (
    i < 0
      ? ((s.left = n.left), (s.right = n), (n.left = null))
      : i >= 0 && ((s.right = n.right), (s.left = n), (n.right = null)),
    s
  );
}
function ch(e, t, n) {
  let r = null,
    s = null;
  if (t) {
    t = Tn(e, t, n);
    const i = n(t.key, e);
    i === 0
      ? ((r = t.left), (s = t.right))
      : i < 0
        ? ((s = t.right), (t.right = null), (r = t))
        : ((r = t.left), (t.left = null), (s = t));
  }
  return { left: r, right: s };
}
function v4(e, t, n) {
  return t === null ? e : (e === null || ((t = Tn(e.key, t, n)), (t.left = e)), t);
}
function bu(e, t, n, r, s) {
  if (e) {
    r(`${t}${n ? "└── " : "├── "}${s(e)}
`);
    const i = t + (n ? "    " : "│   ");
    (e.left && bu(e.left, i, !1, r, s), e.right && bu(e.right, i, !0, r, s));
  }
}
class Kc {
  constructor(t = g4) {
    ((this._root = null), (this._size = 0), (this._comparator = t));
  }
  insert(t, n) {
    return (this._size++, (this._root = fl(t, n, this._root, this._comparator)));
  }
  add(t, n) {
    const r = new Kn(t, n);
    this._root === null && ((r.left = r.right = null), this._size++, (this._root = r));
    const s = this._comparator,
      i = Tn(t, this._root, s),
      a = s(t, i.key);
    return (
      a === 0
        ? (this._root = i)
        : (a < 0
            ? ((r.left = i.left), (r.right = i), (i.left = null))
            : a > 0 && ((r.right = i.right), (r.left = i), (i.right = null)),
          this._size++,
          (this._root = r)),
      this._root
    );
  }
  remove(t) {
    this._root = this._remove(t, this._root, this._comparator);
  }
  _remove(t, n, r) {
    let s;
    return n === null
      ? null
      : ((n = Tn(t, n, r)),
        r(t, n.key) === 0
          ? (n.left === null ? (s = n.right) : ((s = Tn(t, n.left, r)), (s.right = n.right)),
            this._size--,
            s)
          : n);
  }
  pop() {
    let t = this._root;
    if (t) {
      for (; t.left; ) t = t.left;
      return (
        (this._root = Tn(t.key, this._root, this._comparator)),
        (this._root = this._remove(t.key, this._root, this._comparator)),
        { key: t.key, data: t.data }
      );
    }
    return null;
  }
  findStatic(t) {
    let n = this._root;
    const r = this._comparator;
    for (; n; ) {
      const s = r(t, n.key);
      if (s === 0) return n;
      s < 0 ? (n = n.left) : (n = n.right);
    }
    return null;
  }
  find(t) {
    return this._root &&
      ((this._root = Tn(t, this._root, this._comparator)),
      this._comparator(t, this._root.key) !== 0)
      ? null
      : this._root;
  }
  contains(t) {
    let n = this._root;
    const r = this._comparator;
    for (; n; ) {
      const s = r(t, n.key);
      if (s === 0) return !0;
      s < 0 ? (n = n.left) : (n = n.right);
    }
    return !1;
  }
  forEach(t, n) {
    let r = this._root;
    const s = [];
    let i = !1;
    for (; !i; )
      r !== null
        ? (s.push(r), (r = r.left))
        : s.length !== 0
          ? ((r = s.pop()), t.call(n, r), (r = r.right))
          : (i = !0);
    return this;
  }
  range(t, n, r, s) {
    const i = [],
      a = this._comparator;
    let o = this._root,
      l;
    for (; i.length !== 0 || o; )
      if (o) (i.push(o), (o = o.left));
      else {
        if (((o = i.pop()), (l = a(o.key, n)), l > 0)) break;
        if (a(o.key, t) >= 0 && r.call(s, o)) return this;
        o = o.right;
      }
    return this;
  }
  keys() {
    const t = [];
    return (
      this.forEach(({ key: n }) => {
        t.push(n);
      }),
      t
    );
  }
  values() {
    const t = [];
    return (
      this.forEach(({ data: n }) => {
        t.push(n);
      }),
      t
    );
  }
  min() {
    return this._root ? this.minNode(this._root).key : null;
  }
  max() {
    return this._root ? this.maxNode(this._root).key : null;
  }
  minNode(t = this._root) {
    if (t) for (; t.left; ) t = t.left;
    return t;
  }
  maxNode(t = this._root) {
    if (t) for (; t.right; ) t = t.right;
    return t;
  }
  at(t) {
    let n = this._root,
      r = !1,
      s = 0;
    const i = [];
    for (; !r; )
      if (n) (i.push(n), (n = n.left));
      else if (i.length > 0) {
        if (((n = i.pop()), s === t)) return n;
        (s++, (n = n.right));
      } else r = !0;
    return null;
  }
  next(t) {
    let n = this._root,
      r = null;
    if (t.right) {
      for (r = t.right; r.left; ) r = r.left;
      return r;
    }
    const s = this._comparator;
    for (; n; ) {
      const i = s(t.key, n.key);
      if (i === 0) break;
      i < 0 ? ((r = n), (n = n.left)) : (n = n.right);
    }
    return r;
  }
  prev(t) {
    let n = this._root,
      r = null;
    if (t.left !== null) {
      for (r = t.left; r.right; ) r = r.right;
      return r;
    }
    const s = this._comparator;
    for (; n; ) {
      const i = s(t.key, n.key);
      if (i === 0) break;
      i < 0 ? (n = n.left) : ((r = n), (n = n.right));
    }
    return r;
  }
  clear() {
    return ((this._root = null), (this._size = 0), this);
  }
  toList() {
    return x4(this._root);
  }
  load(t, n = [], r = !1) {
    let s = t.length;
    const i = this._comparator;
    if ((r && Cu(t, n, 0, s - 1, i), this._root === null))
      ((this._root = Eu(t, n, 0, s)), (this._size = s));
    else {
      const a = k4(this.toList(), y4(t, n), i);
      ((s = this._size + s), (this._root = Tu({ head: a }, 0, s)));
    }
    return this;
  }
  isEmpty() {
    return this._root === null;
  }
  get size() {
    return this._size;
  }
  get root() {
    return this._root;
  }
  toString(t = (n) => String(n.key)) {
    const n = [];
    return (bu(this._root, "", !0, (r) => n.push(r), t), n.join(""));
  }
  update(t, n, r) {
    const s = this._comparator;
    let { left: i, right: a } = ch(t, this._root, s);
    (s(t, n) < 0 ? (a = fl(n, r, a, s)) : (i = fl(n, r, i, s)), (this._root = v4(i, a, s)));
  }
  split(t) {
    return ch(t, this._root, this._comparator);
  }
  *[Symbol.iterator]() {
    let t = this._root;
    const n = [];
    let r = !1;
    for (; !r; )
      t !== null
        ? (n.push(t), (t = t.left))
        : n.length !== 0
          ? ((t = n.pop()), yield t, (t = t.right))
          : (r = !0);
  }
}
function Eu(e, t, n, r) {
  const s = r - n;
  if (s > 0) {
    const i = n + Math.floor(s / 2),
      a = e[i],
      o = t[i],
      l = new Kn(a, o);
    return ((l.left = Eu(e, t, n, i)), (l.right = Eu(e, t, i + 1, r)), l);
  }
  return null;
}
function y4(e, t) {
  const n = new Kn(null, null);
  let r = n;
  for (let s = 0; s < e.length; s++) r = r.next = new Kn(e[s], t[s]);
  return ((r.next = null), n.next);
}
function x4(e) {
  let t = e;
  const n = [];
  let r = !1;
  const s = new Kn(null, null);
  let i = s;
  for (; !r; )
    t
      ? (n.push(t), (t = t.left))
      : n.length > 0
        ? ((t = i = i.next = n.pop()), (t = t.right))
        : (r = !0);
  return ((i.next = null), s.next);
}
function Tu(e, t, n) {
  const r = n - t;
  if (r > 0) {
    const s = t + Math.floor(r / 2),
      i = Tu(e, t, s),
      a = e.head;
    return ((a.left = i), (e.head = e.head.next), (a.right = Tu(e, s + 1, n)), a);
  }
  return null;
}
function k4(e, t, n) {
  const r = new Kn(null, null);
  let s = r,
    i = e,
    a = t;
  for (; i !== null && a !== null; )
    (n(i.key, a.key) < 0 ? ((s.next = i), (i = i.next)) : ((s.next = a), (a = a.next)),
      (s = s.next));
  return (i !== null ? (s.next = i) : a !== null && (s.next = a), r.next);
}
function Cu(e, t, n, r, s) {
  if (n >= r) return;
  const i = e[(n + r) >> 1];
  let a = n - 1,
    o = r + 1;
  for (;;) {
    do a++;
    while (s(e[a], i) < 0);
    do o--;
    while (s(e[o], i) > 0);
    if (a >= o) break;
    let l = e[a];
    ((e[a] = e[o]), (e[o] = l), (l = t[a]), (t[a] = t[o]), (t[o] = l));
  }
  (Cu(e, t, n, o, s), Cu(e, t, o + 1, r, s));
}
const on = 11102230246251565e-32,
  ze = 134217729,
  S4 = (3 + 8 * on) * on;
function dl(e, t, n, r, s) {
  let i,
    a,
    o,
    l,
    u = t[0],
    c = r[0],
    f = 0,
    d = 0;
  c > u == c > -u ? ((i = u), (u = t[++f])) : ((i = c), (c = r[++d]));
  let h = 0;
  if (f < e && d < n)
    for (
      c > u == c > -u
        ? ((a = u + i), (o = i - (a - u)), (u = t[++f]))
        : ((a = c + i), (o = i - (a - c)), (c = r[++d])),
        i = a,
        o !== 0 && (s[h++] = o);
      f < e && d < n;
    )
      (c > u == c > -u
        ? ((a = i + u), (l = a - i), (o = i - (a - l) + (u - l)), (u = t[++f]))
        : ((a = i + c), (l = a - i), (o = i - (a - l) + (c - l)), (c = r[++d])),
        (i = a),
        o !== 0 && (s[h++] = o));
  for (; f < e; )
    ((a = i + u),
      (l = a - i),
      (o = i - (a - l) + (u - l)),
      (u = t[++f]),
      (i = a),
      o !== 0 && (s[h++] = o));
  for (; d < n; )
    ((a = i + c),
      (l = a - i),
      (o = i - (a - l) + (c - l)),
      (c = r[++d]),
      (i = a),
      o !== 0 && (s[h++] = o));
  return ((i !== 0 || h === 0) && (s[h++] = i), h);
}
function w4(e, t) {
  let n = t[0];
  for (let r = 1; r < e; r++) n += t[r];
  return n;
}
function F(e) {
  return new Float64Array(e);
}
const b4 = (3 + 16 * on) * on,
  E4 = (2 + 12 * on) * on,
  T4 = (9 + 64 * on) * on * on,
  wr = F(4),
  fh = F(8),
  dh = F(12),
  hh = F(16),
  We = F(4);
function C4(e, t, n, r, s, i, a) {
  let o, l, u, c, f, d, h, m, x, k, p, g, v, S, b, L, T, E;
  const I = e - s,
    P = n - s,
    q = t - i,
    Q = r - i;
  ((S = I * Q),
    (d = ze * I),
    (h = d - (d - I)),
    (m = I - h),
    (d = ze * Q),
    (x = d - (d - Q)),
    (k = Q - x),
    (b = m * k - (S - h * x - m * x - h * k)),
    (L = q * P),
    (d = ze * q),
    (h = d - (d - q)),
    (m = q - h),
    (d = ze * P),
    (x = d - (d - P)),
    (k = P - x),
    (T = m * k - (L - h * x - m * x - h * k)),
    (p = b - T),
    (f = b - p),
    (wr[0] = b - (p + f) + (f - T)),
    (g = S + p),
    (f = g - S),
    (v = S - (g - f) + (p - f)),
    (p = v - L),
    (f = v - p),
    (wr[1] = v - (p + f) + (f - L)),
    (E = g + p),
    (f = E - g),
    (wr[2] = g - (E - f) + (p - f)),
    (wr[3] = E));
  let te = w4(4, wr),
    ee = E4 * a;
  if (
    te >= ee ||
    -te >= ee ||
    ((f = e - I),
    (o = e - (I + f) + (f - s)),
    (f = n - P),
    (u = n - (P + f) + (f - s)),
    (f = t - q),
    (l = t - (q + f) + (f - i)),
    (f = r - Q),
    (c = r - (Q + f) + (f - i)),
    o === 0 && l === 0 && u === 0 && c === 0) ||
    ((ee = T4 * a + S4 * Math.abs(te)),
    (te += I * c + Q * o - (q * u + P * l)),
    te >= ee || -te >= ee)
  )
    return te;
  ((S = o * Q),
    (d = ze * o),
    (h = d - (d - o)),
    (m = o - h),
    (d = ze * Q),
    (x = d - (d - Q)),
    (k = Q - x),
    (b = m * k - (S - h * x - m * x - h * k)),
    (L = l * P),
    (d = ze * l),
    (h = d - (d - l)),
    (m = l - h),
    (d = ze * P),
    (x = d - (d - P)),
    (k = P - x),
    (T = m * k - (L - h * x - m * x - h * k)),
    (p = b - T),
    (f = b - p),
    (We[0] = b - (p + f) + (f - T)),
    (g = S + p),
    (f = g - S),
    (v = S - (g - f) + (p - f)),
    (p = v - L),
    (f = v - p),
    (We[1] = v - (p + f) + (f - L)),
    (E = g + p),
    (f = E - g),
    (We[2] = g - (E - f) + (p - f)),
    (We[3] = E));
  const ae = dl(4, wr, 4, We, fh);
  ((S = I * c),
    (d = ze * I),
    (h = d - (d - I)),
    (m = I - h),
    (d = ze * c),
    (x = d - (d - c)),
    (k = c - x),
    (b = m * k - (S - h * x - m * x - h * k)),
    (L = q * u),
    (d = ze * q),
    (h = d - (d - q)),
    (m = q - h),
    (d = ze * u),
    (x = d - (d - u)),
    (k = u - x),
    (T = m * k - (L - h * x - m * x - h * k)),
    (p = b - T),
    (f = b - p),
    (We[0] = b - (p + f) + (f - T)),
    (g = S + p),
    (f = g - S),
    (v = S - (g - f) + (p - f)),
    (p = v - L),
    (f = v - p),
    (We[1] = v - (p + f) + (f - L)),
    (E = g + p),
    (f = E - g),
    (We[2] = g - (E - f) + (p - f)),
    (We[3] = E));
  const oe = dl(ae, fh, 4, We, dh);
  ((S = o * c),
    (d = ze * o),
    (h = d - (d - o)),
    (m = o - h),
    (d = ze * c),
    (x = d - (d - c)),
    (k = c - x),
    (b = m * k - (S - h * x - m * x - h * k)),
    (L = l * u),
    (d = ze * l),
    (h = d - (d - l)),
    (m = l - h),
    (d = ze * u),
    (x = d - (d - u)),
    (k = u - x),
    (T = m * k - (L - h * x - m * x - h * k)),
    (p = b - T),
    (f = b - p),
    (We[0] = b - (p + f) + (f - T)),
    (g = S + p),
    (f = g - S),
    (v = S - (g - f) + (p - f)),
    (p = v - L),
    (f = v - p),
    (We[1] = v - (p + f) + (f - L)),
    (E = g + p),
    (f = E - g),
    (We[2] = g - (E - f) + (p - f)),
    (We[3] = E));
  const le = dl(oe, dh, 4, We, hh);
  return hh[le - 1];
}
function L4(e, t, n, r, s, i) {
  const a = (t - i) * (n - s),
    o = (e - s) * (r - i),
    l = a - o,
    u = Math.abs(a + o);
  return Math.abs(l) >= b4 * u ? l : -C4(e, t, n, r, s, i, u);
}
F(4);
F(4);
F(4);
F(4);
F(4);
F(4);
F(4);
F(4);
F(4);
F(8);
F(8);
F(8);
F(4);
F(8);
F(8);
F(16);
F(12);
F(192);
F(192);
F(4);
F(4);
F(4);
F(4);
F(4);
F(4);
F(4);
F(4);
F(8);
F(8);
F(8);
F(8);
F(8);
F(8);
F(8);
F(8);
F(8);
F(4);
F(4);
F(4);
F(8);
F(16);
F(16);
F(16);
F(32);
F(32);
F(48);
F(64);
F(1152);
F(1152);
F(4);
F(4);
F(4);
F(4);
F(4);
F(4);
F(4);
F(4);
F(4);
F(4);
F(24);
F(24);
F(24);
F(24);
F(24);
F(24);
F(24);
F(24);
F(24);
F(24);
F(1152);
F(1152);
F(1152);
F(1152);
F(1152);
F(2304);
F(2304);
F(3456);
F(5760);
F(8);
F(8);
F(8);
F(16);
F(24);
F(48);
F(48);
F(96);
F(192);
F(384);
F(384);
F(384);
F(768);
F(96);
F(96);
F(96);
F(1152);
var kg = {};
const ys = (e, t) => e.ll.x <= t.x && t.x <= e.ur.x && e.ll.y <= t.y && t.y <= e.ur.y,
  Lu = (e, t) => {
    if (t.ur.x < e.ll.x || e.ur.x < t.ll.x || t.ur.y < e.ll.y || e.ur.y < t.ll.y) return null;
    const n = e.ll.x < t.ll.x ? t.ll.x : e.ll.x,
      r = e.ur.x < t.ur.x ? e.ur.x : t.ur.x,
      s = e.ll.y < t.ll.y ? t.ll.y : e.ll.y,
      i = e.ur.y < t.ur.y ? e.ur.y : t.ur.y;
    return { ll: { x: n, y: s }, ur: { x: r, y: i } };
  };
let Rn = Number.EPSILON;
Rn === void 0 && (Rn = Math.pow(2, -52));
const F4 = Rn * Rn,
  ph = (e, t) => {
    if (-Rn < e && e < Rn && -Rn < t && t < Rn) return 0;
    const n = e - t;
    return n * n < F4 * e * t ? 0 : e < t ? -1 : 1;
  };
class M4 {
  constructor() {
    this.reset();
  }
  reset() {
    ((this.xRounder = new mh()), (this.yRounder = new mh()));
  }
  round(t, n) {
    return { x: this.xRounder.round(t), y: this.yRounder.round(n) };
  }
}
class mh {
  constructor() {
    ((this.tree = new Kc()), this.round(0));
  }
  round(t) {
    const n = this.tree.add(t),
      r = this.tree.prev(n);
    if (r !== null && ph(n.key, r.key) === 0) return (this.tree.remove(t), r.key);
    const s = this.tree.next(n);
    return s !== null && ph(n.key, s.key) === 0 ? (this.tree.remove(t), s.key) : t;
  }
}
const oi = new M4(),
  pa = (e, t) => e.x * t.y - e.y * t.x,
  Sg = (e, t) => e.x * t.x + e.y * t.y,
  gh = (e, t, n) => {
    const r = L4(e.x, e.y, t.x, t.y, n.x, n.y);
    return r > 0 ? -1 : r < 0 ? 1 : 0;
  },
  qa = (e) => Math.sqrt(Sg(e, e)),
  N4 = (e, t, n) => {
    const r = { x: t.x - e.x, y: t.y - e.y },
      s = { x: n.x - e.x, y: n.y - e.y };
    return pa(s, r) / qa(s) / qa(r);
  },
  R4 = (e, t, n) => {
    const r = { x: t.x - e.x, y: t.y - e.y },
      s = { x: n.x - e.x, y: n.y - e.y };
    return Sg(s, r) / qa(s) / qa(r);
  },
  vh = (e, t, n) => (t.y === 0 ? null : { x: e.x + (t.x / t.y) * (n - e.y), y: n }),
  yh = (e, t, n) => (t.x === 0 ? null : { x: n, y: e.y + (t.y / t.x) * (n - e.x) }),
  O4 = (e, t, n, r) => {
    if (t.x === 0) return yh(n, r, e.x);
    if (r.x === 0) return yh(e, t, n.x);
    if (t.y === 0) return vh(n, r, e.y);
    if (r.y === 0) return vh(e, t, n.y);
    const s = pa(t, r);
    if (s == 0) return null;
    const i = { x: n.x - e.x, y: n.y - e.y },
      a = pa(i, t) / s,
      o = pa(i, r) / s,
      l = e.x + o * t.x,
      u = n.x + a * r.x,
      c = e.y + o * t.y,
      f = n.y + a * r.y,
      d = (l + u) / 2,
      h = (c + f) / 2;
    return { x: d, y: h };
  };
class mt {
  static compare(t, n) {
    const r = mt.comparePoints(t.point, n.point);
    return r !== 0
      ? r
      : (t.point !== n.point && t.link(n),
        t.isLeft !== n.isLeft ? (t.isLeft ? 1 : -1) : jn.compare(t.segment, n.segment));
  }
  static comparePoints(t, n) {
    return t.x < n.x ? -1 : t.x > n.x ? 1 : t.y < n.y ? -1 : t.y > n.y ? 1 : 0;
  }
  constructor(t, n) {
    (t.events === void 0 ? (t.events = [this]) : t.events.push(this),
      (this.point = t),
      (this.isLeft = n));
  }
  link(t) {
    if (t.point === this.point) throw new Error("Tried to link already linked events");
    const n = t.point.events;
    for (let r = 0, s = n.length; r < s; r++) {
      const i = n[r];
      (this.point.events.push(i), (i.point = this.point));
    }
    this.checkForConsuming();
  }
  checkForConsuming() {
    const t = this.point.events.length;
    for (let n = 0; n < t; n++) {
      const r = this.point.events[n];
      if (r.segment.consumedBy === void 0)
        for (let s = n + 1; s < t; s++) {
          const i = this.point.events[s];
          i.consumedBy === void 0 &&
            r.otherSE.point.events === i.otherSE.point.events &&
            r.segment.consume(i.segment);
        }
    }
  }
  getAvailableLinkedEvents() {
    const t = [];
    for (let n = 0, r = this.point.events.length; n < r; n++) {
      const s = this.point.events[n];
      s !== this && !s.segment.ringOut && s.segment.isInResult() && t.push(s);
    }
    return t;
  }
  getLeftmostComparator(t) {
    const n = new Map(),
      r = (s) => {
        const i = s.otherSE;
        n.set(s, {
          sine: N4(this.point, t.point, i.point),
          cosine: R4(this.point, t.point, i.point),
        });
      };
    return (s, i) => {
      (n.has(s) || r(s), n.has(i) || r(i));
      const { sine: a, cosine: o } = n.get(s),
        { sine: l, cosine: u } = n.get(i);
      return a >= 0 && l >= 0
        ? o < u
          ? 1
          : o > u
            ? -1
            : 0
        : a < 0 && l < 0
          ? o < u
            ? -1
            : o > u
              ? 1
              : 0
          : l < a
            ? -1
            : l > a
              ? 1
              : 0;
    };
  }
}
let I4 = 0;
class jn {
  static compare(t, n) {
    const r = t.leftSE.point.x,
      s = n.leftSE.point.x,
      i = t.rightSE.point.x,
      a = n.rightSE.point.x;
    if (a < r) return 1;
    if (i < s) return -1;
    const o = t.leftSE.point.y,
      l = n.leftSE.point.y,
      u = t.rightSE.point.y,
      c = n.rightSE.point.y;
    if (r < s) {
      if (l < o && l < u) return 1;
      if (l > o && l > u) return -1;
      const f = t.comparePoint(n.leftSE.point);
      if (f < 0) return 1;
      if (f > 0) return -1;
      const d = n.comparePoint(t.rightSE.point);
      return d !== 0 ? d : -1;
    }
    if (r > s) {
      if (o < l && o < c) return -1;
      if (o > l && o > c) return 1;
      const f = n.comparePoint(t.leftSE.point);
      if (f !== 0) return f;
      const d = t.comparePoint(n.rightSE.point);
      return d < 0 ? 1 : d > 0 ? -1 : 1;
    }
    if (o < l) return -1;
    if (o > l) return 1;
    if (i < a) {
      const f = n.comparePoint(t.rightSE.point);
      if (f !== 0) return f;
    }
    if (i > a) {
      const f = t.comparePoint(n.rightSE.point);
      if (f < 0) return 1;
      if (f > 0) return -1;
    }
    if (i !== a) {
      const f = u - o,
        d = i - r,
        h = c - l,
        m = a - s;
      if (f > d && h < m) return 1;
      if (f < d && h > m) return -1;
    }
    return i > a ? 1 : i < a || u < c ? -1 : u > c ? 1 : t.id < n.id ? -1 : t.id > n.id ? 1 : 0;
  }
  constructor(t, n, r, s) {
    ((this.id = ++I4),
      (this.leftSE = t),
      (t.segment = this),
      (t.otherSE = n),
      (this.rightSE = n),
      (n.segment = this),
      (n.otherSE = t),
      (this.rings = r),
      (this.windings = s));
  }
  static fromRing(t, n, r) {
    let s, i, a;
    const o = mt.comparePoints(t, n);
    if (o < 0) ((s = t), (i = n), (a = 1));
    else if (o > 0) ((s = n), (i = t), (a = -1));
    else throw new Error(`Tried to create degenerate segment at [${t.x}, ${t.y}]`);
    const l = new mt(s, !0),
      u = new mt(i, !1);
    return new jn(l, u, [r], [a]);
  }
  replaceRightSE(t) {
    ((this.rightSE = t),
      (this.rightSE.segment = this),
      (this.rightSE.otherSE = this.leftSE),
      (this.leftSE.otherSE = this.rightSE));
  }
  bbox() {
    const t = this.leftSE.point.y,
      n = this.rightSE.point.y;
    return {
      ll: { x: this.leftSE.point.x, y: t < n ? t : n },
      ur: { x: this.rightSE.point.x, y: t > n ? t : n },
    };
  }
  vector() {
    return {
      x: this.rightSE.point.x - this.leftSE.point.x,
      y: this.rightSE.point.y - this.leftSE.point.y,
    };
  }
  isAnEndpoint(t) {
    return (
      (t.x === this.leftSE.point.x && t.y === this.leftSE.point.y) ||
      (t.x === this.rightSE.point.x && t.y === this.rightSE.point.y)
    );
  }
  comparePoint(t) {
    if (this.isAnEndpoint(t)) return 0;
    const n = this.leftSE.point,
      r = this.rightSE.point,
      s = this.vector();
    if (n.x === r.x) return t.x === n.x ? 0 : t.x < n.x ? 1 : -1;
    const i = (t.y - n.y) / s.y,
      a = n.x + i * s.x;
    if (t.x === a) return 0;
    const o = (t.x - n.x) / s.x,
      l = n.y + o * s.y;
    return t.y === l ? 0 : t.y < l ? -1 : 1;
  }
  getIntersection(t) {
    const n = this.bbox(),
      r = t.bbox(),
      s = Lu(n, r);
    if (s === null) return null;
    const i = this.leftSE.point,
      a = this.rightSE.point,
      o = t.leftSE.point,
      l = t.rightSE.point,
      u = ys(n, o) && this.comparePoint(o) === 0,
      c = ys(r, i) && t.comparePoint(i) === 0,
      f = ys(n, l) && this.comparePoint(l) === 0,
      d = ys(r, a) && t.comparePoint(a) === 0;
    if (c && u) return d && !f ? a : !d && f ? l : null;
    if (c) return f && i.x === l.x && i.y === l.y ? null : i;
    if (u) return d && a.x === o.x && a.y === o.y ? null : o;
    if (d && f) return null;
    if (d) return a;
    if (f) return l;
    const h = O4(i, this.vector(), o, t.vector());
    return h === null || !ys(s, h) ? null : oi.round(h.x, h.y);
  }
  split(t) {
    const n = [],
      r = t.events !== void 0,
      s = new mt(t, !0),
      i = new mt(t, !1),
      a = this.rightSE;
    (this.replaceRightSE(i), n.push(i), n.push(s));
    const o = new jn(s, a, this.rings.slice(), this.windings.slice());
    return (
      mt.comparePoints(o.leftSE.point, o.rightSE.point) > 0 && o.swapEvents(),
      mt.comparePoints(this.leftSE.point, this.rightSE.point) > 0 && this.swapEvents(),
      r && (s.checkForConsuming(), i.checkForConsuming()),
      n
    );
  }
  swapEvents() {
    const t = this.rightSE;
    ((this.rightSE = this.leftSE),
      (this.leftSE = t),
      (this.leftSE.isLeft = !0),
      (this.rightSE.isLeft = !1));
    for (let n = 0, r = this.windings.length; n < r; n++) this.windings[n] *= -1;
  }
  consume(t) {
    let n = this,
      r = t;
    for (; n.consumedBy; ) n = n.consumedBy;
    for (; r.consumedBy; ) r = r.consumedBy;
    const s = jn.compare(n, r);
    if (s !== 0) {
      if (s > 0) {
        const i = n;
        ((n = r), (r = i));
      }
      if (n.prev === r) {
        const i = n;
        ((n = r), (r = i));
      }
      for (let i = 0, a = r.rings.length; i < a; i++) {
        const o = r.rings[i],
          l = r.windings[i],
          u = n.rings.indexOf(o);
        u === -1 ? (n.rings.push(o), n.windings.push(l)) : (n.windings[u] += l);
      }
      ((r.rings = null),
        (r.windings = null),
        (r.consumedBy = n),
        (r.leftSE.consumedBy = n.leftSE),
        (r.rightSE.consumedBy = n.rightSE));
    }
  }
  prevInResult() {
    return this._prevInResult !== void 0
      ? this._prevInResult
      : (this.prev
          ? this.prev.isInResult()
            ? (this._prevInResult = this.prev)
            : (this._prevInResult = this.prev.prevInResult())
          : (this._prevInResult = null),
        this._prevInResult);
  }
  beforeState() {
    if (this._beforeState !== void 0) return this._beforeState;
    if (!this.prev) this._beforeState = { rings: [], windings: [], multiPolys: [] };
    else {
      const t = this.prev.consumedBy || this.prev;
      this._beforeState = t.afterState();
    }
    return this._beforeState;
  }
  afterState() {
    if (this._afterState !== void 0) return this._afterState;
    const t = this.beforeState();
    this._afterState = { rings: t.rings.slice(0), windings: t.windings.slice(0), multiPolys: [] };
    const n = this._afterState.rings,
      r = this._afterState.windings,
      s = this._afterState.multiPolys;
    for (let o = 0, l = this.rings.length; o < l; o++) {
      const u = this.rings[o],
        c = this.windings[o],
        f = n.indexOf(u);
      f === -1 ? (n.push(u), r.push(c)) : (r[f] += c);
    }
    const i = [],
      a = [];
    for (let o = 0, l = n.length; o < l; o++) {
      if (r[o] === 0) continue;
      const u = n[o],
        c = u.poly;
      if (a.indexOf(c) === -1)
        if (u.isExterior) i.push(c);
        else {
          a.indexOf(c) === -1 && a.push(c);
          const f = i.indexOf(u.poly);
          f !== -1 && i.splice(f, 1);
        }
    }
    for (let o = 0, l = i.length; o < l; o++) {
      const u = i[o].multiPoly;
      s.indexOf(u) === -1 && s.push(u);
    }
    return this._afterState;
  }
  isInResult() {
    if (this.consumedBy) return !1;
    if (this._isInResult !== void 0) return this._isInResult;
    const t = this.beforeState().multiPolys,
      n = this.afterState().multiPolys;
    switch (Mt.type) {
      case "union": {
        const r = t.length === 0,
          s = n.length === 0;
        this._isInResult = r !== s;
        break;
      }
      case "intersection": {
        let r, s;
        (t.length < n.length ? ((r = t.length), (s = n.length)) : ((r = n.length), (s = t.length)),
          (this._isInResult = s === Mt.numMultiPolys && r < s));
        break;
      }
      case "xor": {
        const r = Math.abs(t.length - n.length);
        this._isInResult = r % 2 === 1;
        break;
      }
      case "difference": {
        const r = (s) => s.length === 1 && s[0].isSubject;
        this._isInResult = r(t) !== r(n);
        break;
      }
      default:
        throw new Error(`Unrecognized operation type found ${Mt.type}`);
    }
    return this._isInResult;
  }
}
class xh {
  constructor(t, n, r) {
    if (!Array.isArray(t) || t.length === 0)
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    if (
      ((this.poly = n),
      (this.isExterior = r),
      (this.segments = []),
      typeof t[0][0] != "number" || typeof t[0][1] != "number")
    )
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    const s = oi.round(t[0][0], t[0][1]);
    this.bbox = { ll: { x: s.x, y: s.y }, ur: { x: s.x, y: s.y } };
    let i = s;
    for (let a = 1, o = t.length; a < o; a++) {
      if (typeof t[a][0] != "number" || typeof t[a][1] != "number")
        throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
      let l = oi.round(t[a][0], t[a][1]);
      (l.x === i.x && l.y === i.y) ||
        (this.segments.push(jn.fromRing(i, l, this)),
        l.x < this.bbox.ll.x && (this.bbox.ll.x = l.x),
        l.y < this.bbox.ll.y && (this.bbox.ll.y = l.y),
        l.x > this.bbox.ur.x && (this.bbox.ur.x = l.x),
        l.y > this.bbox.ur.y && (this.bbox.ur.y = l.y),
        (i = l));
    }
    (s.x !== i.x || s.y !== i.y) && this.segments.push(jn.fromRing(i, s, this));
  }
  getSweepEvents() {
    const t = [];
    for (let n = 0, r = this.segments.length; n < r; n++) {
      const s = this.segments[n];
      (t.push(s.leftSE), t.push(s.rightSE));
    }
    return t;
  }
}
class P4 {
  constructor(t, n) {
    if (!Array.isArray(t)) throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    ((this.exteriorRing = new xh(t[0], this, !0)),
      (this.bbox = {
        ll: { x: this.exteriorRing.bbox.ll.x, y: this.exteriorRing.bbox.ll.y },
        ur: { x: this.exteriorRing.bbox.ur.x, y: this.exteriorRing.bbox.ur.y },
      }),
      (this.interiorRings = []));
    for (let r = 1, s = t.length; r < s; r++) {
      const i = new xh(t[r], this, !1);
      (i.bbox.ll.x < this.bbox.ll.x && (this.bbox.ll.x = i.bbox.ll.x),
        i.bbox.ll.y < this.bbox.ll.y && (this.bbox.ll.y = i.bbox.ll.y),
        i.bbox.ur.x > this.bbox.ur.x && (this.bbox.ur.x = i.bbox.ur.x),
        i.bbox.ur.y > this.bbox.ur.y && (this.bbox.ur.y = i.bbox.ur.y),
        this.interiorRings.push(i));
    }
    this.multiPoly = n;
  }
  getSweepEvents() {
    const t = this.exteriorRing.getSweepEvents();
    for (let n = 0, r = this.interiorRings.length; n < r; n++) {
      const s = this.interiorRings[n].getSweepEvents();
      for (let i = 0, a = s.length; i < a; i++) t.push(s[i]);
    }
    return t;
  }
}
class kh {
  constructor(t, n) {
    if (!Array.isArray(t)) throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    try {
      typeof t[0][0][0] == "number" && (t = [t]);
    } catch {}
    ((this.polys = []),
      (this.bbox = {
        ll: { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY },
        ur: { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY },
      }));
    for (let r = 0, s = t.length; r < s; r++) {
      const i = new P4(t[r], this);
      (i.bbox.ll.x < this.bbox.ll.x && (this.bbox.ll.x = i.bbox.ll.x),
        i.bbox.ll.y < this.bbox.ll.y && (this.bbox.ll.y = i.bbox.ll.y),
        i.bbox.ur.x > this.bbox.ur.x && (this.bbox.ur.x = i.bbox.ur.x),
        i.bbox.ur.y > this.bbox.ur.y && (this.bbox.ur.y = i.bbox.ur.y),
        this.polys.push(i));
    }
    this.isSubject = n;
  }
  getSweepEvents() {
    const t = [];
    for (let n = 0, r = this.polys.length; n < r; n++) {
      const s = this.polys[n].getSweepEvents();
      for (let i = 0, a = s.length; i < a; i++) t.push(s[i]);
    }
    return t;
  }
}
class Xa {
  static factory(t) {
    const n = [];
    for (let r = 0, s = t.length; r < s; r++) {
      const i = t[r];
      if (!i.isInResult() || i.ringOut) continue;
      let a = null,
        o = i.leftSE,
        l = i.rightSE;
      const u = [o],
        c = o.point,
        f = [];
      for (; (a = o), (o = l), u.push(o), o.point !== c; )
        for (;;) {
          const d = o.getAvailableLinkedEvents();
          if (d.length === 0) {
            const x = u[0].point,
              k = u[u.length - 1].point;
            throw new Error(
              `Unable to complete output ring starting at [${x.x}, ${x.y}]. Last matching segment found ends at [${k.x}, ${k.y}].`,
            );
          }
          if (d.length === 1) {
            l = d[0].otherSE;
            break;
          }
          let h = null;
          for (let x = 0, k = f.length; x < k; x++)
            if (f[x].point === o.point) {
              h = x;
              break;
            }
          if (h !== null) {
            const x = f.splice(h)[0],
              k = u.splice(x.index);
            (k.unshift(k[0].otherSE), n.push(new Xa(k.reverse())));
            continue;
          }
          f.push({ index: u.length, point: o.point });
          const m = o.getLeftmostComparator(a);
          l = d.sort(m)[0].otherSE;
          break;
        }
      n.push(new Xa(u));
    }
    return n;
  }
  constructor(t) {
    this.events = t;
    for (let n = 0, r = t.length; n < r; n++) t[n].segment.ringOut = this;
    this.poly = null;
  }
  getGeom() {
    let t = this.events[0].point;
    const n = [t];
    for (let u = 1, c = this.events.length - 1; u < c; u++) {
      const f = this.events[u].point,
        d = this.events[u + 1].point;
      gh(f, t, d) !== 0 && (n.push(f), (t = f));
    }
    if (n.length === 1) return null;
    const r = n[0],
      s = n[1];
    (gh(r, t, s) === 0 && n.shift(), n.push(n[0]));
    const i = this.isExteriorRing() ? 1 : -1,
      a = this.isExteriorRing() ? 0 : n.length - 1,
      o = this.isExteriorRing() ? n.length : -1,
      l = [];
    for (let u = a; u != o; u += i) l.push([n[u].x, n[u].y]);
    return l;
  }
  isExteriorRing() {
    if (this._isExteriorRing === void 0) {
      const t = this.enclosingRing();
      this._isExteriorRing = t ? !t.isExteriorRing() : !0;
    }
    return this._isExteriorRing;
  }
  enclosingRing() {
    return (
      this._enclosingRing === void 0 && (this._enclosingRing = this._calcEnclosingRing()),
      this._enclosingRing
    );
  }
  _calcEnclosingRing() {
    let t = this.events[0];
    for (let s = 1, i = this.events.length; s < i; s++) {
      const a = this.events[s];
      mt.compare(t, a) > 0 && (t = a);
    }
    let n = t.segment.prevInResult(),
      r = n ? n.prevInResult() : null;
    for (;;) {
      if (!n) return null;
      if (!r) return n.ringOut;
      if (r.ringOut !== n.ringOut)
        return r.ringOut.enclosingRing() !== n.ringOut ? n.ringOut : n.ringOut.enclosingRing();
      ((n = r.prevInResult()), (r = n ? n.prevInResult() : null));
    }
  }
}
class Sh {
  constructor(t) {
    ((this.exteriorRing = t), (t.poly = this), (this.interiorRings = []));
  }
  addInterior(t) {
    (this.interiorRings.push(t), (t.poly = this));
  }
  getGeom() {
    const t = [this.exteriorRing.getGeom()];
    if (t[0] === null) return null;
    for (let n = 0, r = this.interiorRings.length; n < r; n++) {
      const s = this.interiorRings[n].getGeom();
      s !== null && t.push(s);
    }
    return t;
  }
}
class D4 {
  constructor(t) {
    ((this.rings = t), (this.polys = this._composePolys(t)));
  }
  getGeom() {
    const t = [];
    for (let n = 0, r = this.polys.length; n < r; n++) {
      const s = this.polys[n].getGeom();
      s !== null && t.push(s);
    }
    return t;
  }
  _composePolys(t) {
    const n = [];
    for (let r = 0, s = t.length; r < s; r++) {
      const i = t[r];
      if (!i.poly)
        if (i.isExteriorRing()) n.push(new Sh(i));
        else {
          const a = i.enclosingRing();
          (a.poly || n.push(new Sh(a)), a.poly.addInterior(i));
        }
    }
    return n;
  }
}
class U4 {
  constructor(t) {
    let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : jn.compare;
    ((this.queue = t), (this.tree = new Kc(n)), (this.segments = []));
  }
  process(t) {
    const n = t.segment,
      r = [];
    if (t.consumedBy) return (t.isLeft ? this.queue.remove(t.otherSE) : this.tree.remove(n), r);
    const s = t.isLeft ? this.tree.add(n) : this.tree.find(n);
    if (!s)
      throw new Error(
        `Unable to find segment #${n.id} [${n.leftSE.point.x}, ${n.leftSE.point.y}] -> [${n.rightSE.point.x}, ${n.rightSE.point.y}] in SweepLine tree.`,
      );
    let i = s,
      a = s,
      o,
      l;
    for (; o === void 0; )
      ((i = this.tree.prev(i)),
        i === null ? (o = null) : i.key.consumedBy === void 0 && (o = i.key));
    for (; l === void 0; )
      ((a = this.tree.next(a)),
        a === null ? (l = null) : a.key.consumedBy === void 0 && (l = a.key));
    if (t.isLeft) {
      let u = null;
      if (o) {
        const f = o.getIntersection(n);
        if (f !== null && (n.isAnEndpoint(f) || (u = f), !o.isAnEndpoint(f))) {
          const d = this._splitSafely(o, f);
          for (let h = 0, m = d.length; h < m; h++) r.push(d[h]);
        }
      }
      let c = null;
      if (l) {
        const f = l.getIntersection(n);
        if (f !== null && (n.isAnEndpoint(f) || (c = f), !l.isAnEndpoint(f))) {
          const d = this._splitSafely(l, f);
          for (let h = 0, m = d.length; h < m; h++) r.push(d[h]);
        }
      }
      if (u !== null || c !== null) {
        let f = null;
        (u === null ? (f = c) : c === null ? (f = u) : (f = mt.comparePoints(u, c) <= 0 ? u : c),
          this.queue.remove(n.rightSE),
          r.push(n.rightSE));
        const d = n.split(f);
        for (let h = 0, m = d.length; h < m; h++) r.push(d[h]);
      }
      r.length > 0 ? (this.tree.remove(n), r.push(t)) : (this.segments.push(n), (n.prev = o));
    } else {
      if (o && l) {
        const u = o.getIntersection(l);
        if (u !== null) {
          if (!o.isAnEndpoint(u)) {
            const c = this._splitSafely(o, u);
            for (let f = 0, d = c.length; f < d; f++) r.push(c[f]);
          }
          if (!l.isAnEndpoint(u)) {
            const c = this._splitSafely(l, u);
            for (let f = 0, d = c.length; f < d; f++) r.push(c[f]);
          }
        }
      }
      this.tree.remove(n);
    }
    return r;
  }
  _splitSafely(t, n) {
    this.tree.remove(t);
    const r = t.rightSE;
    this.queue.remove(r);
    const s = t.split(n);
    return (s.push(r), t.consumedBy === void 0 && this.tree.add(t), s);
  }
}
const wh = (typeof process < "u" && kg.POLYGON_CLIPPING_MAX_QUEUE_SIZE) || 1e6,
  A4 = (typeof process < "u" && kg.POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS) || 1e6;
class B4 {
  run(t, n, r) {
    ((Mt.type = t), oi.reset());
    const s = [new kh(n, !0)];
    for (let f = 0, d = r.length; f < d; f++) s.push(new kh(r[f], !1));
    if (((Mt.numMultiPolys = s.length), Mt.type === "difference")) {
      const f = s[0];
      let d = 1;
      for (; d < s.length; ) Lu(s[d].bbox, f.bbox) !== null ? d++ : s.splice(d, 1);
    }
    if (Mt.type === "intersection")
      for (let f = 0, d = s.length; f < d; f++) {
        const h = s[f];
        for (let m = f + 1, x = s.length; m < x; m++) if (Lu(h.bbox, s[m].bbox) === null) return [];
      }
    const i = new Kc(mt.compare);
    for (let f = 0, d = s.length; f < d; f++) {
      const h = s[f].getSweepEvents();
      for (let m = 0, x = h.length; m < x; m++)
        if ((i.insert(h[m]), i.size > wh))
          throw new Error(
            "Infinite loop when putting segment endpoints in a priority queue (queue size too big).",
          );
    }
    const a = new U4(i);
    let o = i.size,
      l = i.pop();
    for (; l; ) {
      const f = l.key;
      if (i.size === o) {
        const h = f.segment;
        throw new Error(
          `Unable to pop() ${f.isLeft ? "left" : "right"} SweepEvent [${f.point.x}, ${f.point.y}] from segment #${h.id} [${h.leftSE.point.x}, ${h.leftSE.point.y}] -> [${h.rightSE.point.x}, ${h.rightSE.point.y}] from queue.`,
        );
      }
      if (i.size > wh)
        throw new Error(
          "Infinite loop when passing sweep line over endpoints (queue size too big).",
        );
      if (a.segments.length > A4)
        throw new Error(
          "Infinite loop when passing sweep line over endpoints (too many sweep line segments).",
        );
      const d = a.process(f);
      for (let h = 0, m = d.length; h < m; h++) {
        const x = d[h];
        x.consumedBy === void 0 && i.insert(x);
      }
      ((o = i.size), (l = i.pop()));
    }
    oi.reset();
    const u = Xa.factory(a.segments);
    return new D4(u).getGeom();
  }
}
const Mt = new B4(),
  $4 = function (e) {
    for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++)
      n[r - 1] = arguments[r];
    return Mt.run("union", e, n);
  },
  _4 = function (e) {
    for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++)
      n[r - 1] = arguments[r];
    return Mt.run("intersection", e, n);
  },
  z4 = function (e) {
    for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++)
      n[r - 1] = arguments[r];
    return Mt.run("xor", e, n);
  },
  j4 = function (e) {
    for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++)
      n[r - 1] = arguments[r];
    return Mt.run("difference", e, n);
  };
var gr = { union: $4, intersection: _4, xor: z4, difference: j4 };
function G4(e, t = 0.6) {
  const n = [];
  let r = [],
    s = 0,
    i = 0,
    a = 0,
    o = 0;
  const l = () => {
    (r.length >= 3 && n.push(r), (r = []));
  };
  for (const u of e.commands)
    if (u.type === "M") (l(), (s = a = u.x), (i = o = u.y), r.push([s, i]));
    else if (u.type === "L") ((s = u.x), (i = u.y), r.push([s, i]));
    else if (u.type === "Q") {
      const c = Math.hypot(u.x1 - s, u.y1 - i) + Math.hypot(u.x - u.x1, u.y - u.y1),
        f = Math.max(2, Math.ceil(c / t));
      for (let d = 1; d <= f; d++) {
        const h = d / f,
          m = 1 - h;
        r.push([
          m * m * s + 2 * m * h * u.x1 + h * h * u.x,
          m * m * i + 2 * m * h * u.y1 + h * h * u.y,
        ]);
      }
      ((s = u.x), (i = u.y));
    } else if (u.type === "C") {
      const c =
          Math.hypot(u.x1 - s, u.y1 - i) +
          Math.hypot(u.x2 - u.x1, u.y2 - u.y1) +
          Math.hypot(u.x - u.x2, u.y - u.y2),
        f = Math.max(3, Math.ceil(c / t));
      for (let d = 1; d <= f; d++) {
        const h = d / f,
          m = 1 - h;
        r.push([
          m * m * m * s + 3 * m * m * h * u.x1 + 3 * m * h * h * u.x2 + h * h * h * u.x,
          m * m * m * i + 3 * m * m * h * u.y1 + 3 * m * h * h * u.y2 + h * h * h * u.y,
        ]);
      }
      ((s = u.x), (i = u.y));
    } else u.type === "Z" && ((s = a), (i = o), l());
  return (
    l(),
    n.map((u) =>
      u.filter(
        (c, f) =>
          f === 0 || Math.abs(c[0] - u[f - 1][0]) > 1e-6 || Math.abs(c[1] - u[f - 1][1]) > 1e-6,
      ),
    )
  );
}
function Cn(e) {
  let t = 0;
  for (let n = 0, r = e.length - 1; n < e.length; r = n++)
    t += (e[r][0] + e[n][0]) * (e[r][1] - e[n][1]);
  return t / 2;
}
function Er(e) {
  return e.reduce(
    (t, n) => t + n.reduce((r, s, i) => r + (i === 0 ? 1 : -1) * Math.abs(Cn(s)), 0),
    0,
  );
}
function H4(e) {
  if (!e.length) return [];
  const t = e.reduce((a, o) => (Math.abs(Cn(o)) > Math.abs(Cn(a)) ? o : a)),
    n = Math.sign(Cn(t)) || 1,
    r = e.filter((a) => Math.sign(Cn(a)) === n).map((a) => [a]),
    s = e.filter((a) => Math.sign(Cn(a)) !== n).map((a) => [a]);
  if (!r.length) return [];
  const i = r.length > 1 ? gr.union(r[0], ...r.slice(1)) : [r[0]];
  return s.length ? gr.difference(i, ...s) : i;
}
function W4(e, t, n, r, s, i = {}) {
  return H4(
    G4(e.getPath(t, n, r, s, { kerning: i.kerning ?? !0, letterSpacing: i.letterSpacing ?? 0 })),
  );
}
const xs = (e, ...t) => (t.length ? gr.union(e, ...t) : e),
  br = (e, ...t) => (t.length ? gr.difference(e, ...t) : e),
  Wi = (e, ...t) => gr.intersection(e, ...t),
  V4 = (e, ...t) => gr.xor(e, ...t),
  bh = (e, t, n, r) => [
    [
      [
        [e, t],
        [e + n, t],
        [e + n, t + r],
        [e, t + r],
        [e, t],
      ],
    ],
  ],
  NL = (e) => [[[...e, e[0]]]],
  Ar = (e, t, n) => e.map((r) => r.map((s) => s.map(([i, a]) => [i + t, a + n]))),
  K4 = (e, t, n = 0, r = 0) =>
    e.map((s) => s.map((i) => i.map(([a, o]) => [n + (a - n) * t, r + (o - r) * t])));
function Eh(e, t) {
  if (!e.length) return e;
  const n = [];
  for (let r = 0; r < 8; r++)
    n.push([Math.cos((r * Math.PI) / 4) * t, Math.sin((r * Math.PI) / 4) * t]);
  return gr.union(e, ...n.map(([r, s]) => Ar(e, r, s)));
}
function ko(e) {
  let t = 1 / 0,
    n = 1 / 0,
    r = -1 / 0,
    s = -1 / 0;
  for (const i of e)
    for (const [a, o] of i[0] ?? [])
      ((t = Math.min(t, a)), (n = Math.min(n, o)), (r = Math.max(r, a)), (s = Math.max(s, o)));
  return isFinite(t) ? { x: t, y: n, w: r - t, h: s - n } : null;
}
function q4(e) {
  let t = 0,
    n = 0,
    r = 0;
  for (const s of e)
    s.forEach((i, a) => {
      const o = a === 0 ? 1 : -1;
      for (let l = 0, u = i.length - 1; l < i.length; u = l++) {
        const c = i[u][0] * i[l][1] - i[l][0] * i[u][1],
          f = (Math.sign(Cn(i)) || 1) * o;
        ((t += (i[u][0] + i[l][0]) * c * f), (n += (i[u][1] + i[l][1]) * c * f), (r += c * f));
      }
    });
  if (Math.abs(r) < 1e-9) {
    const s = ko(e);
    return s ? [s.x + s.w / 2, s.y + s.h / 2] : [0, 0];
  }
  return [t / (3 * r), n / (3 * r)];
}
function li(e, t) {
  const n = [];
  for (const s of e)
    for (const i of s)
      for (let a = 0, o = i.length - 1; a < i.length; o = a++) {
        const [l, u] = i[o],
          [c, f] = i[a];
        ((u <= t && f > t) || (f <= t && u > t)) && n.push(l + ((t - u) / (f - u)) * (c - l));
      }
  n.sort((s, i) => s - i);
  const r = [];
  for (let s = 0; s + 1 < n.length; s += 2) r.push([n[s], n[s + 1]]);
  return r;
}
function X4(e, t) {
  const n = e.map((r) => r.map((s) => s.map(([i, a]) => [a, i])));
  return li(n, t);
}
function Th(e, t = !1) {
  const n = ko(e);
  if (!n) return 0;
  const r = [],
    s = 48;
  for (let i = 1; i < s; i++) {
    const a = li(e, n.y + (n.h * i) / s),
      o = X4(e, n.x + (n.w * i) / s);
    for (const l of [a, o])
      if (t) for (let u = 1; u < l.length; u++) r.push(l[u][0] - l[u - 1][1]);
      else for (const [u, c] of l) r.push(c - u);
  }
  return r.length ? (r.sort((i, a) => i - a), r[Math.floor(r.length * 0.08)]) : 1 / 0;
}
const Vi = (e) => String(Math.round(e * 10) / 10);
function Z4(e, t) {
  if (e.length < 4) return e;
  const n = new Uint8Array(e.length);
  n[0] = n[e.length - 1] = 1;
  const r = [[0, e.length - 1]];
  for (; r.length; ) {
    const [s, i] = r.pop(),
      [a, o] = e[s],
      [l, u] = e[i],
      c = l - a,
      f = u - o,
      d = Math.hypot(c, f) || 1;
    let h = -1,
      m = 0;
    for (let x = s + 1; x < i; x++) {
      const k = Math.abs(f * e[x][0] - c * e[x][1] + l * o - u * a) / d;
      k > m && ((m = k), (h = x));
    }
    h >= 0 && m > t && ((n[h] = 1), r.push([s, h], [h, i]));
  }
  return e.filter((s, i) => n[i]);
}
function wg(e, t = 0.12) {
  let n = "";
  for (const r of e)
    r.forEach((s, i) => {
      const a = Cn(s) > 0,
        o = (i === 0) === a ? s : s.slice().reverse(),
        l = Z4(o.slice(0, -1), t);
      l.length < 3 ||
        (n +=
          `M${Vi(l[0][0])} ${Vi(l[0][1])}` +
          l
            .slice(1)
            .map(([u, c]) => `L${Vi(u)} ${Vi(c)}`)
            .join("") +
          "Z");
    });
  return n;
}
const Y4 = ["stamm", "ligatur", "verschraenkt", "negativ"],
  yt = 100,
  Q4 = 16 * 0.8;
function J4(e) {
  const t = e.getPath("H", 0, 0, 1e3).getBoundingBox();
  return t.y2 - t.y1 > 0 ? (t.y2 - t.y1) / 1e3 : 0.7;
}
function Ch(e, t, n) {
  const r = W4(e, t, 0, 0, n),
    s = ko(r);
  return !s || !r.length ? null : { g: r, l: s.x, r: s.x + s.w, w: s.w, a: Er(r) };
}
function Lh(e, t) {
  const n = [];
  for (const a of [0.22, 0.32, 0.42, 0.52, 0.62, 0.72, 0.8]) {
    const o = li(e.g, -yt * a);
    if (!o.length) return null;
    n.push(t === "links" ? o[0] : o[o.length - 1]);
  }
  const r = n.map((a) => (t === "links" ? a[0] : a[1]));
  if (Math.max(...r) - Math.min(...r) > yt * 0.03) return null;
  const s = t === "links" ? Math.min(...r) : Math.max(...r);
  if (Math.abs(s - (t === "links" ? e.l : e.r)) > yt * 0.04) return null;
  const i = Math.min(...n.map((a) => a[1] - a[0]));
  return i <= 0 || i > yt * 0.28
    ? null
    : t === "links"
      ? { x0: s, x1: s + i }
      : { x0: s - i, x1: s };
}
function Fh(e, t, n) {
  let r = 1 / 0;
  const s = [];
  for (let a = 1; a < 40; a++) {
    const o = -yt * (a / 40),
      l = li(e.g, o),
      u = li(t.g, o);
    if (!l.length || !u.length) continue;
    const c = u[0][0] + n - l[l.length - 1][1];
    (s.push(c), (r = Math.min(r, c)));
  }
  const i = s.filter((a) => a < r + yt * 0.025).length / 39;
  return { min: r, contact: i };
}
const Ki = (e) => e.length,
  eT = ["C", "D", "G", "O", "Q", "S", "U"];
function bg(e, t, n) {
  const r = Array.from(t.replace(/\s+/g, "").toLocaleUpperCase("de-AT"));
  if (r.length !== 2 || !r.every((p) => /^[A-Z]$/.test(p))) return null;
  const s = yt / J4(e),
    i = Ch(e, r[0], s),
    a = Ch(e, r[1], s);
  if (!i || !a) return null;
  const o = Math.min(i.w, a.w),
    l = Math.min(i.a, a.a);
  let u = null;
  if (n === "stamm") {
    const p = Lh(i, "rechts"),
      g = Lh(a, "links");
    if (!p || !g || Math.abs(p.x1 - p.x0 - (g.x1 - g.x0)) > yt * 0.05) return null;
    const v = p.x0 - g.x0,
      S = Ar(a.g, v, 0);
    if (Er(br(i.g, S)) < i.a * 0.4 || Er(br(S, i.g)) < a.a * 0.4) return null;
    u = xs(i.g, S);
  } else if (n === "ligatur") {
    const p = i.r - a.l,
      g = Fh(i, a, p),
      v = p - g.min - yt * 0.03,
      S = Fh(i, a, v);
    if (!(S.contact > 0.03 && S.contact <= 0.34)) return null;
    const b = Ar(a.g, v, 0);
    if (
      Er(br(i.g, b)) < i.a * 0.8 ||
      Er(br(b, i.g)) < a.a * 0.8 ||
      ((u = xs(i.g, b)), Ki(u) > Ki(i.g) + Ki(a.g) - 1)
    )
      return null;
  } else if (n === "verschraenkt" || n === "negativ") {
    const p = n === "verschraenkt" ? 0.34 : 0.45,
      g = i.r - p * o - a.l,
      v = Ar(a.g, g, 0),
      S = Er(Wi(i.g, v));
    if (n === "verschraenkt") {
      if (!r.some((q) => eT.includes(q)) || S < l * 0.03 || o < yt * 0.45) return null;
      const b = yt * 0.05,
        L = -yt / 2,
        T = bh(-1e4, -1e4, 2e4, 1e4 + L),
        E = bh(-1e4, L, 2e4, 2e4),
        I = xs(i.g, br(v, Eh(i.g, b))),
        P = xs(v, br(i.g, Eh(v, b)));
      u = xs(Wi(I, T), Wi(P, E));
    } else {
      if (S < l * 0.06 || S > l * 0.35 || Ki(Wi(i.g, v)) > 2) return null;
      u = V4(i.g, v);
    }
  }
  if (!u || !u.length) return null;
  const c = ko(u);
  if (!c) return null;
  const [f] = q4(u),
    d = (c.x + c.w / 2 + f) / 2,
    h = Ar(u, -(d - c.w / 2), -c.y),
    m = Th(h),
    x = n === "verschraenkt" || n === "negativ" ? Th(h, !0) : 1 / 0,
    k = (Math.max(1 / m, x === 1 / 0 ? 0 : 0.8 / x) * Math.max(c.w, c.h)) / 0.8;
  return {
    minPx: Math.round(k * 10) / 10,
    konstruktion: n,
    geom: h,
    d: wg(h),
    w: c.w,
    h: c.h,
    strich: m,
    luecke: x,
    favicon: k <= Q4 / 0.8,
  };
}
const tT = 48,
  nT = ["negativ", "verschraenkt"];
function RL(e, t) {
  let n = Mh.get(e);
  n || Mh.set(e, (n = new Map()));
  const r = n.get(t);
  if (r) return r;
  const s = Y4.filter((i) => !nT.includes(i)).filter((i) => {
    const a = bg(e, t, i);
    return !!a && a.minPx <= tT;
  });
  return (n.set(t, s), s);
}
const Mh = new WeakMap(),
  qi = new Map();
function rT(e, t, n, r, s, i) {
  const a = `${t}|${n}|${i}`;
  let o = qi.get(a);
  if ((o === void 0 && ((o = bg(e, n, i)), qi.size > 500 && qi.clear(), qi.set(a, o)), !o))
    return "";
  const l = Math.min((r.w * 0.86) / o.w, (r.h * 0.62) / o.h),
    u = r.x + (r.w - o.w * l) / 2,
    c = r.y + (r.h - o.h * l) / 2;
  return `<path d="${wg(Ar(K4(o.geom, l), u, c), 0.12 * l)}" fill="${s}"/>`;
}
function sT(e, t) {
  const n = ne(
      [
        [50, 10],
        [91, 46],
        [9, 46],
      ],
      [2.5, 1.5, 1.5],
    ),
    r = 46 + t,
    s = (90 - r - t * (e - 1)) / e;
  let i = n;
  for (let a = 0; a < e; a++) i += we(17, r + a * (s + t), 66, s, 1.2);
  return i;
}
const iT = [
    {
      id: "haus-negativraum",
      label: "Haus im Negativraum",
      themes: ["haus", "abstrakt"],
      styles: ["modern", "mutig", "luxus"],
      keywords: ["haus", "negativ", "quadrat", "tor", "modern", "zuhause"],
      form: "solid",
      render: (e) =>
        W(
          ne(
            [
              [12, 12],
              [88, 12],
              [88, 88],
              [67, 88],
              [67, 54],
              [50, 37],
              [33, 54],
              [33, 88],
              [12, 88],
            ],
            [7, 7, 7, 0, 0, 0.6, 0, 0, 7],
          ),
          e.main,
        ),
    },
    {
      id: "haus-sprossenfenster",
      label: "Haus mit Sprossenfenster",
      themes: ["haus"],
      styles: ["warm", "modern", "natur"],
      keywords: ["haus", "fenster", "zuhause", "heim", "familie"],
      form: "solid",
      render: (e) => {
        let i = "";
        for (const a of [0, 10 + 3.5])
          for (const o of [0, 10 + 3.5]) i += we(38.25 + a, 54.25 + o, 10, 10, 1.2);
        return W(ne(It(50, 10, 44, 38, 90), [3, 2.5, 3, 3, 2.5]) + i, e.main);
      },
    },
    {
      id: "haus-herz",
      label: "Haus mit Herz",
      themes: ["haus"],
      styles: ["warm", "natur"],
      keywords: ["haus", "herz", "liebe", "familie", "zuhause", "geborgenheit"],
      form: "solid",
      render: (e) => W(ne(It(50, 10, 44, 38, 90), [3, 2.5, 3, 3, 2.5]) + PS(50, 65, 30), e.main),
    },
    {
      id: "haus-etagen",
      label: "Haus aus Etagen",
      themes: ["haus", "abstrakt"],
      styles: ["modern", "mutig"],
      keywords: ["haus", "etagen", "streifen", "linien", "wohnbau", "stockwerk"],
      form: "solid",
      render: (e) => W(sT(3, 5), e.main),
    },
    {
      id: "haus-offen",
      label: "Offenes Haus",
      themes: ["haus", "dach"],
      styles: ["elegant", "modern", "warm"],
      keywords: ["haus", "offen", "willkommen", "tür", "dach", "linie"],
      form: "outline",
      render: (e) => G("M9 51L50 14L91 51", e.main) + G("M23 39V86H41M59 86H77V39", e.main),
    },
    {
      id: "haus-3d",
      label: "Haus in Schrägansicht",
      themes: ["haus", "abstrakt"],
      styles: ["modern", "mutig", "warm"],
      keywords: ["haus", "3d", "raum", "perspektive", "bau", "objekt"],
      form: "solid",
      render: (e) => {
        const n = Jo(
            [
              [10, 52],
              [28, 29],
              [46, 52],
              [46, 89],
              [10, 89],
            ],
            0,
            -9,
          ),
          r = Jo(
            [
              [28, 29],
              [74, 29],
              [92, 52],
              [46, 52],
            ],
            0,
            -9,
          ),
          s = Jo(
            [
              [46, 52],
              [92, 52],
              [92, 89],
              [46, 89],
            ],
            0,
            -9,
          );
        return W(ca([n, r, s], 4.5) + at(28, 55, 5.5), e.main);
      },
    },
    {
      id: "haus-villa",
      label: "Moderne Villa",
      themes: ["haus"],
      styles: ["modern", "luxus", "mutig"],
      keywords: ["villa", "modern", "bauhaus", "architektur", "flachdach", "luxus"],
      form: "solid",
      render: (e) =>
        W(we(26, 16, 66, 34, 1.5) + we(34.5, 24.5, 49, 17, 0.8), e.main) +
        W(we(8, 55, 58, 33, 1.5), e.main) +
        W(we(72, 55, 7, 33, 1), e.accent),
    },
    {
      id: "haus-standort",
      label: "Standort Haus",
      themes: ["haus", "stadt"],
      styles: ["modern", "warm", "mutig"],
      keywords: ["standort", "pin", "lage", "karte", "haus", "adresse"],
      form: "solid",
      render: (e) => {
        const i = Math.acos(0.5849056603773585),
          a = 31 * Math.sin(i),
          o = 39 + 31 * Math.cos(i),
          l = `M50 92L${(50 - a).toFixed(2)} ${o.toFixed(2)}A31 31 0 1 1 ${(50 + a).toFixed(2)} ${o.toFixed(2)}Z`;
        return W(l + ne(It(50, 22, 36, 15, 55), 1.2), e.main);
      },
    },
  ],
  aT = [
    {
      id: "dach-fenster",
      label: "Dach mit Fenster",
      themes: ["dach", "haus"],
      styles: ["modern", "warm", "elegant"],
      keywords: ["dach", "fenster", "haus", "giebel", "zuhause"],
      form: "outline",
      render: (e) => {
        let i = "";
        for (const a of [0, 9.5 + 3])
          for (const o of [0, 9.5 + 3]) i += we(39 + a, 53 + o, 9.5, 9.5, 1);
        return G("M11 60L50 24L89 60", e.main, 7.5) + W(i, e.accent);
      },
    },
    {
      id: "dach-doppelgiebel",
      label: "Doppelgiebel",
      themes: ["dach"],
      styles: ["modern", "elegant", "luxus"],
      keywords: ["dach", "giebel", "linien", "doppelt", "aufstieg"],
      form: "outline",
      render: (e) => G("M13 54L50 20L87 54", e.main) + G("M13 80L50 46L87 80", e.main),
    },
    {
      id: "dach-sparren",
      label: "Gekreuzte Sparren",
      themes: ["dach", "haus"],
      styles: ["elegant", "natur", "warm"],
      keywords: ["dach", "sparren", "holz", "giebel", "kreuz", "zimmerei"],
      form: "outline",
      render: (e) => G("M13 82L55.5 27M87 82L44.5 27", e.main, 7.5) + Wn(50, 62, 7, e.accent),
    },
    {
      id: "dach-tympanon",
      label: "Giebel mit Okulus",
      themes: ["dach", "stadt"],
      styles: ["elegant", "luxus"],
      keywords: ["giebel", "tympanon", "klassisch", "altbau", "palais", "rundfenster"],
      form: "solid",
      render: (e) =>
        W(
          ne(
            [
              [50, 20],
              [92, 60],
              [8, 60],
            ],
            [3, 2, 2],
          ) + at(50, 45, 7),
          e.main,
        ) + W(we(8, 67, 84, 9, 1.2), e.main),
    },
    {
      id: "dach-haeuserzeile",
      label: "Häuserzeile",
      themes: ["dach", "stadt", "haus"],
      styles: ["warm", "modern", "natur"],
      keywords: ["häuser", "reihenhaus", "siedlung", "dach", "nachbarschaft", "zeile"],
      form: "outline",
      render: (e) =>
        G("M10 82V56L23 43L36 56V36L50 20L64 36V56L77 43L90 56V82ZM36 56V82M64 56V82", e.main, 6.5),
    },
    {
      id: "dach-schornstein",
      label: "Dach mit Kamin",
      themes: ["dach", "haus"],
      styles: ["warm", "mutig", "modern"],
      keywords: ["dach", "kamin", "schornstein", "wärme", "heim", "zuhause"],
      form: "solid",
      render: (e) => {
        const t = (n) => 24 + ((n - 50) * 38) / 40;
        return (
          W(
            ne(
              [
                [9, 62],
                [50, 23],
                [91, 62],
                [91, 78],
                [50, 39],
                [9, 78],
              ],
              [1.5, 2.5, 1.5, 1.5, 0.5, 1.5],
            ),
            e.main,
          ) +
          W(
            ne(
              [
                [66, 20],
                [77, 20],
                [77, t(77) - 4.5],
                [66, t(66) - 4.5],
              ],
              [1.2, 1.2, 0, 0],
            ),
            e.main,
          )
        );
      },
    },
    {
      id: "dach-morgensonne",
      label: "Dach mit Sonne",
      themes: ["dach", "natur"],
      styles: ["warm", "natur"],
      keywords: ["sonne", "dach", "morgen", "licht", "horizont", "zuhause"],
      form: "outline",
      render: (e) =>
        G("M10 54L50 18L90 54", e.main) +
        G("M22 82H78", e.main) +
        W("M33 74A17 17 0 0 1 67 74Z", e.accent),
    },
  ],
  oT = (e) => `<g transform="rotate(-45 50 50)">${e}</g>`,
  lT = [
    {
      id: "schluessel-hausreide",
      label: "Schlüssel mit Hausreide",
      themes: ["schluessel", "haus"],
      styles: ["modern", "warm", "elegant"],
      keywords: ["schlüssel", "haus", "übergabe", "kauf", "einzug", "zuhause"],
      form: "outline",
      render: (e) =>
        G(ur(It(50, 9, 29, 21, 51)), e.main) + G("M50 51V91M50 73H62M50 84H62", e.main),
    },
    {
      id: "schluesselloch-bogen",
      label: "Schlüsselloch im Bogen",
      themes: ["schluessel", "tuer"],
      styles: ["elegant", "luxus", "modern"],
      keywords: ["schlüsselloch", "bogen", "tür", "sicherheit", "vertrauen", "eingang"],
      form: "solid",
      render: (e) => W(nn(21, 79, 43, 88) + tl(50, 48, 9.5, 25, 6.5), e.main),
    },
    {
      id: "schluessel-klassisch",
      label: "Klassischer Schlüssel",
      themes: ["schluessel"],
      styles: ["elegant", "luxus", "warm"],
      keywords: ["schlüssel", "klassisch", "vintage", "übergabe", "tradition"],
      form: "outline",
      render: (e) =>
        oT(
          G(at(50, 25, 15), e.main) +
            `<circle cx="50" cy="25" r="4.5" fill="${e.accent}"/>` +
            G("M50 40V90M50 70H63V86H50", e.main),
        ),
    },
    {
      id: "haus-schluesselloch",
      label: "Haus mit Schlüsselloch",
      themes: ["schluessel", "haus"],
      styles: ["modern", "mutig", "warm"],
      keywords: ["haus", "schlüsselloch", "sicherheit", "eigentum", "zuhause"],
      form: "solid",
      render: (e) =>
        W(ne(It(50, 10, 44, 38, 90), [3, 2.5, 3, 3, 2.5]) + tl(50, 59, 9, 21, 6), e.main),
    },
    {
      id: "dach-schluesselloch",
      label: "Dach mit Schlüsselloch",
      themes: ["schluessel", "dach"],
      styles: ["modern", "elegant", "luxus"],
      keywords: ["dach", "schlüsselloch", "haus", "sicherheit", "makler"],
      form: "outline",
      render: (e) => G("M11 54L50 18L89 54", e.main, 7.5) + W(tl(50, 57, 10, 28, 7), e.accent),
    },
    {
      id: "schluessel-hausbart",
      label: "Schlüsselbart als Haus",
      themes: ["schluessel", "haus"],
      styles: ["modern", "mutig", "warm"],
      keywords: ["schlüssel", "bart", "haus", "übergabe", "einzug", "kauf"],
      form: "solid",
      render: (e) =>
        W(at(25, 61, 17) + at(25, 61, 7), e.main) +
        W(we(38, 56, 54, 10, 3), e.main) +
        W(ne(It(78, 24, 38, 14, 58), [1.5, 1, 0, 0, 1]) + we(74.5, 40, 7, 7, 0.6), e.main),
    },
  ];
function uT(e, t, n, r) {
  const s = ((r / ((t + n) / 2)) * 180) / Math.PI,
    i = (180 - 4 * s) / 5;
  let a = "",
    o = "";
  for (let l = 0; l < 5; l++) {
    const u = 180 + l * (i + s),
      c = US(e, t, n, u, u + i);
    l === 2 ? (o = c) : (a += c);
  }
  return { side: a, key: o };
}
const cT = [
  {
    id: "tuer-gruenderzeit",
    label: "Gründerzeit-Portal",
    themes: ["tuer", "stadt"],
    styles: ["elegant", "luxus", "warm"],
    keywords: ["tür", "portal", "altbau", "gründerzeit", "wien", "eingang", "oberlicht"],
    form: "outline",
    render: (e) => {
      const t = [50, 41],
        n = [225, 270, 315]
          .map((r) => {
            const s = ei(t, 24, r);
            return `M50 41L${M(s[0])} ${M(s[1])}`;
          })
          .join("");
      return (
        G(nn(26, 74, 41, 87, !1), e.main, 6) +
        G("M26 41H74M50 41V87" + n, e.main, 6) +
        Wn(44.5, 64, 2.6, e.accent) +
        Wn(55.5, 64, 2.6, e.accent)
      );
    },
  },
  {
    id: "tuer-offen",
    label: "Offene Tür",
    themes: ["tuer", "haus"],
    styles: ["modern", "warm", "mutig"],
    keywords: ["tür", "offen", "willkommen", "eingang", "einzug", "zuhause"],
    form: "solid",
    render: (e) =>
      W(
        ne(
          [
            [20, 90],
            [20, 10],
            [80, 10],
            [80, 90],
            [70, 90],
            [70, 20],
            [30, 20],
            [30, 90],
          ],
          [0, 2.5, 2.5, 0, 0, 0.5, 0.5, 0],
        ),
        e.main,
      ) +
      W(
        ne(
          [
            [34.5, 24],
            [57, 31],
            [57, 83],
            [34.5, 90],
          ],
          0.8,
        ) + at(51.5, 58, 2.8),
        e.main,
      ),
  },
  {
    id: "tuer-arkaden",
    label: "Arkaden",
    themes: ["tuer", "stadt"],
    styles: ["elegant", "luxus", "natur"],
    keywords: ["arkaden", "bogen", "säulengang", "innenhof", "palais", "architektur"],
    form: "outline",
    render: (e) => {
      const t = 13.333333333333334,
        n = [10, 10 + 2 * t, 10 + 4 * t, 90],
        r = `M10 47A${M(t)} ${M(t)} 0 0 1 ${M(n[1])} 47A${M(t)} ${M(t)} 0 0 1 ${M(n[2])} 47A${M(t)} ${M(t)} 0 0 1 90 47`;
      return G("M10 83V17H90V83" + r + `M${M(n[1])} 47V83M${M(n[2])} 47V83`, e.main, 6);
    },
  },
  {
    id: "tuer-portal",
    label: "Portal mit Bögen",
    themes: ["tuer"],
    styles: ["elegant", "luxus", "modern"],
    keywords: ["portal", "bogen", "tür", "eingang", "tor", "durchgang"],
    form: "solid",
    render: (e) =>
      G(nn(17.5, 82.5, 48, 88, !1), e.main, 7, "butt") +
      G(nn(29.5, 70.5, 48, 88, !1), e.main, 7, "butt") +
      W(nn(38, 62, 48, 88), e.main),
  },
  {
    id: "tuer-sprossenfenster",
    label: "Sprossenfenster",
    themes: ["tuer", "haus"],
    styles: ["warm", "natur", "elegant"],
    keywords: ["fenster", "sprossen", "altbau", "licht", "aussicht", "wohnung"],
    form: "outline",
    render: (e) =>
      G(we(26, 9, 48, 66, 2.5), e.main) +
      G("M50 9V75M26 31H74", e.main) +
      W(we(17, 82, 66, 8, 2), e.main),
  },
  {
    id: "tuer-torbogen",
    label: "Torbogen mit Schlussstein",
    themes: ["tuer", "stadt"],
    styles: ["elegant", "luxus", "natur"],
    keywords: ["torbogen", "schlussstein", "stein", "tor", "durchgang", "altbau"],
    form: "solid",
    render: (e) => {
      const t = uT([50, 51], 22, 36, 3.5);
      return (
        W(t.side + we(14, 54.5, 14, 31.5, 0.8) + we(72, 54.5, 14, 31.5, 0.8), e.main) +
        W(t.key, e.accent)
      );
    },
  },
];
function fT(e, t, n, r) {
  const s = Math.acos(n / (r - t)),
    i = n * Math.sin(s),
    a = t + n * Math.cos(s);
  return `M${M(e)} ${M(r)}L${M(e - i)} ${M(a)}A${M(n)} ${M(n)} 0 1 1 ${M(e + i)} ${M(a)}Z`;
}
function dT(e, t, n, r, s) {
  const i = 1 - s;
  return [
    i * i * i * e[0] + 3 * i * i * s * t[0] + 3 * i * s * s * n[0] + s * s * s * r[0],
    i * i * i * e[1] + 3 * i * i * s * t[1] + 3 * i * s * s * n[1] + s * s * s * r[1],
  ];
}
const hT = [
  {
    id: "stadt-silhouette",
    label: "Stadtsilhouette",
    themes: ["stadt"],
    styles: ["modern", "mutig", "warm"],
    keywords: ["stadt", "skyline", "silhouette", "wien", "urban", "kuppel", "turm"],
    form: "solid",
    render: (e) =>
      W(
        ne(
          [
            [9, 88],
            [9, 62],
            [18.5, 52],
            [28, 62],
            [28, 88],
          ],
          [0, 0.8, 1, 0.8, 0],
        ) +
          we(32, 28, 15, 60, 0.8) +
          "M51 88V57A10 10 0 0 1 71 57V88Z" +
          ne(
            [
              [75, 88],
              [75, 38],
              [82.5, 12],
              [90, 38],
              [90, 88],
            ],
            [0, 0.5, 0.8, 0.5, 0],
          ),
        e.main,
      ),
  },
  {
    id: "stadt-dom",
    label: "Domspitze",
    themes: ["stadt"],
    styles: ["elegant", "luxus", "mutig"],
    keywords: ["dom", "turm", "spitze", "wien", "gotik", "innenstadt", "zentrum"],
    form: "solid",
    render: (e) => {
      const t = (n, r, s, i) =>
        ur([
          [n, r - i],
          [n + s, r],
          [n, r + i],
          [n - s, r],
        ]);
      return (
        W(
          ne(
            [
              [50, 8],
              [58, 44],
              [58, 88],
              [42, 88],
              [42, 44],
            ],
            [0.6, 0.6, 0, 0, 0.6],
          ) + nn(46.5, 53.5, 62, 76),
          e.main,
        ) +
        W(
          ne(
            [
              [12, 88],
              [12, 70],
              [37, 48],
              [37, 88],
            ],
            [0, 1, 0.6, 0],
          ) + t(25, 74, 4.2, 6.5),
          e.main,
        ) +
        W(
          ne(
            [
              [63, 48],
              [88, 70],
              [88, 88],
              [63, 88],
            ],
            [0.6, 1, 0, 0],
          ) + t(75, 74, 4.2, 6.5),
          e.main,
        )
      );
    },
  },
  {
    id: "stadt-tuerme",
    label: "Drei Türme",
    themes: ["stadt"],
    styles: ["modern", "mutig", "luxus"],
    keywords: ["hochhaus", "türme", "skyline", "modern", "projekt", "bauträger", "büro"],
    form: "solid",
    render: (e) => {
      const t = (n, r) =>
        ne(
          [
            [n, r],
            [n + 20, r - 9],
            [n + 20, 88],
            [n, 88],
          ],
          [1, 1, 0, 0],
        );
      return W(t(14, 47) + t(40, 22) + t(66, 58), e.main);
    },
  },
  {
    id: "stadt-bruecke",
    label: "Brücke",
    themes: ["stadt", "natur"],
    styles: ["modern", "elegant", "natur"],
    keywords: ["brücke", "donau", "fluss", "verbindung", "wasser", "stadt"],
    form: "outline",
    render: (e) => {
      const t = [
        [18, 52],
        [30, 14],
        [70, 14],
        [82, 52],
      ];
      let n = "";
      for (const r of [0.25, 0.5, 0.75]) {
        const s = dT(...t, r);
        n += `M${M(s[0])} ${M(s[1])}V52`;
      }
      return (
        G("M18 52C30 14 70 14 82 52" + n, e.main, 6) +
        G("M8 52H92M18 52V72M82 52V72", e.main, 6) +
        G("M12 84Q21.5 78 31 84T50 84T69 84T88 84", e.accent, 6)
      );
    },
  },
  {
    id: "stadt-riesenrad",
    label: "Riesenrad",
    themes: ["stadt"],
    styles: ["warm", "mutig", "elegant"],
    keywords: ["riesenrad", "prater", "wien", "freizeit", "rad", "wahrzeichen"],
    form: "outline",
    render: (e) => {
      const t = [50, 38];
      let n = "",
        r = "";
      for (let s = 0; s < 8; s++) {
        const i = ei(t, 27, s * 45 + 22.5);
        ((n += `M50 38L${M(i[0])} ${M(i[1])}`), (r += at(i[0], i[1], 4)));
      }
      return (
        G(n, e.main, 3.5) +
        G(at(50, 38, 27), e.main, 6) +
        W(r, e.main) +
        G("M50 38L33 88M50 38L67 88M24 88H76", e.main, 6) +
        Wn(50, 38, 5, e.accent)
      );
    },
  },
  {
    id: "stadt-fassade",
    label: "Altbau-Fassade",
    themes: ["stadt", "haus"],
    styles: ["elegant", "warm", "luxus"],
    keywords: ["altbau", "fassade", "zinshaus", "gründerzeit", "wien", "wohnung", "fenster"],
    form: "solid",
    render: (e) => {
      let t = "";
      for (const n of [26, 45.5, 65])
        ((t += nn(n, n + 9, 38.5, 48)), (t += we(n, 55, 9, 12, 0.6)), (t += we(n, 73, 9, 12, 0.6)));
      return W(we(12, 12, 76, 8, 1.2), e.main) + W(we(17, 24, 66, 66, 0.8) + t, e.main);
    },
  },
  {
    id: "stadt-kompass",
    label: "Kompass",
    themes: ["stadt", "abstrakt"],
    styles: ["modern", "elegant", "natur"],
    keywords: ["kompass", "orientierung", "richtung", "lage", "navigation", "beratung"],
    form: "outline",
    render: (e) =>
      G(at(50, 50, 38), e.main, 6) +
      W(
        ur([
          [50, 20],
          [58.5, 50],
          [41.5, 50],
        ]),
        e.accent,
      ) +
      W(
        ur([
          [41.5, 50],
          [58.5, 50],
          [50, 80],
        ]),
        e.main,
      ),
  },
  {
    id: "stadt-treppe",
    label: "Treppe",
    themes: ["stadt", "abstrakt"],
    styles: ["modern", "mutig"],
    keywords: ["treppe", "stufen", "aufstieg", "wachstum", "treppenhaus", "wertsteigerung"],
    form: "outline",
    render: (e) => G("M12 82H28V66H44V50H60V34H76V18H88", e.main, 7.5, "square", "miter"),
  },
  {
    id: "stadt-standort",
    label: "Standort",
    themes: ["stadt"],
    styles: ["modern", "warm", "natur"],
    keywords: ["standort", "pin", "lage", "karte", "adresse", "region"],
    form: "outline",
    render: (e) => G(fT(50, 38, 27, 90), e.main) + Wn(50, 38, 9, e.accent),
  },
];
function pT() {
  const e = [
    { apex: 8, top: 8, base: 33, k: 0.64 },
    { apex: 19, top: 37.5, base: 58, k: 0.7 },
    { apex: 30, top: 62.5, base: 82, k: 0.76 },
  ];
  let t = "";
  for (const n of e) {
    const r = (n.top - n.apex) * n.k,
      s = (n.base - n.apex) * n.k,
      i =
        r < 0.5
          ? [
              [50, n.top],
              [50 + s, n.base],
              [50 - s, n.base],
            ]
          : [
              [50 - r, n.top],
              [50 + r, n.top],
              [50 + s, n.base],
              [50 - s, n.base],
            ];
    t += ne(i, 1.2);
  }
  return t + we(46, 86, 8, 6, 0.8);
}
function mT() {
  const e = [8, 86],
    t = [38, 16],
    n = [68, 86],
    r = 4.5,
    s = (p) => t[0] - ((t[0] - e[0]) * (p - t[1])) / (e[1] - t[1]),
    i = (p) => t[0] + ((n[0] - t[0]) * (p - t[1])) / (n[1] - t[1]),
    a = (p) => [
      [s(40 + p), 40 + p],
      [31, 47 + p],
      [38, 40 + p],
      [45, 47 + p],
      [i(40 + p), 40 + p],
    ],
    o = [t, ...a(-r / 2).reverse()],
    l = [...a(r / 2), n, e],
    u = [70, 38],
    c = [92, 86],
    f = [44, 86],
    d = [0.915, -0.404],
    h = ut(t, rt(d, r)),
    m = ut(n, rt(d, r)),
    x = vd(h, m, u, f),
    k = vd(h, m, [0, 86], [100, 86]);
  return ne(o, [0.8, 0, 0, 0, 0, 0]) + ne(l, 0) + ne([u, c, k, x], [0.8, 0, 0, 0]);
}
function gT(e) {
  const t = [30, 90],
    n = [40, 46],
    r = [70, 14];
  let s = "";
  const i = [
    { t: 0.3, side: 1 },
    { t: 0.42, side: -1 },
    { t: 0.6, side: 1 },
    { t: 0.72, side: -1 },
  ];
  for (const o of i) {
    const { p: l, tan: u } = yd(t, n, r, o.t),
      c = NS(u, o.side * 48, [0, 0]);
    s += cu(l, ut(l, rt(c, 24)), 10.5);
  }
  const a = yd(t, n, r, 1);
  return ((s += cu(a.p, ut(a.p, rt(a.tan, 20)), 10)), W(s, e));
}
const vT = [
  {
    id: "natur-haus-blatt",
    label: "Haus mit Blatt",
    themes: ["natur", "haus"],
    styles: ["natur", "warm", "modern"],
    keywords: ["haus", "blatt", "grün", "nachhaltig", "öko", "garten", "natur"],
    form: "solid",
    render: (e) =>
      W(ne(It(50, 10, 44, 38, 90), [3, 2.5, 3, 3, 2.5]) + DS([36, 80], [64, 52], 20, 3.2), e.main),
  },
  {
    id: "natur-blattdach",
    label: "Blatt mit Dachlinien",
    themes: ["natur", "dach"],
    styles: ["natur", "warm", "elegant"],
    keywords: ["blatt", "dach", "nachhaltig", "grün", "wachstum", "natur"],
    form: "solid",
    render: (e) =>
      W(
        cu([50, 8], [50, 92], 54) +
          el(
            [
              [35, 47],
              [50, 33],
              [65, 47],
            ],
            5,
          ) +
          el(
            [
              [31, 69],
              [50, 51],
              [69, 69],
            ],
            5,
          ) +
          el(
            [
              [50, 70],
              [50, 84],
            ],
            5,
          ),
        e.main,
      ),
  },
  {
    id: "natur-huegel-sonne",
    label: "Hügel und Sonne",
    themes: ["natur"],
    styles: ["natur", "warm", "elegant"],
    keywords: ["hügel", "sonne", "landschaft", "land", "weinberg", "ruhe"],
    form: "outline",
    render: (e) =>
      Wn(57, 31, 13, e.accent) + G("M9 70C24 54 40 53 56 66M42 84C56 68 76 66 91 78", e.main),
  },
  {
    id: "natur-wellen",
    label: "Wellen",
    themes: ["natur", "abstrakt"],
    styles: ["natur", "modern", "elegant"],
    keywords: ["welle", "wasser", "donau", "see", "fluss", "meer", "ruhe"],
    form: "outline",
    render: (e) => G(ms(10, 90, 32, 40, 5) + ms(10, 90, 50, 40, 5) + ms(10, 90, 68, 40, 5), e.main),
  },
  {
    id: "natur-haus-wasser",
    label: "Wohnen am Wasser",
    themes: ["natur", "dach"],
    styles: ["natur", "elegant", "modern"],
    keywords: ["wasser", "see", "donau", "dach", "haus", "welle", "ufer"],
    form: "outline",
    render: (e) =>
      G("M12 50L50 16L88 50", e.main) +
      G(ms(18, 82, 66, 32, 4.5) + ms(18, 82, 83, 32, 4.5), e.accent),
  },
  {
    id: "natur-tanne",
    label: "Tanne",
    themes: ["natur"],
    styles: ["natur", "warm", "mutig"],
    keywords: ["tanne", "baum", "wald", "alpen", "natur", "berg", "land"],
    form: "solid",
    render: (e) => W(pT(), e.main),
  },
  {
    id: "natur-berge",
    label: "Bergpanorama",
    themes: ["natur"],
    styles: ["natur", "mutig", "modern"],
    keywords: ["berg", "alpen", "gipfel", "panorama", "land", "tirol", "salzburg"],
    form: "solid",
    render: (e) => W(mT(), e.main),
  },
  {
    id: "natur-zweig",
    label: "Zweig",
    themes: ["natur"],
    styles: ["elegant", "luxus", "natur"],
    keywords: ["zweig", "olive", "blatt", "natur", "garten", "eleganz"],
    form: "solid",
    render: (e) => G("M30 90Q40 46 70 14", e.main, 4.5) + gT(e.main),
  },
  {
    id: "natur-haus-baum",
    label: "Haus im Grünen",
    themes: ["natur", "dach", "haus"],
    styles: ["natur", "warm"],
    keywords: ["baum", "haus", "garten", "grün", "familie", "eigenheim", "land"],
    form: "outline",
    render: (e) =>
      G("M9 76H91M16 76V46L36 28L56 46V76M74 76V56", e.main) + Wn(74, 45, 14, e.accent),
  },
];
function yT(e, t, n) {
  const r = (n / 2) * Math.SQRT2,
    s = (u) => {
      const c = u - 50,
        f = (-c + Math.sqrt(2 * e * e - c * c)) / 2,
        d = u + f;
      return { l: [50 - f, d], r: [50 + f, d], below: d > 50 };
    },
    i = s(t - r),
    a = s(t + r),
    o = `M${M(i.l[0])} ${M(i.l[1])}L50 ${M(t - r)}L${M(i.r[0])} ${M(i.r[1])}A${e} ${e} 0 ${i.below ? 1 : 0} 0 ${M(i.l[0])} ${M(i.l[1])}Z`,
    l = `M${M(a.l[0])} ${M(a.l[1])}L50 ${M(t + r)}L${M(a.r[0])} ${M(a.r[1])}A${e} ${e} 0 ${a.below ? 0 : 1} 1 ${M(a.l[0])} ${M(a.l[1])}Z`;
  return { cap: o, body: l };
}
function Nh(e, t, n) {
  const r = e * Math.tan(Math.PI / 6),
    i = 50 - (2 * r + n * t) / 2 + r,
    a = [
      [50, i - r],
      [50 + e, i],
      [50, i + r],
      [50 - e, i],
    ],
    o = [];
  for (let l = 0; l < n; l++) {
    const u = l * t,
      c = (l + 1) * t;
    (o.push([
      [50 - e, i + u],
      [50, i + r + u],
      [50, i + r + c],
      [50 - e, i + c],
    ]),
      o.push([
        [50, i + r + u],
        [50 + e, i + u],
        [50 + e, i + c],
        [50, i + r + c],
      ]));
  }
  return { top: a, faces: o };
}
const xT = [
    {
      id: "abstrakt-kreis-dach",
      label: "Kreis mit Dachfuge",
      themes: ["abstrakt", "dach"],
      styles: ["modern", "mutig", "warm"],
      keywords: ["kreis", "dach", "fuge", "geometrisch", "modern", "haus"],
      form: "solid",
      render: (e) => {
        const t = yT(42, 34, 5.5);
        return W(t.cap, e.main) + W(t.body, e.main);
      },
    },
    {
      id: "abstrakt-quadrate",
      label: "Verschränkte Quadrate",
      themes: ["abstrakt"],
      styles: ["modern", "elegant", "luxus"],
      keywords: ["quadrate", "verbindung", "partner", "verschränkt", "geometrisch", "team"],
      form: "outline",
      render: (e) => G("M45 62H62V14H14V62H31M69 38H86V86H38V38H55", e.main, 7, "butt", "miter"),
    },
    {
      id: "abstrakt-linienbuendel",
      label: "Linienbündel",
      themes: ["abstrakt", "haus", "dach"],
      styles: ["modern", "elegant", "luxus"],
      keywords: ["linien", "bündel", "giebel", "haus", "minimal", "streifen"],
      form: "outline",
      render: (e) => {
        let t = "";
        for (let n = 14; n <= 86; n += 12) t += `M${n} 86V${14 + Math.abs(n - 50)}`;
        return G(t, e.main, 6.5);
      },
    },
    {
      id: "abstrakt-diamant",
      label: "Diamant",
      themes: ["abstrakt"],
      styles: ["luxus", "elegant", "mutig"],
      keywords: ["diamant", "juwel", "luxus", "wert", "premium", "facetten"],
      form: "solid",
      render: (e) => {
        const t = [31, 17],
          n = [69, 17],
          r = [8, 40],
          s = [92, 40],
          i = [50, 89],
          a = [31, 40],
          o = [50, 40],
          l = [69, 40];
        return W(
          ca(
            [
              [r, t, a],
              [t, o, a],
              [t, n, o],
              [n, l, o],
              [n, s, l],
              [r, a, i],
              [a, o, i],
              [o, l, i],
              [l, s, i],
            ],
            3.2,
          ),
          e.main,
        );
      },
    },
    {
      id: "abstrakt-quader",
      label: "Gestapelte Quader",
      themes: ["abstrakt", "stadt"],
      styles: ["modern", "mutig", "luxus"],
      keywords: ["quader", "bauträger", "projekt", "ebenen", "stockwerke", "entwicklung"],
      form: "solid",
      render: (e) => {
        const t = Nh(36, 13, 3);
        return W(ca([t.top, ...t.faces], 4.5), e.main);
      },
    },
    {
      id: "abstrakt-raum",
      label: "Raum",
      themes: ["abstrakt"],
      styles: ["modern", "elegant", "luxus"],
      keywords: ["raum", "ecken", "rahmen", "fläche", "minimal", "architektur"],
      form: "outline",
      render: (e) =>
        G("M14 44V14H44M86 56V86H56", e.main, 7, "square", "miter") + Wn(50, 50, 8.5, e.accent),
    },
    {
      id: "abstrakt-wuerfel",
      label: "Würfel",
      themes: ["abstrakt"],
      styles: ["modern", "mutig"],
      keywords: ["würfel", "kubus", "raum", "3d", "bau", "projekt"],
      form: "solid",
      render: (e) => {
        const t = Nh(37, 42, 1),
          n = ca([t.top, ...t.faces], 4.5)
            .split("Z")
            .filter(Boolean);
        return W(n[0] + "Z", e.accent) + W(n.slice(1).join("Z") + "Z", e.main);
      },
    },
    {
      id: "abstrakt-raute-haus",
      label: "Raute mit Haus",
      themes: ["abstrakt", "haus"],
      styles: ["mutig", "modern", "luxus"],
      keywords: ["raute", "haus", "diamant", "negativ", "geometrisch"],
      form: "solid",
      render: (e) =>
        W(
          ne(
            [
              [50, 7],
              [93, 50],
              [50, 93],
              [7, 50],
            ],
            6,
          ) + ne(It(50, 31, 46, 15, 68), [1, 0.8, 0.8, 0.8, 0.8]),
          e.main,
        ),
    },
    {
      id: "abstrakt-kreissegmente",
      label: "Kreissegmente",
      themes: ["abstrakt", "natur"],
      styles: ["modern", "elegant", "mutig"],
      keywords: ["kreis", "segmente", "geometrisch", "bauhaus", "quadrat", "blatt"],
      form: "solid",
      render: (e) =>
        W("M47 47H9A38 38 0 0 1 47 9Z" + we(53, 9, 38, 38, 1.5) + we(9, 53, 38, 38, 1.5), e.main) +
        W("M53 53H91A38 38 0 0 1 53 91Z", e.accent),
    },
  ],
  kT = [
    {
      id: "initial-a-giebel",
      label: "A als Giebel",
      themes: ["initialen", "dach"],
      styles: ["modern", "elegant", "mutig"],
      keywords: ["a", "buchstabe", "giebel", "dach", "initiale"],
      form: "outline",
      render: (e) =>
        G("M16 88L50 14L84 88", e.main, 7.5) + G("M26.5 68L50 50L73.5 68", e.accent, 7.5),
    },
    {
      id: "initial-m-giebel",
      label: "M aus zwei Giebeln",
      themes: ["initialen", "dach", "haus"],
      styles: ["modern", "warm", "mutig"],
      keywords: ["m", "buchstabe", "zwei häuser", "doppelhaus", "giebel", "initiale"],
      form: "outline",
      render: (e) => G("M14 81V39L32 19L50 39L68 19L86 39V81", e.main),
    },
    {
      id: "initial-h-haus",
      label: "H mit Dach",
      themes: ["initialen", "haus"],
      styles: ["modern", "elegant", "warm"],
      keywords: ["h", "buchstabe", "haus", "dach", "initiale"],
      form: "outline",
      render: (e) => G("M12 50L50 16L88 50", e.main) + G("M26 40V86M74 40V86M26 64H74", e.main),
    },
    {
      id: "initial-u-haus",
      label: "U mit Haus",
      themes: ["initialen", "haus"],
      styles: ["modern", "warm", "elegant"],
      keywords: ["u", "buchstabe", "haus", "geborgenheit", "hand", "initiale", "unio"],
      form: "outline",
      render: (e) =>
        G("M24 16V56A26 26 0 0 0 76 56V16", e.main, 8) +
        W(ne(It(50, 32, 44, 12, 64), 1.2), e.accent),
    },
  ],
  qc = [...iT, ...aT, ...lT, ...cT, ...hT, ...vT, ...xT, ...kT],
  Eg = fu.map((e) => e.key);
function ST(e) {
  const t = qc.find((n) => n.id === e);
  if (!t) throw new Error(`Unbekanntes Symbol: ${e}`);
  return t;
}
function wT(e) {
  return fu.find((t) => t.key === e) ?? fu[0];
}
function OL(e, t) {
  return qc.filter(
    (n) =>
      (e.length === 0 || n.themes.some((r) => e.includes(r))) &&
      (t.length === 0 || n.styles.some((r) => t.includes(r))),
  );
}
function bT(e) {
  try {
    return Yn(e).cat;
  } catch {
    return "sans";
  }
}
function IL(e, t, n, r = !1) {
  const s = wT(e.container),
    i = r && s.key !== "none",
    a = i ? { main: t.knockout, accent: t.knockout, knockout: t.main } : t,
    o = s.inner;
  let l;
  if (e.kind === "icon") {
    const u = o.w / 100,
      c = ST(e.id).render(a);
    l =
      u === 1 && o.x === 0 && o.y === 0
        ? c
        : `<g transform="translate(${o.x} ${o.y}) scale(${u} ${o.h / 100})">${c}</g>`;
  } else {
    const u = e.konstruktion;
    l =
      (u
        ? rT(
            n.get(e.font),
            `${e.font.key}@${e.font.weight}${e.font.style ?? ""}`,
            e.letters,
            o,
            a.main,
            u,
          )
        : "") || p4(n.get(e.font), e.letters, o, a.main, bT(e.font.key));
  }
  return s.render(t, i) + l;
}
class se extends Error {
  constructor(t) {
    (super(`Ungültiger Wert: ${t}`), (this.path = t), (this.name = "ValidationError"));
  }
}
const Za = ["elegant", "modern", "luxus", "warm", "mutig", "natur"],
  Ya = ["gold", "navy", "gruen", "terra", "schwarz", "blau", "bordeaux", "sand"],
  Fu = ["haus", "dach", "schluessel", "tuer", "stadt", "natur", "initialen", "abstrakt"],
  ET = ["inline", "stacked", "wordmark", "badge"],
  Xc = ["upper", "title", "asis", "lower"],
  TT = ["frame", "arch", "seal"],
  CT = ["full", "upper", "surname", "stacked", "initial", "monogram", "district"],
  LT = new Set(qc.map((e) => e.id)),
  FT = new Map(Mn.map((e) => [e.key, e.weights])),
  MT = new Map(Mn.map((e) => [e.key, e.italics ?? []]));
function ue(e, t) {
  if (!e || typeof e != "object" || Array.isArray(e)) throw new se(t);
  return e;
}
function X(e, t, n, r = {}) {
  if (e == null) {
    if (r.optional) return "";
    throw new se(t);
  }
  if (typeof e != "string" || e.length > n) throw new se(t);
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(e)) throw new se(t);
  if (r.pattern && e && !r.pattern.test(e)) throw new se(t);
  return e;
}
function qe(e, t, n, r) {
  if (typeof e != "number" || !Number.isFinite(e) || e < n || e > r) throw new se(t);
  return e;
}
function Vr(e, t, n = !1) {
  if (e === void 0) return n;
  if (typeof e != "boolean") throw new se(t);
  return e;
}
function Y(e, t, n) {
  if (typeof e != "string" || !t.includes(e)) throw new se(n);
  return e;
}
function Re(e, t, n) {
  if (e === void 0) return [];
  if (!Array.isArray(e) || e.length > t.length) throw new se(n);
  return e.map((r, s) => Y(r, t, `${n}[${s}]`));
}
function ks(e, t) {
  if (typeof e != "string" || !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(e)) throw new se(t);
  const n = e.slice(1);
  return `#${(n.length === 3
    ? n
        .split("")
        .map((r) => r + r)
        .join("")
    : n
  ).toUpperCase()}`;
}
const Tg = /^[A-Za-z0-9_@.-]{1,160}$/,
  Mu = /^[a-z0-9-]{1,60}$/;
function ts(e, t) {
  var a;
  const n = ue(e, t),
    r = X(n.key, `${t}.key`, 40),
    s = FT.get(r);
  if (!s) throw new se(`${t}.key`);
  const i = qe(n.weight, `${t}.weight`, 100, 900);
  if (!s.includes(i)) throw new se(`${t}.weight`);
  if (n.style === void 0 || n.style === "normal") return { key: r, weight: i };
  if (n.style !== "italic" || !((a = MT.get(r)) != null && a.includes(i)))
    throw new se(`${t}.style`);
  return { key: r, weight: i, style: "italic" };
}
function hl(e, t) {
  const n = ue(e, t);
  return {
    font: ts(n.font, `${t}.font`),
    case: Y(n.case, Xc, `${t}.case`),
    tracking: qe(n.tracking, `${t}.tracking`, -0.5, 1),
  };
}
function NT(e, t) {
  if (e == null) return null;
  const n = ue(e, t),
    r = Y(n.container, Eg, `${t}.container`);
  if (n.kind === "icon") {
    const s = X(n.id, `${t}.id`, 60);
    if (!LT.has(s)) throw new se(`${t}.id`);
    return { kind: "icon", id: s, container: r };
  }
  if (n.kind === "monogram") {
    const i = {
      kind: "monogram",
      letters: X(n.letters, `${t}.letters`, 3, { pattern: /^[\p{L}\p{N}&]{1,3}$/u }),
      container: r,
      font: ts(n.font, `${t}.font`),
    };
    return (
      n.konstruktion !== void 0 &&
        (i.konstruktion = Y(
          n.konstruktion,
          ["stamm", "ligatur", "verschraenkt", "negativ"],
          `${t}.konstruktion`,
        )),
      i
    );
  }
  throw new se(`${t}.kind`);
}
function RT(e, t) {
  const n = ue(e, t);
  return {
    id: X(n.id, `${t}.id`, 96, { pattern: Tg }),
    name: X(n.name, `${t}.name`, 60, { pattern: /^[\p{L}\p{N} &.,'-]*$/u }),
    primary: ks(n.primary, `${t}.primary`),
    secondary: ks(n.secondary, `${t}.secondary`),
    accent: ks(n.accent, `${t}.accent`),
    ink: ks(n.ink, `${t}.ink`),
    paper: ks(n.paper, `${t}.paper`),
  };
}
function PL(e, t = "konzept") {
  const n = ue(e, t),
    r = ue(n.colors, `${t}.colors`),
    s = {
      id: X(n.id, `${t}.id`, 160, { pattern: Tg }),
      seed: qe(n.seed, `${t}.seed`, -9007199254740992, 2 ** 53),
      style: Y(n.style, Za, `${t}.style`),
      layout: Y(n.layout, ET, `${t}.layout`),
      symbol: NT(n.symbol, `${t}.symbol`),
      name: hl(n.name, `${t}.name`),
      suffix: hl(n.suffix, `${t}.suffix`),
      tagline: hl(n.tagline, `${t}.tagline`),
      body: ts(n.body, `${t}.body`),
      palette: RT(n.palette, `${t}.palette`),
      colors: {
        symbol: Y(r.symbol, ["primary", "secondary", "accent", "ink"], `${t}.colors.symbol`),
        name: Y(r.name, ["primary", "ink"], `${t}.colors.name`),
        suffix: Y(r.suffix, ["primary", "secondary", "accent", "ink"], `${t}.colors.suffix`),
      },
      divider: Y(n.divider, ["none", "line", "dot"], `${t}.divider`),
    };
  if (
    (n.symbolFilled !== void 0 && (s.symbolFilled = Vr(n.symbolFilled, `${t}.symbolFilled`)),
    n.badge !== void 0 && (s.badge = Y(n.badge, TT, `${t}.badge`)),
    n.typo !== void 0 && (s.typo = IT(n.typo, `${t}.typo`)),
    n.nameFormat !== void 0 && (s.nameFormat = Y(n.nameFormat, CT, `${t}.nameFormat`)),
    n.cardBackground !== void 0 &&
      (s.cardBackground = Y(n.cardBackground, ["paper", "ink", "primary"], `${t}.cardBackground`)),
    n.symbolPosition !== void 0 &&
      (s.symbolPosition = Y(n.symbolPosition, ["right", "below"], `${t}.symbolPosition`)),
    n.symbolSize !== void 0 &&
      (s.symbolSize = Y(n.symbolSize, ["small", "large"], `${t}.symbolSize`)),
    n.recipeId !== void 0 && (s.recipeId = X(n.recipeId, `${t}.recipeId`, 12)),
    n.signature !== void 0 && (s.signature = OT(n.signature, `${t}.signature`)),
    n.legalNaehe !== void 0)
  ) {
    const i = ue(n.legalNaehe, `${t}.legalNaehe`),
      a = Array.isArray(i.merkmale)
        ? i.merkmale.slice(0, 8).map((o, l) => X(o, `${t}.legalNaehe.merkmale.${l}`, 40))
        : [];
    s.legalNaehe = { marke: X(i.marke, `${t}.legalNaehe.marke`, 60), merkmale: a };
  }
  return s;
}
function OT(e, t) {
  const n = ue(e, t),
    r = { id: X(n.id, `${t}.id`, 60, { pattern: Mu }) };
  if (n.params !== void 0) {
    const s = ue(n.params, `${t}.params`),
      i = {};
    for (const a of ["haupt", "neben", "akzent"])
      s[a] !== void 0 && (i[a] = ts(s[a], `${t}.params.${a}`));
    (s.zusatzMassstab !== void 0 &&
      (i.zusatzMassstab =
        Math.round(qe(s.zusatzMassstab, `${t}.params.zusatzMassstab`, 0.75, 1.6) * 100) / 100),
      s.zusatzSchreibung !== void 0 &&
        (i.zusatzSchreibung = Y(s.zusatzSchreibung, Xc, `${t}.params.zusatzSchreibung`)),
      Object.keys(i).length && (r.params = i));
  }
  return r;
}
function IT(e, t) {
  const n = ue(e, t),
    r = {};
  if (n.split !== void 0) {
    const s = ue(n.split, `${t}.split`),
      i = { part: Y(s.part, ["first", "rest"], `${t}.split.part`) };
    (s.font !== void 0 && (i.font = ts(s.font, `${t}.split.font`)),
      s.case !== void 0 && (i.case = Y(s.case, Xc, `${t}.split.case`)),
      s.tracking !== void 0 && (i.tracking = qe(s.tracking, `${t}.split.tracking`, -0.5, 1)),
      s.color !== void 0 &&
        (i.color = Y(s.color, ["primary", "accent", "ink"], `${t}.split.color`)),
      s.stack !== void 0 && (i.stack = Vr(s.stack, `${t}.split.stack`)),
      s.scale !== void 0 && (i.scale = qe(s.scale, `${t}.split.scale`, 0.3, 3)),
      s.joint !== void 0 && (i.joint = Math.round(qe(s.joint, `${t}.split.joint`, 1, 80))),
      (r.split = i));
  }
  (n.ampersand !== void 0 && (r.ampersand = ts(n.ampersand, `${t}.ampersand`)),
    n.rule !== void 0 && (r.rule = Y(n.rule, ["over", "under"], `${t}.rule`)));
  for (const s of ["letterSwap", "inlineSuffix", "camel"])
    n[s] !== void 0 && (r[s] = Vr(n[s], `${t}.${s}`));
  if (
    (n.mark !== void 0 && (r.mark = Y(n.mark, ["dot", "hairline", "macron"], `${t}.mark`)),
    n.sup !== void 0)
  ) {
    const s = ue(n.sup, `${t}.sup`);
    r.sup = {
      art: Y(s.art, ["stern", "grad", "bezirk"], `${t}.sup.art`),
      text: X(s.text, `${t}.sup.text`, 4, { pattern: /^[*°\d]{1,4}$/u }),
    };
  }
  return (
    n.fussnote !== void 0 && (r.fussnote = Vr(n.fussnote, `${t}.fussnote`)),
    n.suffixWrap !== void 0 && (r.suffixWrap = Y(n.suffixWrap, ["klammer"], `${t}.suffixWrap`)),
    n.inlineSep !== void 0 &&
      (r.inlineSep = Y(n.inlineSep, ["slash", "klammer"], `${t}.inlineSep`)),
    n.suffixScale !== void 0 &&
      (r.suffixScale = Math.round(qe(n.suffixScale, `${t}.suffixScale`, 0.3, 0.75) * 100) / 100),
    n.eingriff !== void 0 &&
      (r.eingriff = Y(
        n.eingriff,
        ["querbalken", "fuge", "markierung", "fundament", "umlaut"],
        `${t}.eingriff`,
      )),
    n.markColor !== void 0 &&
      (r.markColor = Y(n.markColor, ["primary", "accent"], `${t}.markColor`)),
    r
  );
}
function DL(e, t = "eingabe") {
  const n = ue(e, t);
  return {
    name: X(n.name, `${t}.name`, 80),
    suffix: X(n.suffix, `${t}.suffix`, 40, { optional: !0 }),
    tagline: X(n.tagline, `${t}.tagline`, 120, { optional: !0 }),
    styles: Re(n.styles, Za, `${t}.styles`),
    colorMoods: Re(n.colorMoods, Ya, `${t}.colorMoods`),
    themes: Re(n.themes, Fu, `${t}.themes`),
    ...(n.place !== void 0 && n.place !== "" ? { place: X(n.place, `${t}.place`, 60) } : {}),
    ...(n.nameKind !== void 0
      ? { nameKind: Y(n.nameKind, ["person", "company"], `${t}.nameKind`) }
      : {}),
    ...(n.ort2 !== void 0 && n.ort2 !== "" ? { ort2: X(n.ort2, `${t}.ort2`, 60) } : {}),
    ...(n.jahr !== void 0 && n.jahr !== "" ? { jahr: DT(n.jahr, `${t}.jahr`) } : {}),
    ...(n.route !== void 0 && n.route !== null ? { route: Fg(n.route, `${t}.route`) } : {}),
  };
}
function PT(e, t = new Date()) {
  if (!/^\d{4}$/.test(e)) return !1;
  const n = Number(e);
  return n >= 1800 && n <= t.getFullYear();
}
function DT(e, t) {
  if (typeof e != "string" || !PT(e)) throw new se(t);
  return e;
}
function UT(e, t) {
  if (!(e == null || e === "")) {
    if (
      typeof e != "string" ||
      e.length > 56e5 ||
      !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(e)
    )
      throw new se(t);
    return e;
  }
}
function UL(e, t = "kontakt") {
  e == null && (e = {});
  const n = ue(e, t),
    r = (a, o) => X(n[a], `${t}.${a}`, o, { optional: !0 }),
    s = {
      person: r("person", 120),
      role: r("role", 80),
      phone: r("phone", 40),
      email: r("email", 120),
      web: X(n.web, `${t}.web`, 200, {
        optional: !0,
        pattern: /^(?!\s*(javascript|data|vbscript):)/i,
      }),
      street: r("street", 120),
      city: r("city", 120),
      unioPartner: Vr(n.unioPartner, `${t}.unioPartner`),
      legal: r("legal", 200),
    };
  (n.instagram !== void 0 && (s.instagram = r("instagram", 120)),
    n.linkedin !== void 0 && (s.linkedin = r("linkedin", 200)));
  const i = UT(n.photo, `${t}.photo`);
  return (i && (s.photo = i), s);
}
function AL(e, t = "namen") {
  if (!Array.isArray(e) || e.length > 200) throw new se(t);
  return e.map((n, r) => {
    const s = ue(n, `${t}[${r}]`);
    return {
      name: X(s.name, `${t}[${r}].name`, 60),
      descriptor: X(s.descriptor, `${t}[${r}].descriptor`, 40, { optional: !0 }),
      kind: X(s.kind, `${t}[${r}].kind`, 30, { pattern: /^[a-z-]{1,30}$/ }),
    };
  });
}
const Cg = ["wohnen", "haeuser", "luxus", "anleger", "gewerbe", "neubau", "land"];
function BL(e, t = "kontext") {
  const n = ue(e, t),
    r = { keywords: [], focus: [] };
  if (
    (n.person !== void 0 && n.person !== "" && (r.person = X(n.person, `${t}.person`, 80)),
    n.company !== void 0 && n.company !== "" && (r.company = X(n.company, `${t}.company`, 80)),
    n.keywords !== void 0)
  ) {
    if (!Array.isArray(n.keywords) || n.keywords.length > 7) throw new se(`${t}.keywords`);
    r.keywords = n.keywords.map((s, i) => X(s, `${t}.keywords[${i}]`, 40));
  }
  return ((r.focus = [...new Set(Re(n.focus, Cg, `${t}.focus`))]), r);
}
const AT = ["person", "buero", "person-dann-buero"],
  BT = ["einstieg", "mitte", "premium", "luxus"],
  $T = ["franchise", "bank", "platzhirsch", "online", "privat"],
  _T = [
    "verlag",
    "uhrmacher",
    "architektur",
    "privatbank",
    "hotel",
    "cafe",
    "galerie",
    "tech",
    "manufaktur",
    "weingut",
    "sport",
    "mode",
  ],
  zT = ["gold-schwarz", "haus-icon", "skyline", "schluessel", "schreibschrift", "monogramm-kreis"],
  jT = ["serif", "contrast", "caps", "width", "symbol", "dark"],
  GT = ["warmth", "saturation"],
  Rh = ["a", "b", "egal"],
  HT = ["formell", "ernst", "sachlich", "leise"],
  WT = [
    "serif",
    "contrast",
    "width",
    "weight",
    "caps",
    "tracking",
    "warmth",
    "saturation",
    "dark",
    "symbol",
  ],
  Oh = [
    "didone",
    "antiqua",
    "geometric",
    "grotesk",
    "condensed",
    "mono",
    "script",
    "slab",
    "stencil",
    "extended",
  ],
  VT = [
    "person",
    "ort",
    "kunstwort",
    "kombination",
    "bildhaft",
    "fremdsprachig",
    "abgewandelt",
    "kurz",
    "klassisch",
    "initialen",
  ],
  So = /^[a-z0-9._-]{1,40}$/,
  KT = ["neu", "einige", "lange"],
  qT = [
    "erstkauf",
    "familie",
    "verkleinern",
    "erbe",
    "trennung",
    "anleger",
    "zuzug",
    "landwunsch",
    "unternehmer",
    "bautraeger",
  ],
  XT = [
    "ehrlichkeit",
    "verlaesslichkeit",
    "genauigkeit",
    "diskretion",
    "naehe",
    "tempo",
    "gestaltung",
    "mut",
    "bestaendigkeit",
    "offenheit",
  ],
  Ih = [
    "aufrichtig",
    "kompetent",
    "kultiviert",
    "begeisternd",
    "bodenstaendig",
    "ruhig",
    "durchsetzungsstark",
    "herzlich",
    "organisiert",
  ];
function Xi(e, t, n, r) {
  const s = [...new Set(Re(e, t, r))];
  if (s.length > n) throw new se(r);
  return s;
}
function pl(e, t, n) {
  if (e === void 0) return [];
  if (!Array.isArray(e) || e.length > n) throw new se(t);
  return [...new Set(e.map((r, s) => X(r, `${t}[${s}]`, 40, { pattern: So })))];
}
function Ft(e, t, n, r) {
  if (e === void 0) return [];
  if (!Array.isArray(e) || e.length > n) throw new se(t);
  return e.map((s, i) => X(s, `${t}[${i}]`, r));
}
function ma(e, t, n, r) {
  const s = ue(e, t),
    i = {};
  for (const [a, o] of Object.entries(s)) {
    if (!n.includes(a)) throw new se(`${t}.${a}`);
    o !== void 0 && (i[a] = r(o, `${t}.${a}`));
  }
  return i;
}
const Ss = (e, t, n) => (e === void 0 || e === "" ? void 0 : X(e, t, n));
function Lg(e, t = "kompass") {
  const n = ue(e, t);
  if (n.version !== void 0 && n.version !== 1) throw new se(`${t}.version`);
  const r = { version: 1 };
  (n.architecture !== void 0 && (r.architecture = Y(n.architecture, AT, `${t}.architecture`)),
    n.erfahrung !== void 0 && (r.erfahrung = Y(n.erfahrung, KT, `${t}.erfahrung`)),
    n.wunschkunde !== void 0 && (r.wunschkunde = Xi(n.wunschkunde, qT, 2, `${t}.wunschkunde`)),
    n.werte !== void 0 && (r.werte = Xi(n.werte, XT, 2, `${t}.werte`)),
    n.wirkung !== void 0 && (r.wirkung = Xi(n.wirkung, Ih, 2, `${t}.wirkung`)),
    n.fremdbild !== void 0 && (r.fremdbild = Xi(n.fremdbild, Ih, 2, `${t}.fremdbild`)));
  const s = Ss(n.person, `${t}.person`, 80);
  (s && (r.person = s), n.hasName !== void 0 && (r.hasName = Vr(n.hasName, `${t}.hasName`)));
  const i = Ss(n.name, `${t}.name`, 80);
  i && (r.name = i);
  const a = Ss(n.place, `${t}.place`, 60);
  (a && (r.place = a),
    n.focus !== void 0 && (r.focus = [...new Set(Re(n.focus, Cg, `${t}.focus`))]),
    n.segment !== void 0 && (r.segment = Y(n.segment, BT, `${t}.segment`)),
    n.side !== void 0 && (r.side = Math.round(qe(n.side, `${t}.side`, -2, 2))),
    n.alternative !== void 0 && (r.alternative = Y(n.alternative, $T, `${t}.alternative`)),
    n.onlyness !== void 0 && (r.onlyness = pl(n.onlyness, `${t}.onlyness`, 2)));
  const o = Ss(n.onlynessText, `${t}.onlynessText`, 300);
  o && (r.onlynessText = o);
  const l = Ss(n.proof, `${t}.proof`, 300);
  if (
    (l && (r.proof = l),
    n.voice !== void 0 &&
      (r.voice = ma(n.voice, `${t}.voice`, HT, (u, c) => {
        const f = qe(u, c, -1, 1);
        if (f !== -1 && f !== 0 && f !== 1) throw new se(c);
        return f;
      })),
    n.logoPairs !== void 0 &&
      (r.logoPairs = ma(n.logoPairs, `${t}.logoPairs`, jT, (u, c) => Y(u, Rh, c))),
    n.colorPairs !== void 0 &&
      (r.colorPairs = ma(n.colorPairs, `${t}.colorPairs`, GT, (u, c) => Y(u, Rh, c))),
    n.avoidColors !== void 0 &&
      (r.avoidColors = [...new Set(Re(n.avoidColors, Ya, `${t}.avoidColors`))]),
    n.avoidCliches !== void 0 &&
      (r.avoidCliches = [...new Set(Re(n.avoidCliches, zT, `${t}.avoidCliches`))]),
    n.reference !== void 0 && (r.reference = Y(n.reference, _T, `${t}.reference`)),
    n.social !== void 0)
  ) {
    const u = ue(n.social, `${t}.social`),
      c = {};
    if (
      (u.channels !== void 0 && (c.channels = pl(u.channels, `${t}.social.channels`, 8)),
      u.camera !== void 0 &&
        (c.camera = Y(u.camera, ["gesicht", "stimme", "objekte"], `${t}.social.camera`)),
      u.hoursPerWeek !== void 0 &&
        (c.hoursPerWeek = qe(u.hoursPerWeek, `${t}.social.hoursPerWeek`, 0, 40)),
      u.formats !== void 0)
    ) {
      const f = ue(u.formats, `${t}.social.formats`),
        d = {},
        h = Object.entries(f);
      if (h.length > 10) throw new se(`${t}.social.formats`);
      for (const [m, x] of h) {
        if (!So.test(m)) throw new se(`${t}.social.formats`);
        d[m] = Y(x, ["gern", "geht", "nie"], `${t}.social.formats.${m}`);
      }
      c.formats = d;
    }
    (u.never !== void 0 && (c.never = pl(u.never, `${t}.social.never`, 8)), (r.social = c));
  }
  return r;
}
function ZT(e, t) {
  return ma(e, t, WT, (n, r) => {
    const s = ue(n, r);
    return { v: qe(s.v, `${r}.v`, -1, 1), sicher: qe(s.sicher, `${r}.sicher`, 0, 1) };
  });
}
function Fg(e, t) {
  const n = ue(e, t),
    r = ue(n.kindMix, `${t}.kindMix`),
    s = (i) => qe(r[i], `${t}.kindMix.${i}`, 0, 100);
  return {
    territory: X(n.territory, `${t}.territory`, 40, { pattern: So }),
    styles: Re(n.styles, Za, `${t}.styles`),
    colorMoods: Re(n.colorMoods, Ya, `${t}.colorMoods`),
    avoidColorMoods: Re(n.avoidColorMoods, Ya, `${t}.avoidColorMoods`),
    themes: Re(n.themes, Fu, `${t}.themes`),
    avoidThemes: Re(n.avoidThemes, Fu, `${t}.avoidThemes`),
    fontForms: Re(n.fontForms, Oh, `${t}.fontForms`),
    avoidFontForms: Re(n.avoidFontForms, Oh, `${t}.avoidFontForms`),
    avoidContainers: Re(n.avoidContainers, Eg, `${t}.avoidContainers`),
    axes: n.axes === void 0 ? {} : ZT(n.axes, `${t}.axes`),
    kindMix: {
      wortmarke: s("wortmarke"),
      monogramm: s("monogramm"),
      zeichen: s("zeichen"),
      vorlage: s("vorlage"),
    },
    signatureStyles: Re(n.signatureStyles, Za, `${t}.signatureStyles`),
    avoidSignatureIds:
      n.avoidSignatureIds === void 0
        ? []
        : Ft(n.avoidSignatureIds, `${t}.avoidSignatureIds`, 200, 60).map((i, a) =>
            X(i, `${t}.avoidSignatureIds[${a}]`, 60, { pattern: Mu }),
          ),
    nameKinds: Re(n.nameKinds, VT, `${t}.nameKinds`),
    ...(n.signatureIds === void 0
      ? {}
      : {
          signatureIds: Ft(n.signatureIds, `${t}.signatureIds`, 200, 60).map((i, a) =>
            X(i, `${t}.signatureIds[${a}]`, 60, { pattern: Mu }),
          ),
        }),
    ...(n.avoidPaletteIds === void 0
      ? {}
      : {
          avoidPaletteIds: Ft(n.avoidPaletteIds, `${t}.avoidPaletteIds`, 100, 40).map((i, a) =>
            X(i, `${t}.avoidPaletteIds[${a}]`, 40, { pattern: /^[a-z0-9-]{1,40}$/ }),
          ),
        }),
    keywordFields: Ft(n.keywordFields, `${t}.keywordFields`, 40, 60),
    keywords: Ft(n.keywords, `${t}.keywords`, 40, 60),
    seed: qe(n.seed, `${t}.seed`, -9007199254740992, 2 ** 53),
  };
}
function YT(e, t) {
  const n = ue(e, t),
    r = (s, i) => X(n[s], `${t}.${s}`, i, { optional: !0 });
  return {
    kernidee: r("kernidee", 600),
    schluesselwoerter: Ft(n.schluesselwoerter, `${t}.schluesselwoerter`, 8, 60),
    warum: r("warum", 600),
    onlyness: r("onlyness", 600),
    positionierung: r("positionierung", 900),
    claim: r("claim", 120),
    storyKurz: r("storyKurz", 600),
    storyMittel: r("storyMittel", 1600),
    tonBeispiele: Ft(n.tonBeispiele, `${t}.tonBeispiele`, 6, 400),
    sagen: Ft(n.sagen, `${t}.sagen`, 12, 240),
    vermeiden: Ft(n.vermeiden, `${t}.vermeiden`, 12, 240),
    leitplanken: Ft(n.leitplanken, `${t}.leitplanken`, 12, 300),
    passtFuer: r("passtFuer", 500),
    risiko: r("risiko", 500),
    quelle: Y(n.quelle, ["regel", "ki"], `${t}.quelle`),
    ...(n.socialKit !== void 0 && n.socialKit !== null
      ? { socialKit: QT(n.socialKit, `${t}.socialKit`) }
      : {}),
    ...(n.persoenlichkeit !== void 0
      ? {
          persoenlichkeit: Ph(n.persoenlichkeit, `${t}.persoenlichkeit`, 5, (s, i) => ({
            eigenschaft: X(s.eigenschaft, `${i}.eigenschaft`, 60),
            satz: X(s.satz, `${i}.satz`, 300),
          })),
        }
      : {}),
    ...(n.wunschkunde !== void 0 ? { wunschkunde: X(n.wunschkunde, `${t}.wunschkunde`, 400) } : {}),
    ...(n.versprechen !== void 0 ? { versprechen: X(n.versprechen, `${t}.versprechen`, 400) } : {}),
    ...(n.formate !== void 0
      ? {
          formate: Ph(n.formate, `${t}.formate`, 5, (s, i) => ({
            format: X(s.format, `${i}.format`, 60),
            rhythmus: X(s.rhythmus, `${i}.rhythmus`, 80),
            satz: X(s.satz, `${i}.satz`, 300),
          })),
        }
      : {}),
  };
}
function Ph(e, t, n, r) {
  if (!Array.isArray(e) || e.length > n) throw new se(t);
  return e.map((s, i) => r(ue(s, `${t}[${i}]`), `${t}[${i}]`));
}
function QT(e, t) {
  const n = ue(e, t);
  if (!Array.isArray(n.saeulen) || n.saeulen.length > 4) throw new se(`${t}.saeulen`);
  return {
    saeulen: n.saeulen.map((r, s) => {
      const i = ue(r, `${t}.saeulen[${s}]`);
      return {
        titel: X(i.titel, `${t}.saeulen[${s}].titel`, 60),
        hooks: Ft(i.hooks, `${t}.saeulen[${s}].hooks`, 10, 300),
      };
    }),
    profiltext: X(n.profiltext, `${t}.profiltext`, 600, { optional: !0 }),
  };
}
function JT(e, t = "route") {
  const n = ue(e, t);
  return {
    id: Y(n.id, ["A", "B", "C"], `${t}.id`),
    art: Y(n.art, ["sicher", "mutig", "ueberraschend"], `${t}.art`),
    territory: X(n.territory, `${t}.territory`, 40, { pattern: So }),
    titel: X(n.titel, `${t}.titel`, 120),
    params: Fg(n.params, `${t}.params`),
    texte: YT(n.texte, `${t}.texte`),
  };
}
const Zc = "unio-brand:namefinder",
  eC = ["elegant", "modern", "luxus", "warm", "mutig", "natur", "egal"];
function Mg(e = (Date.now() ^ Math.floor(Math.random() * 16777215)) >>> 0) {
  return {
    person: "",
    company: "",
    region: "",
    focus: [],
    style: "egal",
    keywords: "",
    seed: e,
    pages: 1,
    submitted: !1,
    saved: [],
    chips: [],
    creativity: "ausgewogen",
    exclude: "",
    maxLength: null,
    description: "",
    hidden: [],
    learnIgnore: [],
    lenCap: null,
    autoExclude: [],
    damp: [],
    batches: [],
  };
}
function $L(e) {
  return {
    liked: e.saved.filter((t) => !e.learnIgnore.includes(t.id)).map((t) => t.name),
    disliked: e.hidden.map((t) => t.name),
    lenCap: e.lenCap,
    autoExclude: [...e.autoExclude],
    damp: [...e.damp],
  };
}
function _L(e) {
  return [
    ...new Set(
      e
        .split(/[,;\n]+/)
        .map((t) => t.trim().toLocaleLowerCase("de-AT"))
        .filter((t) => t.length >= 2),
    ),
  ].slice(0, 20);
}
const tC = new Set([
  "ich",
  "wir",
  "und",
  "oder",
  "mit",
  "für",
  "fuer",
  "in",
  "im",
  "an",
  "am",
  "auf",
  "der",
  "die",
  "das",
  "den",
  "dem",
  "des",
  "ein",
  "eine",
  "einen",
  "einem",
  "verkaufe",
  "vermiete",
  "verkaufen",
  "vermieten",
  "suche",
  "biete",
  "junge",
  "neue",
  "alte",
  "von",
  "zu",
  "zum",
  "zur",
  "bin",
  "sind",
  "mein",
  "meine",
  "unser",
  "unsere",
]);
function nC(e) {
  const t = e
      .replace(/[^\p{L}\s-]/gu, " ")
      .split(/\s+/)
      .filter(Boolean),
    n = [];
  for (const r of t) {
    if (
      r.length < 4 ||
      tC.has(r.toLocaleLowerCase("de-AT")) ||
      r[0] !== r[0].toLocaleUpperCase("de-AT")
    )
      continue;
    const s = r.match(
        /^(.{4,}?)(wohnungen|wohnung|häuser|haeuser|haus|immobilien|objekte|objekt)$/i,
      ),
      i = s ? s[1].replace(/^./, (a) => a.toLocaleUpperCase("de-AT")) : r;
    n.includes(i) || n.push(i);
  }
  return n.slice(0, 4);
}
const zL = (e) =>
    !!(
      e.person.trim() ||
      (e.company ?? "").trim() ||
      e.region.trim() ||
      e.keywords.trim() ||
      nC(e.description ?? "").length ||
      e.route
    ),
  Ve = (e, t) => (typeof e == "string" ? e.slice(0, t) : "");
function rC(e) {
  const t = Mg();
  if (!e) return t;
  try {
    const n = JSON.parse(e),
      r = Array.isArray(n.saved)
        ? n.saved
            .filter(
              (f) =>
                f &&
                typeof f.name == "string" &&
                typeof f.kind == "string" &&
                /^[a-z-]{1,30}$/.test(f.kind),
            )
            .slice(0, 200)
            .map((f) => ({
              id: Ve(f.id, 96) || Ve(f.name, 60),
              name: Ve(f.name, 60),
              suffix: Ve(f.suffix, 40),
              kind: f.kind,
              reason: Ve(f.reason, 200) || void 0,
              ...(typeof f.style == "string" && /^[a-z]{1,30}$/.test(f.style)
                ? { style: f.style }
                : {}),
            }))
        : [],
      s = (f, d, h) =>
        Array.isArray(f)
          ? f
              .filter((m) => typeof m == "string")
              .map((m) => m.slice(0, h))
              .slice(0, d)
          : [],
      i = (f) => {
        if (!f || typeof f != "object") return null;
        const d = f;
        return {
          liked: s(d.liked, 200, 60),
          disliked: s(d.disliked, 400, 60),
          lenCap: a(d.lenCap),
          autoExclude: s(d.autoExclude, 20, 30),
          damp: s(d.damp, 10, 30),
        };
      },
      a = (f) => (typeof f == "number" && f >= 3 && f <= 25 ? Math.round(f) : null),
      o = Array.isArray(n.hidden)
        ? n.hidden
            .filter((f) => f && typeof f.name == "string")
            .slice(0, 400)
            .map((f) => ({
              id: Ve(f.id, 96) || Ve(f.name, 60),
              name: Ve(f.name, 60),
              reason: Ve(f.reason, 120) || void 0,
            }))
        : [],
      l = n.creativity;
    let u, c;
    try {
      (n.route && (u = JT(n.route)), n.brief && (c = Lg(n.brief)));
    } catch {
      ((u = void 0), (c = void 0));
    }
    return {
      ...(u ? { route: u } : {}),
      ...(c ? { brief: c } : {}),
      chips: s(n.chips, 12, 30).filter((f) => /^[a-z-]{1,30}$/.test(f)),
      creativity: l === "direkt" || l === "frei" ? l : "ausgewogen",
      exclude: Ve(n.exclude, 300),
      maxLength: a(n.maxLength),
      description: Ve(n.description, 200),
      hidden: o,
      learnIgnore: s(n.learnIgnore, 200, 96),
      lenCap: a(n.lenCap),
      autoExclude: s(n.autoExclude, 20, 30),
      damp: s(n.damp, 10, 30),
      batches: Array.isArray(n.batches)
        ? n.batches
            .map(i)
            .filter((f) => !!f)
            .slice(0, 50)
        : [],
      person: Ve(n.person, 80),
      company: Ve(n.company, 80),
      region: Ve(n.region, 60),
      focus: Array.isArray(n.focus)
        ? n.focus.filter((f) => typeof f == "string" && /^[a-z-]{1,30}$/.test(f)).slice(0, 10)
        : [],
      style: eC.includes(n.style) ? n.style : "egal",
      keywords: Ve(n.keywords, 60),
      seed: typeof n.seed == "number" && Number.isFinite(n.seed) ? n.seed >>> 0 : t.seed,
      pages: typeof n.pages == "number" && n.pages >= 1 && n.pages <= 50 ? Math.floor(n.pages) : 1,
      submitted: n.submitted === !0,
      saved: r,
    };
  } catch {
    return t;
  }
}
function sC() {
  try {
    return rC(localStorage.getItem(Zc));
  } catch {
    return Mg();
  }
}
function iC(e) {
  try {
    localStorage.setItem(Zc, JSON.stringify(e));
  } catch {}
}
function jL() {
  try {
    localStorage.removeItem(Zc);
  } catch {}
}
const ge = (e, t, n, r, s, i) => ({
    name: t,
    kind: "bezirk",
    district: e,
    ...([13, 18, 19].includes(e) ? { villa: !0 } : {}),
    adj: n,
    loc: r,
    parent: "Wien",
    marks: s,
    aliases: i,
  }),
  Yc = [
    ge(1, "Innere Stadt", void 0, "in der Inneren Stadt", void 0, [
      "city",
      "erster bezirk",
      "innenstadt",
    ]),
    ge(2, "Leopoldstadt", "Leopoldstädter", "in der Leopoldstadt", [
      { name: "Augarten", at: "am Augarten" },
      { name: "Prater", at: "am Prater" },
    ]),
    ge(3, "Landstraße", "Landstraßer", "auf der Landstraße", [
      { name: "Belvedere", at: "am Belvedere" },
    ]),
    ge(4, "Wieden", "Wiedner", "auf der Wieden"),
    ge(5, "Margareten", "Margaretner", "in Margareten"),
    ge(6, "Mariahilf", "Mariahilfer", "in Mariahilf"),
    ge(7, "Neubau", "Neubauer", "in Neubau", [{ name: "Spittelberg", at: "am Spittelberg" }]),
    ge(8, "Josefstadt", "Josefstädter", "in der Josefstadt"),
    ge(9, "Alsergrund", "Alsergrunder", "am Alsergrund"),
    ge(10, "Favoriten", "Favoritner", "in Favoriten"),
    ge(11, "Simmering", "Simmeringer", "in Simmering"),
    ge(12, "Meidling", "Meidlinger", "in Meidling"),
    ge(13, "Hietzing", "Hietzinger", "in Hietzing", [
      { name: "Ober St. Veit", at: "in Ober St. Veit" },
    ]),
    ge(14, "Penzing", "Penzinger", "in Penzing", [
      { name: "Hütteldorf", at: "in Hütteldorf", adj: "Hütteldorfer" },
    ]),
    ge(15, "Rudolfsheim-Fünfhaus", void 0, "in Rudolfsheim-Fünfhaus", void 0, [
      "rudolfsheim",
      "fuenfhaus",
    ]),
    ge(16, "Ottakring", "Ottakringer", "in Ottakring", [
      { name: "Wilhelminenberg", at: "am Wilhelminenberg" },
    ]),
    ge(17, "Hernals", "Hernalser", "in Hernals"),
    ge(18, "Währing", "Währinger", "in Währing", [
      { name: "Türkenschanzpark", at: "am Türkenschanzpark" },
      { name: "Gersthof", at: "in Gersthof", adj: "Gersthofer" },
    ]),
    ge(19, "Döbling", "Döblinger", "in Döbling", [
      { name: "Kahlenberg", at: "am Kahlenberg" },
      { name: "Hohe Warte", at: "an der Hohen Warte" },
      { name: "Grinzing", at: "in Grinzing", adj: "Grinzinger" },
      { name: "Sievering", at: "in Sievering", adj: "Sieveringer" },
      { name: "Nussdorf", at: "in Nussdorf", adj: "Nussdorfer" },
    ]),
    ge(20, "Brigittenau", "Brigittenauer", "in der Brigittenau"),
    ge(21, "Floridsdorf", "Floridsdorfer", "in Floridsdorf", [
      { name: "Stammersdorf", at: "in Stammersdorf", adj: "Stammersdorfer" },
    ]),
    ge(22, "Donaustadt", "Donaustädter", "in der Donaustadt", [
      { name: "Alte Donau", at: "an der Alten Donau" },
    ]),
    ge(23, "Liesing", "Liesinger", "in Liesing", [
      { name: "Rodaun", at: "in Rodaun", adj: "Rodauner" },
    ]),
  ],
  aC = [
    {
      name: "Niederösterreich",
      kind: "land",
      loc: "in Niederösterreich",
      rural: !0,
      aliases: ["noe"],
    },
    { name: "Oberösterreich", kind: "land", loc: "in Oberösterreich", rural: !0, aliases: ["ooe"] },
    { name: "Steiermark", kind: "land", loc: "in der Steiermark", rural: !0 },
    {
      name: "Kärnten",
      kind: "land",
      loc: "in Kärnten",
      adj: "Kärntner",
      rural: !0,
      marks: [{ name: "Wörthersee", at: "am Wörthersee" }],
    },
    { name: "Tirol", kind: "land", loc: "in Tirol", adj: "Tiroler", rural: !0 },
    {
      name: "Vorarlberg",
      kind: "land",
      loc: "in Vorarlberg",
      adj: "Vorarlberger",
      rural: !0,
      marks: [{ name: "Bodensee", at: "am Bodensee" }],
    },
    {
      name: "Burgenland",
      kind: "land",
      loc: "im Burgenland",
      rural: !0,
      marks: [{ name: "Neusiedler See", at: "am Neusiedler See" }],
    },
  ],
  oC = [
    { name: "Wien", kind: "stadt", loc: "in Wien", adj: "Wiener", aliases: ["vienna"] },
    {
      name: "Graz",
      kind: "stadt",
      loc: "in Graz",
      adj: "Grazer",
      marks: [
        { name: "Schloßberg", at: "am Schloßberg" },
        { name: "Mur", at: "an der Mur" },
        { name: "Ruckerlberg", at: "am Ruckerlberg" },
        { name: "Rosenhain", at: "am Rosenhain" },
      ],
    },
    {
      name: "Linz",
      kind: "stadt",
      loc: "in Linz",
      adj: "Linzer",
      marks: [
        { name: "Pöstlingberg", at: "am Pöstlingberg" },
        { name: "Donau", at: "an der Donau" },
      ],
    },
    {
      name: "Salzburg",
      kind: "stadt",
      loc: "in Salzburg",
      adj: "Salzburger",
      marks: [
        { name: "Mönchsberg", at: "am Mönchsberg" },
        { name: "Gaisberg", at: "am Gaisberg" },
        { name: "Salzach", at: "an der Salzach" },
      ],
    },
    {
      name: "Innsbruck",
      kind: "stadt",
      loc: "in Innsbruck",
      adj: "Innsbrucker",
      marks: [
        { name: "Nordkette", at: "an der Nordkette" },
        { name: "Inn", at: "am Inn" },
      ],
    },
    {
      name: "Klagenfurt",
      kind: "stadt",
      loc: "in Klagenfurt",
      adj: "Klagenfurter",
      marks: [
        { name: "Wörthersee", at: "am Wörthersee" },
        { name: "Kreuzbergl", at: "am Kreuzbergl" },
      ],
    },
    {
      name: "St. Pölten",
      kind: "stadt",
      loc: "in St. Pölten",
      adj: "St. Pöltner",
      aliases: ["sankt poelten", "st poelten"],
    },
    {
      name: "Bregenz",
      kind: "stadt",
      loc: "in Bregenz",
      adj: "Bregenzer",
      marks: [
        { name: "Bodensee", at: "am Bodensee" },
        { name: "Pfänder", at: "am Pfänder" },
      ],
    },
    { name: "Eisenstadt", kind: "stadt", loc: "in Eisenstadt", adj: "Eisenstädter" },
    { name: "Villach", kind: "stadt", loc: "in Villach", adj: "Villacher" },
    { name: "Wels", kind: "stadt", loc: "in Wels", adj: "Welser" },
    { name: "Steyr", kind: "stadt", loc: "in Steyr", adj: "Steyrer" },
    { name: "Leoben", kind: "stadt", loc: "in Leoben", adj: "Leobener" },
    {
      name: "Krems",
      kind: "stadt",
      loc: "in Krems",
      adj: "Kremser",
      marks: [{ name: "Donau", at: "an der Donau" }],
    },
    { name: "Baden", kind: "stadt", loc: "in Baden", adj: "Badener" },
    { name: "Mödling", kind: "stadt", loc: "in Mödling", adj: "Mödlinger" },
    { name: "Klosterneuburg", kind: "stadt", loc: "in Klosterneuburg", adj: "Klosterneuburger" },
    { name: "Wiener Neustadt", kind: "stadt", loc: "in Wiener Neustadt", adj: "Wiener Neustädter" },
    {
      name: "Tulln",
      kind: "stadt",
      loc: "in Tulln",
      adj: "Tullner",
      marks: [{ name: "Donau", at: "an der Donau" }],
    },
    { name: "Perchtoldsdorf", kind: "stadt", loc: "in Perchtoldsdorf", adj: "Perchtoldsdorfer" },
    { name: "Dornbirn", kind: "stadt", loc: "in Dornbirn", adj: "Dornbirner" },
    { name: "Feldkirch", kind: "stadt", loc: "in Feldkirch", adj: "Feldkircher" },
    { name: "Kitzbühel", kind: "stadt", loc: "in Kitzbühel", adj: "Kitzbüheler", rural: !0 },
    {
      name: "Gmunden",
      kind: "stadt",
      loc: "in Gmunden",
      adj: "Gmundner",
      rural: !0,
      marks: [{ name: "Traunsee", at: "am Traunsee" }],
    },
    { name: "Bad Ischl", kind: "stadt", loc: "in Bad Ischl", adj: "Ischler", rural: !0 },
    {
      name: "Zell am See",
      kind: "stadt",
      loc: "in Zell am See",
      rural: !0,
      marks: [{ name: "Zeller See", at: "am Zeller See" }],
    },
    { name: "Hallein", kind: "stadt", loc: "in Hallein", adj: "Halleiner" },
  ],
  lC = [
    {
      name: "Salzkammergut",
      kind: "region",
      loc: "im Salzkammergut",
      rural: !0,
      marks: [
        { name: "Traunsee", at: "am Traunsee" },
        { name: "Attersee", at: "am Attersee" },
        { name: "Wolfgangsee", at: "am Wolfgangsee" },
        { name: "Mondsee", at: "am Mondsee" },
        { name: "Traunstein", at: "am Traunstein" },
      ],
    },
    {
      name: "Wachau",
      kind: "region",
      loc: "in der Wachau",
      adj: "Wachauer",
      rural: !0,
      marks: [{ name: "Donau", at: "an der Donau" }],
    },
    { name: "Weinviertel", kind: "region", loc: "im Weinviertel", adj: "Weinviertler", rural: !0 },
    { name: "Waldviertel", kind: "region", loc: "im Waldviertel", adj: "Waldviertler", rural: !0 },
    { name: "Mostviertel", kind: "region", loc: "im Mostviertel", adj: "Mostviertler", rural: !0 },
    { name: "Mühlviertel", kind: "region", loc: "im Mühlviertel", adj: "Mühlviertler", rural: !0 },
    { name: "Innviertel", kind: "region", loc: "im Innviertel", adj: "Innviertler", rural: !0 },
    { name: "Wienerwald", kind: "region", loc: "im Wienerwald", rural: !0 },
    { name: "Thermenregion", kind: "region", loc: "in der Thermenregion", rural: !0 },
    { name: "Südsteiermark", kind: "region", loc: "in der Südsteiermark", rural: !0 },
    { name: "Pinzgau", kind: "region", loc: "im Pinzgau", adj: "Pinzgauer", rural: !0 },
    { name: "Pongau", kind: "region", loc: "im Pongau", adj: "Pongauer", rural: !0 },
    { name: "Lungau", kind: "region", loc: "im Lungau", adj: "Lungauer", rural: !0 },
    { name: "Ennstal", kind: "region", loc: "im Ennstal", adj: "Ennstaler", rural: !0 },
    { name: "Ausseerland", kind: "region", loc: "im Ausseerland", adj: "Ausseer", rural: !0 },
    { name: "Zillertal", kind: "region", loc: "im Zillertal", adj: "Zillertaler", rural: !0 },
    { name: "Ötztal", kind: "region", loc: "im Ötztal", adj: "Ötztaler", rural: !0 },
    { name: "Montafon", kind: "region", loc: "im Montafon", adj: "Montafoner", rural: !0 },
    {
      name: "Bregenzerwald",
      kind: "region",
      loc: "im Bregenzerwald",
      adj: "Bregenzerwälder",
      rural: !0,
    },
    { name: "Arlberg", kind: "region", loc: "am Arlberg", adj: "Arlberger", rural: !0 },
    { name: "Marchfeld", kind: "region", loc: "im Marchfeld", adj: "Marchfelder", rural: !0 },
    { name: "Semmering", kind: "region", loc: "am Semmering", rural: !0 },
    { name: "Wörthersee", kind: "region", loc: "am Wörthersee", rural: !0 },
    { name: "Neusiedler See", kind: "region", loc: "am Neusiedler See", rural: !0 },
  ],
  uC = [...Yc, ...oC, ...aC, ...lC];
function Zi(e, t = !1) {
  const n = t ? { ä: "a", ö: "o", ü: "u", ß: "ss" } : { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };
  return e
    .toLocaleLowerCase("de-AT")
    .replace(/[äöüß]/g, (r) => n[r])
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/sankt/g, "st")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
function GL(e) {
  const t = (e ?? "").trim().replace(/\s+/g, " ");
  if (!t) return null;
  const n = Zi(t),
    r = /^1(0[1-9]|1\d|2[0-3])0(?:\s|$)/.exec(n),
    s = /^(?:wien\s+)?(\d{1,2})(?:\s+bezirk)?(?:\s+wien)?$/.exec(n),
    i = r ? Number(r[1]) : s ? Number(s[1]) : 0;
  if (i >= 1 && i <= 23) return { known: !0, place: Yc[i - 1] };
  const a = [
    n,
    n
      .replace(/^wien\s+|\s+wien$/g, "")
      .replace(/^1\d\d0\s+/, "")
      .trim(),
  ];
  for (const l of a)
    for (const u of uC)
      if (
        [u.name, ...(u.aliases ?? [])].some(
          (f) => Zi(f) === l || Zi(f, !0) === l || Zi(f).replace(/ /g, "") === l.replace(/ /g, ""),
        )
      )
        return { known: !0, place: u };
  return !/^[\p{L}][\p{L} .-]{1,23}$/u.test(t) || !new RegExp("\\p{L}{2}", "u").test(t)
    ? null
    : {
        known: !1,
        name: t
          .split(" ")
          .map((l) =>
            l === l.toLocaleLowerCase("de-AT") &&
            !["am", "an", "der", "im", "in", "bei", "ob"].includes(l)
              ? l.charAt(0).toLocaleUpperCase("de-AT") + l.slice(1)
              : l,
          )
          .join(" "),
      };
}
const cC = new Set(["Wien", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt"]);
function HL(e) {
  return e.district
    ? e.district === 1
      ? "innenstadt"
      : e.villa
        ? "villa"
        : e.district <= 9
          ? "altbau"
          : "arbeiter"
    : e.rural || e.kind === "land" || e.kind === "region"
      ? "land"
      : cC.has(e.name)
        ? "stadt"
        : "kleinstadt";
}
const fC = new Set([
  "Wachau",
  "Weinviertel",
  "Südsteiermark",
  "Thermenregion",
  "Burgenland",
  "Neusiedler See",
  "Krems",
  "Baden",
  "Perchtoldsdorf",
  "Döbling",
  "Floridsdorf",
  "Liesing",
]);
function WL(e) {
  return fC.has(e.name);
}
const Nu = [
    ...Yc.map((e) => e.name),
    "Wien",
    "Wienerwald",
    "Mödling",
    "Baden",
    "Klosterneuburg",
    "Tulln",
    "Niederösterreich",
    "Burgenland",
    "Graz",
    "Linz",
    "Salzburg",
    "Innsbruck",
  ],
  VL = (e) => Nu.find((t) => t.toLocaleLowerCase("de-AT") === e.trim().toLocaleLowerCase("de-AT"));
function dC({
  value: e,
  onChange: t,
  label: n = "WO BIST DU TÄTIG?",
  placeholder: r = "z. B. Döbling oder Wienerwald",
  help: s,
}) {
  const i = C.useId(),
    [a, o] = C.useState(!1),
    [l, u] = C.useState(-1),
    c = e.trim().toLocaleLowerCase("de-AT"),
    f = (
      c
        ? Nu.filter(
            (k) => k.toLocaleLowerCase("de-AT").includes(c) && k.toLocaleLowerCase("de-AT") !== c,
          )
        : Nu
    ).slice(0, 8),
    d = `${i}-list`,
    h = `${i}-help`,
    m = a && f.length > 0,
    x = (k) => {
      (t(k), o(!1), u(-1));
    };
  return y.jsxs("div", {
    className: "field combo",
    children: [
      y.jsx("label", { className: "label field-label", htmlFor: i, children: n }),
      y.jsx("input", {
        id: i,
        className: "input",
        role: "combobox",
        "aria-expanded": m,
        "aria-controls": d,
        "aria-autocomplete": "list",
        "aria-activedescendant": m && l >= 0 ? `${d}-${l}` : void 0,
        "aria-describedby": s ? h : void 0,
        placeholder: r,
        autoComplete: "off",
        maxLength: 60,
        value: e,
        onChange: (k) => {
          (t(ua(k.target.value)), o(!0), u(-1));
        },
        onFocus: () => o(!0),
        onBlur: () => setTimeout(() => o(!1), 120),
        onKeyDown: (k) => {
          k.key === "ArrowDown"
            ? (k.preventDefault(), o(!0), u((p) => Math.min(f.length - 1, p + 1)))
            : k.key === "ArrowUp"
              ? (k.preventDefault(), u((p) => Math.max(0, p - 1)))
              : k.key === "Enter" && m && l >= 0
                ? (k.preventDefault(), x(f[l]))
                : k.key === "Escape" && m && (k.preventDefault(), k.stopPropagation(), o(!1));
        },
      }),
      m &&
        y.jsx("ul", {
          className: "combo-list",
          id: d,
          role: "listbox",
          "aria-label": "Vorschläge Region",
          children: f.map((k, p) =>
            y.jsx(
              "li",
              {
                id: `${d}-${p}`,
                role: "option",
                "aria-selected": p === l,
                className: p === l ? "is-active" : void 0,
                onMouseDown: (g) => {
                  (g.preventDefault(), x(k));
                },
                children: k,
              },
              k,
            ),
          ),
        }),
      s && y.jsx("p", { className: "field-help", id: h, children: s }),
    ],
  });
}
const Ng = "unio-brand:kompass",
  hC = ["A", "B", "C"];
function Rg(e = (Date.now() ^ Math.floor(Math.random() * 16777215)) >>> 0) {
  return { brief: { version: 1 }, seed: e, mutiger: {}, gemerkt: [], schritt: 1 };
}
function pC(e) {
  const t = Rg();
  if (!e) return t;
  try {
    const n = JSON.parse(e);
    if (!n || typeof n != "object" || Array.isArray(n)) return t;
    const r = Lg(n.brief ?? { version: 1 }),
      s = n.mutiger && typeof n.mutiger == "object" ? n.mutiger : {},
      i = {};
    for (const l of hC) {
      const u = s[l];
      typeof u == "number" && Number.isInteger(u * 2) && u >= -1 && u <= 1 && u !== 0 && (i[l] = u);
    }
    const a = Array.isArray(n.gemerkt)
        ? n.gemerkt
            .filter((l) => typeof l == "string" && /^[a-z0-9._-]{1,40}$/.test(l))
            .slice(0, 30)
        : [],
      o =
        typeof n.schritt == "number" &&
        Number.isInteger(n.schritt) &&
        n.schritt >= 1 &&
        n.schritt <= 7
          ? n.schritt
          : 1;
    return {
      brief: r,
      seed: typeof n.seed == "number" && Number.isFinite(n.seed) ? n.seed >>> 0 : t.seed,
      mutiger: i,
      gemerkt: a,
      schritt: o,
    };
  } catch {
    return t;
  }
}
function mC() {
  try {
    return pC(localStorage.getItem(Ng));
  } catch {
    return Rg();
  }
}
function gC(e) {
  try {
    localStorage.setItem(Ng, JSON.stringify(e));
  } catch {}
}
function vC(e, t) {
  var l, u, c, f;
  const n = { ...e },
    r = (l = t.name) == null ? void 0 : l.trim().slice(0, 80);
  r && ((n.hasName = !0), (n.name = r));
  const s = (u = t.person) == null ? void 0 : u.trim().slice(0, 80);
  s && !n.person && (n.person = s);
  const i = (c = t.place) == null ? void 0 : c.trim().slice(0, 60);
  i && !n.place && (n.place = i);
  const a = ["wohnen", "haeuser", "luxus", "anleger", "gewerbe", "neubau", "land"],
    o = (t.focus ?? []).filter((d) => a.includes(d)).slice(0, 3);
  return (o.length && !((f = n.focus) != null && f.length) && (n.focus = o), n);
}
function KL(e) {
  var n, r;
  if (e.hasName && (n = e.name) != null && n.trim()) return e.name.trim();
  const t = (e.person ?? "")
    .trim()
    .split(/\s+/)
    .filter((s) => new RegExp("^\\p{L}", "u").test(s));
  return t.length >= 2
    ? `${t[0][0]}${t[t.length - 1][0]}`.toLocaleUpperCase("de-AT")
    : t.length === 1
      ? t[0]
      : (r = e.place) != null && r.trim()
        ? e.place.trim()
        : "Dein Name";
}
function yC({ onStart: e }) {
  return y.jsxs("a", {
    className: "kp-entry",
    href: "#/kompass",
    onClick: (t) => {
      (t.preventDefault(), e());
    },
    children: [
      y.jsx("span", { className: "kp-entry-dot", "aria-hidden": "true" }),
      y.jsxs("span", {
        children: [
          y.jsx("strong", { children: "Markenkompass:" }),
          " in 8 Minuten zu deiner Personal Brand",
        ],
      }),
    ],
  });
}
function xC(e, t = !1) {
  const n = mC(),
    r = { ...n.brief };
  (t ? (r.hasName = !0) : (delete r.hasName, delete r.name), gC({ ...n, brief: vC(r, e) }));
}
const kC = "./",
  Ru = [
    {
      family: "BS Playfair",
      file: "playfair-display-latin-400-normal.woff",
      weight: 400,
      color: "var(--lp-elegant)",
      upper: !1,
      track: "-0.01em",
    },
    {
      family: "BS Manrope",
      file: "manrope-latin-700-normal.woff",
      weight: 700,
      color: "var(--lp-modern)",
      upper: !1,
      track: "-0.02em",
    },
    {
      family: "BS Cormorant",
      file: "cormorant-garamond-latin-500-normal.woff",
      weight: 500,
      color: "var(--lp-luxus)",
      upper: !0,
      track: "0.14em",
    },
    {
      family: "BS Fraunces",
      file: "fraunces-latin-600-normal.woff",
      weight: 600,
      color: "var(--lp-warm)",
      upper: !1,
      track: "-0.01em",
    },
  ];
let Dh = !1;
function SC() {
  if (!(Dh || typeof FontFace > "u")) {
    Dh = !0;
    for (const e of Ru)
      new FontFace(e.family, `url(${kC}fonts/brand/${e.file})`, { weight: String(e.weight) })
        .load()
        .then((n) => document.fonts.add(n))
        .catch(() => {});
  }
}
const wC = [
    { value: "Immobilien", label: "Immobilien" },
    { value: "Real Estate", label: "Real Estate", lang: "en" },
    { value: "none", label: "Ohne Zusatz" },
  ],
  bC = ["Immobilienberatung", "Realitäten", "Immobilienkanzlei", "Wohnen & Leben"],
  EC = () => typeof matchMedia < "u" && matchMedia("(prefers-reduced-motion: reduce)").matches,
  Uh = () => typeof matchMedia < "u" && matchMedia("(min-width: 760px)").matches;
function TC({ name: e, suffix: t }) {
  const [n, r] = C.useState(0),
    [s, i] = C.useState(!1),
    [a, o] = C.useState(EC()),
    l = C.useRef(0);
  (C.useEffect(() => {
    SC();
  }, []),
    C.useEffect(() => {
      if (a) return;
      const f = window.setInterval(() => {
        if (l.current >= 5) {
          o(!0);
          return;
        }
        (i(!0),
          window.setTimeout(() => {
            ((l.current += 1), r((d) => (d + 1) % Ru.length), i(!1));
          }, 400));
      }, 2400);
      return () => window.clearInterval(f);
    }, [a]));
  const u = Ru[n],
    c = !e.trim();
  return y.jsx("div", {
    className: "live-preview",
    "aria-hidden": "true",
    onClick: () => o(!0),
    children: y.jsxs("div", {
      className: `lp-inner${s ? " lp-fade-out" : ""}${c ? " lp-empty" : ""}`,
      style: { "--lp-color": u.color },
      children: [
        y.jsx("div", {
          className: "lp-name",
          style: {
            fontFamily: `"${u.family}", Georgia, serif`,
            fontWeight: u.weight,
            letterSpacing: u.track,
            textTransform: u.upper ? "uppercase" : "none",
          },
          children: c ? "Dein Name" : e,
        }),
        t &&
          y.jsxs(y.Fragment, {
            children: [
              y.jsx("div", { className: "lp-rule", style: { color: u.color } }),
              y.jsx("div", {
                className: "lp-suffix",
                style: { fontFamily: "var(--font-mono)" },
                children: t,
              }),
            ],
          }),
      ],
    }),
  });
}
function Ah({ projectId: e }) {
  var B;
  const { state: t, put: n, update: r, navigate: s, announce: i } = Zt(),
    a = e ? t.projects[e] : void 0,
    o = C.useMemo(() => {
      if (!a) return { rawName: "", choice: "Immobilien", custom: "", keep: !1, place: "" };
      const R = i0(a.input.suffix),
        A = R.choice === "Immobilienberatung" ? "custom" : R.choice,
        H = R.choice === "Immobilienberatung" ? "Immobilienberatung" : R.custom;
      return {
        rawName: a.rawName,
        choice: A,
        custom: H,
        keep: a.legalFormInLogo,
        place: a.input.place ?? "",
      };
    }, []),
    [l, u] = C.useState(o.rawName),
    [c, f] = C.useState(o.choice),
    [d, h] = C.useState(o.custom),
    [m, x] = C.useState(o.keep),
    [k, p] = C.useState(o.place),
    [g, v] = C.useState(!!o.place),
    [S, b] = C.useState(null),
    [L, T] = C.useState(null),
    E = C.useRef(null),
    I = C.useRef(null);
  C.useEffect(() => {
    var He;
    if (!Uh()) return;
    const R = () => {
      const De = I.current;
      De &&
        (document.activeElement === document.body || document.activeElement === null) &&
        De.focus();
    };
    (He = I.current) == null || He.focus();
    const A = requestAnimationFrame(R),
      H = window.setTimeout(R, 300);
    return () => {
      (cancelAnimationFrame(A), window.clearTimeout(H));
    };
  }, []);
  const [P, q] = C.useState(!!a),
    Q =
      ((B = l.match(
        /\b(immobilien|realitäten|realitaeten|real estate|immobilienberatung|immobilientreuhand|properties|estates?)\b/i,
      )) == null
        ? void 0
        : B[0]) ?? null,
    te = !!Q;
  C.useEffect(() => {
    P || f(te ? "none" : "Immobilien");
  }, [te, P]);
  const ee = vo(l),
    ae = c === "none" ? "" : c === "custom" ? d.trim() : c,
    oe = ee && !m ? ee.stripped : l.trim(),
    le = (R) => {
      var j, Z, fe;
      R == null || R.preventDefault();
      const A = l.trim() ? l : ua(((j = I.current) == null ? void 0 : j.value) ?? "");
      A !== l && u(A);
      const H = Tk(A);
      if ((b(H), H)) {
        ((Z = I.current) == null || Z.focus(), i(ou(H, A), !0));
        return;
      }
      if ((c === "custom" ? pi(d) : []).length) {
        const ke = Mk(d) ?? "";
        (T(ke), (fe = E.current) == null || fe.focus(), i(ke, !0));
        return;
      }
      const De = v0(A) ? "company" : a && a.rawName === A.trim() ? a.input.nameKind : void 0,
        _t = {
          rawName: A,
          suffixChoice: c,
          customSuffix: d,
          keepLegalForm: m,
          place: k,
          nameKind: De,
        };
      if (a) (r(a.id, (ke) => l0(ke, _t)), s({ name: "stil", id: a.id }));
      else {
        const ke = Ik(_t);
        (n(ke), s({ name: "name", id: ke.id }, { replace: !0 }), s({ name: "stil", id: ke.id }));
      }
    },
    O = a ? "Speichern und weiter" : "Logos entwerfen";
  return y.jsxs("div", {
    className: "container screen",
    children: [
      y.jsxs("div", {
        className: "name-grid",
        children: [
          y.jsxs("div", {
            children: [
              y.jsx("h1", {
                className: "display",
                "data-title": "Name",
                children: "Dein Logo und alles, was dazugehört.",
              }),
              y.jsx("p", {
                className: "lead s1-lead",
                children: "Gib deinen Namen ein. Wir entwerfen sofort Logos für dich.",
              }),
              y.jsxs("form", {
                id: "name-form",
                className: "name-form",
                onSubmit: le,
                noValidate: !0,
                children: [
                  y.jsx(pd, {
                    ref: I,
                    label: "DEIN NAME ODER FIRMENNAME",
                    placeholder: "z. B. Anna Berger",
                    autoComplete: "name",
                    autoCapitalize: "words",
                    enterKeyHint: "go",
                    spellCheck: !1,
                    large: !0,
                    value: l,
                    onChange: (R) => {
                      (u(ua(R.target.value)), S && b(null));
                    },
                    onFocus: (R) => {
                      Uh() ||
                        R.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" });
                    },
                    error: S ? ou(S, l) : null,
                    help: "Meist Vor- und Nachname. Du kannst ihn später ändern.",
                  }),
                  !a &&
                    y.jsx("a", {
                      className: "text-link s1-finder-link",
                      href: "#/neu/namen",
                      onClick: (R) => {
                        R.preventDefault();
                        const A = sC(),
                          H = l.trim();
                        (H && iC(y0(H) || !Q ? { ...A, person: H } : { ...A, company: H }),
                          s({ name: "names", gemerkt: !1, kinds: [] }));
                      },
                      children: "Noch keinen Namen? Wir helfen dir beim Finden →",
                    }),
                  !a &&
                    y.jsx(yC, {
                      onStart: () => {
                        var A;
                        const R = (
                          l.trim() ? l : (((A = I.current) == null ? void 0 : A.value) ?? "")
                        ).trim();
                        (xC({ name: R, place: k }, !0), s({ name: "kompass", step: 1 }));
                      },
                    }),
                  ee &&
                    y.jsxs("div", {
                      className: "legal-hint",
                      role: "group",
                      "aria-label": "Rechtsform im Logo",
                      children: [
                        y.jsxs("p", {
                          children: [
                            "Tipp: „",
                            ee.form,
                            "“ lassen wir im Logo weg, so wirkt es ruhiger. In Briefpapier und Signatur steht es trotzdem.",
                          ],
                        }),
                        y.jsxs("div", {
                          className: "row",
                          children: [
                            y.jsx("button", {
                              type: "button",
                              className: "chip",
                              "aria-pressed": !m,
                              onClick: () => x(!1),
                              children: "Weglassen",
                            }),
                            y.jsx("button", {
                              type: "button",
                              className: "chip",
                              "aria-pressed": m,
                              onClick: () => x(!0),
                              children: "Im Logo behalten",
                            }),
                          ],
                        }),
                      ],
                    }),
                  y.jsxs("fieldset", {
                    className: "field",
                    style: { marginTop: 24 },
                    children: [
                      y.jsx("legend", {
                        className: "label field-label",
                        children: "ZUSATZ IM LOGO",
                      }),
                      y.jsxs("div", {
                        className: "row suffix-row",
                        children: [
                          y.jsx(nS, {
                            options: wC,
                            value: c === "custom" || c === "Immobilienberatung" ? null : c,
                            onChange: (R) => {
                              (q(!0), f(R));
                            },
                            label: "Zusatz im Logo",
                          }),
                          c !== "custom" &&
                            y.jsx(Oc, {
                              onClick: () => {
                                (q(!0),
                                  f("custom"),
                                  setTimeout(() => {
                                    var R;
                                    return (R = E.current) == null ? void 0 : R.focus();
                                  }, 30));
                              },
                              children: "Anderer Zusatz",
                            }),
                        ],
                      }),
                    ],
                  }),
                  Q &&
                    c === "none" &&
                    !P &&
                    y.jsxs("p", {
                      className: "small suffix-hint",
                      role: "status",
                      children: ["„", Q, "“ steht schon in deinem Namen, deshalb ohne Zusatz."],
                    }),
                  c === "custom" &&
                    y.jsx(pd, {
                      label: "ANDERER ZUSATZ",
                      placeholder: "z. B. Immobilienberatung",
                      list: "suffix-suggestions",
                      maxLength: 30,
                      value: d,
                      onChange: (R) => {
                        (h(ua(R.target.value)), T(null));
                      },
                      error: L,
                      ref: E,
                    }),
                  y.jsx("datalist", {
                    id: "suffix-suggestions",
                    children: bC.map((R) => y.jsx("option", { value: R }, R)),
                  }),
                  y.jsx("div", {
                    className: "submit-row desk-flex",
                    children: y.jsx(Hr, { type: "submit", reveal: !a, children: O }),
                  }),
                  y.jsxs("details", {
                    className: "disclosure name-more",
                    open: g,
                    onToggle: (R) => v(R.currentTarget.open),
                    children: [
                      y.jsx("summary", { children: "Mehr Angaben (optional)" }),
                      g &&
                        y.jsx("div", {
                          className: "disclosure-body",
                          children: y.jsx(dC, {
                            label: "DEIN BEZIRK ODER ORT",
                            placeholder: "z. B. Döbling oder Wien 18",
                            value: k,
                            onChange: p,
                            help: "Dann zeigen wir dir auch Logos mit deinem Bezirk.",
                          }),
                        }),
                    ],
                  }),
                  y.jsx("p", {
                    className: "small s1-note",
                    children: "Kein Konto nötig. Alles bleibt in deinem Browser.",
                  }),
                ],
              }),
            ],
          }),
          y.jsx(TC, { name: oe, suffix: ae }),
        ],
      }),
      y.jsx(p0, { children: y.jsx(Hr, { type: "submit", form: "name-form", children: O }) }),
    ],
  });
}
const Ou = 1,
  CC = ["https://www.unio.at", "https://unio.at"];
function Iu(e, t = typeof location < "u" ? location.origin : "") {
  return !e || e === "null" ? !1 : e === t || CC.includes(e);
}
let Qa = null;
const Og = () => typeof window < "u" && window.parent && window.parent !== window;
function Ig() {
  try {
    return document.referrer ? new URL(document.referrer).origin : null;
  } catch {
    return null;
  }
}
function LC(e, t) {
  Qa = e ? { name: e.name, suffix: e.suffix ?? "", tagline: e.tagline ?? "", concept: t } : null;
}
function qL() {
  const e = Ig();
  !Og() ||
    !e ||
    !Qa ||
    !Iu(e) ||
    window.parent.postMessage({ type: "bs:export", version: Ou, data: Qa }, e);
}
function FC() {
  if (!Og()) return;
  window.addEventListener("message", (t) => {
    if (t.source !== window.parent || !Iu(t.origin)) return;
    const n = t.data;
    !n ||
      typeof n != "object" ||
      n.type !== "bs:export" ||
      t.source.postMessage({ type: "bs:export", version: Ou, data: Qa }, t.origin);
  });
  const e = Ig();
  e && Iu(e) && window.parent.postMessage({ type: "bs:ready", version: Ou }, e);
}
const MC = C.lazy(() =>
    bt(
      () => import("./StyleScreen-C_6L_v_z.js"),
      __vite__mapDeps([8, 6, 7, 5, 9]),
      import.meta.url,
    ),
  ),
  NC = C.lazy(() =>
    bt(
      () => import("./Gallery-DQhL1__5.js"),
      __vite__mapDeps([10, 6, 7, 11, 5, 12, 9]),
      import.meta.url,
    ),
  ),
  RC = C.lazy(() =>
    bt(
      () => import("./Editor-DVnOl_QT.js"),
      __vite__mapDeps([13, 6, 7, 9, 14, 15, 2, 1, 16, 17, 5]),
      import.meta.url,
    ),
  ),
  OC = C.lazy(() =>
    bt(
      () => import("./Kit-DOg_4MCc.js"),
      __vite__mapDeps([18, 7, 14, 6, 15, 2, 5, 1, 16, 3, 17, 19]),
      import.meta.url,
    ),
  ),
  Bh = C.lazy(() =>
    bt(
      () => import("./NameFinder-a2JCuNBt.js"),
      __vite__mapDeps([20, 12, 7, 6, 11, 5, 9]),
      import.meta.url,
    ),
  ),
  IC = C.lazy(() =>
    bt(
      () => import("./Kompass-15lKj4KF.js"),
      __vite__mapDeps([21, 7, 22, 12, 6, 23, 5]),
      import.meta.url,
    ),
  ),
  PC = C.lazy(() =>
    bt(
      () => import("./Routes-DauRWys7.js"),
      __vite__mapDeps([24, 7, 14, 6, 15, 2, 11, 5, 12, 22, 23]),
      import.meta.url,
    ),
  ),
  DC = C.lazy(() =>
    bt(
      () => import("./PostingsScreen-DENTHyqT.js"),
      __vite__mapDeps([25, 14, 6, 7, 15, 2, 3, 1, 26, 16, 23, 19]),
      import.meta.url,
    ),
  ),
  UC = C.lazy(() =>
    bt(
      () => import("./ObjectsScreen-Brex7erJ.js"),
      __vite__mapDeps([27, 16, 3, 2, 1, 26, 7, 15, 19]),
      import.meta.url,
    ),
  ),
  AC = { name: "names", gemerkt: !1, kinds: [] };
function BC() {
  return y.jsx(Qk, { children: y.jsx(_C, {}) });
}
function $C() {
  return y.jsx("div", {
    className: "container screen",
    "aria-busy": "true",
    children: y.jsx("div", { className: "riffel skeleton", style: { height: 320 } }),
  });
}
function _C() {
  const { route: e, state: t, storageOk: n, otherTabChanged: r, navigate: s, update: i } = Zt(),
    a = "id" in e ? e.id : void 0,
    o = a ? t.projects[a] : void 0;
  if (
    (C.useEffect(() => {
      if (!o) return;
      const c = location.hash;
      o.ui.route !== c && i(o.id, (f) => ({ ...f, ui: { ...f.ui, route: c } }), !1);
    }, [e, o == null ? void 0 : o.id]),
    C.useEffect(() => {
      var c;
      LC(
        (o == null ? void 0 : o.input) ?? null,
        o ? (o.selected ?? ((c = o.editing) == null ? void 0 : c.concept) ?? null) : null,
      );
    }, [o]),
    C.useEffect(() => {
      t.loaded && a && !o && s({ name: "home" }, { replace: !0 });
    }, [t.loaded, a, o, s]),
    !t.loaded)
  )
    return null;
  const l = e.name === "logo",
    u = e.name === "auswahl" || e.name === "kit";
  return y.jsxs(y.Fragment, {
    children: [
      y.jsx("a", {
        className: "skip-link",
        href: "#main",
        onClick: (c) => {
          var f;
          (c.preventDefault(), (f = document.getElementById("main")) == null || f.focus());
        },
        children: "Zum Inhalt springen",
      }),
      !n &&
        y.jsx("div", {
          className: "banner",
          role: "note",
          children: y.jsx("div", {
            className: "container",
            children:
              "In diesem Fenster kann nichts gespeichert werden (privates Surfen?). Du kannst trotzdem alles erstellen, lade dein Brand Kit am Ende herunter.",
          }),
        }),
      r &&
        y.jsx("div", {
          className: "banner",
          role: "alert",
          children: y.jsxs("div", {
            className: "container",
            children: [
              y.jsx("span", { children: "Diese Marke wurde in einem anderen Fenster geändert." }),
              y.jsx("button", {
                type: "button",
                className: "btn btn-ghost on-dark",
                onClick: () => location.reload(),
                children: "Neu laden",
              }),
            ],
          }),
        }),
      y.jsx(zC, {}),
      !l && y.jsx(xS, { route: e, project: o, sticky: u }),
      y.jsx("main", {
        id: "main",
        tabIndex: -1,
        className: l ? "editor-root" : void 0,
        children: y.jsx(C.Suspense, { fallback: y.jsx($C, {}), children: y.jsx(jC, { route: e }) }),
      }),
      y.jsx(wS, {}),
    ],
  });
}
function zC() {
  const { quotaFull: e, dismissQuota: t, navigate: n } = Zt();
  return e
    ? y.jsx("div", {
        className: "banner",
        role: "alertdialog",
        "aria-labelledby": "quota-text",
        children: y.jsxs("div", {
          className: "container",
          children: [
            y.jsx("span", {
              id: "quota-text",
              children:
                "Dein Browser-Speicher ist voll. Lösche alte Marken oder entferne eingesetzte Fotos.",
            }),
            y.jsx("button", {
              type: "button",
              className: "btn btn-ghost on-dark",
              onClick: () => {
                (t(), n({ name: "home" }));
              },
              children: "Zu deinen Marken",
            }),
            y.jsx("button", {
              type: "button",
              className: "btn btn-text on-dark",
              onClick: t,
              children: "Schließen",
            }),
          ],
        }),
      })
    : null;
}
function jC({ route: e }) {
  const { state: t } = Zt(),
    n = Object.keys(t.projects).length > 0;
  switch (e.name) {
    case "home":
      return n || t.loadError ? y.jsx(dS, {}) : y.jsx(Bh, { route: AC });
    case "new":
      return y.jsx(Ah, {}, "new");
    case "names":
      return y.jsx(Bh, { route: e });
    case "kompass":
      return y.jsx(IC, { step: e.step }, e.step);
    case "routen":
      return y.jsx(PC, {});
    case "name":
      return t.projects[e.id] ? y.jsx(Ah, { projectId: e.id }, e.id) : null;
    case "stil":
      return t.projects[e.id] ? y.jsx(MC, { projectId: e.id }, e.id) : null;
    case "auswahl":
      return t.projects[e.id] ? y.jsx(NC, { projectId: e.id, gemerkt: e.gemerkt }, e.id) : null;
    case "logo":
      return t.projects[e.id]
        ? y.jsx(
            RC,
            {
              projectId: e.id,
              conceptId: e.conceptId,
              tab: e.tab,
              texte: e.texte,
              feinheiten: e.feinheiten,
            },
            `${e.id}/${e.conceptId}`,
          )
        : null;
    case "kit":
      return t.projects[e.id] ? y.jsx(OC, { projectId: e.id }, e.id) : null;
    case "postings":
      return t.projects[e.id]
        ? y.jsx(DC, { projectId: e.id, objekt: e.objekt, anlass: e.anlass }, e.id)
        : null;
    case "objekte":
      return t.projects[e.id] ? y.jsx(UC, { projectId: e.id, objekt: e.objekt }, e.id) : null;
  }
}
const GC =
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  $h =
    "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
  HC = [
    {
      family: "Power Grotesk",
      file: "ui/PowerGrotesk-Regular.woff2",
      format: "woff2",
      weight: "400",
    },
    {
      family: "Power Grotesk",
      file: "ui/PowerGrotesk-Medium.woff2",
      format: "woff2",
      weight: "500",
    },
    {
      family: "Outfit",
      file: "ui/outfit-latin-100-900.woff2",
      format: "woff2",
      weight: "300 600",
      range: GC,
    },
    {
      family: "Outfit",
      file: "brand/outfit-latin-ext-400-normal.woff",
      format: "woff",
      weight: "300 500",
      range: $h,
    },
    {
      family: "Outfit",
      file: "brand/outfit-latin-ext-600-normal.woff",
      format: "woff",
      weight: "600",
      range: $h,
    },
    {
      family: "JetBrains Mono",
      file: "ui/jetbrains-mono-latin-400-normal.woff2",
      format: "woff2",
      weight: "400",
    },
    {
      family: "JetBrains Mono",
      file: "ui/jetbrains-mono-latin-500-normal.woff2",
      format: "woff2",
      weight: "500",
    },
  ];
function WC(e) {
  return HC.map(
    (t) =>
      `@font-face{font-family:"${t.family}";src:url("${e}fonts/${t.file}") format("${t.format}");font-weight:${t.weight};font-style:normal;font-display:swap;${t.range ? `unicode-range:${t.range};` : ""}}`,
  ).join(`
`);
}
function VC(e = "./") {
  const t = document.createElement("style");
  ((t.dataset.uiFonts = ""), (t.textContent = WC(e)), document.head.appendChild(t));
  for (const n of ["ui/outfit-latin-100-900.woff2", "ui/PowerGrotesk-Medium.woff2"]) {
    const r = document.createElement("link");
    ((r.rel = "preload"),
      (r.as = "font"),
      (r.type = "font/woff2"),
      (r.crossOrigin = "anonymous"),
      (r.href = `${e}fonts/${n}`),
      document.head.appendChild(r));
  }
}
document.documentElement.lang = "de-AT";
VC();
if (!document.querySelector('link[rel="icon"]')) {
  const e = document.createElement("link");
  ((e.rel = "icon"),
    (e.href =
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0B0A09"/><circle cx="16" cy="16" r="5" fill="#FFAA09"/></svg>',
      )),
    document.head.appendChild(e));
}
FC();
Jm(document.getElementById("root")).render(y.jsx(C.StrictMode, { children: y.jsx(BC, {}) }));
export {
  t0 as $,
  pk as A,
  yL as B,
  nS as C,
  Rc as D,
  Tk as E,
  iL as F,
  Yo as G,
  l0 as H,
  ou as I,
  kL as J,
  XC as K,
  wL as L,
  sS as M,
  YC as N,
  vS as O,
  Hr as P,
  Vk as Q,
  p0 as R,
  bL as S,
  Oc as T,
  xL as U,
  qC as V,
  lr as W,
  c1 as X,
  u1 as Y,
  f1 as Z,
  d1 as _,
  Yn as a,
  bS as a$,
  h1 as a0,
  e0 as a1,
  ZC as a2,
  Ai as a3,
  p1 as a4,
  Lk as a5,
  qL as a6,
  EL as a7,
  uS as a8,
  sC as a9,
  ai as aA,
  FL as aB,
  o4 as aC,
  Mc as aD,
  _a as aE,
  ue as aF,
  X as aG,
  DL as aH,
  se as aI,
  qe as aJ,
  r0 as aK,
  Vr as aL,
  JT as aM,
  Lg as aN,
  BL as aO,
  UL as aP,
  PL as aQ,
  Y as aR,
  Wk as aS,
  Ak as aT,
  o0 as aU,
  uL as aV,
  Kk as aW,
  AL as aX,
  Re as aY,
  cL as aZ,
  Rk as a_,
  iC as aa,
  zL as ab,
  $L as ac,
  _L as ad,
  dC as ae,
  yC as af,
  xC as ag,
  SL as ah,
  fL as ai,
  jL as aj,
  JC as ak,
  mC as al,
  gC as am,
  qk as an,
  KL as ao,
  uC as ap,
  GL as aq,
  WL as ar,
  HL as as,
  nC as at,
  VL as au,
  oS as av,
  LL as aw,
  ii as ax,
  s4 as ay,
  bt as az,
  Ik as b,
  p4 as b0,
  ST as b1,
  ES as b2,
  H4 as b3,
  G4 as b4,
  ko as b5,
  xs as b6,
  br as b7,
  bh as b8,
  Er as b9,
  li as ba,
  wg as bb,
  Ar as bc,
  NL as bd,
  pg as be,
  sL as bf,
  ML as bg,
  y0 as bh,
  IL as bi,
  wT as bj,
  eL as bk,
  tL as bl,
  rL as bm,
  aL as bn,
  QC as bo,
  OL as bp,
  Y4 as bq,
  nT as br,
  nL as bs,
  fu as bt,
  RL as bu,
  CL as bv,
  i0 as c,
  hL as d,
  u0 as e,
  za as f,
  lL as g,
  mL as h,
  TL as i,
  y as j,
  oL as k,
  pi as l,
  rS as m,
  dL as n,
  vL as o,
  qc as p,
  pd as q,
  C as r,
  pL as s,
  gL as t,
  Zt as u,
  ua as v,
  Mk as w,
  d0 as x,
  PT as y,
  vk as z,
};
