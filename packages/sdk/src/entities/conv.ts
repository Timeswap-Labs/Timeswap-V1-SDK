import {
  ERC20Token,
  Uint112,
  Uint128,
  Uint256,
  Uint40,
  Uintable,
} from '@timeswap-labs/timeswap-v1-sdk-core';

import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { Contract, ContractTransaction } from '@ethersproject/contracts';
import { CONVENIENCE } from '../constants';
import convenienceAbi from '../abi/convenience';

export class Conv {
  protected convContract: Contract;

  readonly chainID: number;

  constructor(
    providerOrSigner: Provider | Signer,
    chainID: number,
    address?: string
  ) {
    this.chainID = chainID;
    if (address) {
      this.convContract = new Contract(
        address,
        convenienceAbi,
        providerOrSigner
      );
    } else {
      this.convContract = new Contract(
        CONVENIENCE[this.chainID],
        convenienceAbi,
        providerOrSigner
      );
    }
  }

  address(): string {
    return this.convContract.address;
  }

  connect(providerOrSigner: Provider | Signer): this {
    return this.constructor(providerOrSigner, this.convContract.address);
  }

  upgrade(signer: Signer): ConvSigner {
    return new ConvSigner(signer, this.chainID, this.convContract.address);
  }

  provider(): Provider {
    return this.convContract.provider;
  }

  signer(): Signer {
    return this.convContract.signer;
  }

  contract(): Contract {
    return this.convContract;
  }

  async factory(): Promise<string> {
    return this.convContract.factory();
  }

  async weth(): Promise<string> {
    return this.convContract.weth();
  }

  async getNative(
    asset: ERC20Token,
    collateral: ERC20Token,
    maturity: Uint256
  ): Promise<Native> {
    const native = await this.convContract.getNative(
      asset.address,
      collateral.address,
      maturity.toBigInt()
    );

    return {
      liquidity: native[0],
      bondInterest: native[1],
      bondPrincipal: native[2],
      insuranceInterest: native[3],
      insurancePrincipal: native[4],
      collateralizedDebt: native[5],
    };
  }
}

export class ConvSigner extends Conv {
  async newLiquidity(
    params: NewLiquidity,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetIn = new Uint112(params.assetIn).toBigInt();
    const debtIn = new Uint112(params.debtIn).toBigInt();
    const collateralIn = new Uint112(params.collateralIn).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'newLiquidity',
      [
        params.asset.address,
        params.collateral.address,
        maturity,
        params.liquidityTo,
        params.dueTo,
        assetIn,
        debtIn,
        collateralIn,
        deadline,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async newLiquidityETHAsset(
    params: NewLiquidityETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const debtIn = new Uint112(params.debtIn).toBigInt();
    const collateralIn = new Uint112(params.collateralIn).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'newLiquidityETHAsset',
      [
        params.collateral.address,
        maturity,
        params.liquidityTo,
        params.dueTo,
        debtIn,
        collateralIn,
        deadline,
      ],
      {
        value: txnParams.value.toBigInt(),
        gasLimit: txnParams.gasLimit?.toBigInt(),
      }
    );
  }

  async newLiquidityETHCollateral(
    params: NewLiquidityETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetIn = new Uint112(params.assetIn).toBigInt();
    const debtIn = new Uint112(params.debtIn).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'newLiquidityETHCollateral',
      [
        params.asset.address,
        maturity,
        params.liquidityTo,
        params.dueTo,
        assetIn,
        debtIn,
        deadline,
      ],
      {
        value: txnParams.value.toBigInt(),
        gasLimit: txnParams.gasLimit?.toBigInt(),
      }
    );
  }

