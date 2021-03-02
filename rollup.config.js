import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';

// `npm build` -> `production` is true
// `npm dev` -> `production` is false
const production = !process.env.PRODUCTION;

export default {
	input: 'src/main.js',
	output: {
		file: 'public/bundle.js',
		format: 'cjs',
		sourcemap: false
	},
	plugins: [
		resolve({
			preferBuiltins: true
		}), 
		commonjs({
			include: 'node_modules/**',
			ignoreGlobal: true
		}),
		production && terser(), // minify, but only in production
		json()
	],
	external: ["nano", "agentkeepalive", "fs", "events", "https", "url", "dotenv-safe", "launchdarkly-eventsource", "primus.io", "http", "sockjs", "koa", "koa-body", "koa-send", "koa-pino-logger", "@koa/router", "koa-json-error", "git-last-commit", "@koa/cors", "koa-static"]
};
