import { a as __toCommonJS, i as __require, n as __esmMin, o as __toESM, r as __exportAll, t as __commonJSMin } from "../../_runtime.mjs";
import Database from "libsql";
import { Buffer as Buffer$1 } from "node:buffer";
//#region node_modules/@libsql/core/lib-esm/api.js
/** Error thrown by the client. */
var LibsqlError = class extends Error {
	/** Machine-readable error code. */
	code;
	/** Extended error code with more specific information (e.g., SQLITE_CONSTRAINT_PRIMARYKEY). */
	extendedCode;
	/** Raw numeric error code */
	rawCode;
	constructor(message, code, extendedCode, rawCode, cause) {
		if (code !== void 0) message = `${code}: ${message}`;
		super(message, { cause });
		this.code = code;
		this.extendedCode = extendedCode;
		this.rawCode = rawCode;
		this.name = "LibsqlError";
	}
};
/** Error thrown by the client during batch operations. */
var LibsqlBatchError = class extends LibsqlError {
	/** The zero-based index of the statement that failed in the batch. */
	statementIndex;
	constructor(message, statementIndex, code, extendedCode, rawCode, cause) {
		super(message, code, extendedCode, rawCode, cause);
		this.statementIndex = statementIndex;
		this.name = "LibsqlBatchError";
	}
};
//#endregion
//#region node_modules/@libsql/core/lib-esm/uri.js
function parseUri(text) {
	const match = URI_RE.exec(text);
	if (match === null) throw new LibsqlError(`The URL '${text}' is not in a valid format`, "URL_INVALID");
	const groups = match.groups;
	return {
		scheme: groups["scheme"],
		authority: groups["authority"] !== void 0 ? parseAuthority(groups["authority"]) : void 0,
		path: percentDecode(groups["path"]),
		query: groups["query"] !== void 0 ? parseQuery(groups["query"]) : void 0,
		fragment: groups["fragment"] !== void 0 ? percentDecode(groups["fragment"]) : void 0
	};
}
var URI_RE = (() => {
	return new RegExp(`^(?<scheme>[A-Za-z][A-Za-z.+-]*):(//(?<authority>[^/?#]*))?(?<path>[^?#]*)(\\?(?<query>[^#]*))?(#(?<fragment>.*))?$`, "su");
})();
function parseAuthority(text) {
	const match = AUTHORITY_RE.exec(text);
	if (match === null) throw new LibsqlError("The authority part of the URL is not in a valid format", "URL_INVALID");
	const groups = match.groups;
	return {
		host: percentDecode(groups["host_br"] ?? groups["host"]),
		port: groups["port"] ? parseInt(groups["port"], 10) : void 0,
		userinfo: groups["username"] !== void 0 ? {
			username: percentDecode(groups["username"]),
			password: groups["password"] !== void 0 ? percentDecode(groups["password"]) : void 0
		} : void 0
	};
}
var AUTHORITY_RE = (() => {
	return new RegExp(`^((?<username>[^:]*)(:(?<password>.*))?@)?((?<host>[^:\\[\\]]*)|(\\[(?<host_br>[^\\[\\]]*)\\]))(:(?<port>[0-9]*))?$`, "su");
})();
function parseQuery(text) {
	const sequences = text.split("&");
	const pairs = [];
	for (const sequence of sequences) {
		if (sequence === "") continue;
		let key;
		let value;
		const splitIdx = sequence.indexOf("=");
		if (splitIdx < 0) {
			key = sequence;
			value = "";
		} else {
			key = sequence.substring(0, splitIdx);
			value = sequence.substring(splitIdx + 1);
		}
		pairs.push({
			key: percentDecode(key.replaceAll("+", " ")),
			value: percentDecode(value.replaceAll("+", " "))
		});
	}
	return { pairs };
}
function percentDecode(text) {
	try {
		return decodeURIComponent(text);
	} catch (e) {
		if (e instanceof URIError) throw new LibsqlError(`URL component has invalid percent encoding: ${e}`, "URL_INVALID", void 0, void 0, e);
		throw e;
	}
}
function encodeBaseUrl(scheme, authority, path) {
	if (authority === void 0) throw new LibsqlError(`URL with scheme ${JSON.stringify(scheme + ":")} requires authority (the "//" part)`, "URL_INVALID");
	const schemeText = `${scheme}:`;
	const hostText = encodeHost(authority.host);
	const portText = encodePort(authority.port);
	const authorityText = `//${encodeUserinfo(authority.userinfo)}${hostText}${portText}`;
	let pathText = path.split("/").map(encodeURIComponent).join("/");
	if (pathText !== "" && !pathText.startsWith("/")) pathText = "/" + pathText;
	return new URL(`${schemeText}${authorityText}${pathText}`);
}
function encodeHost(host) {
	return host.includes(":") ? `[${encodeURI(host)}]` : encodeURI(host);
}
function encodePort(port) {
	return port !== void 0 ? `:${port}` : "";
}
function encodeUserinfo(userinfo) {
	if (userinfo === void 0) return "";
	return `${encodeURIComponent(userinfo.username)}${userinfo.password !== void 0 ? `:${encodeURIComponent(userinfo.password)}` : ""}@`;
}
//#endregion
//#region node_modules/js-base64/base64.mjs
/**
*  base64.ts
*
*  Licensed under the BSD 3-Clause License.
*    http://opensource.org/licenses/BSD-3-Clause
*
*  References:
*    http://en.wikipedia.org/wiki/Base64
*
* @author Dan Kogai (https://github.com/dankogai)
*/
var version = "3.9.3";
/**
* @deprecated use lowercase `version`.
*/
var VERSION = version;
var _TD = typeof TextDecoder === "function" ? new TextDecoder("utf-8", { ignoreBOM: true }) : void 0;
var _TE = typeof TextEncoder === "function" ? new TextEncoder() : void 0;
var b64chs = Array.prototype.slice.call("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=");
var b64tab = ((a) => {
	let tab = {};
	a.forEach((c, i) => tab[c] = i);
	return tab;
})(b64chs);
var b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
var _fromCC = String.fromCharCode.bind(String);
var _U8Afrom = typeof Uint8Array.from === "function" ? Uint8Array.from.bind(Uint8Array) : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));
var _mkUriSafe = (src) => src.replace(/=/g, "").replace(/[+\/]/g, (m0) => m0 == "+" ? "-" : "_");
var _tidyB64 = (s) => s.replace(/[^A-Za-z0-9\+\/]/g, "");
/**
* polyfill version of `btoa`
*/
var btoaPolyfill = (bin) => {
	let u32, c0, c1, c2, asc = "";
	const pad = bin.length % 3;
	for (let i = 0; i < bin.length;) {
		if ((c0 = bin.charCodeAt(i++)) > 255 || (c1 = bin.charCodeAt(i++)) > 255 || (c2 = bin.charCodeAt(i++)) > 255) throw new TypeError("invalid character found");
		u32 = c0 << 16 | c1 << 8 | c2;
		asc += b64chs[u32 >> 18 & 63] + b64chs[u32 >> 12 & 63] + b64chs[u32 >> 6 & 63] + b64chs[u32 & 63];
	}
	return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
};
/**
* does what `window.btoa` of web browsers do.
* @param {String} bin binary string
* @returns {string} Base64-encoded string
*/
var _btoa = typeof btoa === "function" ? (bin) => btoa(bin) : btoaPolyfill;
var _fromUint8Array = typeof Uint8Array.prototype.toBase64 === "function" ? (u8a) => u8a.toBase64() : (u8a) => {
	const maxargs = 4096;
	let strs = [];
	for (let i = 0, l = u8a.length; i < l; i += maxargs) strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
	return _btoa(strs.join(""));
};
/**
* converts a Uint8Array to a Base64 string.
* @param {boolean} [urlsafe] URL-and-filename-safe a la RFC4648 §5
* @returns {string} Base64 string
*/
var fromUint8Array = (u8a, urlsafe = false) => urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a);
var cb_utob = (c) => {
	if (c.length < 2) {
		var cc = c.charCodeAt(0);
		return cc < 128 ? c : cc < 2048 ? _fromCC(192 | cc >>> 6) + _fromCC(128 | cc & 63) : _fromCC(224 | cc >>> 12 & 15) + _fromCC(128 | cc >>> 6 & 63) + _fromCC(128 | cc & 63);
	} else {
		var cc = 65536 + (c.charCodeAt(0) - 55296) * 1024 + (c.charCodeAt(1) - 56320);
		return _fromCC(240 | cc >>> 18 & 7) + _fromCC(128 | cc >>> 12 & 63) + _fromCC(128 | cc >>> 6 & 63) + _fromCC(128 | cc & 63);
	}
};
var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\x00-\x7F]/g;
/**
* @deprecated should have been internal use only.
* @param {string} src UTF-8 string
* @returns {string} UTF-16 string
*/
var utob = (u) => u.replace(re_utob, cb_utob);
var _encode = _TE ? (s) => _fromUint8Array(_TE.encode(s)) : (s) => _btoa(utob(s));
/**
* converts a UTF-8-encoded string to a Base64 string.
* @param {boolean} [urlsafe] if `true` make the result URL-safe
* @returns {string} Base64 string
*/
var encode = (src, urlsafe = false) => urlsafe ? _mkUriSafe(_encode(src)) : _encode(src);
/**
* converts a UTF-8-encoded string to URL-safe Base64 RFC4648 §5.
* @returns {string} Base64 string
*/
var encodeURI$1 = (src) => encode(src, true);
var re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
var cb_btou = (cccc) => {
	switch (cccc.length) {
		case 4:
			var offset = ((7 & cccc.charCodeAt(0)) << 18 | (63 & cccc.charCodeAt(1)) << 12 | (63 & cccc.charCodeAt(2)) << 6 | 63 & cccc.charCodeAt(3)) - 65536;
			return _fromCC((offset >>> 10) + 55296) + _fromCC((offset & 1023) + 56320);
		case 3: return _fromCC((15 & cccc.charCodeAt(0)) << 12 | (63 & cccc.charCodeAt(1)) << 6 | 63 & cccc.charCodeAt(2));
		default: return _fromCC((31 & cccc.charCodeAt(0)) << 6 | 63 & cccc.charCodeAt(1));
	}
};
/**
* @deprecated should have been internal use only.
* @param {string} src UTF-16 string
* @returns {string} UTF-8 string
*/
var btou = (b) => b.replace(re_btou, cb_btou);
/**
* polyfill version of `atob`
*/
var atobPolyfill = (asc) => {
	asc = asc.replace(/\s+/g, "");
	if (!b64re.test(asc)) throw new TypeError("malformed base64.");
	asc += "==".slice(2 - (asc.length & 3));
	let u24, r1, r2;
	let binArray = [];
	for (let i = 0; i < asc.length;) {
		u24 = b64tab[asc.charAt(i++)] << 18 | b64tab[asc.charAt(i++)] << 12 | (r1 = b64tab[asc.charAt(i++)]) << 6 | (r2 = b64tab[asc.charAt(i++)]);
		if (r1 === 64) binArray.push(_fromCC(u24 >> 16 & 255));
		else if (r2 === 64) binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255));
		else binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255));
	}
	return binArray.join("");
};
/**
* does what `window.atob` of web browsers do.
* @param {String} asc Base64-encoded string
* @returns {string} binary string
*/
var _atob = typeof atob === "function" ? (asc) => atob(_tidyB64(asc)) : atobPolyfill;
var _toUint8Array = typeof Uint8Array.fromBase64 === "function" ? (a) => Uint8Array.fromBase64(a) : (a) => _U8Afrom(_atob(a).split("").map((c) => c.charCodeAt(0)));
/**
* converts a Base64 string to a Uint8Array.
*/
var toUint8Array = (a) => _toUint8Array(_unURI(a));
var _decode = _TD ? (a) => _TD.decode(_toUint8Array(a)) : (a) => btou(_atob(a));
var _unURI = (a) => _tidyB64(a.replace(/[-_]/g, (m0) => m0 == "-" ? "+" : "/"));
/**
* converts a Base64 string to a UTF-8 string.
* @param {String} src Base64 string.  Both normal and URL-safe are supported
* @returns {string} UTF-8 string
*/
var decode = (src) => _decode(_unURI(src));
/**
* check if a value is a valid Base64 string
* @param {String} src a value to check
*/
var isValid = (src) => {
	if (typeof src !== "string") return false;
	const s = src.replace(/\s+/g, "").replace(/={0,2}$/, "");
	return !/[^\s0-9a-zA-Z\+/]/.test(s) || !/[^\s0-9a-zA-Z\-_]/.test(s);
};
var _noEnum = (v) => {
	return {
		value: v,
		enumerable: false,
		writable: true,
		configurable: true
	};
};
/**
* extend String.prototype with relevant methods
*/
var extendString = function() {
	const _add = (name, body) => Object.defineProperty(String.prototype, name, _noEnum(body));
	_add("fromBase64", function() {
		return decode(this);
	});
	_add("toBase64", function(urlsafe) {
		return encode(this, urlsafe);
	});
	_add("toBase64URI", function() {
		return encode(this, true);
	});
	_add("toBase64URL", function() {
		return encode(this, true);
	});
	_add("toUint8Array", function() {
		return toUint8Array(this);
	});
};
/**
* extend Uint8Array.prototype with relevant methods
*/
var extendUint8Array = function() {
	const _add = (name, body) => Object.defineProperty(Uint8Array.prototype, name, _noEnum(body));
	_add("toBase64", function(urlsafe) {
		return fromUint8Array(this, urlsafe);
	});
	_add("toBase64URI", function() {
		return fromUint8Array(this, true);
	});
	_add("toBase64URL", function() {
		return fromUint8Array(this, true);
	});
};
/**
* extend Builtin prototypes with relevant methods
*/
var extendBuiltins = () => {
	extendString();
	extendUint8Array();
};
var gBase64 = {
	version,
	VERSION,
	atob: _atob,
	atobPolyfill,
	btoa: _btoa,
	btoaPolyfill,
	fromBase64: decode,
	toBase64: encode,
	encode,
	encodeURI: encodeURI$1,
	encodeURL: encodeURI$1,
	utob,
	btou,
	decode,
	isValid,
	fromUint8Array,
	toUint8Array,
	extendString,
	extendUint8Array,
	extendBuiltins
};
//#endregion
//#region node_modules/@libsql/core/lib-esm/util.js
var supportedUrlLink = "https://github.com/libsql/libsql-client-ts#supported-urls";
function transactionModeToBegin(mode) {
	if (mode === "write") return "BEGIN IMMEDIATE";
	else if (mode === "read") return "BEGIN TRANSACTION READONLY";
	else if (mode === "deferred") return "BEGIN DEFERRED";
	else throw RangeError("Unknown transaction mode, supported values are \"write\", \"read\" and \"deferred\"");
}
var ResultSetImpl = class {
	columns;
	columnTypes;
	rows;
	rowsAffected;
	lastInsertRowid;
	constructor(columns, columnTypes, rows, rowsAffected, lastInsertRowid) {
		this.columns = columns;
		this.columnTypes = columnTypes;
		this.rows = rows;
		this.rowsAffected = rowsAffected;
		this.lastInsertRowid = lastInsertRowid;
	}
	toJSON() {
		return {
			columns: this.columns,
			columnTypes: this.columnTypes,
			rows: this.rows.map(rowToJson),
			rowsAffected: this.rowsAffected,
			lastInsertRowid: this.lastInsertRowid !== void 0 ? "" + this.lastInsertRowid : null
		};
	}
};
function rowToJson(row) {
	return Array.prototype.map.call(row, valueToJson);
}
function valueToJson(value) {
	if (typeof value === "bigint") return "" + value;
	else if (value instanceof ArrayBuffer) return gBase64.fromUint8Array(new Uint8Array(value));
	else return value;
}
//#endregion
//#region node_modules/@libsql/core/lib-esm/config.js
var inMemoryMode = ":memory:";
function isInMemoryConfig(config) {
	return config.scheme === "file" && (config.path === ":memory:" || config.path.startsWith(":memory:?"));
}
function expandConfig(config, preferHttp) {
	if (typeof config !== "object") throw new TypeError(`Expected client configuration as object, got ${typeof config}`);
	let { url, authToken, tls, intMode, concurrency } = config;
	concurrency = Math.max(0, concurrency || 20);
	intMode ??= "number";
	let connectionQueryParams = [];
	if (url === inMemoryMode) url = "file::memory:";
	const uri = parseUri(url);
	const originalUriScheme = uri.scheme.toLowerCase();
	const isInMemoryMode = originalUriScheme === "file" && uri.path === inMemoryMode && uri.authority === void 0;
	let queryParamsDef;
	if (isInMemoryMode) queryParamsDef = { cache: {
		values: ["shared", "private"],
		update: (key, value) => connectionQueryParams.push(`${key}=${value}`)
	} };
	else queryParamsDef = {
		tls: {
			values: ["0", "1"],
			update: (_, value) => tls = value === "1"
		},
		authToken: { update: (_, value) => authToken = value }
	};
	for (const { key, value } of uri.query?.pairs ?? []) {
		if (!Object.hasOwn(queryParamsDef, key)) throw new LibsqlError(`Unsupported URL query parameter ${JSON.stringify(key)}`, "URL_PARAM_NOT_SUPPORTED");
		const queryParamDef = queryParamsDef[key];
		if (queryParamDef.values !== void 0 && !queryParamDef.values.includes(value)) throw new LibsqlError(`Unknown value for the "${key}" query argument: ${JSON.stringify(value)}. Supported values are: [${queryParamDef.values.map((x) => "\"" + x + "\"").join(", ")}]`, "URL_INVALID");
		if (queryParamDef.update !== void 0) queryParamDef?.update(key, value);
	}
	const connectionQueryParamsString = connectionQueryParams.length === 0 ? "" : `?${connectionQueryParams.join("&")}`;
	const path = uri.path + connectionQueryParamsString;
	let scheme;
	if (originalUriScheme === "libsql") {
		if (tls === false) {
			if (uri.authority?.port === void 0) throw new LibsqlError("A \"libsql:\" URL with ?tls=0 must specify an explicit port", "URL_INVALID");
			scheme = preferHttp ? "http" : "ws";
		} else scheme = preferHttp ? "https" : "wss";
	} else scheme = originalUriScheme;
	if (scheme === "http" || scheme === "ws") tls ??= false;
	else tls ??= true;
	if (scheme !== "http" && scheme !== "ws" && scheme !== "https" && scheme !== "wss" && scheme !== "file") throw new LibsqlError(`The client supports only "libsql:", "wss:", "ws:", "https:", "http:" and "file:" URLs, got ${JSON.stringify(uri.scheme + ":")}. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
	if (intMode !== "number" && intMode !== "bigint" && intMode !== "string") throw new TypeError(`Invalid value for intMode, expected "number", "bigint" or "string", got ${JSON.stringify(intMode)}`);
	if (uri.fragment !== void 0) throw new LibsqlError(`URL fragments are not supported: ${JSON.stringify("#" + uri.fragment)}`, "URL_INVALID");
	if (isInMemoryMode) return {
		scheme: "file",
		tls: false,
		path,
		intMode,
		concurrency,
		syncUrl: config.syncUrl,
		syncInterval: config.syncInterval,
		readYourWrites: config.readYourWrites,
		offline: config.offline,
		fetch: config.fetch,
		timeout: config.timeout,
		authToken: void 0,
		encryptionKey: void 0,
		remoteEncryptionKey: void 0,
		authority: void 0
	};
	return {
		scheme,
		tls,
		authority: uri.authority,
		path,
		authToken,
		intMode,
		concurrency,
		encryptionKey: config.encryptionKey,
		remoteEncryptionKey: config.remoteEncryptionKey,
		syncUrl: config.syncUrl,
		syncInterval: config.syncInterval,
		readYourWrites: config.readYourWrites,
		offline: config.offline,
		fetch: config.fetch,
		timeout: config.timeout
	};
}
//#endregion
//#region node_modules/@libsql/client/lib-esm/sqlite3.js
/** @private */
function _createClient$3(config) {
	if (config.scheme !== "file") throw new LibsqlError(`URL scheme ${JSON.stringify(config.scheme + ":")} is not supported by the local sqlite3 client. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
	const authority = config.authority;
	if (authority !== void 0) {
		const host = authority.host.toLowerCase();
		if (host !== "" && host !== "localhost") throw new LibsqlError(`Invalid host in file URL: ${JSON.stringify(authority.host)}. A "file:" URL with an absolute path should start with one slash ("file:/absolute/path.db") or with three slashes ("file:///absolute/path.db"). For more information, please read ${supportedUrlLink}`, "URL_INVALID");
		if (authority.port !== void 0) throw new LibsqlError("File URL cannot have a port", "URL_INVALID");
		if (authority.userinfo !== void 0) throw new LibsqlError("File URL cannot have username and password", "URL_INVALID");
	}
	let isInMemory = isInMemoryConfig(config);
	if (isInMemory && config.syncUrl) throw new LibsqlError(`Embedded replica must use file for local db but URI with in-memory mode were provided instead: ${config.path}`, "URL_INVALID");
	let path = config.path;
	if (isInMemory) path = `${config.scheme}:${config.path}`;
	const options = {
		authToken: config.authToken,
		encryptionKey: config.encryptionKey,
		remoteEncryptionKey: config.remoteEncryptionKey,
		syncUrl: config.syncUrl,
		syncPeriod: config.syncInterval,
		readYourWrites: config.readYourWrites,
		offline: config.offline,
		timeout: config.timeout
	};
	const db = new Database(path, options);
	executeStmt(db, "SELECT 1 AS checkThatTheDatabaseCanBeOpened", config.intMode);
	return new Sqlite3Client(path, options, db, config.intMode);
}
var Sqlite3Client = class {
	#path;
	#options;
	#db;
	#intMode;
	closed;
	protocol;
	/** @private */
	constructor(path, options, db, intMode) {
		this.#path = path;
		this.#options = options;
		this.#db = db;
		this.#intMode = intMode;
		this.closed = false;
		this.protocol = "file";
	}
	async execute(stmtOrSql, args) {
		let stmt;
		if (typeof stmtOrSql === "string") stmt = {
			sql: stmtOrSql,
			args: args || []
		};
		else stmt = stmtOrSql;
		this.#checkNotClosed();
		return executeStmt(this.#getDb(), stmt, this.#intMode);
	}
	async batch(stmts, mode = "deferred") {
		this.#checkNotClosed();
		const db = this.#getDb();
		try {
			executeStmt(db, transactionModeToBegin(mode), this.#intMode);
			const resultSets = [];
			for (let i = 0; i < stmts.length; i++) try {
				if (!db.inTransaction) throw new LibsqlBatchError("The transaction has been rolled back", i, "TRANSACTION_CLOSED");
				const stmt = stmts[i];
				const normalizedStmt = Array.isArray(stmt) ? {
					sql: stmt[0],
					args: stmt[1] || []
				} : stmt;
				resultSets.push(executeStmt(db, normalizedStmt, this.#intMode));
			} catch (e) {
				if (e instanceof LibsqlBatchError) throw e;
				if (e instanceof LibsqlError) throw new LibsqlBatchError(e.message, i, e.code, e.extendedCode, e.rawCode, e.cause instanceof Error ? e.cause : void 0);
				throw e;
			}
			executeStmt(db, "COMMIT", this.#intMode);
			return resultSets;
		} finally {
			if (db.inTransaction) executeStmt(db, "ROLLBACK", this.#intMode);
		}
	}
	async migrate(stmts) {
		this.#checkNotClosed();
		const db = this.#getDb();
		try {
			executeStmt(db, "PRAGMA foreign_keys=off", this.#intMode);
			executeStmt(db, transactionModeToBegin("deferred"), this.#intMode);
			const resultSets = [];
			for (let i = 0; i < stmts.length; i++) try {
				if (!db.inTransaction) throw new LibsqlBatchError("The transaction has been rolled back", i, "TRANSACTION_CLOSED");
				resultSets.push(executeStmt(db, stmts[i], this.#intMode));
			} catch (e) {
				if (e instanceof LibsqlBatchError) throw e;
				if (e instanceof LibsqlError) throw new LibsqlBatchError(e.message, i, e.code, e.extendedCode, e.rawCode, e.cause instanceof Error ? e.cause : void 0);
				throw e;
			}
			executeStmt(db, "COMMIT", this.#intMode);
			return resultSets;
		} finally {
			if (db.inTransaction) executeStmt(db, "ROLLBACK", this.#intMode);
			executeStmt(db, "PRAGMA foreign_keys=on", this.#intMode);
		}
	}
	async transaction(mode = "write") {
		const db = this.#getDb();
		executeStmt(db, transactionModeToBegin(mode), this.#intMode);
		this.#db = null;
		return new Sqlite3Transaction(db, this.#intMode);
	}
	async executeMultiple(sql) {
		this.#checkNotClosed();
		const db = this.#getDb();
		try {
			return executeMultiple(db, sql);
		} finally {
			if (db.inTransaction) executeStmt(db, "ROLLBACK", this.#intMode);
		}
	}
	async sync() {
		this.#checkNotClosed();
		const rep = await this.#getDb().sync();
		return {
			frames_synced: rep.frames_synced,
			frame_no: rep.frame_no
		};
	}
	async reconnect() {
		try {
			if (!this.closed && this.#db !== null) this.#db.close();
		} finally {
			this.#db = new Database(this.#path, this.#options);
			this.closed = false;
		}
	}
	close() {
		this.closed = true;
		if (this.#db !== null) {
			this.#db.close();
			this.#db = null;
		}
	}
	#checkNotClosed() {
		if (this.closed) throw new LibsqlError("The client is closed", "CLIENT_CLOSED");
	}
	#getDb() {
		if (this.#db === null) this.#db = new Database(this.#path, this.#options);
		return this.#db;
	}
};
var Sqlite3Transaction = class {
	#database;
	#intMode;
	/** @private */
	constructor(database, intMode) {
		this.#database = database;
		this.#intMode = intMode;
	}
	async execute(stmtOrSql, args) {
		let stmt;
		if (typeof stmtOrSql === "string") stmt = {
			sql: stmtOrSql,
			args: args || []
		};
		else stmt = stmtOrSql;
		this.#checkNotClosed();
		return executeStmt(this.#database, stmt, this.#intMode);
	}
	async batch(stmts) {
		const resultSets = [];
		for (let i = 0; i < stmts.length; i++) try {
			this.#checkNotClosed();
			const stmt = stmts[i];
			const normalizedStmt = Array.isArray(stmt) ? {
				sql: stmt[0],
				args: stmt[1] || []
			} : stmt;
			resultSets.push(executeStmt(this.#database, normalizedStmt, this.#intMode));
		} catch (e) {
			if (e instanceof LibsqlBatchError) throw e;
			if (e instanceof LibsqlError) throw new LibsqlBatchError(e.message, i, e.code, e.extendedCode, e.rawCode, e.cause instanceof Error ? e.cause : void 0);
			throw e;
		}
		return resultSets;
	}
	async executeMultiple(sql) {
		this.#checkNotClosed();
		return executeMultiple(this.#database, sql);
	}
	async rollback() {
		if (!this.#database.open) return;
		this.#checkNotClosed();
		executeStmt(this.#database, "ROLLBACK", this.#intMode);
	}
	async commit() {
		this.#checkNotClosed();
		executeStmt(this.#database, "COMMIT", this.#intMode);
	}
	close() {
		if (this.#database.inTransaction) executeStmt(this.#database, "ROLLBACK", this.#intMode);
	}
	get closed() {
		return !this.#database.inTransaction;
	}
	#checkNotClosed() {
		if (this.closed) throw new LibsqlError("The transaction is closed", "TRANSACTION_CLOSED");
	}
};
function executeStmt(db, stmt, intMode) {
	let sql;
	let args;
	if (typeof stmt === "string") {
		sql = stmt;
		args = [];
	} else {
		sql = stmt.sql;
		if (Array.isArray(stmt.args)) args = stmt.args.map((value) => valueToSql(value, intMode));
		else {
			args = {};
			for (const name in stmt.args) {
				const argName = name[0] === "@" || name[0] === "$" || name[0] === ":" ? name.substring(1) : name;
				args[argName] = valueToSql(stmt.args[name], intMode);
			}
		}
	}
	try {
		const sqlStmt = db.prepare(sql);
		sqlStmt.safeIntegers(true);
		let returnsData = true;
		try {
			sqlStmt.raw(true);
		} catch {
			returnsData = false;
		}
		if (returnsData) {
			const columns = Array.from(sqlStmt.columns().map((col) => col.name));
			return new ResultSetImpl(columns, Array.from(sqlStmt.columns().map((col) => col.type ?? "")), sqlStmt.all(args).map((sqlRow) => {
				return rowFromSql(sqlRow, columns, intMode);
			}), 0, void 0);
		} else {
			const info = sqlStmt.run(args);
			const rowsAffected = info.changes;
			return new ResultSetImpl([], [], [], rowsAffected, BigInt(info.lastInsertRowid));
		}
	} catch (e) {
		throw mapSqliteError(e);
	}
}
function rowFromSql(sqlRow, columns, intMode) {
	const row = {};
	Object.defineProperty(row, "length", { value: sqlRow.length });
	for (let i = 0; i < sqlRow.length; ++i) {
		const value = valueFromSql(sqlRow[i], intMode);
		Object.defineProperty(row, i, { value });
		const column = columns[i];
		if (!Object.hasOwn(row, column)) Object.defineProperty(row, column, {
			value,
			enumerable: true,
			configurable: true,
			writable: true
		});
	}
	return row;
}
function valueFromSql(sqlValue, intMode) {
	if (typeof sqlValue === "bigint") {
		if (intMode === "number") {
			if (sqlValue < minSafeBigint || sqlValue > maxSafeBigint) throw new RangeError("Received integer which cannot be safely represented as a JavaScript number");
			return Number(sqlValue);
		} else if (intMode === "bigint") return sqlValue;
		else if (intMode === "string") return "" + sqlValue;
		else throw new Error("Invalid value for IntMode");
	} else if (sqlValue instanceof Buffer$1) return sqlValue.buffer;
	return sqlValue;
}
var minSafeBigint = -9007199254740991n;
var maxSafeBigint = 9007199254740991n;
function valueToSql(value, intMode) {
	if (typeof value === "number") {
		if (!Number.isFinite(value)) throw new RangeError("Only finite numbers (not Infinity or NaN) can be passed as arguments");
		return value;
	} else if (typeof value === "bigint") {
		if (value < minInteger$1 || value > maxInteger$1) throw new RangeError("bigint is too large to be represented as a 64-bit integer and passed as argument");
		return value;
	} else if (typeof value === "boolean") switch (intMode) {
		case "bigint": return value ? 1n : 0n;
		case "string": return value ? "1" : "0";
		default: return value ? 1 : 0;
	}
	else if (value instanceof ArrayBuffer) return Buffer$1.from(value);
	else if (value instanceof Date) return value.valueOf();
	else if (value === void 0) throw new TypeError("undefined cannot be passed as argument to the database");
	else return value;
}
var minInteger$1 = -9223372036854775808n;
var maxInteger$1 = 9223372036854775807n;
function executeMultiple(db, sql) {
	try {
		db.exec(sql);
	} catch (e) {
		throw mapSqliteError(e);
	}
}
function mapSqliteError(e) {
	if (e instanceof Database.SqliteError) {
		const extendedCode = e.code;
		const code = mapToBaseCode(e.rawCode);
		return new LibsqlError(e.message, code, extendedCode, e.rawCode, e);
	}
	return e;
}
function mapToBaseCode(rawCode) {
	if (rawCode === void 0) return "SQLITE_UNKNOWN";
	const baseCode = rawCode & 255;
	return sqliteErrorCodes[baseCode] ?? `SQLITE_UNKNOWN_${baseCode.toString()}`;
}
var sqliteErrorCodes = {
	1: "SQLITE_ERROR",
	2: "SQLITE_INTERNAL",
	3: "SQLITE_PERM",
	4: "SQLITE_ABORT",
	5: "SQLITE_BUSY",
	6: "SQLITE_LOCKED",
	7: "SQLITE_NOMEM",
	8: "SQLITE_READONLY",
	9: "SQLITE_INTERRUPT",
	10: "SQLITE_IOERR",
	11: "SQLITE_CORRUPT",
	12: "SQLITE_NOTFOUND",
	13: "SQLITE_FULL",
	14: "SQLITE_CANTOPEN",
	15: "SQLITE_PROTOCOL",
	16: "SQLITE_EMPTY",
	17: "SQLITE_SCHEMA",
	18: "SQLITE_TOOBIG",
	19: "SQLITE_CONSTRAINT",
	20: "SQLITE_MISMATCH",
	21: "SQLITE_MISUSE",
	22: "SQLITE_NOLFS",
	23: "SQLITE_AUTH",
	24: "SQLITE_FORMAT",
	25: "SQLITE_RANGE",
	26: "SQLITE_NOTADB",
	27: "SQLITE_NOTICE",
	28: "SQLITE_WARNING"
};
//#endregion
//#region node_modules/ws/lib/constants.js
var require_constants = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var BINARY_TYPES = [
		"nodebuffer",
		"arraybuffer",
		"fragments"
	];
	var hasBlob = typeof Blob !== "undefined";
	if (hasBlob) BINARY_TYPES.push("blob");
	module.exports = {
		BINARY_TYPES,
		CLOSE_TIMEOUT: 3e4,
		EMPTY_BUFFER: Buffer.alloc(0),
		GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
		hasBlob,
		kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
		kListener: Symbol("kListener"),
		kStatusCode: Symbol("status-code"),
		kWebSocket: Symbol("websocket"),
		NOOP: () => {}
	};
}));
//#endregion
//#region __vite-optional-peer-dep:bufferutil:ws
var __vite_optional_peer_dep_bufferutil_ws_exports = /* @__PURE__ */ __exportAll({ default: () => __vite_optional_peer_dep_bufferutil_ws_default });
var __vite_optional_peer_dep_bufferutil_ws_default;
var init___vite_optional_peer_dep_bufferutil_ws = __esmMin((() => {
	__vite_optional_peer_dep_bufferutil_ws_default = {};
	throw new Error(`Could not resolve "bufferutil" imported by "ws". Is it installed?`);
}));
//#endregion
//#region node_modules/ws/lib/buffer-util.js
var require_buffer_util = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { EMPTY_BUFFER } = require_constants();
	var FastBuffer = Buffer[Symbol.species];
	/**
	* Merges an array of buffers into a new buffer.
	*
	* @param {Buffer[]} list The array of buffers to concat
	* @param {Number} totalLength The total length of buffers in the list
	* @return {Buffer} The resulting buffer
	* @public
	*/
	function concat(list, totalLength) {
		if (list.length === 0) return EMPTY_BUFFER;
		if (list.length === 1) return list[0];
		const target = Buffer.allocUnsafe(totalLength);
		let offset = 0;
		for (let i = 0; i < list.length; i++) {
			const buf = list[i];
			target.set(buf, offset);
			offset += buf.length;
		}
		if (offset < totalLength) return new FastBuffer(target.buffer, target.byteOffset, offset);
		return target;
	}
	/**
	* Masks a buffer using the given mask.
	*
	* @param {Buffer} source The buffer to mask
	* @param {Buffer} mask The mask to use
	* @param {Buffer} output The buffer where to store the result
	* @param {Number} offset The offset at which to start writing
	* @param {Number} length The number of bytes to mask.
	* @public
	*/
	function _mask(source, mask, output, offset, length) {
		for (let i = 0; i < length; i++) output[offset + i] = source[i] ^ mask[i & 3];
	}
	/**
	* Unmasks a buffer using the given mask.
	*
	* @param {Buffer} buffer The buffer to unmask
	* @param {Buffer} mask The mask to use
	* @public
	*/
	function _unmask(buffer, mask) {
		for (let i = 0; i < buffer.length; i++) buffer[i] ^= mask[i & 3];
	}
	/**
	* Converts a buffer to an `ArrayBuffer`.
	*
	* @param {Buffer} buf The buffer to convert
	* @return {ArrayBuffer} Converted buffer
	* @public
	*/
	function toArrayBuffer(buf) {
		if (buf.length === buf.buffer.byteLength) return buf.buffer;
		return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
	}
	/**
	* Converts `data` to a `Buffer`.
	*
	* @param {*} data The data to convert
	* @return {Buffer} The buffer
	* @throws {TypeError}
	* @public
	*/
	function toBuffer(data) {
		toBuffer.readOnly = true;
		if (Buffer.isBuffer(data)) return data;
		let buf;
		if (data instanceof ArrayBuffer) buf = new FastBuffer(data);
		else if (ArrayBuffer.isView(data)) buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
		else {
			buf = Buffer.from(data);
			toBuffer.readOnly = false;
		}
		return buf;
	}
	module.exports = {
		concat,
		mask: _mask,
		toArrayBuffer,
		toBuffer,
		unmask: _unmask
	};
	/* istanbul ignore else  */
	if (!process.env.WS_NO_BUFFER_UTIL) try {
		const bufferUtil = (init___vite_optional_peer_dep_bufferutil_ws(), __toCommonJS(__vite_optional_peer_dep_bufferutil_ws_exports));
		module.exports.mask = function(source, mask, output, offset, length) {
			if (length < 48) _mask(source, mask, output, offset, length);
			else bufferUtil.mask(source, mask, output, offset, length);
		};
		module.exports.unmask = function(buffer, mask) {
			if (buffer.length < 32) _unmask(buffer, mask);
			else bufferUtil.unmask(buffer, mask);
		};
	} catch (e) {}
}));
//#endregion
//#region node_modules/ws/lib/limiter.js
var require_limiter = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var kDone = Symbol("kDone");
	var kRun = Symbol("kRun");
	/**
	* A very simple job queue with adjustable concurrency. Adapted from
	* https://github.com/STRML/async-limiter
	*/
	var Limiter = class {
		/**
		* Creates a new `Limiter`.
		*
		* @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
		*     to run concurrently
		*/
		constructor(concurrency) {
			this[kDone] = () => {
				this.pending--;
				this[kRun]();
			};
			this.concurrency = concurrency || Infinity;
			this.jobs = [];
			this.pending = 0;
		}
		/**
		* Adds a job to the queue.
		*
		* @param {Function} job The job to run
		* @public
		*/
		add(job) {
			this.jobs.push(job);
			this[kRun]();
		}
		/**
		* Removes a job from the queue and runs it if possible.
		*
		* @private
		*/
		[kRun]() {
			if (this.pending === this.concurrency) return;
			if (this.jobs.length) {
				const job = this.jobs.shift();
				this.pending++;
				job(this[kDone]);
			}
		}
	};
	module.exports = Limiter;
}));
//#endregion
//#region node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var zlib = __require("zlib");
	var bufferUtil = require_buffer_util();
	var Limiter = require_limiter();
	var { kStatusCode } = require_constants();
	var FastBuffer = Buffer[Symbol.species];
	var TRAILER = Buffer.from([
		0,
		0,
		255,
		255
	]);
	var kPerMessageDeflate = Symbol("permessage-deflate");
	var kTotalLength = Symbol("total-length");
	var kCallback = Symbol("callback");
	var kBuffers = Symbol("buffers");
	var kError = Symbol("error");
	var zlibLimiter;
	/**
	* permessage-deflate implementation.
	*/
	var PerMessageDeflate = class {
		/**
		* Creates a PerMessageDeflate instance.
		*
		* @param {Object} [options] Configuration options
		* @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
		*     for, or request, a custom client window size
		* @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
		*     acknowledge disabling of client context takeover
		* @param {Number} [options.concurrencyLimit=10] The number of concurrent
		*     calls to zlib
		* @param {Boolean} [options.isServer=false] Create the instance in either
		*     server or client mode
		* @param {Number} [options.maxPayload=0] The maximum allowed message length
		* @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
		*     use of a custom server window size
		* @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
		*     disabling of server context takeover
		* @param {Number} [options.threshold=1024] Size (in bytes) below which
		*     messages should not be compressed if context takeover is disabled
		* @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
		*     deflate
		* @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
		*     inflate
		*/
		constructor(options) {
			this._options = options || {};
			this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
			this._maxPayload = this._options.maxPayload | 0;
			this._isServer = !!this._options.isServer;
			this._deflate = null;
			this._inflate = null;
			this.params = null;
			if (!zlibLimiter) zlibLimiter = new Limiter(this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10);
		}
		/**
		* @type {String}
		*/
		static get extensionName() {
			return "permessage-deflate";
		}
		/**
		* Create an extension negotiation offer.
		*
		* @return {Object} Extension parameters
		* @public
		*/
		offer() {
			const params = {};
			if (this._options.serverNoContextTakeover) params.server_no_context_takeover = true;
			if (this._options.clientNoContextTakeover) params.client_no_context_takeover = true;
			if (this._options.serverMaxWindowBits) params.server_max_window_bits = this._options.serverMaxWindowBits;
			if (this._options.clientMaxWindowBits) params.client_max_window_bits = this._options.clientMaxWindowBits;
			else if (this._options.clientMaxWindowBits == null) params.client_max_window_bits = true;
			return params;
		}
		/**
		* Accept an extension negotiation offer/response.
		*
		* @param {Array} configurations The extension negotiation offers/reponse
		* @return {Object} Accepted configuration
		* @public
		*/
		accept(configurations) {
			configurations = this.normalizeParams(configurations);
			this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
			return this.params;
		}
		/**
		* Releases all resources used by the extension.
		*
		* @public
		*/
		cleanup() {
			if (this._inflate) {
				this._inflate.close();
				this._inflate = null;
			}
			if (this._deflate) {
				const callback = this._deflate[kCallback];
				this._deflate.close();
				this._deflate = null;
				if (callback) callback(/* @__PURE__ */ new Error("The deflate stream was closed while data was being processed"));
			}
		}
		/**
		*  Accept an extension negotiation offer.
		*
		* @param {Array} offers The extension negotiation offers
		* @return {Object} Accepted configuration
		* @private
		*/
		acceptAsServer(offers) {
			const opts = this._options;
			const accepted = offers.find((params) => {
				if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && (typeof params.client_max_window_bits === "number" ? opts.clientMaxWindowBits > params.client_max_window_bits : !params.client_max_window_bits)) return false;
				return true;
			});
			if (!accepted) throw new Error("None of the extension offers can be accepted");
			if (opts.serverNoContextTakeover) accepted.server_no_context_takeover = true;
			if (opts.clientNoContextTakeover) accepted.client_no_context_takeover = true;
			if (typeof opts.serverMaxWindowBits === "number") accepted.server_max_window_bits = opts.serverMaxWindowBits;
			if (typeof opts.clientMaxWindowBits === "number") accepted.client_max_window_bits = opts.clientMaxWindowBits;
			else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) delete accepted.client_max_window_bits;
			return accepted;
		}
		/**
		* Accept the extension negotiation response.
		*
		* @param {Array} response The extension negotiation response
		* @return {Object} Accepted configuration
		* @private
		*/
		acceptAsClient(response) {
			const params = response[0];
			if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) throw new Error("Unexpected parameter \"client_no_context_takeover\"");
			if (!params.client_max_window_bits) {
				if (typeof this._options.clientMaxWindowBits === "number") params.client_max_window_bits = this._options.clientMaxWindowBits;
			} else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) throw new Error("Unexpected or invalid parameter \"client_max_window_bits\"");
			return params;
		}
		/**
		* Normalize parameters.
		*
		* @param {Array} configurations The extension negotiation offers/reponse
		* @return {Array} The offers/response with normalized parameters
		* @private
		*/
		normalizeParams(configurations) {
			configurations.forEach((params) => {
				Object.keys(params).forEach((key) => {
					let value = params[key];
					if (value.length > 1) throw new Error(`Parameter "${key}" must have only a single value`);
					value = value[0];
					if (key === "client_max_window_bits") {
						if (value !== true) {
							const num = +value;
							if (!Number.isInteger(num) || num < 8 || num > 15) throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
							value = num;
						} else if (!this._isServer) throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
					} else if (key === "server_max_window_bits") {
						const num = +value;
						if (!Number.isInteger(num) || num < 8 || num > 15) throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
						value = num;
					} else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
						if (value !== true) throw new TypeError(`Invalid value for parameter "${key}": ${value}`);
					} else throw new Error(`Unknown parameter "${key}"`);
					params[key] = value;
				});
			});
			return configurations;
		}
		/**
		* Decompress data. Concurrency limited.
		*
		* @param {Buffer} data Compressed data
		* @param {Boolean} fin Specifies whether or not this is the last fragment
		* @param {Function} callback Callback
		* @public
		*/
		decompress(data, fin, callback) {
			zlibLimiter.add((done) => {
				this._decompress(data, fin, (err, result) => {
					done();
					callback(err, result);
				});
			});
		}
		/**
		* Compress data. Concurrency limited.
		*
		* @param {(Buffer|String)} data Data to compress
		* @param {Boolean} fin Specifies whether or not this is the last fragment
		* @param {Function} callback Callback
		* @public
		*/
		compress(data, fin, callback) {
			zlibLimiter.add((done) => {
				this._compress(data, fin, (err, result) => {
					done();
					callback(err, result);
				});
			});
		}
		/**
		* Decompress data.
		*
		* @param {Buffer} data Compressed data
		* @param {Boolean} fin Specifies whether or not this is the last fragment
		* @param {Function} callback Callback
		* @private
		*/
		_decompress(data, fin, callback) {
			const endpoint = this._isServer ? "client" : "server";
			if (!this._inflate) {
				const key = `${endpoint}_max_window_bits`;
				const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
				this._inflate = zlib.createInflateRaw({
					...this._options.zlibInflateOptions,
					windowBits
				});
				this._inflate[kPerMessageDeflate] = this;
				this._inflate[kTotalLength] = 0;
				this._inflate[kBuffers] = [];
				this._inflate.on("error", inflateOnError);
				this._inflate.on("data", inflateOnData);
			}
			this._inflate[kCallback] = callback;
			this._inflate.write(data);
			if (fin) this._inflate.write(TRAILER);
			this._inflate.flush(() => {
				const err = this._inflate[kError];
				if (err) {
					this._inflate.close();
					this._inflate = null;
					callback(err);
					return;
				}
				const data = bufferUtil.concat(this._inflate[kBuffers], this._inflate[kTotalLength]);
				if (this._inflate._readableState.endEmitted) {
					this._inflate.close();
					this._inflate = null;
				} else {
					this._inflate[kTotalLength] = 0;
					this._inflate[kBuffers] = [];
					if (fin && this.params[`${endpoint}_no_context_takeover`]) this._inflate.reset();
				}
				callback(null, data);
			});
		}
		/**
		* Compress data.
		*
		* @param {(Buffer|String)} data Data to compress
		* @param {Boolean} fin Specifies whether or not this is the last fragment
		* @param {Function} callback Callback
		* @private
		*/
		_compress(data, fin, callback) {
			const endpoint = this._isServer ? "server" : "client";
			if (!this._deflate) {
				const key = `${endpoint}_max_window_bits`;
				const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
				this._deflate = zlib.createDeflateRaw({
					...this._options.zlibDeflateOptions,
					windowBits
				});
				this._deflate[kTotalLength] = 0;
				this._deflate[kBuffers] = [];
				this._deflate.on("data", deflateOnData);
			}
			this._deflate[kCallback] = callback;
			this._deflate.write(data);
			this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
				if (!this._deflate) return;
				let data = bufferUtil.concat(this._deflate[kBuffers], this._deflate[kTotalLength]);
				if (fin) data = new FastBuffer(data.buffer, data.byteOffset, data.length - 4);
				this._deflate[kCallback] = null;
				this._deflate[kTotalLength] = 0;
				this._deflate[kBuffers] = [];
				if (fin && this.params[`${endpoint}_no_context_takeover`]) this._deflate.reset();
				callback(null, data);
			});
		}
	};
	module.exports = PerMessageDeflate;
	/**
	* The listener of the `zlib.DeflateRaw` stream `'data'` event.
	*
	* @param {Buffer} chunk A chunk of data
	* @private
	*/
	function deflateOnData(chunk) {
		this[kBuffers].push(chunk);
		this[kTotalLength] += chunk.length;
	}
	/**
	* The listener of the `zlib.InflateRaw` stream `'data'` event.
	*
	* @param {Buffer} chunk A chunk of data
	* @private
	*/
	function inflateOnData(chunk) {
		this[kTotalLength] += chunk.length;
		if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
			this[kBuffers].push(chunk);
			return;
		}
		this[kError] = /* @__PURE__ */ new RangeError("Max payload size exceeded");
		this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
		this[kError][kStatusCode] = 1009;
		this.removeListener("data", inflateOnData);
		this.reset();
	}
	/**
	* The listener of the `zlib.InflateRaw` stream `'error'` event.
	*
	* @param {Error} err The emitted error
	* @private
	*/
	function inflateOnError(err) {
		this[kPerMessageDeflate]._inflate = null;
		if (this[kError]) {
			this[kCallback](this[kError]);
			return;
		}
		err[kStatusCode] = 1007;
		this[kCallback](err);
	}
}));
//#endregion
//#region __vite-optional-peer-dep:utf-8-validate:ws
var __vite_optional_peer_dep_utf_8_validate_ws_exports = /* @__PURE__ */ __exportAll({ default: () => __vite_optional_peer_dep_utf_8_validate_ws_default });
var __vite_optional_peer_dep_utf_8_validate_ws_default;
var init___vite_optional_peer_dep_utf_8_validate_ws = __esmMin((() => {
	__vite_optional_peer_dep_utf_8_validate_ws_default = {};
	throw new Error(`Could not resolve "utf-8-validate" imported by "ws". Is it installed?`);
}));
//#endregion
//#region node_modules/ws/lib/validation.js
var require_validation = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { isUtf8 } = __require("buffer");
	var { hasBlob } = require_constants();
	var tokenChars = [
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		0,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		1,
		1,
		0,
		1,
		1,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		1,
		0,
		1,
		0
	];
	/**
	* Checks if a status code is allowed in a close frame.
	*
	* @param {Number} code The status code
	* @return {Boolean} `true` if the status code is valid, else `false`
	* @public
	*/
	function isValidStatusCode(code) {
		return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
	}
	/**
	* Checks if a given buffer contains only correct UTF-8.
	* Ported from https://www.cl.cam.ac.uk/%7Emgk25/ucs/utf8_check.c by
	* Markus Kuhn.
	*
	* @param {Buffer} buf The buffer to check
	* @return {Boolean} `true` if `buf` contains only correct UTF-8, else `false`
	* @public
	*/
	function _isValidUTF8(buf) {
		const len = buf.length;
		let i = 0;
		while (i < len) if ((buf[i] & 128) === 0) i++;
		else if ((buf[i] & 224) === 192) {
			if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) return false;
			i += 2;
		} else if ((buf[i] & 240) === 224) {
			if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || buf[i] === 237 && (buf[i + 1] & 224) === 160) return false;
			i += 3;
		} else if ((buf[i] & 248) === 240) {
			if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) return false;
			i += 4;
		} else return false;
		return true;
	}
	/**
	* Determines whether a value is a `Blob`.
	*
	* @param {*} value The value to be tested
	* @return {Boolean} `true` if `value` is a `Blob`, else `false`
	* @private
	*/
	function isBlob(value) {
		return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
	}
	module.exports = {
		isBlob,
		isValidStatusCode,
		isValidUTF8: _isValidUTF8,
		tokenChars
	};
	if (isUtf8) module.exports.isValidUTF8 = function(buf) {
		return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
	};
	else if (!process.env.WS_NO_UTF_8_VALIDATE) try {
		const isValidUTF8 = (init___vite_optional_peer_dep_utf_8_validate_ws(), __toCommonJS(__vite_optional_peer_dep_utf_8_validate_ws_exports));
		module.exports.isValidUTF8 = function(buf) {
			return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
		};
	} catch (e) {}
}));
//#endregion
//#region node_modules/ws/lib/receiver.js
var require_receiver = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { Writable } = __require("stream");
	var PerMessageDeflate = require_permessage_deflate();
	var { BINARY_TYPES, EMPTY_BUFFER, kStatusCode, kWebSocket } = require_constants();
	var { concat, toArrayBuffer, unmask } = require_buffer_util();
	var { isValidStatusCode, isValidUTF8 } = require_validation();
	var FastBuffer = Buffer[Symbol.species];
	var GET_INFO = 0;
	var GET_PAYLOAD_LENGTH_16 = 1;
	var GET_PAYLOAD_LENGTH_64 = 2;
	var GET_MASK = 3;
	var GET_DATA = 4;
	var INFLATING = 5;
	var DEFER_EVENT = 6;
	/**
	* HyBi Receiver implementation.
	*
	* @extends Writable
	*/
	var Receiver = class extends Writable {
		/**
		* Creates a Receiver instance.
		*
		* @param {Object} [options] Options object
		* @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
		*     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
		*     multiple times in the same tick
		* @param {String} [options.binaryType=nodebuffer] The type for binary data
		* @param {Object} [options.extensions] An object containing the negotiated
		*     extensions
		* @param {Boolean} [options.isServer=false] Specifies whether to operate in
		*     client or server mode
		* @param {Number} [options.maxBufferedChunks=0] The maximum number of
		*     buffered data chunks
		* @param {Number} [options.maxFragments=0] The maximum number of message
		*     fragments
		* @param {Number} [options.maxPayload=0] The maximum allowed message length
		* @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
		*     not to skip UTF-8 validation for text and close messages
		*/
		constructor(options = {}) {
			super();
			this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
			this._binaryType = options.binaryType || BINARY_TYPES[0];
			this._extensions = options.extensions || {};
			this._isServer = !!options.isServer;
			this._maxBufferedChunks = options.maxBufferedChunks | 0;
			this._maxFragments = options.maxFragments | 0;
			this._maxPayload = options.maxPayload | 0;
			this._skipUTF8Validation = !!options.skipUTF8Validation;
			this[kWebSocket] = void 0;
			this._bufferedBytes = 0;
			this._buffers = [];
			this._compressed = false;
			this._payloadLength = 0;
			this._mask = void 0;
			this._fragmented = 0;
			this._masked = false;
			this._fin = false;
			this._opcode = 0;
			this._totalPayloadLength = 0;
			this._messageLength = 0;
			this._numFragments = 0;
			this._fragments = [];
			this._errored = false;
			this._loop = false;
			this._state = GET_INFO;
		}
		/**
		* Implements `Writable.prototype._write()`.
		*
		* @param {Buffer} chunk The chunk of data to write
		* @param {String} encoding The character encoding of `chunk`
		* @param {Function} cb Callback
		* @private
		*/
		_write(chunk, encoding, cb) {
			if (this._opcode === 8 && this._state == GET_INFO) return cb();
			if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
				cb(this.createError(RangeError, "Too many buffered chunks", false, 1008, "WS_ERR_TOO_MANY_BUFFERED_PARTS"));
				return;
			}
			this._bufferedBytes += chunk.length;
			this._buffers.push(chunk);
			this.startLoop(cb);
		}
		/**
		* Consumes `n` bytes from the buffered data.
		*
		* @param {Number} n The number of bytes to consume
		* @return {Buffer} The consumed bytes
		* @private
		*/
		consume(n) {
			this._bufferedBytes -= n;
			if (n === this._buffers[0].length) return this._buffers.shift();
			if (n < this._buffers[0].length) {
				const buf = this._buffers[0];
				this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, buf.length - n);
				return new FastBuffer(buf.buffer, buf.byteOffset, n);
			}
			const dst = Buffer.allocUnsafe(n);
			do {
				const buf = this._buffers[0];
				const offset = dst.length - n;
				if (n >= buf.length) dst.set(this._buffers.shift(), offset);
				else {
					dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
					this._buffers[0] = new FastBuffer(buf.buffer, buf.byteOffset + n, buf.length - n);
				}
				n -= buf.length;
			} while (n > 0);
			return dst;
		}
		/**
		* Starts the parsing loop.
		*
		* @param {Function} cb Callback
		* @private
		*/
		startLoop(cb) {
			this._loop = true;
			do
				switch (this._state) {
					case GET_INFO:
						this.getInfo(cb);
						break;
					case GET_PAYLOAD_LENGTH_16:
						this.getPayloadLength16(cb);
						break;
					case GET_PAYLOAD_LENGTH_64:
						this.getPayloadLength64(cb);
						break;
					case GET_MASK:
						this.getMask();
						break;
					case GET_DATA:
						this.getData(cb);
						break;
					case INFLATING:
					case DEFER_EVENT:
						this._loop = false;
						return;
				}
			while (this._loop);
			if (!this._errored) cb();
		}
		/**
		* Reads the first two bytes of a frame.
		*
		* @param {Function} cb Callback
		* @private
		*/
		getInfo(cb) {
			if (this._bufferedBytes < 2) {
				this._loop = false;
				return;
			}
			const buf = this.consume(2);
			if ((buf[0] & 48) !== 0) {
				cb(this.createError(RangeError, "RSV2 and RSV3 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_2_3"));
				return;
			}
			const compressed = (buf[0] & 64) === 64;
			if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
				cb(this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1"));
				return;
			}
			this._fin = (buf[0] & 128) === 128;
			this._opcode = buf[0] & 15;
			this._payloadLength = buf[1] & 127;
			if (this._opcode === 0) {
				if (compressed) {
					cb(this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1"));
					return;
				}
				if (!this._fragmented) {
					cb(this.createError(RangeError, "invalid opcode 0", true, 1002, "WS_ERR_INVALID_OPCODE"));
					return;
				}
				this._opcode = this._fragmented;
			} else if (this._opcode === 1 || this._opcode === 2) {
				if (this._fragmented) {
					cb(this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE"));
					return;
				}
				this._compressed = compressed;
			} else if (this._opcode > 7 && this._opcode < 11) {
				if (!this._fin) {
					cb(this.createError(RangeError, "FIN must be set", true, 1002, "WS_ERR_EXPECTED_FIN"));
					return;
				}
				if (compressed) {
					cb(this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1"));
					return;
				}
				if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
					cb(this.createError(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"));
					return;
				}
			} else {
				cb(this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE"));
				return;
			}
			if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
			this._masked = (buf[1] & 128) === 128;
			if (this._isServer) {
				if (!this._masked) {
					cb(this.createError(RangeError, "MASK must be set", true, 1002, "WS_ERR_EXPECTED_MASK"));
					return;
				}
			} else if (this._masked) {
				cb(this.createError(RangeError, "MASK must be clear", true, 1002, "WS_ERR_UNEXPECTED_MASK"));
				return;
			}
			if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
			else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
			else this.haveLength(cb);
		}
		/**
		* Gets extended payload length (7+16).
		*
		* @param {Function} cb Callback
		* @private
		*/
		getPayloadLength16(cb) {
			if (this._bufferedBytes < 2) {
				this._loop = false;
				return;
			}
			this._payloadLength = this.consume(2).readUInt16BE(0);
			this.haveLength(cb);
		}
		/**
		* Gets extended payload length (7+64).
		*
		* @param {Function} cb Callback
		* @private
		*/
		getPayloadLength64(cb) {
			if (this._bufferedBytes < 8) {
				this._loop = false;
				return;
			}
			const buf = this.consume(8);
			const num = buf.readUInt32BE(0);
			if (num > Math.pow(2, 21) - 1) {
				cb(this.createError(RangeError, "Unsupported WebSocket frame: payload length > 2^53 - 1", false, 1009, "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"));
				return;
			}
			this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
			this.haveLength(cb);
		}
		/**
		* Payload length has been read.
		*
		* @param {Function} cb Callback
		* @private
		*/
		haveLength(cb) {
			if (this._payloadLength && this._opcode < 8) {
				this._totalPayloadLength += this._payloadLength;
				if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
					cb(this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"));
					return;
				}
			}
			if (this._masked) this._state = GET_MASK;
			else this._state = GET_DATA;
		}
		/**
		* Reads mask bytes.
		*
		* @private
		*/
		getMask() {
			if (this._bufferedBytes < 4) {
				this._loop = false;
				return;
			}
			this._mask = this.consume(4);
			this._state = GET_DATA;
		}
		/**
		* Reads data bytes.
		*
		* @param {Function} cb Callback
		* @private
		*/
		getData(cb) {
			let data = EMPTY_BUFFER;
			if (this._payloadLength) {
				if (this._bufferedBytes < this._payloadLength) {
					this._loop = false;
					return;
				}
				data = this.consume(this._payloadLength);
				if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) unmask(data, this._mask);
			}
			if (this._opcode > 7) {
				this.controlMessage(data, cb);
				return;
			}
			if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
				cb(this.createError(RangeError, "Too many message fragments", false, 1008, "WS_ERR_TOO_MANY_BUFFERED_PARTS"));
				return;
			}
			if (this._compressed) {
				this._state = INFLATING;
				this.decompress(data, cb);
				return;
			}
			if (data.length) {
				this._messageLength = this._totalPayloadLength;
				this._fragments.push(data);
			}
			this.dataMessage(cb);
		}
		/**
		* Decompresses data.
		*
		* @param {Buffer} data Compressed data
		* @param {Function} cb Callback
		* @private
		*/
		decompress(data, cb) {
			this._extensions[PerMessageDeflate.extensionName].decompress(data, this._fin, (err, buf) => {
				if (err) return cb(err);
				if (buf.length) {
					this._messageLength += buf.length;
					if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
						cb(this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"));
						return;
					}
					this._fragments.push(buf);
				}
				this.dataMessage(cb);
				if (this._state === GET_INFO) this.startLoop(cb);
			});
		}
		/**
		* Handles a data message.
		*
		* @param {Function} cb Callback
		* @private
		*/
		dataMessage(cb) {
			if (!this._fin) {
				this._state = GET_INFO;
				return;
			}
			const messageLength = this._messageLength;
			const fragments = this._fragments;
			this._totalPayloadLength = 0;
			this._messageLength = 0;
			this._fragmented = 0;
			this._numFragments = 0;
			this._fragments = [];
			if (this._opcode === 2) {
				let data;
				if (this._binaryType === "nodebuffer") data = concat(fragments, messageLength);
				else if (this._binaryType === "arraybuffer") data = toArrayBuffer(concat(fragments, messageLength));
				else if (this._binaryType === "blob") data = new Blob(fragments);
				else data = fragments;
				if (this._allowSynchronousEvents) {
					this.emit("message", data, true);
					this._state = GET_INFO;
				} else {
					this._state = DEFER_EVENT;
					setImmediate(() => {
						this.emit("message", data, true);
						this._state = GET_INFO;
						this.startLoop(cb);
					});
				}
			} else {
				const buf = concat(fragments, messageLength);
				if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
					cb(this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8"));
					return;
				}
				if (this._state === INFLATING || this._allowSynchronousEvents) {
					this.emit("message", buf, false);
					this._state = GET_INFO;
				} else {
					this._state = DEFER_EVENT;
					setImmediate(() => {
						this.emit("message", buf, false);
						this._state = GET_INFO;
						this.startLoop(cb);
					});
				}
			}
		}
		/**
		* Handles a control message.
		*
		* @param {Buffer} data Data to handle
		* @return {(Error|RangeError|undefined)} A possible error
		* @private
		*/
		controlMessage(data, cb) {
			if (this._opcode === 8) {
				if (data.length === 0) {
					this._loop = false;
					this.emit("conclude", 1005, EMPTY_BUFFER);
					this.end();
				} else {
					const code = data.readUInt16BE(0);
					if (!isValidStatusCode(code)) {
						cb(this.createError(RangeError, `invalid status code ${code}`, true, 1002, "WS_ERR_INVALID_CLOSE_CODE"));
						return;
					}
					const buf = new FastBuffer(data.buffer, data.byteOffset + 2, data.length - 2);
					if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
						cb(this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8"));
						return;
					}
					this._loop = false;
					this.emit("conclude", code, buf);
					this.end();
				}
				this._state = GET_INFO;
				return;
			}
			if (this._allowSynchronousEvents) {
				this.emit(this._opcode === 9 ? "ping" : "pong", data);
				this._state = GET_INFO;
			} else {
				this._state = DEFER_EVENT;
				setImmediate(() => {
					this.emit(this._opcode === 9 ? "ping" : "pong", data);
					this._state = GET_INFO;
					this.startLoop(cb);
				});
			}
		}
		/**
		* Builds an error object.
		*
		* @param {function(new:Error|RangeError)} ErrorCtor The error constructor
		* @param {String} message The error message
		* @param {Boolean} prefix Specifies whether or not to add a default prefix to
		*     `message`
		* @param {Number} statusCode The status code
		* @param {String} errorCode The exposed error code
		* @return {(Error|RangeError)} The error
		* @private
		*/
		createError(ErrorCtor, message, prefix, statusCode, errorCode) {
			this._loop = false;
			this._errored = true;
			const err = new ErrorCtor(prefix ? `Invalid WebSocket frame: ${message}` : message);
			Error.captureStackTrace(err, this.createError);
			err.code = errorCode;
			err[kStatusCode] = statusCode;
			return err;
		}
	};
	module.exports = Receiver;
}));
//#endregion
//#region node_modules/ws/lib/sender.js
var require_sender = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { Duplex: Duplex$3 } = __require("stream");
	var { randomFillSync } = __require("crypto");
	var { types: { isUint8Array } } = __require("util");
	var PerMessageDeflate = require_permessage_deflate();
	var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
	var { isBlob, isValidStatusCode } = require_validation();
	var { mask: applyMask, toBuffer } = require_buffer_util();
	var kByteLength = Symbol("kByteLength");
	var maskBuffer = Buffer.alloc(4);
	var RANDOM_POOL_SIZE = 8192;
	var randomPool;
	var randomPoolPointer = RANDOM_POOL_SIZE;
	var DEFAULT = 0;
	var DEFLATING = 1;
	var GET_BLOB_DATA = 2;
	module.exports = class Sender {
		/**
		* Creates a Sender instance.
		*
		* @param {Duplex} socket The connection socket
		* @param {Object} [extensions] An object containing the negotiated extensions
		* @param {Function} [generateMask] The function used to generate the masking
		*     key
		*/
		constructor(socket, extensions, generateMask) {
			this._extensions = extensions || {};
			if (generateMask) {
				this._generateMask = generateMask;
				this._maskBuffer = Buffer.alloc(4);
			}
			this._socket = socket;
			this._firstFragment = true;
			this._compress = false;
			this._bufferedBytes = 0;
			this._queue = [];
			this._state = DEFAULT;
			this.onerror = NOOP;
			this[kWebSocket] = void 0;
		}
		/**
		* Frames a piece of data according to the HyBi WebSocket protocol.
		*
		* @param {(Buffer|String)} data The data to frame
		* @param {Object} options Options object
		* @param {Boolean} [options.fin=false] Specifies whether or not to set the
		*     FIN bit
		* @param {Function} [options.generateMask] The function used to generate the
		*     masking key
		* @param {Boolean} [options.mask=false] Specifies whether or not to mask
		*     `data`
		* @param {Buffer} [options.maskBuffer] The buffer used to store the masking
		*     key
		* @param {Number} options.opcode The opcode
		* @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
		*     modified
		* @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
		*     RSV1 bit
		* @return {(Buffer|String)[]} The framed data
		* @public
		*/
		static frame(data, options) {
			let mask;
			let merge = false;
			let offset = 2;
			let skipMasking = false;
			if (options.mask) {
				mask = options.maskBuffer || maskBuffer;
				if (options.generateMask) options.generateMask(mask);
				else {
					if (randomPoolPointer === RANDOM_POOL_SIZE) {
						/* istanbul ignore else  */
						if (randomPool === void 0) randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
						randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
						randomPoolPointer = 0;
					}
					mask[0] = randomPool[randomPoolPointer++];
					mask[1] = randomPool[randomPoolPointer++];
					mask[2] = randomPool[randomPoolPointer++];
					mask[3] = randomPool[randomPoolPointer++];
				}
				skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
				offset = 6;
			}
			let dataLength;
			if (typeof data === "string") {
				if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) dataLength = options[kByteLength];
				else {
					data = Buffer.from(data);
					dataLength = data.length;
				}
			} else {
				dataLength = data.length;
				merge = options.mask && options.readOnly && !skipMasking;
			}
			let payloadLength = dataLength;
			if (dataLength >= 65536) {
				offset += 8;
				payloadLength = 127;
			} else if (dataLength > 125) {
				offset += 2;
				payloadLength = 126;
			}
			const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
			target[0] = options.fin ? options.opcode | 128 : options.opcode;
			if (options.rsv1) target[0] |= 64;
			target[1] = payloadLength;
			if (payloadLength === 126) target.writeUInt16BE(dataLength, 2);
			else if (payloadLength === 127) {
				target[2] = target[3] = 0;
				target.writeUIntBE(dataLength, 4, 6);
			}
			if (!options.mask) return [target, data];
			target[1] |= 128;
			target[offset - 4] = mask[0];
			target[offset - 3] = mask[1];
			target[offset - 2] = mask[2];
			target[offset - 1] = mask[3];
			if (skipMasking) return [target, data];
			if (merge) {
				applyMask(data, mask, target, offset, dataLength);
				return [target];
			}
			applyMask(data, mask, data, 0, dataLength);
			return [target, data];
		}
		/**
		* Sends a close message to the other peer.
		*
		* @param {Number} [code] The status code component of the body
		* @param {(String|Buffer)} [data] The message component of the body
		* @param {Boolean} [mask=false] Specifies whether or not to mask the message
		* @param {Function} [cb] Callback
		* @public
		*/
		close(code, data, mask, cb) {
			let buf;
			if (code === void 0) buf = EMPTY_BUFFER;
			else if (typeof code !== "number" || !isValidStatusCode(code)) throw new TypeError("First argument must be a valid error code number");
			else if (data === void 0 || !data.length) {
				buf = Buffer.allocUnsafe(2);
				buf.writeUInt16BE(code, 0);
			} else {
				const length = Buffer.byteLength(data);
				if (length > 123) throw new RangeError("The message must not be greater than 123 bytes");
				buf = Buffer.allocUnsafe(2 + length);
				buf.writeUInt16BE(code, 0);
				if (typeof data === "string") buf.write(data, 2);
				else if (isUint8Array(data)) buf.set(data, 2);
				else throw new TypeError("Second argument must be a string or a Uint8Array");
			}
			const options = {
				[kByteLength]: buf.length,
				fin: true,
				generateMask: this._generateMask,
				mask,
				maskBuffer: this._maskBuffer,
				opcode: 8,
				readOnly: false,
				rsv1: false
			};
			if (this._state !== DEFAULT) this.enqueue([
				this.dispatch,
				buf,
				false,
				options,
				cb
			]);
			else this.sendFrame(Sender.frame(buf, options), cb);
		}
		/**
		* Sends a ping message to the other peer.
		*
		* @param {*} data The message to send
		* @param {Boolean} [mask=false] Specifies whether or not to mask `data`
		* @param {Function} [cb] Callback
		* @public
		*/
		ping(data, mask, cb) {
			let byteLength;
			let readOnly;
			if (typeof data === "string") {
				byteLength = Buffer.byteLength(data);
				readOnly = false;
			} else if (isBlob(data)) {
				byteLength = data.size;
				readOnly = false;
			} else {
				data = toBuffer(data);
				byteLength = data.length;
				readOnly = toBuffer.readOnly;
			}
			if (byteLength > 125) throw new RangeError("The data size must not be greater than 125 bytes");
			const options = {
				[kByteLength]: byteLength,
				fin: true,
				generateMask: this._generateMask,
				mask,
				maskBuffer: this._maskBuffer,
				opcode: 9,
				readOnly,
				rsv1: false
			};
			if (isBlob(data)) {
				if (this._state !== DEFAULT) this.enqueue([
					this.getBlobData,
					data,
					false,
					options,
					cb
				]);
				else this.getBlobData(data, false, options, cb);
			} else if (this._state !== DEFAULT) this.enqueue([
				this.dispatch,
				data,
				false,
				options,
				cb
			]);
			else this.sendFrame(Sender.frame(data, options), cb);
		}
		/**
		* Sends a pong message to the other peer.
		*
		* @param {*} data The message to send
		* @param {Boolean} [mask=false] Specifies whether or not to mask `data`
		* @param {Function} [cb] Callback
		* @public
		*/
		pong(data, mask, cb) {
			let byteLength;
			let readOnly;
			if (typeof data === "string") {
				byteLength = Buffer.byteLength(data);
				readOnly = false;
			} else if (isBlob(data)) {
				byteLength = data.size;
				readOnly = false;
			} else {
				data = toBuffer(data);
				byteLength = data.length;
				readOnly = toBuffer.readOnly;
			}
			if (byteLength > 125) throw new RangeError("The data size must not be greater than 125 bytes");
			const options = {
				[kByteLength]: byteLength,
				fin: true,
				generateMask: this._generateMask,
				mask,
				maskBuffer: this._maskBuffer,
				opcode: 10,
				readOnly,
				rsv1: false
			};
			if (isBlob(data)) {
				if (this._state !== DEFAULT) this.enqueue([
					this.getBlobData,
					data,
					false,
					options,
					cb
				]);
				else this.getBlobData(data, false, options, cb);
			} else if (this._state !== DEFAULT) this.enqueue([
				this.dispatch,
				data,
				false,
				options,
				cb
			]);
			else this.sendFrame(Sender.frame(data, options), cb);
		}
		/**
		* Sends a data message to the other peer.
		*
		* @param {*} data The message to send
		* @param {Object} options Options object
		* @param {Boolean} [options.binary=false] Specifies whether `data` is binary
		*     or text
		* @param {Boolean} [options.compress=false] Specifies whether or not to
		*     compress `data`
		* @param {Boolean} [options.fin=false] Specifies whether the fragment is the
		*     last one
		* @param {Boolean} [options.mask=false] Specifies whether or not to mask
		*     `data`
		* @param {Function} [cb] Callback
		* @public
		*/
		send(data, options, cb) {
			const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
			let opcode = options.binary ? 2 : 1;
			let rsv1 = options.compress;
			let byteLength;
			let readOnly;
			if (typeof data === "string") {
				byteLength = Buffer.byteLength(data);
				readOnly = false;
			} else if (isBlob(data)) {
				byteLength = data.size;
				readOnly = false;
			} else {
				data = toBuffer(data);
				byteLength = data.length;
				readOnly = toBuffer.readOnly;
			}
			if (this._firstFragment) {
				this._firstFragment = false;
				if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) rsv1 = byteLength >= perMessageDeflate._threshold;
				this._compress = rsv1;
			} else {
				rsv1 = false;
				opcode = 0;
			}
			if (options.fin) this._firstFragment = true;
			const opts = {
				[kByteLength]: byteLength,
				fin: options.fin,
				generateMask: this._generateMask,
				mask: options.mask,
				maskBuffer: this._maskBuffer,
				opcode,
				readOnly,
				rsv1
			};
			if (isBlob(data)) {
				if (this._state !== DEFAULT) this.enqueue([
					this.getBlobData,
					data,
					this._compress,
					opts,
					cb
				]);
				else this.getBlobData(data, this._compress, opts, cb);
			} else if (this._state !== DEFAULT) this.enqueue([
				this.dispatch,
				data,
				this._compress,
				opts,
				cb
			]);
			else this.dispatch(data, this._compress, opts, cb);
		}
		/**
		* Gets the contents of a blob as binary data.
		*
		* @param {Blob} blob The blob
		* @param {Boolean} [compress=false] Specifies whether or not to compress
		*     the data
		* @param {Object} options Options object
		* @param {Boolean} [options.fin=false] Specifies whether or not to set the
		*     FIN bit
		* @param {Function} [options.generateMask] The function used to generate the
		*     masking key
		* @param {Boolean} [options.mask=false] Specifies whether or not to mask
		*     `data`
		* @param {Buffer} [options.maskBuffer] The buffer used to store the masking
		*     key
		* @param {Number} options.opcode The opcode
		* @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
		*     modified
		* @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
		*     RSV1 bit
		* @param {Function} [cb] Callback
		* @private
		*/
		getBlobData(blob, compress, options, cb) {
			this._bufferedBytes += options[kByteLength];
			this._state = GET_BLOB_DATA;
			blob.arrayBuffer().then((arrayBuffer) => {
				if (this._socket.destroyed) {
					const err = /* @__PURE__ */ new Error("The socket was closed while the blob was being read");
					process.nextTick(callCallbacks, this, err, cb);
					return;
				}
				this._bufferedBytes -= options[kByteLength];
				const data = toBuffer(arrayBuffer);
				if (!compress) {
					this._state = DEFAULT;
					this.sendFrame(Sender.frame(data, options), cb);
					this.dequeue();
				} else this.dispatch(data, compress, options, cb);
			}).catch((err) => {
				process.nextTick(onError, this, err, cb);
			});
		}
		/**
		* Dispatches a message.
		*
		* @param {(Buffer|String)} data The message to send
		* @param {Boolean} [compress=false] Specifies whether or not to compress
		*     `data`
		* @param {Object} options Options object
		* @param {Boolean} [options.fin=false] Specifies whether or not to set the
		*     FIN bit
		* @param {Function} [options.generateMask] The function used to generate the
		*     masking key
		* @param {Boolean} [options.mask=false] Specifies whether or not to mask
		*     `data`
		* @param {Buffer} [options.maskBuffer] The buffer used to store the masking
		*     key
		* @param {Number} options.opcode The opcode
		* @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
		*     modified
		* @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
		*     RSV1 bit
		* @param {Function} [cb] Callback
		* @private
		*/
		dispatch(data, compress, options, cb) {
			if (!compress) {
				this.sendFrame(Sender.frame(data, options), cb);
				return;
			}
			const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
			this._bufferedBytes += options[kByteLength];
			this._state = DEFLATING;
			perMessageDeflate.compress(data, options.fin, (_, buf) => {
				if (this._socket.destroyed) {
					const err = /* @__PURE__ */ new Error("The socket was closed while data was being compressed");
					callCallbacks(this, err, cb);
					return;
				}
				this._bufferedBytes -= options[kByteLength];
				this._state = DEFAULT;
				options.readOnly = false;
				this.sendFrame(Sender.frame(buf, options), cb);
				this.dequeue();
			});
		}
		/**
		* Executes queued send operations.
		*
		* @private
		*/
		dequeue() {
			while (this._state === DEFAULT && this._queue.length) {
				const params = this._queue.shift();
				this._bufferedBytes -= params[3][kByteLength];
				Reflect.apply(params[0], this, params.slice(1));
			}
		}
		/**
		* Enqueues a send operation.
		*
		* @param {Array} params Send operation parameters.
		* @private
		*/
		enqueue(params) {
			this._bufferedBytes += params[3][kByteLength];
			this._queue.push(params);
		}
		/**
		* Sends a frame.
		*
		* @param {(Buffer | String)[]} list The frame to send
		* @param {Function} [cb] Callback
		* @private
		*/
		sendFrame(list, cb) {
			if (list.length === 2) {
				this._socket.cork();
				this._socket.write(list[0]);
				this._socket.write(list[1], cb);
				this._socket.uncork();
			} else this._socket.write(list[0], cb);
		}
	};
	/**
	* Calls queued callbacks with an error.
	*
	* @param {Sender} sender The `Sender` instance
	* @param {Error} err The error to call the callbacks with
	* @param {Function} [cb] The first callback
	* @private
	*/
	function callCallbacks(sender, err, cb) {
		if (typeof cb === "function") cb(err);
		for (let i = 0; i < sender._queue.length; i++) {
			const params = sender._queue[i];
			const callback = params[params.length - 1];
			if (typeof callback === "function") callback(err);
		}
	}
	/**
	* Handles a `Sender` error.
	*
	* @param {Sender} sender The `Sender` instance
	* @param {Error} err The error
	* @param {Function} [cb] The first pending callback
	* @private
	*/
	function onError(sender, err, cb) {
		callCallbacks(sender, err, cb);
		sender.onerror(err);
	}
}));
//#endregion
//#region node_modules/ws/lib/event-target.js
var require_event_target = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { kForOnEventAttribute, kListener } = require_constants();
	var kCode = Symbol("kCode");
	var kData = Symbol("kData");
	var kError = Symbol("kError");
	var kMessage = Symbol("kMessage");
	var kReason = Symbol("kReason");
	var kTarget = Symbol("kTarget");
	var kType = Symbol("kType");
	var kWasClean = Symbol("kWasClean");
	/**
	* Class representing an event.
	*/
	var Event = class {
		/**
		* Create a new `Event`.
		*
		* @param {String} type The name of the event
		* @throws {TypeError} If the `type` argument is not specified
		*/
		constructor(type) {
			this[kTarget] = null;
			this[kType] = type;
		}
		/**
		* @type {*}
		*/
		get target() {
			return this[kTarget];
		}
		/**
		* @type {String}
		*/
		get type() {
			return this[kType];
		}
	};
	Object.defineProperty(Event.prototype, "target", { enumerable: true });
	Object.defineProperty(Event.prototype, "type", { enumerable: true });
	/**
	* Class representing a close event.
	*
	* @extends Event
	*/
	var CloseEvent = class extends Event {
		/**
		* Create a new `CloseEvent`.
		*
		* @param {String} type The name of the event
		* @param {Object} [options] A dictionary object that allows for setting
		*     attributes via object members of the same name
		* @param {Number} [options.code=0] The status code explaining why the
		*     connection was closed
		* @param {String} [options.reason=''] A human-readable string explaining why
		*     the connection was closed
		* @param {Boolean} [options.wasClean=false] Indicates whether or not the
		*     connection was cleanly closed
		*/
		constructor(type, options = {}) {
			super(type);
			this[kCode] = options.code === void 0 ? 0 : options.code;
			this[kReason] = options.reason === void 0 ? "" : options.reason;
			this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
		}
		/**
		* @type {Number}
		*/
		get code() {
			return this[kCode];
		}
		/**
		* @type {String}
		*/
		get reason() {
			return this[kReason];
		}
		/**
		* @type {Boolean}
		*/
		get wasClean() {
			return this[kWasClean];
		}
	};
	Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
	Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
	Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
	/**
	* Class representing an error event.
	*
	* @extends Event
	*/
	var ErrorEvent = class extends Event {
		/**
		* Create a new `ErrorEvent`.
		*
		* @param {String} type The name of the event
		* @param {Object} [options] A dictionary object that allows for setting
		*     attributes via object members of the same name
		* @param {*} [options.error=null] The error that generated this event
		* @param {String} [options.message=''] The error message
		*/
		constructor(type, options = {}) {
			super(type);
			this[kError] = options.error === void 0 ? null : options.error;
			this[kMessage] = options.message === void 0 ? "" : options.message;
		}
		/**
		* @type {*}
		*/
		get error() {
			return this[kError];
		}
		/**
		* @type {String}
		*/
		get message() {
			return this[kMessage];
		}
	};
	Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
	Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
	/**
	* Class representing a message event.
	*
	* @extends Event
	*/
	var MessageEvent = class extends Event {
		/**
		* Create a new `MessageEvent`.
		*
		* @param {String} type The name of the event
		* @param {Object} [options] A dictionary object that allows for setting
		*     attributes via object members of the same name
		* @param {*} [options.data=null] The message content
		*/
		constructor(type, options = {}) {
			super(type);
			this[kData] = options.data === void 0 ? null : options.data;
		}
		/**
		* @type {*}
		*/
		get data() {
			return this[kData];
		}
	};
	Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
	module.exports = {
		CloseEvent,
		ErrorEvent,
		Event,
		EventTarget: {
			/**
			* Register an event listener.
			*
			* @param {String} type A string representing the event type to listen for
			* @param {(Function|Object)} handler The listener to add
			* @param {Object} [options] An options object specifies characteristics about
			*     the event listener
			* @param {Boolean} [options.once=false] A `Boolean` indicating that the
			*     listener should be invoked at most once after being added. If `true`,
			*     the listener would be automatically removed when invoked.
			* @public
			*/
			addEventListener(type, handler, options = {}) {
				for (const listener of this.listeners(type)) if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) return;
				let wrapper;
				if (type === "message") wrapper = function onMessage(data, isBinary) {
					const event = new MessageEvent("message", { data: isBinary ? data : data.toString() });
					event[kTarget] = this;
					callListener(handler, this, event);
				};
				else if (type === "close") wrapper = function onClose(code, message) {
					const event = new CloseEvent("close", {
						code,
						reason: message.toString(),
						wasClean: this._closeFrameReceived && this._closeFrameSent
					});
					event[kTarget] = this;
					callListener(handler, this, event);
				};
				else if (type === "error") wrapper = function onError(error) {
					const event = new ErrorEvent("error", {
						error,
						message: error.message
					});
					event[kTarget] = this;
					callListener(handler, this, event);
				};
				else if (type === "open") wrapper = function onOpen() {
					const event = new Event("open");
					event[kTarget] = this;
					callListener(handler, this, event);
				};
				else return;
				wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
				wrapper[kListener] = handler;
				if (options.once) this.once(type, wrapper);
				else this.on(type, wrapper);
			},
			/**
			* Remove an event listener.
			*
			* @param {String} type A string representing the event type to remove
			* @param {(Function|Object)} handler The listener to remove
			* @public
			*/
			removeEventListener(type, handler) {
				for (const listener of this.listeners(type)) if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
					this.removeListener(type, listener);
					break;
				}
			}
		},
		MessageEvent
	};
	/**
	* Call an event listener
	*
	* @param {(Function|Object)} listener The listener to call
	* @param {*} thisArg The value to use as `this`` when calling the listener
	* @param {Event} event The event to pass to the listener
	* @private
	*/
	function callListener(listener, thisArg, event) {
		if (typeof listener === "object" && listener.handleEvent) listener.handleEvent.call(listener, event);
		else listener.call(thisArg, event);
	}
}));
//#endregion
//#region node_modules/ws/lib/extension.js
var require_extension = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { tokenChars } = require_validation();
	/**
	* Adds an offer to the map of extension offers or a parameter to the map of
	* parameters.
	*
	* @param {Object} dest The map of extension offers or parameters
	* @param {String} name The extension or parameter name
	* @param {(Object|Boolean|String)} elem The extension parameters or the
	*     parameter value
	* @private
	*/
	function push(dest, name, elem) {
		if (dest[name] === void 0) dest[name] = [elem];
		else dest[name].push(elem);
	}
	/**
	* Parses the `Sec-WebSocket-Extensions` header into an object.
	*
	* @param {String} header The field value of the header
	* @return {Object} The parsed object
	* @public
	*/
	function parse(header) {
		const offers = Object.create(null);
		let params = Object.create(null);
		let mustUnescape = false;
		let isEscaping = false;
		let inQuotes = false;
		let extensionName;
		let paramName;
		let start = -1;
		let code = -1;
		let end = -1;
		let i = 0;
		for (; i < header.length; i++) {
			code = header.charCodeAt(i);
			if (extensionName === void 0) {
				if (end === -1 && tokenChars[code] === 1) {
					if (start === -1) start = i;
				} else if (i !== 0 && (code === 32 || code === 9)) {
					if (end === -1 && start !== -1) end = i;
				} else if (code === 59 || code === 44) {
					if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
					if (end === -1) end = i;
					const name = header.slice(start, end);
					if (code === 44) {
						push(offers, name, params);
						params = Object.create(null);
					} else extensionName = name;
					start = end = -1;
				} else throw new SyntaxError(`Unexpected character at index ${i}`);
			} else if (paramName === void 0) {
				if (end === -1 && tokenChars[code] === 1) {
					if (start === -1) start = i;
				} else if (code === 32 || code === 9) {
					if (end === -1 && start !== -1) end = i;
				} else if (code === 59 || code === 44) {
					if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
					if (end === -1) end = i;
					push(params, header.slice(start, end), true);
					if (code === 44) {
						push(offers, extensionName, params);
						params = Object.create(null);
						extensionName = void 0;
					}
					start = end = -1;
				} else if (code === 61 && start !== -1 && end === -1) {
					paramName = header.slice(start, i);
					start = end = -1;
				} else throw new SyntaxError(`Unexpected character at index ${i}`);
			} else if (isEscaping) {
				if (tokenChars[code] !== 1) throw new SyntaxError(`Unexpected character at index ${i}`);
				if (start === -1) start = i;
				else if (!mustUnescape) mustUnescape = true;
				isEscaping = false;
			} else if (inQuotes) {
				if (tokenChars[code] === 1) {
					if (start === -1) start = i;
				} else if (code === 34 && start !== -1) {
					inQuotes = false;
					end = i;
				} else if (code === 92) isEscaping = true;
				else throw new SyntaxError(`Unexpected character at index ${i}`);
			} else if (code === 34 && header.charCodeAt(i - 1) === 61) inQuotes = true;
			else if (end === -1 && tokenChars[code] === 1) {
				if (start === -1) start = i;
			} else if (start !== -1 && (code === 32 || code === 9)) {
				if (end === -1) end = i;
			} else if (code === 59 || code === 44) {
				if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
				if (end === -1) end = i;
				let value = header.slice(start, end);
				if (mustUnescape) {
					value = value.replace(/\\/g, "");
					mustUnescape = false;
				}
				push(params, paramName, value);
				if (code === 44) {
					push(offers, extensionName, params);
					params = Object.create(null);
					extensionName = void 0;
				}
				paramName = void 0;
				start = end = -1;
			} else throw new SyntaxError(`Unexpected character at index ${i}`);
		}
		if (start === -1 || inQuotes || code === 32 || code === 9) throw new SyntaxError("Unexpected end of input");
		if (end === -1) end = i;
		const token = header.slice(start, end);
		if (extensionName === void 0) push(offers, token, params);
		else {
			if (paramName === void 0) push(params, token, true);
			else if (mustUnescape) push(params, paramName, token.replace(/\\/g, ""));
			else push(params, paramName, token);
			push(offers, extensionName, params);
		}
		return offers;
	}
	/**
	* Builds the `Sec-WebSocket-Extensions` header field value.
	*
	* @param {Object} extensions The map of extensions and parameters to format
	* @return {String} A string representing the given object
	* @public
	*/
	function format(extensions) {
		return Object.keys(extensions).map((extension) => {
			let configurations = extensions[extension];
			if (!Array.isArray(configurations)) configurations = [configurations];
			return configurations.map((params) => {
				return [extension].concat(Object.keys(params).map((k) => {
					let values = params[k];
					if (!Array.isArray(values)) values = [values];
					return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
				})).join("; ");
			}).join(", ");
		}).join(", ");
	}
	module.exports = {
		format,
		parse
	};
}));
//#endregion
//#region node_modules/ws/lib/websocket.js
var require_websocket = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var EventEmitter$1 = __require("events");
	var https = __require("https");
	var http$1 = __require("http");
	var net = __require("net");
	var tls = __require("tls");
	var { randomBytes, createHash: createHash$1 } = __require("crypto");
	var { Duplex: Duplex$2, Readable } = __require("stream");
	var { URL: URL$1 } = __require("url");
	var PerMessageDeflate = require_permessage_deflate();
	var Receiver = require_receiver();
	var Sender = require_sender();
	var { isBlob } = require_validation();
	var { BINARY_TYPES, CLOSE_TIMEOUT, EMPTY_BUFFER, GUID, kForOnEventAttribute, kListener, kStatusCode, kWebSocket, NOOP } = require_constants();
	var { EventTarget: { addEventListener, removeEventListener } } = require_event_target();
	var { format, parse } = require_extension();
	var { toBuffer } = require_buffer_util();
	var kAborted = Symbol("kAborted");
	var protocolVersions = [8, 13];
	var readyStates = [
		"CONNECTING",
		"OPEN",
		"CLOSING",
		"CLOSED"
	];
	var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
	/**
	* Class representing a WebSocket.
	*
	* @extends EventEmitter
	*/
	var WebSocket = class WebSocket extends EventEmitter$1 {
		/**
		* Create a new `WebSocket`.
		*
		* @param {(String|URL)} address The URL to which to connect
		* @param {(String|String[])} [protocols] The subprotocols
		* @param {Object} [options] Connection options
		*/
		constructor(address, protocols, options) {
			super();
			this._binaryType = BINARY_TYPES[0];
			this._closeCode = 1006;
			this._closeFrameReceived = false;
			this._closeFrameSent = false;
			this._closeMessage = EMPTY_BUFFER;
			this._closeTimer = null;
			this._errorEmitted = false;
			this._extensions = {};
			this._paused = false;
			this._protocol = "";
			this._readyState = WebSocket.CONNECTING;
			this._receiver = null;
			this._sender = null;
			this._socket = null;
			if (address !== null) {
				this._bufferedAmount = 0;
				this._isServer = false;
				this._redirects = 0;
				if (protocols === void 0) protocols = [];
				else if (!Array.isArray(protocols)) {
					if (typeof protocols === "object" && protocols !== null) {
						options = protocols;
						protocols = [];
					} else protocols = [protocols];
				}
				initAsClient(this, address, protocols, options);
			} else {
				this._autoPong = options.autoPong;
				this._closeTimeout = options.closeTimeout;
				this._isServer = true;
			}
		}
		/**
		* For historical reasons, the custom "nodebuffer" type is used by the default
		* instead of "blob".
		*
		* @type {String}
		*/
		get binaryType() {
			return this._binaryType;
		}
		set binaryType(type) {
			if (!BINARY_TYPES.includes(type)) return;
			this._binaryType = type;
			if (this._receiver) this._receiver._binaryType = type;
		}
		/**
		* @type {Number}
		*/
		get bufferedAmount() {
			if (!this._socket) return this._bufferedAmount;
			return this._socket._writableState.length + this._sender._bufferedBytes;
		}
		/**
		* @type {String}
		*/
		get extensions() {
			return Object.keys(this._extensions).join();
		}
		/**
		* @type {Boolean}
		*/
		get isPaused() {
			return this._paused;
		}
		/**
		* @type {Function}
		*/
		/* istanbul ignore next */
		get onclose() {
			return null;
		}
		/**
		* @type {Function}
		*/
		/* istanbul ignore next */
		get onerror() {
			return null;
		}
		/**
		* @type {Function}
		*/
		/* istanbul ignore next */
		get onopen() {
			return null;
		}
		/**
		* @type {Function}
		*/
		/* istanbul ignore next */
		get onmessage() {
			return null;
		}
		/**
		* @type {String}
		*/
		get protocol() {
			return this._protocol;
		}
		/**
		* @type {Number}
		*/
		get readyState() {
			return this._readyState;
		}
		/**
		* @type {String}
		*/
		get url() {
			return this._url;
		}
		/**
		* Set up the socket and the internal resources.
		*
		* @param {Duplex} socket The network socket between the server and client
		* @param {Buffer} head The first packet of the upgraded stream
		* @param {Object} options Options object
		* @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
		*     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
		*     multiple times in the same tick
		* @param {Function} [options.generateMask] The function used to generate the
		*     masking key
		* @param {Number} [options.maxBufferedChunks=0] The maximum number of
		*     buffered data chunks
		* @param {Number} [options.maxFragments=0] The maximum number of message
		*     fragments
		* @param {Number} [options.maxPayload=0] The maximum allowed message size
		* @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
		*     not to skip UTF-8 validation for text and close messages
		* @private
		*/
		setSocket(socket, head, options) {
			const receiver = new Receiver({
				allowSynchronousEvents: options.allowSynchronousEvents,
				binaryType: this.binaryType,
				extensions: this._extensions,
				isServer: this._isServer,
				maxBufferedChunks: options.maxBufferedChunks,
				maxFragments: options.maxFragments,
				maxPayload: options.maxPayload,
				skipUTF8Validation: options.skipUTF8Validation
			});
			const sender = new Sender(socket, this._extensions, options.generateMask);
			this._receiver = receiver;
			this._sender = sender;
			this._socket = socket;
			receiver[kWebSocket] = this;
			sender[kWebSocket] = this;
			socket[kWebSocket] = this;
			receiver.on("conclude", receiverOnConclude);
			receiver.on("drain", receiverOnDrain);
			receiver.on("error", receiverOnError);
			receiver.on("message", receiverOnMessage);
			receiver.on("ping", receiverOnPing);
			receiver.on("pong", receiverOnPong);
			sender.onerror = senderOnError;
			if (socket.setTimeout) socket.setTimeout(0);
			if (socket.setNoDelay) socket.setNoDelay();
			if (head.length > 0) socket.unshift(head);
			socket.on("close", socketOnClose);
			socket.on("data", socketOnData);
			socket.on("end", socketOnEnd);
			socket.on("error", socketOnError);
			this._readyState = WebSocket.OPEN;
			this.emit("open");
		}
		/**
		* Emit the `'close'` event.
		*
		* @private
		*/
		emitClose() {
			if (!this._socket) {
				this._readyState = WebSocket.CLOSED;
				this.emit("close", this._closeCode, this._closeMessage);
				return;
			}
			if (this._extensions[PerMessageDeflate.extensionName]) this._extensions[PerMessageDeflate.extensionName].cleanup();
			this._receiver.removeAllListeners();
			this._readyState = WebSocket.CLOSED;
			this.emit("close", this._closeCode, this._closeMessage);
		}
		/**
		* Start a closing handshake.
		*
		*          +----------+   +-----------+   +----------+
		*     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
		*    |     +----------+   +-----------+   +----------+     |
		*          +----------+   +-----------+         |
		* CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
		*          +----------+   +-----------+   |
		*    |           |                        |   +---+        |
		*                +------------------------+-->|fin| - - - -
		*    |         +---+                      |   +---+
		*     - - - - -|fin|<---------------------+
		*              +---+
		*
		* @param {Number} [code] Status code explaining why the connection is closing
		* @param {(String|Buffer)} [data] The reason why the connection is
		*     closing
		* @public
		*/
		close(code, data) {
			if (this.readyState === WebSocket.CLOSED) return;
			if (this.readyState === WebSocket.CONNECTING) {
				abortHandshake(this, this._req, "WebSocket was closed before the connection was established");
				return;
			}
			if (this.readyState === WebSocket.CLOSING) {
				if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) this._socket.end();
				return;
			}
			this._readyState = WebSocket.CLOSING;
			this._sender.close(code, data, !this._isServer, (err) => {
				if (err) return;
				this._closeFrameSent = true;
				if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) this._socket.end();
			});
			setCloseTimer(this);
		}
		/**
		* Pause the socket.
		*
		* @public
		*/
		pause() {
			if (this.readyState === WebSocket.CONNECTING || this.readyState === WebSocket.CLOSED) return;
			this._paused = true;
			this._socket.pause();
		}
		/**
		* Send a ping.
		*
		* @param {*} [data] The data to send
		* @param {Boolean} [mask] Indicates whether or not to mask `data`
		* @param {Function} [cb] Callback which is executed when the ping is sent
		* @public
		*/
		ping(data, mask, cb) {
			if (this.readyState === WebSocket.CONNECTING) throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
			if (typeof data === "function") {
				cb = data;
				data = mask = void 0;
			} else if (typeof mask === "function") {
				cb = mask;
				mask = void 0;
			}
			if (typeof data === "number") data = data.toString();
			if (this.readyState !== WebSocket.OPEN) {
				sendAfterClose(this, data, cb);
				return;
			}
			if (mask === void 0) mask = !this._isServer;
			this._sender.ping(data || EMPTY_BUFFER, mask, cb);
		}
		/**
		* Send a pong.
		*
		* @param {*} [data] The data to send
		* @param {Boolean} [mask] Indicates whether or not to mask `data`
		* @param {Function} [cb] Callback which is executed when the pong is sent
		* @public
		*/
		pong(data, mask, cb) {
			if (this.readyState === WebSocket.CONNECTING) throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
			if (typeof data === "function") {
				cb = data;
				data = mask = void 0;
			} else if (typeof mask === "function") {
				cb = mask;
				mask = void 0;
			}
			if (typeof data === "number") data = data.toString();
			if (this.readyState !== WebSocket.OPEN) {
				sendAfterClose(this, data, cb);
				return;
			}
			if (mask === void 0) mask = !this._isServer;
			this._sender.pong(data || EMPTY_BUFFER, mask, cb);
		}
		/**
		* Resume the socket.
		*
		* @public
		*/
		resume() {
			if (this.readyState === WebSocket.CONNECTING || this.readyState === WebSocket.CLOSED) return;
			this._paused = false;
			if (!this._receiver._writableState.needDrain) this._socket.resume();
		}
		/**
		* Send a data message.
		*
		* @param {*} data The message to send
		* @param {Object} [options] Options object
		* @param {Boolean} [options.binary] Specifies whether `data` is binary or
		*     text
		* @param {Boolean} [options.compress] Specifies whether or not to compress
		*     `data`
		* @param {Boolean} [options.fin=true] Specifies whether the fragment is the
		*     last one
		* @param {Boolean} [options.mask] Specifies whether or not to mask `data`
		* @param {Function} [cb] Callback which is executed when data is written out
		* @public
		*/
		send(data, options, cb) {
			if (this.readyState === WebSocket.CONNECTING) throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
			if (typeof options === "function") {
				cb = options;
				options = {};
			}
			if (typeof data === "number") data = data.toString();
			if (this.readyState !== WebSocket.OPEN) {
				sendAfterClose(this, data, cb);
				return;
			}
			const opts = {
				binary: typeof data !== "string",
				mask: !this._isServer,
				compress: true,
				fin: true,
				...options
			};
			if (!this._extensions[PerMessageDeflate.extensionName]) opts.compress = false;
			this._sender.send(data || EMPTY_BUFFER, opts, cb);
		}
		/**
		* Forcibly close the connection.
		*
		* @public
		*/
		terminate() {
			if (this.readyState === WebSocket.CLOSED) return;
			if (this.readyState === WebSocket.CONNECTING) {
				abortHandshake(this, this._req, "WebSocket was closed before the connection was established");
				return;
			}
			if (this._socket) {
				this._readyState = WebSocket.CLOSING;
				this._socket.destroy();
			}
		}
	};
	/**
	* @constant {Number} CONNECTING
	* @memberof WebSocket
	*/
	Object.defineProperty(WebSocket, "CONNECTING", {
		enumerable: true,
		value: readyStates.indexOf("CONNECTING")
	});
	/**
	* @constant {Number} CONNECTING
	* @memberof WebSocket.prototype
	*/
	Object.defineProperty(WebSocket.prototype, "CONNECTING", {
		enumerable: true,
		value: readyStates.indexOf("CONNECTING")
	});
	/**
	* @constant {Number} OPEN
	* @memberof WebSocket
	*/
	Object.defineProperty(WebSocket, "OPEN", {
		enumerable: true,
		value: readyStates.indexOf("OPEN")
	});
	/**
	* @constant {Number} OPEN
	* @memberof WebSocket.prototype
	*/
	Object.defineProperty(WebSocket.prototype, "OPEN", {
		enumerable: true,
		value: readyStates.indexOf("OPEN")
	});
	/**
	* @constant {Number} CLOSING
	* @memberof WebSocket
	*/
	Object.defineProperty(WebSocket, "CLOSING", {
		enumerable: true,
		value: readyStates.indexOf("CLOSING")
	});
	/**
	* @constant {Number} CLOSING
	* @memberof WebSocket.prototype
	*/
	Object.defineProperty(WebSocket.prototype, "CLOSING", {
		enumerable: true,
		value: readyStates.indexOf("CLOSING")
	});
	/**
	* @constant {Number} CLOSED
	* @memberof WebSocket
	*/
	Object.defineProperty(WebSocket, "CLOSED", {
		enumerable: true,
		value: readyStates.indexOf("CLOSED")
	});
	/**
	* @constant {Number} CLOSED
	* @memberof WebSocket.prototype
	*/
	Object.defineProperty(WebSocket.prototype, "CLOSED", {
		enumerable: true,
		value: readyStates.indexOf("CLOSED")
	});
	[
		"binaryType",
		"bufferedAmount",
		"extensions",
		"isPaused",
		"protocol",
		"readyState",
		"url"
	].forEach((property) => {
		Object.defineProperty(WebSocket.prototype, property, { enumerable: true });
	});
	[
		"open",
		"error",
		"close",
		"message"
	].forEach((method) => {
		Object.defineProperty(WebSocket.prototype, `on${method}`, {
			enumerable: true,
			get() {
				for (const listener of this.listeners(method)) if (listener[kForOnEventAttribute]) return listener[kListener];
				return null;
			},
			set(handler) {
				for (const listener of this.listeners(method)) if (listener[kForOnEventAttribute]) {
					this.removeListener(method, listener);
					break;
				}
				if (typeof handler !== "function") return;
				this.addEventListener(method, handler, { [kForOnEventAttribute]: true });
			}
		});
	});
	WebSocket.prototype.addEventListener = addEventListener;
	WebSocket.prototype.removeEventListener = removeEventListener;
	module.exports = WebSocket;
	/**
	* Initialize a WebSocket client.
	*
	* @param {WebSocket} websocket The client to initialize
	* @param {(String|URL)} address The URL to which to connect
	* @param {Array} protocols The subprotocols
	* @param {Object} [options] Connection options
	* @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether any
	*     of the `'message'`, `'ping'`, and `'pong'` events can be emitted multiple
	*     times in the same tick
	* @param {Boolean} [options.autoPong=true] Specifies whether or not to
	*     automatically send a pong in response to a ping
	* @param {Number} [options.closeTimeout=30000] Duration in milliseconds to wait
	*     for the closing handshake to finish after `websocket.close()` is called
	* @param {Function} [options.finishRequest] A function which can be used to
	*     customize the headers of each http request before it is sent
	* @param {Boolean} [options.followRedirects=false] Whether or not to follow
	*     redirects
	* @param {Function} [options.generateMask] The function used to generate the
	*     masking key
	* @param {Number} [options.handshakeTimeout] Timeout in milliseconds for the
	*     handshake request
	* @param {Number} [options.maxBufferedChunks=262144] The maximum number of
	*     buffered data chunks
	* @param {Number} [options.maxFragments=16384] The maximum number of message
	*     fragments
	* @param {Number} [options.maxPayload=104857600] The maximum allowed message
	*     size
	* @param {Number} [options.maxRedirects=10] The maximum number of redirects
	*     allowed
	* @param {String} [options.origin] Value of the `Origin` or
	*     `Sec-WebSocket-Origin` header
	* @param {(Boolean|Object)} [options.perMessageDeflate=true] Enable/disable
	*     permessage-deflate
	* @param {Number} [options.protocolVersion=13] Value of the
	*     `Sec-WebSocket-Version` header
	* @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
	*     not to skip UTF-8 validation for text and close messages
	* @private
	*/
	function initAsClient(websocket, address, protocols, options) {
		const opts = {
			allowSynchronousEvents: true,
			autoPong: true,
			closeTimeout: CLOSE_TIMEOUT,
			protocolVersion: protocolVersions[1],
			maxBufferedChunks: 262144,
			maxFragments: 16384,
			maxPayload: 104857600,
			skipUTF8Validation: false,
			perMessageDeflate: true,
			followRedirects: false,
			maxRedirects: 10,
			...options,
			socketPath: void 0,
			hostname: void 0,
			protocol: void 0,
			timeout: void 0,
			method: "GET",
			host: void 0,
			path: void 0,
			port: void 0
		};
		websocket._autoPong = opts.autoPong;
		websocket._closeTimeout = opts.closeTimeout;
		if (!protocolVersions.includes(opts.protocolVersion)) throw new RangeError(`Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`);
		let parsedUrl;
		if (address instanceof URL$1) parsedUrl = address;
		else try {
			parsedUrl = new URL$1(address);
		} catch {
			throw new SyntaxError(`Invalid URL: ${address}`);
		}
		if (parsedUrl.protocol === "http:") parsedUrl.protocol = "ws:";
		else if (parsedUrl.protocol === "https:") parsedUrl.protocol = "wss:";
		websocket._url = parsedUrl.href;
		const isSecure = parsedUrl.protocol === "wss:";
		const isIpcUrl = parsedUrl.protocol === "ws+unix:";
		let invalidUrlMessage;
		if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) invalidUrlMessage = "The URL's protocol must be one of \"ws:\", \"wss:\", \"http:\", \"https:\", or \"ws+unix:\"";
		else if (isIpcUrl && !parsedUrl.pathname) invalidUrlMessage = "The URL's pathname is empty";
		else if (parsedUrl.hash) invalidUrlMessage = "The URL contains a fragment identifier";
		if (invalidUrlMessage) {
			const err = new SyntaxError(invalidUrlMessage);
			if (websocket._redirects === 0) throw err;
			else {
				emitErrorAndClose(websocket, err);
				return;
			}
		}
		const defaultPort = isSecure ? 443 : 80;
		const key = randomBytes(16).toString("base64");
		const request = isSecure ? https.request : http$1.request;
		const protocolSet = /* @__PURE__ */ new Set();
		let perMessageDeflate;
		opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
		opts.defaultPort = opts.defaultPort || defaultPort;
		opts.port = parsedUrl.port || defaultPort;
		opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
		opts.headers = {
			...opts.headers,
			"Sec-WebSocket-Version": opts.protocolVersion,
			"Sec-WebSocket-Key": key,
			Connection: "Upgrade",
			Upgrade: "websocket"
		};
		opts.path = parsedUrl.pathname + parsedUrl.search;
		opts.timeout = opts.handshakeTimeout;
		if (opts.perMessageDeflate) {
			perMessageDeflate = new PerMessageDeflate({
				...opts.perMessageDeflate,
				isServer: false,
				maxPayload: opts.maxPayload
			});
			opts.headers["Sec-WebSocket-Extensions"] = format({ [PerMessageDeflate.extensionName]: perMessageDeflate.offer() });
		}
		if (protocols.length) {
			for (const protocol of protocols) {
				if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) throw new SyntaxError("An invalid or duplicated subprotocol was specified");
				protocolSet.add(protocol);
			}
			opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
		}
		if (opts.origin) {
			if (opts.protocolVersion < 13) opts.headers["Sec-WebSocket-Origin"] = opts.origin;
			else opts.headers.Origin = opts.origin;
		}
		if (parsedUrl.username || parsedUrl.password) opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
		if (isIpcUrl) {
			const parts = opts.path.split(":");
			opts.socketPath = parts[0];
			opts.path = parts[1];
		}
		let req;
		if (opts.followRedirects) {
			if (websocket._redirects === 0) {
				websocket._originalIpc = isIpcUrl;
				websocket._originalSecure = isSecure;
				websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
				const headers = options && options.headers;
				options = {
					...options,
					headers: {}
				};
				if (headers) for (const [key, value] of Object.entries(headers)) options.headers[key.toLowerCase()] = value;
			} else if (websocket.listenerCount("redirect") === 0) {
				const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
				if (!isSameHost || websocket._originalSecure && !isSecure) {
					delete opts.headers.authorization;
					delete opts.headers.cookie;
					if (!isSameHost) delete opts.headers.host;
					opts.auth = void 0;
				}
			}
			if (opts.auth && !options.headers.authorization) options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
			req = websocket._req = request(opts);
			if (websocket._redirects) websocket.emit("redirect", websocket.url, req);
		} else req = websocket._req = request(opts);
		if (opts.timeout) req.on("timeout", () => {
			abortHandshake(websocket, req, "Opening handshake has timed out");
		});
		req.on("error", (err) => {
			if (req === null || req[kAborted]) return;
			req = websocket._req = null;
			emitErrorAndClose(websocket, err);
		});
		req.on("response", (res) => {
			const location = res.headers.location;
			const statusCode = res.statusCode;
			if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
				if (++websocket._redirects > opts.maxRedirects) {
					abortHandshake(websocket, req, "Maximum redirects exceeded");
					return;
				}
				req.abort();
				let addr;
				try {
					addr = new URL$1(location, address);
				} catch (e) {
					emitErrorAndClose(websocket, /* @__PURE__ */ new SyntaxError(`Invalid URL: ${location}`));
					return;
				}
				initAsClient(websocket, addr, protocols, options);
			} else if (!websocket.emit("unexpected-response", req, res)) abortHandshake(websocket, req, `Unexpected server response: ${res.statusCode}`);
		});
		req.on("upgrade", (res, socket, head) => {
			websocket.emit("upgrade", res);
			if (websocket.readyState !== WebSocket.CONNECTING) return;
			req = websocket._req = null;
			const upgrade = res.headers.upgrade;
			if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
				abortHandshake(websocket, socket, "Invalid Upgrade header");
				return;
			}
			const digest = createHash$1("sha1").update(key + GUID).digest("base64");
			if (res.headers["sec-websocket-accept"] !== digest) {
				abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
				return;
			}
			const serverProt = res.headers["sec-websocket-protocol"];
			let protError;
			if (serverProt !== void 0) {
				if (!protocolSet.size) protError = "Server sent a subprotocol but none was requested";
				else if (!protocolSet.has(serverProt)) protError = "Server sent an invalid subprotocol";
			} else if (protocolSet.size) protError = "Server sent no subprotocol";
			if (protError) {
				abortHandshake(websocket, socket, protError);
				return;
			}
			if (serverProt) websocket._protocol = serverProt;
			const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
			if (secWebSocketExtensions !== void 0) {
				if (!perMessageDeflate) {
					abortHandshake(websocket, socket, "Server sent a Sec-WebSocket-Extensions header but no extension was requested");
					return;
				}
				let extensions;
				try {
					extensions = parse(secWebSocketExtensions);
				} catch (err) {
					abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Extensions header");
					return;
				}
				const extensionNames = Object.keys(extensions);
				if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
					abortHandshake(websocket, socket, "Server indicated an extension that was not requested");
					return;
				}
				try {
					perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
				} catch (err) {
					abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Extensions header");
					return;
				}
				websocket._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
			}
			websocket.setSocket(socket, head, {
				allowSynchronousEvents: opts.allowSynchronousEvents,
				generateMask: opts.generateMask,
				maxBufferedChunks: opts.maxBufferedChunks,
				maxFragments: opts.maxFragments,
				maxPayload: opts.maxPayload,
				skipUTF8Validation: opts.skipUTF8Validation
			});
		});
		if (opts.finishRequest) opts.finishRequest(req, websocket);
		else req.end();
	}
	/**
	* Emit the `'error'` and `'close'` events.
	*
	* @param {WebSocket} websocket The WebSocket instance
	* @param {Error} The error to emit
	* @private
	*/
	function emitErrorAndClose(websocket, err) {
		websocket._readyState = WebSocket.CLOSING;
		websocket._errorEmitted = true;
		websocket.emit("error", err);
		websocket.emitClose();
	}
	/**
	* Create a `net.Socket` and initiate a connection.
	*
	* @param {Object} options Connection options
	* @return {net.Socket} The newly created socket used to start the connection
	* @private
	*/
	function netConnect(options) {
		options.path = options.socketPath;
		return net.connect(options);
	}
	/**
	* Create a `tls.TLSSocket` and initiate a connection.
	*
	* @param {Object} options Connection options
	* @return {tls.TLSSocket} The newly created socket used to start the connection
	* @private
	*/
	function tlsConnect(options) {
		options.path = void 0;
		if (!options.servername && options.servername !== "") options.servername = net.isIP(options.host) ? "" : options.host;
		return tls.connect(options);
	}
	/**
	* Abort the handshake and emit an error.
	*
	* @param {WebSocket} websocket The WebSocket instance
	* @param {(http.ClientRequest|net.Socket|tls.Socket)} stream The request to
	*     abort or the socket to destroy
	* @param {String} message The error message
	* @private
	*/
	function abortHandshake(websocket, stream, message) {
		websocket._readyState = WebSocket.CLOSING;
		const err = new Error(message);
		Error.captureStackTrace(err, abortHandshake);
		if (stream.setHeader) {
			stream[kAborted] = true;
			stream.abort();
			if (stream.socket && !stream.socket.destroyed) stream.socket.destroy();
			process.nextTick(emitErrorAndClose, websocket, err);
		} else {
			stream.destroy(err);
			stream.once("error", websocket.emit.bind(websocket, "error"));
			stream.once("close", websocket.emitClose.bind(websocket));
		}
	}
	/**
	* Handle cases where the `ping()`, `pong()`, or `send()` methods are called
	* when the `readyState` attribute is `CLOSING` or `CLOSED`.
	*
	* @param {WebSocket} websocket The WebSocket instance
	* @param {*} [data] The data to send
	* @param {Function} [cb] Callback
	* @private
	*/
	function sendAfterClose(websocket, data, cb) {
		if (data) {
			const length = isBlob(data) ? data.size : toBuffer(data).length;
			if (websocket._socket) websocket._sender._bufferedBytes += length;
			else websocket._bufferedAmount += length;
		}
		if (cb) {
			const err = /* @__PURE__ */ new Error(`WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`);
			process.nextTick(cb, err);
		}
	}
	/**
	* The listener of the `Receiver` `'conclude'` event.
	*
	* @param {Number} code The status code
	* @param {Buffer} reason The reason for closing
	* @private
	*/
	function receiverOnConclude(code, reason) {
		const websocket = this[kWebSocket];
		websocket._closeFrameReceived = true;
		websocket._closeMessage = reason;
		websocket._closeCode = code;
		if (websocket._socket[kWebSocket] === void 0) return;
		websocket._socket.removeListener("data", socketOnData);
		process.nextTick(resume, websocket._socket);
		if (code === 1005) websocket.close();
		else websocket.close(code, reason);
	}
	/**
	* The listener of the `Receiver` `'drain'` event.
	*
	* @private
	*/
	function receiverOnDrain() {
		const websocket = this[kWebSocket];
		if (!websocket.isPaused) websocket._socket.resume();
	}
	/**
	* The listener of the `Receiver` `'error'` event.
	*
	* @param {(RangeError|Error)} err The emitted error
	* @private
	*/
	function receiverOnError(err) {
		const websocket = this[kWebSocket];
		if (websocket._socket[kWebSocket] !== void 0) {
			websocket._socket.removeListener("data", socketOnData);
			process.nextTick(resume, websocket._socket);
			websocket.close(err[kStatusCode]);
		}
		if (!websocket._errorEmitted) {
			websocket._errorEmitted = true;
			websocket.emit("error", err);
		}
	}
	/**
	* The listener of the `Receiver` `'finish'` event.
	*
	* @private
	*/
	function receiverOnFinish() {
		this[kWebSocket].emitClose();
	}
	/**
	* The listener of the `Receiver` `'message'` event.
	*
	* @param {Buffer|ArrayBuffer|Buffer[])} data The message
	* @param {Boolean} isBinary Specifies whether the message is binary or not
	* @private
	*/
	function receiverOnMessage(data, isBinary) {
		this[kWebSocket].emit("message", data, isBinary);
	}
	/**
	* The listener of the `Receiver` `'ping'` event.
	*
	* @param {Buffer} data The data included in the ping frame
	* @private
	*/
	function receiverOnPing(data) {
		const websocket = this[kWebSocket];
		if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
		websocket.emit("ping", data);
	}
	/**
	* The listener of the `Receiver` `'pong'` event.
	*
	* @param {Buffer} data The data included in the pong frame
	* @private
	*/
	function receiverOnPong(data) {
		this[kWebSocket].emit("pong", data);
	}
	/**
	* Resume a readable stream
	*
	* @param {Readable} stream The readable stream
	* @private
	*/
	function resume(stream) {
		stream.resume();
	}
	/**
	* The `Sender` error event handler.
	*
	* @param {Error} The error
	* @private
	*/
	function senderOnError(err) {
		const websocket = this[kWebSocket];
		if (websocket.readyState === WebSocket.CLOSED) return;
		if (websocket.readyState === WebSocket.OPEN) {
			websocket._readyState = WebSocket.CLOSING;
			setCloseTimer(websocket);
		}
		this._socket.end();
		if (!websocket._errorEmitted) {
			websocket._errorEmitted = true;
			websocket.emit("error", err);
		}
	}
	/**
	* Set a timer to destroy the underlying raw socket of a WebSocket.
	*
	* @param {WebSocket} websocket The WebSocket instance
	* @private
	*/
	function setCloseTimer(websocket) {
		websocket._closeTimer = setTimeout(websocket._socket.destroy.bind(websocket._socket), websocket._closeTimeout);
	}
	/**
	* The listener of the socket `'close'` event.
	*
	* @private
	*/
	function socketOnClose() {
		const websocket = this[kWebSocket];
		this.removeListener("close", socketOnClose);
		this.removeListener("data", socketOnData);
		this.removeListener("end", socketOnEnd);
		websocket._readyState = WebSocket.CLOSING;
		if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
			const chunk = this.read(this._readableState.length);
			websocket._receiver.write(chunk);
		}
		websocket._receiver.end();
		this[kWebSocket] = void 0;
		clearTimeout(websocket._closeTimer);
		if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) websocket.emitClose();
		else {
			websocket._receiver.on("error", receiverOnFinish);
			websocket._receiver.on("finish", receiverOnFinish);
		}
	}
	/**
	* The listener of the socket `'data'` event.
	*
	* @param {Buffer} chunk A chunk of data
	* @private
	*/
	function socketOnData(chunk) {
		if (!this[kWebSocket]._receiver.write(chunk)) this.pause();
	}
	/**
	* The listener of the socket `'end'` event.
	*
	* @private
	*/
	function socketOnEnd() {
		const websocket = this[kWebSocket];
		websocket._readyState = WebSocket.CLOSING;
		websocket._receiver.end();
		this.end();
	}
	/**
	* The listener of the socket `'error'` event.
	*
	* @private
	*/
	function socketOnError() {
		const websocket = this[kWebSocket];
		this.removeListener("error", socketOnError);
		this.on("error", NOOP);
		if (websocket) {
			websocket._readyState = WebSocket.CLOSING;
			this.destroy();
		}
	}
}));
//#endregion
//#region node_modules/ws/lib/stream.js
var require_stream = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	require_websocket();
	var { Duplex: Duplex$1 } = __require("stream");
	/**
	* Emits the `'close'` event on a stream.
	*
	* @param {Duplex} stream The stream.
	* @private
	*/
	function emitClose(stream) {
		stream.emit("close");
	}
	/**
	* The listener of the `'end'` event.
	*
	* @private
	*/
	function duplexOnEnd() {
		if (!this.destroyed && this._writableState.finished) this.destroy();
	}
	/**
	* The listener of the `'error'` event.
	*
	* @param {Error} err The error
	* @private
	*/
	function duplexOnError(err) {
		this.removeListener("error", duplexOnError);
		this.destroy();
		if (this.listenerCount("error") === 0) this.emit("error", err);
	}
	/**
	* Wraps a `WebSocket` in a duplex stream.
	*
	* @param {WebSocket} ws The `WebSocket` to wrap
	* @param {Object} [options] The options for the `Duplex` constructor
	* @return {Duplex} The duplex stream
	* @public
	*/
	function createWebSocketStream(ws, options) {
		let terminateOnDestroy = true;
		const duplex = new Duplex$1({
			...options,
			autoDestroy: false,
			emitClose: false,
			objectMode: false,
			writableObjectMode: false
		});
		ws.on("message", function message(msg, isBinary) {
			const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
			if (!duplex.push(data)) ws.pause();
		});
		ws.once("error", function error(err) {
			if (duplex.destroyed) return;
			terminateOnDestroy = false;
			duplex.destroy(err);
		});
		ws.once("close", function close() {
			if (duplex.destroyed) return;
			duplex.push(null);
		});
		duplex._destroy = function(err, callback) {
			if (ws.readyState === ws.CLOSED) {
				callback(err);
				process.nextTick(emitClose, duplex);
				return;
			}
			let called = false;
			ws.once("error", function error(err) {
				called = true;
				callback(err);
			});
			ws.once("close", function close() {
				if (!called) callback(err);
				process.nextTick(emitClose, duplex);
			});
			if (terminateOnDestroy) ws.terminate();
		};
		duplex._final = function(callback) {
			if (ws.readyState === ws.CONNECTING) {
				ws.once("open", function open() {
					duplex._final(callback);
				});
				return;
			}
			if (ws._socket === null) return;
			if (ws._socket._writableState.finished) {
				callback();
				if (duplex._readableState.endEmitted) duplex.destroy();
			} else {
				ws._socket.once("finish", function finish() {
					callback();
				});
				ws.close();
			}
		};
		duplex._read = function() {
			if (ws.isPaused) ws.resume();
		};
		duplex._write = function(chunk, encoding, callback) {
			if (ws.readyState === ws.CONNECTING) {
				ws.once("open", function open() {
					duplex._write(chunk, encoding, callback);
				});
				return;
			}
			ws.send(chunk, callback);
		};
		duplex.on("end", duplexOnEnd);
		duplex.on("error", duplexOnError);
		return duplex;
	}
	module.exports = createWebSocketStream;
}));
//#endregion
//#region node_modules/ws/lib/subprotocol.js
var require_subprotocol = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { tokenChars } = require_validation();
	/**
	* Parses the `Sec-WebSocket-Protocol` header into a set of subprotocol names.
	*
	* @param {String} header The field value of the header
	* @return {Set} The subprotocol names
	* @public
	*/
	function parse(header) {
		const protocols = /* @__PURE__ */ new Set();
		let start = -1;
		let end = -1;
		let i = 0;
		for (; i < header.length; i++) {
			const code = header.charCodeAt(i);
			if (end === -1 && tokenChars[code] === 1) {
				if (start === -1) start = i;
			} else if (i !== 0 && (code === 32 || code === 9)) {
				if (end === -1 && start !== -1) end = i;
			} else if (code === 44) {
				if (start === -1) throw new SyntaxError(`Unexpected character at index ${i}`);
				if (end === -1) end = i;
				const protocol = header.slice(start, end);
				if (protocols.has(protocol)) throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
				protocols.add(protocol);
				start = end = -1;
			} else throw new SyntaxError(`Unexpected character at index ${i}`);
		}
		if (start === -1 || end !== -1) throw new SyntaxError("Unexpected end of input");
		const protocol = header.slice(start, i);
		if (protocols.has(protocol)) throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
		protocols.add(protocol);
		return protocols;
	}
	module.exports = { parse };
}));
//#endregion
//#region node_modules/ws/lib/websocket-server.js
var require_websocket_server = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var EventEmitter = __require("events");
	var http = __require("http");
	var { Duplex } = __require("stream");
	var { createHash } = __require("crypto");
	var extension = require_extension();
	var PerMessageDeflate = require_permessage_deflate();
	var subprotocol = require_subprotocol();
	var WebSocket = require_websocket();
	var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
	var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
	var RUNNING = 0;
	var CLOSING = 1;
	var CLOSED = 2;
	/**
	* Class representing a WebSocket server.
	*
	* @extends EventEmitter
	*/
	var WebSocketServer = class extends EventEmitter {
		/**
		* Create a `WebSocketServer` instance.
		*
		* @param {Object} options Configuration options
		* @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
		*     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
		*     multiple times in the same tick
		* @param {Boolean} [options.autoPong=true] Specifies whether or not to
		*     automatically send a pong in response to a ping
		* @param {Number} [options.backlog=511] The maximum length of the queue of
		*     pending connections
		* @param {Boolean} [options.clientTracking=true] Specifies whether or not to
		*     track clients
		* @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
		*     wait for the closing handshake to finish after `websocket.close()` is
		*     called
		* @param {Function} [options.handleProtocols] A hook to handle protocols
		* @param {String} [options.host] The hostname where to bind the server
		* @param {Number} [options.maxBufferedChunks=262144] The maximum number of
		*     buffered data chunks
		* @param {Number} [options.maxFragments=16384] The maximum number of message
		*     fragments
		* @param {Number} [options.maxPayload=104857600] The maximum allowed message
		*     size
		* @param {Boolean} [options.noServer=false] Enable no server mode
		* @param {String} [options.path] Accept only connections matching this path
		* @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
		*     permessage-deflate
		* @param {Number} [options.port] The port where to bind the server
		* @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
		*     server to use
		* @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
		*     not to skip UTF-8 validation for text and close messages
		* @param {Function} [options.verifyClient] A hook to reject connections
		* @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
		*     class to use. It must be the `WebSocket` class or class that extends it
		* @param {Function} [callback] A listener for the `listening` event
		*/
		constructor(options, callback) {
			super();
			options = {
				allowSynchronousEvents: true,
				autoPong: true,
				maxBufferedChunks: 262144,
				maxFragments: 16384,
				maxPayload: 104857600,
				skipUTF8Validation: false,
				perMessageDeflate: false,
				handleProtocols: null,
				clientTracking: true,
				closeTimeout: CLOSE_TIMEOUT,
				verifyClient: null,
				noServer: false,
				backlog: null,
				server: null,
				host: null,
				path: null,
				port: null,
				WebSocket,
				...options
			};
			if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) throw new TypeError("One and only one of the \"port\", \"server\", or \"noServer\" options must be specified");
			if (options.port != null) {
				this._server = http.createServer((req, res) => {
					const body = http.STATUS_CODES[426];
					res.writeHead(426, {
						"Content-Length": body.length,
						"Content-Type": "text/plain"
					});
					res.end(body);
				});
				this._server.listen(options.port, options.host, options.backlog, callback);
			} else if (options.server) this._server = options.server;
			if (this._server) {
				const emitConnection = this.emit.bind(this, "connection");
				this._removeListeners = addListeners(this._server, {
					listening: this.emit.bind(this, "listening"),
					error: this.emit.bind(this, "error"),
					upgrade: (req, socket, head) => {
						this.handleUpgrade(req, socket, head, emitConnection);
					}
				});
			}
			if (options.perMessageDeflate === true) options.perMessageDeflate = {};
			if (options.clientTracking) {
				this.clients = /* @__PURE__ */ new Set();
				this._shouldEmitClose = false;
			}
			this.options = options;
			this._state = RUNNING;
		}
		/**
		* Returns the bound address, the address family name, and port of the server
		* as reported by the operating system if listening on an IP socket.
		* If the server is listening on a pipe or UNIX domain socket, the name is
		* returned as a string.
		*
		* @return {(Object|String|null)} The address of the server
		* @public
		*/
		address() {
			if (this.options.noServer) throw new Error("The server is operating in \"noServer\" mode");
			if (!this._server) return null;
			return this._server.address();
		}
		/**
		* Stop the server from accepting new connections and emit the `'close'` event
		* when all existing connections are closed.
		*
		* @param {Function} [cb] A one-time listener for the `'close'` event
		* @public
		*/
		close(cb) {
			if (this._state === CLOSED) {
				if (cb) this.once("close", () => {
					cb(/* @__PURE__ */ new Error("The server is not running"));
				});
				process.nextTick(emitClose, this);
				return;
			}
			if (cb) this.once("close", cb);
			if (this._state === CLOSING) return;
			this._state = CLOSING;
			if (this.options.noServer || this.options.server) {
				if (this._server) {
					this._removeListeners();
					this._removeListeners = this._server = null;
				}
				if (this.clients) {
					if (!this.clients.size) process.nextTick(emitClose, this);
					else this._shouldEmitClose = true;
				} else process.nextTick(emitClose, this);
			} else {
				const server = this._server;
				this._removeListeners();
				this._removeListeners = this._server = null;
				server.close(() => {
					emitClose(this);
				});
			}
		}
		/**
		* See if a given request should be handled by this server instance.
		*
		* @param {http.IncomingMessage} req Request object to inspect
		* @return {Boolean} `true` if the request is valid, else `false`
		* @public
		*/
		shouldHandle(req) {
			if (this.options.path) {
				const index = req.url.indexOf("?");
				if ((index !== -1 ? req.url.slice(0, index) : req.url) !== this.options.path) return false;
			}
			return true;
		}
		/**
		* Handle a HTTP Upgrade request.
		*
		* @param {http.IncomingMessage} req The request object
		* @param {Duplex} socket The network socket between the server and client
		* @param {Buffer} head The first packet of the upgraded stream
		* @param {Function} cb Callback
		* @public
		*/
		handleUpgrade(req, socket, head, cb) {
			socket.on("error", socketOnError);
			const key = req.headers["sec-websocket-key"];
			const upgrade = req.headers.upgrade;
			const version = +req.headers["sec-websocket-version"];
			if (req.method !== "GET") {
				abortHandshakeOrEmitwsClientError(this, req, socket, 405, "Invalid HTTP method");
				return;
			}
			if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
				abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Invalid Upgrade header");
				return;
			}
			if (key === void 0 || !keyRegex.test(key)) {
				abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Missing or invalid Sec-WebSocket-Key header");
				return;
			}
			if (version !== 13 && version !== 8) {
				abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Missing or invalid Sec-WebSocket-Version header", { "Sec-WebSocket-Version": "13, 8" });
				return;
			}
			if (!this.shouldHandle(req)) {
				abortHandshake(socket, 400);
				return;
			}
			const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
			let protocols = /* @__PURE__ */ new Set();
			if (secWebSocketProtocol !== void 0) try {
				protocols = subprotocol.parse(secWebSocketProtocol);
			} catch (err) {
				abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Invalid Sec-WebSocket-Protocol header");
				return;
			}
			const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
			const extensions = {};
			if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
				const perMessageDeflate = new PerMessageDeflate({
					...this.options.perMessageDeflate,
					isServer: true,
					maxPayload: this.options.maxPayload
				});
				try {
					const offers = extension.parse(secWebSocketExtensions);
					if (offers[PerMessageDeflate.extensionName]) {
						perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
						extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
					}
				} catch (err) {
					abortHandshakeOrEmitwsClientError(this, req, socket, 400, "Invalid or unacceptable Sec-WebSocket-Extensions header");
					return;
				}
			}
			if (this.options.verifyClient) {
				const info = {
					origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
					secure: !!(req.socket.authorized || req.socket.encrypted),
					req
				};
				if (this.options.verifyClient.length === 2) {
					this.options.verifyClient(info, (verified, code, message, headers) => {
						if (!verified) return abortHandshake(socket, code || 401, message, headers);
						this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
					});
					return;
				}
				if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
			}
			this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
		}
		/**
		* Upgrade the connection to WebSocket.
		*
		* @param {Object} extensions The accepted extensions
		* @param {String} key The value of the `Sec-WebSocket-Key` header
		* @param {Set} protocols The subprotocols
		* @param {http.IncomingMessage} req The request object
		* @param {Duplex} socket The network socket between the server and client
		* @param {Buffer} head The first packet of the upgraded stream
		* @param {Function} cb Callback
		* @throws {Error} If called more than once with the same socket
		* @private
		*/
		completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
			if (!socket.readable || !socket.writable) return socket.destroy();
			if (socket[kWebSocket]) throw new Error("server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration");
			if (this._state > RUNNING) return abortHandshake(socket, 503);
			const headers = [
				"HTTP/1.1 101 Switching Protocols",
				"Upgrade: websocket",
				"Connection: Upgrade",
				`Sec-WebSocket-Accept: ${createHash("sha1").update(key + GUID).digest("base64")}`
			];
			const ws = new this.options.WebSocket(null, void 0, this.options);
			if (protocols.size) {
				const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
				if (protocol) {
					headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
					ws._protocol = protocol;
				}
			}
			if (extensions[PerMessageDeflate.extensionName]) {
				const params = extensions[PerMessageDeflate.extensionName].params;
				const value = extension.format({ [PerMessageDeflate.extensionName]: [params] });
				headers.push(`Sec-WebSocket-Extensions: ${value}`);
				ws._extensions = extensions;
			}
			this.emit("headers", headers, req);
			socket.write(headers.concat("\r\n").join("\r\n"));
			socket.removeListener("error", socketOnError);
			ws.setSocket(socket, head, {
				allowSynchronousEvents: this.options.allowSynchronousEvents,
				maxBufferedChunks: this.options.maxBufferedChunks,
				maxFragments: this.options.maxFragments,
				maxPayload: this.options.maxPayload,
				skipUTF8Validation: this.options.skipUTF8Validation
			});
			if (this.clients) {
				this.clients.add(ws);
				ws.on("close", () => {
					this.clients.delete(ws);
					if (this._shouldEmitClose && !this.clients.size) process.nextTick(emitClose, this);
				});
			}
			cb(ws, req);
		}
	};
	module.exports = WebSocketServer;
	/**
	* Add event listeners on an `EventEmitter` using a map of <event, listener>
	* pairs.
	*
	* @param {EventEmitter} server The event emitter
	* @param {Object.<String, Function>} map The listeners to add
	* @return {Function} A function that will remove the added listeners when
	*     called
	* @private
	*/
	function addListeners(server, map) {
		for (const event of Object.keys(map)) server.on(event, map[event]);
		return function removeListeners() {
			for (const event of Object.keys(map)) server.removeListener(event, map[event]);
		};
	}
	/**
	* Emit a `'close'` event on an `EventEmitter`.
	*
	* @param {EventEmitter} server The event emitter
	* @private
	*/
	function emitClose(server) {
		server._state = CLOSED;
		server.emit("close");
	}
	/**
	* Handle socket errors.
	*
	* @private
	*/
	function socketOnError() {
		this.destroy();
	}
	/**
	* Close the connection when preconditions are not fulfilled.
	*
	* @param {Duplex} socket The socket of the upgrade request
	* @param {Number} code The HTTP response status code
	* @param {String} [message] The HTTP response body
	* @param {Object} [headers] Additional HTTP response headers
	* @private
	*/
	function abortHandshake(socket, code, message, headers) {
		message = message || http.STATUS_CODES[code];
		headers = {
			Connection: "close",
			"Content-Type": "text/html",
			"Content-Length": Buffer.byteLength(message),
			...headers
		};
		socket.once("finish", socket.destroy);
		socket.end(`HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message);
	}
	/**
	* Emit a `'wsClientError'` event on a `WebSocketServer` if there is at least
	* one listener for it, otherwise call `abortHandshake()`.
	*
	* @param {WebSocketServer} server The WebSocket server
	* @param {http.IncomingMessage} req The request object
	* @param {Duplex} socket The socket of the upgrade request
	* @param {Number} code The HTTP response status code
	* @param {String} message The HTTP response body
	* @param {Object} [headers] The HTTP response headers
	* @private
	*/
	function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
		if (server.listenerCount("wsClientError")) {
			const err = new Error(message);
			Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
			server.emit("wsClientError", err, socket, req);
		} else abortHandshake(socket, code, message, headers);
	}
}));
require_stream();
require_extension();
require_permessage_deflate();
require_receiver();
require_sender();
require_subprotocol();
var import_websocket = /* @__PURE__ */ __toESM(require_websocket(), 1);
require_websocket_server();
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/client.js
/** A client for the Hrana protocol (a "database connection pool"). */
var Client = class {
	/** @private */
	constructor() {
		this.intMode = "number";
	}
	/** Representation of integers returned from the database. See {@link IntMode}.
	*
	* This value is inherited by {@link Stream} objects created with {@link openStream}, but you can
	* override the integer mode for every stream by setting {@link Stream.intMode} on the stream.
	*/
	intMode;
};
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/errors.js
/** Generic error produced by the Hrana client. */
var ClientError = class extends Error {
	/** @private */
	constructor(message) {
		super(message);
		this.name = "ClientError";
	}
};
/** Error thrown when the server violates the protocol. */
var ProtoError = class extends ClientError {
	/** @private */
	constructor(message) {
		super(message);
		this.name = "ProtoError";
	}
};
/** Error thrown when the server returns an error response. */
var ResponseError = class extends ClientError {
	code;
	/** @internal */
	proto;
	/** @private */
	constructor(message, protoError) {
		super(message);
		this.name = "ResponseError";
		this.code = protoError.code;
		this.proto = protoError;
		this.stack = void 0;
	}
};
/** Error thrown when the client or stream is closed. */
var ClosedError = class extends ClientError {
	/** @private */
	constructor(message, cause) {
		if (cause !== void 0) {
			super(`${message}: ${cause}`);
			this.cause = cause;
		} else super(message);
		this.name = "ClosedError";
	}
};
/** Error thrown when the environment does not seem to support WebSockets. */
var WebSocketUnsupportedError = class extends ClientError {
	/** @private */
	constructor(message) {
		super(message);
		this.name = "WebSocketUnsupportedError";
	}
};
/** Error thrown when we encounter a WebSocket error. */
var WebSocketError = class extends ClientError {
	/** @private */
	constructor(message) {
		super(message);
		this.name = "WebSocketError";
	}
};
/** Error thrown when the HTTP server returns an error response. */
var HttpServerError = class extends ClientError {
	status;
	/** @private */
	constructor(message, status) {
		super(message);
		this.status = status;
		this.name = "HttpServerError";
	}
};
/** Error thrown when the protocol version is too low to support a feature. */
var ProtocolVersionError = class extends ClientError {
	/** @private */
	constructor(message) {
		super(message);
		this.name = "ProtocolVersionError";
	}
};
/** Error thrown when an internal client error happens. */
var InternalError = class extends ClientError {
	/** @private */
	constructor(message) {
		super(message);
		this.name = "InternalError";
	}
};
/** Error thrown when the API is misused. */
var MisuseError = class extends ClientError {
	/** @private */
	constructor(message) {
		super(message);
		this.name = "MisuseError";
	}
};
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/encoding/json/decode.js
function string(value) {
	if (typeof value === "string") return value;
	throw typeError(value, "string");
}
function stringOpt(value) {
	if (value === null || value === void 0) return;
	else if (typeof value === "string") return value;
	throw typeError(value, "string or null");
}
function number(value) {
	if (typeof value === "number") return value;
	throw typeError(value, "number");
}
function boolean(value) {
	if (typeof value === "boolean") return value;
	throw typeError(value, "boolean");
}
function array(value) {
	if (Array.isArray(value)) return value;
	throw typeError(value, "array");
}
function object(value) {
	if (value !== null && typeof value === "object" && !Array.isArray(value)) return value;
	throw typeError(value, "object");
}
function arrayObjectsMap(value, fun) {
	return array(value).map((elemValue) => fun(object(elemValue)));
}
function typeError(value, expected) {
	if (value === void 0) return new ProtoError(`Expected ${expected}, but the property was missing`);
	let received = typeof value;
	if (value === null) received = "null";
	else if (Array.isArray(value)) received = "array";
	return new ProtoError(`Expected ${expected}, received ${received}`);
}
function readJsonObject(value, fun) {
	return fun(object(value));
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/encoding/json/encode.js
var ObjectWriter = class {
	#output;
	#isFirst;
	constructor(output) {
		this.#output = output;
		this.#isFirst = false;
	}
	begin() {
		this.#output.push("{");
		this.#isFirst = true;
	}
	end() {
		this.#output.push("}");
		this.#isFirst = false;
	}
	#key(name) {
		if (this.#isFirst) {
			this.#output.push("\"");
			this.#isFirst = false;
		} else this.#output.push(",\"");
		this.#output.push(name);
		this.#output.push("\":");
	}
	string(name, value) {
		this.#key(name);
		this.#output.push(JSON.stringify(value));
	}
	stringRaw(name, value) {
		this.#key(name);
		this.#output.push("\"");
		this.#output.push(value);
		this.#output.push("\"");
	}
	number(name, value) {
		this.#key(name);
		this.#output.push("" + value);
	}
	boolean(name, value) {
		this.#key(name);
		this.#output.push(value ? "true" : "false");
	}
	object(name, value, valueFun) {
		this.#key(name);
		this.begin();
		valueFun(this, value);
		this.end();
	}
	arrayObjects(name, values, valueFun) {
		this.#key(name);
		this.#output.push("[");
		for (let i = 0; i < values.length; ++i) {
			if (i !== 0) this.#output.push(",");
			this.begin();
			valueFun(this, values[i]);
			this.end();
		}
		this.#output.push("]");
	}
};
function writeJsonObject(value, fun) {
	const output = [];
	const writer = new ObjectWriter(output);
	writer.begin();
	fun(writer, value);
	writer.end();
	return output.join("");
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/decode.js
var MessageReader = class {
	#array;
	#view;
	#pos;
	constructor(array) {
		this.#array = array;
		this.#view = new DataView(array.buffer, array.byteOffset, array.byteLength);
		this.#pos = 0;
	}
	varint() {
		let value = 0;
		for (let shift = 0;; shift += 7) {
			const byte = this.#array[this.#pos++];
			value |= (byte & 127) << shift;
			if (!(byte & 128)) break;
		}
		return value;
	}
	varintBig() {
		let value = 0n;
		for (let shift = 0n;; shift += 7n) {
			const byte = this.#array[this.#pos++];
			value |= BigInt(byte & 127) << shift;
			if (!(byte & 128)) break;
		}
		return value;
	}
	bytes(length) {
		const array = new Uint8Array(this.#array.buffer, this.#array.byteOffset + this.#pos, length);
		this.#pos += length;
		return array;
	}
	double() {
		const value = this.#view.getFloat64(this.#pos, true);
		this.#pos += 8;
		return value;
	}
	skipVarint() {
		for (;;) if (!(this.#array[this.#pos++] & 128)) break;
	}
	skip(count) {
		this.#pos += count;
	}
	eof() {
		return this.#pos >= this.#array.byteLength;
	}
};
var FieldReader = class {
	#reader;
	#wireType;
	constructor(reader) {
		this.#reader = reader;
		this.#wireType = -1;
	}
	setup(wireType) {
		this.#wireType = wireType;
	}
	#expect(expectedWireType) {
		if (this.#wireType !== expectedWireType) throw new ProtoError(`Expected wire type ${expectedWireType}, got ${this.#wireType}`);
		this.#wireType = -1;
	}
	bytes() {
		this.#expect(2);
		const length = this.#reader.varint();
		return this.#reader.bytes(length);
	}
	string() {
		return new TextDecoder().decode(this.bytes());
	}
	message(def) {
		return readProtobufMessage(this.bytes(), def);
	}
	int32() {
		this.#expect(0);
		return this.#reader.varint();
	}
	uint32() {
		return this.int32();
	}
	bool() {
		return this.int32() !== 0;
	}
	uint64() {
		this.#expect(0);
		return this.#reader.varintBig();
	}
	sint64() {
		const value = this.uint64();
		return value >> 1n ^ -(value & 1n);
	}
	double() {
		this.#expect(1);
		return this.#reader.double();
	}
	maybeSkip() {
		if (this.#wireType < 0) return;
		else if (this.#wireType === 0) this.#reader.skipVarint();
		else if (this.#wireType === 1) this.#reader.skip(8);
		else if (this.#wireType === 2) {
			const length = this.#reader.varint();
			this.#reader.skip(length);
		} else if (this.#wireType === 5) this.#reader.skip(4);
		else throw new ProtoError(`Unexpected wire type ${this.#wireType}`);
		this.#wireType = -1;
	}
};
function readProtobufMessage(data, def) {
	const msgReader = new MessageReader(data);
	const fieldReader = new FieldReader(msgReader);
	let value = def.default();
	while (!msgReader.eof()) {
		const key = msgReader.varint();
		const tag = key >> 3;
		const wireType = key & 7;
		fieldReader.setup(wireType);
		const tagFun = def[tag];
		if (tagFun !== void 0) {
			const returnedValue = tagFun(fieldReader, value);
			if (returnedValue !== void 0) value = returnedValue;
		}
		fieldReader.maybeSkip();
	}
	return value;
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/encode.js
var MessageWriter = class MessageWriter {
	#buf;
	#array;
	#view;
	#pos;
	constructor() {
		this.#buf = /* @__PURE__ */ new ArrayBuffer(256);
		this.#array = new Uint8Array(this.#buf);
		this.#view = new DataView(this.#buf);
		this.#pos = 0;
	}
	#ensure(extra) {
		if (this.#pos + extra <= this.#buf.byteLength) return;
		let newCap = this.#buf.byteLength;
		while (newCap < this.#pos + extra) newCap *= 2;
		const newBuf = new ArrayBuffer(newCap);
		const newArray = new Uint8Array(newBuf);
		const newView = new DataView(newBuf);
		newArray.set(new Uint8Array(this.#buf, 0, this.#pos));
		this.#buf = newBuf;
		this.#array = newArray;
		this.#view = newView;
	}
	#varint(value) {
		this.#ensure(5);
		value = 0 | value;
		do {
			let byte = value & 127;
			value >>>= 7;
			byte |= value ? 128 : 0;
			this.#array[this.#pos++] = byte;
		} while (value);
	}
	#varintBig(value) {
		this.#ensure(10);
		value = value & 18446744073709551615n;
		do {
			let byte = Number(value & 127n);
			value >>= 7n;
			byte |= value ? 128 : 0;
			this.#array[this.#pos++] = byte;
		} while (value);
	}
	#tag(tag, wireType) {
		this.#varint(tag << 3 | wireType);
	}
	bytes(tag, value) {
		this.#tag(tag, 2);
		this.#varint(value.byteLength);
		this.#ensure(value.byteLength);
		this.#array.set(value, this.#pos);
		this.#pos += value.byteLength;
	}
	string(tag, value) {
		this.bytes(tag, new TextEncoder().encode(value));
	}
	message(tag, value, fun) {
		const writer = new MessageWriter();
		fun(writer, value);
		this.bytes(tag, writer.data());
	}
	int32(tag, value) {
		this.#tag(tag, 0);
		this.#varint(value);
	}
	uint32(tag, value) {
		this.int32(tag, value);
	}
	bool(tag, value) {
		this.int32(tag, value ? 1 : 0);
	}
	sint64(tag, value) {
		this.#tag(tag, 0);
		this.#varintBig(value << 1n ^ value >> 63n);
	}
	double(tag, value) {
		this.#tag(tag, 1);
		this.#ensure(8);
		this.#view.setFloat64(this.#pos, value, true);
		this.#pos += 8;
	}
	data() {
		return new Uint8Array(this.#buf, 0, this.#pos);
	}
};
function writeProtobufMessage(value, fun) {
	const w = new MessageWriter();
	fun(w, value);
	return w.data();
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/id_alloc.js
var IdAlloc = class {
	#usedIds;
	#freeIds;
	constructor() {
		this.#usedIds = /* @__PURE__ */ new Set();
		this.#freeIds = /* @__PURE__ */ new Set();
	}
	alloc() {
		for (const freeId of this.#freeIds) {
			this.#freeIds.delete(freeId);
			this.#usedIds.add(freeId);
			if (!this.#usedIds.has(this.#usedIds.size - 1)) this.#freeIds.add(this.#usedIds.size - 1);
			return freeId;
		}
		const freeId = this.#usedIds.size;
		this.#usedIds.add(freeId);
		return freeId;
	}
	free(id) {
		if (!this.#usedIds.delete(id)) throw new InternalError("Freeing an id that is not allocated");
		this.#freeIds.delete(this.#usedIds.size);
		if (id < this.#usedIds.size) this.#freeIds.add(id);
	}
};
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/util.js
function impossible(value, message) {
	throw new InternalError(message);
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/value.js
function valueToProto(value) {
	if (value === null) return null;
	else if (typeof value === "string") return value;
	else if (typeof value === "number") {
		if (!Number.isFinite(value)) throw new RangeError("Only finite numbers (not Infinity or NaN) can be passed as arguments");
		return value;
	} else if (typeof value === "bigint") {
		if (value < minInteger || value > maxInteger) throw new RangeError("This bigint value is too large to be represented as a 64-bit integer and passed as argument");
		return value;
	} else if (typeof value === "boolean") return value ? 1n : 0n;
	else if (value instanceof ArrayBuffer) return new Uint8Array(value);
	else if (value instanceof Uint8Array) return value;
	else if (value instanceof Date) return +value.valueOf();
	else if (typeof value === "object") return "" + value.toString();
	else throw new TypeError("Unsupported type of value");
}
var minInteger = -9223372036854775808n;
var maxInteger = 9223372036854775807n;
function valueFromProto(value, intMode) {
	if (value === null) return null;
	else if (typeof value === "number") return value;
	else if (typeof value === "string") return value;
	else if (typeof value === "bigint") {
		if (intMode === "number") {
			const num = Number(value);
			if (!Number.isSafeInteger(num)) throw new RangeError("Received integer which is too large to be safely represented as a JavaScript number");
			return num;
		} else if (intMode === "bigint") return value;
		else if (intMode === "string") return "" + value;
		else throw new MisuseError("Invalid value for IntMode");
	} else if (value instanceof Uint8Array) return value.slice().buffer;
	else if (value === void 0) throw new ProtoError("Received unrecognized type of Value");
	else throw impossible(value, "Impossible type of Value");
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/result.js
function stmtResultFromProto(result) {
	return {
		affectedRowCount: result.affectedRowCount,
		lastInsertRowid: result.lastInsertRowid,
		columnNames: result.cols.map((col) => col.name),
		columnDecltypes: result.cols.map((col) => col.decltype)
	};
}
function rowsResultFromProto(result, intMode) {
	const stmtResult = stmtResultFromProto(result);
	const rows = result.rows.map((row) => rowFromProto(stmtResult.columnNames, row, intMode));
	return {
		...stmtResult,
		rows
	};
}
function rowResultFromProto(result, intMode) {
	const stmtResult = stmtResultFromProto(result);
	let row;
	if (result.rows.length > 0) row = rowFromProto(stmtResult.columnNames, result.rows[0], intMode);
	return {
		...stmtResult,
		row
	};
}
function valueResultFromProto(result, intMode) {
	const stmtResult = stmtResultFromProto(result);
	let value;
	if (result.rows.length > 0 && stmtResult.columnNames.length > 0) value = valueFromProto(result.rows[0][0], intMode);
	return {
		...stmtResult,
		value
	};
}
function rowFromProto(colNames, values, intMode) {
	const row = {};
	Object.defineProperty(row, "length", { value: values.length });
	for (let i = 0; i < values.length; ++i) {
		const value = valueFromProto(values[i], intMode);
		Object.defineProperty(row, i, { value });
		const colName = colNames[i];
		if (colName !== void 0 && !Object.hasOwn(row, colName)) Object.defineProperty(row, colName, {
			value,
			enumerable: true,
			configurable: true,
			writable: true
		});
	}
	return row;
}
function errorFromProto(error) {
	return new ResponseError(error.message, error);
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/sql.js
/** Text of an SQL statement cached on the server. */
var Sql = class {
	#owner;
	#sqlId;
	#closed;
	/** @private */
	constructor(owner, sqlId) {
		this.#owner = owner;
		this.#sqlId = sqlId;
		this.#closed = void 0;
	}
	/** @private */
	_getSqlId(owner) {
		if (this.#owner !== owner) throw new MisuseError("Attempted to use SQL text opened with other object");
		else if (this.#closed !== void 0) throw new ClosedError("SQL text is closed", this.#closed);
		return this.#sqlId;
	}
	/** Remove the SQL text from the server, releasing resouces. */
	close() {
		this._setClosed(new ClientError("SQL text was manually closed"));
	}
	/** @private */
	_setClosed(error) {
		if (this.#closed === void 0) {
			this.#closed = error;
			this.#owner._closeSql(this.#sqlId);
		}
	}
	/** True if the SQL text is closed (removed from the server). */
	get closed() {
		return this.#closed !== void 0;
	}
};
function sqlToProto(owner, sql) {
	if (sql instanceof Sql) return { sqlId: sql._getSqlId(owner) };
	else return { sql: "" + sql };
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/queue.js
var Queue = class {
	#pushStack;
	#shiftStack;
	constructor() {
		this.#pushStack = [];
		this.#shiftStack = [];
	}
	get length() {
		return this.#pushStack.length + this.#shiftStack.length;
	}
	push(elem) {
		this.#pushStack.push(elem);
	}
	shift() {
		if (this.#shiftStack.length === 0 && this.#pushStack.length > 0) {
			this.#shiftStack = this.#pushStack.reverse();
			this.#pushStack = [];
		}
		return this.#shiftStack.pop();
	}
	first() {
		return this.#shiftStack.length !== 0 ? this.#shiftStack[this.#shiftStack.length - 1] : this.#pushStack[0];
	}
};
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/stmt.js
/** A statement that can be evaluated by the database. Besides the SQL text, it also contains the positional
* and named arguments. */
var Stmt$2 = class {
	/** The SQL statement text. */
	sql;
	/** @private */
	_args;
	/** @private */
	_namedArgs;
	/** Initialize the statement with given SQL text. */
	constructor(sql) {
		this.sql = sql;
		this._args = [];
		this._namedArgs = /* @__PURE__ */ new Map();
	}
	/** Binds positional parameters from the given `values`. All previous positional bindings are cleared. */
	bindIndexes(values) {
		this._args.length = 0;
		for (const value of values) this._args.push(valueToProto(value));
		return this;
	}
	/** Binds a parameter by a 1-based index. */
	bindIndex(index, value) {
		if (index !== (index | 0) || index <= 0) throw new RangeError("Index of a positional argument must be positive integer");
		while (this._args.length < index) this._args.push(null);
		this._args[index - 1] = valueToProto(value);
		return this;
	}
	/** Binds a parameter by name. */
	bindName(name, value) {
		this._namedArgs.set(name, valueToProto(value));
		return this;
	}
	/** Clears all bindings. */
	unbindAll() {
		this._args.length = 0;
		this._namedArgs.clear();
		return this;
	}
};
function stmtToProto(sqlOwner, stmt, wantRows) {
	let inSql;
	let args = [];
	let namedArgs = [];
	if (stmt instanceof Stmt$2) {
		inSql = stmt.sql;
		args = stmt._args;
		for (const [name, value] of stmt._namedArgs.entries()) namedArgs.push({
			name,
			value
		});
	} else if (Array.isArray(stmt)) {
		inSql = stmt[0];
		if (Array.isArray(stmt[1])) args = stmt[1].map((arg) => valueToProto(arg));
		else namedArgs = Object.entries(stmt[1]).map(([name, value]) => {
			return {
				name,
				value: valueToProto(value)
			};
		});
	} else inSql = stmt;
	const { sql, sqlId } = sqlToProto(sqlOwner, inSql);
	return {
		sql,
		sqlId,
		args,
		namedArgs,
		wantRows
	};
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/batch.js
/** A builder for creating a batch and executing it on the server. */
var Batch$2 = class {
	/** @private */
	_stream;
	#useCursor;
	/** @private */
	_steps;
	#executed;
	/** @private */
	constructor(stream, useCursor) {
		this._stream = stream;
		this.#useCursor = useCursor;
		this._steps = [];
		this.#executed = false;
	}
	/** Return a builder for adding a step to the batch. */
	step() {
		return new BatchStep$2(this);
	}
	/** Execute the batch. */
	execute() {
		if (this.#executed) throw new MisuseError("This batch has already been executed");
		this.#executed = true;
		const batch = { steps: this._steps.map((step) => step.proto) };
		if (this.#useCursor) return executeCursor(this._stream, this._steps, batch);
		else return executeRegular(this._stream, this._steps, batch);
	}
};
function executeRegular(stream, steps, batch) {
	return stream._batch(batch).then((result) => {
		for (let step = 0; step < steps.length; ++step) {
			const stepResult = result.stepResults.get(step);
			const stepError = result.stepErrors.get(step);
			steps[step].callback(stepResult, stepError);
		}
	});
}
async function executeCursor(stream, steps, batch) {
	const cursor = await stream._openCursor(batch);
	try {
		let nextStep = 0;
		let beginEntry = void 0;
		let rows = [];
		for (;;) {
			const entry = await cursor.next();
			if (entry === void 0) break;
			if (entry.type === "step_begin") {
				if (entry.step < nextStep || entry.step >= steps.length) throw new ProtoError("Server produced StepBeginEntry for unexpected step");
				else if (beginEntry !== void 0) throw new ProtoError("Server produced StepBeginEntry before terminating previous step");
				for (let step = nextStep; step < entry.step; ++step) steps[step].callback(void 0, void 0);
				nextStep = entry.step + 1;
				beginEntry = entry;
				rows = [];
			} else if (entry.type === "step_end") {
				if (beginEntry === void 0) throw new ProtoError("Server produced StepEndEntry but no step is active");
				const stmtResult = {
					cols: beginEntry.cols,
					rows,
					affectedRowCount: entry.affectedRowCount,
					lastInsertRowid: entry.lastInsertRowid
				};
				steps[beginEntry.step].callback(stmtResult, void 0);
				beginEntry = void 0;
				rows = [];
			} else if (entry.type === "step_error") {
				if (beginEntry === void 0) {
					if (entry.step >= steps.length) throw new ProtoError("Server produced StepErrorEntry for unexpected step");
					for (let step = nextStep; step < entry.step; ++step) steps[step].callback(void 0, void 0);
				} else {
					if (entry.step !== beginEntry.step) throw new ProtoError("Server produced StepErrorEntry for unexpected step");
					beginEntry = void 0;
					rows = [];
				}
				steps[entry.step].callback(void 0, entry.error);
				nextStep = entry.step + 1;
			} else if (entry.type === "row") {
				if (beginEntry === void 0) throw new ProtoError("Server produced RowEntry but no step is active");
				rows.push(entry.row);
			} else if (entry.type === "error") throw errorFromProto(entry.error);
			else if (entry.type === "none") throw new ProtoError("Server produced unrecognized CursorEntry");
			else throw impossible(entry, "Impossible CursorEntry");
		}
		if (beginEntry !== void 0) throw new ProtoError("Server closed Cursor before terminating active step");
		for (let step = nextStep; step < steps.length; ++step) steps[step].callback(void 0, void 0);
	} finally {
		cursor.close();
	}
}
/** A builder for adding a step to the batch. */
var BatchStep$2 = class {
	/** @private */
	_batch;
	#conds;
	/** @private */
	_index;
	/** @private */
	constructor(batch) {
		this._batch = batch;
		this.#conds = [];
		this._index = void 0;
	}
	/** Add the condition that needs to be satisfied to execute the statement. If you use this method multiple
	* times, we join the conditions with a logical AND. */
	condition(cond) {
		this.#conds.push(cond._proto);
		return this;
	}
	/** Add a statement that returns rows. */
	query(stmt) {
		return this.#add(stmt, true, rowsResultFromProto);
	}
	/** Add a statement that returns at most a single row. */
	queryRow(stmt) {
		return this.#add(stmt, true, rowResultFromProto);
	}
	/** Add a statement that returns at most a single value. */
	queryValue(stmt) {
		return this.#add(stmt, true, valueResultFromProto);
	}
	/** Add a statement without returning rows. */
	run(stmt) {
		return this.#add(stmt, false, stmtResultFromProto);
	}
	#add(inStmt, wantRows, fromProto) {
		if (this._index !== void 0) throw new MisuseError("This BatchStep has already been added to the batch");
		const stmt = stmtToProto(this._batch._stream._sqlOwner(), inStmt, wantRows);
		let condition;
		if (this.#conds.length === 0) condition = void 0;
		else if (this.#conds.length === 1) condition = this.#conds[0];
		else condition = {
			type: "and",
			conds: this.#conds.slice()
		};
		const proto = {
			stmt,
			condition
		};
		return new Promise((outputCallback, errorCallback) => {
			const callback = (stepResult, stepError) => {
				if (stepResult !== void 0 && stepError !== void 0) errorCallback(new ProtoError("Server returned both result and error"));
				else if (stepError !== void 0) errorCallback(errorFromProto(stepError));
				else if (stepResult !== void 0) outputCallback(fromProto(stepResult, this._batch._stream.intMode));
				else outputCallback(void 0);
			};
			this._index = this._batch._steps.length;
			this._batch._steps.push({
				proto,
				callback
			});
		});
	}
};
var BatchCond$2 = class BatchCond$2 {
	/** @private */
	_batch;
	/** @private */
	_proto;
	/** @private */
	constructor(batch, proto) {
		this._batch = batch;
		this._proto = proto;
	}
	/** Create a condition that evaluates to true when the given step executes successfully.
	*
	* If the given step fails error or is skipped because its condition evaluated to false, this
	* condition evaluates to false.
	*/
	static ok(step) {
		return new BatchCond$2(step._batch, {
			type: "ok",
			step: stepIndex(step)
		});
	}
	/** Create a condition that evaluates to true when the given step fails.
	*
	* If the given step succeeds or is skipped because its condition evaluated to false, this condition
	* evaluates to false.
	*/
	static error(step) {
		return new BatchCond$2(step._batch, {
			type: "error",
			step: stepIndex(step)
		});
	}
	/** Create a condition that is a logical negation of another condition.
	*/
	static not(cond) {
		return new BatchCond$2(cond._batch, {
			type: "not",
			cond: cond._proto
		});
	}
	/** Create a condition that is a logical AND of other conditions.
	*/
	static and(batch, conds) {
		for (const cond of conds) checkCondBatch(batch, cond);
		return new BatchCond$2(batch, {
			type: "and",
			conds: conds.map((e) => e._proto)
		});
	}
	/** Create a condition that is a logical OR of other conditions.
	*/
	static or(batch, conds) {
		for (const cond of conds) checkCondBatch(batch, cond);
		return new BatchCond$2(batch, {
			type: "or",
			conds: conds.map((e) => e._proto)
		});
	}
	/** Create a condition that evaluates to true when the SQL connection is in autocommit mode (not inside an
	* explicit transaction). This requires protocol version 3 or higher.
	*/
	static isAutocommit(batch) {
		batch._stream.client()._ensureVersion(3, "BatchCond.isAutocommit()");
		return new BatchCond$2(batch, { type: "is_autocommit" });
	}
};
function stepIndex(step) {
	if (step._index === void 0) throw new MisuseError("Cannot add a condition referencing a step that has not been added to the batch");
	return step._index;
}
function checkCondBatch(expectedBatch, cond) {
	if (cond._batch !== expectedBatch) throw new MisuseError("Cannot mix BatchCond objects for different Batch objects");
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/describe.js
function describeResultFromProto(result) {
	return {
		paramNames: result.params.map((p) => p.name),
		columns: result.cols,
		isExplain: result.isExplain,
		isReadonly: result.isReadonly
	};
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/stream.js
/** A stream for executing SQL statements (a "database connection"). */
var Stream = class {
	/** @private */
	constructor(intMode) {
		this.intMode = intMode;
	}
	/** Execute a statement and return rows. */
	query(stmt) {
		return this.#execute(stmt, true, rowsResultFromProto);
	}
	/** Execute a statement and return at most a single row. */
	queryRow(stmt) {
		return this.#execute(stmt, true, rowResultFromProto);
	}
	/** Execute a statement and return at most a single value. */
	queryValue(stmt) {
		return this.#execute(stmt, true, valueResultFromProto);
	}
	/** Execute a statement without returning rows. */
	run(stmt) {
		return this.#execute(stmt, false, stmtResultFromProto);
	}
	#execute(inStmt, wantRows, fromProto) {
		const stmt = stmtToProto(this._sqlOwner(), inStmt, wantRows);
		return this._execute(stmt).then((r) => fromProto(r, this.intMode));
	}
	/** Return a builder for creating and executing a batch.
	*
	* If `useCursor` is true, the batch will be executed using a Hrana cursor, which will stream results from
	* the server to the client, which consumes less memory on the server. This requires protocol version 3 or
	* higher.
	*/
	batch(useCursor = false) {
		return new Batch$2(this, useCursor);
	}
	/** Parse and analyze a statement. This requires protocol version 2 or higher. */
	describe(inSql) {
		const protoSql = sqlToProto(this._sqlOwner(), inSql);
		return this._describe(protoSql).then(describeResultFromProto);
	}
	/** Execute a sequence of statements separated by semicolons. This requires protocol version 2 or higher.
	* */
	sequence(inSql) {
		const protoSql = sqlToProto(this._sqlOwner(), inSql);
		return this._sequence(protoSql);
	}
	/** Representation of integers returned from the database. See {@link IntMode}.
	*
	* This value affects the results of all operations on this stream.
	*/
	intMode;
};
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/cursor.js
var Cursor = class {};
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/ws/cursor.js
var fetchChunkSize = 1e3;
var fetchQueueSize = 10;
var WsCursor = class extends Cursor {
	#client;
	#stream;
	#cursorId;
	#entryQueue;
	#fetchQueue;
	#closed;
	#done;
	/** @private */
	constructor(client, stream, cursorId) {
		super();
		this.#client = client;
		this.#stream = stream;
		this.#cursorId = cursorId;
		this.#entryQueue = new Queue();
		this.#fetchQueue = new Queue();
		this.#closed = void 0;
		this.#done = false;
	}
	/** Fetch the next entry from the cursor. */
	async next() {
		for (;;) {
			if (this.#closed !== void 0) throw new ClosedError("Cursor is closed", this.#closed);
			while (!this.#done && this.#fetchQueue.length < fetchQueueSize) this.#fetchQueue.push(this.#fetch());
			const entry = this.#entryQueue.shift();
			if (this.#done || entry !== void 0) return entry;
			await this.#fetchQueue.shift().then((response) => {
				if (response === void 0) return;
				for (const entry of response.entries) this.#entryQueue.push(entry);
				this.#done ||= response.done;
			});
		}
	}
	#fetch() {
		return this.#stream._sendCursorRequest(this, {
			type: "fetch_cursor",
			cursorId: this.#cursorId,
			maxCount: fetchChunkSize
		}).then((resp) => resp, (error) => {
			this._setClosed(error);
		});
	}
	/** @private */
	_setClosed(error) {
		if (this.#closed !== void 0) return;
		this.#closed = error;
		this.#stream._sendCursorRequest(this, {
			type: "close_cursor",
			cursorId: this.#cursorId
		}).catch(() => void 0);
		this.#stream._cursorClosed(this);
	}
	/** Close the cursor. */
	close() {
		this._setClosed(new ClientError("Cursor was manually closed"));
	}
	/** True if the cursor is closed. */
	get closed() {
		return this.#closed !== void 0;
	}
};
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/ws/stream.js
var WsStream = class WsStream extends Stream {
	#client;
	#streamId;
	#queue;
	#cursor;
	#closing;
	#closed;
	/** @private */
	static open(client) {
		const streamId = client._streamIdAlloc.alloc();
		const stream = new WsStream(client, streamId);
		const responseCallback = () => void 0;
		const errorCallback = (e) => stream.#setClosed(e);
		const request = {
			type: "open_stream",
			streamId
		};
		client._sendRequest(request, {
			responseCallback,
			errorCallback
		});
		return stream;
	}
	/** @private */
	constructor(client, streamId) {
		super(client.intMode);
		this.#client = client;
		this.#streamId = streamId;
		this.#queue = new Queue();
		this.#cursor = void 0;
		this.#closing = false;
		this.#closed = void 0;
	}
	/** Get the {@link WsClient} object that this stream belongs to. */
	client() {
		return this.#client;
	}
	/** @private */
	_sqlOwner() {
		return this.#client;
	}
	/** @private */
	_execute(stmt) {
		return this.#sendStreamRequest({
			type: "execute",
			streamId: this.#streamId,
			stmt
		}).then((response) => {
			return response.result;
		});
	}
	/** @private */
	_batch(batch) {
		return this.#sendStreamRequest({
			type: "batch",
			streamId: this.#streamId,
			batch
		}).then((response) => {
			return response.result;
		});
	}
	/** @private */
	_describe(protoSql) {
		this.#client._ensureVersion(2, "describe()");
		return this.#sendStreamRequest({
			type: "describe",
			streamId: this.#streamId,
			sql: protoSql.sql,
			sqlId: protoSql.sqlId
		}).then((response) => {
			return response.result;
		});
	}
	/** @private */
	_sequence(protoSql) {
		this.#client._ensureVersion(2, "sequence()");
		return this.#sendStreamRequest({
			type: "sequence",
			streamId: this.#streamId,
			sql: protoSql.sql,
			sqlId: protoSql.sqlId
		}).then((_response) => {});
	}
	/** Check whether the SQL connection underlying this stream is in autocommit state (i.e., outside of an
	* explicit transaction). This requires protocol version 3 or higher.
	*/
	getAutocommit() {
		this.#client._ensureVersion(3, "getAutocommit()");
		return this.#sendStreamRequest({
			type: "get_autocommit",
			streamId: this.#streamId
		}).then((response) => {
			return response.isAutocommit;
		});
	}
	#sendStreamRequest(request) {
		return new Promise((responseCallback, errorCallback) => {
			this.#pushToQueue({
				type: "request",
				request,
				responseCallback,
				errorCallback
			});
		});
	}
	/** @private */
	_openCursor(batch) {
		this.#client._ensureVersion(3, "cursor");
		return new Promise((cursorCallback, errorCallback) => {
			this.#pushToQueue({
				type: "cursor",
				batch,
				cursorCallback,
				errorCallback
			});
		});
	}
	/** @private */
	_sendCursorRequest(cursor, request) {
		if (cursor !== this.#cursor) throw new InternalError("Cursor not associated with the stream attempted to execute a request");
		return new Promise((responseCallback, errorCallback) => {
			if (this.#closed !== void 0) errorCallback(new ClosedError("Stream is closed", this.#closed));
			else this.#client._sendRequest(request, {
				responseCallback,
				errorCallback
			});
		});
	}
	/** @private */
	_cursorClosed(cursor) {
		if (cursor !== this.#cursor) throw new InternalError("Cursor was closed, but it was not associated with the stream");
		this.#cursor = void 0;
		this.#flushQueue();
	}
	#pushToQueue(entry) {
		if (this.#closed !== void 0) entry.errorCallback(new ClosedError("Stream is closed", this.#closed));
		else if (this.#closing) entry.errorCallback(new ClosedError("Stream is closing", void 0));
		else {
			this.#queue.push(entry);
			this.#flushQueue();
		}
	}
	#flushQueue() {
		for (;;) {
			const entry = this.#queue.first();
			if (entry === void 0 && this.#cursor === void 0 && this.#closing) {
				this.#setClosed(new ClientError("Stream was gracefully closed"));
				break;
			} else if (entry?.type === "request" && this.#cursor === void 0) {
				const { request, responseCallback, errorCallback } = entry;
				this.#queue.shift();
				this.#client._sendRequest(request, {
					responseCallback,
					errorCallback
				});
			} else if (entry?.type === "cursor" && this.#cursor === void 0) {
				const { batch, cursorCallback } = entry;
				this.#queue.shift();
				const cursorId = this.#client._cursorIdAlloc.alloc();
				const cursor = new WsCursor(this.#client, this, cursorId);
				const request = {
					type: "open_cursor",
					streamId: this.#streamId,
					cursorId,
					batch
				};
				const responseCallback = () => void 0;
				const errorCallback = (e) => cursor._setClosed(e);
				this.#client._sendRequest(request, {
					responseCallback,
					errorCallback
				});
				this.#cursor = cursor;
				cursorCallback(cursor);
			} else break;
		}
	}
	#setClosed(error) {
		if (this.#closed !== void 0) return;
		this.#closed = error;
		if (this.#cursor !== void 0) this.#cursor._setClosed(error);
		for (;;) {
			const entry = this.#queue.shift();
			if (entry !== void 0) entry.errorCallback(error);
			else break;
		}
		const request = {
			type: "close_stream",
			streamId: this.#streamId
		};
		const responseCallback = () => this.#client._streamIdAlloc.free(this.#streamId);
		const errorCallback = () => void 0;
		this.#client._sendRequest(request, {
			responseCallback,
			errorCallback
		});
	}
	/** Immediately close the stream. */
	close() {
		this.#setClosed(new ClientError("Stream was manually closed"));
	}
	/** Gracefully close the stream. */
	closeGracefully() {
		this.#closing = true;
		this.#flushQueue();
	}
	/** True if the stream is closed or closing. */
	get closed() {
		return this.#closed !== void 0 || this.#closing;
	}
};
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/shared/json_encode.js
function Stmt$1(w, msg) {
	if (msg.sql !== void 0) w.string("sql", msg.sql);
	if (msg.sqlId !== void 0) w.number("sql_id", msg.sqlId);
	w.arrayObjects("args", msg.args, Value$3);
	w.arrayObjects("named_args", msg.namedArgs, NamedArg$1);
	w.boolean("want_rows", msg.wantRows);
}
function NamedArg$1(w, msg) {
	w.string("name", msg.name);
	w.object("value", msg.value, Value$3);
}
function Batch$1(w, msg) {
	w.arrayObjects("steps", msg.steps, BatchStep$1);
}
function BatchStep$1(w, msg) {
	if (msg.condition !== void 0) w.object("condition", msg.condition, BatchCond$1);
	w.object("stmt", msg.stmt, Stmt$1);
}
function BatchCond$1(w, msg) {
	w.stringRaw("type", msg.type);
	if (msg.type === "ok" || msg.type === "error") w.number("step", msg.step);
	else if (msg.type === "not") w.object("cond", msg.cond, BatchCond$1);
	else if (msg.type === "and" || msg.type === "or") w.arrayObjects("conds", msg.conds, BatchCond$1);
	else if (msg.type === "is_autocommit") {} else throw impossible(msg, "Impossible type of BatchCond");
}
function Value$3(w, msg) {
	if (msg === null) w.stringRaw("type", "null");
	else if (typeof msg === "bigint") {
		w.stringRaw("type", "integer");
		w.stringRaw("value", "" + msg);
	} else if (typeof msg === "number") {
		w.stringRaw("type", "float");
		w.number("value", msg);
	} else if (typeof msg === "string") {
		w.stringRaw("type", "text");
		w.string("value", msg);
	} else if (msg instanceof Uint8Array) {
		w.stringRaw("type", "blob");
		w.stringRaw("base64", gBase64.fromUint8Array(msg));
	} else if (msg === void 0) {} else throw impossible(msg, "Impossible type of Value");
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/ws/json_encode.js
function ClientMsg$1(w, msg) {
	w.stringRaw("type", msg.type);
	if (msg.type === "hello") {
		if (msg.jwt !== void 0) w.string("jwt", msg.jwt);
	} else if (msg.type === "request") {
		w.number("request_id", msg.requestId);
		w.object("request", msg.request, Request$1);
	} else throw impossible(msg, "Impossible type of ClientMsg");
}
function Request$1(w, msg) {
	w.stringRaw("type", msg.type);
	if (msg.type === "open_stream") w.number("stream_id", msg.streamId);
	else if (msg.type === "close_stream") w.number("stream_id", msg.streamId);
	else if (msg.type === "execute") {
		w.number("stream_id", msg.streamId);
		w.object("stmt", msg.stmt, Stmt$1);
	} else if (msg.type === "batch") {
		w.number("stream_id", msg.streamId);
		w.object("batch", msg.batch, Batch$1);
	} else if (msg.type === "open_cursor") {
		w.number("stream_id", msg.streamId);
		w.number("cursor_id", msg.cursorId);
		w.object("batch", msg.batch, Batch$1);
	} else if (msg.type === "close_cursor") w.number("cursor_id", msg.cursorId);
	else if (msg.type === "fetch_cursor") {
		w.number("cursor_id", msg.cursorId);
		w.number("max_count", msg.maxCount);
	} else if (msg.type === "sequence") {
		w.number("stream_id", msg.streamId);
		if (msg.sql !== void 0) w.string("sql", msg.sql);
		if (msg.sqlId !== void 0) w.number("sql_id", msg.sqlId);
	} else if (msg.type === "describe") {
		w.number("stream_id", msg.streamId);
		if (msg.sql !== void 0) w.string("sql", msg.sql);
		if (msg.sqlId !== void 0) w.number("sql_id", msg.sqlId);
	} else if (msg.type === "store_sql") {
		w.number("sql_id", msg.sqlId);
		w.string("sql", msg.sql);
	} else if (msg.type === "close_sql") w.number("sql_id", msg.sqlId);
	else if (msg.type === "get_autocommit") w.number("stream_id", msg.streamId);
	else throw impossible(msg, "Impossible type of Request");
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/shared/protobuf_encode.js
function Stmt(w, msg) {
	if (msg.sql !== void 0) w.string(1, msg.sql);
	if (msg.sqlId !== void 0) w.int32(2, msg.sqlId);
	for (const arg of msg.args) w.message(3, arg, Value$2);
	for (const arg of msg.namedArgs) w.message(4, arg, NamedArg);
	w.bool(5, msg.wantRows);
}
function NamedArg(w, msg) {
	w.string(1, msg.name);
	w.message(2, msg.value, Value$2);
}
function Batch(w, msg) {
	for (const step of msg.steps) w.message(1, step, BatchStep);
}
function BatchStep(w, msg) {
	if (msg.condition !== void 0) w.message(1, msg.condition, BatchCond);
	w.message(2, msg.stmt, Stmt);
}
function BatchCond(w, msg) {
	if (msg.type === "ok") w.uint32(1, msg.step);
	else if (msg.type === "error") w.uint32(2, msg.step);
	else if (msg.type === "not") w.message(3, msg.cond, BatchCond);
	else if (msg.type === "and") w.message(4, msg.conds, BatchCondList);
	else if (msg.type === "or") w.message(5, msg.conds, BatchCondList);
	else if (msg.type === "is_autocommit") w.message(6, void 0, Empty);
	else throw impossible(msg, "Impossible type of BatchCond");
}
function BatchCondList(w, msg) {
	for (const cond of msg) w.message(1, cond, BatchCond);
}
function Value$2(w, msg) {
	if (msg === null) w.message(1, void 0, Empty);
	else if (typeof msg === "bigint") w.sint64(2, msg);
	else if (typeof msg === "number") w.double(3, msg);
	else if (typeof msg === "string") w.string(4, msg);
	else if (msg instanceof Uint8Array) w.bytes(5, msg);
	else if (msg === void 0) {} else throw impossible(msg, "Impossible type of Value");
}
function Empty(_w, _msg) {}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/ws/protobuf_encode.js
function ClientMsg(w, msg) {
	if (msg.type === "hello") w.message(1, msg, HelloMsg);
	else if (msg.type === "request") w.message(2, msg, RequestMsg);
	else throw impossible(msg, "Impossible type of ClientMsg");
}
function HelloMsg(w, msg) {
	if (msg.jwt !== void 0) w.string(1, msg.jwt);
}
function RequestMsg(w, msg) {
	w.int32(1, msg.requestId);
	const request = msg.request;
	if (request.type === "open_stream") w.message(2, request, OpenStreamReq);
	else if (request.type === "close_stream") w.message(3, request, CloseStreamReq$1);
	else if (request.type === "execute") w.message(4, request, ExecuteReq);
	else if (request.type === "batch") w.message(5, request, BatchReq);
	else if (request.type === "open_cursor") w.message(6, request, OpenCursorReq);
	else if (request.type === "close_cursor") w.message(7, request, CloseCursorReq);
	else if (request.type === "fetch_cursor") w.message(8, request, FetchCursorReq);
	else if (request.type === "sequence") w.message(9, request, SequenceReq);
	else if (request.type === "describe") w.message(10, request, DescribeReq);
	else if (request.type === "store_sql") w.message(11, request, StoreSqlReq);
	else if (request.type === "close_sql") w.message(12, request, CloseSqlReq);
	else if (request.type === "get_autocommit") w.message(13, request, GetAutocommitReq);
	else throw impossible(request, "Impossible type of Request");
}
function OpenStreamReq(w, msg) {
	w.int32(1, msg.streamId);
}
function CloseStreamReq$1(w, msg) {
	w.int32(1, msg.streamId);
}
function ExecuteReq(w, msg) {
	w.int32(1, msg.streamId);
	w.message(2, msg.stmt, Stmt);
}
function BatchReq(w, msg) {
	w.int32(1, msg.streamId);
	w.message(2, msg.batch, Batch);
}
function OpenCursorReq(w, msg) {
	w.int32(1, msg.streamId);
	w.int32(2, msg.cursorId);
	w.message(3, msg.batch, Batch);
}
function CloseCursorReq(w, msg) {
	w.int32(1, msg.cursorId);
}
function FetchCursorReq(w, msg) {
	w.int32(1, msg.cursorId);
	w.uint32(2, msg.maxCount);
}
function SequenceReq(w, msg) {
	w.int32(1, msg.streamId);
	if (msg.sql !== void 0) w.string(2, msg.sql);
	if (msg.sqlId !== void 0) w.int32(3, msg.sqlId);
}
function DescribeReq(w, msg) {
	w.int32(1, msg.streamId);
	if (msg.sql !== void 0) w.string(2, msg.sql);
	if (msg.sqlId !== void 0) w.int32(3, msg.sqlId);
}
function StoreSqlReq(w, msg) {
	w.int32(1, msg.sqlId);
	w.string(2, msg.sql);
}
function CloseSqlReq(w, msg) {
	w.int32(1, msg.sqlId);
}
function GetAutocommitReq(w, msg) {
	w.int32(1, msg.streamId);
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/shared/json_decode.js
function Error$2(obj) {
	return {
		message: string(obj["message"]),
		code: stringOpt(obj["code"])
	};
}
function StmtResult$1(obj) {
	const cols = arrayObjectsMap(obj["cols"], Col$1);
	const rows = array(obj["rows"]).map((rowObj) => arrayObjectsMap(rowObj, Value$1));
	const affectedRowCount = number(obj["affected_row_count"]);
	const lastInsertRowidStr = stringOpt(obj["last_insert_rowid"]);
	return {
		cols,
		rows,
		affectedRowCount,
		lastInsertRowid: lastInsertRowidStr !== void 0 ? BigInt(lastInsertRowidStr) : void 0
	};
}
function Col$1(obj) {
	return {
		name: stringOpt(obj["name"]),
		decltype: stringOpt(obj["decltype"])
	};
}
function BatchResult$1(obj) {
	const stepResults = /* @__PURE__ */ new Map();
	array(obj["step_results"]).forEach((value, i) => {
		if (value !== null) stepResults.set(i, StmtResult$1(object(value)));
	});
	const stepErrors = /* @__PURE__ */ new Map();
	array(obj["step_errors"]).forEach((value, i) => {
		if (value !== null) stepErrors.set(i, Error$2(object(value)));
	});
	return {
		stepResults,
		stepErrors
	};
}
function CursorEntry$1(obj) {
	const type = string(obj["type"]);
	if (type === "step_begin") return {
		type: "step_begin",
		step: number(obj["step"]),
		cols: arrayObjectsMap(obj["cols"], Col$1)
	};
	else if (type === "step_end") {
		const affectedRowCount = number(obj["affected_row_count"]);
		const lastInsertRowidStr = stringOpt(obj["last_insert_rowid"]);
		return {
			type: "step_end",
			affectedRowCount,
			lastInsertRowid: lastInsertRowidStr !== void 0 ? BigInt(lastInsertRowidStr) : void 0
		};
	} else if (type === "step_error") return {
		type: "step_error",
		step: number(obj["step"]),
		error: Error$2(object(obj["error"]))
	};
	else if (type === "row") return {
		type: "row",
		row: arrayObjectsMap(obj["row"], Value$1)
	};
	else if (type === "error") return {
		type: "error",
		error: Error$2(object(obj["error"]))
	};
	else throw new ProtoError("Unexpected type of CursorEntry");
}
function DescribeResult$1(obj) {
	return {
		params: arrayObjectsMap(obj["params"], DescribeParam$1),
		cols: arrayObjectsMap(obj["cols"], DescribeCol$1),
		isExplain: boolean(obj["is_explain"]),
		isReadonly: boolean(obj["is_readonly"])
	};
}
function DescribeParam$1(obj) {
	return { name: stringOpt(obj["name"]) };
}
function DescribeCol$1(obj) {
	return {
		name: string(obj["name"]),
		decltype: stringOpt(obj["decltype"])
	};
}
function Value$1(obj) {
	const type = string(obj["type"]);
	if (type === "null") return null;
	else if (type === "integer") {
		const value = string(obj["value"]);
		return BigInt(value);
	} else if (type === "float") return number(obj["value"]);
	else if (type === "text") return string(obj["value"]);
	else if (type === "blob") return gBase64.toUint8Array(string(obj["base64"]));
	else throw new ProtoError("Unexpected type of Value");
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/ws/json_decode.js
function ServerMsg$1(obj) {
	const type = string(obj["type"]);
	if (type === "hello_ok") return { type: "hello_ok" };
	else if (type === "hello_error") return {
		type: "hello_error",
		error: Error$2(object(obj["error"]))
	};
	else if (type === "response_ok") return {
		type: "response_ok",
		requestId: number(obj["request_id"]),
		response: Response(object(obj["response"]))
	};
	else if (type === "response_error") return {
		type: "response_error",
		requestId: number(obj["request_id"]),
		error: Error$2(object(obj["error"]))
	};
	else throw new ProtoError("Unexpected type of ServerMsg");
}
function Response(obj) {
	const type = string(obj["type"]);
	if (type === "open_stream") return { type: "open_stream" };
	else if (type === "close_stream") return { type: "close_stream" };
	else if (type === "execute") return {
		type: "execute",
		result: StmtResult$1(object(obj["result"]))
	};
	else if (type === "batch") return {
		type: "batch",
		result: BatchResult$1(object(obj["result"]))
	};
	else if (type === "open_cursor") return { type: "open_cursor" };
	else if (type === "close_cursor") return { type: "close_cursor" };
	else if (type === "fetch_cursor") return {
		type: "fetch_cursor",
		entries: arrayObjectsMap(obj["entries"], CursorEntry$1),
		done: boolean(obj["done"])
	};
	else if (type === "sequence") return { type: "sequence" };
	else if (type === "describe") return {
		type: "describe",
		result: DescribeResult$1(object(obj["result"]))
	};
	else if (type === "store_sql") return { type: "store_sql" };
	else if (type === "close_sql") return { type: "close_sql" };
	else if (type === "get_autocommit") return {
		type: "get_autocommit",
		isAutocommit: boolean(obj["is_autocommit"])
	};
	else throw new ProtoError("Unexpected type of Response");
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/shared/protobuf_decode.js
var Error$1 = {
	default() {
		return {
			message: "",
			code: void 0
		};
	},
	1(r, msg) {
		msg.message = r.string();
	},
	2(r, msg) {
		msg.code = r.string();
	}
};
var StmtResult = {
	default() {
		return {
			cols: [],
			rows: [],
			affectedRowCount: 0,
			lastInsertRowid: void 0
		};
	},
	1(r, msg) {
		msg.cols.push(r.message(Col));
	},
	2(r, msg) {
		msg.rows.push(r.message(Row));
	},
	3(r, msg) {
		msg.affectedRowCount = Number(r.uint64());
	},
	4(r, msg) {
		msg.lastInsertRowid = r.sint64();
	}
};
var Col = {
	default() {
		return {
			name: void 0,
			decltype: void 0
		};
	},
	1(r, msg) {
		msg.name = r.string();
	},
	2(r, msg) {
		msg.decltype = r.string();
	}
};
var Row = {
	default() {
		return [];
	},
	1(r, msg) {
		msg.push(r.message(Value));
	}
};
var BatchResult = {
	default() {
		return {
			stepResults: /* @__PURE__ */ new Map(),
			stepErrors: /* @__PURE__ */ new Map()
		};
	},
	1(r, msg) {
		const [key, value] = r.message(BatchResultStepResult);
		msg.stepResults.set(key, value);
	},
	2(r, msg) {
		const [key, value] = r.message(BatchResultStepError);
		msg.stepErrors.set(key, value);
	}
};
var BatchResultStepResult = {
	default() {
		return [0, StmtResult.default()];
	},
	1(r, msg) {
		msg[0] = r.uint32();
	},
	2(r, msg) {
		msg[1] = r.message(StmtResult);
	}
};
var BatchResultStepError = {
	default() {
		return [0, Error$1.default()];
	},
	1(r, msg) {
		msg[0] = r.uint32();
	},
	2(r, msg) {
		msg[1] = r.message(Error$1);
	}
};
var CursorEntry = {
	default() {
		return { type: "none" };
	},
	1(r) {
		return r.message(StepBeginEntry);
	},
	2(r) {
		return r.message(StepEndEntry);
	},
	3(r) {
		return r.message(StepErrorEntry);
	},
	4(r) {
		return {
			type: "row",
			row: r.message(Row)
		};
	},
	5(r) {
		return {
			type: "error",
			error: r.message(Error$1)
		};
	}
};
var StepBeginEntry = {
	default() {
		return {
			type: "step_begin",
			step: 0,
			cols: []
		};
	},
	1(r, msg) {
		msg.step = r.uint32();
	},
	2(r, msg) {
		msg.cols.push(r.message(Col));
	}
};
var StepEndEntry = {
	default() {
		return {
			type: "step_end",
			affectedRowCount: 0,
			lastInsertRowid: void 0
		};
	},
	1(r, msg) {
		msg.affectedRowCount = r.uint32();
	},
	2(r, msg) {
		msg.lastInsertRowid = r.uint64();
	}
};
var StepErrorEntry = {
	default() {
		return {
			type: "step_error",
			step: 0,
			error: Error$1.default()
		};
	},
	1(r, msg) {
		msg.step = r.uint32();
	},
	2(r, msg) {
		msg.error = r.message(Error$1);
	}
};
var DescribeResult = {
	default() {
		return {
			params: [],
			cols: [],
			isExplain: false,
			isReadonly: false
		};
	},
	1(r, msg) {
		msg.params.push(r.message(DescribeParam));
	},
	2(r, msg) {
		msg.cols.push(r.message(DescribeCol));
	},
	3(r, msg) {
		msg.isExplain = r.bool();
	},
	4(r, msg) {
		msg.isReadonly = r.bool();
	}
};
var DescribeParam = {
	default() {
		return { name: void 0 };
	},
	1(r, msg) {
		msg.name = r.string();
	}
};
var DescribeCol = {
	default() {
		return {
			name: "",
			decltype: void 0
		};
	},
	1(r, msg) {
		msg.name = r.string();
	},
	2(r, msg) {
		msg.decltype = r.string();
	}
};
var Value = {
	default() {},
	1(r) {
		return null;
	},
	2(r) {
		return r.sint64();
	},
	3(r) {
		return r.double();
	},
	4(r) {
		return r.string();
	},
	5(r) {
		return r.bytes();
	}
};
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/ws/protobuf_decode.js
var ServerMsg = {
	default() {
		return { type: "none" };
	},
	1(r) {
		return { type: "hello_ok" };
	},
	2(r) {
		return r.message(HelloErrorMsg);
	},
	3(r) {
		return r.message(ResponseOkMsg);
	},
	4(r) {
		return r.message(ResponseErrorMsg);
	}
};
var HelloErrorMsg = {
	default() {
		return {
			type: "hello_error",
			error: Error$1.default()
		};
	},
	1(r, msg) {
		msg.error = r.message(Error$1);
	}
};
var ResponseErrorMsg = {
	default() {
		return {
			type: "response_error",
			requestId: 0,
			error: Error$1.default()
		};
	},
	1(r, msg) {
		msg.requestId = r.int32();
	},
	2(r, msg) {
		msg.error = r.message(Error$1);
	}
};
var ResponseOkMsg = {
	default() {
		return {
			type: "response_ok",
			requestId: 0,
			response: { type: "none" }
		};
	},
	1(r, msg) {
		msg.requestId = r.int32();
	},
	2(r, msg) {
		msg.response = { type: "open_stream" };
	},
	3(r, msg) {
		msg.response = { type: "close_stream" };
	},
	4(r, msg) {
		msg.response = r.message(ExecuteResp);
	},
	5(r, msg) {
		msg.response = r.message(BatchResp);
	},
	6(r, msg) {
		msg.response = { type: "open_cursor" };
	},
	7(r, msg) {
		msg.response = { type: "close_cursor" };
	},
	8(r, msg) {
		msg.response = r.message(FetchCursorResp);
	},
	9(r, msg) {
		msg.response = { type: "sequence" };
	},
	10(r, msg) {
		msg.response = r.message(DescribeResp);
	},
	11(r, msg) {
		msg.response = { type: "store_sql" };
	},
	12(r, msg) {
		msg.response = { type: "close_sql" };
	},
	13(r, msg) {
		msg.response = r.message(GetAutocommitResp);
	}
};
var ExecuteResp = {
	default() {
		return {
			type: "execute",
			result: StmtResult.default()
		};
	},
	1(r, msg) {
		msg.result = r.message(StmtResult);
	}
};
var BatchResp = {
	default() {
		return {
			type: "batch",
			result: BatchResult.default()
		};
	},
	1(r, msg) {
		msg.result = r.message(BatchResult);
	}
};
var FetchCursorResp = {
	default() {
		return {
			type: "fetch_cursor",
			entries: [],
			done: false
		};
	},
	1(r, msg) {
		msg.entries.push(r.message(CursorEntry));
	},
	2(r, msg) {
		msg.done = r.bool();
	}
};
var DescribeResp = {
	default() {
		return {
			type: "describe",
			result: DescribeResult.default()
		};
	},
	1(r, msg) {
		msg.result = r.message(DescribeResult);
	}
};
var GetAutocommitResp = {
	default() {
		return {
			type: "get_autocommit",
			isAutocommit: false
		};
	},
	1(r, msg) {
		msg.isAutocommit = r.bool();
	}
};
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/ws/client.js
var subprotocolsV2 = /* @__PURE__ */ new Map([["hrana2", {
	version: 2,
	encoding: "json"
}], ["hrana1", {
	version: 1,
	encoding: "json"
}]]);
var subprotocolsV3 = /* @__PURE__ */ new Map([
	["hrana3-protobuf", {
		version: 3,
		encoding: "protobuf"
	}],
	["hrana3", {
		version: 3,
		encoding: "json"
	}],
	["hrana2", {
		version: 2,
		encoding: "json"
	}],
	["hrana1", {
		version: 1,
		encoding: "json"
	}]
]);
/** A client for the Hrana protocol over a WebSocket. */
var WsClient$1 = class extends Client {
	#socket;
	#openCallbacks;
	#opened;
	#closed;
	#recvdHello;
	#subprotocol;
	#getVersionCalled;
	#responseMap;
	#requestIdAlloc;
	/** @private */
	_streamIdAlloc;
	/** @private */
	_cursorIdAlloc;
	#sqlIdAlloc;
	/** @private */
	constructor(socket, jwt) {
		super();
		this.#socket = socket;
		this.#openCallbacks = [];
		this.#opened = false;
		this.#closed = void 0;
		this.#recvdHello = false;
		this.#subprotocol = void 0;
		this.#getVersionCalled = false;
		this.#responseMap = /* @__PURE__ */ new Map();
		this.#requestIdAlloc = new IdAlloc();
		this._streamIdAlloc = new IdAlloc();
		this._cursorIdAlloc = new IdAlloc();
		this.#sqlIdAlloc = new IdAlloc();
		this.#socket.binaryType = "arraybuffer";
		this.#socket.addEventListener("open", () => this.#onSocketOpen());
		this.#socket.addEventListener("close", (event) => this.#onSocketClose(event));
		this.#socket.addEventListener("error", (event) => this.#onSocketError(event));
		this.#socket.addEventListener("message", (event) => this.#onSocketMessage(event));
		this.#send({
			type: "hello",
			jwt
		});
	}
	#send(msg) {
		if (this.#closed !== void 0) throw new InternalError("Trying to send a message on a closed client");
		if (this.#opened) this.#sendToSocket(msg);
		else {
			const openCallback = () => this.#sendToSocket(msg);
			const errorCallback = () => void 0;
			this.#openCallbacks.push({
				openCallback,
				errorCallback
			});
		}
	}
	#onSocketOpen() {
		const protocol = this.#socket.protocol;
		if (protocol === void 0) {
			this.#setClosed(new ClientError("The `WebSocket.protocol` property is undefined. This most likely means that the WebSocket implementation provided by the environment is broken. If you are using Miniflare 2, please update to Miniflare 3, which fixes this problem."));
			return;
		} else if (protocol === "") this.#subprotocol = {
			version: 1,
			encoding: "json"
		};
		else {
			this.#subprotocol = subprotocolsV3.get(protocol);
			if (this.#subprotocol === void 0) {
				this.#setClosed(new ProtoError(`Unrecognized WebSocket subprotocol: ${JSON.stringify(protocol)}`));
				return;
			}
		}
		for (const callbacks of this.#openCallbacks) callbacks.openCallback();
		this.#openCallbacks.length = 0;
		this.#opened = true;
	}
	#sendToSocket(msg) {
		const encoding = this.#subprotocol.encoding;
		if (encoding === "json") {
			const jsonMsg = writeJsonObject(msg, ClientMsg$1);
			this.#socket.send(jsonMsg);
		} else if (encoding === "protobuf") {
			const protobufMsg = writeProtobufMessage(msg, ClientMsg);
			this.#socket.send(protobufMsg);
		} else throw impossible(encoding, "Impossible encoding");
	}
	/** Get the protocol version negotiated with the server, possibly waiting until the socket is open. */
	getVersion() {
		return new Promise((versionCallback, errorCallback) => {
			this.#getVersionCalled = true;
			if (this.#closed !== void 0) errorCallback(this.#closed);
			else if (!this.#opened) {
				const openCallback = () => versionCallback(this.#subprotocol.version);
				this.#openCallbacks.push({
					openCallback,
					errorCallback
				});
			} else versionCallback(this.#subprotocol.version);
		});
	}
	/** @private */
	_ensureVersion(minVersion, feature) {
		if (this.#subprotocol === void 0 || !this.#getVersionCalled) throw new ProtocolVersionError(`${feature} is supported only on protocol version ${minVersion} and higher, but the version supported by the WebSocket server is not yet known. Use Client.getVersion() to wait until the version is available.`);
		else if (this.#subprotocol.version < minVersion) throw new ProtocolVersionError(`${feature} is supported on protocol version ${minVersion} and higher, but the WebSocket server only supports version ${this.#subprotocol.version}`);
	}
	/** @private */
	_sendRequest(request, callbacks) {
		if (this.#closed !== void 0) {
			callbacks.errorCallback(new ClosedError("Client is closed", this.#closed));
			return;
		}
		const requestId = this.#requestIdAlloc.alloc();
		this.#responseMap.set(requestId, {
			...callbacks,
			type: request.type
		});
		this.#send({
			type: "request",
			requestId,
			request
		});
	}
	#onSocketError(event) {
		const message = event.message ?? "WebSocket was closed due to an error";
		this.#setClosed(new WebSocketError(message));
	}
	#onSocketClose(event) {
		let message = `WebSocket was closed with code ${event.code}`;
		if (event.reason) message += `: ${event.reason}`;
		this.#setClosed(new WebSocketError(message));
	}
	#setClosed(error) {
		if (this.#closed !== void 0) return;
		this.#closed = error;
		for (const callbacks of this.#openCallbacks) callbacks.errorCallback(error);
		this.#openCallbacks.length = 0;
		for (const [requestId, responseState] of this.#responseMap.entries()) {
			responseState.errorCallback(error);
			this.#requestIdAlloc.free(requestId);
		}
		this.#responseMap.clear();
		this.#socket.close();
	}
	#onSocketMessage(event) {
		if (this.#closed !== void 0) return;
		try {
			let msg;
			const encoding = this.#subprotocol.encoding;
			if (encoding === "json") {
				if (typeof event.data !== "string") {
					this.#socket.close(3003, "Only text messages are accepted with JSON encoding");
					this.#setClosed(new ProtoError("Received non-text message from server with JSON encoding"));
					return;
				}
				msg = readJsonObject(JSON.parse(event.data), ServerMsg$1);
			} else if (encoding === "protobuf") {
				if (!(event.data instanceof ArrayBuffer)) {
					this.#socket.close(3003, "Only binary messages are accepted with Protobuf encoding");
					this.#setClosed(new ProtoError("Received non-binary message from server with Protobuf encoding"));
					return;
				}
				msg = readProtobufMessage(new Uint8Array(event.data), ServerMsg);
			} else throw impossible(encoding, "Impossible encoding");
			this.#handleMsg(msg);
		} catch (e) {
			this.#socket.close(3007, "Could not handle message");
			this.#setClosed(e);
		}
	}
	#handleMsg(msg) {
		if (msg.type === "none") throw new ProtoError("Received an unrecognized ServerMsg");
		else if (msg.type === "hello_ok" || msg.type === "hello_error") {
			if (this.#recvdHello) throw new ProtoError("Received a duplicated hello response");
			this.#recvdHello = true;
			if (msg.type === "hello_error") throw errorFromProto(msg.error);
			return;
		} else if (!this.#recvdHello) throw new ProtoError("Received a non-hello message before a hello response");
		if (msg.type === "response_ok") {
			const requestId = msg.requestId;
			const responseState = this.#responseMap.get(requestId);
			this.#responseMap.delete(requestId);
			if (responseState === void 0) throw new ProtoError("Received unexpected OK response");
			this.#requestIdAlloc.free(requestId);
			try {
				if (responseState.type !== msg.response.type) {
					console.dir({
						responseState,
						msg
					});
					throw new ProtoError("Received unexpected type of response");
				}
				responseState.responseCallback(msg.response);
			} catch (e) {
				responseState.errorCallback(e);
				throw e;
			}
		} else if (msg.type === "response_error") {
			const requestId = msg.requestId;
			const responseState = this.#responseMap.get(requestId);
			this.#responseMap.delete(requestId);
			if (responseState === void 0) throw new ProtoError("Received unexpected error response");
			this.#requestIdAlloc.free(requestId);
			responseState.errorCallback(errorFromProto(msg.error));
		} else throw impossible(msg, "Impossible ServerMsg type");
	}
	/** Open a {@link WsStream}, a stream for executing SQL statements. */
	openStream() {
		return WsStream.open(this);
	}
	/** Cache a SQL text on the server. This requires protocol version 2 or higher. */
	storeSql(sql) {
		this._ensureVersion(2, "storeSql()");
		const sqlId = this.#sqlIdAlloc.alloc();
		const sqlObj = new Sql(this, sqlId);
		const responseCallback = () => void 0;
		const errorCallback = (e) => sqlObj._setClosed(e);
		const request = {
			type: "store_sql",
			sqlId,
			sql
		};
		this._sendRequest(request, {
			responseCallback,
			errorCallback
		});
		return sqlObj;
	}
	/** @private */
	_closeSql(sqlId) {
		if (this.#closed !== void 0) return;
		const responseCallback = () => this.#sqlIdAlloc.free(sqlId);
		const errorCallback = (e) => this.#setClosed(e);
		const request = {
			type: "close_sql",
			sqlId
		};
		this._sendRequest(request, {
			responseCallback,
			errorCallback
		});
	}
	/** Close the client and the WebSocket. */
	close() {
		this.#setClosed(new ClientError("Client was manually closed"));
	}
	/** True if the client is closed. */
	get closed() {
		return this.#closed !== void 0;
	}
};
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/queue_microtask.js
var _queueMicrotask;
if (typeof queueMicrotask !== "undefined") _queueMicrotask = queueMicrotask;
else {
	const resolved = Promise.resolve();
	_queueMicrotask = (callback) => {
		resolved.then(callback);
	};
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/byte_queue.js
var ByteQueue = class {
	#array;
	#shiftPos;
	#pushPos;
	constructor(initialCap) {
		this.#array = new Uint8Array(new ArrayBuffer(initialCap));
		this.#shiftPos = 0;
		this.#pushPos = 0;
	}
	get length() {
		return this.#pushPos - this.#shiftPos;
	}
	data() {
		return this.#array.slice(this.#shiftPos, this.#pushPos);
	}
	push(chunk) {
		this.#ensurePush(chunk.byteLength);
		this.#array.set(chunk, this.#pushPos);
		this.#pushPos += chunk.byteLength;
	}
	#ensurePush(pushLength) {
		if (this.#pushPos + pushLength <= this.#array.byteLength) return;
		const filledLength = this.#pushPos - this.#shiftPos;
		if (filledLength + pushLength <= this.#array.byteLength && 2 * this.#pushPos >= this.#array.byteLength) this.#array.copyWithin(0, this.#shiftPos, this.#pushPos);
		else {
			let newCap = this.#array.byteLength;
			do
				newCap *= 2;
			while (filledLength + pushLength > newCap);
			const newArray = new Uint8Array(new ArrayBuffer(newCap));
			newArray.set(this.#array.slice(this.#shiftPos, this.#pushPos), 0);
			this.#array = newArray;
		}
		this.#pushPos = filledLength;
		this.#shiftPos = 0;
	}
	shift(length) {
		this.#shiftPos += length;
	}
};
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/http/json_decode.js
function PipelineRespBody$1(obj) {
	return {
		baton: stringOpt(obj["baton"]),
		baseUrl: stringOpt(obj["base_url"]),
		results: arrayObjectsMap(obj["results"], StreamResult$1)
	};
}
function StreamResult$1(obj) {
	const type = string(obj["type"]);
	if (type === "ok") return {
		type: "ok",
		response: StreamResponse$1(object(obj["response"]))
	};
	else if (type === "error") return {
		type: "error",
		error: Error$2(object(obj["error"]))
	};
	else throw new ProtoError("Unexpected type of StreamResult");
}
function StreamResponse$1(obj) {
	const type = string(obj["type"]);
	if (type === "close") return { type: "close" };
	else if (type === "execute") return {
		type: "execute",
		result: StmtResult$1(object(obj["result"]))
	};
	else if (type === "batch") return {
		type: "batch",
		result: BatchResult$1(object(obj["result"]))
	};
	else if (type === "sequence") return { type: "sequence" };
	else if (type === "describe") return {
		type: "describe",
		result: DescribeResult$1(object(obj["result"]))
	};
	else if (type === "store_sql") return { type: "store_sql" };
	else if (type === "close_sql") return { type: "close_sql" };
	else if (type === "get_autocommit") return {
		type: "get_autocommit",
		isAutocommit: boolean(obj["is_autocommit"])
	};
	else throw new ProtoError("Unexpected type of StreamResponse");
}
function CursorRespBody$1(obj) {
	return {
		baton: stringOpt(obj["baton"]),
		baseUrl: stringOpt(obj["base_url"])
	};
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/http/protobuf_decode.js
var PipelineRespBody = {
	default() {
		return {
			baton: void 0,
			baseUrl: void 0,
			results: []
		};
	},
	1(r, msg) {
		msg.baton = r.string();
	},
	2(r, msg) {
		msg.baseUrl = r.string();
	},
	3(r, msg) {
		msg.results.push(r.message(StreamResult));
	}
};
var StreamResult = {
	default() {
		return { type: "none" };
	},
	1(r) {
		return {
			type: "ok",
			response: r.message(StreamResponse)
		};
	},
	2(r) {
		return {
			type: "error",
			error: r.message(Error$1)
		};
	}
};
var StreamResponse = {
	default() {
		return { type: "none" };
	},
	1(r) {
		return { type: "close" };
	},
	2(r) {
		return r.message(ExecuteStreamResp);
	},
	3(r) {
		return r.message(BatchStreamResp);
	},
	4(r) {
		return { type: "sequence" };
	},
	5(r) {
		return r.message(DescribeStreamResp);
	},
	6(r) {
		return { type: "store_sql" };
	},
	7(r) {
		return { type: "close_sql" };
	},
	8(r) {
		return r.message(GetAutocommitStreamResp);
	}
};
var ExecuteStreamResp = {
	default() {
		return {
			type: "execute",
			result: StmtResult.default()
		};
	},
	1(r, msg) {
		msg.result = r.message(StmtResult);
	}
};
var BatchStreamResp = {
	default() {
		return {
			type: "batch",
			result: BatchResult.default()
		};
	},
	1(r, msg) {
		msg.result = r.message(BatchResult);
	}
};
var DescribeStreamResp = {
	default() {
		return {
			type: "describe",
			result: DescribeResult.default()
		};
	},
	1(r, msg) {
		msg.result = r.message(DescribeResult);
	}
};
var GetAutocommitStreamResp = {
	default() {
		return {
			type: "get_autocommit",
			isAutocommit: false
		};
	},
	1(r, msg) {
		msg.isAutocommit = r.bool();
	}
};
var CursorRespBody = {
	default() {
		return {
			baton: void 0,
			baseUrl: void 0
		};
	},
	1(r, msg) {
		msg.baton = r.string();
	},
	2(r, msg) {
		msg.baseUrl = r.string();
	}
};
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/http/cursor.js
var HttpCursor = class extends Cursor {
	#stream;
	#encoding;
	#reader;
	#queue;
	#closed;
	#done;
	/** @private */
	constructor(stream, encoding) {
		super();
		this.#stream = stream;
		this.#encoding = encoding;
		this.#reader = void 0;
		this.#queue = new ByteQueue(16384);
		this.#closed = void 0;
		this.#done = false;
	}
	async open(response) {
		if (response.body === null) throw new ProtoError("No response body for cursor request");
		this.#reader = response.body[Symbol.asyncIterator]();
		const respBody = await this.#nextItem(CursorRespBody$1, CursorRespBody);
		if (respBody === void 0) throw new ProtoError("Empty response to cursor request");
		return respBody;
	}
	/** Fetch the next entry from the cursor. */
	next() {
		return this.#nextItem(CursorEntry$1, CursorEntry);
	}
	/** Close the cursor. */
	close() {
		this._setClosed(new ClientError("Cursor was manually closed"));
	}
	/** @private */
	_setClosed(error) {
		if (this.#closed !== void 0) return;
		this.#closed = error;
		this.#stream._cursorClosed(this);
		if (this.#reader !== void 0) this.#reader.return();
	}
	/** True if the cursor is closed. */
	get closed() {
		return this.#closed !== void 0;
	}
	async #nextItem(jsonFun, protobufDef) {
		for (;;) {
			if (this.#done) return;
			else if (this.#closed !== void 0) throw new ClosedError("Cursor is closed", this.#closed);
			if (this.#encoding === "json") {
				const jsonData = this.#parseItemJson();
				if (jsonData !== void 0) {
					const jsonText = new TextDecoder().decode(jsonData);
					return readJsonObject(JSON.parse(jsonText), jsonFun);
				}
			} else if (this.#encoding === "protobuf") {
				const protobufData = this.#parseItemProtobuf();
				if (protobufData !== void 0) return readProtobufMessage(protobufData, protobufDef);
			} else throw impossible(this.#encoding, "Impossible encoding");
			if (this.#reader === void 0) throw new InternalError("Attempted to read from HTTP cursor before it was opened");
			const { value, done } = await this.#reader.next();
			if (done && this.#queue.length === 0) this.#done = true;
			else if (done) throw new ProtoError("Unexpected end of cursor stream");
			else this.#queue.push(value);
		}
	}
	#parseItemJson() {
		const data = this.#queue.data();
		const newlinePos = data.indexOf(10);
		if (newlinePos < 0) return;
		const jsonData = data.slice(0, newlinePos);
		this.#queue.shift(newlinePos + 1);
		return jsonData;
	}
	#parseItemProtobuf() {
		const data = this.#queue.data();
		let varintValue = 0;
		let varintLength = 0;
		for (;;) {
			if (varintLength >= data.byteLength) return;
			const byte = data[varintLength];
			varintValue |= (byte & 127) << 7 * varintLength;
			varintLength += 1;
			if (!(byte & 128)) break;
		}
		if (data.byteLength < varintLength + varintValue) return;
		const protobufData = data.slice(varintLength, varintLength + varintValue);
		this.#queue.shift(varintLength + varintValue);
		return protobufData;
	}
};
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/http/json_encode.js
function PipelineReqBody$1(w, msg) {
	if (msg.baton !== void 0) w.string("baton", msg.baton);
	w.arrayObjects("requests", msg.requests, StreamRequest$1);
}
function StreamRequest$1(w, msg) {
	w.stringRaw("type", msg.type);
	if (msg.type === "close") {} else if (msg.type === "execute") w.object("stmt", msg.stmt, Stmt$1);
	else if (msg.type === "batch") w.object("batch", msg.batch, Batch$1);
	else if (msg.type === "sequence") {
		if (msg.sql !== void 0) w.string("sql", msg.sql);
		if (msg.sqlId !== void 0) w.number("sql_id", msg.sqlId);
	} else if (msg.type === "describe") {
		if (msg.sql !== void 0) w.string("sql", msg.sql);
		if (msg.sqlId !== void 0) w.number("sql_id", msg.sqlId);
	} else if (msg.type === "store_sql") {
		w.number("sql_id", msg.sqlId);
		w.string("sql", msg.sql);
	} else if (msg.type === "close_sql") w.number("sql_id", msg.sqlId);
	else if (msg.type === "get_autocommit") {} else throw impossible(msg, "Impossible type of StreamRequest");
}
function CursorReqBody$1(w, msg) {
	if (msg.baton !== void 0) w.string("baton", msg.baton);
	w.object("batch", msg.batch, Batch$1);
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/http/protobuf_encode.js
function PipelineReqBody(w, msg) {
	if (msg.baton !== void 0) w.string(1, msg.baton);
	for (const req of msg.requests) w.message(2, req, StreamRequest);
}
function StreamRequest(w, msg) {
	if (msg.type === "close") w.message(1, msg, CloseStreamReq);
	else if (msg.type === "execute") w.message(2, msg, ExecuteStreamReq);
	else if (msg.type === "batch") w.message(3, msg, BatchStreamReq);
	else if (msg.type === "sequence") w.message(4, msg, SequenceStreamReq);
	else if (msg.type === "describe") w.message(5, msg, DescribeStreamReq);
	else if (msg.type === "store_sql") w.message(6, msg, StoreSqlStreamReq);
	else if (msg.type === "close_sql") w.message(7, msg, CloseSqlStreamReq);
	else if (msg.type === "get_autocommit") w.message(8, msg, GetAutocommitStreamReq);
	else throw impossible(msg, "Impossible type of StreamRequest");
}
function CloseStreamReq(_w, _msg) {}
function ExecuteStreamReq(w, msg) {
	w.message(1, msg.stmt, Stmt);
}
function BatchStreamReq(w, msg) {
	w.message(1, msg.batch, Batch);
}
function SequenceStreamReq(w, msg) {
	if (msg.sql !== void 0) w.string(1, msg.sql);
	if (msg.sqlId !== void 0) w.int32(2, msg.sqlId);
}
function DescribeStreamReq(w, msg) {
	if (msg.sql !== void 0) w.string(1, msg.sql);
	if (msg.sqlId !== void 0) w.int32(2, msg.sqlId);
}
function StoreSqlStreamReq(w, msg) {
	w.int32(1, msg.sqlId);
	w.string(2, msg.sql);
}
function CloseSqlStreamReq(w, msg) {
	w.int32(1, msg.sqlId);
}
function GetAutocommitStreamReq(_w, _msg) {}
function CursorReqBody(w, msg) {
	if (msg.baton !== void 0) w.string(1, msg.baton);
	w.message(2, msg.batch, Batch);
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/http/stream.js
var HttpStream = class extends Stream {
	#client;
	#baseUrl;
	#jwt;
	#fetch;
	#remoteEncryptionKey;
	#baton;
	#queue;
	#flushing;
	#cursor;
	#closing;
	#closeQueued;
	#closed;
	#sqlIdAlloc;
	/** @private */
	constructor(client, baseUrl, jwt, customFetch, remoteEncryptionKey) {
		super(client.intMode);
		this.#client = client;
		this.#baseUrl = baseUrl.toString();
		this.#jwt = jwt;
		this.#fetch = customFetch;
		this.#remoteEncryptionKey = remoteEncryptionKey;
		this.#baton = void 0;
		this.#queue = new Queue();
		this.#flushing = false;
		this.#closing = false;
		this.#closeQueued = false;
		this.#closed = void 0;
		this.#sqlIdAlloc = new IdAlloc();
	}
	/** Get the {@link HttpClient} object that this stream belongs to. */
	client() {
		return this.#client;
	}
	/** @private */
	_sqlOwner() {
		return this;
	}
	/** Cache a SQL text on the server. */
	storeSql(sql) {
		const sqlId = this.#sqlIdAlloc.alloc();
		this.#sendStreamRequest({
			type: "store_sql",
			sqlId,
			sql
		}).then(() => void 0, (error) => this._setClosed(error));
		return new Sql(this, sqlId);
	}
	/** @private */
	_closeSql(sqlId) {
		if (this.#closed !== void 0) return;
		this.#sendStreamRequest({
			type: "close_sql",
			sqlId
		}).then(() => this.#sqlIdAlloc.free(sqlId), (error) => this._setClosed(error));
	}
	/** @private */
	_execute(stmt) {
		return this.#sendStreamRequest({
			type: "execute",
			stmt
		}).then((response) => {
			return response.result;
		});
	}
	/** @private */
	_batch(batch) {
		return this.#sendStreamRequest({
			type: "batch",
			batch
		}).then((response) => {
			return response.result;
		});
	}
	/** @private */
	_describe(protoSql) {
		return this.#sendStreamRequest({
			type: "describe",
			sql: protoSql.sql,
			sqlId: protoSql.sqlId
		}).then((response) => {
			return response.result;
		});
	}
	/** @private */
	_sequence(protoSql) {
		return this.#sendStreamRequest({
			type: "sequence",
			sql: protoSql.sql,
			sqlId: protoSql.sqlId
		}).then((_response) => {});
	}
	/** Check whether the SQL connection underlying this stream is in autocommit state (i.e., outside of an
	* explicit transaction). This requires protocol version 3 or higher.
	*/
	getAutocommit() {
		this.#client._ensureVersion(3, "getAutocommit()");
		return this.#sendStreamRequest({ type: "get_autocommit" }).then((response) => {
			return response.isAutocommit;
		});
	}
	#sendStreamRequest(request) {
		return new Promise((responseCallback, errorCallback) => {
			this.#pushToQueue({
				type: "pipeline",
				request,
				responseCallback,
				errorCallback
			});
		});
	}
	/** @private */
	_openCursor(batch) {
		return new Promise((cursorCallback, errorCallback) => {
			this.#pushToQueue({
				type: "cursor",
				batch,
				cursorCallback,
				errorCallback
			});
		});
	}
	/** @private */
	_cursorClosed(cursor) {
		if (cursor !== this.#cursor) throw new InternalError("Cursor was closed, but it was not associated with the stream");
		this.#cursor = void 0;
		_queueMicrotask(() => this.#flushQueue());
	}
	/** Immediately close the stream. */
	close() {
		this._setClosed(new ClientError("Stream was manually closed"));
	}
	/** Gracefully close the stream. */
	closeGracefully() {
		this.#closing = true;
		_queueMicrotask(() => this.#flushQueue());
	}
	/** True if the stream is closed. */
	get closed() {
		return this.#closed !== void 0 || this.#closing;
	}
	/** @private */
	_setClosed(error) {
		if (this.#closed !== void 0) return;
		this.#closed = error;
		if (this.#cursor !== void 0) this.#cursor._setClosed(error);
		this.#client._streamClosed(this);
		for (;;) {
			const entry = this.#queue.shift();
			if (entry !== void 0) entry.errorCallback(error);
			else break;
		}
		if ((this.#baton !== void 0 || this.#flushing) && !this.#closeQueued) {
			this.#queue.push({
				type: "pipeline",
				request: { type: "close" },
				responseCallback: () => void 0,
				errorCallback: () => void 0
			});
			this.#closeQueued = true;
			_queueMicrotask(() => this.#flushQueue());
		}
	}
	#pushToQueue(entry) {
		if (this.#closed !== void 0) throw new ClosedError("Stream is closed", this.#closed);
		else if (this.#closing) throw new ClosedError("Stream is closing", void 0);
		else {
			this.#queue.push(entry);
			_queueMicrotask(() => this.#flushQueue());
		}
	}
	#flushQueue() {
		if (this.#flushing || this.#cursor !== void 0) return;
		if (this.#closing && this.#queue.length === 0) {
			this._setClosed(new ClientError("Stream was gracefully closed"));
			return;
		}
		const endpoint = this.#client._endpoint;
		if (endpoint === void 0) {
			this.#client._endpointPromise.then(() => this.#flushQueue(), (error) => this._setClosed(error));
			return;
		}
		const firstEntry = this.#queue.shift();
		if (firstEntry === void 0) return;
		else if (firstEntry.type === "pipeline") {
			const pipeline = [firstEntry];
			for (;;) {
				const entry = this.#queue.first();
				if (entry !== void 0 && entry.type === "pipeline") {
					pipeline.push(entry);
					this.#queue.shift();
				} else if (entry === void 0 && this.#closing && !this.#closeQueued) {
					pipeline.push({
						type: "pipeline",
						request: { type: "close" },
						responseCallback: () => void 0,
						errorCallback: () => void 0
					});
					this.#closeQueued = true;
					break;
				} else break;
			}
			this.#flushPipeline(endpoint, pipeline);
		} else if (firstEntry.type === "cursor") this.#flushCursor(endpoint, firstEntry);
		else throw impossible(firstEntry, "Impossible type of QueueEntry");
	}
	#flushPipeline(endpoint, pipeline) {
		this.#flush(() => this.#createPipelineRequest(pipeline, endpoint), (resp) => decodePipelineResponse(resp, endpoint.encoding), (respBody) => respBody.baton, (respBody) => respBody.baseUrl, (respBody) => handlePipelineResponse(pipeline, respBody), (error) => pipeline.forEach((entry) => entry.errorCallback(error)));
	}
	#flushCursor(endpoint, entry) {
		const cursor = new HttpCursor(this, endpoint.encoding);
		this.#cursor = cursor;
		this.#flush(() => this.#createCursorRequest(entry, endpoint), (resp) => cursor.open(resp), (respBody) => respBody.baton, (respBody) => respBody.baseUrl, (_respBody) => entry.cursorCallback(cursor), (error) => entry.errorCallback(error));
	}
	#flush(createRequest, decodeResponse, getBaton, getBaseUrl, handleResponse, handleError) {
		let promise;
		try {
			const request = createRequest();
			const fetch = this.#fetch;
			promise = fetch(request);
		} catch (error) {
			promise = Promise.reject(error);
		}
		this.#flushing = true;
		promise.then((resp) => {
			if (!resp.ok) return errorFromResponse(resp).then((error) => {
				throw error;
			});
			return decodeResponse(resp);
		}).then((r) => {
			this.#baton = getBaton(r);
			this.#baseUrl = getBaseUrl(r) ?? this.#baseUrl;
			handleResponse(r);
		}).catch((error) => {
			this._setClosed(error);
			handleError(error);
		}).finally(() => {
			this.#flushing = false;
			this.#flushQueue();
		});
	}
	#createPipelineRequest(pipeline, endpoint) {
		return this.#createRequest(new URL(endpoint.pipelinePath, this.#baseUrl), {
			baton: this.#baton,
			requests: pipeline.map((entry) => entry.request)
		}, endpoint.encoding, PipelineReqBody$1, PipelineReqBody);
	}
	#createCursorRequest(entry, endpoint) {
		if (endpoint.cursorPath === void 0) throw new ProtocolVersionError(`Cursors are supported only on protocol version 3 and higher, but the HTTP server only supports version ${endpoint.version}.`);
		return this.#createRequest(new URL(endpoint.cursorPath, this.#baseUrl), {
			baton: this.#baton,
			batch: entry.batch
		}, endpoint.encoding, CursorReqBody$1, CursorReqBody);
	}
	#createRequest(url, reqBody, encoding, jsonFun, protobufFun) {
		let bodyData;
		let contentType;
		if (encoding === "json") {
			bodyData = writeJsonObject(reqBody, jsonFun);
			contentType = "application/json";
		} else if (encoding === "protobuf") {
			bodyData = writeProtobufMessage(reqBody, protobufFun);
			contentType = "application/x-protobuf";
		} else throw impossible(encoding, "Impossible encoding");
		const headers = new Headers();
		headers.set("content-type", contentType);
		if (this.#jwt !== void 0) headers.set("authorization", `Bearer ${this.#jwt}`);
		if (this.#remoteEncryptionKey !== void 0) headers.set("x-turso-encryption-key", this.#remoteEncryptionKey);
		return new Request(url.toString(), {
			method: "POST",
			headers,
			body: bodyData
		});
	}
};
function handlePipelineResponse(pipeline, respBody) {
	if (respBody.results.length !== pipeline.length) throw new ProtoError("Server returned unexpected number of pipeline results");
	for (let i = 0; i < pipeline.length; ++i) {
		const result = respBody.results[i];
		const entry = pipeline[i];
		if (result.type === "ok") {
			if (result.response.type !== entry.request.type) throw new ProtoError("Received unexpected type of response");
			entry.responseCallback(result.response);
		} else if (result.type === "error") entry.errorCallback(errorFromProto(result.error));
		else if (result.type === "none") throw new ProtoError("Received unrecognized type of StreamResult");
		else throw impossible(result, "Received impossible type of StreamResult");
	}
}
async function decodePipelineResponse(resp, encoding) {
	if (encoding === "json") return readJsonObject(await resp.json(), PipelineRespBody$1);
	if (encoding === "protobuf") {
		const respData = await resp.arrayBuffer();
		return readProtobufMessage(new Uint8Array(respData), PipelineRespBody);
	}
	await resp.body?.cancel();
	throw impossible(encoding, "Impossible encoding");
}
async function errorFromResponse(resp) {
	const respType = resp.headers.get("content-type") ?? "text/plain";
	let message = `Server returned HTTP status ${resp.status}`;
	if (respType === "application/json") {
		const respBody = await resp.json();
		if ("message" in respBody) return errorFromProto(respBody);
		return new HttpServerError(message, resp.status);
	}
	if (respType === "text/plain") {
		const respBody = (await resp.text()).trim();
		if (respBody !== "") message += `: ${respBody}`;
		return new HttpServerError(message, resp.status);
	}
	await resp.body?.cancel();
	return new HttpServerError(message, resp.status);
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/http/client.js
var checkEndpoints = [{
	versionPath: "v3-protobuf",
	pipelinePath: "v3-protobuf/pipeline",
	cursorPath: "v3-protobuf/cursor",
	version: 3,
	encoding: "protobuf"
}];
var fallbackEndpoint = {
	versionPath: "v2",
	pipelinePath: "v2/pipeline",
	cursorPath: void 0,
	version: 2,
	encoding: "json"
};
/** A client for the Hrana protocol over HTTP. */
var HttpClient$1 = class extends Client {
	#url;
	#jwt;
	#fetch;
	#remoteEncryptionKey;
	#closed;
	#streams;
	/** @private */
	_endpointPromise;
	/** @private */
	_endpoint;
	/** @private */
	constructor(url, jwt, customFetch, remoteEncryptionKey, protocolVersion = 2) {
		super();
		this.#url = url;
		this.#jwt = jwt;
		this.#fetch = customFetch ?? globalThis.fetch;
		this.#remoteEncryptionKey = remoteEncryptionKey;
		this.#closed = void 0;
		this.#streams = /* @__PURE__ */ new Set();
		if (protocolVersion == 3) {
			this._endpointPromise = findEndpoint(this.#fetch, this.#url);
			this._endpointPromise.then((endpoint) => this._endpoint = endpoint, (error) => this.#setClosed(error));
		} else {
			this._endpointPromise = Promise.resolve(fallbackEndpoint);
			this._endpointPromise.then((endpoint) => this._endpoint = endpoint, (error) => this.#setClosed(error));
		}
	}
	/** Get the protocol version supported by the server. */
	async getVersion() {
		if (this._endpoint !== void 0) return this._endpoint.version;
		return (await this._endpointPromise).version;
	}
	/** @private */
	_ensureVersion(minVersion, feature) {
		if (minVersion <= fallbackEndpoint.version) return;
		else if (this._endpoint === void 0) throw new ProtocolVersionError(`${feature} is supported only on protocol version ${minVersion} and higher, but the version supported by the HTTP server is not yet known. Use Client.getVersion() to wait until the version is available.`);
		else if (this._endpoint.version < minVersion) throw new ProtocolVersionError(`${feature} is supported only on protocol version ${minVersion} and higher, but the HTTP server only supports version ${this._endpoint.version}.`);
	}
	/** Open a {@link HttpStream}, a stream for executing SQL statements. */
	openStream() {
		if (this.#closed !== void 0) throw new ClosedError("Client is closed", this.#closed);
		const stream = new HttpStream(this, this.#url, this.#jwt, this.#fetch, this.#remoteEncryptionKey);
		this.#streams.add(stream);
		return stream;
	}
	/** @private */
	_streamClosed(stream) {
		this.#streams.delete(stream);
	}
	/** Close the client and all its streams. */
	close() {
		this.#setClosed(new ClientError("Client was manually closed"));
	}
	/** True if the client is closed. */
	get closed() {
		return this.#closed !== void 0;
	}
	#setClosed(error) {
		if (this.#closed !== void 0) return;
		this.#closed = error;
		for (const stream of Array.from(this.#streams)) stream._setClosed(new ClosedError("Client was closed", error));
	}
};
async function findEndpoint(customFetch, clientUrl) {
	const fetch = customFetch;
	for (const endpoint of checkEndpoints) {
		const url = new URL(endpoint.versionPath, clientUrl);
		const response = await fetch(new Request(url.toString(), { method: "GET" }));
		await response.arrayBuffer();
		if (response.ok) return endpoint;
	}
	return fallbackEndpoint;
}
//#endregion
//#region node_modules/@libsql/hrana-client/lib-esm/index.js
/** Open a Hrana client over WebSocket connected to the given `url`. */
function openWs(url, jwt, protocolVersion = 2) {
	if (typeof import_websocket.default === "undefined") throw new WebSocketUnsupportedError("WebSockets are not supported in this environment");
	var subprotocols = void 0;
	if (protocolVersion == 3) subprotocols = Array.from(subprotocolsV3.keys());
	else subprotocols = Array.from(subprotocolsV2.keys());
	return new WsClient$1(new import_websocket.default(url, subprotocols), jwt);
}
/** Open a Hrana client over HTTP connected to the given `url`.
*
* If the `customFetch` argument is passed and not `undefined`, it is used in place of the `fetch` function
* from the global `fetch`. This function is always called with a global `Request` object.
*/
function openHttp(url, jwt, customFetch, remoteEncryptionKey, protocolVersion = 2) {
	return new HttpClient$1(url instanceof URL ? url : new URL(url), jwt, customFetch, remoteEncryptionKey, protocolVersion);
}
//#endregion
//#region node_modules/@libsql/client/lib-esm/hrana.js
var HranaTransaction = class {
	#mode;
	#version;
	#started;
	/** @private */
	constructor(mode, version) {
		this.#mode = mode;
		this.#version = version;
		this.#started = void 0;
	}
	execute(stmt) {
		return this.batch([stmt]).then((results) => results[0]);
	}
	async batch(stmts) {
		const stream = this._getStream();
		if (stream.closed) throw new LibsqlError("Cannot execute statements because the transaction is closed", "TRANSACTION_CLOSED");
		try {
			const hranaStmts = stmts.map(stmtToHrana);
			let rowsPromises;
			if (this.#started === void 0) {
				this._getSqlCache().apply(hranaStmts);
				const batch = stream.batch(this.#version >= 3);
				const beginStep = batch.step();
				const beginPromise = beginStep.run(transactionModeToBegin(this.#mode));
				let lastStep = beginStep;
				rowsPromises = hranaStmts.map((hranaStmt) => {
					const stmtStep = batch.step().condition(BatchCond$2.ok(lastStep));
					if (this.#version >= 3) stmtStep.condition(BatchCond$2.not(BatchCond$2.isAutocommit(batch)));
					const rowsPromise = stmtStep.query(hranaStmt);
					rowsPromise.catch(() => void 0);
					lastStep = stmtStep;
					return rowsPromise;
				});
				this.#started = batch.execute().then(() => beginPromise).then(() => void 0);
				try {
					await this.#started;
				} catch (e) {
					this.close();
					throw e;
				}
			} else {
				if (this.#version < 3) await this.#started;
				this._getSqlCache().apply(hranaStmts);
				const batch = stream.batch(this.#version >= 3);
				let lastStep = void 0;
				rowsPromises = hranaStmts.map((hranaStmt) => {
					const stmtStep = batch.step();
					if (lastStep !== void 0) stmtStep.condition(BatchCond$2.ok(lastStep));
					if (this.#version >= 3) stmtStep.condition(BatchCond$2.not(BatchCond$2.isAutocommit(batch)));
					const rowsPromise = stmtStep.query(hranaStmt);
					rowsPromise.catch(() => void 0);
					lastStep = stmtStep;
					return rowsPromise;
				});
				await batch.execute();
			}
			const resultSets = [];
			for (let i = 0; i < rowsPromises.length; i++) try {
				const rows = await rowsPromises[i];
				if (rows === void 0) throw new LibsqlBatchError("Statement in a transaction was not executed, probably because the transaction has been rolled back", i, "TRANSACTION_CLOSED");
				resultSets.push(resultSetFromHrana(rows));
			} catch (e) {
				if (e instanceof LibsqlBatchError) throw e;
				const mappedError = mapHranaError(e);
				if (mappedError instanceof LibsqlError) throw new LibsqlBatchError(mappedError.message, i, mappedError.code, mappedError.extendedCode, mappedError.rawCode, mappedError.cause instanceof Error ? mappedError.cause : void 0);
				throw mappedError;
			}
			return resultSets;
		} catch (e) {
			throw mapHranaError(e);
		}
	}
	async executeMultiple(sql) {
		const stream = this._getStream();
		if (stream.closed) throw new LibsqlError("Cannot execute statements because the transaction is closed", "TRANSACTION_CLOSED");
		try {
			if (this.#started === void 0) {
				this.#started = stream.run(transactionModeToBegin(this.#mode)).then(() => void 0);
				try {
					await this.#started;
				} catch (e) {
					this.close();
					throw e;
				}
			} else await this.#started;
			await stream.sequence(sql);
		} catch (e) {
			throw mapHranaError(e);
		}
	}
	async rollback() {
		try {
			const stream = this._getStream();
			if (stream.closed) return;
			if (this.#started !== void 0) {} else return;
			const promise = stream.run("ROLLBACK").catch((e) => {
				throw mapHranaError(e);
			});
			stream.closeGracefully();
			await promise;
		} catch (e) {
			throw mapHranaError(e);
		} finally {
			this.close();
		}
	}
	async commit() {
		try {
			const stream = this._getStream();
			if (stream.closed) throw new LibsqlError("Cannot commit the transaction because it is already closed", "TRANSACTION_CLOSED");
			if (this.#started !== void 0) await this.#started;
			else return;
			const promise = stream.run("COMMIT").catch((e) => {
				throw mapHranaError(e);
			});
			stream.closeGracefully();
			await promise;
		} catch (e) {
			throw mapHranaError(e);
		} finally {
			this.close();
		}
	}
};
async function executeHranaBatch(mode, version, batch, hranaStmts, disableForeignKeys = false) {
	if (disableForeignKeys) batch.step().run("PRAGMA foreign_keys=off");
	const beginStep = batch.step();
	const beginPromise = beginStep.run(transactionModeToBegin(mode));
	let lastStep = beginStep;
	const stmtPromises = hranaStmts.map((hranaStmt) => {
		const stmtStep = batch.step().condition(BatchCond$2.ok(lastStep));
		if (version >= 3) stmtStep.condition(BatchCond$2.not(BatchCond$2.isAutocommit(batch)));
		const stmtPromise = stmtStep.query(hranaStmt);
		lastStep = stmtStep;
		return stmtPromise;
	});
	const commitStep = batch.step().condition(BatchCond$2.ok(lastStep));
	if (version >= 3) commitStep.condition(BatchCond$2.not(BatchCond$2.isAutocommit(batch)));
	const commitPromise = commitStep.run("COMMIT");
	batch.step().condition(BatchCond$2.not(BatchCond$2.ok(commitStep))).run("ROLLBACK").catch((_) => void 0);
	if (disableForeignKeys) batch.step().run("PRAGMA foreign_keys=on");
	await batch.execute();
	const resultSets = [];
	await beginPromise;
	for (let i = 0; i < stmtPromises.length; i++) try {
		const hranaRows = await stmtPromises[i];
		if (hranaRows === void 0) throw new LibsqlBatchError("Statement in a batch was not executed, probably because the transaction has been rolled back", i, "TRANSACTION_CLOSED");
		resultSets.push(resultSetFromHrana(hranaRows));
	} catch (e) {
		if (e instanceof LibsqlBatchError) throw e;
		const mappedError = mapHranaError(e);
		if (mappedError instanceof LibsqlError) throw new LibsqlBatchError(mappedError.message, i, mappedError.code, mappedError.extendedCode, mappedError.rawCode, mappedError.cause instanceof Error ? mappedError.cause : void 0);
		throw mappedError;
	}
	await commitPromise;
	return resultSets;
}
function stmtToHrana(stmt) {
	let sql;
	let args;
	if (Array.isArray(stmt)) [sql, args] = stmt;
	else if (typeof stmt === "string") sql = stmt;
	else {
		sql = stmt.sql;
		args = stmt.args;
	}
	const hranaStmt = new Stmt$2(sql);
	if (args) {
		if (Array.isArray(args)) hranaStmt.bindIndexes(args);
		else for (const [key, value] of Object.entries(args)) hranaStmt.bindName(key, value);
	}
	return hranaStmt;
}
function resultSetFromHrana(hranaRows) {
	const columns = hranaRows.columnNames.map((c) => c ?? "");
	const columnTypes = hranaRows.columnDecltypes.map((c) => c ?? "");
	const rows = hranaRows.rows;
	const rowsAffected = hranaRows.affectedRowCount;
	return new ResultSetImpl(columns, columnTypes, rows, rowsAffected, hranaRows.lastInsertRowid !== void 0 ? hranaRows.lastInsertRowid : void 0);
}
function mapHranaError(e) {
	if (e instanceof ClientError) {
		const code = mapHranaErrorCode(e);
		return new LibsqlError(e.message, code, void 0, void 0, e);
	}
	return e;
}
function mapHranaErrorCode(e) {
	if (e instanceof ResponseError && e.code !== void 0) return e.code;
	else if (e instanceof ProtoError) return "HRANA_PROTO_ERROR";
	else if (e instanceof ClosedError) return e.cause instanceof ClientError ? mapHranaErrorCode(e.cause) : "HRANA_CLOSED_ERROR";
	else if (e instanceof WebSocketError) return "HRANA_WEBSOCKET_ERROR";
	else if (e instanceof HttpServerError) return "SERVER_ERROR";
	else if (e instanceof ProtocolVersionError) return "PROTOCOL_VERSION_ERROR";
	else if (e instanceof InternalError) return "INTERNAL_ERROR";
	else return "UNKNOWN";
}
//#endregion
//#region node_modules/@libsql/client/lib-esm/sql_cache.js
var SqlCache = class {
	#owner;
	#sqls;
	capacity;
	constructor(owner, capacity) {
		this.#owner = owner;
		this.#sqls = new Lru();
		this.capacity = capacity;
	}
	apply(hranaStmts) {
		if (this.capacity <= 0) return;
		const usedSqlObjs = /* @__PURE__ */ new Set();
		for (const hranaStmt of hranaStmts) {
			if (typeof hranaStmt.sql !== "string") continue;
			const sqlText = hranaStmt.sql;
			if (sqlText.length >= 5e3) continue;
			let sqlObj = this.#sqls.get(sqlText);
			if (sqlObj === void 0) {
				while (this.#sqls.size + 1 > this.capacity) {
					const [evictSqlText, evictSqlObj] = this.#sqls.peekLru();
					if (usedSqlObjs.has(evictSqlObj)) break;
					evictSqlObj.close();
					this.#sqls.delete(evictSqlText);
				}
				if (this.#sqls.size + 1 <= this.capacity) {
					sqlObj = this.#owner.storeSql(sqlText);
					this.#sqls.set(sqlText, sqlObj);
				}
			}
			if (sqlObj !== void 0) {
				hranaStmt.sql = sqlObj;
				usedSqlObjs.add(sqlObj);
			}
		}
	}
};
var Lru = class {
	#cache;
	constructor() {
		this.#cache = /* @__PURE__ */ new Map();
	}
	get(key) {
		const value = this.#cache.get(key);
		if (value !== void 0) {
			this.#cache.delete(key);
			this.#cache.set(key, value);
		}
		return value;
	}
	set(key, value) {
		this.#cache.set(key, value);
	}
	peekLru() {
		for (const entry of this.#cache.entries()) return entry;
	}
	delete(key) {
		this.#cache.delete(key);
	}
	get size() {
		return this.#cache.size;
	}
};
//#endregion
//#region node_modules/@libsql/client/lib-esm/ws.js
var import_promise_limit = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	function limiter(count) {
		var outstanding = 0;
		var jobs = [];
		function remove() {
			outstanding--;
			if (outstanding < count) dequeue();
		}
		function dequeue() {
			var job = jobs.shift();
			semaphore.queue = jobs.length;
			if (job) run(job.fn).then(job.resolve).catch(job.reject);
		}
		function queue(fn) {
			return new Promise(function(resolve, reject) {
				jobs.push({
					fn,
					resolve,
					reject
				});
				semaphore.queue = jobs.length;
			});
		}
		function run(fn) {
			outstanding++;
			try {
				return Promise.resolve(fn()).then(function(result) {
					remove();
					return result;
				}, function(error) {
					remove();
					throw error;
				});
			} catch (err) {
				remove();
				return Promise.reject(err);
			}
		}
		var semaphore = function(fn) {
			if (outstanding >= count) return queue(fn);
			else return run(fn);
		};
		return semaphore;
	}
	function map(items, mapper) {
		var failed = false;
		var limit = this;
		return Promise.all(items.map(function() {
			var args = arguments;
			return limit(function() {
				if (!failed) return mapper.apply(void 0, args).catch(function(e) {
					failed = true;
					throw e;
				});
			});
		}));
	}
	function addExtras(fn) {
		fn.queue = 0;
		fn.map = map;
		return fn;
	}
	module.exports = function(count) {
		if (count) return addExtras(limiter(count));
		else return addExtras(function(fn) {
			return fn();
		});
	};
})))(), 1);
/** @private */
function _createClient$2(config) {
	if (config.scheme !== "wss" && config.scheme !== "ws") throw new LibsqlError(`The WebSocket client supports only "libsql:", "wss:" and "ws:" URLs, got ${JSON.stringify(config.scheme + ":")}. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
	if (config.encryptionKey !== void 0) throw new LibsqlError("Encryption key is not supported by the remote client.", "ENCRYPTION_KEY_NOT_SUPPORTED");
	if (config.scheme === "ws" && config.tls) throw new LibsqlError(`A "ws:" URL cannot opt into TLS by using ?tls=1`, "URL_INVALID");
	else if (config.scheme === "wss" && !config.tls) throw new LibsqlError(`A "wss:" URL cannot opt out of TLS by using ?tls=0`, "URL_INVALID");
	const url = encodeBaseUrl(config.scheme, config.authority, config.path);
	let client;
	try {
		client = openWs(url, config.authToken);
	} catch (e) {
		if (e instanceof WebSocketUnsupportedError) {
			const suggestedScheme = config.scheme === "wss" ? "https" : "http";
			const suggestedUrl = encodeBaseUrl(suggestedScheme, config.authority, config.path);
			throw new LibsqlError(`This environment does not support WebSockets, please switch to the HTTP client by using a "${suggestedScheme}:" URL (${JSON.stringify(suggestedUrl)}). For more information, please read ${supportedUrlLink}`, "WEBSOCKETS_NOT_SUPPORTED");
		}
		throw mapHranaError(e);
	}
	return new WsClient(client, url, config.authToken, config.intMode, config.concurrency);
}
var maxConnAgeMillis = 6e4;
var sqlCacheCapacity$1 = 100;
var WsClient = class {
	#url;
	#authToken;
	#intMode;
	#connState;
	#futureConnState;
	closed;
	protocol;
	#isSchemaDatabase;
	#promiseLimitFunction;
	/** @private */
	constructor(client, url, authToken, intMode, concurrency) {
		this.#url = url;
		this.#authToken = authToken;
		this.#intMode = intMode;
		this.#connState = this.#openConn(client);
		this.#futureConnState = void 0;
		this.closed = false;
		this.protocol = "ws";
		this.#promiseLimitFunction = (0, import_promise_limit.default)(concurrency);
	}
	async limit(fn) {
		return this.#promiseLimitFunction(fn);
	}
	async execute(stmtOrSql, args) {
		let stmt;
		if (typeof stmtOrSql === "string") stmt = {
			sql: stmtOrSql,
			args: args || []
		};
		else stmt = stmtOrSql;
		return this.limit(async () => {
			const streamState = await this.#openStream();
			try {
				const hranaStmt = stmtToHrana(stmt);
				streamState.conn.sqlCache.apply([hranaStmt]);
				const hranaRowsPromise = streamState.stream.query(hranaStmt);
				streamState.stream.closeGracefully();
				return resultSetFromHrana(await hranaRowsPromise);
			} catch (e) {
				throw mapHranaError(e);
			} finally {
				this._closeStream(streamState);
			}
		});
	}
	async batch(stmts, mode = "deferred") {
		return this.limit(async () => {
			const streamState = await this.#openStream();
			try {
				const hranaStmts = stmts.map((stmt) => {
					if (Array.isArray(stmt)) return {
						sql: stmt[0],
						args: stmt[1] || []
					};
					return stmt;
				}).map(stmtToHrana);
				const version = await streamState.conn.client.getVersion();
				streamState.conn.sqlCache.apply(hranaStmts);
				return await executeHranaBatch(mode, version, streamState.stream.batch(version >= 3), hranaStmts);
			} catch (e) {
				throw mapHranaError(e);
			} finally {
				this._closeStream(streamState);
			}
		});
	}
	async migrate(stmts) {
		return this.limit(async () => {
			const streamState = await this.#openStream();
			try {
				const hranaStmts = stmts.map(stmtToHrana);
				const version = await streamState.conn.client.getVersion();
				return await executeHranaBatch("deferred", version, streamState.stream.batch(version >= 3), hranaStmts, true);
			} catch (e) {
				throw mapHranaError(e);
			} finally {
				this._closeStream(streamState);
			}
		});
	}
	async transaction(mode = "write") {
		return this.limit(async () => {
			const streamState = await this.#openStream();
			try {
				const version = await streamState.conn.client.getVersion();
				return new WsTransaction(this, streamState, mode, version);
			} catch (e) {
				this._closeStream(streamState);
				throw mapHranaError(e);
			}
		});
	}
	async executeMultiple(sql) {
		return this.limit(async () => {
			const streamState = await this.#openStream();
			try {
				const promise = streamState.stream.sequence(sql);
				streamState.stream.closeGracefully();
				await promise;
			} catch (e) {
				throw mapHranaError(e);
			} finally {
				this._closeStream(streamState);
			}
		});
	}
	sync() {
		throw new LibsqlError("sync not supported in ws mode", "SYNC_NOT_SUPPORTED");
	}
	async #openStream() {
		if (this.closed) throw new LibsqlError("The client is closed", "CLIENT_CLOSED");
		if ((/* @__PURE__ */ new Date()).valueOf() - this.#connState.openTime.valueOf() > maxConnAgeMillis && this.#futureConnState === void 0) {
			const futureConnState = this.#openConn();
			this.#futureConnState = futureConnState;
			futureConnState.client.getVersion().then((_version) => {
				if (this.#connState !== futureConnState) {
					if (this.#connState.streamStates.size === 0) this.#connState.client.close();
				}
				this.#connState = futureConnState;
				this.#futureConnState = void 0;
			}, (_e) => {
				this.#futureConnState = void 0;
			});
		}
		if (this.#connState.client.closed) try {
			if (this.#futureConnState !== void 0) this.#connState = this.#futureConnState;
			else this.#connState = this.#openConn();
		} catch (e) {
			throw mapHranaError(e);
		}
		const connState = this.#connState;
		try {
			if (connState.useSqlCache === void 0) {
				connState.useSqlCache = await connState.client.getVersion() >= 2;
				if (connState.useSqlCache) connState.sqlCache.capacity = sqlCacheCapacity$1;
			}
			const stream = connState.client.openStream();
			stream.intMode = this.#intMode;
			const streamState = {
				conn: connState,
				stream
			};
			connState.streamStates.add(streamState);
			return streamState;
		} catch (e) {
			throw mapHranaError(e);
		}
	}
	#openConn(client) {
		try {
			client ??= openWs(this.#url, this.#authToken);
			return {
				client,
				useSqlCache: void 0,
				sqlCache: new SqlCache(client, 0),
				openTime: /* @__PURE__ */ new Date(),
				streamStates: /* @__PURE__ */ new Set()
			};
		} catch (e) {
			throw mapHranaError(e);
		}
	}
	async reconnect() {
		try {
			for (const st of Array.from(this.#connState.streamStates)) try {
				st.stream.close();
			} catch {}
			this.#connState.client.close();
		} catch {}
		if (this.#futureConnState) {
			try {
				this.#futureConnState.client.close();
			} catch {}
			this.#futureConnState = void 0;
		}
		const next = this.#openConn();
		next.useSqlCache = await next.client.getVersion() >= 2;
		if (next.useSqlCache) next.sqlCache.capacity = sqlCacheCapacity$1;
		this.#connState = next;
		this.closed = false;
	}
	_closeStream(streamState) {
		streamState.stream.close();
		const connState = streamState.conn;
		connState.streamStates.delete(streamState);
		if (connState.streamStates.size === 0 && connState !== this.#connState) connState.client.close();
	}
	close() {
		this.#connState.client.close();
		this.closed = true;
		if (this.#futureConnState) {
			try {
				this.#futureConnState.client.close();
			} catch {}
			this.#futureConnState = void 0;
		}
		this.closed = true;
	}
};
var WsTransaction = class extends HranaTransaction {
	#client;
	#streamState;
	/** @private */
	constructor(client, state, mode, version) {
		super(mode, version);
		this.#client = client;
		this.#streamState = state;
	}
	/** @private */
	_getStream() {
		return this.#streamState.stream;
	}
	/** @private */
	_getSqlCache() {
		return this.#streamState.conn.sqlCache;
	}
	close() {
		this.#client._closeStream(this.#streamState);
	}
	get closed() {
		return this.#streamState.stream.closed;
	}
};
//#endregion
//#region node_modules/@libsql/client/lib-esm/http.js
/** @private */
function _createClient$1(config) {
	if (config.scheme !== "https" && config.scheme !== "http") throw new LibsqlError(`The HTTP client supports only "libsql:", "https:" and "http:" URLs, got ${JSON.stringify(config.scheme + ":")}. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
	if (config.encryptionKey !== void 0) throw new LibsqlError("Encryption key is not supported by the remote client.", "ENCRYPTION_KEY_NOT_SUPPORTED");
	if (config.scheme === "http" && config.tls) throw new LibsqlError(`A "http:" URL cannot opt into TLS by using ?tls=1`, "URL_INVALID");
	else if (config.scheme === "https" && !config.tls) throw new LibsqlError(`A "https:" URL cannot opt out of TLS by using ?tls=0`, "URL_INVALID");
	return new HttpClient(encodeBaseUrl(config.scheme, config.authority, config.path), config.authToken, config.intMode, config.fetch, config.concurrency, config.remoteEncryptionKey);
}
var sqlCacheCapacity = 30;
var HttpClient = class {
	#client;
	protocol;
	#url;
	#intMode;
	#customFetch;
	#concurrency;
	#authToken;
	#remoteEncryptionKey;
	#promiseLimitFunction;
	/** @private */
	constructor(url, authToken, intMode, customFetch, concurrency, remoteEncryptionKey) {
		this.#url = url;
		this.#authToken = authToken;
		this.#intMode = intMode;
		this.#customFetch = customFetch;
		this.#concurrency = concurrency;
		this.#remoteEncryptionKey = remoteEncryptionKey;
		this.#client = openHttp(this.#url, this.#authToken, this.#customFetch, remoteEncryptionKey);
		this.#client.intMode = this.#intMode;
		this.protocol = "http";
		this.#promiseLimitFunction = (0, import_promise_limit.default)(this.#concurrency);
	}
	async limit(fn) {
		return this.#promiseLimitFunction(fn);
	}
	async execute(stmtOrSql, args) {
		let stmt;
		if (typeof stmtOrSql === "string") stmt = {
			sql: stmtOrSql,
			args: args || []
		};
		else stmt = stmtOrSql;
		return this.limit(async () => {
			try {
				const hranaStmt = stmtToHrana(stmt);
				let rowsPromise;
				const stream = this.#client.openStream();
				try {
					rowsPromise = stream.query(hranaStmt);
				} finally {
					stream.closeGracefully();
				}
				return resultSetFromHrana(await rowsPromise);
			} catch (e) {
				throw mapHranaError(e);
			}
		});
	}
	async batch(stmts, mode = "deferred") {
		return this.limit(async () => {
			try {
				const hranaStmts = stmts.map((stmt) => {
					if (Array.isArray(stmt)) return {
						sql: stmt[0],
						args: stmt[1] || []
					};
					return stmt;
				}).map(stmtToHrana);
				const version = await this.#client.getVersion();
				let resultsPromise;
				const stream = this.#client.openStream();
				try {
					new SqlCache(stream, sqlCacheCapacity).apply(hranaStmts);
					resultsPromise = executeHranaBatch(mode, version, stream.batch(false), hranaStmts);
				} finally {
					stream.closeGracefully();
				}
				return await resultsPromise;
			} catch (e) {
				throw mapHranaError(e);
			}
		});
	}
	async migrate(stmts) {
		return this.limit(async () => {
			try {
				const hranaStmts = stmts.map(stmtToHrana);
				const version = await this.#client.getVersion();
				let resultsPromise;
				const stream = this.#client.openStream();
				try {
					resultsPromise = executeHranaBatch("deferred", version, stream.batch(false), hranaStmts, true);
				} finally {
					stream.closeGracefully();
				}
				return await resultsPromise;
			} catch (e) {
				throw mapHranaError(e);
			}
		});
	}
	async transaction(mode = "write") {
		return this.limit(async () => {
			try {
				const version = await this.#client.getVersion();
				return new HttpTransaction(this.#client.openStream(), mode, version);
			} catch (e) {
				throw mapHranaError(e);
			}
		});
	}
	async executeMultiple(sql) {
		return this.limit(async () => {
			try {
				let promise;
				const stream = this.#client.openStream();
				try {
					promise = stream.sequence(sql);
				} finally {
					stream.closeGracefully();
				}
				await promise;
			} catch (e) {
				throw mapHranaError(e);
			}
		});
	}
	sync() {
		throw new LibsqlError("sync not supported in http mode", "SYNC_NOT_SUPPORTED");
	}
	close() {
		this.#client.close();
	}
	async reconnect() {
		try {
			if (!this.closed) this.#client.close();
		} finally {
			this.#client = openHttp(this.#url, this.#authToken, this.#customFetch, this.#remoteEncryptionKey);
			this.#client.intMode = this.#intMode;
		}
	}
	get closed() {
		return this.#client.closed;
	}
};
var HttpTransaction = class extends HranaTransaction {
	#stream;
	#sqlCache;
	/** @private */
	constructor(stream, mode, version) {
		super(mode, version);
		this.#stream = stream;
		this.#sqlCache = new SqlCache(stream, sqlCacheCapacity);
	}
	/** @private */
	_getStream() {
		return this.#stream;
	}
	/** @private */
	_getSqlCache() {
		return this.#sqlCache;
	}
	close() {
		this.#stream.close();
	}
	get closed() {
		return this.#stream.closed;
	}
};
//#endregion
//#region node_modules/@libsql/client/lib-esm/node.js
var node_exports = /* @__PURE__ */ __exportAll({
	LibsqlBatchError: () => LibsqlBatchError,
	LibsqlError: () => LibsqlError,
	createClient: () => createClient
});
/** Creates a {@link Client} object.
*
* You must pass at least an `url` in the {@link Config} object.
*/
function createClient(config) {
	return _createClient(expandConfig(config, true));
}
function _createClient(config) {
	if (config.scheme === "wss" || config.scheme === "ws") return _createClient$2(config);
	else if (config.scheme === "https" || config.scheme === "http") return _createClient$1(config);
	else return _createClient$3(config);
}
//#endregion
export { node_exports as t };
