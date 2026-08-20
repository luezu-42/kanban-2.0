import { r as __exportAll } from "../_runtime.mjs";
//#region node_modules/browser-fs-access/dist/directory-open-01563666.js
var directory_open_01563666_exports = /* @__PURE__ */ __exportAll({ default: () => e$5 });
var e$5 = async (e = [{}]) => (Array.isArray(e) || (e = [e]), e[0].recursive = e[0].recursive || !1, new Promise((t, r) => {
	const i = document.createElement("input");
	i.type = "file", i.webkitdirectory = !0;
	const c = (e) => {
		"function" == typeof a && a(), t(e);
	}, a = e[0].legacySetup && e[0].legacySetup(c, () => a(r), i);
	i.addEventListener("change", () => {
		let t = Array.from(i.files);
		e[0].recursive ? e[0].recursive && e[0].skipDirectory && (t = t.filter((t) => t.webkitRelativePath.split("/").every((t) => !e[0].skipDirectory({
			name: t,
			kind: "directory"
		})))) : t = t.filter((e) => 2 === e.webkitRelativePath.split("/").length), c(t);
	}), i.click();
}));
//#endregion
//#region node_modules/browser-fs-access/dist/directory-open-4ed118d0.js
var directory_open_4ed118d0_exports = /* @__PURE__ */ __exportAll({ default: () => t$1 });
function e$4(r) {
	function t(e) {
		if (Object(e) !== e) return Promise.reject(/* @__PURE__ */ new TypeError(e + " is not an object."));
		var r = e.done;
		return Promise.resolve(e.value).then(function(e) {
			return {
				value: e,
				done: r
			};
		});
	}
	return e$4 = function(e) {
		this.s = e, this.n = e.next;
	}, e$4.prototype = {
		s: null,
		n: null,
		next: function() {
			return t(this.n.apply(this.s, arguments));
		},
		return: function(e) {
			var r = this.s.return;
			return void 0 === r ? Promise.resolve({
				value: e,
				done: !0
			}) : t(r.apply(this.s, arguments));
		},
		throw: function(e) {
			var r = this.s.return;
			return void 0 === r ? Promise.reject(e) : t(r.apply(this.s, arguments));
		}
	}, new e$4(r);
}
var r = async (t, n, i = t.name, a) => {
	const o = [], l = [];
	var s, u = !1, c = !1;
	try {
		for (var y, f = function(r) {
			var t, n, i, a = 2;
			for ("undefined" != typeof Symbol && (n = Symbol.asyncIterator, i = Symbol.iterator); a--;) {
				if (n && null != (t = r[n])) return t.call(r);
				if (i && null != (t = r[i])) return new e$4(t.call(r));
				n = "@@asyncIterator", i = "@@iterator";
			}
			throw new TypeError("Object is not async iterable");
		}(t.values()); u = !(y = await f.next()).done; u = !1) {
			const e = y.value, s = `${i}/${e.name}`;
			"file" === e.kind ? l.push(e.getFile().then((r) => (r.directoryHandle = t, r.handle = e, Object.defineProperty(r, "webkitRelativePath", {
				configurable: !0,
				enumerable: !0,
				get: () => s
			})))) : "directory" !== e.kind || !n || a && a(e) || o.push(r(e, n, s, a));
		}
	} catch (e) {
		c = !0, s = e;
	} finally {
		try {
			u && null != f.return && await f.return();
		} finally {
			if (c) throw s;
		}
	}
	return [...(await Promise.all(o)).flat(), ...await Promise.all(l)];
};
var t$1 = async (e = {}) => {
	e.recursive = e.recursive || !1;
	return r(await window.showDirectoryPicker({
		id: e.id,
		startIn: e.startIn
	}), e.recursive, void 0, e.skipDirectory);
};
//#endregion
//#region node_modules/browser-fs-access/dist/file-open-002ab408.js
var file_open_002ab408_exports = /* @__PURE__ */ __exportAll({ default: () => t });
var e$3 = async (e) => {
	const t = await e.getFile();
	return t.handle = e, t;
};
var t = async (t = [{}]) => {
	Array.isArray(t) || (t = [t]);
	const i = [];
	t.forEach((e, t) => {
		i[t] = {
			description: e.description || "",
			accept: {}
		}, e.mimeTypes ? e.mimeTypes.map((a) => {
			i[t].accept[a] = e.extensions || [];
		}) : i[t].accept["*/*"] = e.extensions || [];
	});
	const a = await window.showOpenFilePicker({
		id: t[0].id,
		startIn: t[0].startIn,
		types: i,
		multiple: t[0].multiple || !1,
		excludeAcceptAllOption: t[0].excludeAcceptAllOption || !1
	}), c = await Promise.all(a.map(e$3));
	return t[0].multiple ? c : c[0];
};
//#endregion
//#region node_modules/browser-fs-access/dist/file-open-7c801643.js
var file_open_7c801643_exports = /* @__PURE__ */ __exportAll({ default: () => e$2 });
var e$2 = async (e = [{}]) => (Array.isArray(e) || (e = [e]), new Promise((t, n) => {
	const a = document.createElement("input");
	a.type = "file";
	const i = [...e.map((e) => e.mimeTypes || []), ...e.map((e) => e.extensions || [])].join();
	a.multiple = e[0].multiple || !1, a.accept = i || "";
	const c = (e) => {
		"function" == typeof l && l(), t(e);
	}, l = e[0].legacySetup && e[0].legacySetup(c, () => l(n), a);
	a.addEventListener("change", () => {
		c(a.multiple ? Array.from(a.files) : a.files[0]);
	}), a.click();
}));
//#endregion
//#region node_modules/browser-fs-access/dist/file-save-3189631c.js
var file_save_3189631c_exports = /* @__PURE__ */ __exportAll({ default: () => e$1 });
var e$1 = async (e, t = {}) => {
	Array.isArray(t) && (t = t[0]);
	const n = document.createElement("a");
	let a = e;
	"body" in e && (a = await async function(e, t) {
		const n = e.getReader(), a = new ReadableStream({ start: (e) => async function t() {
			return n.read().then(({ done: n, value: a }) => {
				if (!n) return e.enqueue(a), t();
				e.close();
			});
		}() }), c = await new Response(a).blob();
		return n.releaseLock(), new Blob([c], { type: t });
	}(e.body, e.headers.get("content-type"))), n.download = t.fileName || "Untitled", n.href = URL.createObjectURL(await a);
	const r = () => {
		"function" == typeof c && c();
	}, c = t.legacySetup && t.legacySetup(r, () => c(reject), n);
	return n.addEventListener("click", () => {
		setTimeout(() => URL.revokeObjectURL(n.href), 3e4), r();
	}), n.click(), null;
};
//#endregion
//#region node_modules/browser-fs-access/dist/file-save-745eba88.js
var file_save_745eba88_exports = /* @__PURE__ */ __exportAll({ default: () => e });
var e = async (e, t = [{}], a = null, i = !1, n = null) => {
	Array.isArray(t) || (t = [t]), t[0].fileName = t[0].fileName || "Untitled";
	const s = [];
	let c = null;
	if (e instanceof Blob && e.type ? c = e.type : e.headers && e.headers.get("content-type") && (c = e.headers.get("content-type")), t.forEach((e, t) => {
		s[t] = {
			description: e.description || "",
			accept: {}
		}, e.mimeTypes ? (0 === t && c && e.mimeTypes.push(c), e.mimeTypes.map((a) => {
			s[t].accept[a] = e.extensions || [];
		})) : c && (s[t].accept[c] = e.extensions || []);
	}), a) try {
		await a.getFile();
	} catch (e) {
		if (a = null, i) throw e;
	}
	const r = a || await window.showSaveFilePicker({
		suggestedName: t[0].fileName,
		id: t[0].id,
		startIn: t[0].startIn,
		types: s,
		excludeAcceptAllOption: t[0].excludeAcceptAllOption || !1
	});
	!a && n && n();
	const l = await r.createWritable();
	if ("stream" in e) return await e.stream().pipeTo(l), r;
	return "body" in e ? (await e.body.pipeTo(l), r) : (await l.write(await e), await l.close(), r);
};
//#endregion
export { directory_open_4ed118d0_exports as a, file_open_002ab408_exports as i, file_save_3189631c_exports as n, directory_open_01563666_exports as o, file_open_7c801643_exports as r, file_save_745eba88_exports as t };
