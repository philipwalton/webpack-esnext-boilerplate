const md5 = require('md5');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const config = require('./config.json');
const {addAsset, getManifest} = require('./utils/assets');

const configurePlugins = () => {
  const plugins = [
    // Give dynamically `import()`-ed scripts a deterministic name for better
    // long-term caching. Solution adapted from:
    // https://medium.com/webpack/predictable-long-term-caching-with-webpack-d3eee1d3fa31
    new webpack.NamedChunksPlugin((chunk) => {
      const hashChunk = () => {
        return md5(Array.from(chunk.modulesIterable, (m) => {
          return m.identifier();
        }).join()).slice(0, 10);
      };
      return chunk.name ? chunk.name : hashChunk();
    }),

    new ManifestPlugin({
      seed: getManifest(),
      fileName: config.manifestFileName,
      generate: (seed, files) => {
        return files.reduce((manifest, opts) => {
          // Needed until this issue is resolved:
          // https://github.com/danethurber/webpack-manifest-plugin/issues/159
          const unhashedName = path.basename(opts.path)
              .replace(/[_.-][0-9a-f]{10}/, '');

          addAsset(unhashedName, opts.path);
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
        presets: [
          ['env', {
            debug: true,
            modules: false,
            useBuiltIns: true,
            targets: {
              browsers: browserlist,
            },
          }],
        ],
        plugins: ['syntax-dynamic-import'],
      },
    },
  };
};

const baseConfig = {
  mode: process.env.NODE_ENV || 'development',
  cache: {},
  devtool: '#source-map',
  optimization: {
    runtimeChunk: 'single',
    minimizer: [new TerserPlugin({
      sourceMap: true,
      terserOptions: {
        mangle: {
          properties: /(^_|_$)/,
        },
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
    'main-legacy': './app/scripts/main-legacy.js',
  },
  output: {
    path: path.resolve(__dirname, '..', config.publicDir),
    publicPath: '/',
    filename: '[name]-[chunkhash:10].es5.js',
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
