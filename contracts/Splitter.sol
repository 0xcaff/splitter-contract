pragma solidity ^0.4.11;

contract Splitter {
    mapping(address => uint) public balances;
    mapping(uint8 => address) between;
    uint8 count;

    function Splitter() {
        count = 2;
        between[0] = 0x0090f8bf6a479f320ead074411a4b0e7944ea8c9c1;
        between[1] = 0x00ffcf8fdee72ac11b5c542428b35eef5769c409f0;
    }

    // To save on transaction fees, it's beneficial to withdraw in one big
    // transaction instead of many little ones.
    function withdraw(uint amount) {
        uint balance = balances[msg.sender];
        require(balance <= amount);

        balances[msg.sender] -= amount;

        // the gas for this transaction is paid for by msg.sender
        msg.sender.transfer(amount);
    }

    function withdrawAll() {
        uint balance = balances[msg.sender];
        Splitter.withdraw(balance);
    }

    function() payable {
        // We do integer division floor(a / b) here. There will be a maximum
        // remainder of count wei left in the contract after all the transfers.

        // TODO: properly handle the remainder, this will cause compounding
        uint addedToEach = this.balance / count;

        for (uint8 i = 0; i < count; i++) {
            address to = between[i];
            balances[to] += addedToEach;
        }
    }
}
