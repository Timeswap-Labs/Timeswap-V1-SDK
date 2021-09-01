import { Signer } from '@ethersproject/abstract-signer';
import { Provider } from '@ethersproject/providers';
import invariant from 'tiny-invariant';
import {
  AbstractToken,
  ERC20Token,
  Uint112,
  Uint128,
  Uint256,
  Uint32,
  Uint40,
} from '../..'; //from sdk-core
import { NativeToken } from '../../entities';
import {
  TimeswapFactory__factory,
  TimeswapPair,
  TimeswapPair__factory,
} from '../../typechain/timeswap';
import { Conv, ConvSigner } from './conv';

export class Pool {
  protected conv: Conv;
  protected asset: NativeToken | ERC20Token;
  protected collateral: NativeToken | ERC20Token;
  protected maturity: Uint256;

  protected pair?: TimeswapPair;

  public constructor(
    providerOrSigner: Provider | Signer,
    asset: NativeToken | ERC20Token,
    collateral: NativeToken | ERC20Token,
    maturity: Uint256
  ) {
    this.conv = new Conv(providerOrSigner);

    invariant(!(asset.isNative && collateral.isNative), 'Invalid Tokens');

    this.asset = asset;
    this.collateral = collateral;
    this.maturity = maturity;
  }

  upgrade(signer: Signer): PoolSigner {
    return new PoolSigner(signer, this.asset, this.collateral, this.maturity);
  }

  async initPair() {
    if (!this.pair) {
      const factory = await this.conv.factory();
      const factoryContract = TimeswapFactory__factory.connect(
        factory,
        this.conv.getProviderOrSigner()
      );

      const getTokenAddress = async (
        token: NativeToken | ERC20Token
      ): Promise<string> => {
        if (token instanceof ERC20Token) return token.address;
        else return await this.conv.weth();
      };

      const asset = await getTokenAddress(this.asset);
      const collateral = await getTokenAddress(this.collateral);

      const pair = await factoryContract.getPair(asset, collateral);
      this.pair = TimeswapPair__factory.connect(
        pair,
        this.conv.getProviderOrSigner()
      );
    }
  }

  async getState(): Promise<State> {
    await this.initPair();
    const state = await this.pair!.state(this.maturity.value);

    const asset = new Uint112(state.asset.toString());
    const interest = new Uint112(state.interest.toString());
    const cdp = new Uint112(state.cdp.toString());

    return { asset, interest, cdp };
  }

  async getTotalLocked(): Promise<Tokens> {
    await this.initPair();
    const tokens = await this.pair!.totalLocked(this.maturity.value);

    const asset = new Uint128(tokens.asset.toString());
    const collateral = new Uint128(tokens.collateral.toString());

    return { asset, collateral };
  }

  async getTotalLiquidity(): Promise<Uint256> {
    await this.initPair();
    const totalLiquidity = await this.pair!.totalLiquidity(this.maturity.value);

    return new Uint256(totalLiquidity.toString());
  }

  async getLiquidityOf(address: string): Promise<Uint256> {
    await this.initPair();
    const liquidityOf = await this.pair!.liquidityOf(
      this.maturity.value,
      address
    );

    return new Uint256(liquidityOf.toString());
  }

  async getTotalClaims(): Promise<Claims> {
    await this.initPair();
    const claims = await this.pair!.totalClaims(this.maturity.value);

    const bond = new Uint128(claims.bond.toString());
    const insurance = new Uint128(claims.insurance.toString());

    return { bond, insurance };
  }

  async getClaimsOf(address: string): Promise<Claims> {
    await this.initPair();
    const claims = await this.pair!.claimsOf(this.maturity.value, address);

    const bond = new Uint128(claims.bond.toString());
    const insurance = new Uint128(claims.insurance.toString());

    return { bond, insurance };
  }

  async getDuesOf(address: string): Promise<Due[]> {
    await this.initPair();
    const dues = await this.pair!.duesOf(maturity.value, address);

    return dues.map(due => {
      const debt = new Uint112(due.debt.toString());
      const collateral = new Uint112(due.collateral.toString());
      const startBlock = new Uint32(due.startBlock);

      return { debt, collateral, startBlock };
    });
  }

  async getNative(): Promise<Native> {
    const asset = this.asset;
    const collateral = this.collateral;
    invariant(asset instanceof ERC20Token, 'asset is not ERC20');
    invariant(collateral instanceof ERC20Token, 'collateral is not ERC20');

    return await this.conv.getNative(asset, collateral, this.maturity);
  }
}

export class PoolSigner extends Pool {
  protected convSigner: ConvSigner;
  constructor(
    signer: Signer,
    asset: AbstractToken,
    collateral: AbstractToken,
    maturity: Uint256
  ) {
    super(signer, asset, collateral, maturity);
    this.convSigner = this.conv.upgrade(signer);
  }

