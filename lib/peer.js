"use strict";
const libp2p = require("libp2p");
const WS = require("libp2p-websockets");
const Mplex = require("libp2p-mplex");
const Noise = require('libp2p-noise');
const KadDHT = require("libp2p-kad-dht");
const Bootstrap = require("libp2p-bootstrap");
const PeerInfo = require("peer-info");
const PeerId = require("peer-id");
const GossipSub = require("libp2p-gossipsub");
const RelayConstants = require('libp2p/src/circuit/constants')
const { FaultTolerance } = require('libp2p/src/transport-manager')
const WStar = require("libp2p-webrtc-star");
const isBrowser = require("is-browser");
const returnOp = (v) => v;
const { cryptoFromSeed } = require("./id");
const ethers = require("ethers");
const Libp2p = require("libp2p");

const wrtc = require("wrtc");
const proto = require("./proto");

const coerceBuffersToHex = (v) => {
  if (v instanceof Uint8Array || Buffer.isBuffer(v))
    return ethers.utils.hexlify(v);
  if (Array.isArray(v)) return v.map(coerceBuffersToHex);
  if (typeof v === "object") {
    return Object.keys(v).reduce((r, key) => {
      r[key] = coerceBuffersToHex(v[key]);
      return r;
    }, {});
  }
  return v;
};

const coerceHexToBuffers = (v) => {
  if (typeof v === "string" && v.substr(0, 2) === "0x")
    return Buffer.from(v.substr(2), "hex");
  if (Array.isArray(v)) return v.map(coerceHexToBuffers);
  if (typeof v === "object") {
    return Object.keys(v).reduce((r, key) => {
      r[key] = coerceHexToBuffers(v[key]);
      return r;
    }, {});
  }
  return v;
};
const ln = (v) => ((console.log(v)), v);

exports.QuPeer = class QuPeer extends Libp2p {
  static PRESETS = {
    MAINNET: "/dns4/qunet.dynv6.net/tcp/443/wss/p2p-webrtc-star/",
  };
  static fromPresetOrMultiAddr(multiaddr) {
    return this.PRESETS[(multiaddr || '').toUpperCase()] || multiaddr;
  }
  static toMessage(password) {
    return (
      "/qup2p/1.0.0/" +
      ethers.utils.solidityKeccak256(["string"], ["/qup2p/1.0.0/" + password])
    );
  }
  static async peerIdFromSeed(seed) {
    return await PeerId.createFromPrivKey((await cryptoFromSeed(seed)).bytes);
  }
  static async fromSeed({ signer, seed }) {
    return new this({
      peerId: await this.peerIdFromSeed(seed),
      signer,
    });
  }
  static async fromPassword({ signer, password }) {
    return await this.fromSeed({
      signer,
      seed: await signer.signMessage(this.toMessage(password)),
    });
  }
  async start() {
    await super.start();
    await this.pubsub.start();
    await this.pubsub.subscribe("/advertise/1.0.0", async (message) => {
      console.log(message);
      const orderbook = this.constructor.decodeOrderBook(message.data);
      console.log(orderbook);
      this.emit("peer:orderbook", {
        from: message.from,
        data: orderbook,
      });
    });
  }
  setSigner(signer) {
    this.signer = signer;
    this.addressPromise = this.signer.getAddress();
  }
  constructor(options) {
    const multiaddr = QuPeer.fromPresetOrMultiAddr(
      options.multiaddr || "mainnet"
    );
    super({
      peerId: options.peerId,
      connectionManager: {
        minConnections: 25
      },
      relay: {
        enabled: true,
        advertise: {
          bootDelay: RelayConstants.ADVERTISE_BOOT_DELAY,
          enabled: false,
          ttl: RelayConstants.ADVERTISE_TTL
        },
        hop: {
          enabled: false,
          active: false
        },
        autoRelay: {
          enabled: false,
          maxListeners: 2
        }
      },
	    /*
      addresses: {
        listen: [multiaddr]
      },
      */
      modules: {
        transport: [WStar],
        streamMuxer: [Mplex],
        connEncryption: [Noise],
        pubsub: GossipSub,
        peerDiscovery: [Bootstrap],
        dht: KadDHT,
      },
      config: {
        peerDiscovery: {
          autoDial: true,
          [Bootstrap.tag]: {
            enabled: true,
            list: [
              multiaddr + 'QmXRimgxFGd8FEFRX8FvyzTG4jJTJ5pwoa3N5YDCrytASu'
            ],
          },
        },
        transport: {
          [WStar.prototype[Symbol.toStringTag]]: {
            wrtc: !isBrowser && wrtc,
          },
        },
        dht: {
          enabled: true,
          kBucketSize: 20,
        },
        pubsub: {
          enabled: true,
          emitSelf: false,
        },
      },
    });
    this.setSigner(options.signer);
  }
  get qubond() {
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
    await this.pubsub.publish(
      "/advertise/1.0.0",
      this.constructor.encodeOrderBook(orderbook)
    );
  }

  async trade(peerInfo, give, get) {
    // create TradeSession object to negotiate trade
  }
};
