import { Signer } from '@ethersproject/abstract-signer';
import { Contract, ContractTransaction } from '@ethersproject/contracts';
import { Provider } from '@ethersproject/abstract-provider';
import {
  ERC20Token,
  NativeToken,
  Due as DueCalculated,
  Uint112,
  Uint128,
  Uint16,
  Uint256,
  Uint32,
  Uint40,
  CP,
  Uint120,
} from '@timeswap-labs/timeswap-v1-sdk-core';
import { Pair, PairSigner } from './pair';

export class Pool {
  protected pair: Pair;

  readonly chainID: number;
  readonly asset: NativeToken | ERC20Token;
  readonly collateral: NativeToken | ERC20Token;
  readonly maturity: Uint256;

  protected cache?: Cache;

  public constructor(
    providerOrSigner: Provider | Signer,
    chainID: number,
    asset: NativeToken | ERC20Token,
    collateral: NativeToken | ERC20Token,
    maturity: Uint256,
    convAddress?: string,
    pairAddress?: string,
    cache?: Cache
  ) {
    this.pair = new Pair(
      providerOrSigner,
      chainID,
      asset,
      collateral,
      convAddress,
      pairAddress
    );

    this.chainID = chainID;
    this.asset = this.pair.asset;
    this.collateral = this.pair.collateral;
    this.maturity = maturity;

    this.cache = cache;
  }

  pairAddress(): string | undefined {
    return this.pair.address();
  }

  convAddress(): string {
    return this.pair.convAddress();
  }

  connect(providerOrSigner: Provider | Signer): this {
    return this.constructor(
      providerOrSigner,
      this.asset,
      this.collateral,
      this.maturity,
      this.convAddress,
      this.pairAddress,
      this.cache
    );
  }

  upgrade(signer: Signer): PoolSigner {
    return new PoolSigner(
      signer,
      this.chainID,
      this.asset,
      this.collateral,
      this.maturity,
      this.pair.convAddress(),
      this.pair.address(),
      this.cache
    );
  }

  provider(): Provider {
    return this.pair.provider();
  }

  signer(): Signer {
    return this.pair.signer();
  }

  pairContract(): Contract | undefined {
    return this.pair.contract();
  }

  convContract(): Contract {
    return this.pair.convContract();
  }

  async initPair() {
    await this.pair.initPair();
  }

  setCache(cache: Cache) {
    this.cache = cache;
  }

  async updateCache(cache?: CacheModifier) {
    this.cache = {
      state:
        cache?.state ?? this.cache?.state ?? (await this.getConstantProduct()),
      reserves:
        cache?.reserves ??
        this.cache?.reserves ??
        (await this.getTotalReserves()),
      totalClaims:
        cache?.totalClaims ??
        this.cache?.totalClaims ??
        (await this.getTotalClaims()),
      totalLiquidity:
        cache?.totalLiquidity ??
        this.cache?.totalLiquidity ??
        (await this.getTotalLiquidity()),
      fee: cache?.fee ?? this.cache?.fee ?? (await this.getFee()),
      protocolFee:
        cache?.protocolFee ??
        this.cache?.protocolFee ??
        (await this.getProtocolFee()),
    };
  }

  async factory(): Promise<string> {
    return this.pair.factory();
  }

  async weth(): Promise<string> {
    return this.pair.weth();
  }

  async getFee(): Promise<Uint16> {
    return this.pair.getFee();
  }

  async getProtocolFee(): Promise<Uint16> {
    return this.pair.getProtocolFee();
  }

  async getConstantProduct(): Promise<CP> {
    return this.pair.getConstantProduct(this.maturity);
  }

  async getTotalReserves(): Promise<Tokens> {
    return this.pair.getTotalReserves(this.maturity);
  }

  async getTotalLiquidity(): Promise<Uint256> {
    return this.pair.getTotalLiquidity(this.maturity);
  }

  async getLiquidityOf(address: string): Promise<Uint256> {
    return this.pair.getLiquidityOf(this.maturity, address);
  }

  async getTotalClaims(): Promise<Claims> {
    return this.pair.getTotalClaims(this.maturity);
  }

  async getTotalDebtCreated(): Promise<Uint120> {
    return this.pair.getTotalDebtCreated(this.maturity);
  }

  async getClaimsOf(address: string): Promise<Claims> {
    return this.pair.getClaimsOf(this.maturity, address);
  }

  async getDuesOf(address: string): Promise<Due[]> {
    return this.pair.getDuesOf(this.maturity, address);
  }

  async getNative(): Promise<Native> {
    return this.pair.getNative(this.maturity);
  }