  async newLiquidity(params: NewLiquidity) {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      const { assetIn, collateralIn } = params;
      invariant(assetIn, 'assetIn is undefined');
      invariant(collateralIn, 'collateralIn is undefined');

      await this.convSigner.newLiquidity({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        assetIn,
        collateralIn,
        maturity: this.maturity,
      });
    } else if (this.collateral instanceof ERC20Token) {
      const { collateralIn } = params;
      invariant(collateralIn, 'collateralIn is undefined');

      await this.convSigner.newLiquidityETHAsset({
        ...params,
        collateral: this.collateral,
        collateralIn,
        maturity: this.maturity,
      });
    } else if (this.asset instanceof ERC20Token) {
      const { assetIn } = params;
      invariant(assetIn, 'assetIn is undefined');

      await this.convSigner.newLiquidityETHCollateral({
        ...params,
        asset: this.asset,
        assetIn,
        maturity: this.maturity,
      });
    }
  }

  async addLiquidity(params: AddLiquidity) {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      const { assetIn, maxCollateral } = params;
      invariant(assetIn, 'assetIn is undefined');
      invariant(maxCollateral, 'maxCollateral is undefined');

      await this.convSigner.addLiquidity({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        assetIn,
        maxCollateral,
        maturity: this.maturity,
      });
    } else if (this.collateral instanceof ERC20Token) {
      const { maxCollateral } = params;
      invariant(maxCollateral, 'maxCollateral is undefined');

      await this.convSigner.addLiquidityETHAsset({
        ...params,
        collateral: this.collateral,
        maxCollateral,
        maturity: this.maturity,
      });
    } else if (this.asset instanceof ERC20Token) {
      const { assetIn } = params;
      invariant(assetIn, 'assetIn is undefined');

      await this.convSigner.addLiquidityETHCollateral({
        ...params,
        asset: this.asset,
        assetIn,
        maturity: this.maturity,
      });
    }
  }

  async removeLiquidity(params: RemoveLiquidity) {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      await this.convSigner.removeLiquidity({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        maturity: this.maturity,
      });
    } else if (this.collateral instanceof ERC20Token) {
      await this.convSigner.removeLiquidityETHAsset({
        ...params,
        collateral: this.collateral,
        maturity: this.maturity,
      });
    } else if (this.asset instanceof ERC20Token) {
      await this.convSigner.removeLiquidityETHCollateral({
        ...params,
        asset: this.asset,
        maturity: this.maturity,
      });
    }
  }

  async lendGivenBond(params: LendGivenBond) {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      const { assetIn } = params;
      invariant(assetIn, 'assetIn is undefined');

      await this.convSigner.lendGivenBond({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        assetIn,
        maturity: this.maturity,
      });
    } else if (this.collateral instanceof ERC20Token) {
      await this.convSigner.lendGivenBondETHAsset({
        ...params,
        collateral: this.collateral,
        maturity: this.maturity,
      });
    } else if (this.asset instanceof ERC20Token) {
      const { assetIn } = params;
      invariant(assetIn, 'assetIn is undefined');

      await this.convSigner.lendGivenBondETHCollateral({
        ...params,
        asset: this.asset,
        assetIn,
        maturity: this.maturity,
      });
    }
  }

  async lendGivenInsurance(params: LendGivenInsurance) {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      const { assetIn } = params;
      invariant(assetIn, 'assetIn is undefined');

      await this.convSigner.lendGivenInsurance({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        assetIn,
        maturity: this.maturity,
      });
    } else if (this.collateral instanceof ERC20Token) {
      await this.convSigner.lendGivenInsuranceETHAsset({
        ...params,
        collateral: this.collateral,
        maturity: this.maturity,
      });
    } else if (this.asset instanceof ERC20Token) {
      const { assetIn } = params;
      invariant(assetIn, 'assetIn is undefined');

      await this.convSigner.lendGivenInsuranceETHCollateral({
        ...params,
        asset: this.asset,
        assetIn,
        maturity: this.maturity,
      });
    }
  }

  async lendGivenPercent(params: LendGivenPercent) {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      const { assetIn } = params;
      invariant(assetIn, 'assetIn is undefined');

      await this.convSigner.lendGivenPercent({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        assetIn,
        maturity: this.maturity,
      });
    } else if (this.collateral instanceof ERC20Token) {
      await this.convSigner.lendGivenPercentETHAsset({
        ...params,
        collateral: this.collateral,
        maturity: this.maturity,
      });
    } else if (this.asset instanceof ERC20Token) {
      const { assetIn } = params;
      invariant(assetIn, 'assetIn is undefined');

      await this.convSigner.lendGivenPercentETHCollateral({
        ...params,
        asset: this.asset,
        assetIn,
        maturity: this.maturity,
      });
    }
  }

  async collect(params: Collect) {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      await this.convSigner.collect({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        maturity: this.maturity,
      });
    } else if (this.collateral instanceof ERC20Token) {
      await this.convSigner.collectETHAsset({
        ...params,
        collateral: this.collateral,
        maturity: this.maturity,
      });
    } else if (this.asset instanceof ERC20Token) {
      await this.convSigner.collectETHCollateral({
        ...params,
        asset: this.asset,
        maturity: this.maturity,
      });
    }
  }

  async borrowGivenDebt(params: BorrowGivenDebt) {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      const { maxCollateral } = params;
      invariant(maxCollateral, 'maxCollateral is undefined');

      await this.convSigner.borrowGivenDebt({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        maxCollateral,
        maturity: this.maturity,
      });
    } else if (this.collateral instanceof ERC20Token) {
      const { maxCollateral } = params;
      invariant(maxCollateral, 'maxCollateral is undefined');

      await this.convSigner.borrowGivenDebtETHAsset({
        ...params,
        collateral: this.collateral,
        maxCollateral,
        maturity: this.maturity,
      });
    } else if (this.asset instanceof ERC20Token) {
      await this.convSigner.borrowGivenDebtETHCollateral({
        ...params,
        asset: this.asset,
        maturity: this.maturity,
      });
    }
  }

  async borrowGivenCollateral(params: BorrowGivenCollateral) {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      const { collateralIn } = params;
      invariant(collateralIn, 'collateralIn is undefined');

      await this.convSigner.borrowGivenCollateral({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        collateralIn,
        maturity: this.maturity,
      });
    } else if (this.collateral instanceof ERC20Token) {
      const { collateralIn } = params;
      invariant(collateralIn, 'collateralIn is undefined');

      await this.convSigner.borrowGivenCollateralETHAsset({
        ...params,
        collateral: this.collateral,
        collateralIn,
        maturity: this.maturity,
      });
    } else if (this.asset instanceof ERC20Token) {
      await this.convSigner.borrowGivenCollateralETHCollateral({
        ...params,
        asset: this.asset,
        maturity: this.maturity,
      });
    }
  }

  async borrowGivenPercent(params: BorrowGivenPercent) {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      const { maxCollateral } = params;
      invariant(maxCollateral, 'maxCollateral is undefined');

      await this.convSigner.borrowGivenPercent({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        maxCollateral,
        maturity: this.maturity,
      });
    } else if (this.collateral instanceof ERC20Token) {
      const { maxCollateral } = params;
      invariant(maxCollateral, 'maxCollateral is undefined');

      await this.convSigner.borrowGivenPercentETHAsset({
        ...params,
        collateral: this.collateral,
        maxCollateral,
        maturity: this.maturity,
      });
    } else if (this.asset instanceof ERC20Token) {
      await this.convSigner.borrowGivenPercentETHCollateral({
        ...params,
        asset: this.asset,
        maturity: this.maturity,
      });
    }
  }

  async repay(params: Repay) {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      await this.convSigner.repay({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        maturity: this.maturity,
      });
    } else if (this.collateral instanceof ERC20Token) {
      await this.convSigner.repayETHAsset({
        ...params,
        collateral: this.collateral,
        maturity: this.maturity,
      });
    } else if (this.asset instanceof ERC20Token) {
      await this.convSigner.repayETHCollateral({
        ...params,
        asset: this.asset,
        maturity: this.maturity,
      });
    }
  }
}

