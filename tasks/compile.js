const bundles = require('./bundles');
const clean = require('./clean');
const templates = require('./templates');

module.exports = async () => {
  console.log('Compiling modern and legacy script bundles...\n');
  await bundles();

  console.log('Compiling templates...\n');
  await templates();

  // Removes any files not in the revisioned asset manifest.
  await clean();

  console.log('Site ready!');
};
