var { QuPeer } = require("./");
var sdk = require("./");
var { enableGlobalMockRuntime } = require("./lib/mock");
var proto = require("./lib/proto");

var ethers = require("ethers");
var wallet = new ethers.Wallet(
  ethers.utils.solidityKeccak256(["string"], ["dontusethis1"])
).connect(new ethers.providers.JsonRpcProvider("http://localhost:8545"));
var PeerId = require("peer-id");
var { cryptoFromSeed } = require("./lib/id");
var go = async () => {
  const qu = await QuPeer.fromPassword({
    signer: wallet,
    password: "woop",
  });
  qu.on("peer:discovery", console.log);
  await qu.start();
 // await qu.pubsub.start();
  return qu;
};

var WStar = require('libp2p-webrtc-star')
