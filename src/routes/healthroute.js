import Router from "@koa/router";

const router = new Router();

router.get('/ping', async ctx => {
    ctx.body= "OK";
})

export default router