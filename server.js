const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");
const dotenv = require("dotenv");

const isProduction = process.env.NODE_ENV === "production";

// if (isProduction) {
//   dotenv.config({ path: ".env" });
// } else {
//   dotenv.config({ path: ".env.dev" });
// }
if (!isProduction) {
  dotenv.config({ path: ".env.dev" });
}

const redirectAuth = require("./server/auth/redirectAuth");
const proxy = require("./server/listProxy");

const server = express();

const PORT = process.env.PORT || 3001;

server.use("/assets", express.static("./build/assets"));
server.use("/media", express.static("./build/media"));
server.use("/css", express.static("./build/css"));

for (let key in proxy) {
  server.use(key, createProxyMiddleware(proxy[key]));
}

 redirectAuth(server);

server.get("*", (req, res) => {
  return res.sendFile(path.resolve("./build/index.html"));
});

server.listen(PORT, function () {
  console.log(`Server running port ${PORT}`);
});
