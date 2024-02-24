/*
 * parser.ts
 *
 * Copyright (c) 2024 Xiongfei Shi
 *
 * Author: Xiongfei Shi <xiongfei.shi(a)icloud.com>
 * License: Apache-2.0
 *
 * https://github.com/shixiongfei/safety-socketio
 */

import Emitter from "component-emitter";
import createCodec from "./codec.js";

enum PacketType {
  CONNECT,
  DISCONNECT,
  EVENT,
  ACK,
  CONNECT_ERROR,
}

type Packet = {
  type: PacketType;
  nsp: string;
  data?: unknown;
  id?: number;
};

const isInteger =
  Number.isInteger ??
  ((value: unknown): value is number =>
    typeof value === "number" &&
    isFinite(value) &&
    Math.floor(value) === value);

const isString = (value: unknown): value is string => typeof value === "string";
const isObject = (value: unknown): value is object => typeof value === "object";

const isDataValid = (packet: Packet) => {
  switch (packet.type) {
    case PacketType.CONNECT:
      return packet.data === undefined || isObject(packet.data);

    case PacketType.DISCONNECT:
      return packet.data === undefined;

    case PacketType.EVENT:
      return Array.isArray(packet.data) && packet.data.length > 0;

    case PacketType.ACK:
      return Array.isArray(packet.data);

    case PacketType.CONNECT_ERROR:
      return isString(packet.data) || isObject(packet.data);

    default:
      return false;
  }
};

export type ParserCodec = {
  serialize: <T>(data: T) => Uint8Array;
  deserialize: <T>(data: ArrayBufferLike) => T;
};

export const createParser = (keyOrCodec: string | ParserCodec) => {
  const codec: ParserCodec = isString(keyOrCodec)
    ? createCodec(keyOrCodec)
    : keyOrCodec;

  const Encoder = function () {} as unknown as {
    new (): { encode(packet: unknown): Uint8Array[] };
  };

  Encoder.prototype.encode = function (packet: unknown) {
    return [codec.serialize(packet)];
  };

  const Decoder = function () {} as unknown as {
    new (): { add(chunk: ArrayBufferLike): void; destroy(): void };
  };

  Emitter(Decoder.prototype);

  Decoder.prototype.add = function (chunk: ArrayBufferLike) {
    const packet = codec.deserialize(chunk);
    this.checkPacket(packet);
    this.emit("decoded", packet);
  };

  Decoder.prototype.destroy = function () {};

  Decoder.prototype.checkPacket = function (packet: Packet) {
    const isTypeValid =
      isInteger(packet.type) &&
      packet.type >= PacketType.CONNECT &&
      packet.type <= PacketType.CONNECT_ERROR;

    if (!isTypeValid) {
      throw new Error("invalid packet type");
    }

    if (!isString(packet.nsp)) {
      throw new Error("invalid namespace");
    }

    const isAckValid = packet.id === undefined || isInteger(packet.id);

    if (!isAckValid) {
      throw new Error("invalid packet id");
    }

    if (!isDataValid(packet)) {
      throw new Error("invalid payload");
    }
  };

  return {
    protocol: 5,
    PacketType: {
      CONNECT: PacketType.CONNECT,
      DISCONNECT: PacketType.DISCONNECT,
      EVENT: PacketType.EVENT,
      ACK: PacketType.ACK,
      CONNECT_ERROR: PacketType.CONNECT_ERROR,
    },
    Encoder,
    Decoder,
  };
};

export default createParser;
