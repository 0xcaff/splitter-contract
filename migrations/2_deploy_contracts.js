var Splitter = artifacts.require("./Splitter.sol");

module.exports = function(deployer) {
  const addrs = [
    // put the addresses you would like to split the funds between here as
    // strings, for example:
    "0x22d491bde2303f2f43325b2108d26f1eaba1e32b",
    "0xeec569b9890e90eb1a6e883ac32a9348564d99d8",
  ];

  // ...and uncomment this line and comment the one below it.
  // deployer.deploy(Splitter, [addrs]);
  deployer.deploy(Splitter);
};
