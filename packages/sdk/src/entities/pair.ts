import { Signer } from '@ethersproject/abstract-signer';
import { ContractTransaction } from '@ethersproject/contracts';
import { Provider } from '@ethersproject/abstract-provider';
import invariant from 'tiny-invariant';
import {
  ERC20Token,
  NativeToken,
  Due as DueCalculated,
  Pair as PairCore,
  Uint112,
  Uint128,
  Uint16,
  Uint256,
  Uint32,
  Uint40,
  CP,
  Uint120,
} from '@timeswap-labs/timeswap-v1-sdk-core';
import type { TimeswapPair } from '../typechain/timeswap';
import {
  TimeswapFactory__factory,
  TimeswapPair__factory,
} from '../typechain/timeswap';
import { Conv, ConvSigner } from './conv';

export class Pair {
  protected conv: Conv;

  readonly asset: NativeToken | ERC20Token;
  readonly collateral: NativeToken | ERC20Token;

  protected pair?: TimeswapPair;

  public constructor(
    providerOrSigner: Provider | Signer,
    asset: NativeToken | ERC20Token,
    collateral: NativeToken | ERC20Token,
    convAddress?: string,
    pairAddress?: string
  ) {
    this.conv = new Conv(providerOrSigner, convAddress);

    invariant(!(asset.isNative && collateral.isNative), 'Invalid Tokens');

    this.asset = asset;
    this.collateral = collateral;

    if (pairAddress) {
      this.pair = TimeswapPair__factory.connect(pairAddress, providerOrSigner);
    }
  }

  address(): string | undefined {
    return this.pair?.address;
  }

  convAddress(): string {
    return this.conv.address();
  }

  connect(providerOrSigner: Provider | Signer) {
    this.conv.connect(providerOrSigner);
  }

  upgrade(signer: Signer): PairSigner {
    return new PairSigner(
      signer,
      this.asset,
      this.collateral,
      this.conv.address(),
      this.pair?.address
    );
  }

  provider(): Provider {
    return this.conv.provider();
  }

  signer(): Signer {
    return this.conv.signer();
  }

  async initPair() {
    if (!this.pair) {
      const factory = await this.conv.factory();
      const factoryContract = TimeswapFactory__factory.connect(
        factory,
        this.conv.provider()
      );

      const getTokenAddress = async (
        token: NativeToken | ERC20Token
      ): Promise<string> => {
        if (token instanceof ERC20Token) return token.address;
        else return this.conv.weth();
      };

      const asset = await getTokenAddress(this.asset);
      const collateral = await getTokenAddress(this.collateral);

      const pair = await factoryContract.getPair(asset, collateral);
      this.pair = TimeswapPair__factory.connect(pair, this.conv.provider());
    }
  }

  async factory(): Promise<string> {
    return this.conv.factory();
  }

  async weth(): Promise<string> {
    return this.conv.weth();
  }

  async getFee(): Promise<Uint16> {
    await this.initPair();
    const fee = await this.pair!.fee();

    return new Uint16(fee);
  }

  async getProtocolFee(): Promise<Uint16> {
    await this.initPair();
    const protocolFee = await this.pair!.protocolFee();

    return new Uint16(protocolFee);
  }

  async getConstantProduct(maturity: Uint256): Promise<CP> {
    await this.initPair();
    const state = await this.pair!.constantProduct(maturity.value);

    const x = new Uint112(state.x.toString());
    const y = new Uint112(state.y.toString());
    const z = new Uint112(state.z.toString());

    return { x, y, z };
  }

  async getTotalReserves(maturity: Uint256): Promise<Tokens> {
    await this.initPair();
    const tokens = await this.pair!.totalReserves(maturity.value);

    const asset = new Uint128(tokens.asset.toString());
    const collateral = new Uint128(tokens.collateral.toString());

    return { asset, collateral };
  }

  async getTotalLiquidity(maturity: Uint256): Promise<Uint256> {
    await this.initPair();
    const totalLiquidity = await this.pair!.totalLiquidity(maturity.value);

    return new Uint256(totalLiquidity.toString());
  }

  async getLiquidityOf(maturity: Uint256, address: string): Promise<Uint256> {
    await this.initPair();
    const liquidityOf = await this.pair!.liquidityOf(maturity.value, address);

    return new Uint256(liquidityOf.toString());
  }

  async getTotalClaims(maturity: Uint256): Promise<Claims> {
    await this.initPair();
    const claims = await this.pair!.totalClaims(maturity.value);

    const bond = new Uint128(claims.bond.toString());
    const insurance = new Uint128(claims.insurance.toString());

    return { bond, insurance };
  }

