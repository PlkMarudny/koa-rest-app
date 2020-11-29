# breaking-news-srv

This repo contains Breaking News server that uses [Koa](https://koajs.com/), [Primus](https://github.com/primus/primus) with [Sockjs](https://github.com/sockjs) as a transport, [pnpm](https://pnpm.js.org/) package manager and  [Rollup](https://rollupjs.org/guide/en/)  for bundling.

There is no GUI code here, it should be placed in the `build` directory, use another repo ('breakingews') for that.

Available routes:
- /
- /version
- /ping
- /route
## Getting started

Clone this repository and install its dependencies:

```bash
pnpm i
````

## NPM scripts
Check `rollup.config.js` for entry point (`src/main.js`) and the output bundle (`public/bundle.js`). 

- `build` builds the application to `public/bundle.js`, minified
- `dev` builds application with no and starts it. A sourcemap file for debugging is generated as well
- `npm version` creates `config\version.json` file with the git version information that is used at ```/version``` endpoint
- `npm start` launches a server on a port defined in `.env` file


## License

[ISC](LICENSE)
