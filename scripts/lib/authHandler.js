'use strict';

const config = require('config');
const tough = require('tough-cookie');
const rp = require('./request');

module.exports = {
  async getJar() {
    if(config.get('auth.type') !== 'cookie') {
      throw new TypeError('Invalid authentication type');
    }
    const jar = rp.jar();
    config.get('auth.cookies').forEach((c) => {
      jar.setCookie(new tough.Cookie(c), config.get('auth.cookieDomain'));
    });
    return jar;
  },
};
