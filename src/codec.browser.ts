/*
 * codec.browser.ts
 *
 * Copyright (c) 2024 Xiongfei Shi
 *
 * Author: Xiongfei Shi <xiongfei.shi(a)icloud.com>
 * License: Apache-2.0
 *
 * https://github.com/shixiongfei/safety-socketio
 */

import crypto from "crypto-js";
import { decode, encode } from "msgpackr";
import { ensureUint8Array, concatUint8Arrays } from "./utils.js";

const toUint8Array = (wordArray: crypto.lib.WordArray) => {
  const length = wordArray.sigBytes;
  const words = wordArray.words;
  const result = new Uint8Array(length);
  let dst = 0;
  let src = 0;

  for (;;) {
    if (dst == length) break;

    const word = words[src++];
    result[dst++] = (word & 0xff000000) >>> 24;

    if (dst == length) break;
    result[dst++] = (word & 0x00ff0000) >>> 16;

    if (dst == length) break;
    result[dst++] = (word & 0x0000ff00) >>> 8;

    if (dst == length) break;
    result[dst++] = word & 0x000000ff;
  }

  return result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const encrypt = (secret: crypto.lib.WordArray, data: any) => {
  const content = crypto.lib.WordArray.create(data);
  const encrypted = crypto.AES.encrypt(content, secret, {
    mode: crypto.mode.CTR,
    padding: crypto.pad.NoPadding,
    iv: crypto.lib.WordArray.random(16),
    keySize: 128,
  });
  return concatUint8Arrays([
    toUint8Array(encrypted.iv),
    toUint8Array(crypto.enc.Base64.parse(encrypted.toString())),
  ]);
};

const decrypt = (secret: crypto.lib.WordArray, data: ArrayBufferLike) => {
  const buffer = ensureUint8Array(data);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const iv = crypto.lib.WordArray.create(buffer.subarray(0, 16) as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = crypto.lib.WordArray.create(buffer.subarray(16) as any);
  const encrypted = content.toString(crypto.enc.Base64);
  const decrypted = crypto.AES.decrypt(encrypted, secret, {
    mode: crypto.mode.CTR,
    padding: crypto.pad.NoPadding,
    iv: iv,
    keySize: 128,
  });
  return toUint8Array(decrypted);
};

export const createCodec = (key: string) => {
  const secret = crypto.MD5(key);

  const serialize = <T>(data: T) => encrypt(secret, encode(data));

  const deserialize = <T>(data: ArrayBufferLike) =>
    decode(decrypt(secret, data)) as T;

  return { serialize: serialize, deserialize: deserialize };
};

export default createCodec;
