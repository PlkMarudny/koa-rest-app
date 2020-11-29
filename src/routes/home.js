import Router from "@koa/router";

const router = new Router();

router.get('/', async ctx => {
    await next();
    ctx.log.debug(ctx.req.headers['x-remote-user']);
    ctx.body = {};
});

export default router;