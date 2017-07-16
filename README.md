splitter-contract [![Build Status][build-status-image]][build-status]
=================

An Ethereum smart contract to receive evenly split received funds between a set
number of outputs.

Usage
-----
To use this contract, clone the repo and hardcode the addresses you would like
to evenly split received funds between in the constructor. The contract can be
found in [`contracts/Splitter.sol`][contract].

You can deploy the contract like you would any truffle contract, by configuring
your `./truffle.js` and running:

    $ npm install
    $ npm run truffle deploy

Now, when ether is sent to the contract using a wallet or code like this:

    var WEI = 1;
    var ETHER = 10 ** 18 * WEI;
    web3.eth.sendTransaction({ to: contractAddress, value: 1 * ETHER });

The incoming transaction will be split between the parties specified in the
constructor and be available for withdrawl by calling `withdraw` or
`withdrawAll`. Check out the [tests] for examples.

Tests
-----
You can run test tests by running:

    $ npm install
    $ npm run testrpc

    $ # in another session
    $ npm run test

[contract]: contracts/Splitter.sol
[tests]: test/splitter.js

[build-status-image]: https://travis-ci.org/0xcaff/splitter-contract.svg?branch=master
[build-status]: https://travis-ci.org/0xcaff/splitter-contract
