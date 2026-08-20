import { An as Color, Dn as adjustChannel, jn as Utils } from "./@excalidraw/mermaid-to-excalidraw+[...].mjs";
//#region node_modules/khroma/dist/methods/channel.js
var channel = (color, channel) => {
	return Utils.lang.round(Color.parse(color)[channel]);
};
//#endregion
//#region node_modules/khroma/dist/methods/transparentize.js
var transparentize = (color, amount) => {
	return adjustChannel(color, "a", -amount);
};
//#endregion
export { channel as n, transparentize as t };
