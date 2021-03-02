'use strict';

var os = require('os');
var require$$0$1 = require('vm');
var EventEmitter$1 = require('events');
var fs = require('fs');
var require$$0$2 = require('util');
var tty = require('tty');
var pinologger = require('koa-pino-logger');
var dotenvSafe = require('dotenv-safe');
var jsonerror = require('koa-json-error');
var Router = require('@koa/router');
require('git-last-commit');
var koa = require('koa');
var http = require('http');
var primus = require('primus.io');
var koaBody = require('koa-body');
var serve = require('koa-static');
var cors = require('@koa/cors');
var launchdarklyEventsource = require('launchdarkly-eventsource');
var https = require('https');
var url = require('url');
var nano = require('nano');
var Agent = require('agentkeepalive');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var os__default = /*#__PURE__*/_interopDefaultLegacy(os);
var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0$1);
var EventEmitter__default = /*#__PURE__*/_interopDefaultLegacy(EventEmitter$1);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var require$$0__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$0$2);
var tty__default = /*#__PURE__*/_interopDefaultLegacy(tty);
var pinologger__default = /*#__PURE__*/_interopDefaultLegacy(pinologger);
var dotenvSafe__default = /*#__PURE__*/_interopDefaultLegacy(dotenvSafe);
var jsonerror__default = /*#__PURE__*/_interopDefaultLegacy(jsonerror);
var Router__default = /*#__PURE__*/_interopDefaultLegacy(Router);
var koa__default = /*#__PURE__*/_interopDefaultLegacy(koa);
var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
var primus__default = /*#__PURE__*/_interopDefaultLegacy(primus);
var koaBody__default = /*#__PURE__*/_interopDefaultLegacy(koaBody);
var serve__default = /*#__PURE__*/_interopDefaultLegacy(serve);
var cors__default = /*#__PURE__*/_interopDefaultLegacy(cors);
var https__default = /*#__PURE__*/_interopDefaultLegacy(https);
var url__default = /*#__PURE__*/_interopDefaultLegacy(url);
var nano__default = /*#__PURE__*/_interopDefaultLegacy(nano);
var Agent__default = /*#__PURE__*/_interopDefaultLegacy(Agent);

var err = errSerializer;

const seen = Symbol('circular-ref-tag');
const rawSymbol = Symbol('pino-raw-err-ref');
const pinoErrProto = Object.create({}, {
  type: {
    enumerable: true,
    writable: true,
    value: undefined
  },
  message: {
    enumerable: true,
    writable: true,
    value: undefined
  },
  stack: {
    enumerable: true,
    writable: true,
    value: undefined
  },
  raw: {
    enumerable: false,
    get: function () {
      return this[rawSymbol]
    },
    set: function (val) {
      this[rawSymbol] = val;
    }
  }
});
Object.defineProperty(pinoErrProto, rawSymbol, {
  writable: true,
  value: {}
});

function errSerializer (err) {
  if (!(err instanceof Error)) {
    return err
  }

  err[seen] = undefined; // tag to prevent re-looking at this
  const _err = Object.create(pinoErrProto);
  _err.type = err.constructor.name;
  _err.message = err.message;
  _err.stack = err.stack;
  for (const key in err) {
    if (_err[key] === undefined) {
      const val = err[key];
      if (val instanceof Error) {
        if (!val.hasOwnProperty(seen)) {
          _err[key] = errSerializer(val);
        }
      } else {
        _err[key] = val;
      }
    }
  }

  delete err[seen]; // clean up tag in case err is serialized again later
  _err.raw = err;
  return _err
}

var req = {
  mapHttpRequest,
  reqSerializer
};

var rawSymbol$1 = Symbol('pino-raw-req-ref');
var pinoReqProto = Object.create({}, {
  id: {
    enumerable: true,
    writable: true,
    value: ''
  },
  method: {
    enumerable: true,
    writable: true,
    value: ''
  },
  url: {
    enumerable: true,
    writable: true,
    value: ''
  },
  headers: {
    enumerable: true,
    writable: true,
    value: {}
  },
  remoteAddress: {
    enumerable: true,
    writable: true,
    value: ''
  },
  remotePort: {
    enumerable: true,
    writable: true,
    value: ''
  },
  raw: {
    enumerable: false,
    get: function () {
      return this[rawSymbol$1]
    },
    set: function (val) {
      this[rawSymbol$1] = val;
    }
  }
});
Object.defineProperty(pinoReqProto, rawSymbol$1, {
  writable: true,
  value: {}
});

function reqSerializer (req) {
  // req.info is for hapi compat.
  var connection = req.info || req.connection;
  const _req = Object.create(pinoReqProto);
  _req.id = (typeof req.id === 'function' ? req.id() : (req.id || (req.info ? req.info.id : undefined)));
  _req.method = req.method;
  // req.originalUrl is for expressjs compat.
  if (req.originalUrl) {
    _req.url = req.originalUrl;
  } else {
    // req.url.path is  for hapi compat.
    _req.url = req.path || (req.url ? (req.url.path || req.url) : undefined);
  }
  _req.headers = req.headers;
  _req.remoteAddress = connection && connection.remoteAddress;
  _req.remotePort = connection && connection.remotePort;
  // req.raw is  for hapi compat/equivalence
  _req.raw = req.raw || req;
  return _req
}

function mapHttpRequest (req) {
  return {
    req: reqSerializer(req)
  }
}

var res = {
  mapHttpResponse,
  resSerializer
};

var rawSymbol$2 = Symbol('pino-raw-res-ref');
var pinoResProto = Object.create({}, {
  statusCode: {
    enumerable: true,
    writable: true,
    value: 0
  },
  headers: {
    enumerable: true,
    writable: true,
    value: ''
  },
  raw: {
    enumerable: false,
    get: function () {
      return this[rawSymbol$2]
    },
    set: function (val) {
      this[rawSymbol$2] = val;
    }
  }
});
Object.defineProperty(pinoResProto, rawSymbol$2, {
  writable: true,
  value: {}
});

function resSerializer (res) {
  const _res = Object.create(pinoResProto);
  _res.statusCode = res.statusCode;
  _res.headers = res.getHeaders ? res.getHeaders() : res._headers;
  _res.raw = res;
  return _res
}

function mapHttpResponse (res) {
  return {
    res: resSerializer(res)
  }
}

var pinoStdSerializers = {
  err: err,
  mapHttpRequest: req.mapHttpRequest,
  mapHttpResponse: res.mapHttpResponse,
  req: req.reqSerializer,
  res: res.resSerializer,

  wrapErrorSerializer: function wrapErrorSerializer (customSerializer) {
    if (customSerializer === err) return customSerializer
    return function wrapErrSerializer (err$1) {
      return customSerializer(err(err$1))
    }
  },

  wrapRequestSerializer: function wrapRequestSerializer (customSerializer) {
    if (customSerializer === req.reqSerializer) return customSerializer
    return function wrappedReqSerializer (req$1) {
      return customSerializer(req.reqSerializer(req$1))
    }
  },

  wrapResponseSerializer: function wrapResponseSerializer (customSerializer) {
    if (customSerializer === res.resSerializer) return customSerializer
    return function wrappedResSerializer (res$1) {
      return customSerializer(res.resSerializer(res$1))
    }
  }
};

const { createContext, runInContext } = require$$0__default['default'];

var validator_1 = validator;

function validator (opts = {}) {
  const {
    ERR_PATHS_MUST_BE_STRINGS = () => 'fast-redact - Paths must be (non-empty) strings',
    ERR_INVALID_PATH = (s) => `fast-redact – Invalid path (${s})`
  } = opts;

  return function validate ({ paths }) {
    paths.forEach((s) => {
      if (typeof s !== 'string') {
        throw Error(ERR_PATHS_MUST_BE_STRINGS())
      }
      try {
        if (/〇/.test(s)) throw Error()
        const proxy = new Proxy({}, { get: () => proxy, set: () => { throw Error() } });
        const expr = (s[0] === '[' ? '' : '.') + s.replace(/^\*/, '〇').replace(/\.\*/g, '.〇').replace(/\[\*\]/g, '[〇]');
        if (/\n|\r|;/.test(expr)) throw Error()
        if (/\/\*/.test(expr)) throw Error()
        runInContext(`
          (function () {
            'use strict'
            o${expr}
            if ([o${expr}].length !== 1) throw Error()
          })()
        `, createContext({ o: proxy, 〇: null }), {
          codeGeneration: { strings: false, wasm: false }
        });
      } catch (e) {
        throw Error(ERR_INVALID_PATH(s))
      }
    });
  }
}

var rx = /[^.[\]]+|\[((?:.)*?)\]/g;

var parse_1 = parse;

