const [createCodec, isBrowser, isNode] = (function () {
  if (typeof window !== "undefined" && window.crypto) {
    return [require("./browser"), true, false];
  }

  if (typeof require === "function") {
    return [require("./node"), false, true];
  }

  throw new Error("Native crypto module could not found.");
})();
