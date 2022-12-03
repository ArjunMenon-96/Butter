// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract vaultRegistry {
    mapping (address => address) vaultMapping;

    function addVaultToUser(address vaultAddress) public {
        require(vaultMapping[msg.sender]== "0x0000000000000000000000000000000000000000");
        vaultMapping[msg.sender]= vaultAddress;
    }

}