function parse ({ paths }) {
  const wildcards = [];
  var wcLen = 0;
  const secret = paths.reduce(function (o, strPath, ix) {
    var path = strPath.match(rx).map((p) => p.replace(/'|"|`/g, ''));
    const leadingBracket = strPath[0] === '[';
    path = path.map((p) => {
      if (p[0] === '[') return p.substr(1, p.length - 2)
      else return p
    });
    const star = path.indexOf('*');
    if (star > -1) {
      const before = path.slice(0, star);
      const beforeStr = before.join('.');
      const after = path.slice(star + 1, path.length);
      if (after.indexOf('*') > -1) throw Error('fast-redact – Only one wildcard per path is supported')
      const nested = after.length > 0;
      wcLen++;
      wildcards.push({
        before,
        beforeStr,
        after,
        nested
      });
    } else {
      o[strPath] = {
        path: path,
        val: undefined,
        precensored: false,
        circle: '',
        escPath: JSON.stringify(strPath),
        leadingBracket: leadingBracket
      };
    }
    return o
  }, {});

  return { wildcards, wcLen, secret }
}

var redactor_1 = redactor;

function redactor ({ secret, serialize, wcLen, strict, isCensorFct, censorFctTakesPath }, state) {
  /* eslint-disable-next-line */
  const redact = Function('o', `
    if (typeof o !== 'object' || o == null) {
      ${strictImpl(strict, serialize)}
    }
    const { censor, secret } = this
    ${redactTmpl(secret, isCensorFct, censorFctTakesPath)}
    this.compileRestore()
    ${dynamicRedactTmpl(wcLen > 0, isCensorFct, censorFctTakesPath)}
    ${resultTmpl(serialize)}
  `).bind(state);

  if (serialize === false) {
    redact.restore = (o) => state.restore(o);
  }

  return redact
}

function redactTmpl (secret, isCensorFct, censorFctTakesPath) {
  return Object.keys(secret).map((path) => {
    const { escPath, leadingBracket, path: arrPath } = secret[path];
    const skip = leadingBracket ? 1 : 0;
    const delim = leadingBracket ? '' : '.';
    const hops = [];
    var match;
    while ((match = rx.exec(path)) !== null) {
      const [ , ix ] = match;
      const { index, input } = match;
      if (index > skip) hops.push(input.substring(0, index - (ix ? 0 : 1)));
    }
    var existence = hops.map((p) => `o${delim}${p}`).join(' && ');
    if (existence.length === 0) existence += `o${delim}${path} != null`;
    else existence += ` && o${delim}${path} != null`;

    const circularDetection = `
      switch (true) {
        ${hops.reverse().map((p) => `
          case o${delim}${p} === censor:
            secret[${escPath}].circle = ${JSON.stringify(p)}
            break
        `).join('\n')}
      }
    `;

    const censorArgs = censorFctTakesPath
      ? `val, ${JSON.stringify(arrPath)}`
      : `val`;

    return `
      if (${existence}) {
        const val = o${delim}${path}
        if (val === censor) {
          secret[${escPath}].precensored = true
        } else {
          secret[${escPath}].val = val
          o${delim}${path} = ${isCensorFct ? `censor(${censorArgs})` : 'censor'}
          ${circularDetection}
        }
      }
    `
  }).join('\n')
}

function dynamicRedactTmpl (hasWildcards, isCensorFct, censorFctTakesPath) {
  return hasWildcards === true ? `
    {
      const { wildcards, wcLen, groupRedact, nestedRedact } = this
      for (var i = 0; i < wcLen; i++) {
        const { before, beforeStr, after, nested } = wildcards[i]
        if (nested === true) {
          secret[beforeStr] = secret[beforeStr] || []
          nestedRedact(secret[beforeStr], o, before, after, censor, ${isCensorFct}, ${censorFctTakesPath})
        } else secret[beforeStr] = groupRedact(o, before, censor, ${isCensorFct}, ${censorFctTakesPath})
      }
    }
  ` : ''
}

function resultTmpl (serialize) {
  return serialize === false ? `return o` : `
    var s = this.serialize(o)
    this.restore(o)
    return s
  `
}

function strictImpl (strict, serialize) {
  return strict === true
    ? `throw Error('fast-redact: primitives cannot be redacted')`
    : serialize === false ? `return o` : `return this.serialize(o)`
}

var modifiers = {
  groupRedact,
  groupRestore,
  nestedRedact,
  nestedRestore
};

function groupRestore ({ keys, values, target }) {
  if (target == null) return
  const length = keys.length;
  for (var i = 0; i < length; i++) {
    const k = keys[i];
    target[k] = values[i];
  }
}

function groupRedact (o, path, censor, isCensorFct, censorFctTakesPath) {
  const target = get(o, path);
  if (target == null) return { keys: null, values: null, target: null, flat: true }
  const keys = Object.keys(target);
  const keysLength = keys.length;
  const pathLength = path.length;
  const pathWithKey = censorFctTakesPath ? [...path] : undefined;
  const values = new Array(keysLength);

  for (var i = 0; i < keysLength; i++) {
    const key = keys[i];
    values[i] = target[key];

    if (censorFctTakesPath) {
      pathWithKey[pathLength] = key;
      target[key] = censor(target[key], pathWithKey);
    } else if (isCensorFct) {
      target[key] = censor(target[key]);
    } else {
      target[key] = censor;
    }
  }
  return { keys, values, target, flat: true }
}

function nestedRestore (arr) {
  const length = arr.length;
  for (var i = 0; i < length; i++) {
    const { key, target, value } = arr[i];
    target[key] = value;
  }
}

function nestedRedact (store, o, path, ns, censor, isCensorFct, censorFctTakesPath) {
  const target = get(o, path);
  if (target == null) return
  const keys = Object.keys(target);
  const keysLength = keys.length;
  for (var i = 0; i < keysLength; i++) {
    const key = keys[i];
    const { value, parent, exists } =
      specialSet(target, key, path, ns, censor, isCensorFct, censorFctTakesPath);

    if (exists === true && parent !== null) {
      store.push({ key: ns[ns.length - 1], target: parent, value });
    }
  }
  return store
}

function has (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

function specialSet (o, k, path, afterPath, censor, isCensorFct, censorFctTakesPath) {
  const afterPathLen = afterPath.length;
  const lastPathIndex = afterPathLen - 1;
  const originalKey = k;
  var i = -1;
  var n;
  var nv;
  var ov;
  var oov = null;
  var exists = true;
  ov = n = o[k];
  if (typeof n !== 'object') return { value: null, parent: null, exists }
  while (n != null && ++i < afterPathLen) {
    k = afterPath[i];
    oov = ov;
    if (!(k in n)) {
      exists = false;
      break
    }
    ov = n[k];
    nv = (i !== lastPathIndex)
      ? ov
      : (isCensorFct
        ? (censorFctTakesPath ? censor(ov, [...path, originalKey, ...afterPath]) : censor(ov))
        : censor);
    n[k] = (has(n, k) && nv === ov) || (nv === undefined && censor !== undefined) ? n[k] : nv;
    n = n[k];
    if (typeof n !== 'object') break
  }
  return { value: ov, parent: oov, exists }
}

function get (o, p) {
  var i = -1;
  var l = p.length;
  var n = o;
  while (n != null && ++i < l) {
    n = n[p[i]];
  }
  return n
}

const { groupRestore: groupRestore$1, nestedRestore: nestedRestore$1 } = modifiers;

var restorer_1 = restorer;

function restorer ({ secret, wcLen }) {
  return function compileRestore () {
    if (this.restore) return
    const paths = Object.keys(secret)
      .filter((path) => secret[path].precensored === false);
    const resetters = resetTmpl(secret, paths);
    const hasWildcards = wcLen > 0;
    const state = hasWildcards ? { secret, groupRestore: groupRestore$1, nestedRestore: nestedRestore$1 } : { secret };
    /* eslint-disable-next-line */
    this.restore = Function(
      'o',
      restoreTmpl(resetters, paths, hasWildcards)
    ).bind(state);
  }
}

/**
 * Mutates the original object to be censored by restoring its original values
 * prior to censoring.
 *
 * @param {object} secret Compiled object describing which target fields should
 * be censored and the field states.
 * @param {string[]} paths The list of paths to censor as provided at
 * initialization time.
 *
 * @returns {string} String of JavaScript to be used by `Function()`. The
 * string compiles to the function that does the work in the description.
 */
function resetTmpl (secret, paths) {
  return paths.map((path) => {
    const { circle, escPath, leadingBracket } = secret[path];
    const delim = leadingBracket ? '' : '.';
    const reset = circle
      ? `o.${circle} = secret[${escPath}].val`
      : `o${delim}${path} = secret[${escPath}].val`;
    const clear = `secret[${escPath}].val = undefined`;
    return `
      if (secret[${escPath}].val !== undefined) {
        try { ${reset} } catch (e) {}
        ${clear}
      }
    `
  }).join('')
}

function restoreTmpl (resetters, paths, hasWildcards) {
  const dynamicReset = hasWildcards === true ? `
    const keys = Object.keys(secret)
    const len = keys.length
    for (var i = ${paths.length}; i < len; i++) {
      const k = keys[i]
      const o = secret[k]
      if (o.flat === true) this.groupRestore(o)
      else this.nestedRestore(o)
      secret[k] = null
    }
  ` : '';

  return `
    const secret = this.secret
    ${resetters}
    ${dynamicReset}
    return o
  `
}

var state_1 = state;

function state (o) {
  const {
    secret,
    censor,
    compileRestore,
    serialize,
    groupRedact,
    nestedRedact,
    wildcards,
    wcLen
  } = o;
  const builder = [{ secret, censor, compileRestore }];
  if (serialize !== false) builder.push({ serialize });
  if (wcLen > 0) builder.push({ groupRedact, nestedRedact, wildcards, wcLen });
  return Object.assign(...builder)
}

const { groupRedact: groupRedact$1, nestedRedact: nestedRedact$1 } = modifiers;


const validate = validator_1();
const noop = (o) => o;
noop.restore = noop;

const DEFAULT_CENSOR = '[REDACTED]';
fastRedact.rx = rx;
fastRedact.validator = validator_1;

var fastRedact_1 = fastRedact;

function fastRedact (opts = {}) {
  const paths = Array.from(new Set(opts.paths || []));
  const serialize = 'serialize' in opts ? (
    opts.serialize === false ? opts.serialize
      : (typeof opts.serialize === 'function' ? opts.serialize : JSON.stringify)
  ) : JSON.stringify;
  const remove = opts.remove;
  if (remove === true && serialize !== JSON.stringify) {
    throw Error('fast-redact – remove option may only be set when serializer is JSON.stringify')
  }
  const censor = remove === true
    ? undefined
    : 'censor' in opts ? opts.censor : DEFAULT_CENSOR;

  const isCensorFct = typeof censor === 'function';
  const censorFctTakesPath = isCensorFct && censor.length > 1;

  if (paths.length === 0) return serialize || noop

  validate({ paths, serialize, censor });

  const { wildcards, wcLen, secret } = parse_1({ paths, censor });

  const compileRestore = restorer_1({ secret, wcLen });
  const strict = 'strict' in opts ? opts.strict : true;

  return redactor_1({ secret, wcLen, serialize, strict, isCensorFct, censorFctTakesPath }, state_1({
    secret,
    censor,
    compileRestore,
    serialize,
    groupRedact: groupRedact$1,
    nestedRedact: nestedRedact$1,
    wildcards,
    wcLen
  }))
}

const setLevelSym = Symbol('pino.setLevel');
const getLevelSym = Symbol('pino.getLevel');
const levelValSym = Symbol('pino.levelVal');
const useLevelLabelsSym = Symbol('pino.useLevelLabels');
const useOnlyCustomLevelsSym = Symbol('pino.useOnlyCustomLevels');
const mixinSym = Symbol('pino.mixin');

const lsCacheSym = Symbol('pino.lsCache');
const chindingsSym = Symbol('pino.chindings');
const parsedChindingsSym = Symbol('pino.parsedChindings');

const asJsonSym = Symbol('pino.asJson');
const writeSym = Symbol('pino.write');
const redactFmtSym = Symbol('pino.redactFmt');

const timeSym = Symbol('pino.time');
const timeSliceIndexSym = Symbol('pino.timeSliceIndex');
const streamSym = Symbol('pino.stream');
const stringifySym = Symbol('pino.stringify');
const stringifiersSym = Symbol('pino.stringifiers');
const endSym = Symbol('pino.end');
const formatOptsSym = Symbol('pino.formatOpts');
const messageKeySym = Symbol('pino.messageKey');
const nestedKeySym = Symbol('pino.nestedKey');

const wildcardFirstSym = Symbol('pino.wildcardFirst');

// public symbols, no need to use the same pino
// version for these
const serializersSym = Symbol.for('pino.serializers');
const formattersSym = Symbol.for('pino.formatters');
const hooksSym = Symbol.for('pino.hooks');
const needsMetadataGsym = Symbol.for('pino.metadata');

var symbols = {
  setLevelSym,
  getLevelSym,
  levelValSym,
  useLevelLabelsSym,
  mixinSym,
  lsCacheSym,
  chindingsSym,
  parsedChindingsSym,
  asJsonSym,
  writeSym,
  serializersSym,
  redactFmtSym,
  timeSym,
  timeSliceIndexSym,
  streamSym,
  stringifySym,
  stringifiersSym,
  endSym,
  formatOptsSym,
  messageKeySym,
  nestedKeySym,
  wildcardFirstSym,
  needsMetadataGsym,
  useOnlyCustomLevelsSym,
  formattersSym,
  hooksSym
};

const { redactFmtSym: redactFmtSym$1, wildcardFirstSym: wildcardFirstSym$1 } = symbols;
const { rx: rx$1, validator: validator$1 } = fastRedact_1;

const validate$1 = validator$1({
  ERR_PATHS_MUST_BE_STRINGS: () => 'pino – redacted paths must be strings',
  ERR_INVALID_PATH: (s) => `pino – redact paths array contains an invalid path (${s})`
});

const CENSOR = '[Redacted]';
const strict = false; // TODO should this be configurable?

function redaction (opts, serialize) {
  const { paths, censor } = handle(opts);

  const shape = paths.reduce((o, str) => {
    rx$1.lastIndex = 0;
    const first = rx$1.exec(str);
    const next = rx$1.exec(str);

    // ns is the top-level path segment, brackets + quoting removed.
    let ns = first[1] !== undefined
      ? first[1].replace(/^(?:"|'|`)(.*)(?:"|'|`)$/, '$1')
      : first[0];

    if (ns === '*') {
      ns = wildcardFirstSym$1;
    }

    // top level key:
    if (next === null) {
      o[ns] = null;
      return o
    }

    // path with at least two segments:
    // if ns is already redacted at the top level, ignore lower level redactions
    if (o[ns] === null) {
      return o
    }

    const { index } = next;
    const nextPath = `${str.substr(index, str.length - 1)}`;

    o[ns] = o[ns] || [];

    // shape is a mix of paths beginning with literal values and wildcard
    // paths [ "a.b.c", "*.b.z" ] should reduce to a shape of
    // { "a": [ "b.c", "b.z" ], *: [ "b.z" ] }
    // note: "b.z" is in both "a" and * arrays because "a" matches the wildcard.
    // (* entry has wildcardFirstSym as key)
    if (ns !== wildcardFirstSym$1 && o[ns].length === 0) {
      // first time ns's get all '*' redactions so far
      o[ns].push(...(o[wildcardFirstSym$1] || []));
    }

    if (ns === wildcardFirstSym$1) {
      // new * path gets added to all previously registered literal ns's.
      Object.keys(o).forEach(function (k) {
        if (o[k]) {
          o[k].push(nextPath);
        }
      });
    }

    o[ns].push(nextPath);
    return o
  }, {});

  // the redactor assigned to the format symbol key
  // provides top level redaction for instances where
  // an object is interpolated into the msg string
  const result = {
    [redactFmtSym$1]: fastRedact_1({ paths, censor, serialize, strict })
  };

  const topCensor = (...args) => {
    return typeof censor === 'function' ? serialize(censor(...args)) : serialize(censor)
  };

  return [...Object.keys(shape), ...Object.getOwnPropertySymbols(shape)].reduce((o, k) => {
    // top level key:
    if (shape[k] === null) {
      o[k] = (value) => topCensor(value, [k]);
    } else {
      const wrappedCensor = typeof censor === 'function' ? (value, path) => {
        return censor(value, [k, ...path])
      } : censor;
      o[k] = fastRedact_1({
        paths: shape[k],
        censor: wrappedCensor,
        serialize,
        strict
      });
    }
    return o
  }, result)
}

function handle (opts) {
  if (Array.isArray(opts)) {
    opts = { paths: opts, censor: CENSOR };
    validate$1(opts);
    return opts
  }
  var { paths, censor = CENSOR, remove } = opts;
  if (Array.isArray(paths) === false) { throw Error('pino – redact must contain an array of strings') }
  if (remove === true) censor = undefined;
  validate$1({ paths, censor });

  return { paths, censor }
}

var redaction_1 = redaction;

const nullTime = () => '';

const epochTime = () => `,"time":${Date.now()}`;

const unixTime = () => `,"time":${Math.round(Date.now() / 1000.0)}`;

const isoTime = () => `,"time":"${new Date(Date.now()).toISOString()}"`; // using Date.now() for testability

var time = { nullTime, epochTime, unixTime, isoTime };

// You may be tempted to copy and paste this, 
// but take a look at the commit history first,
// this is a moving target so relying on the module
// is the best way to make sure the optimization
// method is kept up to date and compatible with
// every Node version.

function flatstr (s) {
  return s
}

var flatstr_1 = flatstr;

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

var atomicSleep = createCommonjsModule(function (module) {

/* global SharedArrayBuffer, Atomics */

if (typeof SharedArrayBuffer !== 'undefined' && typeof Atomics !== 'undefined') {
  const nil = new Int32Array(new SharedArrayBuffer(4));

  function sleep (ms) {
    // also filters out NaN, non-number types, including empty strings, but allows bigints
    const valid = ms > 0 && ms < Infinity; 
    if (valid === false) {
      if (typeof ms !== 'number' && typeof ms !== 'bigint') {
        throw TypeError('sleep: ms must be a number')
      }
      throw RangeError('sleep: ms must be a number that is greater than 0 but less than Infinity')
    }

    Atomics.wait(nil, 0, 0, Number(ms));
  }
  module.exports = sleep;
} else {

  function sleep (ms) {
    // also filters out NaN, non-number types, including empty strings, but allows bigints
    const valid = ms > 0 && ms < Infinity; 
    if (valid === false) {
      if (typeof ms !== 'number' && typeof ms !== 'bigint') {
        throw TypeError('sleep: ms must be a number')
      }
      throw RangeError('sleep: ms must be a number that is greater than 0 but less than Infinity')
    }
  }

  module.exports = sleep;

}
});

const inherits = require$$0__default$1['default'].inherits;

const BUSY_WRITE_TIMEOUT = 100;



// 16 MB - magic number
// This constant ensures that SonicBoom only needs
// 32 MB of free memory to run. In case of having 1GB+
// of data to write, this prevents an out of memory
// condition.
const MAX_WRITE = 16 * 1024 * 1024;

function openFile (file, sonic) {
  sonic._opening = true;
  sonic._writing = true;
  sonic._asyncDrainScheduled = false;
  sonic.file = file;

  // NOTE: 'error' and 'ready' events emitted below only relevant when sonic.sync===false
  // for sync mode, there is no way to add a listener that will receive these

  function fileOpened (err, fd) {
    if (err) {
      sonic.emit('error', err);
      return
    }

    sonic.fd = fd;
    sonic._reopening = false;
    sonic._opening = false;
    sonic._writing = false;

    sonic.emit('ready');

    if (sonic._reopening) {
      return
    }

    // start
    var len = sonic._buf.length;
    if (len > 0 && len > sonic.minLength && !sonic.destroyed) {
      actualWrite(sonic);
    }
  }

  if (sonic.sync) {
    const fd = fs__default['default'].openSync(file, 'a');
    fileOpened(null, fd);
    process.nextTick(() => sonic.emit('ready'));
  } else {
    fs__default['default'].open(file, 'a', fileOpened);
  }
}

function SonicBoom (opts) {
  if (!(this instanceof SonicBoom)) {
    return new SonicBoom(opts)
  }

  var { fd, dest, minLength, sync } = opts || {};

  fd = fd || dest;

  this._buf = '';
  this.fd = -1;
  this._writing = false;
  this._writingBuf = '';
  this._ending = false;
  this._reopening = false;
  this._asyncDrainScheduled = false;
  this.file = null;
  this.destroyed = false;
  this.sync = sync || false;

  this.minLength = minLength || 0;

  if (typeof fd === 'number') {
    this.fd = fd;
    process.nextTick(() => this.emit('ready'));
  } else if (typeof fd === 'string') {
    openFile(fd, this);
  } else {
    throw new Error('SonicBoom supports only file descriptors and files')
  }

  this.release = (err, n) => {
    if (err) {
      if (err.code === 'EAGAIN') {
        if (this.sync) {
          // This error code should not happen in sync mode, because it is
          // not using the underlining operating system asynchronous functions.
          // However it happens, and so we handle it.
          // Ref: https://github.com/pinojs/pino/issues/783
          try {
            atomicSleep(BUSY_WRITE_TIMEOUT);
            this.release(undefined, 0);
          } catch (err) {
            this.release(err);
          }
        } else {
          // Let's give the destination some time to process the chunk.
          setTimeout(() => {
            fs__default['default'].write(this.fd, this._writingBuf, 'utf8', this.release);
          }, BUSY_WRITE_TIMEOUT);
        }
      } else {
        this.emit('error', err);
      }
      return
    }

    if (this._writingBuf.length !== n) {
      this._writingBuf = this._writingBuf.slice(n);
      if (this.sync) {
        try {
          do {
            n = fs__default['default'].writeSync(this.fd, this._writingBuf, 'utf8');
            this._writingBuf = this._writingBuf.slice(n);
          } while (this._writingBuf.length !== 0)
        } catch (err) {
          this.release(err);
          return
        }
      } else {
        fs__default['default'].write(this.fd, this._writingBuf, 'utf8', this.release);
        return
      }
    }

    this._writingBuf = '';

    if (this.destroyed) {
      return
    }

    var len = this._buf.length;
    if (this._reopening) {
      this._writing = false;
      this._reopening = false;
      this.reopen();
    } else if (len > 0 && len > this.minLength) {
      actualWrite(this);
    } else if (this._ending) {
      if (len > 0) {
        actualWrite(this);
      } else {
        this._writing = false;
        actualClose(this);
      }
    } else {
      this._writing = false;
      if (this.sync) {
        if (!this._asyncDrainScheduled) {
          this._asyncDrainScheduled = true;
          process.nextTick(emitDrain, this);
        }
      } else {
        this.emit('drain');
      }
    }
  };

  this.on('newListener', function (name) {
    if (name === 'drain') {
      this._asyncDrainScheduled = false;
    }
  });
}

function emitDrain (sonic) {
  const hasListeners = sonic.listenerCount('drain') > 0;
  if (!hasListeners) return
  sonic._asyncDrainScheduled = false;
  sonic.emit('drain');
}

inherits(SonicBoom, EventEmitter__default['default']);

SonicBoom.prototype.write = function (data) {
  if (this.destroyed) {
    throw new Error('SonicBoom destroyed')
  }

  this._buf += data;
  var len = this._buf.length;
  if (!this._writing && len > this.minLength) {
    actualWrite(this);
  }
  return len < 16384
};

SonicBoom.prototype.flush = function () {
  if (this.destroyed) {
    throw new Error('SonicBoom destroyed')
  }

  if (this._writing || this.minLength <= 0) {
    return
  }

  actualWrite(this);
};

SonicBoom.prototype.reopen = function (file) {
  if (this.destroyed) {
    throw new Error('SonicBoom destroyed')
  }

  if (this._opening) {
    this.once('ready', () => {
      this.reopen(file);
    });
    return
  }

  if (this._ending) {
    return
  }

  if (!this.file) {
    throw new Error('Unable to reopen a file descriptor, you must pass a file to SonicBoom')
  }

  this._reopening = true;

  if (this._writing) {
    return
  }

  fs__default['default'].close(this.fd, (err) => {
    if (err) {
      return this.emit('error', err)
    }
  });

  openFile(file || this.file, this);
};

SonicBoom.prototype.end = function () {
  if (this.destroyed) {
    throw new Error('SonicBoom destroyed')
  }

  if (this._opening) {
    this.once('ready', () => {
      this.end();
    });
    return
  }

  if (this._ending) {
    return
  }

  this._ending = true;

  if (!this._writing && this._buf.length > 0 && this.fd >= 0) {
    actualWrite(this);
    return
  }

  if (this._writing) {
    return
  }

  actualClose(this);
};

SonicBoom.prototype.flushSync = function () {
  if (this.destroyed) {
    throw new Error('SonicBoom destroyed')
  }

  if (this.fd < 0) {
    throw new Error('sonic boom is not ready yet')
  }

  if (this._buf.length > 0) {
    fs__default['default'].writeSync(this.fd, this._buf, 'utf8');
    this._buf = '';
  }
};

SonicBoom.prototype.destroy = function () {
  if (this.destroyed) {
    return
  }
  actualClose(this);
};

function actualWrite (sonic) {
  sonic._writing = true;
  var buf = sonic._buf;
  var release = sonic.release;
  if (buf.length > MAX_WRITE) {
    buf = buf.slice(0, MAX_WRITE);
    sonic._buf = sonic._buf.slice(MAX_WRITE);
  } else {
    sonic._buf = '';
  }
  sonic._writingBuf = buf;
  if (sonic.sync) {
    try {
      var written = fs__default['default'].writeSync(sonic.fd, buf, 'utf8');
      release(null, written);
    } catch (err) {
      release(err);
    }
  } else {
    fs__default['default'].write(sonic.fd, buf, 'utf8', release);
  }
}

function actualClose (sonic) {
  if (sonic.fd === -1) {
    sonic.once('ready', actualClose.bind(null, sonic));
    return
  }
  // TODO write a test to check if we are not leaking fds
  fs__default['default'].close(sonic.fd, (err) => {
    if (err) {
      sonic.emit('error', err);
      return
    }

    if (sonic._ending && !sonic._writing) {
      sonic.emit('finish');
    }
    sonic.emit('close');
  });
  sonic.destroyed = true;
  sonic._buf = '';
}

var sonicBoom = SonicBoom;

function tryStringify (o) {
  try { return JSON.stringify(o) } catch(e) { return '"[Circular]"' }
}

var quickFormatUnescaped = format;

function format(f, args, opts) {
  var ss = (opts && opts.stringify) || tryStringify;
  var offset = 1;
  if (typeof f === 'object' && f !== null) {
    var len = args.length + offset;
    if (len === 1) return f
    var objects = new Array(len);
    objects[0] = ss(f);
    for (var index = 1; index < len; index++) {
      objects[index] = ss(args[index]);
    }
    return objects.join(' ')
  }
  if (typeof f !== 'string') {
    return f
  }
  var argLen = args.length;
  if (argLen === 0) return f
  var str = '';
  var a = 1 - offset;
  var lastPos = -1;
  var flen = (f && f.length) || 0;
  for (var i = 0; i < flen;) {
    if (f.charCodeAt(i) === 37 && i + 1 < flen) {
      lastPos = lastPos > -1 ? lastPos : 0;
      switch (f.charCodeAt(i + 1)) {
        case 100: // 'd'
          if (a >= argLen)
            break
          if (lastPos < i)
            str += f.slice(lastPos, i);
          if (args[a] == null)  break
          str += Number(args[a]);
          lastPos = i = i + 2;
          break
        case 79: // 'O'
        case 111: // 'o'
        case 106: // 'j'
          if (a >= argLen)
            break
          if (lastPos < i)
            str += f.slice(lastPos, i);
          if (args[a] === undefined) break
          var type = typeof args[a];
          if (type === 'string') {
            str += '\'' + args[a] + '\'';
            lastPos = i + 2;
            i++;
            break
          }
          if (type === 'function') {
            str += args[a].name || '<anonymous>';
            lastPos = i + 2;
            i++;
            break
          }
          str += ss(args[a]);
          lastPos = i + 2;
          i++;
          break
        case 115: // 's'
          if (a >= argLen)
            break
          if (lastPos < i)
            str += f.slice(lastPos, i);
          str += String(args[a]);
          lastPos = i + 2;
          i++;
          break
        case 37: // '%'
          if (lastPos < i)
            str += f.slice(lastPos, i);
          str += '%';
          lastPos = i + 2;
          i++;
          break
      }
      ++a;
    }
    ++i;
  }
  if (lastPos === -1)
    return f
  else if (lastPos < flen) {
    str += f.slice(lastPos);
  }

  return str
}

var fastSafeStringify = stringify;
stringify.default = stringify;
stringify.stable = deterministicStringify;
stringify.stableStringify = deterministicStringify;

var arr = [];
var replacerStack = [];

// Regular stringify
function stringify (obj, replacer, spacer) {
  decirc(obj, '', [], undefined);
  var res;
  if (replacerStack.length === 0) {
    res = JSON.stringify(obj, replacer, spacer);
  } else {
    res = JSON.stringify(obj, replaceGetterValues(replacer), spacer);
  }
  while (arr.length !== 0) {
    var part = arr.pop();
    if (part.length === 4) {
      Object.defineProperty(part[0], part[1], part[3]);
    } else {
      part[0][part[1]] = part[2];
    }
  }
  return res
}
function decirc (val, k, stack, parent) {
  var i;
  if (typeof val === 'object' && val !== null) {
    for (i = 0; i < stack.length; i++) {
      if (stack[i] === val) {
        var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k);
        if (propertyDescriptor.get !== undefined) {
          if (propertyDescriptor.configurable) {
            Object.defineProperty(parent, k, { value: '[Circular]' });
            arr.push([parent, k, val, propertyDescriptor]);
          } else {
            replacerStack.push([val, k]);
          }
        } else {
          parent[k] = '[Circular]';
          arr.push([parent, k, val]);
        }
        return
      }
    }
    stack.push(val);
    // Optimize for Arrays. Big arrays could kill the performance otherwise!
    if (Array.isArray(val)) {
      for (i = 0; i < val.length; i++) {
        decirc(val[i], i, stack, val);
      }
    } else {
      var keys = Object.keys(val);
      for (i = 0; i < keys.length; i++) {
        var key = keys[i];
        decirc(val[key], key, stack, val);
      }
    }
    stack.pop();
  }
}

// Stable-stringify
function compareFunction (a, b) {
  if (a < b) {
    return -1
  }
  if (a > b) {
    return 1
  }
  return 0
}

function deterministicStringify (obj, replacer, spacer) {
  var tmp = deterministicDecirc(obj, '', [], undefined) || obj;
  var res;
  if (replacerStack.length === 0) {
    res = JSON.stringify(tmp, replacer, spacer);
  } else {
    res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer);
  }
  while (arr.length !== 0) {
    var part = arr.pop();
    if (part.length === 4) {
      Object.defineProperty(part[0], part[1], part[3]);
    } else {
      part[0][part[1]] = part[2];
    }
  }
  return res
}

function deterministicDecirc (val, k, stack, parent) {
  var i;
  if (typeof val === 'object' && val !== null) {
    for (i = 0; i < stack.length; i++) {
      if (stack[i] === val) {
        var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k);
        if (propertyDescriptor.get !== undefined) {
          if (propertyDescriptor.configurable) {
            Object.defineProperty(parent, k, { value: '[Circular]' });
            arr.push([parent, k, val, propertyDescriptor]);
          } else {
            replacerStack.push([val, k]);
          }
        } else {
          parent[k] = '[Circular]';
          arr.push([parent, k, val]);
        }
        return
      }
    }
    if (typeof val.toJSON === 'function') {
      return
    }
    stack.push(val);
    // Optimize for Arrays. Big arrays could kill the performance otherwise!
    if (Array.isArray(val)) {
      for (i = 0; i < val.length; i++) {
        deterministicDecirc(val[i], i, stack, val);
      }
    } else {
      // Create a temporary object in the required way
      var tmp = {};
      var keys = Object.keys(val).sort(compareFunction);
      for (i = 0; i < keys.length; i++) {
        var key = keys[i];
        deterministicDecirc(val[key], key, stack, val);
        tmp[key] = val[key];
      }
      if (parent !== undefined) {
        arr.push([parent, k, val]);
        parent[k] = tmp;
      } else {
        return tmp
      }
    }
    stack.pop();
  }
}

// wraps replacer function to handle values we couldn't replace
// and mark them as [Circular]
function replaceGetterValues (replacer) {
  replacer = replacer !== undefined ? replacer : function (k, v) { return v };
  return function (key, val) {
    if (replacerStack.length > 0) {
      for (var i = 0; i < replacerStack.length; i++) {
        var part = replacerStack[i];
        if (part[1] === key && part[0] === val) {
          val = '[Circular]';
          replacerStack.splice(i, 1);
          break
        }
      }
    }
    return replacer.call(this, key, val)
  }
}

var colorName = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};

/* MIT license */

/* eslint-disable no-mixed-operators */


// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

const reverseKeywords = {};
for (const key of Object.keys(colorName)) {
	reverseKeywords[colorName[key]] = key;
}

const convert = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

var conversions = convert;

// Hide .channels and .labels properties
for (const model of Object.keys(convert)) {
	if (!('channels' in convert[model])) {
		throw new Error('missing channels property: ' + model);
	}

	if (!('labels' in convert[model])) {
		throw new Error('missing channel labels property: ' + model);
	}

	if (convert[model].labels.length !== convert[model].channels) {
		throw new Error('channel and label counts mismatch: ' + model);
	}

	const {channels, labels} = convert[model];
	delete convert[model].channels;
	delete convert[model].labels;
	Object.defineProperty(convert[model], 'channels', {value: channels});
	Object.defineProperty(convert[model], 'labels', {value: labels});
}

convert.rgb.hsl = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const min = Math.min(r, g, b);
	const max = Math.max(r, g, b);
	const delta = max - min;
	let h;
	let s;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	const l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	let rdif;
	let gdif;
	let bdif;
	let h;
	let s;

	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const v = Math.max(r, g, b);
	const diff = v - Math.min(r, g, b);
	const diffc = function (c) {
		return (v - c) / 6 / diff + 1 / 2;
	};

	if (diff === 0) {
		h = 0;
		s = 0;
	} else {
		s = diff / v;
		rdif = diffc(r);
		gdif = diffc(g);
		bdif = diffc(b);

		if (r === v) {
			h = bdif - gdif;
		} else if (g === v) {
			h = (1 / 3) + rdif - bdif;
		} else if (b === v) {
			h = (2 / 3) + gdif - rdif;
		}

		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}

	return [
		h * 360,
		s * 100,
		v * 100
	];
};

convert.rgb.hwb = function (rgb) {
	const r = rgb[0];
	const g = rgb[1];
	let b = rgb[2];
	const h = convert.rgb.hsl(rgb)[0];
	const w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;

	const k = Math.min(1 - r, 1 - g, 1 - b);
	const c = (1 - r - k) / (1 - k) || 0;
	const m = (1 - g - k) / (1 - k) || 0;
	const y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

function comparativeDistance(x, y) {
	/*
		See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
	*/
	return (
		((x[0] - y[0]) ** 2) +
		((x[1] - y[1]) ** 2) +
		((x[2] - y[2]) ** 2)
	);
}

convert.rgb.keyword = function (rgb) {
	const reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	let currentClosestDistance = Infinity;
	let currentClosestKeyword;

	for (const keyword of Object.keys(colorName)) {
		const value = colorName[keyword];

		// Compute comparative distance
		const distance = comparativeDistance(rgb, value);

		// Check if its less, if so set as closest
		if (distance < currentClosestDistance) {
			currentClosestDistance = distance;
			currentClosestKeyword = keyword;
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return colorName[keyword];
};

convert.rgb.xyz = function (rgb) {
	let r = rgb[0] / 255;
	let g = rgb[1] / 255;
	let b = rgb[2] / 255;

	// Assume sRGB
	r = r > 0.04045 ? (((r + 0.055) / 1.055) ** 2.4) : (r / 12.92);
	g = g > 0.04045 ? (((g + 0.055) / 1.055) ** 2.4) : (g / 12.92);
	b = b > 0.04045 ? (((b + 0.055) / 1.055) ** 2.4) : (b / 12.92);

	const x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	const y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	const z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	const xyz = convert.rgb.xyz(rgb);
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	const h = hsl[0] / 360;
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;
	let t2;
	let t3;
	let val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	const t1 = 2 * l - t2;

	const rgb = [0, 0, 0];
	for (let i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}

		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	const h = hsl[0];
	let s = hsl[1] / 100;
	let l = hsl[2] / 100;
	let smin = s;
	const lmin = Math.max(l, 0.01);

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	const v = (l + s) / 2;
	const sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	const h = hsv[0] / 60;
	const s = hsv[1] / 100;
	let v = hsv[2] / 100;
	const hi = Math.floor(h) % 6;

	const f = h - Math.floor(h);
	const p = 255 * v * (1 - s);
	const q = 255 * v * (1 - (s * f));
	const t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	const h = hsv[0];
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;
	const vmin = Math.max(v, 0.01);
	let sl;
	let l;

	l = (2 - s) * v;
	const lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	const h = hwb[0] / 360;
	let wh = hwb[1] / 100;
	let bl = hwb[2] / 100;
	const ratio = wh + bl;
	let f;

	// Wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	const i = Math.floor(6 * h);
	const v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	const n = wh + f * (v - wh); // Linear interpolation

	let r;
	let g;
	let b;
	/* eslint-disable max-statements-per-line,no-multi-spaces */
	switch (i) {
		default:
		case 6:
		case 0: r = v;  g = n;  b = wh; break;
		case 1: r = n;  g = v;  b = wh; break;
		case 2: r = wh; g = v;  b = n; break;
		case 3: r = wh; g = n;  b = v; break;
		case 4: r = n;  g = wh; b = v; break;
		case 5: r = v;  g = wh; b = n; break;
	}
	/* eslint-enable max-statements-per-line,no-multi-spaces */

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	const c = cmyk[0] / 100;
	const m = cmyk[1] / 100;
	const y = cmyk[2] / 100;
	const k = cmyk[3] / 100;

	const r = 1 - Math.min(1, c * (1 - k) + k);
	const g = 1 - Math.min(1, m * (1 - k) + k);
	const b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	const x = xyz[0] / 100;
	const y = xyz[1] / 100;
	const z = xyz[2] / 100;
	let r;
	let g;
	let b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// Assume sRGB
	r = r > 0.0031308
		? ((1.055 * (r ** (1.0 / 2.4))) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * (g ** (1.0 / 2.4))) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * (b ** (1.0 / 2.4))) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let x;
	let y;
	let z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	const y2 = y ** 3;
	const x2 = x ** 3;
	const z2 = z ** 3;
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let h;

	const hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	const c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	const l = lch[0];
	const c = lch[1];
	const h = lch[2];

	const hr = h / 360 * 2 * Math.PI;
	const a = c * Math.cos(hr);
	const b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args, saturation = null) {
	const [r, g, b] = args;
	let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation; // Hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	let ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// Optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	const r = args[0];
	const g = args[1];
	const b = args[2];

	// We use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	const ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	let color = args % 10;

	// Handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	const mult = (~~(args > 50) + 1) * 0.5;
	const r = ((color & 1) * mult) * 255;
	const g = (((color >> 1) & 1) * mult) * 255;
	const b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// Handle greyscale
	if (args >= 232) {
		const c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	let rem;
	const r = Math.floor(args / 36) / 5 * 255;
	const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	const b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	const integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	let colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(char => {
			return char + char;
		}).join('');
	}

	const integer = parseInt(colorString, 16);
	const r = (integer >> 16) & 0xFF;
	const g = (integer >> 8) & 0xFF;
	const b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const max = Math.max(Math.max(r, g), b);
	const min = Math.min(Math.min(r, g), b);
	const chroma = (max - min);
	let grayscale;
	let hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;

	const c = l < 0.5 ? (2.0 * s * l) : (2.0 * s * (1.0 - l));

	let f = 0;
	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;

	const c = s * v;
	let f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	const h = hcg[0] / 360;
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	const pure = [0, 0, 0];
	const hi = (h % 1) * 6;
	const v = hi % 1;
	const w = 1 - v;
	let mg = 0;

	/* eslint-disable max-statements-per-line */
	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}
	/* eslint-enable max-statements-per-line */

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const v = c + g * (1.0 - c);
	let f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const l = g * (1.0 - c) + 0.5 * c;
	let s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;
	const v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	const w = hwb[1] / 100;
	const b = hwb[2] / 100;
	const v = 1 - b;
	const c = v - w;
	let g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hsv = convert.gray.hsl;

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	const val = Math.round(gray[0] / 100 * 255) & 0xFF;
	const integer = (val << 16) + (val << 8) + val;

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};

/*
	This function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

function buildGraph() {
	const graph = {};
	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
	const models = Object.keys(conversions);

	for (let len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	const graph = buildGraph();
	const queue = [fromModel]; // Unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		const current = queue.pop();
		const adjacents = Object.keys(conversions[current]);

		for (let len = adjacents.length, i = 0; i < len; i++) {
			const adjacent = adjacents[i];
			const node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	const path = [graph[toModel].parent, toModel];
	let fn = conversions[graph[toModel].parent][toModel];

	let cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path.unshift(graph[cur].parent);
		fn = link(conversions[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path;
	return fn;
}

var route = function (fromModel) {
	const graph = deriveBFS(fromModel);
	const conversion = {};

	const models = Object.keys(graph);
	for (let len = models.length, i = 0; i < len; i++) {
		const toModel = models[i];
		const node = graph[toModel];

		if (node.parent === null) {
			// No possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};

const convert$1 = {};

const models = Object.keys(conversions);

function wrapRaw(fn) {
	const wrappedFn = function (...args) {
		const arg0 = args[0];
		if (arg0 === undefined || arg0 === null) {
			return arg0;
		}

		if (arg0.length > 1) {
			args = arg0;
		}

		return fn(args);
	};

	// Preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	const wrappedFn = function (...args) {
		const arg0 = args[0];

		if (arg0 === undefined || arg0 === null) {
			return arg0;
		}

		if (arg0.length > 1) {
			args = arg0;
		}

		const result = fn(args);

		// We're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (let len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// Preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(fromModel => {
	convert$1[fromModel] = {};

	Object.defineProperty(convert$1[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert$1[fromModel], 'labels', {value: conversions[fromModel].labels});

	const routes = route(fromModel);
	const routeModels = Object.keys(routes);

	routeModels.forEach(toModel => {
		const fn = routes[toModel];

		convert$1[fromModel][toModel] = wrapRounded(fn);
		convert$1[fromModel][toModel].raw = wrapRaw(fn);
	});
});

var colorConvert = convert$1;

var ansiStyles = createCommonjsModule(function (module) {

const wrapAnsi16 = (fn, offset) => (...args) => {
	const code = fn(...args);
	return `\u001B[${code + offset}m`;
};

const wrapAnsi256 = (fn, offset) => (...args) => {
	const code = fn(...args);
	return `\u001B[${38 + offset};5;${code}m`;
};

const wrapAnsi16m = (fn, offset) => (...args) => {
	const rgb = fn(...args);
	return `\u001B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
};

const ansi2ansi = n => n;
const rgb2rgb = (r, g, b) => [r, g, b];

const setLazyProperty = (object, property, get) => {
	Object.defineProperty(object, property, {
		get: () => {
			const value = get();

			Object.defineProperty(object, property, {
				value,
				enumerable: true,
				configurable: true
			});

			return value;
		},
		enumerable: true,
		configurable: true
	});
};

/** @type {typeof import('color-convert')} */
let colorConvert$1;
const makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
	if (colorConvert$1 === undefined) {
		colorConvert$1 = colorConvert;
	}

	const offset = isBackground ? 10 : 0;
	const styles = {};

	for (const [sourceSpace, suite] of Object.entries(colorConvert$1)) {
		const name = sourceSpace === 'ansi16' ? 'ansi' : sourceSpace;
		if (sourceSpace === targetSpace) {
			styles[name] = wrap(identity, offset);
		} else if (typeof suite === 'object') {
			styles[name] = wrap(suite[targetSpace], offset);
		}
	}

	return styles;
};

