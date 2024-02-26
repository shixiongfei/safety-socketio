const fs = require("node:fs");

fs.copyFileSync("./package.esm.json", "./lib/esm/package.json");
