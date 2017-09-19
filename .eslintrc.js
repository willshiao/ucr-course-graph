module.exports = {
  env: {
    node: true,
    es6: true,
    mocha: true
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'script',
    "impliedStrict": false
  },
  rules: {
    'no-loop-func': 0,
    'no-console': 0,
    'consistent-return': 0,
    'keyword-spacing': ['error', {'overrides': {
      'if': {'after': false},
      'for': {'after': false},
      'while': {'after': false},
      'catch': {'after': false},
    }}],
    'no-underscore-dangle': [ 'error', { 'allow': [ '_id' ] } ],
    'linebreak-style': 'off',
    'no-param-reassign': ['error', { 'props': false }],
  }
};