function assembleStyles() {
	const codes = new Map();
	const styles = {
		modifier: {
			reset: [0, 0],
			// 21 isn't widely supported and 22 does the same thing
			bold: [1, 22],
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		color: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],

			// Bright color
			blackBright: [90, 39],
			redBright: [91, 39],
			greenBright: [92, 39],
			yellowBright: [93, 39],
			blueBright: [94, 39],
			magentaBright: [95, 39],
			cyanBright: [96, 39],
			whiteBright: [97, 39]
		},
		bgColor: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49],

			// Bright color
			bgBlackBright: [100, 49],
			bgRedBright: [101, 49],
			bgGreenBright: [102, 49],
			bgYellowBright: [103, 49],
			bgBlueBright: [104, 49],
			bgMagentaBright: [105, 49],
			bgCyanBright: [106, 49],
			bgWhiteBright: [107, 49]
		}
	};

	// Alias bright black as gray (and grey)
	styles.color.gray = styles.color.blackBright;
	styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
	styles.color.grey = styles.color.blackBright;
	styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;

	for (const [groupName, group] of Object.entries(styles)) {
		for (const [styleName, style] of Object.entries(group)) {
			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`
			};

			group[styleName] = styles[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});
	}

	Object.defineProperty(styles, 'codes', {
		value: codes,
		enumerable: false
	});

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	setLazyProperty(styles.color, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, false));
	setLazyProperty(styles.color, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, false));
	setLazyProperty(styles.color, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, false));
	setLazyProperty(styles.bgColor, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, true));
	setLazyProperty(styles.bgColor, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, true));
	setLazyProperty(styles.bgColor, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, true));

	return styles;
}

// Make the export immutable
Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});
});

var hasFlag = (flag, argv = process.argv) => {
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const position = argv.indexOf(prefix + flag);
	const terminatorPosition = argv.indexOf('--');
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
};

const {env} = process;

let forceColor;
if (hasFlag('no-color') ||
	hasFlag('no-colors') ||
	hasFlag('color=false') ||
	hasFlag('color=never')) {
	forceColor = 0;
} else if (hasFlag('color') ||
	hasFlag('colors') ||
	hasFlag('color=true') ||
	hasFlag('color=always')) {
	forceColor = 1;
}

if ('FORCE_COLOR' in env) {
	if (env.FORCE_COLOR === 'true') {
		forceColor = 1;
	} else if (env.FORCE_COLOR === 'false') {
		forceColor = 0;
	} else {
		forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
	}
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}

function supportsColor(haveStream, streamIsTTY) {
	if (forceColor === 0) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (haveStream && !streamIsTTY && forceColor === undefined) {
		return 0;
	}

	const min = forceColor || 0;

	if (env.TERM === 'dumb') {
		return min;
	}

	if (process.platform === 'win32') {
		// Windows 10 build 10586 is the first Windows release that supports 256 colors.
		// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
		const osRelease = os__default['default'].release().split('.');
		if (
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Number(osRelease[2]) >= 14931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'GITHUB_ACTIONS', 'BUILDKITE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	return min;
}

function getSupportLevel(stream) {
	const level = supportsColor(stream, stream && stream.isTTY);
	return translateLevel(level);
}

var supportsColor_1 = {
	supportsColor: getSupportLevel,
	stdout: translateLevel(supportsColor(true, tty__default['default'].isatty(1))),
	stderr: translateLevel(supportsColor(true, tty__default['default'].isatty(2)))
};

const stringReplaceAll = (string, substring, replacer) => {
	let index = string.indexOf(substring);
	if (index === -1) {
		return string;
	}

	const substringLength = substring.length;
	let endIndex = 0;
	let returnValue = '';
	do {
		returnValue += string.substr(endIndex, index - endIndex) + substring + replacer;
		endIndex = index + substringLength;
		index = string.indexOf(substring, endIndex);
	} while (index !== -1);

	returnValue += string.substr(endIndex);
	return returnValue;
};

const stringEncaseCRLFWithFirstIndex = (string, prefix, postfix, index) => {
	let endIndex = 0;
	let returnValue = '';
	do {
		const gotCR = string[index - 1] === '\r';
		returnValue += string.substr(endIndex, (gotCR ? index - 1 : index) - endIndex) + prefix + (gotCR ? '\r\n' : '\n') + postfix;
		endIndex = index + 1;
		index = string.indexOf('\n', endIndex);
	} while (index !== -1);

	returnValue += string.substr(endIndex);
	return returnValue;
};

var util = {
	stringReplaceAll,
	stringEncaseCRLFWithFirstIndex
};

const TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|\{[a-f\d]{1,6}\})|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
const STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
const STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
const ESCAPE_REGEX = /\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.)|([^\\])/gi;

const ESCAPES = new Map([
	['n', '\n'],
	['r', '\r'],
	['t', '\t'],
	['b', '\b'],
	['f', '\f'],
	['v', '\v'],
	['0', '\0'],
	['\\', '\\'],
	['e', '\u001B'],
	['a', '\u0007']
]);

function unescape(c) {
	const u = c[0] === 'u';
	const bracket = c[1] === '{';

	if ((u && !bracket && c.length === 5) || (c[0] === 'x' && c.length === 3)) {
		return String.fromCharCode(parseInt(c.slice(1), 16));
	}

	if (u && bracket) {
		return String.fromCodePoint(parseInt(c.slice(2, -1), 16));
	}

	return ESCAPES.get(c) || c;
}

function parseArguments(name, arguments_) {
	const results = [];
	const chunks = arguments_.trim().split(/\s*,\s*/g);
	let matches;

	for (const chunk of chunks) {
		const number = Number(chunk);
		if (!Number.isNaN(number)) {
			results.push(number);
		} else if ((matches = chunk.match(STRING_REGEX))) {
			results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, character) => escape ? unescape(escape) : character));
		} else {
			throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
		}
	}

	return results;
}

function parseStyle(style) {
	STYLE_REGEX.lastIndex = 0;

	const results = [];
	let matches;

	while ((matches = STYLE_REGEX.exec(style)) !== null) {
		const name = matches[1];

		if (matches[2]) {
			const args = parseArguments(name, matches[2]);
			results.push([name].concat(args));
		} else {
			results.push([name]);
		}
	}

	return results;
}

function buildStyle(chalk, styles) {
	const enabled = {};

	for (const layer of styles) {
		for (const style of layer.styles) {
			enabled[style[0]] = layer.inverse ? null : style.slice(1);
		}
	}

	let current = chalk;
	for (const [styleName, styles] of Object.entries(enabled)) {
		if (!Array.isArray(styles)) {
			continue;
		}

		if (!(styleName in current)) {
			throw new Error(`Unknown Chalk style: ${styleName}`);
		}

		current = styles.length > 0 ? current[styleName](...styles) : current[styleName];
	}

	return current;
}

var templates = (chalk, temporary) => {
	const styles = [];
	const chunks = [];
	let chunk = [];

	// eslint-disable-next-line max-params
	temporary.replace(TEMPLATE_REGEX, (m, escapeCharacter, inverse, style, close, character) => {
		if (escapeCharacter) {
			chunk.push(unescape(escapeCharacter));
		} else if (style) {
			const string = chunk.join('');
			chunk = [];
			chunks.push(styles.length === 0 ? string : buildStyle(chalk, styles)(string));
			styles.push({inverse, styles: parseStyle(style)});
		} else if (close) {
			if (styles.length === 0) {
				throw new Error('Found extraneous } in Chalk template literal');
			}

			chunks.push(buildStyle(chalk, styles)(chunk.join('')));
			chunk = [];
			styles.pop();
		} else {
			chunk.push(character);
		}
	});

	chunks.push(chunk.join(''));

	if (styles.length > 0) {
		const errMessage = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? '' : 's'} (\`}\`)`;
		throw new Error(errMessage);
	}

	return chunks.join('');
};

const {stdout: stdoutColor, stderr: stderrColor} = supportsColor_1;
const {
	stringReplaceAll: stringReplaceAll$1,
	stringEncaseCRLFWithFirstIndex: stringEncaseCRLFWithFirstIndex$1
} = util;

const {isArray} = Array;

// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping = [
	'ansi',
	'ansi',
	'ansi256',
	'ansi16m'
];

const styles = Object.create(null);

const applyOptions = (object, options = {}) => {
	if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
		throw new Error('The `level` option should be an integer from 0 to 3');
	}

	// Detect level if not set manually
	const colorLevel = stdoutColor ? stdoutColor.level : 0;
	object.level = options.level === undefined ? colorLevel : options.level;
};

class ChalkClass {
	constructor(options) {
		// eslint-disable-next-line no-constructor-return
		return chalkFactory(options);
	}
}

const chalkFactory = options => {
	const chalk = {};
	applyOptions(chalk, options);

	chalk.template = (...arguments_) => chalkTag(chalk.template, ...arguments_);

	Object.setPrototypeOf(chalk, Chalk.prototype);
	Object.setPrototypeOf(chalk.template, chalk);

	chalk.template.constructor = () => {
		throw new Error('`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.');
	};

	chalk.template.Instance = ChalkClass;

	return chalk.template;
};

function Chalk(options) {
	return chalkFactory(options);
}

for (const [styleName, style] of Object.entries(ansiStyles)) {
	styles[styleName] = {
		get() {
			const builder = createBuilder(this, createStyler(style.open, style.close, this._styler), this._isEmpty);
			Object.defineProperty(this, styleName, {value: builder});
			return builder;
		}
	};
}

styles.visible = {
	get() {
		const builder = createBuilder(this, this._styler, true);
		Object.defineProperty(this, 'visible', {value: builder});
		return builder;
	}
};

const usedModels = ['rgb', 'hex', 'keyword', 'hsl', 'hsv', 'hwb', 'ansi', 'ansi256'];

for (const model of usedModels) {
	styles[model] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(ansiStyles.color[levelMapping[level]][model](...arguments_), ansiStyles.color.close, this._styler);
				return createBuilder(this, styler, this._isEmpty);
			};
		}
	};
}

for (const model of usedModels) {
	const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
	styles[bgModel] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(ansiStyles.bgColor[levelMapping[level]][model](...arguments_), ansiStyles.bgColor.close, this._styler);
				return createBuilder(this, styler, this._isEmpty);
			};
		}
	};
}

const proto = Object.defineProperties(() => {}, {
	...styles,
	level: {
		enumerable: true,
		get() {
			return this._generator.level;
		},
		set(level) {
			this._generator.level = level;
		}
	}
});

const createStyler = (open, close, parent) => {
	let openAll;
	let closeAll;
	if (parent === undefined) {
		openAll = open;
		closeAll = close;
	} else {
		openAll = parent.openAll + open;
		closeAll = close + parent.closeAll;
	}

	return {
		open,
		close,
		openAll,
		closeAll,
		parent
	};
};

const createBuilder = (self, _styler, _isEmpty) => {
	const builder = (...arguments_) => {
		if (isArray(arguments_[0]) && isArray(arguments_[0].raw)) {
			// Called as a template literal, for example: chalk.red`2 + 3 = {bold ${2+3}}`
			return applyStyle(builder, chalkTag(builder, ...arguments_));
		}

		// Single argument is hot path, implicit coercion is faster than anything
		// eslint-disable-next-line no-implicit-coercion
		return applyStyle(builder, (arguments_.length === 1) ? ('' + arguments_[0]) : arguments_.join(' '));
	};

	// We alter the prototype because we must return a function, but there is
	// no way to create a function with a different prototype
	Object.setPrototypeOf(builder, proto);

	builder._generator = self;
	builder._styler = _styler;
	builder._isEmpty = _isEmpty;

	return builder;
};

const applyStyle = (self, string) => {
	if (self.level <= 0 || !string) {
		return self._isEmpty ? '' : string;
	}

	let styler = self._styler;

	if (styler === undefined) {
		return string;
	}

	const {openAll, closeAll} = styler;
	if (string.indexOf('\u001B') !== -1) {
		while (styler !== undefined) {
			// Replace any instances already present with a re-opening code
			// otherwise only the part of the string until said closing code
			// will be colored, and the rest will simply be 'plain'.
			string = stringReplaceAll$1(string, styler.close, styler.open);

			styler = styler.parent;
		}
	}

	// We can move both next actions out of loop, because remaining actions in loop won't have
	// any/visible effect on parts we add here. Close the styling before a linebreak and reopen
	// after next line to fix a bleed issue on macOS: https://github.com/chalk/chalk/pull/92
	const lfIndex = string.indexOf('\n');
	if (lfIndex !== -1) {
		string = stringEncaseCRLFWithFirstIndex$1(string, closeAll, openAll, lfIndex);
	}

	return openAll + string + closeAll;
};

let template;
const chalkTag = (chalk, ...strings) => {
	const [firstString] = strings;

	if (!isArray(firstString) || !isArray(firstString.raw)) {
		// If chalk() was called by itself or with a string,
		// return the string itself as a string.
		return strings.join(' ');
	}

	const arguments_ = strings.slice(1);
	const parts = [firstString.raw[0]];

	for (let i = 1; i < firstString.length; i++) {
		parts.push(
			String(arguments_[i - 1]).replace(/[{}\\]/g, '\\$&'),
			String(firstString.raw[i])
		);
	}

	if (template === undefined) {
		template = templates;
	}

	return template(chalk, parts.join(''));
};

Object.defineProperties(Chalk.prototype, styles);

const chalk = Chalk(); // eslint-disable-line new-cap
chalk.supportsColor = stdoutColor;
chalk.stderr = Chalk({level: stderrColor ? stderrColor.level : 0}); // eslint-disable-line new-cap
chalk.stderr.supportsColor = stderrColor;

var source = chalk;