  async liquidityGivenAsset(
    params: LiquidityGivenAsset,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetIn = new Uint112(params.assetIn).toBigInt();
    const minLiquidity = new Uint256(params.minLiquidity).toBigInt();
    const maxDebt = new Uint112(params.maxDebt).toBigInt();
    const maxCollateral = new Uint112(params.maxCollateral).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'liquidityGivenAsset',
      [
        params.asset.address,
        params.collateral.address,
        maturity,
        params.liquidityTo,
        params.dueTo,
        assetIn,
        minLiquidity,
        maxDebt,
        maxCollateral,
        deadline,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async liquidityGivenAssetETHAsset(
    params: LiquidityGivenAssetETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const minLiquidity = new Uint256(params.minLiquidity).toBigInt();
    const maxDebt = new Uint112(params.maxDebt).toBigInt();
    const maxCollateral = new Uint112(params.maxCollateral).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'liquidityGivenAssetETHAsset',
      [
        params.collateral.address,
        maturity,
        params.liquidityTo,
        params.dueTo,
        minLiquidity,
        maxDebt,
        maxCollateral,
        deadline,
      ],
      {
        value: txnParams.value.toBigInt(),
        gasLimit: txnParams.gasLimit?.toBigInt(),
      }
    );
  }

  async liquidityGivenAssetETHCollateral(
    params: LiquidityGivenAssetETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetIn = new Uint112(params.assetIn).toBigInt();
    const minLiquidity = new Uint256(params.minLiquidity).toBigInt();
    const maxDebt = new Uint112(params.maxDebt).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'liquidityGivenAssetETHCollateral',
      [
        params.asset.address,
        maturity,
        params.liquidityTo,
        params.dueTo,
        assetIn,
        minLiquidity,
        maxDebt,
        deadline,
      ],
      {
        value: txnParams.value.toBigInt(),
        gasLimit: txnParams.gasLimit?.toBigInt(),
      }
    );
  }

  async liquidityGivenDebt(
    params: LiquidityGivenDebt,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const debtIn = new Uint112(params.debtIn).toBigInt();
    const minLiquidity = new Uint256(params.minLiquidity).toBigInt();
    const maxAsset = new Uint112(params.maxAsset).toBigInt();
    const maxCollateral = new Uint112(params.maxCollateral).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'liquidityGivenDebt',
      [
        params.asset.address,
        params.collateral.address,
        maturity,
        params.liquidityTo,
        params.dueTo,
        debtIn,
        minLiquidity,
        maxAsset,
        maxCollateral,
        deadline,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async liquidityGivenDebtETHAsset(
    params: LiquidityGivenDebtETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const debtIn = new Uint112(params.debtIn).toBigInt();
    const minLiquidity = new Uint256(params.minLiquidity).toBigInt();
    const maxCollateral = new Uint112(params.maxCollateral).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'liquidityGivenDebtETHAsset',
      [
        params.collateral.address,
        maturity,
        params.liquidityTo,
        params.dueTo,
        debtIn,
        minLiquidity,
        maxCollateral,
        deadline,
      ],
      {
        value: txnParams.value.toBigInt(),
        gasLimit: txnParams.gasLimit?.toBigInt(),
      }
    );
  }

  async liquidityGivenDebtETHCollateral(
    params: LiquidityGivenDebtETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const debtIn = new Uint112(params.debtIn).toBigInt();
    const minLiquidity = new Uint256(params.minLiquidity).toBigInt();
    const maxAsset = new Uint112(params.maxAsset).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'liquidityGivenDebtETHCollateral',
      [
        params.asset.address,
        maturity,
        params.liquidityTo,
        params.dueTo,
        debtIn,
        minLiquidity,
        maxAsset,
        deadline,
      ],
      {
        value: txnParams.value.toBigInt(),
        gasLimit: txnParams.gasLimit?.toBigInt(),
      }
    );
  }

