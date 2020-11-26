import dotenvSafe from "dotenv-safe";

import koa from "koa";
import primus from "primus.io";
import http from "http";
import pino from 'koa-pino-logger';

import jsonerror from "koa-json-error";
import formatError from "./errors/formaterror";

import healthroute from "./routes/healthroute";
import errorroute from "./routes/errorroute";
import versionroute from "./routes/version";

import serve from "koa-static";
import cors from "@koa/cors";
import { EventSource } from "launchdarkly-eventsource";

import CouchdbChangeEvents from "./couchdb-change-events";
import url from "url";

// read .env (config file)
const result = dotenvSafe.config();
if (result.error) {
    throw result.error;
}

const app = new koa();
const serverPort = process.env.PORT;

app.silent = true;

app.use(pino({
    prettyPrint: {
        colorize: true,
    },
}));

app.use(jsonerror(formatError));
app.use(cors({ 'Access-Control-Allow-Credentials': true }));

app.use(healthroute.routes());
app.use(healthroute.allowedMethods());
app.use(errorroute.routes());
app.use(errorroute.allowedMethods());
app.use(versionroute.routes());
app.use(versionroute.allowedMethods());

app.use(async (ctx, next) => {
    ctx.cookies.set("X-Remote-User", ctx.req.headers['x-remote-user'], {});
    await next();
});

app.use(serve('./'));
// app.use(serve('/public'));

// app.use(serve('/public'));
// app.use(homeroute.allowedMethods);
// app.use(homeroute.routes());

// primus server
const server = http.createServer(app.callback());
const socket = new primus(server, { transformer: 'sockjs', parser: 'JSON' });

socket.on('open', function open() {
    console.log('The connection has been opened.');
}).on('end', function end() {
    console.log('The connection has been closed.');
}).on('reconnecting', function reconnecting(opts) {
    console.log('We are scheduling a reconnect operation', opts);
}).on('data', function incoming(data) {
    console.log('Received some data', data);
});


// CouchDb notifications
const fullUrl = new url.parse(process.env.DBHOST);
const couchdbEvents = new CouchdbChangeEvents({
    protocol: fullUrl.protocol,
    host: fullUrl.hostname,
    port: fullUrl.port,
    database: process.env.DBNAME,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    rejectUnauthorized: false,
    autoConnect: false,
    style: "all_docs",
    lastEventId: "now",
});

// eventsource from CouchDb
const sseUrl = couchdbEvents.getSSEUrl();
const es = new EventSource(sseUrl, {
    https: { rejectUnauthorized: false },
    initialRetryDelayMillis: 3000,
    maxRetryDelayMillis: 90000,
    retryResetIntervalMillis: 60000, // backoff will reset to initial level if stream got an event at least 60 seconds before failing
    jitterRatio: 0.5
});

es.addEventListener('message', function (data) {
    // console.log('data received: ', data);
    socket.write(data.data);
});

// launch the server
server.listen(serverPort, (err) => {
    if (err) throw err;
    console.log(`\nServer running at port ${serverPort}`);
});

