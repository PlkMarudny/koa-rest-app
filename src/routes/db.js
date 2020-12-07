import Router from "@koa/router";


const router = new Router();
import koaBody from "koa-body";

const getTemplates = async (ctx, next) => {
    const templatesDb = ctx.app.couchdb.db.use(process.env.DBCFG);
    try {
        ctx.body = await templatesDb.get(process.env.DBTEMPLATEDOC);
    } catch (err) {
        ctx.throw(err.statusCode || 500, err);
    }
    next();
};

const getData = async (ctx) => {
    const dataDb = ctx.app.couchdb.db.use(process.env.DBNAME);
    const q = {
        "selector": {
            "_id": {
                "$gt": ""
            }
        },
        "limit": parseInt(process.env.DOCLIMIT, 10),
        "sort": [
            {
                "created": "desc"
            }
        ]
    };
    ctx.body = await dataDb.find(q);
};

const saveDoc = async (ctx) => {
    let result;
    let refDoc;
    const dataDb = ctx.app.couchdb.db.use(process.env.DBNAME);
    if (!ctx.request.body._id) {
        ctx.throw(400, { message: "no _id field in the document found" });
    }

    try {
        result = await dataDb.insert(ctx.request.body);
        ctx.response.body = result;
        ctx.response.status = 200;
    } catch (err) {
        if (err.statusCode === 409) {
            try {
                refDoc = await dataDb.get(ctx.request.body._id);
            } catch (err) {
                ctx.response.status = err.statusCode;
                ctx.response.body = { message: err.message };
            }
            ctx.response.status = 409;
            ctx.response.body = refDoc;
        }
    };
};

router
    .get('/templates', getTemplates)
    .get('/data', getData)
    .put('/savedoc', koaBody(), saveDoc);

export default router;