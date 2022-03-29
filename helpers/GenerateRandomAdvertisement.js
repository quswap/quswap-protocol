"use strict";

const axios = require('axios');
const ethers = require('ethers');
const { result, random } = require('lodash');

const requestURL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';
const utils = ethers.utils;

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

const randomAddress = () => utils.hexlify(utils.randomBytes(20));
const randomSignature = () => utils.hexlify(utils.randomBytes(65));

const tokenDayDatas = async () => {
    let response;

    try {
        response = await axios({
            url: requestURL,
            method: 'post', 
            data: "{\"query\":\"{\\n  tokenDayDatas(first: 100, orderBy:volumeUSD, where:{date:1648425600}, orderDirection:desc) {\\n\\t\\t\\tid\\n      priceUSD\\n      token {\\n        id\\n        symbol\\n        name\\n        derivedETH\\n      }\\n  }\\n  bundles {\\n    ethPriceUSD\\n  }\\n}\\n\",\"variables\":null}"
        })
    } catch (e) {
        throw new Error(e.message);
    };

    return response?.data.data ? response?.data.data : null;
}

const randomAdvertisement = async () => {
    const allData = await tokenDayDatas();
    const phononPubkey = randomAddress();

    var rOne = getRandomIntInclusive(0, 99);
    var rTwo = 0;
    do {
        rTwo = getRandomIntInclusive(0, 99);
    } while(rTwo == rOne);

    const giveToken = allData.tokenDayDatas[rOne].token.id;
    const wantToken = allData.tokenDayDatas[rTwo].token.id;
    const qty = getRandomArbitrary(0.01, 100.00);

    const randomAd = {
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
        asks: [{
            gives: [
                {
                    network: 'ethereum',
                    address: giveToken
                }
            ],
            wants: [
                {
                    network: 'ethereum',
                    address: wantToken,
                    qty: qty
                }
            ]  
        }]
    }

    console.log(randomAd);
}

randomAdvertisement();


