import Router from "@koa/router";
import git from "git-last-commit";

const router = new Router();

/**
 * getVersion returns build information obtained from git,
 * https://github.com/seymen/git-last-commit
 *
 * @return {*} 
 */
const getVersion = () => {
    return new Promise((resolve, reject) => {
        git.getLastCommit( function(error, commit) {
            if (error) {
                reject(error);
            } else {
                resolve(commit);
            }
        });
    });
};

router.get('/version', async ctx => {
    const versionObj = await getVersion();
    if (ctx.request.query.all && ctx.request.query.all === "true") {
        ctx.body = versionObj;
    } else {
        ctx.body =  (({ shortHash, subject, committedOn, tags}) => ({ shortHash, subject, committedOn, tags }))(versionObj);
    }
});

export default router;