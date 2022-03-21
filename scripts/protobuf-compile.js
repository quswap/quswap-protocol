const protobuf = require('protobufjs')
(async () => {
  await protobuf.load(path.join(__dirname, '..', 'proto', 'QuProto.proto'));
}).catch(console.error);