var jmespath = createCommonjsModule(function (module, exports) {
(function(exports) {

  function isArray(obj) {
    if (obj !== null) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    } else {
      return false;
    }
  }

  function isObject(obj) {
    if (obj !== null) {
      return Object.prototype.toString.call(obj) === "[object Object]";
    } else {
      return false;
    }
  }

  function strictDeepEqual(first, second) {
    // Check the scalar case first.
    if (first === second) {
      return true;
    }

    // Check if they are the same type.
    var firstType = Object.prototype.toString.call(first);
    if (firstType !== Object.prototype.toString.call(second)) {
      return false;
    }
    // We know that first and second have the same type so we can just check the
    // first type from now on.
    if (isArray(first) === true) {
      // Short circuit if they're not the same length;
      if (first.length !== second.length) {
        return false;
      }
      for (var i = 0; i < first.length; i++) {
        if (strictDeepEqual(first[i], second[i]) === false) {
          return false;
        }
      }
      return true;
    }
    if (isObject(first) === true) {
      // An object is equal if it has the same key/value pairs.
      var keysSeen = {};
      for (var key in first) {
        if (hasOwnProperty.call(first, key)) {
          if (strictDeepEqual(first[key], second[key]) === false) {
            return false;
          }
          keysSeen[key] = true;
        }
      }
      // Now check that there aren't any keys in second that weren't
      // in first.
      for (var key2 in second) {
        if (hasOwnProperty.call(second, key2)) {
          if (keysSeen[key2] !== true) {
            return false;
          }
        }
      }
      return true;
    }
    return false;
  }

  function isFalse(obj) {
    // From the spec:
    // A false value corresponds to the following values:
    // Empty list
    // Empty object
    // Empty string
    // False boolean
    // null value

    // First check the scalar values.
    if (obj === "" || obj === false || obj === null) {
        return true;
    } else if (isArray(obj) && obj.length === 0) {
        // Check for an empty array.
        return true;
    } else if (isObject(obj)) {
        // Check for an empty object.
        for (var key in obj) {
            // If there are any keys, then
            // the object is not empty so the object
            // is not false.
            if (obj.hasOwnProperty(key)) {
              return false;
            }
        }
        return true;
    } else {
        return false;
    }
  }

  function objValues(obj) {
    var keys = Object.keys(obj);
    var values = [];
    for (var i = 0; i < keys.length; i++) {
      values.push(obj[keys[i]]);
    }
    return values;
  }

  var trimLeft;
  if (typeof String.prototype.trimLeft === "function") {
    trimLeft = function(str) {
      return str.trimLeft();
    };
  } else {
    trimLeft = function(str) {
      return str.match(/^\s*(.*)/)[1];
    };
  }

  // Type constants used to define functions.
  var TYPE_NUMBER = 0;
  var TYPE_ANY = 1;
  var TYPE_STRING = 2;
  var TYPE_ARRAY = 3;
  var TYPE_OBJECT = 4;
  var TYPE_BOOLEAN = 5;
  var TYPE_EXPREF = 6;
  var TYPE_NULL = 7;
  var TYPE_ARRAY_NUMBER = 8;
  var TYPE_ARRAY_STRING = 9;

  var TOK_EOF = "EOF";
  var TOK_UNQUOTEDIDENTIFIER = "UnquotedIdentifier";
  var TOK_QUOTEDIDENTIFIER = "QuotedIdentifier";
  var TOK_RBRACKET = "Rbracket";
  var TOK_RPAREN = "Rparen";
  var TOK_COMMA = "Comma";
  var TOK_COLON = "Colon";
  var TOK_RBRACE = "Rbrace";
  var TOK_NUMBER = "Number";
  var TOK_CURRENT = "Current";
  var TOK_EXPREF = "Expref";
  var TOK_PIPE = "Pipe";
  var TOK_OR = "Or";
  var TOK_AND = "And";
  var TOK_EQ = "EQ";
  var TOK_GT = "GT";
  var TOK_LT = "LT";
  var TOK_GTE = "GTE";
  var TOK_LTE = "LTE";
  var TOK_NE = "NE";
  var TOK_FLATTEN = "Flatten";
  var TOK_STAR = "Star";
  var TOK_FILTER = "Filter";
  var TOK_DOT = "Dot";
  var TOK_NOT = "Not";
  var TOK_LBRACE = "Lbrace";
  var TOK_LBRACKET = "Lbracket";
  var TOK_LPAREN= "Lparen";
  var TOK_LITERAL= "Literal";

  // The "&", "[", "<", ">" tokens
  // are not in basicToken because
  // there are two token variants
  // ("&&", "[?", "<=", ">=").  This is specially handled
  // below.

  var basicTokens = {
    ".": TOK_DOT,
    "*": TOK_STAR,
    ",": TOK_COMMA,
    ":": TOK_COLON,
    "{": TOK_LBRACE,
    "}": TOK_RBRACE,
    "]": TOK_RBRACKET,
    "(": TOK_LPAREN,
    ")": TOK_RPAREN,
    "@": TOK_CURRENT
  };

  var operatorStartToken = {
      "<": true,
      ">": true,
      "=": true,
      "!": true
  };

  var skipChars = {
      " ": true,
      "\t": true,
      "\n": true
  };


  function isAlpha(ch) {
      return (ch >= "a" && ch <= "z") ||
             (ch >= "A" && ch <= "Z") ||
             ch === "_";
  }

  function isNum(ch) {
      return (ch >= "0" && ch <= "9") ||
             ch === "-";
  }
  function isAlphaNum(ch) {
      return (ch >= "a" && ch <= "z") ||
             (ch >= "A" && ch <= "Z") ||
             (ch >= "0" && ch <= "9") ||
             ch === "_";
  }

  function Lexer() {
  }
  Lexer.prototype = {
      tokenize: function(stream) {
          var tokens = [];
          this._current = 0;
          var start;
          var identifier;
          var token;
          while (this._current < stream.length) {
              if (isAlpha(stream[this._current])) {
                  start = this._current;
                  identifier = this._consumeUnquotedIdentifier(stream);
                  tokens.push({type: TOK_UNQUOTEDIDENTIFIER,
                               value: identifier,
                               start: start});
              } else if (basicTokens[stream[this._current]] !== undefined) {
                  tokens.push({type: basicTokens[stream[this._current]],
                              value: stream[this._current],
                              start: this._current});
                  this._current++;
              } else if (isNum(stream[this._current])) {
                  token = this._consumeNumber(stream);
                  tokens.push(token);
              } else if (stream[this._current] === "[") {
                  // No need to increment this._current.  This happens
                  // in _consumeLBracket
                  token = this._consumeLBracket(stream);
                  tokens.push(token);
              } else if (stream[this._current] === "\"") {
                  start = this._current;
                  identifier = this._consumeQuotedIdentifier(stream);
                  tokens.push({type: TOK_QUOTEDIDENTIFIER,
                               value: identifier,
                               start: start});
              } else if (stream[this._current] === "'") {
                  start = this._current;
                  identifier = this._consumeRawStringLiteral(stream);
                  tokens.push({type: TOK_LITERAL,
                               value: identifier,
                               start: start});
              } else if (stream[this._current] === "`") {
                  start = this._current;
                  var literal = this._consumeLiteral(stream);
                  tokens.push({type: TOK_LITERAL,
                               value: literal,
                               start: start});
              } else if (operatorStartToken[stream[this._current]] !== undefined) {
                  tokens.push(this._consumeOperator(stream));
              } else if (skipChars[stream[this._current]] !== undefined) {
                  // Ignore whitespace.
                  this._current++;
              } else if (stream[this._current] === "&") {
                  start = this._current;
                  this._current++;
                  if (stream[this._current] === "&") {
                      this._current++;
                      tokens.push({type: TOK_AND, value: "&&", start: start});
                  } else {
                      tokens.push({type: TOK_EXPREF, value: "&", start: start});
                  }
              } else if (stream[this._current] === "|") {
                  start = this._current;
                  this._current++;
                  if (stream[this._current] === "|") {
                      this._current++;
                      tokens.push({type: TOK_OR, value: "||", start: start});
                  } else {
                      tokens.push({type: TOK_PIPE, value: "|", start: start});
                  }
              } else {
                  var error = new Error("Unknown character:" + stream[this._current]);
                  error.name = "LexerError";
                  throw error;
              }
          }
          return tokens;
      },

      _consumeUnquotedIdentifier: function(stream) {
          var start = this._current;
          this._current++;
          while (this._current < stream.length && isAlphaNum(stream[this._current])) {
              this._current++;
          }
          return stream.slice(start, this._current);
      },

      _consumeQuotedIdentifier: function(stream) {
          var start = this._current;
          this._current++;
          var maxLength = stream.length;
          while (stream[this._current] !== "\"" && this._current < maxLength) {
              // You can escape a double quote and you can escape an escape.
              var current = this._current;
              if (stream[current] === "\\" && (stream[current + 1] === "\\" ||
                                               stream[current + 1] === "\"")) {
                  current += 2;
              } else {
                  current++;
              }
              this._current = current;
          }
          this._current++;
          return JSON.parse(stream.slice(start, this._current));
      },

      _consumeRawStringLiteral: function(stream) {
          var start = this._current;
          this._current++;
          var maxLength = stream.length;
          while (stream[this._current] !== "'" && this._current < maxLength) {
              // You can escape a single quote and you can escape an escape.
              var current = this._current;
              if (stream[current] === "\\" && (stream[current + 1] === "\\" ||
                                               stream[current + 1] === "'")) {
                  current += 2;
              } else {
                  current++;
              }
              this._current = current;
          }
          this._current++;
          var literal = stream.slice(start + 1, this._current - 1);
          return literal.replace("\\'", "'");
      },

      _consumeNumber: function(stream) {
          var start = this._current;
          this._current++;
          var maxLength = stream.length;
          while (isNum(stream[this._current]) && this._current < maxLength) {
              this._current++;
          }
          var value = parseInt(stream.slice(start, this._current));
          return {type: TOK_NUMBER, value: value, start: start};
      },

      _consumeLBracket: function(stream) {
          var start = this._current;
          this._current++;
          if (stream[this._current] === "?") {
              this._current++;
              return {type: TOK_FILTER, value: "[?", start: start};
          } else if (stream[this._current] === "]") {
              this._current++;
              return {type: TOK_FLATTEN, value: "[]", start: start};
          } else {
              return {type: TOK_LBRACKET, value: "[", start: start};
          }
      },

      _consumeOperator: function(stream) {
          var start = this._current;
          var startingChar = stream[start];
          this._current++;
          if (startingChar === "!") {
              if (stream[this._current] === "=") {
                  this._current++;
                  return {type: TOK_NE, value: "!=", start: start};
              } else {
                return {type: TOK_NOT, value: "!", start: start};
              }
          } else if (startingChar === "<") {
              if (stream[this._current] === "=") {
                  this._current++;
                  return {type: TOK_LTE, value: "<=", start: start};
              } else {
                  return {type: TOK_LT, value: "<", start: start};
              }
          } else if (startingChar === ">") {
              if (stream[this._current] === "=") {
                  this._current++;
                  return {type: TOK_GTE, value: ">=", start: start};
              } else {
                  return {type: TOK_GT, value: ">", start: start};
              }
          } else if (startingChar === "=") {
              if (stream[this._current] === "=") {
                  this._current++;
                  return {type: TOK_EQ, value: "==", start: start};
              }
          }
      },

      _consumeLiteral: function(stream) {
          this._current++;
          var start = this._current;
          var maxLength = stream.length;
          var literal;
          while(stream[this._current] !== "`" && this._current < maxLength) {
              // You can escape a literal char or you can escape the escape.
              var current = this._current;
              if (stream[current] === "\\" && (stream[current + 1] === "\\" ||
                                               stream[current + 1] === "`")) {
                  current += 2;
              } else {
                  current++;
              }
              this._current = current;
          }
          var literalString = trimLeft(stream.slice(start, this._current));
          literalString = literalString.replace("\\`", "`");
          if (this._looksLikeJSON(literalString)) {
              literal = JSON.parse(literalString);
          } else {
              // Try to JSON parse it as "<literal>"
              literal = JSON.parse("\"" + literalString + "\"");
          }
          // +1 gets us to the ending "`", +1 to move on to the next char.
          this._current++;
          return literal;
      },

      _looksLikeJSON: function(literalString) {
          var startingChars = "[{\"";
          var jsonLiterals = ["true", "false", "null"];
          var numberLooking = "-0123456789";

          if (literalString === "") {
              return false;
          } else if (startingChars.indexOf(literalString[0]) >= 0) {
              return true;
          } else if (jsonLiterals.indexOf(literalString) >= 0) {
              return true;
          } else if (numberLooking.indexOf(literalString[0]) >= 0) {
              try {
                  JSON.parse(literalString);
                  return true;
              } catch (ex) {
                  return false;
              }
          } else {
              return false;
          }
      }
  };

      var bindingPower = {};
      bindingPower[TOK_EOF] = 0;
      bindingPower[TOK_UNQUOTEDIDENTIFIER] = 0;
      bindingPower[TOK_QUOTEDIDENTIFIER] = 0;
      bindingPower[TOK_RBRACKET] = 0;
      bindingPower[TOK_RPAREN] = 0;
      bindingPower[TOK_COMMA] = 0;
      bindingPower[TOK_RBRACE] = 0;
      bindingPower[TOK_NUMBER] = 0;
      bindingPower[TOK_CURRENT] = 0;
      bindingPower[TOK_EXPREF] = 0;
      bindingPower[TOK_PIPE] = 1;
      bindingPower[TOK_OR] = 2;
      bindingPower[TOK_AND] = 3;
      bindingPower[TOK_EQ] = 5;
      bindingPower[TOK_GT] = 5;
      bindingPower[TOK_LT] = 5;
      bindingPower[TOK_GTE] = 5;
      bindingPower[TOK_LTE] = 5;
      bindingPower[TOK_NE] = 5;
      bindingPower[TOK_FLATTEN] = 9;
      bindingPower[TOK_STAR] = 20;
      bindingPower[TOK_FILTER] = 21;
      bindingPower[TOK_DOT] = 40;
      bindingPower[TOK_NOT] = 45;
      bindingPower[TOK_LBRACE] = 50;
      bindingPower[TOK_LBRACKET] = 55;
      bindingPower[TOK_LPAREN] = 60;

  function Parser() {
  }

  Parser.prototype = {
      parse: function(expression) {
          this._loadTokens(expression);
          this.index = 0;
          var ast = this.expression(0);
          if (this._lookahead(0) !== TOK_EOF) {
              var t = this._lookaheadToken(0);
              var error = new Error(
                  "Unexpected token type: " + t.type + ", value: " + t.value);
              error.name = "ParserError";
              throw error;
          }
          return ast;
      },

      _loadTokens: function(expression) {
          var lexer = new Lexer();
          var tokens = lexer.tokenize(expression);
          tokens.push({type: TOK_EOF, value: "", start: expression.length});
          this.tokens = tokens;
      },

      expression: function(rbp) {
          var leftToken = this._lookaheadToken(0);
          this._advance();
          var left = this.nud(leftToken);
          var currentToken = this._lookahead(0);
          while (rbp < bindingPower[currentToken]) {
              this._advance();
              left = this.led(currentToken, left);
              currentToken = this._lookahead(0);
          }
          return left;
      },

      _lookahead: function(number) {
          return this.tokens[this.index + number].type;
      },

      _lookaheadToken: function(number) {
          return this.tokens[this.index + number];
      },

      _advance: function() {
          this.index++;
      },

      nud: function(token) {
        var left;
        var right;
        var expression;
        switch (token.type) {
          case TOK_LITERAL:
            return {type: "Literal", value: token.value};
          case TOK_UNQUOTEDIDENTIFIER:
            return {type: "Field", name: token.value};
          case TOK_QUOTEDIDENTIFIER:
            var node = {type: "Field", name: token.value};
            if (this._lookahead(0) === TOK_LPAREN) {
                throw new Error("Quoted identifier not allowed for function names.");
            } else {
                return node;
            }
          case TOK_NOT:
            right = this.expression(bindingPower.Not);
            return {type: "NotExpression", children: [right]};
          case TOK_STAR:
            left = {type: "Identity"};
            right = null;
            if (this._lookahead(0) === TOK_RBRACKET) {
                // This can happen in a multiselect,
                // [a, b, *]
                right = {type: "Identity"};
            } else {
                right = this._parseProjectionRHS(bindingPower.Star);
            }
            return {type: "ValueProjection", children: [left, right]};
          case TOK_FILTER:
            return this.led(token.type, {type: "Identity"});
          case TOK_LBRACE:
            return this._parseMultiselectHash();
          case TOK_FLATTEN:
            left = {type: TOK_FLATTEN, children: [{type: "Identity"}]};
            right = this._parseProjectionRHS(bindingPower.Flatten);
            return {type: "Projection", children: [left, right]};
          case TOK_LBRACKET:
            if (this._lookahead(0) === TOK_NUMBER || this._lookahead(0) === TOK_COLON) {
                right = this._parseIndexExpression();
                return this._projectIfSlice({type: "Identity"}, right);
            } else if (this._lookahead(0) === TOK_STAR &&
                       this._lookahead(1) === TOK_RBRACKET) {
                this._advance();
                this._advance();
                right = this._parseProjectionRHS(bindingPower.Star);
                return {type: "Projection",
                        children: [{type: "Identity"}, right]};
            } else {
                return this._parseMultiselectList();
            }
          case TOK_CURRENT:
            return {type: TOK_CURRENT};
          case TOK_EXPREF:
            expression = this.expression(bindingPower.Expref);
            return {type: "ExpressionReference", children: [expression]};
          case TOK_LPAREN:
            var args = [];
            while (this._lookahead(0) !== TOK_RPAREN) {
              if (this._lookahead(0) === TOK_CURRENT) {
                expression = {type: TOK_CURRENT};
                this._advance();
              } else {
                expression = this.expression(0);
              }
              args.push(expression);
            }
            this._match(TOK_RPAREN);
            return args[0];
          default:
            this._errorToken(token);
        }
      },

      led: function(tokenName, left) {
        var right;
        switch(tokenName) {
          case TOK_DOT:
            var rbp = bindingPower.Dot;
            if (this._lookahead(0) !== TOK_STAR) {
                right = this._parseDotRHS(rbp);
                return {type: "Subexpression", children: [left, right]};
            } else {
                // Creating a projection.
                this._advance();
                right = this._parseProjectionRHS(rbp);
                return {type: "ValueProjection", children: [left, right]};
            }
          case TOK_PIPE:
            right = this.expression(bindingPower.Pipe);
            return {type: TOK_PIPE, children: [left, right]};
          case TOK_OR:
            right = this.expression(bindingPower.Or);
            return {type: "OrExpression", children: [left, right]};
          case TOK_AND:
            right = this.expression(bindingPower.And);
            return {type: "AndExpression", children: [left, right]};
          case TOK_LPAREN:
            var name = left.name;
            var args = [];
            var expression, node;
            while (this._lookahead(0) !== TOK_RPAREN) {
              if (this._lookahead(0) === TOK_CURRENT) {
                expression = {type: TOK_CURRENT};
                this._advance();
              } else {
                expression = this.expression(0);
              }
              if (this._lookahead(0) === TOK_COMMA) {
                this._match(TOK_COMMA);
              }
              args.push(expression);
            }
            this._match(TOK_RPAREN);
            node = {type: "Function", name: name, children: args};
            return node;
          case TOK_FILTER:
            var condition = this.expression(0);
            this._match(TOK_RBRACKET);
            if (this._lookahead(0) === TOK_FLATTEN) {
              right = {type: "Identity"};
            } else {
              right = this._parseProjectionRHS(bindingPower.Filter);
            }
            return {type: "FilterProjection", children: [left, right, condition]};
          case TOK_FLATTEN:
            var leftNode = {type: TOK_FLATTEN, children: [left]};
            var rightNode = this._parseProjectionRHS(bindingPower.Flatten);
            return {type: "Projection", children: [leftNode, rightNode]};
          case TOK_EQ:
          case TOK_NE:
          case TOK_GT:
          case TOK_GTE:
          case TOK_LT:
          case TOK_LTE:
            return this._parseComparator(left, tokenName);
          case TOK_LBRACKET:
            var token = this._lookaheadToken(0);
            if (token.type === TOK_NUMBER || token.type === TOK_COLON) {
                right = this._parseIndexExpression();
                return this._projectIfSlice(left, right);
            } else {
                this._match(TOK_STAR);
                this._match(TOK_RBRACKET);
                right = this._parseProjectionRHS(bindingPower.Star);
                return {type: "Projection", children: [left, right]};
            }
          default:
            this._errorToken(this._lookaheadToken(0));
        }
      },

      _match: function(tokenType) {
          if (this._lookahead(0) === tokenType) {
              this._advance();
          } else {
              var t = this._lookaheadToken(0);
              var error = new Error("Expected " + tokenType + ", got: " + t.type);
              error.name = "ParserError";
              throw error;
          }
      },

      _errorToken: function(token) {
          var error = new Error("Invalid token (" +
                                token.type + "): \"" +
                                token.value + "\"");
          error.name = "ParserError";
          throw error;
      },


      _parseIndexExpression: function() {
          if (this._lookahead(0) === TOK_COLON || this._lookahead(1) === TOK_COLON) {
              return this._parseSliceExpression();
          } else {
              var node = {
                  type: "Index",
                  value: this._lookaheadToken(0).value};
              this._advance();
              this._match(TOK_RBRACKET);
              return node;
          }
      },

      _projectIfSlice: function(left, right) {
          var indexExpr = {type: "IndexExpression", children: [left, right]};
          if (right.type === "Slice") {
              return {
                  type: "Projection",
                  children: [indexExpr, this._parseProjectionRHS(bindingPower.Star)]
              };
          } else {
              return indexExpr;
          }
      },

      _parseSliceExpression: function() {
          // [start:end:step] where each part is optional, as well as the last
          // colon.
          var parts = [null, null, null];
          var index = 0;
          var currentToken = this._lookahead(0);
          while (currentToken !== TOK_RBRACKET && index < 3) {
              if (currentToken === TOK_COLON) {
                  index++;
                  this._advance();
              } else if (currentToken === TOK_NUMBER) {
                  parts[index] = this._lookaheadToken(0).value;
                  this._advance();
              } else {
                  var t = this._lookahead(0);
                  var error = new Error("Syntax error, unexpected token: " +
                                        t.value + "(" + t.type + ")");
                  error.name = "Parsererror";
                  throw error;
              }
              currentToken = this._lookahead(0);
          }
          this._match(TOK_RBRACKET);
          return {
              type: "Slice",
              children: parts
          };
      },

      _parseComparator: function(left, comparator) {
        var right = this.expression(bindingPower[comparator]);
        return {type: "Comparator", name: comparator, children: [left, right]};
      },

      _parseDotRHS: function(rbp) {
          var lookahead = this._lookahead(0);
          var exprTokens = [TOK_UNQUOTEDIDENTIFIER, TOK_QUOTEDIDENTIFIER, TOK_STAR];
          if (exprTokens.indexOf(lookahead) >= 0) {
              return this.expression(rbp);
          } else if (lookahead === TOK_LBRACKET) {
              this._match(TOK_LBRACKET);
              return this._parseMultiselectList();
          } else if (lookahead === TOK_LBRACE) {
              this._match(TOK_LBRACE);
              return this._parseMultiselectHash();
          }
      },

      _parseProjectionRHS: function(rbp) {
          var right;
          if (bindingPower[this._lookahead(0)] < 10) {
              right = {type: "Identity"};
          } else if (this._lookahead(0) === TOK_LBRACKET) {
              right = this.expression(rbp);
          } else if (this._lookahead(0) === TOK_FILTER) {
              right = this.expression(rbp);
          } else if (this._lookahead(0) === TOK_DOT) {
              this._match(TOK_DOT);
              right = this._parseDotRHS(rbp);
          } else {
              var t = this._lookaheadToken(0);
              var error = new Error("Sytanx error, unexpected token: " +
                                    t.value + "(" + t.type + ")");
              error.name = "ParserError";
              throw error;
          }
          return right;
      },

      _parseMultiselectList: function() {
          var expressions = [];
          while (this._lookahead(0) !== TOK_RBRACKET) {
              var expression = this.expression(0);
              expressions.push(expression);
              if (this._lookahead(0) === TOK_COMMA) {
                  this._match(TOK_COMMA);
                  if (this._lookahead(0) === TOK_RBRACKET) {
                    throw new Error("Unexpected token Rbracket");
                  }
              }
          }
          this._match(TOK_RBRACKET);
          return {type: "MultiSelectList", children: expressions};
      },

      _parseMultiselectHash: function() {
        var pairs = [];
        var identifierTypes = [TOK_UNQUOTEDIDENTIFIER, TOK_QUOTEDIDENTIFIER];
        var keyToken, keyName, value, node;
        for (;;) {
          keyToken = this._lookaheadToken(0);
          if (identifierTypes.indexOf(keyToken.type) < 0) {
            throw new Error("Expecting an identifier token, got: " +
                            keyToken.type);
          }
          keyName = keyToken.value;
          this._advance();
          this._match(TOK_COLON);
          value = this.expression(0);
          node = {type: "KeyValuePair", name: keyName, value: value};
          pairs.push(node);
          if (this._lookahead(0) === TOK_COMMA) {
            this._match(TOK_COMMA);
          } else if (this._lookahead(0) === TOK_RBRACE) {
            this._match(TOK_RBRACE);
            break;
          }
        }
        return {type: "MultiSelectHash", children: pairs};
      }
  };


  function TreeInterpreter(runtime) {
    this.runtime = runtime;
  }

  TreeInterpreter.prototype = {
      search: function(node, value) {
          return this.visit(node, value);
      },

      visit: function(node, value) {
          var matched, current, result, first, second, field, left, right, collected, i;
          switch (node.type) {
            case "Field":
              if (value === null ) {
                  return null;
              } else if (isObject(value)) {
                  field = value[node.name];
                  if (field === undefined) {
                      return null;
                  } else {
                      return field;
                  }
              } else {
                return null;
              }
            case "Subexpression":
              result = this.visit(node.children[0], value);
              for (i = 1; i < node.children.length; i++) {
                  result = this.visit(node.children[1], result);
                  if (result === null) {
                      return null;
                  }
              }
              return result;
            case "IndexExpression":
              left = this.visit(node.children[0], value);
              right = this.visit(node.children[1], left);
              return right;
            case "Index":
              if (!isArray(value)) {
                return null;
              }
              var index = node.value;
              if (index < 0) {
                index = value.length + index;
              }
              result = value[index];
              if (result === undefined) {
                result = null;
              }
              return result;
            case "Slice":
              if (!isArray(value)) {
                return null;
              }
              var sliceParams = node.children.slice(0);
              var computed = this.computeSliceParams(value.length, sliceParams);
              var start = computed[0];
              var stop = computed[1];
              var step = computed[2];
              result = [];
              if (step > 0) {
                  for (i = start; i < stop; i += step) {
                      result.push(value[i]);
                  }
              } else {
                  for (i = start; i > stop; i += step) {
                      result.push(value[i]);
                  }
              }
              return result;
            case "Projection":
              // Evaluate left child.
              var base = this.visit(node.children[0], value);
              if (!isArray(base)) {
                return null;
              }
              collected = [];
              for (i = 0; i < base.length; i++) {
                current = this.visit(node.children[1], base[i]);
                if (current !== null) {
                  collected.push(current);
                }
              }
              return collected;
            case "ValueProjection":
              // Evaluate left child.
              base = this.visit(node.children[0], value);
              if (!isObject(base)) {
                return null;
              }
              collected = [];
              var values = objValues(base);
              for (i = 0; i < values.length; i++) {
                current = this.visit(node.children[1], values[i]);
                if (current !== null) {
                  collected.push(current);
                }
              }
              return collected;
            case "FilterProjection":
              base = this.visit(node.children[0], value);
              if (!isArray(base)) {
                return null;
              }
              var filtered = [];
              var finalResults = [];
              for (i = 0; i < base.length; i++) {
                matched = this.visit(node.children[2], base[i]);
                if (!isFalse(matched)) {
                  filtered.push(base[i]);
                }
              }
              for (var j = 0; j < filtered.length; j++) {
                current = this.visit(node.children[1], filtered[j]);
                if (current !== null) {
                  finalResults.push(current);
                }
              }
              return finalResults;
            case "Comparator":
              first = this.visit(node.children[0], value);
              second = this.visit(node.children[1], value);
              switch(node.name) {
                case TOK_EQ:
                  result = strictDeepEqual(first, second);
                  break;
                case TOK_NE:
                  result = !strictDeepEqual(first, second);
                  break;
                case TOK_GT:
                  result = first > second;
                  break;
                case TOK_GTE:
                  result = first >= second;
                  break;
                case TOK_LT:
                  result = first < second;
                  break;
                case TOK_LTE:
                  result = first <= second;
                  break;
                default:
                  throw new Error("Unknown comparator: " + node.name);
              }
              return result;
            case TOK_FLATTEN:
              var original = this.visit(node.children[0], value);
              if (!isArray(original)) {
                return null;
              }
              var merged = [];
              for (i = 0; i < original.length; i++) {
                current = original[i];
                if (isArray(current)) {
                  merged.push.apply(merged, current);
                } else {
                  merged.push(current);
                }
              }
              return merged;
            case "Identity":
              return value;
            case "MultiSelectList":
              if (value === null) {
                return null;
              }
              collected = [];
              for (i = 0; i < node.children.length; i++) {
                  collected.push(this.visit(node.children[i], value));
              }
              return collected;
            case "MultiSelectHash":
              if (value === null) {
                return null;
              }
              collected = {};
              var child;
              for (i = 0; i < node.children.length; i++) {
                child = node.children[i];
                collected[child.name] = this.visit(child.value, value);
              }
              return collected;
            case "OrExpression":
              matched = this.visit(node.children[0], value);
              if (isFalse(matched)) {
                  matched = this.visit(node.children[1], value);
              }
              return matched;
            case "AndExpression":
              first = this.visit(node.children[0], value);

              if (isFalse(first) === true) {
                return first;
              }
              return this.visit(node.children[1], value);
            case "NotExpression":
              first = this.visit(node.children[0], value);
              return isFalse(first);
            case "Literal":
              return node.value;
            case TOK_PIPE:
              left = this.visit(node.children[0], value);
              return this.visit(node.children[1], left);
            case TOK_CURRENT:
              return value;
            case "Function":
              var resolvedArgs = [];
              for (i = 0; i < node.children.length; i++) {
                  resolvedArgs.push(this.visit(node.children[i], value));
              }
              return this.runtime.callFunction(node.name, resolvedArgs);
            case "ExpressionReference":
              var refNode = node.children[0];
              // Tag the node with a specific attribute so the type
              // checker verify the type.
              refNode.jmespathType = TOK_EXPREF;
              return refNode;
            default:
              throw new Error("Unknown node type: " + node.type);
          }
      },

      computeSliceParams: function(arrayLength, sliceParams) {
        var start = sliceParams[0];
        var stop = sliceParams[1];
        var step = sliceParams[2];
        var computed = [null, null, null];
        if (step === null) {
          step = 1;
        } else if (step === 0) {
          var error = new Error("Invalid slice, step cannot be 0");
          error.name = "RuntimeError";
          throw error;
        }
        var stepValueNegative = step < 0 ? true : false;

        if (start === null) {
            start = stepValueNegative ? arrayLength - 1 : 0;
        } else {
            start = this.capSliceRange(arrayLength, start, step);
        }

        if (stop === null) {
            stop = stepValueNegative ? -1 : arrayLength;
        } else {
            stop = this.capSliceRange(arrayLength, stop, step);
        }
        computed[0] = start;
        computed[1] = stop;
        computed[2] = step;
        return computed;
      },

      capSliceRange: function(arrayLength, actualValue, step) {
          if (actualValue < 0) {
              actualValue += arrayLength;
              if (actualValue < 0) {
                  actualValue = step < 0 ? -1 : 0;
              }
          } else if (actualValue >= arrayLength) {
              actualValue = step < 0 ? arrayLength - 1 : arrayLength;
          }
          return actualValue;
      }

  };

  function Runtime(interpreter) {
    this._interpreter = interpreter;
    this.functionTable = {
        // name: [function, <signature>]
        // The <signature> can be:
        //
        // {
        //   args: [[type1, type2], [type1, type2]],
        //   variadic: true|false
        // }
        //
        // Each arg in the arg list is a list of valid types
        // (if the function is overloaded and supports multiple
        // types.  If the type is "any" then no type checking
        // occurs on the argument.  Variadic is optional
        // and if not provided is assumed to be false.
        abs: {_func: this._functionAbs, _signature: [{types: [TYPE_NUMBER]}]},
        avg: {_func: this._functionAvg, _signature: [{types: [TYPE_ARRAY_NUMBER]}]},
        ceil: {_func: this._functionCeil, _signature: [{types: [TYPE_NUMBER]}]},
        contains: {
            _func: this._functionContains,
            _signature: [{types: [TYPE_STRING, TYPE_ARRAY]},
                        {types: [TYPE_ANY]}]},
        "ends_with": {
            _func: this._functionEndsWith,
            _signature: [{types: [TYPE_STRING]}, {types: [TYPE_STRING]}]},
        floor: {_func: this._functionFloor, _signature: [{types: [TYPE_NUMBER]}]},
        length: {
            _func: this._functionLength,
            _signature: [{types: [TYPE_STRING, TYPE_ARRAY, TYPE_OBJECT]}]},
        map: {
            _func: this._functionMap,
            _signature: [{types: [TYPE_EXPREF]}, {types: [TYPE_ARRAY]}]},
        max: {
            _func: this._functionMax,
            _signature: [{types: [TYPE_ARRAY_NUMBER, TYPE_ARRAY_STRING]}]},
        "merge": {
            _func: this._functionMerge,
            _signature: [{types: [TYPE_OBJECT], variadic: true}]
        },
        "max_by": {
          _func: this._functionMaxBy,
          _signature: [{types: [TYPE_ARRAY]}, {types: [TYPE_EXPREF]}]
        },
        sum: {_func: this._functionSum, _signature: [{types: [TYPE_ARRAY_NUMBER]}]},
        "starts_with": {
            _func: this._functionStartsWith,
            _signature: [{types: [TYPE_STRING]}, {types: [TYPE_STRING]}]},
        min: {
            _func: this._functionMin,
            _signature: [{types: [TYPE_ARRAY_NUMBER, TYPE_ARRAY_STRING]}]},
        "min_by": {
          _func: this._functionMinBy,
          _signature: [{types: [TYPE_ARRAY]}, {types: [TYPE_EXPREF]}]
        },
        type: {_func: this._functionType, _signature: [{types: [TYPE_ANY]}]},
        keys: {_func: this._functionKeys, _signature: [{types: [TYPE_OBJECT]}]},
        values: {_func: this._functionValues, _signature: [{types: [TYPE_OBJECT]}]},
        sort: {_func: this._functionSort, _signature: [{types: [TYPE_ARRAY_STRING, TYPE_ARRAY_NUMBER]}]},
        "sort_by": {
          _func: this._functionSortBy,
          _signature: [{types: [TYPE_ARRAY]}, {types: [TYPE_EXPREF]}]
        },
        join: {
            _func: this._functionJoin,
            _signature: [
                {types: [TYPE_STRING]},
                {types: [TYPE_ARRAY_STRING]}
            ]
        },
        reverse: {
            _func: this._functionReverse,
            _signature: [{types: [TYPE_STRING, TYPE_ARRAY]}]},
        "to_array": {_func: this._functionToArray, _signature: [{types: [TYPE_ANY]}]},
        "to_string": {_func: this._functionToString, _signature: [{types: [TYPE_ANY]}]},
        "to_number": {_func: this._functionToNumber, _signature: [{types: [TYPE_ANY]}]},
        "not_null": {
            _func: this._functionNotNull,
            _signature: [{types: [TYPE_ANY], variadic: true}]
        }
    };
  }

  Runtime.prototype = {
    callFunction: function(name, resolvedArgs) {
      var functionEntry = this.functionTable[name];
      if (functionEntry === undefined) {
          throw new Error("Unknown function: " + name + "()");
      }
      this._validateArgs(name, resolvedArgs, functionEntry._signature);
      return functionEntry._func.call(this, resolvedArgs);
    },

    _validateArgs: function(name, args, signature) {
        // Validating the args requires validating
        // the correct arity and the correct type of each arg.
        // If the last argument is declared as variadic, then we need
        // a minimum number of args to be required.  Otherwise it has to
        // be an exact amount.
        var pluralized;
        if (signature[signature.length - 1].variadic) {
            if (args.length < signature.length) {
                pluralized = signature.length === 1 ? " argument" : " arguments";
                throw new Error("ArgumentError: " + name + "() " +
                                "takes at least" + signature.length + pluralized +
                                " but received " + args.length);
            }
        } else if (args.length !== signature.length) {
            pluralized = signature.length === 1 ? " argument" : " arguments";
            throw new Error("ArgumentError: " + name + "() " +
                            "takes " + signature.length + pluralized +
                            " but received " + args.length);
        }
        var currentSpec;
        var actualType;
        var typeMatched;
        for (var i = 0; i < signature.length; i++) {
            typeMatched = false;
            currentSpec = signature[i].types;
            actualType = this._getTypeName(args[i]);
            for (var j = 0; j < currentSpec.length; j++) {
                if (this._typeMatches(actualType, currentSpec[j], args[i])) {
                    typeMatched = true;
                    break;
                }
            }
            if (!typeMatched) {
                throw new Error("TypeError: " + name + "() " +
                                "expected argument " + (i + 1) +
                                " to be type " + currentSpec +
                                " but received type " + actualType +
                                " instead.");
            }
        }
    },

    _typeMatches: function(actual, expected, argValue) {
        if (expected === TYPE_ANY) {
            return true;
        }
        if (expected === TYPE_ARRAY_STRING ||
            expected === TYPE_ARRAY_NUMBER ||
            expected === TYPE_ARRAY) {
            // The expected type can either just be array,
            // or it can require a specific subtype (array of numbers).
            //
            // The simplest case is if "array" with no subtype is specified.
            if (expected === TYPE_ARRAY) {
                return actual === TYPE_ARRAY;
            } else if (actual === TYPE_ARRAY) {
                // Otherwise we need to check subtypes.
                // I think this has potential to be improved.
                var subtype;
                if (expected === TYPE_ARRAY_NUMBER) {
                  subtype = TYPE_NUMBER;
                } else if (expected === TYPE_ARRAY_STRING) {
                  subtype = TYPE_STRING;
                }
                for (var i = 0; i < argValue.length; i++) {
                    if (!this._typeMatches(
                            this._getTypeName(argValue[i]), subtype,
                                             argValue[i])) {
                        return false;
                    }
                }
                return true;
            }
        } else {
            return actual === expected;
        }
    },
    _getTypeName: function(obj) {
        switch (Object.prototype.toString.call(obj)) {
            case "[object String]":
              return TYPE_STRING;
            case "[object Number]":
              return TYPE_NUMBER;
            case "[object Array]":
              return TYPE_ARRAY;
            case "[object Boolean]":
              return TYPE_BOOLEAN;
            case "[object Null]":
              return TYPE_NULL;
            case "[object Object]":
              // Check if it's an expref.  If it has, it's been
              // tagged with a jmespathType attr of 'Expref';
              if (obj.jmespathType === TOK_EXPREF) {
                return TYPE_EXPREF;
              } else {
                return TYPE_OBJECT;
              }
        }
    },

    _functionStartsWith: function(resolvedArgs) {
        return resolvedArgs[0].lastIndexOf(resolvedArgs[1]) === 0;
    },

    _functionEndsWith: function(resolvedArgs) {
        var searchStr = resolvedArgs[0];
        var suffix = resolvedArgs[1];
        return searchStr.indexOf(suffix, searchStr.length - suffix.length) !== -1;
    },

    _functionReverse: function(resolvedArgs) {
        var typeName = this._getTypeName(resolvedArgs[0]);
        if (typeName === TYPE_STRING) {
          var originalStr = resolvedArgs[0];
          var reversedStr = "";
          for (var i = originalStr.length - 1; i >= 0; i--) {
              reversedStr += originalStr[i];
          }
          return reversedStr;
        } else {
          var reversedArray = resolvedArgs[0].slice(0);
          reversedArray.reverse();
          return reversedArray;
        }
    },

    _functionAbs: function(resolvedArgs) {
      return Math.abs(resolvedArgs[0]);
    },

    _functionCeil: function(resolvedArgs) {
        return Math.ceil(resolvedArgs[0]);
    },

    _functionAvg: function(resolvedArgs) {
        var sum = 0;
        var inputArray = resolvedArgs[0];
        for (var i = 0; i < inputArray.length; i++) {
            sum += inputArray[i];
        }
        return sum / inputArray.length;
    },

    _functionContains: function(resolvedArgs) {
        return resolvedArgs[0].indexOf(resolvedArgs[1]) >= 0;
    },

    _functionFloor: function(resolvedArgs) {
        return Math.floor(resolvedArgs[0]);
    },

    _functionLength: function(resolvedArgs) {
       if (!isObject(resolvedArgs[0])) {
         return resolvedArgs[0].length;
       } else {
         // As far as I can tell, there's no way to get the length
         // of an object without O(n) iteration through the object.
         return Object.keys(resolvedArgs[0]).length;
       }
    },

    _functionMap: function(resolvedArgs) {
      var mapped = [];
      var interpreter = this._interpreter;
      var exprefNode = resolvedArgs[0];
      var elements = resolvedArgs[1];
      for (var i = 0; i < elements.length; i++) {
          mapped.push(interpreter.visit(exprefNode, elements[i]));
      }
      return mapped;
    },

    _functionMerge: function(resolvedArgs) {
      var merged = {};
      for (var i = 0; i < resolvedArgs.length; i++) {
        var current = resolvedArgs[i];
        for (var key in current) {
          merged[key] = current[key];
        }
      }
      return merged;
    },

    _functionMax: function(resolvedArgs) {
      if (resolvedArgs[0].length > 0) {
        var typeName = this._getTypeName(resolvedArgs[0][0]);
        if (typeName === TYPE_NUMBER) {
          return Math.max.apply(Math, resolvedArgs[0]);
        } else {
          var elements = resolvedArgs[0];
          var maxElement = elements[0];
          for (var i = 1; i < elements.length; i++) {
              if (maxElement.localeCompare(elements[i]) < 0) {
                  maxElement = elements[i];
              }
          }
          return maxElement;
        }
      } else {
          return null;
      }
    },

    _functionMin: function(resolvedArgs) {
      if (resolvedArgs[0].length > 0) {
        var typeName = this._getTypeName(resolvedArgs[0][0]);
        if (typeName === TYPE_NUMBER) {
          return Math.min.apply(Math, resolvedArgs[0]);
        } else {
          var elements = resolvedArgs[0];
          var minElement = elements[0];
          for (var i = 1; i < elements.length; i++) {
              if (elements[i].localeCompare(minElement) < 0) {
                  minElement = elements[i];
              }
          }
          return minElement;
        }
      } else {
        return null;
      }
    },

    _functionSum: function(resolvedArgs) {
      var sum = 0;
      var listToSum = resolvedArgs[0];
      for (var i = 0; i < listToSum.length; i++) {
        sum += listToSum[i];
      }
      return sum;
    },

    _functionType: function(resolvedArgs) {
        switch (this._getTypeName(resolvedArgs[0])) {
          case TYPE_NUMBER:
            return "number";
          case TYPE_STRING:
            return "string";
          case TYPE_ARRAY:
            return "array";
          case TYPE_OBJECT:
            return "object";
          case TYPE_BOOLEAN:
            return "boolean";
          case TYPE_EXPREF:
            return "expref";
          case TYPE_NULL:
            return "null";
        }
    },

    _functionKeys: function(resolvedArgs) {
        return Object.keys(resolvedArgs[0]);
    },

    _functionValues: function(resolvedArgs) {
        var obj = resolvedArgs[0];
        var keys = Object.keys(obj);
        var values = [];
        for (var i = 0; i < keys.length; i++) {
            values.push(obj[keys[i]]);
        }
        return values;
    },

    _functionJoin: function(resolvedArgs) {
        var joinChar = resolvedArgs[0];
        var listJoin = resolvedArgs[1];
        return listJoin.join(joinChar);
    },

    _functionToArray: function(resolvedArgs) {
        if (this._getTypeName(resolvedArgs[0]) === TYPE_ARRAY) {
            return resolvedArgs[0];
        } else {
            return [resolvedArgs[0]];
        }
    },

    _functionToString: function(resolvedArgs) {
        if (this._getTypeName(resolvedArgs[0]) === TYPE_STRING) {
            return resolvedArgs[0];
        } else {
            return JSON.stringify(resolvedArgs[0]);
        }
    },

    _functionToNumber: function(resolvedArgs) {
        var typeName = this._getTypeName(resolvedArgs[0]);
        var convertedValue;
        if (typeName === TYPE_NUMBER) {
            return resolvedArgs[0];
        } else if (typeName === TYPE_STRING) {
            convertedValue = +resolvedArgs[0];
            if (!isNaN(convertedValue)) {
                return convertedValue;
            }
        }
        return null;
    },

    _functionNotNull: function(resolvedArgs) {
        for (var i = 0; i < resolvedArgs.length; i++) {
            if (this._getTypeName(resolvedArgs[i]) !== TYPE_NULL) {
                return resolvedArgs[i];
            }
        }
        return null;
    },

    _functionSort: function(resolvedArgs) {
        var sortedArray = resolvedArgs[0].slice(0);
        sortedArray.sort();
        return sortedArray;
    },

    _functionSortBy: function(resolvedArgs) {
        var sortedArray = resolvedArgs[0].slice(0);
        if (sortedArray.length === 0) {
            return sortedArray;
        }
        var interpreter = this._interpreter;
        var exprefNode = resolvedArgs[1];
        var requiredType = this._getTypeName(
            interpreter.visit(exprefNode, sortedArray[0]));
        if ([TYPE_NUMBER, TYPE_STRING].indexOf(requiredType) < 0) {
            throw new Error("TypeError");
        }
        var that = this;
        // In order to get a stable sort out of an unstable
        // sort algorithm, we decorate/sort/undecorate (DSU)
        // by creating a new list of [index, element] pairs.
        // In the cmp function, if the evaluated elements are
        // equal, then the index will be used as the tiebreaker.
        // After the decorated list has been sorted, it will be
        // undecorated to extract the original elements.
        var decorated = [];
        for (var i = 0; i < sortedArray.length; i++) {
          decorated.push([i, sortedArray[i]]);
        }
        decorated.sort(function(a, b) {
          var exprA = interpreter.visit(exprefNode, a[1]);
          var exprB = interpreter.visit(exprefNode, b[1]);
          if (that._getTypeName(exprA) !== requiredType) {
              throw new Error(
                  "TypeError: expected " + requiredType + ", received " +
                  that._getTypeName(exprA));
          } else if (that._getTypeName(exprB) !== requiredType) {
              throw new Error(
                  "TypeError: expected " + requiredType + ", received " +
                  that._getTypeName(exprB));
          }
          if (exprA > exprB) {
            return 1;
          } else if (exprA < exprB) {
            return -1;
          } else {
            // If they're equal compare the items by their
            // order to maintain relative order of equal keys
            // (i.e. to get a stable sort).
            return a[0] - b[0];
          }
        });
        // Undecorate: extract out the original list elements.
        for (var j = 0; j < decorated.length; j++) {
          sortedArray[j] = decorated[j][1];
        }
        return sortedArray;
    },

    _functionMaxBy: function(resolvedArgs) {
      var exprefNode = resolvedArgs[1];
      var resolvedArray = resolvedArgs[0];
      var keyFunction = this.createKeyFunction(exprefNode, [TYPE_NUMBER, TYPE_STRING]);
      var maxNumber = -Infinity;
      var maxRecord;
      var current;
      for (var i = 0; i < resolvedArray.length; i++) {
        current = keyFunction(resolvedArray[i]);
        if (current > maxNumber) {
          maxNumber = current;
          maxRecord = resolvedArray[i];
        }
      }
      return maxRecord;
    },

    _functionMinBy: function(resolvedArgs) {
      var exprefNode = resolvedArgs[1];
      var resolvedArray = resolvedArgs[0];
      var keyFunction = this.createKeyFunction(exprefNode, [TYPE_NUMBER, TYPE_STRING]);
      var minNumber = Infinity;
      var minRecord;
      var current;
      for (var i = 0; i < resolvedArray.length; i++) {
        current = keyFunction(resolvedArray[i]);
        if (current < minNumber) {
          minNumber = current;
          minRecord = resolvedArray[i];
        }
      }
      return minRecord;
    },

    createKeyFunction: function(exprefNode, allowedTypes) {
      var that = this;
      var interpreter = this._interpreter;
      var keyFunc = function(x) {
        var current = interpreter.visit(exprefNode, x);
        if (allowedTypes.indexOf(that._getTypeName(current)) < 0) {
          var msg = "TypeError: expected one of " + allowedTypes +
                    ", received " + that._getTypeName(current);
          throw new Error(msg);
        }
        return current;
      };
      return keyFunc;
    }

  };

  function compile(stream) {
    var parser = new Parser();
    var ast = parser.parse(stream);
    return ast;
  }

  function tokenize(stream) {
      var lexer = new Lexer();
      return lexer.tokenize(stream);
  }

  function search(data, expression) {
      var parser = new Parser();
      // This needs to be improved.  Both the interpreter and runtime depend on
      // each other.  The runtime needs the interpreter to support exprefs.
      // There's likely a clean way to avoid the cyclic dependency.
      var runtime = new Runtime();
      var interpreter = new TreeInterpreter(runtime);
      runtime._interpreter = interpreter;
      var node = parser.parse(expression);
      return interpreter.search(node, data);
  }

  exports.tokenize = tokenize;
  exports.compile = compile;
  exports.search = search;
  exports.strictDeepEqual = strictDeepEqual;
})( exports);
});

