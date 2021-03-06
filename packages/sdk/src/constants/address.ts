import { ChainId } from './chainId';

export const CONVENIENCE: AddressMap = {
  [ChainId.RINKEBY]: '0xefE81D4Aed8E58706b1B592d372DA21c46e64bBc',
  [ChainId.MATIC_TESTNET]: '0xb3d8b8f29baA63575224c5f7C6d82ae3E8586204',
  [ChainId.MATIC]: '0xf4077Bd057Dddc2576b17889e175c839d9cEF2d3',
};

export const FACTORY: AddressMap = {
  [ChainId.RINKEBY]: '0x87838724523EB63fb3Af8418b3f14f00d4AcED08',
  [ChainId.MATIC_TESTNET]: '0x3a82fB3294a648368F5Ef07261Ec740B05Da9e85',
  [ChainId.MATIC]: '0x3a82fB3294a648368F5Ef07261Ec740B05Da9e85',
};

export const WETH9_ADDRESS: AddressMap = {
  [ChainId.MAINNET]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  [ChainId.ROPSTEN]: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  [ChainId.RINKEBY]: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  [ChainId.GÖRLI]: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  [ChainId.KOVAN]: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
  [ChainId.ARBITRUM]: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  [ChainId.ARBITRUM_TESTNET]: '0xf8456e5e6A225C2C1D74D8C9a4cB2B1d5dc1153b',
  [ChainId.BSC]: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
  [ChainId.FANTOM]: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
  [ChainId.MATIC]: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  [ChainId.OKEX]: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
  [ChainId.HECO]: '0x64FF637fB478863B7468bc97D30a5bF3A428a1fD',
  [ChainId.HARMONY]: '0x6983D1E6DEf3690C4d616b13597A09e6193EA013',
  [ChainId.XDAI]: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
  [ChainId.AVALANCHE]: '0xf20d962a6c8f70c731bd838a3a388D7d48fA6e15',
  [ChainId.CELO]: '0x122013fd7dF1C6F636a5bb8f03108E876548b455',
};

export const WNATIVE_ADDRESS: AddressMap = {
  [ChainId.MAINNET]: WETH9_ADDRESS[ChainId.MAINNET],
  [ChainId.ROPSTEN]: WETH9_ADDRESS[ChainId.ROPSTEN],
  [ChainId.RINKEBY]: WETH9_ADDRESS[ChainId.RINKEBY],
  [ChainId.GÖRLI]: WETH9_ADDRESS[ChainId.GÖRLI],
  [ChainId.KOVAN]: WETH9_ADDRESS[ChainId.KOVAN],
  [ChainId.ARBITRUM]: WETH9_ADDRESS[ChainId.ARBITRUM],
  [ChainId.ARBITRUM_TESTNET]: WETH9_ADDRESS[ChainId.ARBITRUM_TESTNET],
  [ChainId.FANTOM]: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
  [ChainId.FANTOM_TESTNET]: '0xf1277d1Ed8AD466beddF92ef448A132661956621',
  [ChainId.MATIC]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  [ChainId.MATIC_TESTNET]: '0x66CAE6D61F266Aa2d1dd6054217B77bd34cDF732',
  [ChainId.XDAI]: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
  [ChainId.BSC]: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  [ChainId.BSC_TESTNET]: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
  [ChainId.MOONBEAM_TESTNET]: '0xe73763DB808ecCDC0E36bC8E32510ED126910394',
  [ChainId.AVALANCHE]: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
  [ChainId.AVALANCHE_TESTNET]: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c',
  [ChainId.HECO]: '0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F',
  [ChainId.HECO_TESTNET]: '0x5B2DA6F42CA09C77D577a12BeaD0446148830687',
  [ChainId.HARMONY]: '0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a',
  [ChainId.HARMONY_TESTNET]: '0x7a2afac38517d512E55C0bCe3b6805c10a04D60F',
  [ChainId.OKEX]: '0x8F8526dbfd6E38E3D8307702cA8469Bae6C56C15',
  [ChainId.OKEX_TESTNET]: '0x2219845942d28716c0F7C605765fABDcA1a7d9E0',
  [ChainId.CELO]: '0x471EcE3750Da237f93B8E339c536989b8978a438',
  [ChainId.PALM]: '0xF98cABF0a963452C5536330408B2590567611a71',
  [ChainId.MOONRIVER]: '0xf50225a84382c74CbdeA10b0c176f71fc3DE0C4d',
  [ChainId.FUSE]: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
  [ChainId.TELOS]: '0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E',
};

type AddressMap = { [chainID: number]: string };
