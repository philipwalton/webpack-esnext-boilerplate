const fs = require('fs-extra');
const md5 = require('md5');
const NameAllModulesPlugin = require('name-all-modules-plugin');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const config = require('./config.json');

let revisionedAssetManifest = fs.readJsonSync(path.join(
    config.publicDir, config.manifestFileName), {throws: false}) || {};

const getPlugins = (opts = {}) => {
  const plugins = [
    // Give modules a deterministic name for better long-term caching:
    // https://github.com/webpack/webpack.js.org/issues/652#issuecomment-273023082
    new webpack.NamedModulesPlugin(),

    // Give dynamically `import()`-ed scripts a deterministic name for better
    // long-term caching. Solution adapted from:
    // https://medium.com/webpack/predictable-long-term-caching-with-webpack-d3eee1d3fa31
    new webpack.NamedChunksPlugin((chunk) => chunk.name ? chunk.name :
        md5(chunk.mapModules((m) => m.identifier()).join()).slice(0, 10)),

    // Extract runtime code so updates don't affect app-code caching:
    // https://webpack.js.org/guides/caching/
    new webpack.optimize.CommonsChunkPlugin({
      name: opts.isLegacy ? 'runtime-legacy' : 'runtime',
    }),

    // Give deterministic names to all webpacks non-"normal" modules
    // https://medium.com/webpack/predictable-long-term-caching-with-webpack-d3eee1d3fa31
    new NameAllModulesPlugin(),

    new ManifestPlugin({
      fileName: config.manifestFileName,
      seed: revisionedAssetManifest,
    }),
  ];

  if (process.env.NODE_ENV == 'production') {
    plugins.push(new UglifyJSPlugin());
  }

  return plugins;
};

const baseConfig = {
  plugins: getPlugins({isLegacy: false}),
  output: {
    path: path.resolve(__dirname, '..', config.publicDir),
    publicPath: '/',
    filename: '[name]-[chunkhash:10].js',
  },
  cache: {},
  devtool: '#source-map',
};

const modernConfig = Object.assign({}, baseConfig, {
  entry: {
    'main': './app/scripts/main.js',
  },
  plugins: getPlugins({isLegacy: false}),
});

const legacyConfig = Object.assign({}, baseConfig, {
  entry: {
    'main-legacy': './app/scripts/main-legacy.js',
  },
  plugins: getPlugins({isLegacy: true}),
  module: {
    rules: [
      {
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            plugins: ['syntax-dynamic-import'],
          },
        },
        resource: {
          test: /\.js$/,
          exclude: /node_modules/,
        },
      },
    ],
  },
});

const createCompiler = (config) => {
  const compiler = webpack(config);
  return () => {
    return new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) return reject(err);
        console.log(stats.toString({colors: true}) + '\n');
        resolve();
      });
    });
  };
};

const compileModernBundle = createCompiler(modernConfig);
const compileLegacyBundle = createCompiler(legacyConfig);

module.exports = async () => {
  revisionedAssetManifest = {};
  await compileModernBundle();
  await compileLegacyBundle();
};
