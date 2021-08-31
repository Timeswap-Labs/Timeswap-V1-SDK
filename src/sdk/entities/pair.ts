import { Signer } from '@ethersproject/abstract-signer';
import { Provider } from '@ethersproject/providers';
import invariant from 'tiny-invariant';
import {
  AbstractToken,
  ERC20Token,
  Uint112,
  Uint128,
  Uint256,
  Uint40,
} from '../..'; //from sdk-core
import { NativeToken } from '../../entities';
import { Conv, ConvSigner } from './conv';

export class Pair {
  protected conv: Conv;
  protected asset: NativeToken | ERC20Token;
  protected collateral: NativeToken | ERC20Token;

  // protected cache? : State

  public constructor(
    providerOrSigner: Provider | Signer,
    asset: NativeToken | ERC20Token,
    collateral: NativeToken | ERC20Token
  ) {
    this.conv = new Conv(providerOrSigner);

    invariant(!(asset.isNative && collateral.isNative), 'Invalid Tokens');

    this.asset = asset;
    this.collateral = collateral;
  }

  upgrade(signer: Signer): PairSigner {
    return new PairSigner(signer, this.asset, this.collateral);
  }

  cacheState() {}

  getState(maturity: Uint256) {}

  getTotalLocked(maturity: Uint256) {}

  getTotalLiquidity(maturity: Uint256) {}

  getLiquidityOf(maturity: Uint256, address: String) {}

  getTotalClaims(maturity: Uint256) {}

  getClaimsOf(maturity: Uint256, address: String) {}

  getDuesOf(maturity: Uint256, address: String) {}

  // async getNative(maturity: Uint256): Promise<Native> {
  //   return await this.conv.getNative(
  //     this.asset.address,
  //     this.collateral.address,
  //     maturity.get()
  //   );
  // }
}

export class PairSigner extends Pair {
  protected convSigner: ConvSigner;

  constructor(signer: Signer, asset: AbstractToken, collateral: AbstractToken) {
    super(signer, asset, collateral);
    this.convSigner = this.conv.upgrade(signer);
  }

  async newLiquidity(params: NewLiquidity) {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      const assetIn = params.assetIn;
      const collateralIn = params.collateralIn;
      invariant(assetIn, 'assetIn is undefined');
      invariant(collateralIn, 'collateralIn is undefined');

      await this.convSigner.newLiquidity({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        assetIn,
        collateralIn,
      });
    } else if (this.collateral instanceof ERC20Token) {
      const collateralIn = params.collateralIn;
      invariant(collateralIn, 'collateralIn is undefined');

      await this.convSigner.newLiquidityETHAsset({
        ...params,
        collateral: this.collateral,
        collateralIn,
      });
    } else if (this.asset instanceof ERC20Token) {
      const assetIn = params.assetIn;
      invariant(assetIn, 'assetIn is undefined');

      await this.convSigner.newLiquidityETHCollateral({
        ...params,
        asset: this.asset,
        assetIn,
      });
    }
  }

  async addLiquidity(params: AddLiquidity) {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      const assetIn = params.assetIn;
      const maxCollateral = params.maxCollateral;
      invariant(assetIn, 'assetIn is undefined');
      invariant(maxCollateral, 'maxCollateral is undefined');

      await this.convSigner.addLiquidity({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        assetIn,
        maxCollateral,
      });
    } else if (this.collateral instanceof ERC20Token) {
      const maxCollateral = params.maxCollateral;
      invariant(maxCollateral, 'maxCollateral is undefined');

      await this.convSigner.addLiquidityETHAsset({
        ...params,
        collateral: this.collateral,
        maxCollateral,
      });
    } else if (this.asset instanceof ERC20Token) {
      const assetIn = params.assetIn;
      invariant(assetIn, 'assetIn is undefined');

      await this.convSigner.addLiquidityETHCollateral({
        ...params,
        asset: this.asset,
        assetIn,
      });
    }
  }
}

