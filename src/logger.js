import pino from 'pino';
import pinologger from 'koa-pino-logger';

const logger = pinologger({
    instance: pino, prettyPrint: {
        colorize: true,
    },
});

export default logger;