// Copyright (c) 2016 Greenheart Games Pty. Ltd. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

'use strict';

var greenworks;

try {
  // Following line requires a native module. It might throw an error if the
  // module is not compiled correctly.
  greenworks = require('./greenworks-win64');
} catch (e) {
  greenworks = {
    init: function() {
      return true;
    },
    initAPI: function() {
      return true;
    },
    getSteamId: function() {
      return {
        getStaticAccountId: function() {
          return 'Guest';
        }
      }
    }
  };
}

module.exports = greenworks;
