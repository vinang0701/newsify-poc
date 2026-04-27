// utils/polyfills.ts

if (typeof global.DOMException === "undefined") {
    class PolyfillDOMException extends Error {
        readonly code: number;
        constructor(message = "", name?: string) {
            super(message);
            this.message = message;
            this.name = name ?? "Error";
            this.code = 0;
            Object.setPrototypeOf(this, PolyfillDOMException.prototype);
        }
    }
    // @ts-expect-error
    global.DOMException = PolyfillDOMException;
}