var constants = {
  DATE_FORMAT: 'yyyy-mm-dd HH:MM:ss.l o',

  ERROR_LIKE_KEYS: ['err', 'error'],

  MESSAGE_KEY: 'msg',

  LEVEL_KEY: 'level',

  LEVEL_LABEL: 'levelLabel',

  TIMESTAMP_KEY: 'time',

  LEVELS: {
    default: 'USERLVL',
    60: 'FATAL',
    50: 'ERROR',
    40: 'WARN',
    30: 'INFO',
    20: 'DEBUG',
    10: 'TRACE'
  },

  LEVEL_NAMES: {
    fatal: 60,
    error: 50,
    warn: 40,
    info: 30,
    debug: 20,
    trace: 10
  },

  // Object keys that probably came from a logger like Pino or Bunyan.
  LOGGER_KEYS: [
    'pid',
    'hostname',
    'name',
    'level',
    'time',
    'timestamp',
    'caller'
  ]
};

const { LEVELS, LEVEL_NAMES } = constants;

const nocolor = input => input;
const plain = {
  default: nocolor,
  60: nocolor,
  50: nocolor,
  40: nocolor,
  30: nocolor,
  20: nocolor,
  10: nocolor,
  message: nocolor
};


const ctx = new source.Instance({ level: 3 });
const colored = {
  default: ctx.white,
  60: ctx.bgRed,
  50: ctx.red,
  40: ctx.yellow,
  30: ctx.green,
  20: ctx.blue,
  10: ctx.grey,
  message: ctx.cyan
};

function colorizeLevel (level, colorizer) {
  if (Number.isInteger(+level)) {
    return Object.prototype.hasOwnProperty.call(LEVELS, level)
      ? colorizer[level](LEVELS[level])
      : colorizer.default(LEVELS.default)
  }
  const levelNum = LEVEL_NAMES[level.toLowerCase()] || 'default';
  return colorizer[levelNum](LEVELS[levelNum])
}

function plainColorizer (level) {
  return colorizeLevel(level, plain)
}
plainColorizer.message = plain.message;

function coloredColorizer (level) {
  return colorizeLevel(level, colored)
}
coloredColorizer.message = colored.message;

/**
 * Factory function get a function to colorized levels. The returned function
 * also includes a `.message(str)` method to colorize strings.
 *
 * @param {bool} [useColors=false] When `true` a function that applies standard
 * terminal colors is returned.
 *
 * @returns {function} `function (level) {}` has a `.message(str)` method to
 * apply colorization to a string. The core function accepts either an integer
 * `level` or a `string` level. The integer level will map to a known level
 * string or to `USERLVL` if not known.  The string `level` will map to the same
 * colors as the integer `level` and will also default to `USERLVL` if the given
 * string is not a recognized level name.
 */
var colors = function getColorizer (useColors = false) {
  return useColors ? coloredColorizer : plainColorizer
};

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateformat = createCommonjsModule(function (module, exports) {
(function(global) {

  var dateFormat = (function() {
      var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|"[^"]*"|'[^']*'/g;
      var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
      var timezoneClip = /[^-+\dA-Z]/g;
  
      // Regexes and supporting functions are cached through closure
      return function (date, mask, utc, gmt) {
  
        // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
        if (arguments.length === 1 && kindOf(date) === 'string' && !/\d/.test(date)) {
          mask = date;
          date = undefined;
        }
  
        date = date || new Date;
  
        if(!(date instanceof Date)) {
          date = new Date(date);
        }
  
        if (isNaN(date)) {
          throw TypeError('Invalid date');
        }
  
        mask = String(dateFormat.masks[mask] || mask || dateFormat.masks['default']);
  
        // Allow setting the utc/gmt argument via the mask
        var maskSlice = mask.slice(0, 4);
        if (maskSlice === 'UTC:' || maskSlice === 'GMT:') {
          mask = mask.slice(4);
          utc = true;
          if (maskSlice === 'GMT:') {
            gmt = true;
          }
        }
  
        var _ = utc ? 'getUTC' : 'get';
        var d = date[_ + 'Date']();
        var D = date[_ + 'Day']();
        var m = date[_ + 'Month']();
        var y = date[_ + 'FullYear']();
        var H = date[_ + 'Hours']();
        var M = date[_ + 'Minutes']();
        var s = date[_ + 'Seconds']();
        var L = date[_ + 'Milliseconds']();
        var o = utc ? 0 : date.getTimezoneOffset();
        var W = getWeek(date);
        var N = getDayOfWeek(date);
        var flags = {
          d:    d,
          dd:   pad(d),
          ddd:  dateFormat.i18n.dayNames[D],
          dddd: dateFormat.i18n.dayNames[D + 7],
          m:    m + 1,
          mm:   pad(m + 1),
          mmm:  dateFormat.i18n.monthNames[m],
          mmmm: dateFormat.i18n.monthNames[m + 12],
          yy:   String(y).slice(2),
          yyyy: y,
          h:    H % 12 || 12,
          hh:   pad(H % 12 || 12),
          H:    H,
          HH:   pad(H),
          M:    M,
          MM:   pad(M),
          s:    s,
          ss:   pad(s),
          l:    pad(L, 3),
          L:    pad(Math.round(L / 10)),
          t:    H < 12 ? dateFormat.i18n.timeNames[0] : dateFormat.i18n.timeNames[1],
          tt:   H < 12 ? dateFormat.i18n.timeNames[2] : dateFormat.i18n.timeNames[3],
          T:    H < 12 ? dateFormat.i18n.timeNames[4] : dateFormat.i18n.timeNames[5],
          TT:   H < 12 ? dateFormat.i18n.timeNames[6] : dateFormat.i18n.timeNames[7],
          Z:    gmt ? 'GMT' : utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
          o:    (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
          S:    ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
          W:    W,
          N:    N
        };
  
        return mask.replace(token, function (match) {
          if (match in flags) {
            return flags[match];
          }
          return match.slice(1, match.length - 1);
        });
      };
    })();

  dateFormat.masks = {
    'default':               'ddd mmm dd yyyy HH:MM:ss',
    'shortDate':             'm/d/yy',
    'mediumDate':            'mmm d, yyyy',
    'longDate':              'mmmm d, yyyy',
    'fullDate':              'dddd, mmmm d, yyyy',
    'shortTime':             'h:MM TT',
    'mediumTime':            'h:MM:ss TT',
    'longTime':              'h:MM:ss TT Z',
    'isoDate':               'yyyy-mm-dd',
    'isoTime':               'HH:MM:ss',
    'isoDateTime':           'yyyy-mm-dd\'T\'HH:MM:sso',
    'isoUtcDateTime':        'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
    'expiresHeaderFormat':   'ddd, dd mmm yyyy HH:MM:ss Z'
  };

  // Internationalization strings
  dateFormat.i18n = {
    dayNames: [
      'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ],
    monthNames: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ],
    timeNames: [
      'a', 'p', 'am', 'pm', 'A', 'P', 'AM', 'PM'
    ]
  };

function pad(val, len) {
  val = String(val);
  len = len || 2;
  while (val.length < len) {
    val = '0' + val;
  }
  return val;
}

/**
 * Get the ISO 8601 week number
 * Based on comments from
 * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
 *
 * @param  {Object} `date`
 * @return {Number}
 */
function getWeek(date) {
  // Remove time components of date
  var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Change date to Thursday same week
  targetThursday.setDate(targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3);

  // Take January 4th as it is always in week 1 (see ISO 8601)
  var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);

  // Change date to Thursday same week
  firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);

  // Check if daylight-saving-time-switch occurred and correct for it
  var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
  targetThursday.setHours(targetThursday.getHours() - ds);

  // Number of weeks between target Thursday and first Thursday
  var weekDiff = (targetThursday - firstThursday) / (86400000*7);
  return 1 + Math.floor(weekDiff);
}

/**
 * Get ISO-8601 numeric representation of the day of the week
 * 1 (for Monday) through 7 (for Sunday)
 * 
 * @param  {Object} `date`
 * @return {Number}
 */
function getDayOfWeek(date) {
  var dow = date.getDay();
  if(dow === 0) {
    dow = 7;
  }
  return dow;
}

/**
 * kind-of shortcut
 * @param  {*} val
 * @return {String}
 */
function kindOf(val) {
  if (val === null) {
    return 'null';
  }

  if (val === undefined) {
    return 'undefined';
  }

  if (typeof val !== 'object') {
    return typeof val;
  }

  if (Array.isArray(val)) {
    return 'array';
  }

  return {}.toString.call(val)
    .slice(8, -1).toLowerCase();
}


  {
    module.exports = dateFormat;
  }
})();
});

