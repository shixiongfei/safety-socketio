/*
 * utils.ts
 *
 * Copyright (c) 2024 Xiongfei Shi
 *
 * Author: Xiongfei Shi <xiongfei.shi(a)icloud.com>
 * License: Apache-2.0
 *
 * https://github.com/shixiongfei/safety-socketio
 */

export const ensureUint8Array = (
  buffer: ArrayLike<number> | Uint8Array | ArrayBufferView | ArrayBuffer,
) => {
  if (buffer instanceof Uint8Array) {
    return buffer;
  }

  if (ArrayBuffer.isView(buffer)) {
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  }

  if (buffer instanceof ArrayBuffer) {
    return new Uint8Array(buffer);
  }

  return Uint8Array.from(buffer);
};
