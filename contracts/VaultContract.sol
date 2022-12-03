
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EtherWallet {
    address payable public owner;
    uint public timeLock = 120 ;
    uint oneTxnLock;
    struct WithdrawRequest {
        uint timeLockForTxn;
        uint amount;   
        bool cancelled;
    }

    struct WithdrawRequestERC {
        address tokenAddress;
        uint timeLockForTxn;
        uint amount;      
        bool cancelled; 
    }

    WithdrawRequest[] public withdrawRequest ;
    WithdrawRequestERC[] public withdrawRequestERC ;

    constructor() {
        owner = payable(msg.sender);
    }

    receive() external payable {}

    function withdraw(uint _amount) external {
        require(msg.sender == owner, "caller is not owner");       
        WithdrawRequest memory _withdrawRequest = WithdrawRequest(block.timestamp + timeLock,_amount,false);
        withdrawRequest.push(_withdrawRequest);
        
    }

    function ExectuteWithdraw(uint id) external {
        require(msg.sender == owner, "caller is not owner");
        require(!withdrawRequest[id].cancelled, "cancelled");
        require(block.timestamp >= withdrawRequest[id].timeLockForTxn, "Time Waiting");
        payable(msg.sender).transfer( withdrawRequest[id].amount);
    }

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }

    function getContractBalance(address token) public view returns(uint){
    require(msg.sender == owner);
    return IERC20(token).balanceOf(address(this));
    }

    function approveERC20(address token, uint amount) public {
     IERC20(token).approve(address(this), amount) ;
    }

    function WithdrawERC20(address token, uint _amount) public {   
     WithdrawRequestERC memory _withdrawRequestERC = WithdrawRequestERC(token, block.timestamp + timeLock, _amount,false);
     withdrawRequestERC.push( _withdrawRequestERC );
    }

    function ExectuteERCWithdraw(uint id) external {
        require(msg.sender == owner, "caller is not owner");
        require(!withdrawRequestERC[id].cancelled, "cancelled");
        require(block.timestamp >= withdrawRequestERC[id].timeLockForTxn,"Time Waiting");
         IERC20(withdrawRequestERC[id].tokenAddress).transferFrom(
        address(this),
         msg.sender,
        withdrawRequestERC[id].amount
         ) ;
        payable(msg.sender).transfer( withdrawRequest[id].amount);
    }

    function cancelWithdraw(uint id) public {
        withdrawRequest[id].cancelled = true;
    }
   
    function cancelWithdrawERC(uint id)public {
        withdrawRequestERC[id].cancelled = true;
    }

}
