'use strict';

const { QuPeer } = require('./peer');

const classToOwnPrototype = (Klass) => {
  return Object.getOwnPropertyNames(Klass.prototype).reduce((r, v) => {
    r[v] = Klass.prototype[v];
    return r;
  }, {});
};


class MockQuPeer {
  static peers = [];
  async start() {
    this.constructor.peers.push(this);
  }
  async 

const enableGlobalMockRuntime = () => {
  Object.assign(QuPeer.prototype, classToOwnPrototype(QuPeerMock)
