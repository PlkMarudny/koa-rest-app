import pino from 'pino';
import pinologger from 'koa-pino-logger';
import dotenvSafe from "dotenv-safe";

const result = dotenvSafe.config();
if (result.error) {
    throw result.error;
}

let logger;
if (process.env.LOGPRETTY === 'true') {
    logger = pinologger({
        instance: pino,
        prettyPrint: {
            colorize: true,
        },
    });
} else {
    logger = pinologger({
        instance: pino,
        prettyPrint: false
    });
}

export default logger;