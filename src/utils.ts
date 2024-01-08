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
  } else if (ArrayBuffer.isView(buffer)) {
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } else if (buffer instanceof ArrayBuffer) {
    return new Uint8Array(buffer);
  } else {
    return Uint8Array.from(buffer);
  }
};

export const concatUint8Arrays = (uint8arrays: Uint8Array[]) => {
  const totalLength = uint8arrays.reduce(
    (total, uint8array) => total + uint8array.byteLength,
    0,
  );

  const result = new Uint8Array(totalLength);
  let offset = 0;

  uint8arrays.forEach((uint8array) => {
    result.set(uint8array, offset);
    offset += uint8array.length;
  });

  return result;
};
