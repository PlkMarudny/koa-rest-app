import Router from "@koa/router";
import git from "git-last-commit";
import versionObj from "../config/version.json";

const router = new Router();

router.get('/version', async ctx => {
    if (ctx.request.query.all && ctx.request.query.all === "true") {
        ctx.body = versionObj;
    } else {
        ctx.body =  (({ shortHash, subject, committedOn, tags}) => ({ shortHash, subject, committedOn, tags }))(versionObj);
    }
});

export default router;