// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BalanceSheetQuery {
  function getBalance(address tokenOrEther, address holder) internal view returns (uint256) {
    if (tokenOrEther == address(0x0)) return holder.balance;
    else return IERC20(tokenOrEther).balanceOf(holder);
  }
  constructor(address[] memory holders, address[] memory tokens) {
    uint256[] memory balances = new uint256[](holders.length*tokens.length);
    for (uint256 i = 0; i < holders.length; i++) {
      for (uint256 j = 0; j < tokens.length; j++) {
        balances[i] = getBalance(tokens[j], holders[i]);
      }
    }
    bytes memory response = abi.encode(balances);
    assembly {
      return(add(response, 0x20), mload(response))
    }
  }
}
