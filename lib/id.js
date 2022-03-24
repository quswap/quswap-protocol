const cryptico = require('cryptico-js');
const crypto = require('libp2p-crypto');
const base64url = require('base64url');
const { Buffer } = require('buffer');
const { mapValues } = require('lodash');
const { hexlify } = require('@ethersproject/bytes');

const mapToBuffers = (o) => mapValues(o, (v) => base64url(v.toByteArray && Buffer.from(v.toByteArray()) || Buffer.from(hexlify(v).substr(2), 'hex')));

module.exports.cryptoFromSeed = async function (seed) {
  const key = mapToBuffers(await cryptico.generateRSAKey(seed, 2048));
  key.dp = key.dmp1;
  key.dq = key.dmq1;
  key.qi = key.coeff;
  return new crypto.keys.supportedKeys.rsa.RsaPrivateKey(key, key);
};
