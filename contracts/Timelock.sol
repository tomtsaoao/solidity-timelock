// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract Timelock {
    uint public immutable expiry;
    uint public constant length;
    
    address payable public immutable owner;

    constructor(address payable _owner, _length) {
        length = _length;
        expiry = block.timestamp + _length;
        owner = _owner;
    }

    function deposit(address token, uint amount) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
    }

    function withdraw(address token, uint amount) external {
        require(msg.sender == owner, 'only owner can withdraw funds');
        require(block.timestamp >= expiry, 'too early to withdraw funds');
        if(token == address(0)) {
            owner.transfer(amount); // ETH transfer
        } else {
            IERC20(token).transfer(owner, amount); // IERC20 transfer
        }
    }

    receive() external payable {}
}