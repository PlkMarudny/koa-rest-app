# koa-rest-app

This repo contains API application exampe that uses [Koa](https://koajs.com/) and [Rollup](https://rollupjs.org/guide/en/) for bundling. There is no HTML output, only JSON.

## Getting started

Clone this repository and install its dependencies:

```bash
git clone https://github.com/PlkMarudny/koa-rest-app
cd koa-rest-app
npm install

# or
npx degit " https://github.com/PlkMarudny/koa-rest-app" app
cd app
npm install
```

Check `rollup.config.js` for entry point (`src/main.js`) and the output bundle (`public/bundle.js`). 

`npm build` builds the application to `public/bundle.js`, along with a sourcemap file for debugging, minified
`npm dev` builds application with no minification
`npm start` launches a server on a port defined in `config/config.js`


## License

[ISC](LICENSE).
