// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0;

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
import { BoringBatchable } from "@boringcrypto/boring-solidity/contracts/BoringBatchable.sol";
import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract QUBOND is ERC721Upgradeable, BoringBatchable {
  using SafeMath for *;
  address public qu;
  uint256 public totalBonded;
  mapping (bytes32 => uint256) public bonds;
  function initialize(address _qu) public initializer {
    __ERC721_init("QUBOND", "QUBOND");
    qu = _qu;
  }
  function mint(string memory multiaddr) public {
    uint256 tokenId = uint256(toMultiaddrHash(multiaddr));
    require(!_exists(tokenId), "!multiaddr-available");
    _mint(msg.sender, uint256(tokenId));
  }
  function splitSignature(bytes memory signature) internal pure returns (uint8 v, bytes32 r, bytes32 s) {
    assembly {
      r := mload(add(signature, 0x20))
      s := mload(add(signature, 0x40))
      v := byte(0, mload(add(signature, 0x60)))
    }
  }
  function permit(address owner, uint256 value, uint256 deadline, bytes memory signature) public {
    (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
    IERC20Permit(qu).permit(owner, address(this), value, deadline, v, r, s);
  }
  function increaseBond(string memory multiaddr, uint256 value) public {
    totalBonded = totalBonded.add(value);
    bytes32 multiaddrHash = toMultiaddrHash(multiaddr);
    bonds[multiaddrHash] = bonds[multiaddrHash].add(value);
    require(IERC20(qu).transferFrom(msg.sender, address(this), value), "!transferFrom");
  }
  function toMultiaddrHash(string memory multiaddr) internal pure returns (bytes32 result) {
    result = keccak256(abi.encodePacked(multiaddr));
  }
  function decreaseBond(string memory multiaddr, uint256 value) public {
    bytes32 multiaddrHash = toMultiaddrHash(multiaddr);
    require(ownerOf(uint256(multiaddrHash)) == msg.sender, "!owner");
    bonds[multiaddrHash] = bonds[multiaddrHash].sub(value);
    totalBonded = totalBonded.sub(value);
    require(IERC20(qu).transfer(msg.sender, value), "!transfer");
  }
  function inCaseTokensGetStuck(address token) public {
    if (token == qu) {
      uint256 totalToSkim = IERC20(token).balanceOf(address(this)).sub(totalBonded);
      if (totalToSkim != 0) require(IERC20(token).transfer(msg.sender, totalToSkim), "!transfer");
    } else {
      uint256 totalToSkim = IERC20(token).balanceOf(address(this));
      require(IERC20(token).transfer(msg.sender, totalToSkim), "!transfer");
    }
  }
}
