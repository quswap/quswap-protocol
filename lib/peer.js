'use strict';

const ethers = require('ethers');
const { cryptoFromSeed } = require('./id');
const { createNode } = require('./node');
const { EventEmitter } = require('events');
const { Buffer } = require('buffer');

const PeerInfo = require('peer-info');
const PeerId = require('peer-id');

const coerceBuffersToHex = (v) => {
  if (v instanceof Uint8Array || Buffer.isBuffer(v)) return ethers.utils.hexlify(v);
  if (Array.isArray(v)) return v.map(coerceBuffersToHex);
  if (typeof v === 'object') {
    return Object.keys(v).reduce((r, key) => {
      r[key] = coerceBuffersToHex(v[key]);
      return r;
    }, {});
  }
  return v;
};

const coerceHexToBuffers = (v) => {
  if (typeof v === 'string' && v.substr(0, 2) === '0x') return Buffer.from(v.substr(2), 'hex');
  if (Array.isArray(v)) return v.map(coerceHexToBuffers);
  if (typeof v === 'object') {
    return Object.keys(v).reduce((r, key) => {
      r[key] = coerceHexToBuffers(v[key]);
      return r;
    }, {});
  }
  return v;
};

const libp2pCrypto = require('libp2p-crypto');

const toP2P = async (rsa) => {
  const peerId = await PeerId.createFromPrivKey(rsa.bytes);
  const peerInfo = new PeerInfo(peerId);
  return await createNode({
    multiaddr: 'mainnet',
    peerInfo

  });
};

const proto = require('./proto');
class QuPeer extends EventEmitter {
  static toP2P = toP2P;

  static toMessage(password) {
    return '/qup2p/1.0.0/' + ethers.utils.solidityKeccak256(['string'], [ '/qup2p/1.0.0/' + password ]);
  }

  static async fromSeed({
    signer,
    seed
  }) {
    return new this({
      p2p: await this.toP2P(await cryptoFromSeed(seed)),
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
    await this.p2p.pubsub.subscribe('/advertise/1.0.0', (message) => {
      console.log("Ad Received");
      const orderbook = this.constructor.decodeOrderBook(message.data);
      // console.log(orderbook);
      this.emit('peer:orderbook', {
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

  static encodeOrderBook(orderbook) {
    return proto.Advertisement.encode(coerceHexToBuffers(orderbook)).finish();
  }

  static decodeOrderBook(buffer) {
    return coerceBuffersToHex(proto.Advertisement.decode(buffer));
  }

  async advertise(orderbook) {
    await this.p2p.pubsub.publish('/advertise/1.0.0', this.constructor.encodeOrderBook(orderbook));
  }

  async trade(peerInfo, give, get) {
    // create TradeSession object to negotiate trade
  }
}

Object.assign(module.exports, {
  QuPeer
});
