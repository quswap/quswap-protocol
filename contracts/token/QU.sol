// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import { ERC20PermitUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";

contract QU is ERC20PermitUpgradeable {
  function initialize(address treasury) public {
    __ERC20Permit_init("QU");
    _mint(treasury, 100e24);
  }
}
