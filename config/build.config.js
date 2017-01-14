var fs = require('fs');
var pkg = require('../package.json');

module.exports = {
  banner: '/*!\n' +
    ' * karibouCore\n' +
    ' * v' + pkg.version +'\n' +
    ' * Copyright 2015 Drifty Co. http://drifty.com/\n' +
    ' * See LICENSE in this repository for license information\n' +
    ' */\n',

  closureStart: '(function(){\n',
  closureEnd: '\n})();',

  dist: 'dist',
  demo : {
    karibouCore : 'demo/www/lib/karibouCore/dist',
    lib : 'demo/www/lib',
    www : 'demo/www'
  },

  pluginFiles: [
    'src/module.js',
    'src/plugins/*.js',
  ],

  mockFiles: [
    'src/module-mocks.js',
    'src/mocks/*.js'
  ],

  versionData: {
    version: pkg.version
  }
};
