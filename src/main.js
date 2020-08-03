import koa from "koa";
// import koabody from "koa-body";
import koalogger from 'koa-pino-logger';
import jsonerror from "koa-json-error";
import formatError from "./errors/formaterror";

import healthroute from "./routes/healthroute";
import errorroute from "./routes/errorroute";
import versionroute from "./routes/version";

import config from "./config/config.json";


const server = new koa();
const serverPort = config.port;

server.use(koalogger());
server.use(jsonerror(formatError));

server.use(healthroute.routes());
server.use(healthroute.allowedMethods());
server.use(errorroute.routes());
server.use(errorroute.allowedMethods());
server.use(versionroute.routes());
server.use(versionroute.allowedMethods());

server.listen(serverPort, (err) => {
    if (err) throw err; 
    console.log(`\nServer running at port ${serverPort}`);
});

