import Router from "@koa/router";
import { socket } from "../server";
import logger from '../logger';


const router = new Router();

router.get('/clients', async ctx => {
    let data = [];
    socket.forEach(function (spark) {
        data.push({ user: spark.user });
        logger.logger.debug(data);
    });
    ctx.body = data;
});

export default router;