export default [
  'function fee() view returns(uint16)',
  'function protocolFee() view returns(uint16)',
  'function constantProduct(uint256) view returns (uint112,uint112,uint112)',
  'function totalReserves(uint256) view returns ((uint128,uint128))',
  'function totalLiquidity(uint256) view returns (uint256)',
  'function liquidityOf(uint256,address) view returns (uint256)',
  'function totalClaims(uint256) view returns ((uint112,uint112,uint112,uint112))',
  'function claimsOf(uint256,address) view returns ((uint112,uint112,uint112,uint112)) ',
  'function totalDebtCreated(uint256) view returns (uint120)',
  'function totalDuesOf(uint256,address) view returns (uint256)',
  'function dueOf(uint256,address,uint256) view returns ((uint112,uint112,uint32))',
];
