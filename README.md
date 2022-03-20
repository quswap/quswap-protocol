# quswap-protocol

## qup2p

To interact with qup2p a user must generate a PeerId object and lock up some QU tokens to acquire a QUBOND NFT for the multiaddr they intend to connect with.

Peers should drop other peers for which there is no QUBOND, to ensure sybil resistance.

A qup2p node implements the following handlers to exchange protobuf messages:

### Pubsub Topics

```
/advertise/1.0.0

{
  phonons: [{
    hardwareSignature: bytes,
    address: bytes,
    network: string,
    portfolio: [{
      network: string,
      asset: bytes
    }]
  }],
  asks: [{
    gives: [{
      network: string,
      address: bytes
    }],
    wants: [{
      network: string,
      asset: bytes,
      qty: uint256
    }]
  }]
}
```

### Protocol

```
/offer/1.0.0

{
  gives: [{
    hardwareSignature: bytes,
    portfolio: [{
      network: string,
      asset: bytes
    }],
    network: string,
    address: bytes
  }],
  gets: [{
    hardwareSignature: bytes,
    portfolio: [{
      network: string,
      asset: bytes
    }],
    network: string,
    address: bytes
  }]
}

```

```
/trade/1.0.0

/* key exchange happens in a bidirectional stream , along with signatures to prove each step, in case either party backs out*/
```

## Peer Drop Policy

Certain attacks should be automatically detected and cause peers to relay a threat score for peers who are spamming the orderbook.

TODO

## Author

quDAO