interface Tokens {
  asset: Uint128;
  collateral: Uint128;
}

interface State {
  asset: Uint112;
  interest: Uint112;
  cdp: Uint112;
}

interface Due {
  debt: Uint112;
  collateral: Uint112;
  startBlock: Uint32;
}

interface Native {
  liquidity: string;
  bond: string;
  insurance: string;
  collateralizedDebt: string;
}
interface NewLiquidity {
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
  assetTo: string;
  collateralTo: string;
  liquidityIn: Uint256;
}

interface LendGivenBond {
  asset: ERC20Token;
  collateral: ERC20Token;

  bondTo: string;
  insuranceTo: string;
  assetIn?: Uint112;
  bondOut: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface _LendGivenBond {
  asset: ERC20Token;
  collateral: ERC20Token;

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

  bondTo: string;
  insuranceTo: string;
  assetIn?: Uint112;
  insuranceOut: Uint128;
  minBond: Uint128;
  deadline: Uint256;
}

interface _LendGivenInsurance {
  asset: ERC20Token;
  collateral: ERC20Token;

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

  bondTo: string;
  insuranceTo: string;
  assetIn?: Uint112;
  percent: Uint40;
  minBond: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface _LendGivenPercent {
  asset: ERC20Token;
  collateral: ERC20Token;

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

  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  debtIn: Uint112;
  maxCollateral?: Uint112;
  deadline: Uint256;
}

interface _BorrowGivenDebt {
  asset: ERC20Token;
  collateral: ERC20Token;

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

  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  collateralIn?: Uint112;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface _BorrowGivenCollateral {
  asset: ERC20Token;
  collateral: ERC20Token;

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

  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  percent: Uint40;
  maxDebt: Uint112;
  maxCollateral?: Uint112;
  deadline: Uint256;
}

interface _BorrowGivenPercent {
  asset: ERC20Token;
  collateral: ERC20Token;

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

  collateralTo: string;
  ids: Uint256[];
  maxAssetsIn: Uint112[];
  deadline: Uint256;
}

interface _Repay {
  asset: ERC20Token;
  collateral: ERC20Token;

  from: string;
  collateralTo: string;
  ids: Uint256[];
  maxAssetsIn: Uint112[];
  deadline: Uint256;
}