  async liquidityGivenCollateral(
    params: LiquidityGivenCollateral,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const collateralIn = new Uint112(params.collateralIn).toBigInt();
    const minLiquidity = new Uint256(params.minLiquidity).toBigInt();
    const maxAsset = new Uint112(params.maxAsset).toBigInt();
    const maxDebt = new Uint112(params.maxDebt).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'liquidityGivenCollateral',
      [
        params.asset.address,
        params.collateral.address,
        maturity,
        params.liquidityTo,
        params.dueTo,
        collateralIn,
        minLiquidity,
        maxAsset,
        maxDebt,
        deadline,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async liquidityGivenCollateralETHAsset(
    params: LiquidityGivenCollateralETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const collateralIn = new Uint112(params.collateralIn).toBigInt();
    const minLiquidity = new Uint256(params.minLiquidity).toBigInt();
    const maxDebt = new Uint112(params.maxDebt).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'liquidityGivenCollateralETHAsset',
      [
        params.collateral.address,
        maturity,
        params.liquidityTo,
        params.dueTo,
        collateralIn,
        minLiquidity,
        maxDebt,
        deadline,
      ],
      {
        value: txnParams.value.toBigInt(),
        gasLimit: txnParams.gasLimit?.toBigInt(),
      }
    );
  }

  async liquidityGivenCollateralETHCollateral(
    params: LiquidityGivenCollateralETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const minLiquidity = new Uint256(params.minLiquidity).toBigInt();
    const maxAsset = new Uint112(params.maxAsset).toBigInt();
    const maxDebt = new Uint112(params.maxDebt).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'liquidityGivenCollateralETHCollateral',
      [
        params.asset.address,
        maturity,
        params.liquidityTo,
        params.dueTo,
        minLiquidity,
        maxAsset,
        maxDebt,
        deadline,
      ],
      {
        value: txnParams.value.toBigInt(),
        gasLimit: txnParams.gasLimit?.toBigInt(),
      }
    );
  }

