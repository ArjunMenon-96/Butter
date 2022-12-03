// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./Vault.sol";

contract vaultRegistry {
    mapping (address => address) public vaultMapping;
    // EtherWallet[] public ethersWallet;

    function deployVault() private{
       EtherWallet _newVault = new EtherWallet("name");
    //    ethersWallet.push(_newVault);
       vaultMapping[msg.sender]= address(_newVault);
    }

    function addVaultToUser() public {
        require(vaultMapping[msg.sender]== address(0));
        // vaultMapping[msg.sender]= vaultAddress;
        deployVault();
    }

}