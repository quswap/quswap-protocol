'use strict';

const protobuf = require('protobufjs');
const path = require('path');

const mkdirp = require('mkdirp');
const root = protobuf.loadSync(path.join(__dirname, '..', 'proto', 'QuProto.proto'));

const fs = require('fs');
mkdirp.sync(path.join(__dirname, '..', 'build'));
fs.writeFileSync(path.join(__dirname, '..', 'build', 'QuProto.json'), JSON.stringify(root.toJSON(), null, 2));


