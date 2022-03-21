'use strict';

const ethers = require('ethers');
const { cryptoFromSeed } = require('./id');
const { createNode } = require('./node');
const { EventEmitter } = require('events');

const PeerInfo = require('peer-info');

const toP2P = async (rsa) => {
  return await createNode(await PeerInfo.create(PeerId.createFromPrivKey(rsa.marshal())));
};

const proto = require('./proto');

class QuPeer extends EventEmitter {
  static toMessage(password) {
    return '/qup2p/1.0.0/' + ethers.utils.solidityKeccak256(['string'], [ '/qup2p/1.0.0/' + password ]);
  }
  static async fromSeed({
    signer,
    seed
  }) {
    return new this({
      p2p: await createNode(await cryptoFromSeed(seed)),
      signer
    });
  }
  static async fromPassword({
    signer,
    password
  }) {
    return await this.fromSeed({
      signer,
      seed: await signer.signMessage(this.toMessage(password))
    });
  }
  async start() {
    this.p2p.on('peer:discovery', (peer) => this.emit('peer:discovery', peer));
    await this.p2p.start();
    await this.p2p.pubsub.start();
    await this.p2p.pubsub.subscribe('/advertise/1.0.0', async (message) => {
      console.log(message);
      const orderbook = proto.Advertisement.decode(message.data);
      console.log(orderbook);
      this.on('peer:orderbook', {
        from: message.from,
        data: orderbook
      });
    });
  }
  constructor({
    p2p,
    signer
  }) {
    super();
    this.p2p = p2p;
    this.setSigner(signer);
  }
  setSigner(signer) {
    this.signer = signer;
    this.addressPromise = this.signer.getAddress();
  }
  get qubond() {;
    return ethers.Contract(ethers.constants.AddressZero, [], this.signer); // TODO: load from deployments directory
  }
  get qu() {
    return ethers.Contract(ethers.constants.AddressZero, [], this.signer); // TODO: load from deployments directory
  }
  async advertise(orderbook) {
    await this.p2p.pubsub.publish('/advertise/1.0.0', proto.Advertisement.encode(orderbook).build());
  }
  async trade(peerInfo, give, get) {
    // create TradeSession object to negotiate trade
  }
}

Object.assign(module.exports, {
  QuPeer
});
