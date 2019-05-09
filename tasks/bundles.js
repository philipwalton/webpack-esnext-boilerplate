const md5 = require('md5');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const config = require('./config.json');
const {addAsset, getManifest} = require('./utils/assets');

const configurePlugins = () => {
  const plugins = [
    // Identify each module by a hash, so caching is more predictable.
    new webpack.HashedModuleIdsPlugin(),

    // Create manifest of the original filenames to their hashed filenames.
    new ManifestPlugin({
      seed: getManifest(),
      fileName: config.manifestFileName,
      generate: (seed, files) => {
        return files.reduce((manifest, opts) => {
          // Needed until this issue is resolved:
          // https://github.com/danethurber/webpack-manifest-plugin/issues/159
          const name = path.basename(opts.path);
          const unhashedName = name.replace(/[_.-][0-9a-f]{10}/, '');

          addAsset(unhashedName, name);
          return getManifest();
        }, seed);
      },
    }),
  ];

  return plugins;
};

const configureBabelLoader = (browserlist) => {
  return {
    test: /\.js$/,
    use: {
      loader: 'babel-loader',
      options: {
        babelrc: false,
        exclude: [
          /core-js/,
          /regenerator-runtime/,
        ],
        presets: [
          ['@babel/preset-env', {
            loose: true,
            modules: false,
            // debug: true,
            corejs: 3,
            useBuiltIns: 'usage',
            targets: {
              browsers: browserlist,
            },
          }],
        ],
        plugins: ['@babel/plugin-syntax-dynamic-import'],
      },
    },
  };
};

const baseConfig = {
  mode: process.env.NODE_ENV || 'development',
  cache: {},
  devtool: '#source-map',
  optimization: {
    minimizer: [new TerserPlugin({
      test: /\.m?js(\?.*)?$/i,
      sourceMap: true,
      terserOptions: {
        safari10: true,
      },
    })],
  },
};

const modernConfig = Object.assign({}, baseConfig, {
  entry: {
    'main': './app/scripts/main.js',
  },
  output: {
    path: path.resolve(__dirname, '..', config.publicDir),
    publicPath: '/',
    filename: '[name]-[chunkhash:10].mjs',
  },
  plugins: configurePlugins(),
  module: {
    rules: [
      configureBabelLoader([
        // The last two versions of each browser, excluding versions
        // that don't support <script type="module">.
        'last 2 Chrome versions', 'not Chrome < 60',
        'last 2 Safari versions', 'not Safari < 10.1',
        'last 2 iOS versions', 'not iOS < 10.3',
        'last 2 Firefox versions', 'not Firefox < 54',
        'last 2 Edge versions', 'not Edge < 15',
      ]),
    ],
  },
});

const legacyConfig = Object.assign({}, baseConfig, {
  entry: {
    'nomodule': './app/scripts/nomodule.js',
  },
  output: {
    path: path.resolve(__dirname, '..', config.publicDir),
    publicPath: '/',
    filename: '[name]-[chunkhash:10].js',
  },
  plugins: configurePlugins(),
  module: {
    rules: [
      configureBabelLoader([
        '> 1%',
        'last 2 versions',
        'Firefox ESR',
      ]),
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
  await compileModernBundle();
  await compileLegacyBundle();
};
