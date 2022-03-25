
var { QuPeer } = require('./');
var sdk = require('./');
var { enableGlobalMockRuntime } = require('./lib/mock');
var proto = require('./lib/proto');

var ethers = require('ethers');
var wallet = new ethers.Wallet(ethers.utils.solidityKeccak256(['string'], ['dontusethis'])).connect(new ethers.providers.JsonRpcProvider('http://localhost:8545'));
var PeerId = require('peer-id');
var { cryptoFromSeed } = require('./lib/id');