interface Native {
  liquidity: string;
  bond: string;
  insurance: string;
  collateralizedDebt: string;
}
interface NewLiquidity {
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  assetIn?: Uint112;
  debtOut: Uint112;
  collateralIn?: Uint112;
  deadline: Uint256;
}

interface _NewLiquidity {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  assetFrom: string;
  collateralFrom: string;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uint112;
  debtOut: Uint112;
  collateralIn: Uint112;
  deadline: Uint256;
}

interface AddLiquidity {
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  assetIn?: Uint112;
  minLiquidity: Uint256;
  maxDebt: Uint112;
  maxCollateral?: Uint112;
  deadline: Uint256;
}

interface _AddLiquidity {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  assetFrom: string;
  collateralFrom: string;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uint112;
  minLiquidity: Uint256;
  maxDebt: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}
interface RemoveLiquidity {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  collateralTo: string;
  liquidityIn: Uint256;
}

interface RemoveLiquidityETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  collateralTo: string;
  liquidityIn: Uint256;
}

interface RemoveLiquidityETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  collateralTo: string;
  liquidityIn: Uint256;
}
interface LendGivenBond {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  bondOut: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface LendGivenBondETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  bondOut: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface LendGivenBondETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  bondOut: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface _LendGivenBond {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  from: string;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  bondOut: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface LendGivenInsurance {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  insuranceOut: Uint128;
  minBond: Uint128;
  deadline: Uint256;
}

interface LendGivenInsuranceETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  insuranceOut: Uint128;
  minBond: Uint128;
  deadline: Uint256;
}

interface LendGivenInsuranceETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  insuranceOut: Uint128;
  minBond: Uint128;
  deadline: Uint256;
}

interface _LendGivenInsurance {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  from: string;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  insuranceOut: Uint128;
  minBond: Uint128;
  deadline: Uint256;
}

interface LendGivenPercent {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  percent: Uint40;
  minBond: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface LendGivenPercentETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  percent: Uint40;
  minBond: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface LendGivenPercentETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  percent: Uint40;
  minBond: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface _LendGivenPercent {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  from: string;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  percent: Uint40;
  minBond: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}
interface Collect {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  collateralTo: string;
  claimsIn: Claims;
}

interface CollectETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  collateralTo: string;
  claimsIn: Claims;
}

interface CollectETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  collateralTo: string;
  claimsIn: Claims;
}

interface Claims {
  bond: Uint128;
  insurance: Uint128;
}

interface BorrowGivenDebt {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  debtIn: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface BorrowGivenDebtETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  debtIn: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface BorrowGivenDebtETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  debtIn: Uint112;
  deadline: Uint256;
}

interface _BorrowGivenDebt {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  from: string;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  debtIn: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}
interface BorrowGivenCollateral {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  collateralIn: Uint112;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface BorrowGivenCollateralETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  collateralIn: Uint112;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface BorrowGivenCollateralETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface _BorrowGivenCollateral {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  from: string;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  collateralIn: Uint112;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface BorrowGivenPercent {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  percent: Uint40;
  maxDebt: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface BorrowGivenPercentETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  percent: Uint40;
  maxDebt: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface BorrowGivenPercentETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  percent: Uint40;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface _BorrowGivenPercent {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  from: string;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  percent: Uint40;
  maxDebt: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}
interface Repay {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  collateralTo: string;
  ids: Uint256[];
  maxAssetsIn: Uint112[];
  deadline: Uint256;
}

interface RepayETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  collateralTo: string;
  ids: Uint256[];
  maxAssetsIn: Uint112[];
  deadline: Uint256;
}

interface RepayETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  collateralTo: string;
  ids: Uint256[];
  maxAssetsIn: Uint112[];
  deadline: Uint256;
}

interface _Repay {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  from: string;
  collateralTo: string;
  ids: Uint256[];
  maxAssetsIn: Uint112[];
  deadline: Uint256;
}
