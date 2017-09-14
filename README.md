# Webpack ESNext Boilerplate

Webpack configuration and build scripts to deploy ES2015+ code to production (via `<script type="module">`) with legacy browser fallback support via `<script nomodule>`.

This boilerplate is an implementation of the techniques described in my article: [Deploying ES2015+ Code in Production Today](https://philipwalton.com/articles/deploying-es2015-code-in-production-today/).

## Usage

To view site locally, run the following command:

```sh
npm start
```

This will build all the source files, watch for changes, and serve them from [`http://localhost:8080`](http://localhost:8080). Make sure you open up the developer tools to view the console output.

To build the source files without watching for changes or starting a local server, run:

```sh
npm run build
```

### `development` vs `production` environments

By default the build output is unminified. To generate minified, production-ready files, set `NODE_ENV` to `production`.

```sh
NODE_ENV=production npm run build
```

## Features

To validate that this technique works for more than just simple, single-bundle sites, this boilerplate implements several advanced webpack features:

* [Code splitting](https://webpack.js.org/guides/code-splitting/)
* [Dynamic imports](https://webpack.js.org/guides/code-splitting/#dynamic-imports)
* [Asset fingerprinting](https://webpack.js.org/guides/caching/)

To see how these feature manifest themselves in the generated files, view the `public` directory after running the build step.
