import { Signer } from '@ethersproject/abstract-signer';
import { Contract, ContractTransaction } from '@ethersproject/contracts';
import { Provider } from '@ethersproject/abstract-provider';
import invariant from 'tiny-invariant';
import {
  ERC20Token,
  NativeToken,
  Due as DueCore,
  Pair as PairCore,
  Uint112,
  Uint128,
  Uint16,
  Uint256,
  Uint32,
  Uint40,
  CP,
  Uint120,
  LiquidityReturn,
  LendReturn,
  BorrowReturn,
} from '@timeswap-labs/timeswap-v1-sdk-core';
import { Conv, ConvSigner } from './conv';
import pairAbi from '../abi/pair';
import factoryAbi from '../abi/factory';

export class Pair {
  protected conv: Conv;

  readonly chainID: number;
  readonly asset: NativeToken | ERC20Token;
  readonly collateral: NativeToken | ERC20Token;

  protected pair?: Contract;

  constructor(
    providerOrSigner: Provider | Signer,
    chainID: number,
    asset: NativeToken | ERC20Token,
    collateral: NativeToken | ERC20Token,
    convAddress?: string,
    pairAddress?: string
  ) {
    this.conv = new Conv(providerOrSigner, chainID, convAddress);

    invariant(!(asset.isNative && collateral.isNative), 'Invalid Tokens');

    this.chainID = chainID;
    this.asset = asset;
    this.collateral = collateral;

    if (pairAddress) {
      this.pair = new Contract(pairAddress, pairAbi, providerOrSigner);
    }
  }

  address(): string | undefined {
    return this.pair?.address;
  }

  convAddress(): string {
    return this.conv.address();
  }

  connect(providerOrSigner: Provider | Signer): this {
    return this.constructor(
      providerOrSigner,
      this.asset,
      this.collateral,
      this.conv.address(),
      this.pair?.address
    );
  }