  async calculateApr(): Promise<number> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateApr(this.cache!.state);
  }

  async calculateCdp(): Promise<bigint> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateCdp(this.cache!.state);
  }

  async calculateNewLiquidity(
    assetIn: Uint112,
    debtIn: Uint112,
    collateralIn: Uint112,
    now: Uint256
  ): Promise<LiquidityReturn1> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateNewLiquidity(
      this.cache!.state,
      this.cache!.protocolFee,
      this.cache!.totalLiquidity,
      assetIn,
      debtIn,
      collateralIn,
      this.maturity,
      now
    );
  }

  async calculateLiquidityGivenAsset(
    assetIn: Uint112,
    now: Uint256
  ): Promise<LiquidityReturn1> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateLiquidityGivenAsset(
      this.cache!.state,
      this.cache!.protocolFee,
      this.cache!.totalLiquidity,
      assetIn,
      this.maturity,
      now
    );
  }

  async calculateLiquidityGivenDebt(
    debtIn: Uint112,
    now: Uint256
  ): Promise<LiquidityReturn2> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateLiquidityGivenDebt(
      this.cache!.state,
      this.cache!.protocolFee,
      this.cache!.totalLiquidity,
      debtIn,
      this.maturity,
      now
    );
  }

  async calculateLiquidityGivenCollateral(
    collateralIn: Uint112,
    now: Uint256
  ): Promise<LiquidityReturn2> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateLiquidityGivenCollateral(
      this.cache!.state,
      this.cache!.protocolFee,
      this.cache!.totalLiquidity,
      collateralIn,
      this.maturity,
      now
    );
  }

  async calculateLendGivenBond(
    assetIn: Uint112,
    bondOut: Uint128,
    now: Uint256
  ): Promise<LendReturn> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateLendGivenBond(
      this.cache!.state,
      this.cache!.fee,
      assetIn,
      bondOut,
      this.maturity,
      now
    );
  }

  async calculateLendGivenInsurance(
    assetIn: Uint112,
    insuranceOut: Uint128,
    now: Uint256
  ): Promise<LendReturn> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateLendGivenInsurance(
      this.cache!.state,
      this.cache!.fee,
      assetIn,
      insuranceOut,
      this.maturity,
      now
    );
  }

  async calculateLendGivenPercent(
    assetIn: Uint112,
    percent: Uint40,
    now: Uint256
  ): Promise<LendReturn> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateLendGivenPercent(
      this.cache!.state,
      this.cache!.fee,
      assetIn,
      percent,
      this.maturity,
      now
    );
  }

  async calculateBorrowGivenDebt(
    assetOut: Uint112,
    debtIn: Uint112,
    now: Uint256
  ): Promise<BorrowReturn> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateBorrowGivenDebt(
      this.cache!.state,
      this.cache!.fee,
      assetOut,
      debtIn,
      this.maturity,
      now
    );
  }

  async calculateBorrowGivenCollateral(
    assetOut: Uint112,
    collateralIn: Uint112,
    now: Uint256
  ): Promise<BorrowReturn> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateBorrowGivenCollateral(
      this.cache!.state,
      this.cache!.fee,
      assetOut,
      collateralIn,
      this.maturity,
      now
    );
  }

  async calculateBorrowGivenPercent(
    assetOut: Uint112,
    percent: Uint40,
    now: Uint256
  ): Promise<BorrowReturn> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateBorrowGivenPercent(
      this.cache!.state,
      this.cache!.fee,
      assetOut,
      percent,
      this.maturity,
      now
    );
  }

  async calculateWithdraw(claimsIn: Claims): Promise<Tokens> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateWithdraw(
      this.cache!.reserves,
      this.cache!.totalClaims,
      claimsIn
    );
  }

  async calculateBurn(liquidityIn: Uint256): Promise<Tokens> {
    if (!this.cache) await this.updateCache();

    return this.pair.calculateBurn(
      this.cache!.reserves,
      this.cache!.totalClaims,
      this.cache!.totalLiquidity,
      liquidityIn
    );
  }
}

export class PoolSigner extends Pool {
  private pairSigner: PairSigner;

  public constructor(
    signer: Signer,
    chainID: number,
    asset: NativeToken | ERC20Token,
    collateral: NativeToken | ERC20Token,
    maturity: Uint256,
    convAddress?: string,
    pairAddress?: string,
    cache?: Cache
  ) {
    super(
      signer,
      chainID,
      asset,
      collateral,
      maturity,
      convAddress,
      pairAddress,
      cache
    );
    this.pairSigner = this.pair.upgrade(signer);
  }

  async newLiquidity(params: NewLiquidity): Promise<ContractTransaction> {
    return this.pairSigner.newLiquidity({
      ...params,
      maturity: this.maturity,
    });
  }

  async liquidityGivenAsset(
    params: LiquidityGivenAsset
  ): Promise<ContractTransaction> {
    return this.pairSigner.liquidityGivenAsset({
      ...params,
      maturity: this.maturity,
    });
  }

  async liquidityGivenDebt(
    params: LiquidityGivenDebt
  ): Promise<ContractTransaction> {
    return this.pairSigner.liquidityGivenDebt({
      ...params,
      maturity: this.maturity,
    });
  }

