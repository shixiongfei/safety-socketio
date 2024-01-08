/*
 * node.ts
 *
 * Copyright (c) 2024 Xiongfei Shi
 *
 * Author: Xiongfei Shi <xiongfei.shi(a)icloud.com>
 * License: Apache-2.0
 *
 * https://github.com/shixiongfei/safety-socketio
 */

import crypto, { BinaryLike } from "node:crypto";
import { encode, decode } from "@msgpack/msgpack";
import { ensureUint8Array, concatUint8Arrays } from "./utils.js";

const encrypt = (secret: Buffer, data: BinaryLike) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-128-ctr", secret, iv);
  return concatUint8Arrays([iv, cipher.update(data), cipher.final()]);
};

const decrypt = (secret: Buffer, data: ArrayBufferLike) => {
  const buffer = ensureUint8Array(data);
  const iv = buffer.subarray(0, 16);
  const content = buffer.subarray(16);
  const decipher = crypto.createDecipheriv("aes-128-ctr", secret, iv);
  return concatUint8Arrays([decipher.update(content), decipher.final()]);
};

export const createCodec = (key: string) => {
  const secret = crypto.createHash("md5").update(key).digest();

  const serialize = <T>(data: T) => encrypt(secret, encode(data));

  const deserialize = <T>(data: ArrayBufferLike) =>
    decode(decrypt(secret, data)) as T;

  return { serialize: serialize, deserialize: deserialize };
};

export default createCodec;
