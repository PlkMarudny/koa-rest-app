import Router from "@koa/router";
import { socket } from "../server";


const router = new Router();

router.get('/clients', async ctx => {
    let data = [];
    socket.forEach(function (spark) {
        data.push({ user: spark.user, id: spark.id });
    });
    ctx.body = data;
});

export default router;