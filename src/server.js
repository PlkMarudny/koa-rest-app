import koa from "koa";
import http from "http";

import primus from "primus.io";
import emit from "primus-emit";
import { SSL_OP_TLS_ROLLBACK_BUG } from "constants";
import pino from 'pino';

const logger = pino();
const app = new koa();

// primus server
const server = http.createServer(app.callback());

const socket = new primus(server, { transformer: 'sockjs', parser: 'JSON' });
// TODO in case https://github.com/swissmanu/primus-responder is used
// socket.reserved.events['request'] = 1;
socket.plugin('emit', emit);

socket.on('connection', function (spark, next) {
    logger.info("--> new connection");
    spark.on("user", function (userdata) {
        this.user = userdata;
        logger.info(`user: ${this.user.username}`);
        this.user.id = this.id;

        // send a list of users to a new user...
        let userList = [];
        socket.forEach(function (spark) {
            userList.push(spark.user);
        });
        this.emit("userlist", userList);

        // ... and some chat messages
        const db = app.couchdb.db.use(process.env.DBCHAT);
        db.list({ limit: 100, include_docs: true }).then((body) => {
            spark.emit("chatinit", body.rows.map(row => { row = row.doc; row.read = true; return row; }));
        }).catch(err => logger.error(err.message ? err.message : "error retrieving chat messages"));

        // new user data  - emitting to all
        socket.forEach(function (spark) {
            logger.info(`emitting to clients connected: ${JSON.stringify(userdata)}`);
            spark.emit("userconnected", userdata);
        });

        next();
    }).on('takein', function incoming(s) {
        logger.info('take in: ', s);
        socket.forEach(function (s) {
            // do not emit  to sender
            if (s.id != spark.id) {
                s.emit('takein', "");
            }
        });
    }).on('takeout', function incoming(data) {
        logger.info('take out: ', data);
        socket.forEach(function (s) {
            // do not emit  to sender
            if (s.id != spark.id) {
                s.emit('takeout', "");
            }
        });
    }).on('chatmessage', function (message) {
        const db = app.couchdb.db.use(process.env.DBCHAT);
        db.insert(message, message.id).catch(err => {
            logger.error(err);
        });

        socket.forEach(function (s) {
            // send to all but a sender
            if (s.id != spark.id) {
                s.emit('chatmessage', message);
            }
        });
        logger.info(message);
    });
});

socket.on('disconnection', function (client) {
    logger.info('<-- connection has been closed.');
    logger.info(`disconnected id: ${client.id}`);
    socket.forEach(function (spark) {
        logger.info("emitting 'usergone'");
        spark.emit("usergone", { id: client.id });
    });
});

export { app, server, socket };