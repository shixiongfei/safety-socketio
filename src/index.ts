/*
 * index.ts
 *
 * Copyright (c) 2024 Xiongfei Shi
 *
 * Author: Xiongfei Shi <xiongfei.shi(a)icloud.com>
 * License: Apache-2.0
 *
 * https://github.com/shixiongfei/safety-socketio
 */

const [createCodec, isBrowser, isNode] = (function () {
  if (typeof window !== "undefined" && window.crypto) {
    return [require("./browser"), true, false];
  }

  if (typeof require === "function") {
    return [require("./node"), false, true];
  }

  throw new Error("Native crypto module could not found.");
})();
