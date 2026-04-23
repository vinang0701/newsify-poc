// Polyfill DOMException BEFORE anything else
// if (typeof global.DOMException === "undefined") {
//     global.DOMException = class DOMException extends Error {
//         constructor(message?: string, name?: string) {
//             super(message);
//             this.name = name || "Error";
//         }
//     } as any;
// }
// Then load Expo Router
import "./utils/polyfills";
import "expo-router/entry";
