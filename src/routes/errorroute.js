import Router from "@koa/router";

const router = new Router();

router.get('/error', async ctx => {
    ctx.throw(500, "some error");
})

export default router