var http = require("http");
var primus = require("primus.io");
var fs = require("fs");

const server = http.createServer();
const socket = new primus(server, { transformer: 'sockjs', parser: 'JSON' });
const clib = socket.library();

fs.writeFile("primus-client.js", clib, function (err) {
    if (err) return console.log(err);
});