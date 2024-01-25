/*
 * index.test.ts
 *
 * Copyright (c) 2024 Xiongfei Shi
 *
 * Author: Xiongfei Shi <xiongfei.shi(a)icloud.com>
 * License: Apache-2.0
 *
 * https://github.com/shixiongfei/safety-socketio
 */

import { Server } from "socket.io";
import { io } from "socket.io-client";
import createParser from "./index.js";
import createNodeCodec from "./node.js";
import createBrowserCodec from "./browser.js";

const testNode = () => {
  const codec = createNodeCodec("123");

  const e = codec.serialize({ abc: 123, def: 789, efg: "abcdefg" });
  console.log(e);

  const d = codec.deserialize(e);
  console.log(d);
};

const testBrowser = () => {
  const codec = createBrowserCodec("123");

  const e = codec.serialize({ abc: 123, def: 789, efg: "abcdefg" });
  console.log(e);

  const d = codec.deserialize(e);
  console.log(d);
};

const testCross = () => {
  const nodeCodec = createNodeCodec("123");
  const browserCodec = createBrowserCodec("123");

  const e1 = nodeCodec.serialize({ abc: 123, def: 789, efg: "abcdefg" });
  console.log(e1);

  const e2 = browserCodec.serialize({ abc: 123, def: 789, efg: "abcdefg" });
  console.log(e2);

  const d1 = browserCodec.deserialize(e1);
  console.log(d1);

  const d2 = nodeCodec.deserialize(e2);
  console.log(d2);
};

const testSocketIO = () => {
  const server = new Server(54000, {
    parser: createParser(createNodeCodec("123")),
  });

  const client = io("ws://localhost:54000", {
    parser: createParser(createBrowserCodec("123")),
  });

  server.on("connection", (socket) => {
    console.log(socket.id);

    socket.on("hello", () => {
      client.close();
      server.close();
    });
  });

  client.on("connect", () => {
    console.log(client.id);
    client.emit("hello");
  });
};

testNode();
testBrowser();
testCross();
testSocketIO();