const defaultColorizer = colors();
const {
  DATE_FORMAT,
  ERROR_LIKE_KEYS,
  MESSAGE_KEY,
  LEVEL_KEY,
  LEVEL_LABEL,
  TIMESTAMP_KEY,
  LOGGER_KEYS,
  LEVELS: LEVELS$1
} = constants;

var utils = {
  isObject,
  prettifyErrorLog,
  prettifyLevel,
  prettifyMessage,
  prettifyMetadata,
  prettifyObject,
  prettifyTime
};

var internals = {
  formatTime,
  joinLinesWithIndentation
};

/**
 * Converts a given `epoch` to a desired display format.
 *
 * @param {number|string} epoch The time to convert. May be any value that is
 * valid for `new Date()`.
 * @param {bool|string} [translateTime=false] When `false`, the given `epoch`
 * will simply be returned. When `true`, the given `epoch` will be converted
 * to a string at UTC using the `DATE_FORMAT` constant. If `translateTime` is
 * a string, the following rules are available:
 *
 * - `<format string>`: The string is a literal format string. This format
 * string will be used to interpret the `epoch` and return a display string
 * at UTC.
 * - `SYS:STANDARD`: The returned display string will follow the `DATE_FORMAT`
 * constant at the system's local timezone.
 * - `SYS:<format string>`: The returned display string will follow the given
 * `<format string>` at the system's local timezone.
 * - `UTC:<format string>`: The returned display string will follow the given
 * `<format string>` at UTC.
 *
 * @returns {number|string} The formatted time.
 */
function formatTime (epoch, translateTime = false) {
  if (translateTime === false) {
    return epoch
  }

  const instant = new Date(epoch);
  if (translateTime === true) {
    return dateformat(instant, 'UTC:' + DATE_FORMAT)
  }

  const upperFormat = translateTime.toUpperCase();
  if (upperFormat === 'SYS:STANDARD') {
    return dateformat(instant, DATE_FORMAT)
  }

  const prefix = upperFormat.substr(0, 4);
  if (prefix === 'SYS:' || prefix === 'UTC:') {
    if (prefix === 'UTC:') {
      return dateformat(instant, translateTime)
    }
    return dateformat(instant, translateTime.slice(4))
  }

  return dateformat(instant, `UTC:${translateTime}`)
}

function isObject (input) {
  return Object.prototype.toString.apply(input) === '[object Object]'
}

/**
 * Given a string with line separators, either `\r\n` or `\n`, add indentation
 * to all lines subsequent to the first line and rejoin the lines using an
 * end of line sequence.
 *
 * @param {object} input
 * @param {string} input.input The string to split and reformat.
 * @param {string} [input.ident] The indentation string. Default: `    ` (4 spaces).
 * @param {string} [input.eol] The end of line sequence to use when rejoining
 * the lines. Default: `'\n'`.
 *
 * @returns {string} A string with lines subsequent to the first indented
 * with the given indentation sequence.
 */
function joinLinesWithIndentation ({ input, ident = '    ', eol = '\n' }) {
  const lines = input.split(/\r?\n/);
  for (var i = 1; i < lines.length; i += 1) {
    lines[i] = ident + lines[i];
  }
  return lines.join(eol)
}

/**
 * Given a log object that has a `type: 'Error'` key, prettify the object and
 * return the result. In other
 *
 * @param {object} input
 * @param {object} input.log The error log to prettify.
 * @param {string} [input.messageKey] The name of the key that contains a
 * general log message. This is not the error's message property but the logger
 * messsage property. Default: `MESSAGE_KEY` constant.
 * @param {string} [input.ident] The sequence to use for indentation. Default: `'    '`.
 * @param {string} [input.eol] The sequence to use for EOL. Default: `'\n'`.
 * @param {string[]} [input.errorLikeKeys] A set of keys that should be considered
 * to have error objects as values. Default: `ERROR_LIKE_KEYS` constant.
 * @param {string[]} [input.errorProperties] A set of specific error object
 * properties, that are not the value of `messageKey`, `type`, or `stack`, to
 * include in the prettified result. The first entry in the list may be `'*'`
 * to indicate that all sibiling properties should be prettified. Default: `[]`.
 *
 * @returns {string} A sring that represents the prettified error log.
 */
function prettifyErrorLog ({
  log,
  messageKey = MESSAGE_KEY,
  ident = '    ',
  eol = '\n',
  errorLikeKeys = ERROR_LIKE_KEYS,
  errorProperties = []
}) {
  const stack = log.stack;
  const joinedLines = joinLinesWithIndentation({ input: stack, ident, eol });
  let result = `${ident}${joinedLines}${eol}`;

  if (errorProperties.length > 0) {
    const excludeProperties = LOGGER_KEYS.concat(messageKey, 'type', 'stack');
    let propertiesToPrint;
    if (errorProperties[0] === '*') {
      // Print all sibling properties except for the standard exclusions.
      propertiesToPrint = Object.keys(log).filter(k => excludeProperties.includes(k) === false);
    } else {
      // Print only sepcified properties unless the property is a standard exclusion.
      propertiesToPrint = errorProperties.filter(k => excludeProperties.includes(k) === false);
    }

    for (var i = 0; i < propertiesToPrint.length; i += 1) {
      const key = propertiesToPrint[i];
      if (key in log === false) continue
      if (isObject(log[key])) {
        // The nested object may have "logger" type keys but since they are not
        // at the root level of the object being processed, we want to print them.
        // Thus, we invoke with `excludeLoggerKeys: false`.
        const prettifiedObject = prettifyObject({ input: log[key], errorLikeKeys, excludeLoggerKeys: false, eol, ident });
        result = `${result}${key}: {${eol}${prettifiedObject}}${eol}`;
        continue
      }
      result = `${result}${key}: ${log[key]}${eol}`;
    }
  }

  return result
}

/**
 * Checks if the passed in log has a `level` value and returns a prettified
 * string for that level if so.
 *
 * @param {object} input
 * @param {object} input.log The log object.
 * @param {function} [input.colorizer] A colorizer function that accepts a level
 * value and returns a colorized string. Default: a no-op colorizer.
 * @param {string} [levelKey='level'] The key to find the level under.
 *
 * @returns {undefined|string} If `log` does not have a `level` property then
 * `undefined` will be returned. Otherwise, a string from the specified
 * `colorizer` is returned.
 */
function prettifyLevel ({ log, colorizer = defaultColorizer, levelKey = LEVEL_KEY }) {
  if (levelKey in log === false) return undefined
  return colorizer(log[levelKey]) + '\t'
}

/**
 * Prettifies a message string if the given `log` has a message property.
 *
 * @param {object} input
 * @param {object} input.log The log object with the message to colorize.
 * @param {string} [input.messageKey='msg'] The property of the `log` that is the
 * message to be prettified.
 * @param {string} [input.messageFormat=undefined] A format string that defines how the
 *  logged message should be formatted, e.g. `'{level} - {pid}'`.
 * @param {function} [input.colorizer] A colorizer function that has a
 * `.message(str)` method attached to it. This function should return a colorized
 * string which will be the "prettified" message. Default: a no-op colorizer.
 *
 * @returns {undefined|string} If the message key is not found, or the message
 * key is not a string, then `undefined` will be returned. Otherwise, a string
 * that is the prettified message.
 */
function prettifyMessage ({ log, messageFormat, messageKey = MESSAGE_KEY, colorizer = defaultColorizer, levelLabel = LEVEL_LABEL }) {
  if (messageFormat) {
    const message = String(messageFormat).replace(/{([^{}]+)}/g, function (match, p1) {
      // return log level as string instead of int
      if (p1 === levelLabel && log[LEVEL_KEY]) {
        return LEVELS$1[log[LEVEL_KEY]]
      }
      // Parse nested key access, e.g. `{keyA.subKeyB}`.
      return p1.split('.').reduce(function (prev, curr) {
        if (prev && prev[curr]) {
          return prev[curr]
        }
        return ''
      }, log)
    });
    return colorizer.message(message)
  }
  if (messageKey in log === false) return undefined
  if (typeof log[messageKey] !== 'string') return undefined
  return colorizer.message(log[messageKey])
}

/**
 * Prettifies metadata that is usually present in a Pino log line. It looks for
 * fields `name`, `pid`, `hostname`, and `caller` and returns a formatted string using
 * the fields it finds.
 *
 * @param {object} input
 * @param {object} input.log The log that may or may not contain metadata to
 * be prettified.
 *
 * @returns {undefined|string} If no metadata is found then `undefined` is
 * returned. Otherwise, a string of prettified metadata is returned.
 */
function prettifyMetadata ({ log }) {
  let line = '';

  if (log.name || log.pid || log.hostname) {
    line += '(';

    if (log.name) {
      line += log.name;
    }

    if (log.name && log.pid) {
      line += '/' + log.pid;
    } else if (log.pid) {
      line += log.pid;
    }

    if (log.hostname) {
      // If `pid` and `name` were in the ignore keys list then we don't need
      // the leading space.
      line += `${line === '(' ? 'on' : ' on'} ${log.hostname}`;
    }

    line += ')';
  }

  if (log.caller) {
    line += `${line === '' ? '' : ' '}<${log.caller}>`;
  }

  if (line === '') {
    return undefined
  } else {
    return line
  }
}

/**
 * Prettifies a standard object. Special care is taken when processing the object
 * to handle child objects that are attached to keys known to contain error
 * objects.
 *
 * @param {object} input
 * @param {object} input.input The object to prettify.
 * @param {string} [input.ident] The identation sequence to use. Default: `'    '`.
 * @param {string} [input.eol] The EOL sequence to use. Default: `'\n'`.
 * @param {string[]} [input.skipKeys] A set of object keys to exclude from the
 * prettified result. Default: `[]`.
 * @param {Object<string, function>} [input.customPrettifiers] Dictionary of
 * custom prettifiers. Default: `{}`.
 * @param {string[]} [input.errorLikeKeys] A set of object keys that contain
 * error objects. Default: `ERROR_LIKE_KEYS` constant.
 * @param {boolean} [input.excludeLoggerKeys] Indicates if known logger specific
 * keys should be excluded from prettification. Default: `true`.
 *
 * @returns {string} The prettified string. This can be as little as `''` if
 * there was nothing to prettify.
 */
function prettifyObject ({
  input,
  ident = '    ',
  eol = '\n',
  skipKeys = [],
  customPrettifiers = {},
  errorLikeKeys = ERROR_LIKE_KEYS,
  excludeLoggerKeys = true
}) {
  const objectKeys = Object.keys(input);
  const keysToIgnore = [].concat(skipKeys);

  if (excludeLoggerKeys === true) Array.prototype.push.apply(keysToIgnore, LOGGER_KEYS);

  let result = '';

  const keysToIterate = objectKeys.filter(k => keysToIgnore.includes(k) === false);
  for (var i = 0; i < objectKeys.length; i += 1) {
    const keyName = keysToIterate[i];
    const keyValue = input[keyName];

    if (keyValue === undefined) continue

    let lines;
    if (typeof customPrettifiers[keyName] === 'function') {
      lines = customPrettifiers[keyName](keyValue, keyName, input);
    } else {
      lines = fastSafeStringify(keyValue, null, 2);
    }

    if (lines === undefined) continue
    const joinedLines = joinLinesWithIndentation({ input: lines, ident, eol });

    if (errorLikeKeys.includes(keyName) === true) {
      const splitLines = `${ident}${keyName}: ${joinedLines}${eol}`.split(eol);
      for (var j = 0; j < splitLines.length; j += 1) {
        if (j !== 0) result += eol;

        const line = splitLines[j];
        if (/^\s*"stack"/.test(line)) {
          const matches = /^(\s*"stack":)\s*(".*"),?$/.exec(line);
          /* istanbul ignore else */
          if (matches && matches.length === 3) {
            const indentSize = /^\s*/.exec(line)[0].length + 4;
            const indentation = ' '.repeat(indentSize);
            const stackMessage = matches[2];
            result += matches[1] + eol + indentation + JSON.parse(stackMessage).replace(/\n/g, eol + indentation);
          }
        } else {
          result += line;
        }
      }
    } else {
      result += `${ident}${keyName}: ${joinedLines}${eol}`;
    }
  }

  return result
}

/**
 * Prettifies a timestamp if the given `log` has either `time`, `timestamp` or custom specified timestamp
 * property.
 *
 * @param {object} input
 * @param {object} input.log The log object with the timestamp to be prettified.
 * @param {string} [input.timestampKey='time'] The log property that should be used to resolve timestamp value
 * @param {bool|string} [input.translateFormat=undefined] When `true` the
 * timestamp will be prettified into a string at UTC using the default
 * `DATE_FORMAT`. If a string, then `translateFormat` will be used as the format
 * string to determine the output; see the `formatTime` function for details.
 *
 * @returns {undefined|string} If a timestamp property cannot be found then
 * `undefined` is returned. Otherwise, the prettified time is returned as a
 * string.
 */
function prettifyTime ({ log, timestampKey = TIMESTAMP_KEY, translateFormat = undefined }) {
  let time = null;

  if (timestampKey in log) {
    time = log[timestampKey];
  } else if ('timestamp' in log) {
    time = log.timestamp;
  }

  if (time === null) return undefined
  if (translateFormat) {
    return '[' + formatTime(time, translateFormat) + ']'
  }

  return `[${time}]`
}
utils.internals = internals;

var lib = createCommonjsModule(function (module, exports) {


const internals = {
    suspectRx: /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*\:/
};


exports.parse = function (text, ...args) {

    // Normalize arguments

    const firstOptions = typeof args[0] === 'object' && args[0];
    const reviver = args.length > 1 || !firstOptions ? args[0] : undefined;
    const options = (args.length > 1 && args[1]) || firstOptions || {};

    // Parse normally, allowing exceptions

    const obj = JSON.parse(text, reviver);

    // options.protoAction: 'error' (default) / 'remove' / 'ignore'

    if (options.protoAction === 'ignore') {
        return obj;
    }

    // Ignore null and non-objects

    if (!obj ||
        typeof obj !== 'object') {

        return obj;
    }

    // Check original string for potential exploit

    if (!text.match(internals.suspectRx)) {
        return obj;
    }

    // Scan result for proto keys

    exports.scan(obj, options);

    return obj;
};


exports.scan = function (obj, options = {}) {

    let next = [obj];

    while (next.length) {
        const nodes = next;
        next = [];

        for (const node of nodes) {
            if (Object.prototype.hasOwnProperty.call(node, '__proto__')) {      // Avoid calling node.hasOwnProperty directly
                if (options.protoAction !== 'remove') {
                    throw new SyntaxError('Object contains forbidden prototype property');
                }

                delete node.__proto__;
            }

            for (const key in node) {
                const value = node[key];
                if (value &&
                    typeof value === 'object') {

                    next.push(node[key]);
                }
            }
        }
    }
};


exports.safeParse = function (text, reviver) {

    try {
        return exports.parse(text, reviver);
    }
    catch (ignoreError) {
        return null;
    }
};
});

const { ERROR_LIKE_KEYS: ERROR_LIKE_KEYS$1, MESSAGE_KEY: MESSAGE_KEY$1, TIMESTAMP_KEY: TIMESTAMP_KEY$1 } = constants;
const {
  isObject: isObject$1,
  prettifyErrorLog: prettifyErrorLog$1,
  prettifyLevel: prettifyLevel$1,
  prettifyMessage: prettifyMessage$1,
  prettifyMetadata: prettifyMetadata$1,
  prettifyObject: prettifyObject$1,
  prettifyTime: prettifyTime$1
} = utils;


const jsonParser = input => {
  try {
    return { value: lib.parse(input, { protoAction: 'remove' }) }
  } catch (err) {
    return { err }
  }
};

const defaultOptions = {
  colorize: source.supportsColor,
  crlf: false,
  errorLikeObjectKeys: ERROR_LIKE_KEYS$1,
  errorProps: '',
  levelFirst: false,
  messageKey: MESSAGE_KEY$1,
  messageFormat: false,
  timestampKey: TIMESTAMP_KEY$1,
  translateTime: false,
  useMetadata: false,
  outputStream: process.stdout,
  customPrettifiers: {}
};

var pinoPretty = function prettyFactory (options) {
  const opts = Object.assign({}, defaultOptions, options);
  const EOL = opts.crlf ? '\r\n' : '\n';
  const IDENT = '    ';
  const messageKey = opts.messageKey;
  const levelKey = opts.levelKey;
  const levelLabel = opts.levelLabel;
  const messageFormat = opts.messageFormat;
  const timestampKey = opts.timestampKey;
  const errorLikeObjectKeys = opts.errorLikeObjectKeys;
  const errorProps = opts.errorProps.split(',');
  const customPrettifiers = opts.customPrettifiers;
  const ignoreKeys = opts.ignore ? new Set(opts.ignore.split(',')) : undefined;

  const colorizer = colors(opts.colorize);
  const search = opts.search;

  return pretty

  function pretty (inputData) {
    let log;
    if (!isObject$1(inputData)) {
      const parsed = jsonParser(inputData);
      if (parsed.err || !isObject$1(parsed.value)) {
        // pass through
        return inputData + EOL
      }
      log = parsed.value;
    } else {
      log = inputData;
    }

    if (search && !jmespath.search(log, search)) {
      return
    }

    const prettifiedMessage = prettifyMessage$1({ log, messageKey, colorizer, messageFormat, levelLabel });

    if (ignoreKeys) {
      log = Object.keys(log)
        .filter(key => !ignoreKeys.has(key))
        .reduce((res, key) => {
          res[key] = log[key];
          return res
        }, {});
    }

    const prettifiedLevel = prettifyLevel$1({ log, colorizer, levelKey });
    const prettifiedMetadata = prettifyMetadata$1({ log });
    const prettifiedTime = prettifyTime$1({ log, translateFormat: opts.translateTime, timestampKey });

    let line = '';
    if (opts.levelFirst && prettifiedLevel) {
      line = `${prettifiedLevel}`;
    }

    if (prettifiedTime && line === '') {
      line = `${prettifiedTime}`;
    } else if (prettifiedTime) {
      line = `${line} ${prettifiedTime}`;
    }

    if (!opts.levelFirst && prettifiedLevel) {
      if (line.length > 0) {
        line = `${line} ${prettifiedLevel}`;
      } else {
        line = prettifiedLevel;
      }
    }

    if (prettifiedMetadata) {
      if (line.length > 0) {
        line = `${line} ${prettifiedMetadata}:`;
      } else {
        line = prettifiedMetadata;
      }
    }

    if (line.endsWith(':') === false && line !== '') {
      line += ':';
    }

    if (prettifiedMessage) {
      if (line.length > 0) {
        line = `${line} ${prettifiedMessage}`;
      } else {
        line = prettifiedMessage;
      }
    }

    if (line.length > 0) {
      line += EOL;
    }

    if (log.type === 'Error' && log.stack) {
      const prettifiedErrorLog = prettifyErrorLog$1({
        log,
        errorLikeKeys: errorLikeObjectKeys,
        errorProperties: errorProps,
        ident: IDENT,
        eol: EOL
      });
      line += prettifiedErrorLog;
    } else {
      const skipKeys = [messageKey, levelKey, timestampKey].filter(key => typeof log[key] === 'string' || typeof log[key] === 'number');
      const prettifiedObject = prettifyObject$1({
        input: log,
        skipKeys,
        customPrettifiers,
        errorLikeKeys: errorLikeObjectKeys,
        eol: EOL,
        ident: IDENT
      });
      line += prettifiedObject;
    }

    return line
  }
};

/* eslint no-prototype-builtins: 0 */


const { mapHttpRequest: mapHttpRequest$1, mapHttpResponse: mapHttpResponse$1 } = pinoStdSerializers;


const {
  lsCacheSym: lsCacheSym$1,
  chindingsSym: chindingsSym$1,
  parsedChindingsSym: parsedChindingsSym$1,
  writeSym: writeSym$1,
  serializersSym: serializersSym$1,
  formatOptsSym: formatOptsSym$1,
  endSym: endSym$1,
  stringifiersSym: stringifiersSym$1,
  stringifySym: stringifySym$1,
  wildcardFirstSym: wildcardFirstSym$2,
  needsMetadataGsym: needsMetadataGsym$1,
  redactFmtSym: redactFmtSym$2,
  streamSym: streamSym$1,
  nestedKeySym: nestedKeySym$1,
  formattersSym: formattersSym$1,
  messageKeySym: messageKeySym$1
} = symbols;

function noop$1 () {}

function genLog (level, hook) {
  if (!hook) return LOG

  return function hookWrappedLog (...args) {
    hook.call(this, args, LOG, level);
  }

  function LOG (o, ...n) {
    if (typeof o === 'object') {
      var msg = o;
      if (o !== null) {
        if (o.method && o.headers && o.socket) {
          o = mapHttpRequest$1(o);
        } else if (typeof o.setHeader === 'function') {
          o = mapHttpResponse$1(o);
        }
      }
      if (this[nestedKeySym$1]) o = { [this[nestedKeySym$1]]: o };
      var formatParams;
      if (msg === null && n.length === 0) {
        formatParams = [null];
      } else {
        msg = n.shift();
        formatParams = n;
      }
      this[writeSym$1](o, quickFormatUnescaped(msg, formatParams, this[formatOptsSym$1]), level);
    } else {
      this[writeSym$1](null, quickFormatUnescaped(o, n, this[formatOptsSym$1]), level);
    }
  }
}

// magically escape strings for json
// relying on their charCodeAt
// everything below 32 needs JSON.stringify()
// 34 and 92 happens all the time, so we
// have a fast case for them
function asString (str) {
  var result = '';
  var last = 0;
  var found = false;
  var point = 255;
  const l = str.length;
  if (l > 100) {
    return JSON.stringify(str)
  }
  for (var i = 0; i < l && point >= 32; i++) {
    point = str.charCodeAt(i);
    if (point === 34 || point === 92) {
      result += str.slice(last, i) + '\\';
      last = i;
      found = true;
    }
  }
  if (!found) {
    result = str;
  } else {
    result += str.slice(last);
  }
  return point < 32 ? JSON.stringify(str) : '"' + result + '"'
}

function asJson (obj, msg, num, time) {
  const stringify = this[stringifySym$1];
  const stringifiers = this[stringifiersSym$1];
  const end = this[endSym$1];
  const chindings = this[chindingsSym$1];
  const serializers = this[serializersSym$1];
  const formatters = this[formattersSym$1];
  const messageKey = this[messageKeySym$1];
  var data = this[lsCacheSym$1][num] + time;

  // we need the child bindings added to the output first so instance logged
  // objects can take precedence when JSON.parse-ing the resulting log line
  data = data + chindings;

  var value;
  var notHasOwnProperty = obj.hasOwnProperty === undefined;
  if (formatters.log) {
    obj = formatters.log(obj);
  }
  if (msg !== undefined) {
    obj[messageKey] = msg;
  }
  const wildcardStringifier = stringifiers[wildcardFirstSym$2];
  for (var key in obj) {
    value = obj[key];
    if ((notHasOwnProperty || obj.hasOwnProperty(key)) && value !== undefined) {
      value = serializers[key] ? serializers[key](value) : value;

      const stringifier = stringifiers[key] || wildcardStringifier;

      switch (typeof value) {
        case 'undefined':
        case 'function':
          continue
        case 'number':
          /* eslint no-fallthrough: "off" */
          if (Number.isFinite(value) === false) {
            value = null;
          }
        // this case explicitly falls through to the next one
        case 'boolean':
          if (stringifier) value = stringifier(value);
          break
        case 'string':
          value = (stringifier || asString)(value);
          break
        default:
          value = (stringifier || stringify)(value);
      }
      if (value === undefined) continue
      data += ',"' + key + '":' + value;
    }
  }

  return data + end
}

