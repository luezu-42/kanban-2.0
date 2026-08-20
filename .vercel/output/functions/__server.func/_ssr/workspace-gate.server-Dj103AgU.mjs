import { r as getSql } from "./db-DiNR4WL6.mjs";
import { createHmac, scrypt, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/workspace-gate.server-Dj103AgU.js
var SCRYPT = {
	N: 16384,
	r: 8,
	p: 1,
	maxmem: 67108864
};
function sameBuffer(left, right) {
	if (left.length !== right.length) return false;
	return timingSafeEqual(left, right);
}
function sameText(left, right) {
	return sameBuffer(createHmac("sha256", "ledger-compare").update(left).digest(), createHmac("sha256", "ledger-compare").update(right).digest());
}
function hashPassword(password, saltHex) {
	const salt = Buffer.from(saltHex, "hex");
	return new Promise((resolve, reject) => {
		scrypt(password, salt, 64, SCRYPT, (error, derived) => {
			if (error) reject(error);
			else resolve(derived);
		});
	});
}
async function readAuth() {
	return (await (await getSql())`
    select salt, hash from workspace_auth where id = ${"ledger"} limit 1
  `)[0] ?? null;
}
function makeToken(row) {
	return createHmac("sha256", `${row.salt}:${row.hash}`).update("ledger-unlocked-v1").digest("hex");
}
async function unlockWithPassword(password) {
	const submitted = password.trim();
	if (!submitted) return {
		ok: false,
		token: ""
	};
	const envPassword = process.env.WORKSPACE_PASSWORD?.trim();
	const row = await readAuth();
	if (!row) return {
		ok: false,
		token: ""
	};
	let ok = false;
	if (envPassword) ok = sameText(submitted, envPassword);
	else ok = sameBuffer(await hashPassword(submitted, row.salt), Buffer.from(row.hash, "hex"));
	if (!ok) {
		await new Promise((resolve) => setTimeout(resolve, 400));
		return {
			ok: false,
			token: ""
		};
	}
	return {
		ok: true,
		token: makeToken(row)
	};
}
async function assertUnlock(token) {
	const row = await readAuth();
	if (!row || !token) throw new Error("Unauthorized");
	if (!sameBuffer(Buffer.from(makeToken(row)), Buffer.from(token))) throw new Error("Unauthorized");
}
//#endregion
export { assertUnlock, unlockWithPassword };
