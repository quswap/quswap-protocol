"use strict";

const sdk = require("..");
const { QuPeer } = sdk;
const { expect } = require("chai");

const ethers = require("ethers");

sdk.enableGlobalMockRuntime();

const randomAddress = () => ethers.utils.hexlify(ethers.utils.randomBytes(20));
const randomSignature = () =>
  ethers.utils.hexlify(ethers.utils.randomBytes(65));

const phononPubkey = randomAddress();
const tokenAddress = randomAddress();
const otherTokenAddress = randomAddress();

describe("quswap-protocol", () => {
  it("encodeOrderBook/decodeOrderBook", () => {
    const orderbook = {
      phonons: [
        {
          network: "ethereum",
          address: phononPubkey,
          portfolio: {
            assets: [
              {
                network: "ethereum",
                address: phononPubkey,
              },
            ],
          },
          hardwareSignature: randomSignature(),
        },
      ],
      orders: [
        {
          gives: [
            {
              network: "ethereum",
              address: phononPubkey,
            },
          ],
          wants: [
            {
              network: "ethereum",
              address: otherTokenAddress,
              qty: "100000",
            },
          ],
        },
      ],
    };
    expect(QuPeer.decodeOrderBook(QuPeer.encodeOrderBook(orderbook))).to.eql(
      orderbook
    );
  });
});
