import koa from "koa";
import sockjs from "sockjs";
import primus from "primus.io";
import http from "http";
import pino from 'koa-pino-logger';

import jsonerror from "koa-json-error";
import formatError from "./errors/formaterror";

import healthroute from "./routes/healthroute";
import errorroute from "./routes/errorroute";
import versionroute from "./routes/version";

import config from "./config/config.json";
import serve from "koa-static";
// import send from "koa-send";
import cors from "@koa/cors";

const app = new koa();
const serverPort = config.port;

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

// app.use(async (ctx) => {
//     await send(ctx, 'favicon.png');
// });
app.use(serve('.'));
// app.use(async (ctx) => {
//     ctx.cookies.set("X-Remote-User", ctx.req.headers['x-remote-user'], {});
//     await send(ctx, 'index.html');
// });


// app.use(serve('/public'));
// app.use(homeroute.allowedMethods);
// app.use(homeroute.routes());

// sockjs server
// const sockjs_comm = sockjs.createServer();

// sockjs_comm.on('connection', function (conn) {
//     conn.on('data', function (message) {
//         conn.write(message);
//     });

//     conn.on('close', function (message) {
//         conn.write(message);
//     });
// });

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

// sockjs_comm.installHandlers(server, { prefix: '/echo' });

// io.on('connect', socket => {
//     console.log('connected');
//     socket.on('chat', data => {
//         console.log(data.text);
//     });
//     socket.on('disconnect', () => console.log('disconnected'));
// });

server.listen(serverPort, (err) => {
    if (err) throw err;
    console.log(`\nServer running at port ${serverPort}`);
});

