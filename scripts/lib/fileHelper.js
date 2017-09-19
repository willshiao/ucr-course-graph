'use strict';

const config = require('config');
const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

module.exports = {
  get subjects() {
    return config.get('catalog.subjects').split(',').join('-') || 'all';
  },

  get filePrefix() {
    return `${config.get('catalog.term')}_${this.subjects}`;
  },

  getCatalogPath() {
    const filename = `${config.get('catalog.term')}_${this.subjects}_catalog.json`;
    return path.join(config.get('dataDir'), filename);
  },

  getPrereqCatalogPath() {
    const filename = `${config.get('catalog.term')}_${this.subjects}_prereqs.json`;
    return path.join(config.get('dataDir'), filename);
  },

  getGraphPath() {
    const filename = `${this.filePrefix}_graph.json`;
    return path.join(config.get('dataDir'), filename);
  },

  async loadSubjects() {
    const subjectsStr = await fs.readFileAsync(config.get('subjectsFile'));
    return JSON.parse(subjectsStr);
  },

  async loadCatalog() {
    return JSON.parse(await fs.readFileAsync(this.getCatalogPath()));
  },

  async loadPrereqCatalog() {
    return JSON.parse(await fs.readFileAsync(this.getPrereqCatalogPath()));
  },
};
