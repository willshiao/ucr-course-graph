'use strict';

const rp = require('request-promise');
const config = require('config');

module.exports = rp.defaults(config.get('request.default'));
