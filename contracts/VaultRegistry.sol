// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./Vault.sol";

contract vaultRegistry {
    mapping (address => address) public vaultMapping;
    // EtherWallet[] public ethersWallet;

    function deployVault(string memory _vaultName) private{
       EtherWallet _newVault = new EtherWallet(_vaultName);
    //    ethersWallet.push(_newVault);
       vaultMapping[msg.sender]= address(_newVault);
    }

    function addVaultToUser(string memory _vaultName) public {
        require(vaultMapping[msg.sender]== address(0));
        // vaultMapping[msg.sender]= vaultAddress;
        deployVault(_vaultName);
    }

}