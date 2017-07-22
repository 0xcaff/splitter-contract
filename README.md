splitter-contract [![Build Status][build-status-image]][build-status]
=================

An Ethereum smart contract to evenly split received funds between a set number
of outputs.

Usage
-----
To deploy an instance of this contract, copy the code from
[`contracts/Splitter.sol`][contract] to your ethereum wallet and deploy, passing
an array of addresses which the funds will be shared between into the
constructor.

You can also deploy the contract using truffle by configuring the [deployment
script][deploy] with your addresses and running:

    $ npm install
    $ npm run truffle deploy

After deploying, when funds are sent to the contract address, the incoming
transaction will be split evenly between the parties specified in the contract.
The parties can withdraw their funds by calling the `withdraw` and `withdrawAll`
functions.

Here's an example of using web3 to send funds to the contract.

    var WEI = 1;
    var ETHER = 10 ** 18 * WEI;
    web3.eth.sendTransaction({ to: contractAddress, value: 1 * ETHER });

Check out the [tests] for examples and the ABI documentation for more
information about what the contract can do.

Tests
-----
You can run test tests by running:

    $ npm install
    $ npm run testrpc

    $ # in another session
    $ npm run test

[contract]: contracts/Splitter.sol
[deploy]: migrations/2_deploy_contracts.js
[tests]: test/splitter.js

[build-status-image]: https://travis-ci.org/0xcaff/splitter-contract.svg?branch=master
[build-status]: https://travis-ci.org/0xcaff/splitter-contract