function asChindings (instance, bindings) {
  var key;
  var value;
  var data = instance[chindingsSym$1];
  const stringify = instance[stringifySym$1];
  const stringifiers = instance[stringifiersSym$1];
  const wildcardStringifier = stringifiers[wildcardFirstSym$2];
  const serializers = instance[serializersSym$1];
  const formatter = instance[formattersSym$1].bindings;
  bindings = formatter(bindings);

  for (key in bindings) {
    value = bindings[key];
    const valid = key !== 'level' &&
      key !== 'serializers' &&
      key !== 'formatters' &&
      key !== 'customLevels' &&
      bindings.hasOwnProperty(key) &&
      value !== undefined;
    if (valid === true) {
      value = serializers[key] ? serializers[key](value) : value;
      value = (stringifiers[key] || wildcardStringifier || stringify)(value);
      if (value === undefined) continue
      data += ',"' + key + '":' + value;
    }
  }
  return data
}

function getPrettyStream (opts, prettifier, dest, instance) {
  if (prettifier && typeof prettifier === 'function') {
    prettifier = prettifier.bind(instance);
    return prettifierMetaWrapper(prettifier(opts), dest, opts)
  }
  try {
    var prettyFactory = pinoPretty;
    prettyFactory.asMetaWrapper = prettifierMetaWrapper;
    return prettifierMetaWrapper(prettyFactory(opts), dest, opts)
  } catch (e) {
    throw Error('Missing `pino-pretty` module: `pino-pretty` must be installed separately')
  }
}

function prettifierMetaWrapper (pretty, dest, opts) {
  opts = Object.assign({ suppressFlushSyncWarning: false }, opts);
  var warned = false;
  return {
    [needsMetadataGsym$1]: true,
    lastLevel: 0,
    lastMsg: null,
    lastObj: null,
    lastLogger: null,
    flushSync () {
      if (opts.suppressFlushSyncWarning || warned) {
        return
      }
      warned = true;
      setMetadataProps(dest, this);
      dest.write(pretty(Object.assign({
        level: 40, // warn
        msg: 'pino.final with prettyPrint does not support flushing',
        time: Date.now()
      }, this.chindings())));
    },
    chindings () {
      const lastLogger = this.lastLogger;
      var chindings = null;

      // protection against flushSync being called before logging
      // anything
      if (!lastLogger) {
        return null
      }

      if (lastLogger.hasOwnProperty(parsedChindingsSym$1)) {
        chindings = lastLogger[parsedChindingsSym$1];
      } else {
        chindings = JSON.parse('{' + lastLogger[chindingsSym$1].substr(1) + '}');
        lastLogger[parsedChindingsSym$1] = chindings;
      }

      return chindings
    },
    write (chunk) {
      const lastLogger = this.lastLogger;
      const chindings = this.chindings();

      var time = this.lastTime;

      if (time.match(/^\d+/)) {
        time = parseInt(time);
      } else {
        time = time.slice(1, -1);
      }

      var lastObj = this.lastObj;
      var lastMsg = this.lastMsg;
      var errorProps = null;

      const formatters = lastLogger[formattersSym$1];
      const formattedObj = formatters.log ? formatters.log(lastObj) : lastObj;

      const messageKey = lastLogger[messageKeySym$1];
      if (lastMsg && formattedObj && !formattedObj.hasOwnProperty(messageKey)) {
        formattedObj[messageKey] = lastMsg;
      }

      const obj = Object.assign({
        level: this.lastLevel,
        time
      }, formattedObj, errorProps);

      const serializers = lastLogger[serializersSym$1];
      const keys = Object.keys(serializers);
      var key;

      for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        if (obj[key] !== undefined) {
          obj[key] = serializers[key](obj[key]);
        }
      }

      for (key in chindings) {
        if (!obj.hasOwnProperty(key)) {
          obj[key] = chindings[key];
        }
      }

      const stringifiers = lastLogger[stringifiersSym$1];
      const redact = stringifiers[redactFmtSym$2];

      const formatted = pretty(typeof redact === 'function' ? redact(obj) : obj);
      if (formatted === undefined) return

      setMetadataProps(dest, this);
      dest.write(formatted);
    }
  }
}

function hasBeenTampered (stream) {
  return stream.write !== stream.constructor.prototype.write
}

function buildSafeSonicBoom (opts) {
  const stream = new sonicBoom(opts);
  stream.on('error', filterBrokenPipe);
  return stream

  function filterBrokenPipe (err) {
    // TODO verify on Windows
    if (err.code === 'EPIPE') {
      // If we get EPIPE, we should stop logging here
      // however we have no control to the consumer of
      // SonicBoom, so we just overwrite the write method
      stream.write = noop$1;
      stream.end = noop$1;
      stream.flushSync = noop$1;
      stream.destroy = noop$1;
      return
    }
    stream.removeListener('error', filterBrokenPipe);
    stream.emit('error', err);
  }
}

function createArgsNormalizer (defaultOptions) {
  return function normalizeArgs (instance, opts = {}, stream) {
    // support stream as a string
    if (typeof opts === 'string') {
      stream = buildSafeSonicBoom({ dest: opts, sync: true });
      opts = {};
    } else if (typeof stream === 'string') {
      stream = buildSafeSonicBoom({ dest: stream, sync: true });
    } else if (opts instanceof sonicBoom || opts.writable || opts._writableState) {
      stream = opts;
      opts = null;
    }
    opts = Object.assign({}, defaultOptions, opts);
    if ('extreme' in opts) {
      throw Error('The extreme option has been removed, use pino.destination({ sync: false }) instead')
    }
    if ('onTerminated' in opts) {
      throw Error('The onTerminated option has been removed, use pino.final instead')
    }
    if ('changeLevelName' in opts) {
      process.emitWarning(
        'The changeLevelName option is deprecated and will be removed in v7. Use levelKey instead.',
        { code: 'changeLevelName_deprecation' }
      );
      opts.levelKey = opts.changeLevelName;
      delete opts.changeLevelName;
    }
    const { enabled, prettyPrint, prettifier, messageKey } = opts;
    if (enabled === false) opts.level = 'silent';
    stream = stream || process.stdout;
    if (stream === process.stdout && stream.fd >= 0 && !hasBeenTampered(stream)) {
      stream = buildSafeSonicBoom({ fd: stream.fd, sync: true });
    }
    if (prettyPrint) {
      const prettyOpts = Object.assign({ messageKey }, prettyPrint);
      stream = getPrettyStream(prettyOpts, prettifier, stream, instance);
    }
    return { opts, stream }
  }
}

function final (logger, handler) {
  if (typeof logger === 'undefined' || typeof logger.child !== 'function') {
    throw Error('expected a pino logger instance')
  }
  const hasHandler = (typeof handler !== 'undefined');
  if (hasHandler && typeof handler !== 'function') {
    throw Error('if supplied, the handler parameter should be a function')
  }
  const stream = logger[streamSym$1];
  if (typeof stream.flushSync !== 'function') {
    throw Error('final requires a stream that has a flushSync method, such as pino.destination')
  }

  const finalLogger = new Proxy(logger, {
    get: (logger, key) => {
      if (key in logger.levels.values) {
        return (...args) => {
          logger[key](...args);
          stream.flushSync();
        }
      }
      return logger[key]
    }
  });

  if (!hasHandler) {
    return finalLogger
  }

  return (err = null, ...args) => {
    try {
      stream.flushSync();
    } catch (e) {
      // it's too late to wait for the stream to be ready
      // because this is a final tick scenario.
      // in practice there shouldn't be a situation where it isn't
      // however, swallow the error just in case (and for easier testing)
    }
    return handler(err, finalLogger, ...args)
  }
}

function stringify$1 (obj) {
  try {
    return JSON.stringify(obj)
  } catch (_) {
    return fastSafeStringify(obj)
  }
}

function buildFormatters (level, bindings, log) {
  return {
    level,
    bindings,
    log
  }
}

function setMetadataProps (dest, that) {
  if (dest[needsMetadataGsym$1] === true) {
    dest.lastLevel = that.lastLevel;
    dest.lastMsg = that.lastMsg;
    dest.lastObj = that.lastObj;
    dest.lastTime = that.lastTime;
    dest.lastLogger = that.lastLogger;
  }
}

var tools = {
  noop: noop$1,
  buildSafeSonicBoom,
  getPrettyStream,
  asChindings,
  asJson,
  genLog,
  createArgsNormalizer,
  final,
  stringify: stringify$1,
  buildFormatters
};

/* eslint no-prototype-builtins: 0 */

const {
  lsCacheSym: lsCacheSym$2,
  levelValSym: levelValSym$1,
  useOnlyCustomLevelsSym: useOnlyCustomLevelsSym$1,
  streamSym: streamSym$2,
  formattersSym: formattersSym$2,
  hooksSym: hooksSym$1
} = symbols;
const { noop: noop$2, genLog: genLog$1 } = tools;

const levels = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60
};
const levelMethods = {
  fatal: (hook) => {
    const logFatal = genLog$1(levels.fatal, hook);
    return function (...args) {
      const stream = this[streamSym$2];
      logFatal.call(this, ...args);
      if (typeof stream.flushSync === 'function') {
        try {
          stream.flushSync();
        } catch (e) {
          // https://github.com/pinojs/pino/pull/740#discussion_r346788313
        }
      }
    }
  },
  error: (hook) => genLog$1(levels.error, hook),
  warn: (hook) => genLog$1(levels.warn, hook),
  info: (hook) => genLog$1(levels.info, hook),
  debug: (hook) => genLog$1(levels.debug, hook),
  trace: (hook) => genLog$1(levels.trace, hook)
};

const nums = Object.keys(levels).reduce((o, k) => {
  o[levels[k]] = k;
  return o
}, {});

const initialLsCache = Object.keys(nums).reduce((o, k) => {
  o[k] = flatstr_1('{"level":' + Number(k));
  return o
}, {});

function genLsCache (instance) {
  const formatter = instance[formattersSym$2].level;
  const { labels } = instance.levels;
  const cache = {};
  for (const label in labels) {
    const level = formatter(labels[label], Number(label));
    cache[label] = JSON.stringify(level).slice(0, -1);
  }
  instance[lsCacheSym$2] = cache;
  return instance
}

function isStandardLevel (level, useOnlyCustomLevels) {
  if (useOnlyCustomLevels) {
    return false
  }

  switch (level) {
    case 'fatal':
    case 'error':
    case 'warn':
    case 'info':
    case 'debug':
    case 'trace':
      return true
    default:
      return false
  }
}

function setLevel (level) {
  const { labels, values } = this.levels;
  if (typeof level === 'number') {
    if (labels[level] === undefined) throw Error('unknown level value' + level)
    level = labels[level];
  }
  if (values[level] === undefined) throw Error('unknown level ' + level)
  const preLevelVal = this[levelValSym$1];
  const levelVal = this[levelValSym$1] = values[level];
  const useOnlyCustomLevelsVal = this[useOnlyCustomLevelsSym$1];
  const hook = this[hooksSym$1].logMethod;

  for (var key in values) {
    if (levelVal > values[key]) {
      this[key] = noop$2;
      continue
    }
    this[key] = isStandardLevel(key, useOnlyCustomLevelsVal) ? levelMethods[key](hook) : genLog$1(values[key], hook);
  }

  this.emit(
    'level-change',
    level,
    levelVal,
    labels[preLevelVal],
    preLevelVal
  );
}

function getLevel (level) {
  const { levels, levelVal } = this;
  // protection against potential loss of Pino scope from serializers (edge case with circular refs - https://github.com/pinojs/pino/issues/833)
  return (levels && levels.labels) ? levels.labels[levelVal] : ''
}

function isLevelEnabled (logLevel) {
  const { values } = this.levels;
  const logLevelVal = values[logLevel];
  return logLevelVal !== undefined && (logLevelVal >= this[levelValSym$1])
}

function mappings (customLevels = null, useOnlyCustomLevels = false) {
  const customNums = customLevels ? Object.keys(customLevels).reduce((o, k) => {
    o[customLevels[k]] = k;
    return o
  }, {}) : null;

  const labels = Object.assign(
    Object.create(Object.prototype, { Infinity: { value: 'silent' } }),
    useOnlyCustomLevels ? null : nums,
    customNums
  );
  const values = Object.assign(
    Object.create(Object.prototype, { silent: { value: Infinity } }),
    useOnlyCustomLevels ? null : levels,
    customLevels
  );
  return { labels, values }
}

function assertDefaultLevelFound (defaultLevel, customLevels, useOnlyCustomLevels) {
  if (typeof defaultLevel === 'number') {
    const values = [].concat(
      Object.keys(customLevels || {}).map(key => customLevels[key]),
      useOnlyCustomLevels ? [] : Object.keys(nums).map(level => +level),
      Infinity
    );
    if (!values.includes(defaultLevel)) {
      throw Error(`default level:${defaultLevel} must be included in custom levels`)
    }
    return
  }

  const labels = Object.assign(
    Object.create(Object.prototype, { silent: { value: Infinity } }),
    useOnlyCustomLevels ? null : levels,
    customLevels
  );
  if (!(defaultLevel in labels)) {
    throw Error(`default level:${defaultLevel} must be included in custom levels`)
  }
}

function assertNoLevelCollisions (levels, customLevels) {
  const { labels, values } = levels;
  for (const k in customLevels) {
    if (k in values) {
      throw Error('levels cannot be overridden')
    }
    if (customLevels[k] in labels) {
      throw Error('pre-existing level values cannot be used for new levels')
    }
  }
}

var levels_1 = {
  initialLsCache,
  genLsCache,
  levelMethods,
  getLevel,
  setLevel,
  isLevelEnabled,
  mappings,
  assertNoLevelCollisions,
  assertDefaultLevelFound
};

var name = "pino";
var version = "6.9.0";
var description = "super fast, all natural json logger";
var main = "pino.js";
var browser = "./browser.js";
var files = [
	"pino.js",
	"bin.js",
	"browser.js",
	"pretty.js",
	"usage.txt",
	"test",
	"docs",
	"example.js",
	"lib"
];
var scripts = {
	docs: "docsify serve",
	"browser-test": "airtap --local 8080 test/browser*test.js",
	test: "standard | snazzy && tap --100 test/*test.js test/*/*test.js",
	"cov-ui": "tap --coverage-report=html test/*test.js test/*/*test.js",
	bench: "node benchmarks/utils/runbench all",
	"bench-basic": "node benchmarks/utils/runbench basic",
	"bench-object": "node benchmarks/utils/runbench object",
	"bench-deep-object": "node benchmarks/utils/runbench deep-object",
	"bench-multi-arg": "node benchmarks/utils/runbench multi-arg",
	"bench-longs-tring": "node benchmarks/utils/runbench long-string",
	"bench-child": "node benchmarks/utils/runbench child",
	"bench-child-child": "node benchmarks/utils/runbench child-child",
	"bench-child-creation": "node benchmarks/utils/runbench child-creation",
	"bench-formatters": "node benchmarks/utils/runbench formatters",
	"update-bench-doc": "node benchmarks/utils/generate-benchmark-doc > docs/benchmarks.md"
};
var bin = {
	pino: "./bin.js"
};
var precommit = "test";
var repository = {
	type: "git",
	url: "git+https://github.com/pinojs/pino.git"
};
var keywords = [
	"fast",
	"logger",
	"stream",
	"json"
];
var author = "Matteo Collina <hello@matteocollina.com>";
var contributors = [
	"David Mark Clements <huperekchuno@googlemail.com>",
	"James Sumners <james.sumners@gmail.com>",
	"Thomas Watson Steen <w@tson.dk> (https://twitter.com/wa7son)"
];
var license = "MIT";
var bugs = {
	url: "https://github.com/pinojs/pino/issues"
};
var homepage = "http://getpino.io";
var devDependencies = {
	airtap: "3.0.0",
	benchmark: "^2.1.4",
	bole: "^4.0.0",
	bunyan: "^1.8.14",
	"docsify-cli": "^4.4.1",
	execa: "^4.0.0",
	fastbench: "^1.0.1",
	"flush-write-stream": "^2.0.0",
	"import-fresh": "^3.2.1",
	log: "^6.0.0",
	loglevel: "^1.6.7",
	"pino-pretty": "^4.1.0",
	"pre-commit": "^1.2.2",
	proxyquire: "^2.1.3",
	pump: "^3.0.0",
	semver: "^7.0.0",
	snazzy: "^8.0.0",
	split2: "^3.1.1",
	standard: "^14.3.3",
	steed: "^1.1.3",
	"strip-ansi": "^6.0.0",
	tap: "^14.10.8",
	tape: "^5.0.0",
	through2: "^4.0.0",
	winston: "^3.3.3"
};
var dependencies = {
	"fast-redact": "^3.0.0",
	"fast-safe-stringify": "^2.0.7",
	flatstr: "^1.0.12",
	"pino-std-serializers": "^2.4.2",
	"quick-format-unescaped": "^4.0.1",
	"sonic-boom": "^1.0.2"
};
var require$$0 = {
	name: name,
	version: version,
	description: description,
	main: main,
	browser: browser,
	files: files,
	scripts: scripts,
	bin: bin,
	precommit: precommit,
	repository: repository,
	keywords: keywords,
	author: author,
	contributors: contributors,
	license: license,
	bugs: bugs,
	homepage: homepage,
	devDependencies: devDependencies,
	dependencies: dependencies
};

const { version: version$1 } = require$$0;

var meta = { version: version$1 };

/* eslint no-prototype-builtins: 0 */

const { EventEmitter } = EventEmitter__default['default'];


const {
  lsCacheSym: lsCacheSym$3,
  levelValSym: levelValSym$2,
  setLevelSym: setLevelSym$1,
  getLevelSym: getLevelSym$1,
  chindingsSym: chindingsSym$2,
  parsedChindingsSym: parsedChindingsSym$2,
  mixinSym: mixinSym$1,
  asJsonSym: asJsonSym$1,
  writeSym: writeSym$2,
  timeSym: timeSym$1,
  timeSliceIndexSym: timeSliceIndexSym$1,
  streamSym: streamSym$3,
  serializersSym: serializersSym$2,
  formattersSym: formattersSym$3,
  useOnlyCustomLevelsSym: useOnlyCustomLevelsSym$2,
  needsMetadataGsym: needsMetadataGsym$2
} = symbols;
const {
  getLevel: getLevel$1,
  setLevel: setLevel$1,
  isLevelEnabled: isLevelEnabled$1,
  mappings: mappings$1,
  initialLsCache: initialLsCache$1,
  genLsCache: genLsCache$1,
  assertNoLevelCollisions: assertNoLevelCollisions$1
} = levels_1;
const {
  asChindings: asChindings$1,
  asJson: asJson$1,
  buildFormatters: buildFormatters$1
} = tools;
const {
  version: version$2
} = meta;

// note: use of class is satirical
// https://github.com/pinojs/pino/pull/433#pullrequestreview-127703127
const constructor = class Pino {};
const prototype = {
  constructor,
  child,
  bindings,
  setBindings,
  flush,
  isLevelEnabled: isLevelEnabled$1,
  version: version$2,
  get level () { return this[getLevelSym$1]() },
  set level (lvl) { this[setLevelSym$1](lvl); },
  get levelVal () { return this[levelValSym$2] },
  set levelVal (n) { throw Error('levelVal is read-only') },
  [lsCacheSym$3]: initialLsCache$1,
  [writeSym$2]: write,
  [asJsonSym$1]: asJson$1,
  [getLevelSym$1]: getLevel$1,
  [setLevelSym$1]: setLevel$1
};

Object.setPrototypeOf(prototype, EventEmitter.prototype);

// exporting and consuming the prototype object using factory pattern fixes scoping issues with getters when serializing
var proto$1 = function () {
  return Object.create(prototype)
};

const resetChildingsFormatter = bindings => bindings;
function child (bindings) {
  if (!bindings) {
    throw Error('missing bindings for child Pino')
  }
  const serializers = this[serializersSym$2];
  const formatters = this[formattersSym$3];
  const instance = Object.create(this);
  if (bindings.hasOwnProperty('serializers') === true) {
    instance[serializersSym$2] = Object.create(null);

    for (var k in serializers) {
      instance[serializersSym$2][k] = serializers[k];
    }
    const parentSymbols = Object.getOwnPropertySymbols(serializers);
    for (var i = 0; i < parentSymbols.length; i++) {
      const ks = parentSymbols[i];
      instance[serializersSym$2][ks] = serializers[ks];
    }

    for (var bk in bindings.serializers) {
      instance[serializersSym$2][bk] = bindings.serializers[bk];
    }
    const bindingsSymbols = Object.getOwnPropertySymbols(bindings.serializers);
    for (var bi = 0; bi < bindingsSymbols.length; bi++) {
      const bks = bindingsSymbols[bi];
      instance[serializersSym$2][bks] = bindings.serializers[bks];
    }
  } else instance[serializersSym$2] = serializers;
  if (bindings.hasOwnProperty('formatters')) {
    const { level, bindings: chindings, log } = bindings.formatters;
    instance[formattersSym$3] = buildFormatters$1(
      level || formatters.level,
      chindings || resetChildingsFormatter,
      log || formatters.log
    );
  } else {
    instance[formattersSym$3] = buildFormatters$1(
      formatters.level,
      resetChildingsFormatter,
      formatters.log
    );
  }
  if (bindings.hasOwnProperty('customLevels') === true) {
    assertNoLevelCollisions$1(this.levels, bindings.customLevels);
    instance.levels = mappings$1(bindings.customLevels, instance[useOnlyCustomLevelsSym$2]);
    genLsCache$1(instance);
  }
  instance[chindingsSym$2] = asChindings$1(instance, bindings);
  const childLevel = bindings.level || this.level;
  instance[setLevelSym$1](childLevel);

  return instance
}

function bindings () {
  const chindings = this[chindingsSym$2];
  var chindingsJson = `{${chindings.substr(1)}}`; // at least contains ,"pid":7068,"hostname":"myMac"
  var bindingsFromJson = JSON.parse(chindingsJson);
  delete bindingsFromJson.pid;
  delete bindingsFromJson.hostname;
  return bindingsFromJson
}

function setBindings (newBindings) {
  const chindings = asChindings$1(this, newBindings);
  this[chindingsSym$2] = chindings;
  delete this[parsedChindingsSym$2];
}

function write (_obj, msg, num) {
  const t = this[timeSym$1]();
  const mixin = this[mixinSym$1];
  const objError = _obj instanceof Error;
  var obj;

  if (_obj === undefined || _obj === null) {
    obj = mixin ? mixin({}) : {};
  } else {
    obj = Object.assign(mixin ? mixin(_obj) : {}, _obj);
    if (!msg && objError) {
      msg = _obj.message;
    }

    if (objError) {
      obj.stack = _obj.stack;
      if (!obj.type) {
        obj.type = 'Error';
      }
    }
  }

  const s = this[asJsonSym$1](obj, msg, num, t);

  const stream = this[streamSym$3];
  if (stream[needsMetadataGsym$2] === true) {
    stream.lastLevel = num;
    stream.lastObj = obj;
    stream.lastMsg = msg;
    stream.lastTime = t.slice(this[timeSliceIndexSym$1]);
    stream.lastLogger = this; // for child loggers
  }
  if (stream instanceof sonicBoom) stream.write(s);
  else stream.write(flatstr_1(s));
}

function flush () {
  const stream = this[streamSym$3];
  if ('flush' in stream) stream.flush();
}

/* eslint no-prototype-builtins: 0 */






