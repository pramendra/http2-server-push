const spdy = require("spdy");
const express = require("express");
const fs = require("fs");
const path = require("path");
const next = require("next");
const glob = require("glob");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();
const server = express();

const { promisify } = require("util");
const readFile = promisify(fs.readFile);

const buildId = fs.readFileSync(
  path.join(__dirname, ".next", "BUILD_ID"),
  "utf8"
);
const getDirectories = function (src, options, callback) {
  glob(src + "/**/*", options, callback);
};

const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    server.get("/", async (req, res) => {
      try {
        if (res.push) {
          // push build
          getDirectories(
            path.join(".next", "static", buildId),
            { root: process.cwd() },
            function (err, files) {
              if (err) {
                console.log("Error", err);
              } else {
                files.forEach(async (file) => {
                  const stats = fs.statSync(file);
                  if (stats.isFile()) {
                    res
                      .push(file.replace(".next/", "/_next/"), {})
                      .end(await readFile(file));
                  }
                });
              }
            }
          );

          // push chunks
          getDirectories(
            path.join(".next", "static", "chunks"),
            { root: process.cwd() },
            function (err, files) {
              if (err) {
                console.log("Error", err);
              } else {
                files.forEach(async (file) => {
                  const stats = fs.statSync(file);
                  if (stats.isFile()) {
                    res
                      .push(file.replace(".next/", "/_next/"), {})
                      .end(await readFile(file));
                  }
                });
              }
            }
          );
        }

        app.render(req, res, "/");
      } catch (error) {
        res.status(500).send(error.toString());
      }
    });

    server.get("*", (req, res) => {
      return handler(req, res);
    });

    spdy
      .createServer(
        {
          key: fs.readFileSync("./ssl_server.key"),
          cert: fs.readFileSync("./ssl_server.crt"),
        },
        server
      )
      .listen(3000, (err) => {
        if (err) {
          throw new Error(err);
        }
        console.log("Listening on port 3000");
      });
  })
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  });
