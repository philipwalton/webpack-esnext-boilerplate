const fs = require('fs-extra');
const path = require('path');
const config = require('./config.json');

module.exports = async () => {
  const revisionedAssetManifest = await fs.readJson(path.join(
      config.publicDir, config.manifestFileName), {throws: false}) || {};

  const revisionedAssetFilenames =
      new Set(Object.values(revisionedAssetManifest));

  // Get all .js and .map files in the asset manifest.
  const filenames = (await fs.readdir(config.publicDir)).filter((filename) => {
    const extname = path.extname(filename);
    return !revisionedAssetFilenames.has(filename) &&
        (extname == '.js' || extname == '.map');
  });

  await Promise.all(filenames.map((filename) => {
    return fs.unlink(path.join(config.publicDir, filename))
        .catch(() => console.error(`Failed to delete ${filename}`));
  }));
};