const { assertDefaultLevelFound: assertDefaultLevelFound$1, mappings: mappings$2, genLsCache: genLsCache$2 } = levels_1;
const {
  createArgsNormalizer: createArgsNormalizer$1,
  asChindings: asChindings$2,
  final: final$1,
  stringify: stringify$2,
  buildSafeSonicBoom: buildSafeSonicBoom$1,
  buildFormatters: buildFormatters$2,
  noop: noop$3
} = tools;
const { version: version$3 } = meta;
const {
  chindingsSym: chindingsSym$3,
  redactFmtSym: redactFmtSym$3,
  serializersSym: serializersSym$3,
  timeSym: timeSym$2,
  timeSliceIndexSym: timeSliceIndexSym$2,
  streamSym: streamSym$4,
  stringifySym: stringifySym$2,
  stringifiersSym: stringifiersSym$2,
  setLevelSym: setLevelSym$2,
  endSym: endSym$2,
  formatOptsSym: formatOptsSym$2,
  messageKeySym: messageKeySym$2,
  nestedKeySym: nestedKeySym$2,
  mixinSym: mixinSym$2,
  useOnlyCustomLevelsSym: useOnlyCustomLevelsSym$3,
  formattersSym: formattersSym$4,
  hooksSym: hooksSym$2
} = symbols;
const { epochTime: epochTime$1, nullTime: nullTime$1 } = time;
const { pid } = process;
const hostname = os__default['default'].hostname();
const defaultErrorSerializer = pinoStdSerializers.err;
const defaultOptions$1 = {
  level: 'info',
  messageKey: 'msg',
  nestedKey: null,
  enabled: true,
  prettyPrint: false,
  base: { pid, hostname },
  serializers: Object.assign(Object.create(null), {
    err: defaultErrorSerializer
  }),
  formatters: Object.assign(Object.create(null), {
    bindings (bindings) {
      return bindings
    },
    level (label, number) {
      return { level: number }
    }
  }),
  hooks: {
    logMethod: undefined
  },
  timestamp: epochTime$1,
  name: undefined,
  redact: null,
  customLevels: null,
  levelKey: undefined,
  useOnlyCustomLevels: false
};

const normalize = createArgsNormalizer$1(defaultOptions$1);

const serializers = Object.assign(Object.create(null), pinoStdSerializers);

function pino (...args) {
  const instance = {};
  const { opts, stream } = normalize(instance, ...args);
  const {
    redact,
    crlf,
    serializers,
    timestamp,
    messageKey,
    nestedKey,
    base,
    name,
    level,
    customLevels,
    useLevelLabels,
    changeLevelName,
    levelKey,
    mixin,
    useOnlyCustomLevels,
    formatters,
    hooks
  } = opts;

  const allFormatters = buildFormatters$2(
    formatters.level,
    formatters.bindings,
    formatters.log
  );

  if (useLevelLabels && !(changeLevelName || levelKey)) {
    process.emitWarning('useLevelLabels is deprecated, use the formatters.level option instead', 'Warning', 'PINODEP001');
    allFormatters.level = labelsFormatter;
  } else if ((changeLevelName || levelKey) && !useLevelLabels) {
    process.emitWarning('changeLevelName and levelKey are deprecated, use the formatters.level option instead', 'Warning', 'PINODEP002');
    allFormatters.level = levelNameFormatter(changeLevelName || levelKey);
  } else if ((changeLevelName || levelKey) && useLevelLabels) {
    process.emitWarning('useLevelLabels is deprecated, use the formatters.level option instead', 'Warning', 'PINODEP001');
    process.emitWarning('changeLevelName and levelKey are deprecated, use the formatters.level option instead', 'Warning', 'PINODEP002');
    allFormatters.level = levelNameLabelFormatter(changeLevelName || levelKey);
  }

  if (serializers[Symbol.for('pino.*')]) {
    process.emitWarning('The pino.* serializer is deprecated, use the formatters.log options instead', 'Warning', 'PINODEP003');
    allFormatters.log = serializers[Symbol.for('pino.*')];
  }

  if (!allFormatters.bindings) {
    allFormatters.bindings = defaultOptions$1.formatters.bindings;
  }
  if (!allFormatters.level) {
    allFormatters.level = defaultOptions$1.formatters.level;
  }

  const stringifiers = redact ? redaction_1(redact, stringify$2) : {};
  const formatOpts = redact
    ? { stringify: stringifiers[redactFmtSym$3] }
    : { stringify: stringify$2 };
  const end = '}' + (crlf ? '\r\n' : '\n');
  const coreChindings = asChindings$2.bind(null, {
    [chindingsSym$3]: '',
    [serializersSym$3]: serializers,
    [stringifiersSym$2]: stringifiers,
    [stringifySym$2]: stringify$2,
    [formattersSym$4]: allFormatters
  });
  const chindings = base === null ? '' : (name === undefined)
    ? coreChindings(base) : coreChindings(Object.assign({}, base, { name }));
  const time = (timestamp instanceof Function)
    ? timestamp : (timestamp ? epochTime$1 : nullTime$1);
  const timeSliceIndex = time().indexOf(':') + 1;

  if (useOnlyCustomLevels && !customLevels) throw Error('customLevels is required if useOnlyCustomLevels is set true')
  if (mixin && typeof mixin !== 'function') throw Error(`Unknown mixin type "${typeof mixin}" - expected "function"`)

  assertDefaultLevelFound$1(level, customLevels, useOnlyCustomLevels);
  const levels = mappings$2(customLevels, useOnlyCustomLevels);

  Object.assign(instance, {
    levels,
    [useOnlyCustomLevelsSym$3]: useOnlyCustomLevels,
    [streamSym$4]: stream,
    [timeSym$2]: time,
    [timeSliceIndexSym$2]: timeSliceIndex,
    [stringifySym$2]: stringify$2,
    [stringifiersSym$2]: stringifiers,
    [endSym$2]: end,
    [formatOptsSym$2]: formatOpts,
    [messageKeySym$2]: messageKey,
    [nestedKeySym$2]: nestedKey,
    [serializersSym$3]: serializers,
    [mixinSym$2]: mixin,
    [chindingsSym$3]: chindings,
    [formattersSym$4]: allFormatters,
    [hooksSym$2]: hooks,
    silent: noop$3
  });

  Object.setPrototypeOf(instance, proto$1());

  genLsCache$2(instance);

  instance[setLevelSym$2](level);

  return instance
}

function labelsFormatter (label, number) {
  return { level: label }
}

function levelNameFormatter (name) {
  return function (label, number) {
    return { [name]: number }
  }
}

function levelNameLabelFormatter (name) {
  return function (label, number) {
    return { [name]: label }
  }
}

var pino_1 = pino;

var extreme = (dest = process.stdout.fd) => {
  process.emitWarning(
    'The pino.extreme() option is deprecated and will be removed in v7. Use pino.destination({ sync: false }) instead.',
    { code: 'extreme_deprecation' }
  );
  return buildSafeSonicBoom$1({ dest, minLength: 4096, sync: false })
};

var destination = (dest = process.stdout.fd) => {
  if (typeof dest === 'object') {
    dest.dest = dest.dest || process.stdout.fd;
    return buildSafeSonicBoom$1(dest)
  } else {
    return buildSafeSonicBoom$1({ dest, minLength: 0, sync: true })
  }
};

var final_1 = final$1;
var levels$1 = mappings$2();
var stdSerializers_1 = serializers;
var stdTimeFunctions = Object.assign({}, time);
var symbols_1 = symbols;
var version_1 = version$3;

// Enables default and name export with TypeScript and Babel
var _default = pino;
var pino_2 = pino;
pino_1.extreme = extreme;
pino_1.destination = destination;
pino_1.final = final_1;
pino_1.levels = levels$1;
pino_1.stdSerializers = stdSerializers_1;
pino_1.stdTimeFunctions = stdTimeFunctions;
pino_1.symbols = symbols_1;
pino_1.version = version_1;
pino_1.default = _default;
pino_1.pino = pino_2;

const result = dotenvSafe__default['default'].config();
if (result.error) {
    throw result.error;
}

let logger$1;
if (process.env.LOGPRETTY === 'true') {
    logger$1 = pinologger__default['default']({
        instance: pino_1,
        prettyPrint: {
            colorize: true,
        },
    });
} else {
    logger$1 = pinologger__default['default']({
        instance: pino_1,
        prettyPrint: false
    });
}

var logger$2 = logger$1;

/**
 * formatError formats a json error message
 *
 * @param {*} err
 * @returns
 */
const formatError = (err) => {
    return {
        status: err.status,
        message: err.message,
    };
};

const router = new Router__default['default']();

router.get('/ping', async ctx => {
    ctx.body= "OK";
});

const router$1 = new Router__default['default']();

router$1.get('/error', async ctx => {
    ctx.throw(500, "some error");
});

var shortHash = "9111745";
var hash = "9111745d2293b0d74ca8ca4f6307a15e6382ab68";
var subject = "0.20.1";
var sanitizedSubject = "0.20.1";
var body = "";
var authoredOn = "1613284504";
var committedOn = "1613284504";
var author$1 = {
	name: "Tomasz Plonka",
	email: "tomasz.plonka@basharq.com"
};
var committer = {
	name: "Tomasz Plonka",
	email: "tomasz.plonka@basharq.com"
};
var notes = "";
var branch = "master";
var tags = [
	"v0.20.1"
];
var versionObj = {
	shortHash: shortHash,
	hash: hash,
	subject: subject,
	sanitizedSubject: sanitizedSubject,
	body: body,
	authoredOn: authoredOn,
	committedOn: committedOn,
	author: author$1,
	committer: committer,
	notes: notes,
	branch: branch,
	tags: tags
};

const router$2 = new Router__default['default']();

router$2.get('/version', async ctx => {
    if (ctx.request.query.all && ctx.request.query.all === "true") {
        ctx.body = versionObj;
    } else {
        ctx.body =  (({ shortHash, subject, committedOn, tags}) => ({ shortHash, subject, committedOn, tags }))(versionObj);
    }
});

/**
 * The client-side plugin for Primus which adds EventEmitter functionality.
 *
 * @param {Primus} primus The initialised Primus connection.
 * @api public
 */
var client = function client(primus) {
  var toString = Object.prototype.toString
    , emit = primus.emit;

  primus.transform('incoming', function incoming(packet) {
    var data = packet.data;

    if (
         this !== primus                                // Incorrect context.
      || 'object' !== typeof data                       // Events are objects.
      || !~toString.call(data.emit).indexOf(' Array]')  // Not an emit object.
    ) {
      return;
    }

    //
    // Check if we've received an event that is already used internally.
    // We use our previously saved `emit` function to emit the event so we
    // prevent recursion and message flood.
    //
    if (!this.reserved(data.emit[0])) emit.apply(primus, data.emit);

    return false;
  });

  primus.emit = function emitter(event) {
    if (
         primus.reserved(event)
      || 'newListener' === event
      || 'removeListener' === event
    ) return emit.apply(this, arguments);

    primus.write({ emit: Array.prototype.slice.call(arguments, 0) });
    return true;
  };
};

/**
 * The server-side plugin for Primus which adds EventEmitter functionality.
 *
 * @param {Primus} primus The initialised Primus server.
 * @api public
 */
var server = function server(primus) {
  var Spark = primus.Spark
    , emit = Spark.prototype.emit;

  primus.transform('incoming', function incoming(packet) {
    var data = packet.data;

    if (
         !(this instanceof Spark)     // Incorrect context.
      || 'object' !== typeof data     // Events are objects.
      || !Array.isArray(data.emit)    // Not an emit object.
    ) {
      return;
    }

    //
    // Check if we've received an event that is already used internally.
    // We use our previously saved `emit` function to emit the event so we
    // prevent recursion and message flood.
    //
    if (!this.reserved(data.emit[0])) emit.apply(this, data.emit);

    return false;
  });

  Spark.prototype.emit = function emitter(event) {
    if (
         this.reserved(event)
      || 'newListener' === event
      || 'removeListener' === event
    ) return emit.apply(this, arguments);

    this.write({ emit: Array.prototype.slice.call(arguments, 0) });
    return true;
  };
};

var primusEmit = {
	client: client,
	server: server
};

const app = new koa__default['default']();

if (process.env.LOGREQUEST === true) {
    app.use(logger$2);
}

// primus server
const server$1 = http__default['default'].createServer(app.callback());

const socket = new primus__default['default'](server$1, { transformer: 'sockjs', parser: 'JSON' });
// TODO in case https://github.com/swissmanu/primus-responder is used
// socket.reserved.events['request'] = 1;
socket.plugin('emit', primusEmit);

socket.on('connection', function (spark, next) {
    logger$2.logger.info("--> new connection");
    spark.on("user", function (userdata) {
        this.user = userdata;
        logger$2.logger.info(`user: ${this.user.username}`);
        this.user.id = this.id;

        // send a list of users to a new user...
        let userList = [];
        socket.forEach(function (spark) {
            userList.push(spark.user);
        });
        this.emit("userlist", userList);

        // ... and some chat messages
        const db = app.couchdb.db.use(process.env.DBCHAT);
        db.list({ limit: 100, include_docs: true }).then((body) => {
            spark.emit("chatinit", body.rows.map(row => { row = row.doc; row.read = true; return row; }));
        }).catch(err => logger$2.logger.error(err.message ? err.message : "error retrieving chat messages"));

        // new user data  - emitting to all
        socket.forEach(function (spark) {
            logger$2.logger.info(`emitting to clients connected: ${JSON.stringify(userdata)}`);
            spark.emit("userconnected", userdata);
        });

        next();
    }).on('takein', function incoming(userdata) {
        logger$2.logger.info(`take in: ${userdata.user}`);
        socket.forEach(function (spark) {
            // do not emit  to sender
            logger$2.logger.info(`user: ${JSON.stringify(userdata)} is playing`);
            logger$2.logger.info(`playing user: ${userdata.user},  spark user: ${spark.user.username}`);
            if (userdata.user !== spark.user.username) {
                spark.emit('takein', userdata);
            }
        });
    }).on('takeout', function incoming(s) {
        logger$2.logger.info(`take out: ${s.user}`);
        socket.forEach(function (s) {
            // do not emit  to sender
            if (s.id != spark.id) {
                logger$2.logger.info('will emit take in');
                s.emit('takeout', "");
            }
        });
    }).on('chatmessage', function (message) {
        const db = app.couchdb.db.use(process.env.DBCHAT);
        db.insert(message, message.id).catch(err => {
            logger$2.logger.error(err);
        });

        socket.forEach(function (s) {
            // send to all but a sender
            if (s.id != spark.id) {
                s.emit('chatmessage', message);
            }
        });
        logger$2.logger.info(message);
    });
});

socket.on('disconnection', function (client) {
    logger$2.logger.info('<-- connection has been closed.');
    logger$2.logger.info(`disconnected id: ${client.id}`);
    socket.forEach(function (spark) {
        logger$2.logger.info("emitting 'usergone'");
        spark.emit("usergone", { id: client.id });
    });
});

const router$3 = new Router__default['default']();

router$3.get('/clients', async ctx => {
    let data = [];
    socket.forEach(function (spark) {
        data.push({ user: spark.user });
        logger$2.logger.debug(data);
    });
    ctx.body = data;
});

const router$4 = new Router__default['default']();

const getTemplates = async (ctx, next) => {
    const templatesDb = ctx.app.couchdb.db.use(process.env.DBCFG);
    try {
        ctx.body = await templatesDb.get(process.env.DBTEMPLATEDOC);
    } catch (err) {
        ctx.throw(err.statusCode || 500, err);
    }
    next();
};

const getData = async (ctx) => {
    const dataDb = ctx.app.couchdb.db.use(process.env.DBNAME);
    const q = {
        "selector": {
            "_id": {
                "$gt": ""
            }
        },
        "limit": parseInt(process.env.DOCLIMIT, 10),
        "sort": [
            {
                "created": "desc"
            }
        ]
    };
    ctx.body = await dataDb.find(q);
};

const saveDoc = async (ctx) => {
    let result;
    let refDoc;
    const dataDb = ctx.app.couchdb.db.use(process.env.DBNAME);
    if (!ctx.request.body._id) {
        ctx.throw(400, { message: "no _id field in the document found" });
    }

    try {
        result = await dataDb.insert(ctx.request.body);
        ctx.response.body = result;
        ctx.response.status = 200;
    } catch (err) {
        if (err.statusCode === 409) {
            try {
                refDoc = await dataDb.get(ctx.request.body._id);
            } catch (err) {
                ctx.response.status = err.statusCode;
                ctx.response.body = { message: err.message };
            }
            ctx.response.status = 409;
            ctx.response.body = refDoc;
        } else {
            ctx.response.status = err.statusCode;
            ctx.response.body = { message: err.message };
            logger.error(err.message);
        }
    }};

router$4
    .get('/templates', getTemplates)
    .get('/data', getData)
    .put('/savedoc', koaBody__default['default'](), saveDoc);

class CouchdbChangeEvents extends EventEmitter__default['default'] {
    constructor({
        host = 'localhost',
        port = 5984,
        protocol = 'https:',
        heartbeat = 2000,
        includeDocs = true,
        autoConnect = true,
        lastEventId,
        user,
        password,
        database,
        feed = 'eventsource',
        view,
        style,
        conflicts = false,
        rejectUnauthorized = true,
        delay = 100
    }) {
        super();

        this.COUCHDB_STATUS_CONNECTED = 'connected';
        this.COUCHDB_STATUS_DISCONNECTED = 'disconnected';

        if (!database) {
            let noDbError = new Error('database parameter missing from config');

            noDbError.error_type = 'EMPTY_DATABASE_PARAMETER';

            throw noDbError;
        }

        this.host = host;
        this.port = port;
        this.protocol = protocol;
        this.database = database;

        this.user = user;
        this.password = password;

        this.includeDocs = includeDocs;
        this.lastEventId = lastEventId;

        this.feed = feed;
        this.style = style;
        this.view = view;
        this.conflicts = conflicts;
        this.rejectUnauthorized = rejectUnauthorized;

        this.initialDelay = Math.floor(delay / 2);
        this.delay = delay;

        this.heartbeat = parseInt(heartbeat, 10) || 2000;

        this.lastHeartBeat = new Date().getTime();

        this.setCouchdbStatus(this.COUCHDB_STATUS_DISCONNECTED);

        this.checkHeartbeat();

        if (autoConnect) {
            this.connect();
        }
    }

    checkHeartbeat() {
        const currentTime = new Date().getTime();

        if (currentTime - this.lastHeartBeat > 10000) {
            if (this.couchDbConnection) {
                this.couchDbConnection.destroy();
            }
        }

        global.setTimeout(this.checkHeartbeat.bind(this), 1000);
    }

    connect() {
        let client = https__default['default'];

        const requestOptions = this.getRequestOptions();
        this.lastHeartBeat = new Date().getTime();

        client.request(requestOptions, (response) => {
            this.couchDbConnection = response;

            if ((response.headers.server || '').match(/^couchdb/i)) {
                this.rawData = '';
                this.couchDbConnection.on('data', this.onCouchdbChange.bind(this));
                this.couchDbConnection.on('end', this.reconnect.bind(this));
            } else {
                response.destroy();
                this.emitError(new Error('not_couchdb'));
                this.reconnect();
            }
        }).on('error', (error) => {
            this.emitError(error);
            this.reconnect();
        }).end();
    }

    onCouchdbChange(data) {
        this.setCouchdbStatus(this.COUCHDB_STATUS_CONNECTED);
        this.delay = this.initialDelay;

        this.lastHeartBeat = new Date().getTime();

        this.rawData += data.toString();

        const messages = this.rawData.split('\n');

        this.rawData = messages.pop();

        if (messages.length > 0) {
            for (let change of messages) {
                if (change === '') {
                    continue;
                }

                let couchdbChange = JSON.parse(change, (key, value) =>
                    typeof value === 'string'
                        ? value.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')
                        : value
                );

                if (couchdbChange.error) {
                    const error = new Error(couchdbChange.error);

                    error.reason = couchdbChange.reason;

                    this.emitError(error);
                } else {
                    this.lastEventId = couchdbChange.seq;
                    this.emit('data', couchdbChange);
                }
            }
        }
    }

    emitError(error) {
        this.emit('couchdb_error', error);
    }

    reconnect() {
        this.setCouchdbStatus(this.COUCHDB_STATUS_DISCONNECTED);
        this.delay = this.delay * 2;
        global.setTimeout(this.connect.bind(this), this.delay);
    }

    setCouchdbStatus(status) {
        if (this.couchdbStatus !== status) {
            this.couchdbStatus = status;

            this.emit('couchdb_status', status);
        }
    }

    getRequestOptions() {
        let couchDbPath = `/${encodeURIComponent(this.database)}`,
            auth;

        couchDbPath += `/_changes`;
        couchDbPath += `?feed=${this.feed}`;
        couchDbPath += `&heartbeat=${this.heartbeat}`;

        if (this.includeDocs) {
            couchDbPath += '&include_docs=true';
        }

        if (this.conflicts) {
            couchDbPath += '&conflicts=true';
        }

        if (this.lastEventId) {
            let lastEventId = encodeURIComponent(this.lastEventId);

            couchDbPath += `&since=${lastEventId}`;
        }

        if (this.view) {
            let view = encodeURIComponent(this.view);

            couchDbPath += `&filter=_view&view=${view}`;
        }

        if (this.style) {
            let style = encodeURIComponent(this.style);

            couchDbPath += `&style=${style}`;
        }

        if (this.user) {
            auth = `${this.user}:${this.password}`;
        }

        return {
            protocol: this.protocol,
            host: this.host,
            port: this.port,
            path: couchDbPath,
            method: 'get',
            auth: auth,
            headers: { 'content-type': 'application/json' },
            rejectUnauthorized: this.rejectUnauthorized
        };
    }

    getSSEUrl() {
        const opts = this.getRequestOptions();
        const addr = `${opts.protocol}//${opts.auth}@${opts.host}:${opts.port}${opts.path}`;
        return addr;
    }

    getCouchDbUrl() {
        const opts = this.getRequestOptions();
        const url = `${opts.protocol}//${opts.auth}@${opts.host}:${opts.port}`;
        return url;
    }
}

// read .env (config file)
// const result = dotenvSafe.config();
// if (result.error) {
//     throw result.error;
// }

// const app = new koa();
const serverPort = process.env.PORT;

app.silent = true;

if (process.env.LOGREQUEST === 'true') {
    app.use(logger$2);
}

app.use(jsonerror__default['default'](formatError));
app.use(cors__default['default']({ 'Access-Control-Allow-Credentials': true }));

app.use(router.routes());
app.use(router.allowedMethods());
app.use(router$1.routes());
app.use(router$1.allowedMethods());
app.use(router$2.routes());
app.use(router$2.allowedMethods());
app.use(router$4.routes());
app.use(router$4.allowedMethods());
app.use(router$3.routes());
app.use(router$4.allowedMethods());

app.use(async (ctx, next) => {
    let user = ctx.req.headers['x-remote-user'];
    // console.log("user: ", user);
    ctx.cookies.set("X-Remote-User", user, { httpOnly: false, overwrite: true });
    await next();
});

app.use(serve__default['default']('public'));

// CouchDb notifications
const fullUrl = new url__default['default'].parse(process.env.DBHOST);
const couchdbEvents = new CouchdbChangeEvents({
    protocol: fullUrl.protocol,
    host: fullUrl.hostname,
    port: fullUrl.port,
    database: process.env.DBNAME,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    rejectUnauthorized: false,
    autoConnect: false,
    style: "all_docs",
    lastEventId: "now",
});

// eventsource from CouchDb
const sseUrl = couchdbEvents.getSSEUrl();
const es = new launchdarklyEventsource.EventSource(sseUrl, {
    https: { rejectUnauthorized: false },
    initialRetryDelayMillis: 3000,
    maxRetryDelayMillis: 90000,
    retryResetIntervalMillis: 60000, // backoff will reset to initial level if stream got an event at least 60 seconds before failing
    jitterRatio: 0.5
});

es.addEventListener('message', function (data) {
    // without a custom event this will be:
    // socket.write(data.data);
    socket.forEach(function (spark) {
        spark.emit('update', data.data);
    });
});

// periodically send the current version to clients connected
if (versionObj && versionObj.tags.length > 0) {
    console.log(`Current version: ${versionObj.tags[0]}`);
    setInterval(() => {
        socket.forEach(function (spark) {
            spark.emit('version', { version: versionObj.tags[0] });
        });
    }, process.env.VERINTERVAL * 1000);
} else {
    logger$2.logger.info("Software version unknown, git commit was not tagged?");
}

// CouchDb
const myagent = new Agent__default['default'].HttpsAgent({
    maxSockets: 50,
    maxKeepAliveRequests: 0,
    maxKeepAliveTime: 30000
});

app.couchdb = nano__default['default']({
    url: couchdbEvents.getCouchDbUrl(),
    requestDefaults: { "agent": myagent }
});

// couch.use(process.env.DBCFG).get('templates').then(resp => {
//     console.log(resp);
// });
//
// launch the server
// 
server$1.listen(serverPort, (err) => {
    if (err) throw err;
    logger$2.logger.info(`Server running at port ${serverPort}`);
});
