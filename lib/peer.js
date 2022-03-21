'use strict';

const ethers = require('ethers');
const { cryptoFromSeed } = require('./id');
const { createNode } = require('./node');

const toMessage = (password) => {
  return '/qup2p/1.0.0/' + ethers.utils.solidityKeccak256(['string'], [ '/qup2p/1.0.0/' + password ]);
};

const PeerInfo = require('peer-info');

const toP2P = async (rsa) => {
  return await createNode(await PeerInfo.create(PeerId.createFromPrivKey(rsa.marshal())));
};

class QuPeer {
  static createNode = createNode;
  static toMessage = toMessage;
  static async fromSeed(seed) {
    return new this(await this.createNode(await cryptoFromSeed(seed)));
  }
  static async fromSigner(signer, password) {
    return await this.fromSeed(await signer.signMessage(this.toMessage(password));
  }
  constructor(p2p) {
    this.p2p = p2p;
  }
}
