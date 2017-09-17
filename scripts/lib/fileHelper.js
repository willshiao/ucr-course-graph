'use strict';

const config = require('config');
const path = require('path');

module.exports = {
  getCatalogPath() {
    const subjects = config.get('catalog.subjects').split(',').join('-');
    const filename = `${config.get('catalog.term')}_${subjects}_catalog.json`;
    return path.join(config.get('dataDir'), filename);
  },
};
