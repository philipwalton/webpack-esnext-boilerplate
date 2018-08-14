const fs = require('fs-extra');
const nunjucks = require('nunjucks');
const path = require('path');
const config = require('./config.json');
const {getRevisionedAssetUrl} = require('./utils/assets');


const env = nunjucks.configure('app/templates', {
  autoescape: false,
  watch: false,
});

env.addFilter('revision', (filename) => {
  return getRevisionedAssetUrl(filename);
});

module.exports = async () => {
  await fs.outputFile(
    path.join(config.publicDir, 'index.html'), nunjucks.render('index.html'));

  console.log('Built template: index.html\n');
};
