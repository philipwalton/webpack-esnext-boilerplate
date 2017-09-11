const chokidar = require('chokidar');
const connect = require('connect');
const debounce = require('lodash.debounce');
const serveStatic = require('serve-static');
const build = require('./build');
const config = require('./config.json');

(async () => {
  await build();

  console.log('Watching source files for changes...');
  chokidar
      .watch('app/**/*', {ignoreInitial: true})
      .on('all', debounce(build, 100));

  console.log('Serving files from http://localhost:8080');
  connect().use(serveStatic(config.publicDir)).listen(8080);
})();
