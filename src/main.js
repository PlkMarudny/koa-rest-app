import koa from "koa";
// import socketio from "socket.io";
// import koabody from "koa-body";
import pino from 'koa-pino-logger';

import jsonerror from "koa-json-error";
import formatError from "./errors/formaterror";

import healthroute from "./routes/healthroute";
import errorroute from "./routes/errorroute";
import versionroute from "./routes/version";

import config from "./config/config.json";
import serve from "koa-static";
import send from "koa-send";
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

const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);


io.on('connect', socket => {
    console.log('connected');
    socket.on('chat', data => {
        console.log(data.text);
    });
    socket.on('disconnect', () => console.log('disconnected'));
});

server.listen(serverPort, (err) => {
    if (err) throw err;
    console.log(`\nServer running at port ${serverPort}`);
});

