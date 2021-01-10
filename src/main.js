import dotenvSafe from "dotenv-safe";

import pino from 'pino';
import pinologger from 'koa-pino-logger';

import jsonerror from "koa-json-error";
import formatError from "./errors/formaterror";

import healthroute from "./routes/healthroute";
import errorroute from "./routes/errorroute";
import versionroute from "./routes/version";
import clientsroute from "./routes/clients";

import { app, server, socket } from "./server.js";

import dbroute from "./routes/db";

import serve from "koa-static";

import cors from "@koa/cors";

import { EventSource } from "launchdarkly-eventsource";
import versionObj from "./config/version.json";

import CouchdbChangeEvents from "./couchdb-change-events";
import url from "url";

import nano from "nano";
import Agent from "agentkeepalive";
import "./errors/dberrors";

// read .env (config file)
const result = dotenvSafe.config();
if (result.error) {
    throw result.error;
}

// const app = new koa();
const serverPort = process.env.PORT;

app.silent = true;

const logger = pinologger({
    instance: pino, prettyPrint: {
        colorize: true,
    },
});

if (process.env.LOGREQUEST === true) {
    app.use(logger);
}

app.use(jsonerror(formatError));
app.use(cors({ 'Access-Control-Allow-Credentials': true }));

app.use(healthroute.routes());
app.use(healthroute.allowedMethods());
app.use(errorroute.routes());
app.use(errorroute.allowedMethods());
app.use(versionroute.routes());
app.use(versionroute.allowedMethods());
app.use(dbroute.routes());
app.use(dbroute.allowedMethods());
app.use(clientsroute.routes());
app.use(dbroute.allowedMethods());

app.use(async (ctx, next) => {
    let user = ctx.req.headers['x-remote-user'];
    // console.log("user: ", user);
    ctx.cookies.set("X-Remote-User", user, { httpOnly: false, overwrite: true });
    await next();
});

app.use(serve('public'));

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
    // without a custom event this will be:
    // socket.write(data.data);
    socket.forEach(function (spark) {
        spark.emit('update', data.data);
    });
});

// periodically send the current version to clients connected
if (versionObj && versionObj.tags.length > 0) {
    console.log(`Current version: ${versionObj.tags[0]}`);
    setInterval(() => {
        socket.forEach(function (spark) {
            spark.emit('version', { version: versionObj.tags[0] });
        });
    }, process.env.VERINTERVAL * 1000);
} else {
    pino().info("Software version unknown, git commit was not tagged?");
}

// CouchDb
const myagent = new Agent.HttpsAgent({
    maxSockets: 50,
    maxKeepAliveRequests: 0,
    maxKeepAliveTime: 30000
});

app.couchdb = nano({
    url: couchdbEvents.getCouchDbUrl(),
    requestDefaults: { "agent": myagent }
});

// couch.use(process.env.DBCFG).get('templates').then(resp => {
//     console.log(resp);
// });
//
// launch the server
// 
server.listen(serverPort, (err) => {
    if (err) throw err;
    pino().info(`Server running at port ${serverPort}`);
});

