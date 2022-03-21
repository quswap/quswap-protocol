'use strict';

const protobuf = require('protobufjs');

module.exports = protobuf.Root.fromJSON(require('../build/QuProto'));