  async getClaimsOf(maturity: Uint256, address: string): Promise<Claims> {
    await this.initPair();
    const claims = await this.pair!.claimsOf(maturity.value, address);

    const bond = new Uint128(claims.bond.toString());
    const insurance = new Uint128(claims.insurance.toString());

    return { bond, insurance };
  }

  async getTotalDebtCreated(maturity: Uint256): Promise<Uint120> {
    await this.initPair();
    const totalDebtCreated = await this.pair!.totalDebtCreated(maturity.value);

    return new Uint120(totalDebtCreated.toString());
  }

  async getDuesOf(maturity: Uint256, address: string): Promise<Due[]> {
    await this.initPair();
    const dues = await this.pair!.duesOf(maturity.value, address);

    return dues.map((due) => {
      const debt = new Uint112(due.debt.toString());
      const collateral = new Uint112(due.collateral.toString());
      const startBlock = new Uint32(due.startBlock);

      return { debt, collateral, startBlock };
    });
  }

  async getNative(maturity: Uint256): Promise<Native> {
    const asset = this.asset;
    const collateral = this.collateral;
    invariant(asset instanceof ERC20Token, 'asset is not ERC20');
    invariant(collateral instanceof ERC20Token, 'collateral is not ERC20');

    return this.conv.getNative(asset, collateral, maturity);
  }

  calculateApr(state: CP): number {
    const SECONDS = 31556926n;
    const temp = (state.y.value * SECONDS * 10000n) / (state.x.value << 32n);
    const apr = Number(temp) / 10000;
    return apr;
  }

  calculateCf(state: CP): Uint112 {
    let temp = 1n;
    for (let i = 0; i < this.collateral.decimals; i++) temp *= 10n;
    return new Uint112((state.x.value * temp) / state.y.value);
  }

  calculateNewLiquidity(
    state: CP,
    protocolFee: Uint16,
    totalLiquidity: Uint256,
    assetIn: Uint112,
    debtIn: Uint112,
    collateralIn: Uint112,
    maturity: Uint256,
    now: Uint256
  ): { liquidityOut: Uint256; dueOut: DueCalculated } {
    return PairCore.newLiquidity(
      state,
      maturity,
      totalLiquidity,
      assetIn,
      debtIn,
      collateralIn,
      now,
      protocolFee
    );
  }

  calculateAddLiquidity(
    state: CP,
    protocolFee: Uint16,
    totalLiquidity: Uint256,
    assetIn: Uint112,
    maturity: Uint256,
    now: Uint256
  ): { liquidityOut: Uint256; dueOut: DueCalculated } {
    return PairCore.addLiquidity(
      state,
      maturity,
      totalLiquidity,
      assetIn,
      now,
      protocolFee
    );
  }

  calculateLendGivenBond(
    state: CP,
    fee: Uint16,
    assetIn: Uint112,
    bondOut: Uint128,
    maturity: Uint256,
    now: Uint256
  ): Claims {
    return PairCore.lendGivenBond(state, maturity, assetIn, bondOut, now, fee);
  }

  calculateLendGivenInsurance(
    state: CP,
    fee: Uint16,
    assetIn: Uint112,
    insuranceOut: Uint128,
    maturity: Uint256,
    now: Uint256
  ): Claims {
    return PairCore.lendGivenInsurance(
      state,
      maturity,
      assetIn,
      insuranceOut,
      now,
      fee
    );
  }

  calculateLendGivenPercent(
    state: CP,
    fee: Uint16,
    assetIn: Uint112,
    percent: Uint40,
    maturity: Uint256,
    now: Uint256
  ): Claims {
    return PairCore.lendGivenPercent(
      state,
      maturity,
      assetIn,
      percent,
      now,
      fee
    );
  }

  calculateBorrowGivenDebt(
    state: CP,
    fee: Uint16,
    assetOut: Uint112,
    debtIn: Uint112,
    maturity: Uint256,
    now: Uint256
  ): DueCalculated {
    return PairCore.borrowGivenDebt(
      state,
      maturity,
      assetOut,
      debtIn,
      now,
      fee
    );
  }

  calculateBorrowGivenCollateral(
    state: CP,
    fee: Uint16,
    assetOut: Uint112,
    collateralIn: Uint112,
    maturity: Uint256,
    now: Uint256
  ): DueCalculated {
    return PairCore.borrowGivenCollateral(
      state,
      maturity,
      assetOut,
      collateralIn,
      now,
      fee
    );
  }

  calculateBorrowGivenPercent(
    state: CP,
    fee: Uint16,
    assetOut: Uint112,
    percent: Uint40,
    maturity: Uint256,
    now: Uint256
  ): DueCalculated {
    return PairCore.borrowGivenPercent(
      state,
      maturity,
      assetOut,
      percent,
      now,
      fee
    );
  }
}

