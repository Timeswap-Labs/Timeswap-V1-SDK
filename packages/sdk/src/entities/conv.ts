import {
  ERC20Token,
  Uint112,
  Uint128,
  Uint256,
  Uint40,
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
    return contractInteraction(
      this.convContract,
      'newLiquidity',
      [
        params.asset.address,
        params.collateral.address,
        params.maturity.toBigInt(),
        params.liquidityTo,
        params.dueTo,
        params.assetIn.toBigInt(),
        params.debtIn.toBigInt(),
        params.collateralIn.toBigInt(),
        params.deadline.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async newLiquidityETHAsset(
    params: NewLiquidityETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'newLiquidityETHAsset',
      [
        params.collateral.address,
        params.maturity.toBigInt(),
        params.liquidityTo,
        params.dueTo,
        params.debtIn.toBigInt(),
        params.collateralIn.toBigInt(),
        params.deadline.toBigInt(),
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
    return contractInteraction(
      this.convContract,
      'newLiquidityETHCollateral',
      [
        params.asset.address,
        params.maturity.toBigInt(),
        params.liquidityTo,
        params.dueTo,
        params.assetIn.toBigInt(),
        params.debtIn.toBigInt(),
        params.deadline.toBigInt(),
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
    return contractInteraction(
      this.convContract,
      'liquidityGivenAsset',
      [
        params.asset.address,
        params.collateral.address,
        params.maturity.toBigInt(),
        params.liquidityTo,
        params.dueTo,
        params.assetIn.toBigInt(),
        params.minLiquidity.toBigInt(),
        params.maxDebt.toBigInt(),
        params.maxCollateral.toBigInt(),
        params.deadline.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async liquidityGivenAssetETHAsset(
    params: LiquidityGivenAssetETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'liquidityGivenAssetETHAsset',
      [
        params.collateral.address,
        params.maturity.toBigInt(),
        params.liquidityTo,
        params.dueTo,
        params.minLiquidity.toBigInt(),
        params.maxDebt.toBigInt(),
        params.maxCollateral.toBigInt(),
        params.deadline.toBigInt(),
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
    return contractInteraction(
      this.convContract,
      'liquidityGivenAssetETHCollateral',
      [
        params.asset.address,
        params.maturity.toBigInt(),
        params.liquidityTo,
        params.dueTo,
        params.assetIn.toBigInt(),
        params.minLiquidity.toBigInt(),
        params.maxDebt.toBigInt(),
        params.deadline.toBigInt(),
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
    return contractInteraction(
      this.convContract,
      'liquidityGivenDebt',
      [
        params.asset.address,
        params.collateral.address,
        params.maturity.toBigInt(),
        params.liquidityTo,
        params.dueTo,
        params.debtIn.toBigInt(),
        params.minLiquidity.toBigInt(),
        params.maxAsset.toBigInt(),
        params.maxCollateral.toBigInt(),
        params.deadline.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async liquidityGivenDebtETHAsset(
    params: LiquidityGivenDebtETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'liquidityGivenDebtETHAsset',
      [
        params.collateral.address,
        params.maturity.toBigInt(),
        params.liquidityTo,
        params.dueTo,
        params.debtIn.toBigInt(),
        params.minLiquidity.toBigInt(),
        params.maxCollateral.toBigInt(),
        params.deadline.toBigInt(),
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
    return contractInteraction(
      this.convContract,
      'liquidityGivenDebtETHCollateral',
      [
        params.asset.address,
        params.maturity.toBigInt(),
        params.liquidityTo,
        params.dueTo,
        params.debtIn.toBigInt(),
        params.minLiquidity.toBigInt(),
        params.maxAsset.toBigInt(),
        params.deadline.toBigInt(),
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
    return contractInteraction(
      this.convContract,
      'liquidityGivenCollateral',
      [
        params.asset.address,
        params.collateral.address,
        params.maturity.toBigInt(),
        params.liquidityTo,
        params.dueTo,
        params.collateralIn.toBigInt(),
        params.minLiquidity.toBigInt(),
        params.maxAsset.toBigInt(),
        params.maxDebt.toBigInt(),
        params.deadline.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async liquidityGivenCollateralETHAsset(
    params: LiquidityGivenCollateralETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'liquidityGivenCollateralETHAsset',
      [
        params.collateral.address,
        params.maturity.toBigInt(),
        params.liquidityTo,
        params.dueTo,
        params.collateralIn.toBigInt(),
        params.minLiquidity.toBigInt(),
        params.maxDebt.toBigInt(),
        params.deadline.toBigInt(),
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
    return contractInteraction(
      this.convContract,
      'liquidityGivenCollateralETHCollateral',
      [
        params.asset.address,
        params.maturity.toBigInt(),
        params.liquidityTo,
        params.dueTo,
        params.minLiquidity.toBigInt(),
        params.maxAsset.toBigInt(),
        params.maxDebt.toBigInt(),
        params.deadline.toBigInt(),
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
    return contractInteraction(
      this.convContract,
      'removeLiquidity',
      [
        params.asset.address,
        params.collateral.address,
        params.maturity.toBigInt(),
        params.assetTo,
        params.collateralTo,
        params.liquidityIn.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async removeLiquidityETHAsset(
    params: RemoveLiquidityETHAsset,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'removeLiquidityETHAsset',
      [
        params.collateral.address,
        params.maturity.toBigInt(),
        params.assetTo,
        params.collateralTo,
        params.liquidityIn.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async removeLiquidityETHCollateral(
    params: RemoveLiquidityETHCollateral,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'removeLiquidityETHCollateral',
      [
        params.asset.address,
        params.maturity.toBigInt(),
        params.assetTo,
        params.collateralTo,
        params.liquidityIn.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async lendGivenBond(
    params: LendGivenBond,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'lendGivenBond',
      [
        params.asset.address,
        params.collateral.address,
        params.maturity.toBigInt(),
        params.bondTo,
        params.insuranceTo,
        params.assetIn.toBigInt(),
        params.bondOut.toBigInt(),
        params.minInsurance.toBigInt(),
        params.deadline.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async lendGivenBondETHAsset(
    params: LendGivenBondETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'lendGivenBondETHAsset',
      [
        params.collateral.address,
        params.maturity.toBigInt(),
        params.bondTo,
        params.insuranceTo,
        params.bondOut.toBigInt(),
        params.minInsurance.toBigInt(),
        params.deadline.toBigInt(),
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
    return contractInteraction(
      this.convContract,
      'lendGivenBondETHCollateral',
      [
        params.asset.address,
        params.maturity.toBigInt(),
        params.bondTo,
        params.insuranceTo,
        params.assetIn.toBigInt(),
        params.bondOut.toBigInt(),
        params.minInsurance.toBigInt(),
        params.deadline.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async lendGivenInsurance(
    params: LendGivenInsurance,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'lendGivenInsurance',
      [
        params.asset.address,
        params.collateral.address,
        params.maturity.toBigInt(),
        params.bondTo,
        params.insuranceTo,
        params.assetIn.toBigInt(),
        params.insuranceOut.toBigInt(),
        params.minBond.toBigInt(),
        params.deadline.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async lendGivenInsuranceETHAsset(
    params: LendGivenInsuranceETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'lendGivenInsuranceETHAsset',
      [
        params.collateral.address,
        params.maturity.toBigInt(),
        params.bondTo,
        params.insuranceTo,
        params.insuranceOut.toBigInt(),
        params.minBond.toBigInt(),
        params.deadline.toBigInt(),
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
    return contractInteraction(
      this.convContract,
      'lendGivenInsuranceETHCollateral',
      [
        params.asset.address,
        params.maturity.toBigInt(),
        params.bondTo,
        params.insuranceTo,
        params.assetIn.toBigInt(),
        params.insuranceOut.toBigInt(),
        params.minBond.toBigInt(),
        params.deadline.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async lendGivenPercent(
    params: LendGivenPercent,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'lendGivenPercent',
      [
        params.asset.address,
        params.collateral.address,
        params.maturity.toBigInt(),
        params.bondTo,
        params.insuranceTo,
        params.assetIn.toBigInt(),
        params.percent.toBigInt(),
        params.minBond.toBigInt(),
        params.minInsurance.toBigInt(),
        params.deadline.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async lendGivenPercentETHAsset(
    params: LendGivenPercentETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'lendGivenPercentETHAsset',
      [
        params.collateral.address,
        params.maturity.toBigInt(),
        params.bondTo,
        params.insuranceTo,
        params.percent.toBigInt(),
        params.minBond.toBigInt(),
        params.minInsurance.toBigInt(),
        params.deadline.toBigInt(),
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
    return contractInteraction(
      this.convContract,
      'lendGivenPercentETHCollateral',
      [
        params.asset.address,
        params.maturity.toBigInt(),
        params.bondTo,
        params.insuranceTo,
        params.assetIn.toBigInt(),
        params.percent.toBigInt(),
        params.minBond.toBigInt(),
        params.minInsurance.toBigInt(),
        params.deadline.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async collect(
    params: Collect,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'collect',
      [
        params.asset.address,
        params.collateral.address,
        params.maturity.toBigInt(),
        params.assetTo,
        params.collateralTo,
        [
          params.claimsIn.bondPrincipal.toBigInt(),
          params.claimsIn.bondInterest.toBigInt(),
          params.claimsIn.insurancePrincipal.toBigInt(),
          params.claimsIn.insuranceInterest.toBigInt(),
        ],
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async collectETHAsset(
    params: CollectETHAsset,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'collectETHAsset',
      [
        params.collateral.address,
        params.maturity.toBigInt(),
        params.assetTo,
        params.collateralTo,
        [
          params.claimsIn.bondPrincipal.toBigInt(),
          params.claimsIn.bondInterest.toBigInt(),
          params.claimsIn.insurancePrincipal.toBigInt(),
          params.claimsIn.insuranceInterest.toBigInt(),
        ],
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async collectETHCollateral(
    params: CollectETHCollateral,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'collectETHCollateral',
      [
        params.asset.address,
        params.maturity.toBigInt(),
        params.assetTo,
        params.collateralTo,
        [
          params.claimsIn.bondPrincipal.toBigInt(),
          params.claimsIn.bondInterest.toBigInt(),
          params.claimsIn.insurancePrincipal.toBigInt(),
          params.claimsIn.insuranceInterest.toBigInt(),
        ],
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async borrowGivenDebt(
    params: BorrowGivenDebt,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'borrowGivenDebt',
      [
        params.asset.address,
        params.collateral.address,
        params.maturity.toBigInt(),
        params.assetTo,
        params.dueTo,
        params.assetOut.toBigInt(),
        params.debtIn.toBigInt(),
        params.maxCollateral.toBigInt(),
        params.deadline.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async borrowGivenDebtETHAsset(
    params: BorrowGivenDebtETHAsset,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'borrowGivenDebtETHAsset',
      [
        params.collateral.address,
        params.maturity.toBigInt(),
        params.assetTo,
        params.dueTo,
        params.assetOut.toBigInt(),
        params.debtIn.toBigInt(),
        params.maxCollateral.toBigInt(),
        params.deadline.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async borrowGivenDebtETHCollateral(
    params: BorrowGivenDebtETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'borrowGivenDebtETHCollateral',
      [
        params.asset.address,
        params.maturity.toBigInt(),
        params.assetTo,
        params.dueTo,
        params.assetOut.toBigInt(),
        params.debtIn.toBigInt(),
        params.deadline.toBigInt(),
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
    return contractInteraction(
      this.convContract,
      'borrowGivenCollateral',
      [
        params.asset.address,
        params.collateral.address,
        params.maturity.toBigInt(),
        params.assetTo,
        params.dueTo,
        params.assetOut.toBigInt(),
        params.collateralIn.toBigInt(),
        params.maxDebt.toBigInt(),
        params.deadline.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async borrowGivenCollateralETHAsset(
    params: BorrowGivenCollateralETHAsset,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'borrowGivenCollateralETHAsset',
      [
        params.collateral.address,
        params.maturity.toBigInt(),
        params.assetTo,
        params.dueTo,
        params.assetOut.toBigInt(),
        params.collateralIn.toBigInt(),
        params.maxDebt.toBigInt(),
        params.deadline.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async borrowGivenCollateralETHCollateral(
    params: BorrowGivenCollateralETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'borrowGivenCollateralETHCollateral',
      [
        params.asset.address,
        params.maturity.toBigInt(),
        params.assetTo,
        params.dueTo,
        params.assetOut.toBigInt(),
        params.maxDebt.toBigInt(),
        params.deadline.toBigInt(),
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
    return contractInteraction(
      this.convContract,
      'borrowGivenPercent',
      [
        params.asset.address,
        params.collateral.address,
        params.maturity.toBigInt(),
        params.assetTo,
        params.dueTo,
        params.assetOut.toBigInt(),
        params.percent.toBigInt(),
        params.maxDebt.toBigInt(),
        params.maxCollateral.toBigInt(),
        params.deadline.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async borrowGivenPercentETHAsset(
    params: BorrowGivenPercentETHAsset,
    txnParams?: GasLimitTransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'borrowGivenPercentETHAsset',
      [
        params.collateral.address,
        params.maturity.toBigInt(),
        params.assetTo,
        params.dueTo,
        params.assetOut.toBigInt(),
        params.percent.toBigInt(),
        params.maxDebt.toBigInt(),
        params.maxCollateral.toBigInt(),
        params.deadline.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async borrowGivenPercentETHCollateral(
    params: BorrowGivenPercentETHCollateral,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'borrowGivenPercentETHCollateral',
      [
        params.asset.address,
        params.maturity.toBigInt(),
        params.assetTo,
        params.dueTo,
        params.assetOut.toBigInt(),
        params.percent.toBigInt(),
        params.maxDebt.toBigInt(),
        params.deadline.toBigInt(),
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
    return contractInteraction(
      this.convContract,
      'repay',
      [
        params.asset.address,
        params.collateral.address,
        params.maturity.toBigInt(),
        params.collateralTo,
        params.ids.map(value => value.toBigInt()),
        params.maxAssetsIn.map(value => value.toBigInt()),
        params.deadline.toBigInt(),
      ],
      { gasLimit: txnParams?.gasLimit?.toBigInt() }
    );
  }

  async repayETHAsset(
    params: RepayETHAsset,
    txnParams: TransactionParams
  ): Promise<ContractTransaction> {
    return contractInteraction(
      this.convContract,
      'repayETHAsset',
      [
        params.collateral.address,
        params.maturity.toBigInt(),
        params.collateralTo,
        params.ids.map(value => value.toBigInt()),
        params.maxAssetsIn.map(value => value.toBigInt()),
        params.deadline.toBigInt(),
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
    return contractInteraction(
      this.convContract,
      'repayETHCollateral',
      [
        params.asset.address,
        params.maturity.toBigInt(),
        params.collateralTo,
        params.ids.map(value => value.toBigInt()),
        params.maxAssetsIn.map(value => value.toBigInt()),
        params.deadline.toBigInt(),
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
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uint112;
  debtIn: Uint112;
  collateralIn: Uint112;
  deadline: Uint256;
}

interface NewLiquidityETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  debtIn: Uint112;
  collateralIn: Uint112;
  deadline: Uint256;
}

interface NewLiquidityETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uint112;
  debtIn: Uint112;
  deadline: Uint256;
}

interface LiquidityGivenAsset {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uint112;
  minLiquidity: Uint256;
  maxDebt: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface LiquidityGivenAssetETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  minLiquidity: Uint256;
  maxDebt: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface LiquidityGivenAssetETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  assetIn: Uint112;
  minLiquidity: Uint256;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface LiquidityGivenDebt {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  debtIn: Uint112;
  minLiquidity: Uint256;
  maxAsset: Uint112;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface LiquidityGivenDebtETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  debtIn: Uint112;
  minLiquidity: Uint256;
  maxCollateral: Uint112;
  deadline: Uint256;
}

interface LiquidityGivenDebtETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  debtIn: Uint112;
  minLiquidity: Uint256;
  maxAsset: Uint112;
  deadline: Uint256;
}

interface LiquidityGivenCollateral {
  asset: ERC20Token;
  collateral: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  collateralIn: Uint112;
  minLiquidity: Uint256;
  maxAsset: Uint112;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface LiquidityGivenCollateralETHAsset {
  collateral: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  collateralIn: Uint112;
  minLiquidity: Uint256;
  maxDebt: Uint112;
  deadline: Uint256;
}

interface LiquidityGivenCollateralETHCollateral {
  asset: ERC20Token;
  maturity: Uint256;
  liquidityTo: string;
  dueTo: string;
  minLiquidity: Uint256;
  maxAsset: Uint112;
  maxDebt: Uint112;
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
  bondPrincipal: Uint112;
  bondInterest: Uint112;
  insurancePrincipal: Uint112;
  insuranceInterest: Uint112;
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
