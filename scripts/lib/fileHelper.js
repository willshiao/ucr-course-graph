'use strict';

const config = require('config');
const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

module.exports = {
  getCatalogPath() {
    const subjects = config.get('catalog.subjects').split(',').join('-');
    const filename = `${config.get('catalog.term')}_${subjects}_catalog.json`;
    return path.join(config.get('dataDir'), filename);
  },

  getPrereqCatalogPath() {
    const subjects = config.get('catalog.subjects').split(',').join('-');
    const filename = `${config.get('catalog.term')}_${subjects}_prereqs.json`;
    return path.join(config.get('dataDir'), filename);
  },

  async loadSubjects() {
    const subjectsStr = await fs.readFileAsync(config.get('subjectsFile'));
    return JSON.parse(subjectsStr);
  },

  async loadCatalog() {
    return JSON.parse(await fs.readFileAsync(this.getCatalogPath()));
  },
};
