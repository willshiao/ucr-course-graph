module.exports = {
  env: {
    browser: true,
    es6: true,
    jquery: true,
  },
  globals: {
    "_": true,
    sigma: true,
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'script',
    "impliedStrict": false
  },
  rules: {
    'no-console': 0,
    'consistent-return': 0,
    'keyword-spacing': ['error', {'overrides': {
      'if': {'after': false},
      'for': {'after': false},
      'while': {'after': false},
      'catch': {'after': false},
    }}],
    'new-cap': 0,
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-underscore-dangle': [ 'error', { 'allow': [ '_id' ] } ],
    'linebreak-style': 'off',
    'no-param-reassign': ['error', { 'props': false }],
  }
};