  async removeLiquidity(
    params: RemoveLiquidity,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const liquidityIn = new Uint256(params.liquidityIn).toBigInt();

    return contractInteraction(
      this.convContract,
      'removeLiquidity',
      [
        params.asset.address,
        params.collateral.address,
        maturity,
        params.assetTo,
        params.collateralTo,
        liquidityIn,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async removeLiquidityETHAsset(
    params: RemoveLiquidityETHAsset,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const liquidityIn = new Uint256(params.liquidityIn).toBigInt();

    return contractInteraction(
      this.convContract,
      'removeLiquidityETHAsset',
      [
        params.collateral.address,
        maturity,
        params.assetTo,
        params.collateralTo,
        liquidityIn,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async removeLiquidityETHCollateral(
    params: RemoveLiquidityETHCollateral,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const liquidityIn = new Uint256(params.liquidityIn).toBigInt();

    return contractInteraction(
      this.convContract,
      'removeLiquidityETHCollateral',
      [
        params.asset.address,
        maturity,
        params.assetTo,
        params.collateralTo,
        liquidityIn,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async lendGivenBond(
    params: LendGivenBond,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetIn = new Uint112(params.assetIn).toBigInt();
    const bondOut = new Uint128(params.bondOut).toBigInt();
    const minInsurance = new Uint128(params.minInsurance).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'lendGivenBond',
      [
        params.asset.address,
        params.collateral.address,
        maturity,
        params.bondTo,
        params.insuranceTo,
        assetIn,
        bondOut,
        minInsurance,
        deadline,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async lendGivenBondETHAsset(
    params: LendGivenBondETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const bondOut = new Uint128(params.bondOut).toBigInt();
    const minInsurance = new Uint128(params.minInsurance).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'lendGivenBondETHAsset',
      [
        params.collateral.address,
        maturity,
        params.bondTo,
        params.insuranceTo,
        bondOut,
        minInsurance,
        deadline,
      ],
      {
        value: txnParams.value.toBigInt(),
        gasLimit: txnParams.gasLimit?.toBigInt(),
      }
    );
  }

  async lendGivenBondETHCollateral(
    params: LendGivenBondETHCollateral,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetIn = new Uint112(params.assetIn).toBigInt();
    const bondOut = new Uint128(params.bondOut).toBigInt();
    const minInsurance = new Uint128(params.minInsurance).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'lendGivenBondETHCollateral',
      [
        params.asset.address,
        maturity,
        params.bondTo,
        params.insuranceTo,
        assetIn,
        bondOut,
        minInsurance,
        deadline,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async lendGivenInsurance(
    params: LendGivenInsurance,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetIn = new Uint112(params.assetIn).toBigInt();
    const insuranceOut = new Uint128(params.insuranceOut).toBigInt();
    const minBond = new Uint128(params.minBond).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'lendGivenInsurance',
      [
        params.asset.address,
        params.collateral.address,
        maturity,
        params.bondTo,
        params.insuranceTo,
        assetIn,
        insuranceOut,
        minBond,
        deadline,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async lendGivenInsuranceETHAsset(
    params: LendGivenInsuranceETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const insuranceOut = new Uint128(params.insuranceOut).toBigInt();
    const minBond = new Uint128(params.minBond).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'lendGivenInsuranceETHAsset',
      [
        params.collateral.address,
        maturity,
        params.bondTo,
        params.insuranceTo,
        insuranceOut,
        minBond,
        deadline,
      ],
      {
        value: txnParams.value.toBigInt(),
        gasLimit: txnParams.gasLimit?.toBigInt(),
      }
    );
  }

  async lendGivenInsuranceETHCollateral(
    params: LendGivenInsuranceETHCollateral,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetIn = new Uint112(params.assetIn).toBigInt();
    const insuranceOut = new Uint128(params.insuranceOut).toBigInt();
    const minBond = new Uint128(params.minBond).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'lendGivenInsuranceETHCollateral',
      [
        params.asset.address,
        maturity,
        params.bondTo,
        params.insuranceTo,
        assetIn,
        insuranceOut,
        minBond,
        deadline,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async lendGivenPercent(
    params: LendGivenPercent,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetIn = new Uint112(params.assetIn).toBigInt();
    const percent = new Uint40(params.percent).toBigInt();
    const minBond = new Uint128(params.minBond).toBigInt();
    const minInsurance = new Uint128(params.minInsurance).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'lendGivenPercent',
      [
        params.asset.address,
        params.collateral.address,
        maturity,
        params.bondTo,
        params.insuranceTo,
        assetIn,
        percent,
        minBond,
        minInsurance,
        deadline,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async lendGivenPercentETHAsset(
    params: LendGivenPercentETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const percent = new Uint40(params.percent).toBigInt();
    const minBond = new Uint128(params.minBond).toBigInt();
    const minInsurance = new Uint128(params.minInsurance).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'lendGivenPercentETHAsset',
      [
        params.collateral.address,
        maturity,
        params.bondTo,
        params.insuranceTo,
        percent,
        minBond,
        minInsurance,
        deadline,
      ],
      {
        value: txnParams.value.toBigInt(),
        gasLimit: txnParams.gasLimit?.toBigInt(),
      }
    );
  }

  async lendGivenPercentETHCollateral(
    params: LendGivenPercentETHCollateral,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetIn = new Uint112(params.assetIn).toBigInt();
    const percent = new Uint40(params.percent).toBigInt();
    const minBond = new Uint128(params.minBond).toBigInt();
    const minInsurance = new Uint128(params.minInsurance).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'lendGivenPercentETHCollateral',
      [
        params.asset.address,
        maturity,
        params.bondTo,
        params.insuranceTo,
        assetIn,
        percent,
        minBond,
        minInsurance,
        deadline,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async collect(
    params: Collect,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const bondPrincipal = new Uint112(params.claimsIn.bondPrincipal).toBigInt();
    const bondInterest = new Uint112(params.claimsIn.bondInterest).toBigInt();
    const insurancePrincipal = new Uint112(
      params.claimsIn.insurancePrincipal
    ).toBigInt();
    const insuranceInterest = new Uint112(
      params.claimsIn.insuranceInterest
    ).toBigInt();

    return contractInteraction(
      this.convContract,
      'collect',
      [
        params.asset.address,
        params.collateral.address,
        maturity,
        params.assetTo,
        params.collateralTo,
        [bondPrincipal, bondInterest, insurancePrincipal, insuranceInterest],
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async collectETHAsset(
    params: CollectETHAsset,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const bondPrincipal = new Uint112(params.claimsIn.bondPrincipal).toBigInt();
    const bondInterest = new Uint112(params.claimsIn.bondInterest).toBigInt();
    const insurancePrincipal = new Uint112(
      params.claimsIn.insurancePrincipal
    ).toBigInt();
    const insuranceInterest = new Uint112(
      params.claimsIn.insuranceInterest
    ).toBigInt();

    return contractInteraction(
      this.convContract,
      'collectETHAsset',
      [
        params.collateral.address,
        maturity,
        params.assetTo,
        params.collateralTo,
        [bondPrincipal, bondInterest, insurancePrincipal, insuranceInterest],
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async collectETHCollateral(
    params: CollectETHCollateral,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const bondPrincipal = new Uint112(params.claimsIn.bondPrincipal).toBigInt();
    const bondInterest = new Uint112(params.claimsIn.bondInterest).toBigInt();
    const insurancePrincipal = new Uint112(
      params.claimsIn.insurancePrincipal
    ).toBigInt();
    const insuranceInterest = new Uint112(
      params.claimsIn.insuranceInterest
    ).toBigInt();

    return contractInteraction(
      this.convContract,
      'collectETHCollateral',
      [
        params.asset.address,
        maturity,
        params.assetTo,
        params.collateralTo,
        [bondPrincipal, bondInterest, insurancePrincipal, insuranceInterest],
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async borrowGivenDebt(
    params: BorrowGivenDebt,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetOut = new Uint112(params.assetOut).toBigInt();
    const debtIn = new Uint112(params.debtIn).toBigInt();
    const maxCollateral = new Uint112(params.maxCollateral).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'borrowGivenDebt',
      [
        params.asset.address,
        params.collateral.address,
        maturity,
        params.assetTo,
        params.dueTo,
        assetOut,
        debtIn,
        maxCollateral,
        deadline,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async borrowGivenDebtETHAsset(
    params: BorrowGivenDebtETHAsset,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetOut = new Uint112(params.assetOut).toBigInt();
    const debtIn = new Uint112(params.debtIn).toBigInt();
    const maxCollateral = new Uint112(params.maxCollateral).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'borrowGivenDebtETHAsset',
      [
        params.collateral.address,
        maturity,
        params.assetTo,
        params.dueTo,
        assetOut,
        debtIn,
        maxCollateral,
        deadline,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async borrowGivenDebtETHCollateral(
    params: BorrowGivenDebtETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetOut = new Uint112(params.assetOut).toBigInt();
    const debtIn = new Uint112(params.debtIn).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'borrowGivenDebtETHCollateral',
      [
        params.asset.address,
        maturity,
        params.assetTo,
        params.dueTo,
        assetOut,
        debtIn,
        deadline,
      ],
      {
        value: txnParams.value.toBigInt(),
        gasLimit: txnParams.gasLimit?.toBigInt(),
      }
    );
  }

  async borrowGivenCollateral(
    params: BorrowGivenCollateral,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetOut = new Uint112(params.assetOut).toBigInt();
    const collateralIn = new Uint112(params.collateralIn).toBigInt();
    const maxDebt = new Uint112(params.maxDebt).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'borrowGivenCollateral',
      [
        params.asset.address,
        params.collateral.address,
        maturity,
        params.assetTo,
        params.dueTo,
        assetOut,
        collateralIn,
        maxDebt,
        deadline,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async borrowGivenCollateralETHAsset(
    params: BorrowGivenCollateralETHAsset,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetOut = new Uint112(params.assetOut).toBigInt();
    const collateralIn = new Uint112(params.collateralIn).toBigInt();
    const maxDebt = new Uint112(params.maxDebt).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'borrowGivenCollateralETHAsset',
      [
        params.collateral.address,
        maturity,
        params.assetTo,
        params.dueTo,
        assetOut,
        collateralIn,
        maxDebt,
        deadline,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async borrowGivenCollateralETHCollateral(
    params: BorrowGivenCollateralETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetOut = new Uint112(params.assetOut).toBigInt();
    const maxDebt = new Uint112(params.maxDebt).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'borrowGivenCollateralETHCollateral',
      [
        params.asset.address,
        maturity,
        params.assetTo,
        params.dueTo,
        assetOut,
        maxDebt,
        deadline,
      ],
      {
        value: txnParams.value.toBigInt(),
        gasLimit: txnParams.gasLimit?.toBigInt(),
      }
    );
  }

  async borrowGivenPercent(
    params: BorrowGivenPercent,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetOut = new Uint112(params.assetOut).toBigInt();
    const percent = new Uint40(params.percent).toBigInt();
    const maxDebt = new Uint112(params.maxDebt).toBigInt();
    const maxCollateral = new Uint112(params.maxCollateral).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'borrowGivenPercent',
      [
        params.asset.address,
        params.collateral.address,
        maturity,
        params.assetTo,
        params.dueTo,
        assetOut,
        percent,
        maxDebt,
        maxCollateral,
        deadline,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async borrowGivenPercentETHAsset(
    params: BorrowGivenPercentETHAsset,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetOut = new Uint112(params.assetOut).toBigInt();
    const percent = new Uint40(params.percent).toBigInt();
    const maxDebt = new Uint112(params.maxDebt).toBigInt();
    const maxCollateral = new Uint112(params.maxCollateral).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'borrowGivenPercentETHAsset',
      [
        params.collateral.address,
        maturity,
        params.assetTo,
        params.dueTo,
        assetOut,
        percent,
        maxDebt,
        maxCollateral,
        deadline,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async borrowGivenPercentETHCollateral(
    params: BorrowGivenPercentETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const assetOut = new Uint112(params.assetOut).toBigInt();
    const percent = new Uint40(params.percent).toBigInt();
    const maxDebt = new Uint112(params.maxDebt).toBigInt();
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'borrowGivenPercentETHCollateral',
      [
        params.asset.address,
        maturity,
        params.assetTo,
        params.dueTo,
        assetOut,
        percent,
        maxDebt,
        deadline,
      ],
      {
        value: txnParams.value.toBigInt(),
        gasLimit: txnParams.gasLimit?.toBigInt(),
      }
    );
  }

  async repay(
    params: Repay,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const ids = params.ids.map(value => new Uint256(value).toBigInt());
    const maxAssetsIn = params.maxAssetsIn.map(value =>
      new Uint112(value).toBigInt()
    );
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'repay',
      [
        params.asset.address,
        params.collateral.address,
        maturity,
        params.collateralTo,
        ids,
        maxAssetsIn,
        deadline,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async repayETHAsset(
    params: RepayETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const ids = params.ids.map(value => new Uint256(value).toBigInt());
    const maxAssetsIn = params.maxAssetsIn.map(value =>
      new Uint112(value).toBigInt()
    );
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'repayETHAsset',
      [
        params.collateral.address,
        maturity,
        params.collateralTo,
        ids,
        maxAssetsIn,
        deadline,
      ],
      {
        value: txnParams.value.toBigInt(),
        gasLimit: txnParams.gasLimit?.toBigInt(),
      }
    );
  }

  async repayETHCollateral(
    params: RepayETHCollateral,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    const maturity = new Uint256(params.maturity).toBigInt();
    const ids = params.ids.map(value => new Uint256(value).toBigInt());
    const maxAssetsIn = params.maxAssetsIn.map(value =>
      new Uint112(value).toBigInt()
    );
    const deadline = new Uint256(params.deadline).toBigInt();

    return contractInteraction(
      this.convContract,
      'repayETHCollateral',
      [
        params.asset.address,
        maturity,
        params.collateralTo,
        ids,
        maxAssetsIn,
        deadline,
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }
}

async function contractInteraction(
  contract: Contract,
  functionName: string,
  arg: any,
  options: TransactionParamsBigInt
): Promise<ContractTransaction> {
  const gasUnits = (
    await contract.estimateGas[functionName](arg, options)
  ).toBigInt();
  const maxGasUnits =
    options.gasLimit && options.gasLimit >= gasUnits
      ? options.gasLimit
      : gasUnits;

  const gasLimit = (maxGasUnits * 120n) / 100n;

  return contract[functionName](arg, { ...options, gasLimit });
}

// Interface

interface TransactionParamsBigInt {
  value?: bigint;
  gasLimit?: bigint;
}

interface TransactionParams extends GasLimitTransactionParams {
  value: Uint112;
}

interface GasLimitTransactionParams {
  gasLimit?: Uint256;
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
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uintable;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uintable;
  debtIn: Uintable;
  collateralIn: Uintable;
  deadline: Uintable;
}

interface NewLiquidityETHAsset {
  collateral: ERC20Token;
  maturity: Uintable;
  liquidityTo: string;
  dueTo: string;
  debtIn: Uintable;
  collateralIn: Uintable;
  deadline: Uintable;
}

interface NewLiquidityETHCollateral {
  asset: ERC20Token;
  maturity: Uintable;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uintable;
  debtIn: Uintable;
  deadline: Uintable;
}

interface LiquidityGivenAsset {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uintable;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uintable;
  minLiquidity: Uintable;
  maxDebt: Uintable;
  maxCollateral: Uintable;
  deadline: Uintable;
}

interface LiquidityGivenAssetETHAsset {
  collateral: ERC20Token;
  maturity: Uintable;
  liquidityTo: string;
  dueTo: string;
  minLiquidity: Uintable;
  maxDebt: Uintable;
  maxCollateral: Uintable;
  deadline: Uintable;
}

interface LiquidityGivenAssetETHCollateral {
  asset: ERC20Token;
  maturity: Uintable;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uintable;
  minLiquidity: Uintable;
  maxDebt: Uintable;
  deadline: Uintable;
}

interface LiquidityGivenDebt {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uintable;
  liquidityTo: string;
  dueTo: string;
  debtIn: Uintable;
  minLiquidity: Uintable;
  maxAsset: Uintable;
  maxCollateral: Uintable;
  deadline: Uintable;
}

interface LiquidityGivenDebtETHAsset {
  collateral: ERC20Token;
  maturity: Uintable;
  liquidityTo: string;
  dueTo: string;
  debtIn: Uintable;
  minLiquidity: Uintable;
  maxCollateral: Uintable;
  deadline: Uintable;
}

interface LiquidityGivenDebtETHCollateral {
  asset: ERC20Token;
  maturity: Uintable;
  liquidityTo: string;
  dueTo: string;
  debtIn: Uintable;
  minLiquidity: Uintable;
  maxAsset: Uintable;
  deadline: Uintable;
}

interface LiquidityGivenCollateral {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uintable;
  liquidityTo: string;
  dueTo: string;
  collateralIn: Uintable;
  minLiquidity: Uintable;
  maxAsset: Uintable;
  maxDebt: Uintable;
  deadline: Uintable;
}

interface LiquidityGivenCollateralETHAsset {
  collateral: ERC20Token;
  maturity: Uintable;
  liquidityTo: string;
  dueTo: string;
  collateralIn: Uintable;
  minLiquidity: Uintable;
  maxDebt: Uintable;
  deadline: Uintable;
}

interface LiquidityGivenCollateralETHCollateral {
  asset: ERC20Token;
  maturity: Uintable;
  liquidityTo: string;
  dueTo: string;
  minLiquidity: Uintable;
  maxAsset: Uintable;
  maxDebt: Uintable;
  deadline: Uintable;
}

interface RemoveLiquidity {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uintable;
  assetTo: string;
  collateralTo: string;
  liquidityIn: Uintable;
}

interface RemoveLiquidityETHAsset {
  collateral: ERC20Token;
  maturity: Uintable;
  assetTo: string;
  collateralTo: string;
  liquidityIn: Uintable;
}

interface RemoveLiquidityETHCollateral {
  asset: ERC20Token;
  maturity: Uintable;
  assetTo: string;
  collateralTo: string;
  liquidityIn: Uintable;
}
interface LendGivenBond {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uintable;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uintable;
  bondOut: Uintable;
  minInsurance: Uintable;
  deadline: Uintable;
}

interface LendGivenBondETHAsset {
  collateral: ERC20Token;
  maturity: Uintable;
  bondTo: string;
  insuranceTo: string;
  bondOut: Uintable;
  minInsurance: Uintable;
  deadline: Uintable;
}

interface LendGivenBondETHCollateral {
  asset: ERC20Token;
  maturity: Uintable;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uintable;
  bondOut: Uintable;
  minInsurance: Uintable;
  deadline: Uintable;
}

interface LendGivenInsurance {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uintable;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uintable;
  insuranceOut: Uintable;
  minBond: Uintable;
  deadline: Uintable;
}

interface LendGivenInsuranceETHAsset {
  collateral: ERC20Token;
  maturity: Uintable;
  bondTo: string;
  insuranceTo: string;
  insuranceOut: Uintable;
  minBond: Uintable;
  deadline: Uintable;
}

interface LendGivenInsuranceETHCollateral {
  asset: ERC20Token;
  maturity: Uintable;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uintable;
  insuranceOut: Uintable;
  minBond: Uintable;
  deadline: Uintable;
}

interface LendGivenPercent {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uintable;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uintable;
  percent: Uintable;
  minBond: Uintable;
  minInsurance: Uintable;
  deadline: Uintable;
}

interface LendGivenPercentETHAsset {
  collateral: ERC20Token;
  maturity: Uintable;
  bondTo: string;
  insuranceTo: string;
  percent: Uintable;
  minBond: Uintable;
  minInsurance: Uintable;
  deadline: Uintable;
}

interface LendGivenPercentETHCollateral {
  asset: ERC20Token;
  maturity: Uintable;
  bondTo: string;
  insuranceTo: string;
  assetIn: Uintable;
  percent: Uintable;
  minBond: Uintable;
  minInsurance: Uintable;
  deadline: Uintable;
}

interface Collect {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uintable;
  assetTo: string;
  collateralTo: string;
  claimsIn: Claims;
}

interface CollectETHAsset {
  collateral: ERC20Token;
  maturity: Uintable;
  assetTo: string;
  collateralTo: string;
  claimsIn: Claims;
}

interface CollectETHCollateral {
  asset: ERC20Token;
  maturity: Uintable;
  assetTo: string;
  collateralTo: string;
  claimsIn: Claims;
}

interface Claims {
  bondPrincipal: Uintable;
  bondInterest: Uintable;
  insurancePrincipal: Uintable;
  insuranceInterest: Uintable;
}

interface BorrowGivenDebt {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uintable;
  assetTo: string;
  dueTo: string;
  assetOut: Uintable;
  debtIn: Uintable;
  maxCollateral: Uintable;
  deadline: Uintable;
}

interface BorrowGivenDebtETHAsset {
  collateral: ERC20Token;
  maturity: Uintable;
  assetTo: string;
  dueTo: string;
  assetOut: Uintable;
  debtIn: Uintable;
  maxCollateral: Uintable;
  deadline: Uintable;
}

interface BorrowGivenDebtETHCollateral {
  asset: ERC20Token;
  maturity: Uintable;
  assetTo: string;
  dueTo: string;
  assetOut: Uintable;
  debtIn: Uintable;
  deadline: Uintable;
}

interface BorrowGivenCollateral {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uintable;
  assetTo: string;
  dueTo: string;
  assetOut: Uintable;
  collateralIn: Uintable;
  maxDebt: Uintable;
  deadline: Uintable;
}

interface BorrowGivenCollateralETHAsset {
  collateral: ERC20Token;
  maturity: Uintable;
  assetTo: string;
  dueTo: string;
  assetOut: Uintable;
  collateralIn: Uintable;
  maxDebt: Uintable;
  deadline: Uintable;
}

interface BorrowGivenCollateralETHCollateral {
  asset: ERC20Token;
  maturity: Uintable;
  assetTo: string;
  dueTo: string;
  assetOut: Uintable;
  maxDebt: Uintable;
  deadline: Uintable;
}

interface BorrowGivenPercent {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uintable;
  assetTo: string;
  dueTo: string;
  assetOut: Uintable;
  percent: Uintable;
  maxDebt: Uintable;
  maxCollateral: Uintable;
  deadline: Uintable;
}

interface BorrowGivenPercentETHAsset {
  collateral: ERC20Token;
  maturity: Uintable;
  assetTo: string;
  dueTo: string;
  assetOut: Uintable;
  percent: Uintable;
  maxDebt: Uintable;
  maxCollateral: Uintable;
  deadline: Uintable;
}

interface BorrowGivenPercentETHCollateral {
  asset: ERC20Token;
  maturity: Uintable;
  assetTo: string;
  dueTo: string;
  assetOut: Uintable;
  percent: Uintable;
  maxDebt: Uintable;
  deadline: Uintable;
}

interface Repay {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uintable;
  collateralTo: string;
  ids: Uintable[];
  maxAssetsIn: Uintable[];
  deadline: Uintable;
}

interface RepayETHAsset {
  collateral: ERC20Token;
  maturity: Uintable;
  collateralTo: string;
  ids: Uintable[];
  maxAssetsIn: Uintable[];
  deadline: Uintable;
}

interface RepayETHCollateral {
  asset: ERC20Token;
  maturity: Uintable;
  collateralTo: string;
  ids: Uintable[];
  maxAssetsIn: Uintable[];
  deadline: Uintable;
}