export class PairSigner extends Pair {
  async newLiquidity(params: NewLiquidity): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      const { assetIn, collateralIn } = params;
      invariant(assetIn, 'assetIn is undefined');
      invariant(collateralIn, 'collateralIn is undefined');

      return (this.conv as ConvSigner).newLiquidity({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        assetIn,
        collateralIn,
      });
    } else if (this.collateral instanceof ERC20Token) {
      const { collateralIn } = params;
      invariant(collateralIn, 'collateralIn is undefined');

      return (this.conv as ConvSigner).newLiquidityETHAsset({
        ...params,
        collateral: this.collateral,
        collateralIn,
      });
    } else if (this.asset instanceof ERC20Token) {
      const { assetIn } = params;
      invariant(assetIn, 'assetIn is undefined');

      return (this.conv as ConvSigner).newLiquidityETHCollateral({
        ...params,
        asset: this.asset,
        assetIn,
      });
    } else {
      throw 'Unreachable';
    }
  }

  async addLiquidity(params: AddLiquidity): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      const { assetIn, maxCollateral } = params;
      invariant(assetIn, 'assetIn is undefined');
      invariant(maxCollateral, 'maxCollateral is undefined');

      return (this.conv as ConvSigner).addLiquidity({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        assetIn,
        maxCollateral,
      });
    } else if (this.collateral instanceof ERC20Token) {
      const { maxCollateral } = params;
      invariant(maxCollateral, 'maxCollateral is undefined');

      return (this.conv as ConvSigner).addLiquidityETHAsset({
        ...params,
        collateral: this.collateral,
        maxCollateral,
      });
    } else if (this.asset instanceof ERC20Token) {
      const { assetIn } = params;
      invariant(assetIn, 'assetIn is undefined');

      return (this.conv as ConvSigner).addLiquidityETHCollateral({
        ...params,
        asset: this.asset,
        assetIn,
      });
    } else {
      throw 'Unreachable';
    }
  }

  async removeLiquidity(params: RemoveLiquidity): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      return (this.conv as ConvSigner).removeLiquidity({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
      });
    } else if (this.collateral instanceof ERC20Token) {
      return (this.conv as ConvSigner).removeLiquidityETHAsset({
        ...params,
        collateral: this.collateral,
      });
    } else if (this.asset instanceof ERC20Token) {
      return (this.conv as ConvSigner).removeLiquidityETHCollateral({
        ...params,
        asset: this.asset,
      });
    } else {
      throw 'Unreachable';
    }
  }

  async lendGivenBond(params: LendGivenBond): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      const { assetIn } = params;
      invariant(assetIn, 'assetIn is undefined');

      return (this.conv as ConvSigner).lendGivenBond({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        assetIn,
      });
    } else if (this.collateral instanceof ERC20Token) {
      return (this.conv as ConvSigner).lendGivenBondETHAsset({
        ...params,
        collateral: this.collateral,
      });
    } else if (this.asset instanceof ERC20Token) {
      const { assetIn } = params;
      invariant(assetIn, 'assetIn is undefined');

      return (this.conv as ConvSigner).lendGivenBondETHCollateral({
        ...params,
        asset: this.asset,
        assetIn,
      });
    } else {
      throw 'Unreachable';
    }
  }

  async lendGivenInsurance(
    params: LendGivenInsurance
  ): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      const { assetIn } = params;
      invariant(assetIn, 'assetIn is undefined');

      return (this.conv as ConvSigner).lendGivenInsurance({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        assetIn,
      });
    } else if (this.collateral instanceof ERC20Token) {
      return (this.conv as ConvSigner).lendGivenInsuranceETHAsset({
        ...params,
        collateral: this.collateral,
      });
    } else if (this.asset instanceof ERC20Token) {
      const { assetIn } = params;
      invariant(assetIn, 'assetIn is undefined');

      return (this.conv as ConvSigner).lendGivenInsuranceETHCollateral({
        ...params,
        asset: this.asset,
        assetIn,
      });
    } else {
      throw 'Unreachable';
    }
  }

  async lendGivenPercent(
    params: LendGivenPercent
  ): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      const { assetIn } = params;
      invariant(assetIn, 'assetIn is undefined');

      return (this.conv as ConvSigner).lendGivenPercent({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        assetIn,
      });
    } else if (this.collateral instanceof ERC20Token) {
      return (this.conv as ConvSigner).lendGivenPercentETHAsset({
        ...params,
        collateral: this.collateral,
      });
    } else if (this.asset instanceof ERC20Token) {
      const { assetIn } = params;
      invariant(assetIn, 'assetIn is undefined');

      return (this.conv as ConvSigner).lendGivenPercentETHCollateral({
        ...params,
        asset: this.asset,
        assetIn,
      });
    } else {
      throw 'Unreachable';
    }
  }

  async collect(params: Collect): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      return (this.conv as ConvSigner).collect({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
      });
    } else if (this.collateral instanceof ERC20Token) {
      return (this.conv as ConvSigner).collectETHAsset({
        ...params,
        collateral: this.collateral,
      });
    } else if (this.asset instanceof ERC20Token) {
      return (this.conv as ConvSigner).collectETHCollateral({
        ...params,
        asset: this.asset,
      });
    } else {
      throw 'Unreachable';
    }
  }

  async borrowGivenDebt(params: BorrowGivenDebt): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      const { maxCollateral } = params;
      invariant(maxCollateral, 'maxCollateral is undefined');

      return (this.conv as ConvSigner).borrowGivenDebt({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        maxCollateral,
      });
    } else if (this.collateral instanceof ERC20Token) {
      const { maxCollateral } = params;
      invariant(maxCollateral, 'maxCollateral is undefined');

      return (this.conv as ConvSigner).borrowGivenDebtETHAsset({
        ...params,
        collateral: this.collateral,
        maxCollateral,
      });
    } else if (this.asset instanceof ERC20Token) {
      return (this.conv as ConvSigner).borrowGivenDebtETHCollateral({
        ...params,
        asset: this.asset,
      });
    } else {
      throw 'Unreachable';
    }
  }

  async borrowGivenCollateral(
    params: BorrowGivenCollateral
  ): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      const { collateralIn } = params;
      invariant(collateralIn, 'collateralIn is undefined');

      return (this.conv as ConvSigner).borrowGivenCollateral({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        collateralIn,
      });
    } else if (this.collateral instanceof ERC20Token) {
      const { collateralIn } = params;
      invariant(collateralIn, 'collateralIn is undefined');

      return (this.conv as ConvSigner).borrowGivenCollateralETHAsset({
        ...params,
        collateral: this.collateral,
        collateralIn,
      });
    } else if (this.asset instanceof ERC20Token) {
      return (this.conv as ConvSigner).borrowGivenCollateralETHCollateral({
        ...params,
        asset: this.asset,
      });
    } else {
      throw 'Unreachable';
    }
  }

  async borrowGivenPercent(
    params: BorrowGivenPercent
  ): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      const { maxCollateral } = params;
      invariant(maxCollateral, 'maxCollateral is undefined');

      return (this.conv as ConvSigner).borrowGivenPercent({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
        maxCollateral,
      });
    } else if (this.collateral instanceof ERC20Token) {
      const { maxCollateral } = params;
      invariant(maxCollateral, 'maxCollateral is undefined');

      return (this.conv as ConvSigner).borrowGivenPercentETHAsset({
        ...params,
        collateral: this.collateral,
        maxCollateral,
      });
    } else if (this.asset instanceof ERC20Token) {
      return (this.conv as ConvSigner).borrowGivenPercentETHCollateral({
        ...params,
        asset: this.asset,
      });
    } else {
      throw 'Unreachable';
    }
  }

  async repay(params: Repay): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      return (this.conv as ConvSigner).repay({
        ...params,
        asset: this.asset,
        collateral: this.collateral,
      });
    } else if (this.collateral instanceof ERC20Token) {
      return (this.conv as ConvSigner).repayETHAsset({
        ...params,
        collateral: this.collateral,
      });
    } else if (this.asset instanceof ERC20Token) {
      return (this.conv as ConvSigner).repayETHCollateral({
        ...params,
        asset: this.asset,
      });
    } else {
      throw 'Unreachable';
    }
  }
}

interface Tokens {
  asset: Uint128;
  collateral: Uint128;
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
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  assetIn?: Uint112;
  debtIn: Uint112;
  collateralIn?: Uint112;
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

interface RemoveLiquidity {
  maturity: Uint256;
  assetTo: string;
  collateralTo: string;
  liquidityIn: Uint256;
}

interface LendGivenBond {
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  assetIn?: Uint112;
  bondOut: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface LendGivenInsurance {
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  assetIn?: Uint112;
  insuranceOut: Uint128;
  minBond: Uint128;
  deadline: Uint256;
}

interface LendGivenPercent {
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  assetIn?: Uint112;
  percent: Uint40;
  minBond: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface Collect {
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
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  debtIn: Uint112;
  maxCollateral?: Uint112;
  deadline: Uint256;
}

interface BorrowGivenCollateral {
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  collateralIn?: Uint112;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface BorrowGivenPercent {
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  percent: Uint40;
  maxDebt: Uint112;
  maxCollateral?: Uint112;
  deadline: Uint256;
}

interface Repay {
  maturity: Uint256;
  collateralTo: string;
  ids: Uint256[];
  maxAssetsIn: Uint112[];
  deadline: Uint256;
}