  upgrade(signer: Signer): PairSigner {
    return new PairSigner(
      signer,
      this.chainID,
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

  contract(): Contract | undefined {
    return this.pair;
  }

  convContract(): Contract {
    return this.conv.contract();
  }

  async initPair() {
    if (!this.pair) {
      const factory = await this.conv.factory();
      const factoryContract = new Contract(
        factory,
        factoryAbi,
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
      this.pair = new Contract(pair, pairAbi, this.conv.provider());
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

  async getFeeStored(maturity: Uint256): Promise<Uint256> {
    await this.initPair();
    const feeStored = await this.pair!.feeStored(maturity.toBigInt());

    return new Uint256(feeStored);
  }

  async getProtocolFeeStored(): Promise<Uint256> {
    await this.initPair();
    const protocolFeeStored = await this.pair!.protocolFeeStored();

    return new Uint256(protocolFeeStored);
  }

  async getConstantProduct(maturity: Uint256): Promise<CP> {
    await this.initPair();
    const state = await this.pair!.constantProduct(maturity.toBigInt());

    const x = new Uint112(state[0].toString());
    const y = new Uint112(state[1].toString());
    const z = new Uint112(state[2].toString());

    return { x, y, z };
  }

  async getTotalReserves(maturity: Uint256): Promise<Tokens> {
    await this.initPair();
    const tokens = await this.pair!.totalReserves(maturity.toBigInt());

    const asset = new Uint128(tokens[0].toString());
    const collateral = new Uint128(tokens[1].toString());

    return { asset, collateral };
  }

  async getTotalLiquidity(maturity: Uint256): Promise<Uint256> {
    await this.initPair();
    const totalLiquidity = await this.pair!.totalLiquidity(maturity.toBigInt());

    return new Uint256(totalLiquidity.toString());
  }

  async getLiquidityOf(maturity: Uint256, address: string): Promise<Uint256> {
    await this.initPair();
    const liquidityOf = await this.pair!.liquidityOf(
      maturity.toBigInt(),
      address
    );

    return new Uint256(liquidityOf.toString());
  }

  async getTotalClaims(maturity: Uint256): Promise<Claims> {
    await this.initPair();
    const claims = await this.pair!.totalClaims(maturity.toBigInt());

    const bondPrincipal = new Uint112(claims[0].toString());
    const bondInterest = new Uint112(claims[1].toString());
    const insurancePrincipal = new Uint112(claims[2].toString());
    const insuranceInterest = new Uint112(claims[3].toString());

    return {
      bondPrincipal,
      bondInterest,
      insurancePrincipal,
      insuranceInterest,
    };
  }

  async getClaimsOf(maturity: Uint256, address: string): Promise<Claims> {
    await this.initPair();
    const claims = await this.pair!.claimsOf(maturity.toBigInt(), address);

    const bondPrincipal = new Uint112(claims[0].toString());
    const bondInterest = new Uint112(claims[1].toString());
    const insurancePrincipal = new Uint112(claims[2].toString());
    const insuranceInterest = new Uint112(claims[3].toString());

    return {
      bondPrincipal,
      bondInterest,
      insurancePrincipal,
      insuranceInterest,
    };
  }

  async getTotalDebtCreated(maturity: Uint256): Promise<Uint120> {
    await this.initPair();
    const totalDebtCreated = await this.pair!.totalDebtCreated(
      maturity.toBigInt()
    );

    return new Uint120(totalDebtCreated.toString());
  }

  async getTotalDuesOf(maturity: Uint256, address: string): Promise<Uint256> {
    await this.initPair();
    const totalDues = await this.pair!.totalDuesOf(
      maturity.toBigInt(),
      address
    );

    return new Uint256(totalDues.toString());
  }

  async getDueOf(
    maturity: Uint256,
    address: string,
    id: Uint256
  ): Promise<Due> {
    await this.initPair();
    const due = await this.pair!.dueOf(
      maturity.toBigInt(),
      address,
      id.toBigInt()
    );

    const debt = new Uint112(due[0].toString());
    const collateral = new Uint112(due[1].toString());
    const startBlock = new Uint32(due[2]);

    return { debt, collateral, startBlock };
  }

  async getNative(maturity: Uint256): Promise<Native> {
    const asset = this.asset;
    const collateral = this.collateral;

    if (asset instanceof NativeToken) {
      const weth = new ERC20Token(asset.chainID, 18, await this.conv.weth());
      return this.conv.getNative(weth, collateral as ERC20Token, maturity);
    } else if (collateral instanceof NativeToken) {
      const weth = new ERC20Token(
        collateral.chainID,
        18,
        await this.conv.weth()
      );
      return this.conv.getNative(asset, weth, maturity);
    } else {
      return this.conv.getNative(asset, collateral, maturity);
    }
  }

  calculateApr(state: CP): number {
    return PairCore.calculateApr(state);
  }

  calculateCdp(state: CP): bigint {
    return PairCore.calculateCdp(state, this.asset.decimals);
  }

  calculateNewLiquidity(
    assetIn: Uint112,
    debtIn: Uint112,
    collateralIn: Uint112,
    maturity: Uint256,
    now: Uint256
  ): LiquidityReturn {
    return PairCore.calculateNewLiquidity(
      maturity,
      assetIn,
      debtIn,
      collateralIn,
      now
    );
  }

  calculateLiquidityGivenAsset(
    state: CP,
    feeStored: Uint256,
    totalLiquidity: Uint256,
    assetIn: Uint112,
    maturity: Uint256,
    now: Uint256
  ): LiquidityReturn {
    return PairCore.calculateLiquidityGivenAsset(
      state,
      maturity,
      totalLiquidity,
      assetIn,
      now,
      feeStored
    );
  }

  calculateLiquidityGivenDebt(
    state: CP,
    feeStored: Uint256,
    totalLiquidity: Uint256,
    debtIn: Uint112,
    maturity: Uint256,
    now: Uint256
  ): LiquidityReturn {
    return PairCore.calculateLiquidityGivenDebt(
      state,
      maturity,
      totalLiquidity,
      debtIn,
      now,
      feeStored
    );
  }

  calculateLiquidityGivenCollateral(
    state: CP,
    feeStored: Uint256,
    totalLiquidity: Uint256,
    collateralIn: Uint112,
    maturity: Uint256,
    now: Uint256
  ): LiquidityReturn {
    return PairCore.calculateLiquidityGivenCollateral(
      state,
      maturity,
      totalLiquidity,
      collateralIn,
      now,
      feeStored
    );
  }

  calculateLendGivenBond(
    state: CP,
    fee: Uint16,
    protocolFee: Uint16,
    assetIn: Uint112,
    bondOut: Uint128,
    maturity: Uint256,
    now: Uint256
  ): LendReturn {
    return PairCore.calculateLendGivenBond(
      state,
      maturity,
      assetIn,
      bondOut,
      now,
      fee,
      protocolFee
    );
  }

  calculateLendGivenInsurance(
    state: CP,
    fee: Uint16,
    protocolFee: Uint16,
    assetIn: Uint112,
    insuranceOut: Uint128,
    maturity: Uint256,
    now: Uint256
  ): LendReturn {
    return PairCore.calculateLendGivenInsurance(
      state,
      maturity,
      assetIn,
      insuranceOut,
      now,
      fee,
      protocolFee
    );
  }

  calculateLendGivenPercent(
    state: CP,
    fee: Uint16,
    protocolFee: Uint16,
    assetIn: Uint112,
    percent: Uint40,
    maturity: Uint256,
    now: Uint256
  ): LendReturn {
    return PairCore.calculateLendGivenPercent(
      state,
      maturity,
      assetIn,
      percent,
      now,
      fee,
      protocolFee
    );
  }

  calculateBorrowGivenDebt(
    state: CP,
    fee: Uint16,
    protocolFee: Uint16,
    assetOut: Uint112,
    debtIn: Uint112,
    maturity: Uint256,
    now: Uint256
  ): BorrowReturn {
    return PairCore.calculateBorrowGivenDebt(
      state,
      maturity,
      assetOut,
      debtIn,
      now,
      fee,
      protocolFee
    );
  }

  calculateBorrowGivenCollateral(
    state: CP,
    fee: Uint16,
    protocolFee: Uint16,
    assetOut: Uint112,
    collateralIn: Uint112,
    maturity: Uint256,
    now: Uint256
  ): BorrowReturn {
    return PairCore.calculateBorrowGivenCollateral(
      state,
      maturity,
      assetOut,
      collateralIn,
      now,
      fee,
      protocolFee
    );
  }

  calculateBorrowGivenPercent(
    state: CP,
    fee: Uint16,
    protocolFee: Uint16,
    assetOut: Uint112,
    percent: Uint40,
    maturity: Uint256,
    now: Uint256
  ): BorrowReturn {
    return PairCore.calculateBorrowGivenPercent(
      state,
      maturity,
      assetOut,
      percent,
      now,
      fee,
      protocolFee
    );
  }

  calculateWithdraw(
    reserves: Tokens,
    totalClaims: Claims,
    claimsIn: Claims
  ): Tokens {
    return PairCore.calculateWithdraw(reserves, totalClaims, claimsIn);
  }

  calculateRemoveLiquidity(
    reserves: Tokens,
    totalClaims: Claims,
    totalLiquidity: Uint256,
    liquidityIn: Uint256,
    feeStored: Uint256
  ): { assetOut: Uint256; collateralOut: Uint128 } {
    return PairCore.calculateRemoveLiquidity(
      reserves,
      totalClaims,
      totalLiquidity,
      liquidityIn,
      feeStored
    );
  }
}

export class PairSigner extends Pair {
  private convSigner: ConvSigner;

  constructor(
    signer: Signer,
    chainID: number,
    asset: NativeToken | ERC20Token,
    collateral: NativeToken | ERC20Token,
    convAddress?: string,
    pairAddress?: string
  ) {
    super(signer, chainID, asset, collateral, convAddress, pairAddress);
    this.convSigner = this.conv.upgrade(signer);
  }

  async newLiquidity(
    params: NewLiquidity,
    gasLimit?: Uint256
  ): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      return this.convSigner.newLiquidity(
        {
          ...params,
          asset: this.asset,
          collateral: this.collateral,
        },
        { gasLimit }
      );
    } else if (this.collateral instanceof ERC20Token) {
      return this.convSigner.newLiquidityETHAsset(
        {
          ...params,
          collateral: this.collateral,
        },
        { value: params.assetIn, gasLimit }
      );
    } else if (this.asset instanceof ERC20Token) {
      return this.convSigner.newLiquidityETHCollateral(
        {
          ...params,
          asset: this.asset,
        },
        { value: params.collateralIn, gasLimit }
      );
    } else {
      throw 'Unreachable';
    }
  }

  async liquidityGivenAsset(
    params: LiquidityGivenAsset,
    gasLimit?: Uint256
  ): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      return this.convSigner.liquidityGivenAsset(
        {
          ...params,
          asset: this.asset,
          collateral: this.collateral,
        },
        { gasLimit }
      );
    } else if (this.collateral instanceof ERC20Token) {
      return this.convSigner.liquidityGivenAssetETHAsset(
        {
          ...params,
          collateral: this.collateral,
        },
        { value: params.assetIn, gasLimit }
      );
    } else if (this.asset instanceof ERC20Token) {
      return this.convSigner.liquidityGivenAssetETHCollateral(
        {
          ...params,
          asset: this.asset,
        },
        { value: params.maxCollateral, gasLimit }
      );
    } else {
      throw 'Unreachable';
    }
  }

  async liquidityGivenDebt(
    params: LiquidityGivenDebt,
    gasLimit?: Uint256
  ): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      return this.convSigner.liquidityGivenDebt(
        {
          ...params,
          asset: this.asset,
          collateral: this.collateral,
        },
        { gasLimit }
      );
    } else if (this.collateral instanceof ERC20Token) {
      return this.convSigner.liquidityGivenDebtETHAsset(
        {
          ...params,
          collateral: this.collateral,
        },
        { value: params.maxAsset, gasLimit }
      );
    } else if (this.asset instanceof ERC20Token) {
      return this.convSigner.liquidityGivenDebtETHCollateral(
        {
          ...params,
          asset: this.asset,
        },
        { value: params.maxCollateral, gasLimit }
      );
    } else {
      throw 'Unreachable';
    }
  }

  async liquidityGivenCollateral(
    params: LiquidityGivenCollateral,
    gasLimit?: Uint256
  ): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      return this.convSigner.liquidityGivenCollateral(
        {
          ...params,
          asset: this.asset,
          collateral: this.collateral,
        },
        { gasLimit }
      );
    } else if (this.collateral instanceof ERC20Token) {
      return this.convSigner.liquidityGivenCollateralETHAsset(
        {
          ...params,
          collateral: this.collateral,
        },
        { value: params.maxAsset, gasLimit }
      );
    } else if (this.asset instanceof ERC20Token) {
      return this.convSigner.liquidityGivenCollateralETHCollateral(
        {
          ...params,
          asset: this.asset,
        },
        { value: params.collateralIn, gasLimit }
      );
    } else {
      throw 'Unreachable';
    }
  }

  async removeLiquidity(
    params: RemoveLiquidity,
    gasLimit?: Uint256
  ): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      return this.convSigner.removeLiquidity(
        {
          ...params,
          asset: this.asset,
          collateral: this.collateral,
        },
        { gasLimit }
      );
    } else if (this.collateral instanceof ERC20Token) {
      return this.convSigner.removeLiquidityETHAsset(
        {
          ...params,
          collateral: this.collateral,
        },
        { gasLimit }
      );
    } else if (this.asset instanceof ERC20Token) {
      return this.convSigner.removeLiquidityETHCollateral(
        {
          ...params,
          asset: this.asset,
        },
        { gasLimit }
      );
    } else {
      throw 'Unreachable';
    }
  }

  async lendGivenBond(
    params: LendGivenBond,
    gasLimit?: Uint256
  ): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      return this.convSigner.lendGivenBond(
        {
          ...params,
          asset: this.asset,
          collateral: this.collateral,
        },
        { gasLimit }
      );
    } else if (this.collateral instanceof ERC20Token) {
      return this.convSigner.lendGivenBondETHAsset(
        {
          ...params,
          collateral: this.collateral,
        },
        { value: params.assetIn, gasLimit }
      );
    } else if (this.asset instanceof ERC20Token) {
      return this.convSigner.lendGivenBondETHCollateral(
        {
          ...params,
          asset: this.asset,
        },
        { gasLimit }
      );
    } else {
      throw 'Unreachable';
    }
  }

  async lendGivenInsurance(
    params: LendGivenInsurance,
    gasLimit?: Uint256
  ): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      return this.convSigner.lendGivenInsurance(
        {
          ...params,
          asset: this.asset,
          collateral: this.collateral,
        },
        { gasLimit }
      );
    } else if (this.collateral instanceof ERC20Token) {
      return this.convSigner.lendGivenInsuranceETHAsset(
        {
          ...params,
          collateral: this.collateral,
        },
        { value: params.assetIn, gasLimit }
      );
    } else if (this.asset instanceof ERC20Token) {
      return this.convSigner.lendGivenInsuranceETHCollateral(
        {
          ...params,
          asset: this.asset,
        },
        { gasLimit }
      );
    } else {
      throw 'Unreachable';
    }
  }

  async lendGivenPercent(
    params: LendGivenPercent,
    gasLimit?: Uint256
  ): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      return this.convSigner.lendGivenPercent(
        {
          ...params,
          asset: this.asset,
          collateral: this.collateral,
        },
        { gasLimit }
      );
    } else if (this.collateral instanceof ERC20Token) {
      return this.convSigner.lendGivenPercentETHAsset(
        {
          ...params,
          collateral: this.collateral,
        },
        { value: params.assetIn, gasLimit }
      );
    } else if (this.asset instanceof ERC20Token) {
      return this.convSigner.lendGivenPercentETHCollateral(
        {
          ...params,
          asset: this.asset,
        },
        { gasLimit }
      );
    } else {
      throw 'Unreachable';
    }
  }

  async collect(
    params: Collect,
    gasLimit?: Uint256
  ): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      return this.convSigner.collect(
        {
          ...params,
          asset: this.asset,
          collateral: this.collateral,
        },
        { gasLimit }
      );
    } else if (this.collateral instanceof ERC20Token) {
      return this.convSigner.collectETHAsset(
        {
          ...params,
          collateral: this.collateral,
        },
        { gasLimit }
      );
    } else if (this.asset instanceof ERC20Token) {
      return this.convSigner.collectETHCollateral(
        {
          ...params,
          asset: this.asset,
        },
        { gasLimit }
      );
    } else {
      throw 'Unreachable';
    }
  }

  async borrowGivenDebt(
    params: BorrowGivenDebt,
    gasLimit?: Uint256
  ): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      return this.convSigner.borrowGivenDebt(
        {
          ...params,
          asset: this.asset,
          collateral: this.collateral,
        },
        { gasLimit }
      );
    } else if (this.collateral instanceof ERC20Token) {
      return this.convSigner.borrowGivenDebtETHAsset(
        {
          ...params,
          collateral: this.collateral,
        },
        { gasLimit }
      );
    } else if (this.asset instanceof ERC20Token) {
      return this.convSigner.borrowGivenDebtETHCollateral(
        {
          ...params,
          asset: this.asset,
        },
        { value: params.maxCollateral, gasLimit }
      );
    } else {
      throw 'Unreachable';
    }
  }

  async borrowGivenCollateral(
    params: BorrowGivenCollateral,
    gasLimit?: Uint256
  ): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      return this.convSigner.borrowGivenCollateral(
        {
          ...params,
          asset: this.asset,
          collateral: this.collateral,
        },
        { gasLimit }
      );
    } else if (this.collateral instanceof ERC20Token) {
      return this.convSigner.borrowGivenCollateralETHAsset(
        {
          ...params,
          collateral: this.collateral,
        },
        { gasLimit }
      );
    } else if (this.asset instanceof ERC20Token) {
      return this.convSigner.borrowGivenCollateralETHCollateral(
        {
          ...params,
          asset: this.asset,
        },
        { value: params.collateralIn, gasLimit }
      );
    } else {
      throw 'Unreachable';
    }
  }

  async borrowGivenPercent(
    params: BorrowGivenPercent,
    gasLimit?: Uint256
  ): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      return this.convSigner.borrowGivenPercent(
        {
          ...params,
          asset: this.asset,
          collateral: this.collateral,
        },
        { gasLimit }
      );
    } else if (this.collateral instanceof ERC20Token) {
      return this.convSigner.borrowGivenPercentETHAsset(
        {
          ...params,
          collateral: this.collateral,
        },
        { gasLimit }
      );
    } else if (this.asset instanceof ERC20Token) {
      return this.convSigner.borrowGivenPercentETHCollateral(
        {
          ...params,
          asset: this.asset,
        },
        { value: params.maxCollateral, gasLimit }
      );
    } else {
      throw 'Unreachable';
    }
  }

  async repay(params: Repay, gasLimit?: Uint256): Promise<ContractTransaction> {
    if (
      this.asset instanceof ERC20Token &&
      this.collateral instanceof ERC20Token
    ) {
      return this.convSigner.repay(
        {
          ...params,
          asset: this.asset,
          collateral: this.collateral,
        },
        { gasLimit }
      );
    } else if (this.collateral instanceof ERC20Token) {
      return this.convSigner.repayETHAsset(
        {
          ...params,
          collateral: this.collateral,
        },
        {
          value: params.maxAssetsIn.reduce(
            (sum, x) => sum.add(x),
            new Uint112(0)
          ),
          gasLimit,
        }
      );
    } else if (this.asset instanceof ERC20Token) {
      return this.convSigner.repayETHCollateral(
        {
          ...params,
          asset: this.asset,
        },
        { gasLimit }
      );
    } else {
      throw 'Unreachable';
    }
  }
}

