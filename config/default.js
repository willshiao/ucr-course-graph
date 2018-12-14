'use strict';

module.exports = {
  dataDir: './data',
  subjectsFile: './data/subjects.json',

  auth: {
    type: 'cookie', // cookie or credentials, credentials not yet implemented
    cookies: [
      {
        key: 'JSESSIONID',
        value: '',
        domain: 'registrationssb.ucr.edu',
        httpOnly: true,
        secure: true,
      },
      {
        key: 'BIGipServer~Banner~banner-prod-regssb-pool_8080',
        value: '',
        domain: 'registrationssb.ucr.edu',
      },
    ],
    cookieDomain: 'https://registrationssb.ucr.edu',
  },

  catalog: {
    urls: {
      search: 'https://registrationssb.ucr.edu/StudentRegistrationSsb/ssb/searchResults/searchResults',
      prereqs: 'https://registrationssb.ucr.edu/StudentRegistrationSsb/ssb/searchResults/getSectionPrerequisites',
    },
    term: 201740,
    subjects: '', // Comma-seperated. Can be blank.
    replaceUnknown: false, // Replace unknown classes with 'UNKNOWN', not yet implemented
  },

  request: {
    default: { // Default settings, passed to request library
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
      },
    },
  },
};
