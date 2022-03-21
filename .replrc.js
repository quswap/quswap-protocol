
var { QuPeer } = require('./');
var { enableGlobalMockRuntime } = require('./lib/mock');

var ethers = require('ethers');
var wallet = ethers.Wallet.createRandom().connect(new ethers.providers.JsonRpcProvider('http://localhost:8545'));
var PeerId = require('peer-id');
var { cryptoFromSeed } = require('./lib/id');
