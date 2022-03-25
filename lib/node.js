"use strict";
const libp2p = require("libp2p");
//const TCP = require("libp2p-tcp");
const WS = require("libp2p-websockets");
const Mplex = require("libp2p-mplex");
const SECIO = require("libp2p-secio");
const KadDHT = require("libp2p-kad-dht");
const Bootstrap = require("libp2p-bootstrap");
const PeerInfo = require("peer-info");
const GossipSub = require("libp2p-gossipsub");
const WStar = require("libp2p-webrtc-star");
const isBrowser = require("is-browser");
const returnOp = (v) => v;

const presets = {
  mainnet: "/dns4/qunet.dynv6.net/tcp/443/wss/p2p-webrtc-star/",
};

const fromPresetOrMultiAddr = (multiaddr) => presets[multiaddr] || multiaddr;

const wrtc = require("wrtc");

const createNode = async (options) => {
  const multiaddr = fromPresetOrMultiAddr(options.multiaddr);
  const dhtEnable = typeof options.dht === "undefined" || options.dht === true;
  const socket = await libp2p.create({
    peerId: options.peerInfo.id,
    addresses: {
      listen: [multiaddr],
    },
    modules: {
      transport: [WS, WStar],
      streamMuxer: [Mplex],
      connEncryption: [SECIO],
      pubsub: GossipSub,
      peerDiscovery: [Bootstrap],
      dht: dhtEnable ? KadDHT : undefined,
    },
    config: {
      peerDiscovery: {
        autoDial: true,
        [Bootstrap.tag]: {
          enabled: true,
          list: [
            options.multiaddr +
              "/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
          ],
        },
      },
      transport: {
        [WStar.prototype[Symbol.toStringTag]]: {
          wrtc: !isBrowser && wrtc,
        },
      },
      dht: {
        enabled: dhtEnable,
        kBucketSize: 20,
      },
      pubsub: {
        enabled: true,
        emitSelf: false,
      },
    },
  });
  return socket;
};

exports.createNode = createNode;
