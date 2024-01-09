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

const { createCodec } =
  typeof window !== 'undefined' && typeof window.document !== 'undefined'
    ? require("./browser.js")
    : require("./node.js");

export const createParser = (key: string) => {
  const codec: {
    serialize: <T>(data: T) => Uint8Array;
    deserialize: <T>(data: ArrayBufferLike) => T;
  } = createCodec(key);

  class Encoder {
    encode(packet: unknown) {
      return [codec.serialize(packet)];
    }
  }

  return {
    protocol: 5,
    PacketType: {
      CONNECT: 0,
      DISCONNECT: 1,
      EVENT: 2,
      ACK: 3,
      CONNECT_ERROR: 4,
    },
    Encoder,
  };
};

export default createParser;
