'use strict';

const { QuPeer } = require('./peer');

const classToOwnPrototype = (Klass) => {
  return Object.getOwnPropertyNames(Klass.prototype).reduce((r, v) => {
    r[v] = Klass.prototype[v];
    return r;
  }, {});
};


exports.MockQuPeer = class MockQuPeer {
  static peers = [];
  async start() {
    this.constructor.peers.push(this);
  }
  async advertise(orderbook) {
    setTimeout(() => this.constructor.peers.forEach((v) => {
      if (this === v) return;
      try {
        v.emit('peer:orderbook', {
          from: this.p2p.peerId,
          orderbook
        });
      } catch (e) {
        console.error(e);
      }
    }), 100);
  }
}

const enableGlobalMockRuntime = exports.enableGlobalMockRuntime = () => {
  Object.assign(QuPeer.prototype, classToOwnPrototype(QuPeerMock));
};