interface Tokens {
  asset: Uint128;
  collateral: Uint128;
}

interface Due extends DueCore {
  startBlock: Uint32;
}

interface Native {
  liquidity: string;
  bondInterest: string;
  bondPrincipal: string;
  insuranceInterest: string;
  insurancePrincipal: string;
  collateralizedDebt: string;
}

interface NewLiquidity {
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uint112;
  debtIn: Uint112;
  collateralIn: Uint112;
  deadline: Uint256;
}

interface LiquidityGivenAsset {
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uint112;
  minLiquidity: Uint256;
  maxDebt: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface LiquidityGivenDebt {
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  debtIn: Uint112;
  minLiquidity: Uint256;
  maxAsset: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface LiquidityGivenCollateral {
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  collateralIn: Uint112;
  minLiquidity: Uint256;
  maxAsset: Uint112;
  maxDebt: Uint112;
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
  assetIn: Uint112;
  bondOut: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface LendGivenInsurance {
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  insuranceOut: Uint128;
  minBond: Uint128;
  deadline: Uint256;
}

interface LendGivenPercent {
  maturity: Uint256;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
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
  bondPrincipal: Uint112;
  bondInterest: Uint112;
  insurancePrincipal: Uint112;
  insuranceInterest: Uint112;
}

interface BorrowGivenDebt {
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  debtIn: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface BorrowGivenCollateral {
  maturity: Uint256;
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  collateralIn: Uint112;
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
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface Repay {
  maturity: Uint256;
  collateralTo: string;
  ids: Uint256[];
  maxAssetsIn: Uint112[];
  deadline: Uint256;
}
