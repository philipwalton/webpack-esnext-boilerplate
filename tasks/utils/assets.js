const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

let revisionedAssetManifest;

const getManifest = () => {
  if (!revisionedAssetManifest) {
    const manifestPath = path.join(
        config.publicStaticDir, config.manifestFileName);

    revisionedAssetManifest =
        fs.readJsonSync(manifestPath, {throws: false}) || {};
  }

  return revisionedAssetManifest;
};

const saveManifest = () => {
  fs.outputJson(
      path.join(config.publicStaticDir, config.manifestFileName),
      revisionedAssetManifest, {spaces: 2});
};


const resetManifest = () => {
  revisionedAssetManifest = {};
  saveManifest();
};


const getAsset = (filename) => {
  getManifest();

  if (!revisionedAssetManifest[filename]) {
    throw new Error(`Revisioned file for '${filename}' doesn't exist`);
  }

  return revisionedAssetManifest[filename];
};


const addAsset = async (filename, revisionedFilename) => {
  getManifest();

  revisionedAssetManifest[filename] = revisionedFilename;

  saveManifest();
};


const getRevisionedAssetUrl = (filename) => {
  return path.join(config.publicStaticPath, getAsset(filename));
};


module.exports = {
  getManifest,
  saveManifest,
  resetManifest,
  getAsset,
  addAsset,
  getRevisionedAssetUrl,
};
