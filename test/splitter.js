const { getBalance, getTransaction, getTransactionReceipt, costOf, loopSerial,
  lastOf, ETHER, assertPromiseThrows } = require('./utils');
const Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', (accounts) => {
  it('should split single funds evenly between multiple parties', async () => {
    const instance = await Splitter.deployed();

    const between = [...accounts.slice(0, 2)];
    const initialContractBalances = await Promise.all(
      between.map(acc => instance.balances(acc))
    );

    // add money
    await instance.sendTransaction({
      from: lastOf(accounts),
      value: 1 * ETHER,
    });

    const finalContractBalances = await Promise.all(
      between.map(acc => instance.balances(acc))
    );

    between.forEach((acc, i) => {
      // check internal transaction state
      const initialContractBalance = initialContractBalances[0];
      const finalContractBalance = finalContractBalances[0];
      const contractBalanceChange = finalContractBalance.sub(initialContractBalance);
      assert(contractBalanceChange.gt(0)); // we added money
    });

    // We need to run serially otherwise we are looking at the wrong global state.
    await loopSerial(between, async (acc, i) => {
      const initialContractBalance = await getBalance(instance.address);
      const initialAccountBalance = await getBalance(acc);
      const initialContractAccountBalance = await instance.balances(acc);

      const { tx: txHash } = await instance.withdrawAll({ from: acc });

      const finalContractBalance = await getBalance(instance.address);
      const finalAccountBalance = await getBalance(acc);
      const finalContractAccountBalance = await instance.balances(acc);

      const contractBalanceChange = finalContractBalance.sub(initialContractBalance);
      assert(contractBalanceChange.lt(0));

      const accountBalanceChange = finalAccountBalance.sub(initialAccountBalance);
      assert(accountBalanceChange.gt(0));

      const contractAccountBalanceChange = finalContractAccountBalance.sub(initialContractAccountBalance);
      assert(contractAccountBalanceChange.lt(0));

      assert(contractAccountBalanceChange.eq(contractBalanceChange));

      const tx = await getTransaction(txHash);
      const receipt = await getTransactionReceipt(txHash);
      const withdrawlCost = costOf(tx, receipt);

      // ensure the right amount was moved
      assert(accountBalanceChange.eq(contractBalanceChange.mul(-1).sub(withdrawlCost)));
    });

    const finalBalance = await getBalance(instance.address);
    assert(finalBalance.eq(0));
  });

  it("shouldn't do anything for unknown addresses", async () => {
    const instance = await Splitter.deployed();

    // try withdrawing eth
    const acc = lastOf(accounts);
    const accountBalance = await instance.balances(acc);
    assert(accountBalance.eq(0));

    await assertPromiseThrows(() => instance.withdraw(100));

    // make sure nothing happens (throw or state change)
    const initialContractBalance = await getBalance(instance.address);
    const initialContractAccountBalance = await instance.balances(acc);
    await instance.withdrawAll();
    const finalContractBalance = await getBalance(instance.address);
    const finalContractAccountBalance = await instance.balances(acc);

    assert(finalContractBalance.eq(initialContractBalance));
    assert(finalContractAccountBalance.eq(initialContractAccountBalance));
  });

  // TODO: add a test for multiple fundings case
});