  async liquidityGivenCollateral(
    params: LiquidityGivenCollateral
  ): Promise<ContractTransaction> {
    return this.pairSigner.liquidityGivenCollateral({
      ...params,
      maturity: this.maturity,
    });
  }

  async removeLiquidity(params: RemoveLiquidity): Promise<ContractTransaction> {
    return this.pairSigner.removeLiquidity({
      ...params,
      maturity: this.maturity,
    });
  }

  async lendGivenBond(params: LendGivenBond): Promise<ContractTransaction> {
    return this.pairSigner.lendGivenBond({
      ...params,
      maturity: this.maturity,
    });
  }

  async lendGivenInsurance(
    params: LendGivenInsurance
  ): Promise<ContractTransaction> {
    return this.pairSigner.lendGivenInsurance({
      ...params,
      maturity: this.maturity,
    });
  }

  async lendGivenPercent(
    params: LendGivenPercent
  ): Promise<ContractTransaction> {
    return this.pairSigner.lendGivenPercent({
      ...params,
      maturity: this.maturity,
    });
  }

  async collect(params: Collect): Promise<ContractTransaction> {
    return this.pairSigner.collect({
      ...params,
      maturity: this.maturity,
    });
  }

  async borrowGivenDebt(params: BorrowGivenDebt): Promise<ContractTransaction> {
    return this.pairSigner.borrowGivenDebt({
      ...params,
      maturity: this.maturity,
    });
  }

  async borrowGivenCollateral(
    params: BorrowGivenCollateral
  ): Promise<ContractTransaction> {
    return this.pairSigner.borrowGivenCollateral({
      ...params,
      maturity: this.maturity,
    });
  }

  async borrowGivenPercent(
    params: BorrowGivenPercent
  ): Promise<ContractTransaction> {
    return this.pairSigner.borrowGivenPercent({
      ...params,
      maturity: this.maturity,
    });
  }

  async repay(params: Repay): Promise<ContractTransaction> {
    return this.pairSigner.repay({
      ...params,
      maturity: this.maturity,
    });
  }
}

interface LiquidityReturn1 {
  liquidityOut: Uint256;
  dueOut: DueCalculated;
  yIncrease: Uint112;
  zIncrease: Uint112;
}

interface LiquidityReturn2 extends LiquidityReturn1 {
  xIncrease: Uint112;
}

interface LendReturn {
  claims: Claims;
  yDecrease: Uint112;
  zDecrease: Uint112;
}

interface BorrowReturn {
  due: DueCalculated;
  yIncrease: Uint112;
  zIncrease: Uint112;
}

interface Cache {
  state: CP;
  reserves: Tokens;
  totalClaims: Claims;
  totalLiquidity: Uint256;
  fee: Uint16;
  protocolFee: Uint16;
}

interface CacheModifier {
  state?: CP;
  reserves?: Tokens;
  totalClaims?: Claims;
  totalLiquidity?: Uint256;
  fee?: Uint16;
  protocolFee?: Uint16;
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
  liquidityTo: string;
  dueTo: string;
  assetIn: Uint112;
  debtIn: Uint112;
  collateralIn: Uint112;
  deadline: Uint256;
}

interface LiquidityGivenAsset {
  liquidityTo: string;
  dueTo: string;
  assetIn: Uint112;
  minLiquidity: Uint256;
  maxDebt: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface LiquidityGivenDebt {
  liquidityTo: string;
  dueTo: string;
  debtIn: Uint112;
  minLiquidity: Uint256;
  maxAsset: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface LiquidityGivenCollateral {
  liquidityTo: string;
  dueTo: string;
  collateralIn: Uint112;
  minLiquidity: Uint256;
  maxAsset: Uint112;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface RemoveLiquidity {
  assetTo: string;
  collateralTo: string;
  liquidityIn: Uint256;
}

interface LendGivenBond {
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  bondOut: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface LendGivenInsurance {
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  insuranceOut: Uint128;
  minBond: Uint128;
  deadline: Uint256;
}

interface LendGivenPercent {
  bondTo: string;
  insuranceTo: string;
  assetIn: Uint112;
  percent: Uint40;
  minBond: Uint128;
  minInsurance: Uint128;
  deadline: Uint256;
}

interface Collect {
  assetTo: string;
  collateralTo: string;
  claimsIn: Claims;
}

interface Claims {
  bond: Uint128;
  insurance: Uint128;
}

interface BorrowGivenDebt {
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  debtIn: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface BorrowGivenCollateral {
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  collateralIn: Uint112;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface BorrowGivenPercent {
  assetTo: string;
  dueTo: string;
  assetOut: Uint112;
  percent: Uint40;
  maxDebt: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface Repay {
  collateralTo: string;
  ids: Uint256[];
  maxAssetsIn: Uint112[];
  deadline: Uint256;
}
