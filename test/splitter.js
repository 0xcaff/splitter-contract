const { getBalance, gasCostFor, loopSerial, lastOf, ETHER,
  assertPromiseThrows } = require('./utils');

const Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', (accounts) => {
  const between = [...accounts.slice(0, 2)];
  var instance;

  beforeEach(async () => {
    // reset state between runs
    instance = await Splitter.new();
  });

  it('starts in the expected state', async () => {
    const initialTotalInput = await instance.totalInput();
    assert(initialTotalInput.eq(0));

    // check initial withdrawls
    await Promise.all(between.map(async acc => {
      const withdrew = await instance.amountsWithdrew(acc);
      assert(withdrew.eq(0));
    }));
  });

  it('should accept funds', async () => {
    const depositing = 1 * ETHER;

    const contractBalanceBefore = await getBalance(instance.address);
    await instance.sendTransaction({ from: lastOf(accounts), value: depositing });
    const contractBalanceAfter = await getBalance(instance.address);

    assert(contractBalanceAfter.sub(contractBalanceBefore).eq(depositing));
  });

  it('updates internal state when adding funds', async () => {
    const funder = lastOf(accounts);
    const funding = 1 * ETHER;

    // add funds
    await instance.sendTransaction({ from: funder, value: funding });

    // check final withdrawls
    await Promise.all(between.map(async acc => {
      const withdrew = await instance.amountsWithdrew(acc);
      assert(withdrew.eq(0));
    }));

    // check totalInput
    const finalTotalInput = await instance.totalInput();
    assert(finalTotalInput.eq(funding));
  });

  it('should split a single funding evenly between multiple parties', async () => {
    const funder = lastOf(accounts);
    const funding = 1 * ETHER;

    // add funds
    await instance.sendTransaction({ from: funder, value: funding });

    // try withdrawing each share
    // we need to run serially otherwise we are looking at the wrong global
    // state
    await loopSerial(between, async (acc) => {
      const initialContractBalance = await getBalance(instance.address);
      let initialAccountBalance = await getBalance(acc);

      const tx = await instance.withdrawAll({ from: acc });

      const finalContractBalance = await getBalance(instance.address);
      const finalAccountBalance = await getBalance(acc);

      const share = funding / between.length;
      const contractBalanceChange = finalContractBalance.sub(initialContractBalance);
      assert(contractBalanceChange.eq(-share));

      const cost = await gasCostFor(tx);
      initialAccountBalance = initialAccountBalance.sub(cost);

      const accountBalanceChange = finalAccountBalance.sub(initialAccountBalance);

      const finalWithdrawlAmount = await instance.amountsWithdrew(acc);
      assert(accountBalanceChange.eq(finalWithdrawlAmount));

      // ensure the right amount was moved
      assert(accountBalanceChange.eq(contractBalanceChange.mul(-1)));
    });

    const finalBalance = await getBalance(instance.address);
    assert(finalBalance.eq(0));
  });

  it('should fail to overdraw funds by an non-participating party', async () => {
    const acc = lastOf(accounts);
    const amount = 1 * ETHER;

    await instance.sendTransaction({ from: acc, value: amount });

    const initialContractBalance = await getBalance(instance.address);
    await assertPromiseThrows(() => instance.withdraw(100, { from: acc }));

    const finalContractBalance = await getBalance(instance.address);

    // ensure state wasn't mutated
    const amountWithdrew = await instance.amountsWithdrew(acc);
    assert(amountWithdrew.eq(0));

    assert(initialContractBalance.sub(finalContractBalance).eq(0));
    assert(finalContractBalance.eq(amount));
  });

  it("shouldn throw when non-participants withdraw 0 wei", async () => {
    const acc = lastOf(accounts);

    // make sure nothing happens (throw or state change)
    const initialContractBalance = await getBalance(instance.address);
    const initialAmountWithdrawn = await instance.amountsWithdrew(acc);
    await assertPromiseThrows(() => instance.withdrawAll({ from: acc }));
    const finalContractBalance = await getBalance(instance.address);
    const finalAmountWithdrawn = await instance.amountsWithdrew(acc);

    assert(finalContractBalance.eq(initialContractBalance));
    assert(initialAmountWithdrawn.eq(0));
    assert(finalAmountWithdrawn.sub(initialAmountWithdrawn).eq(0));
  });

  it('should evenly split multiple fundings with withdrawls in between', async () => {
    const funder = lastOf(accounts);

    const initialBalances = await Promise.all(
      between.map(acc => getBalance(acc)));

    // fund once
    await instance.sendTransaction({ from: funder, value: 1 * ETHER });

    // withdraw some stuff
    const tx = await instance.withdrawAll({ from: accounts[0] });

    // we are adding the gas cost back to ignore it in the balance change
    const cost = await gasCostFor(tx);
    initialBalances[0] = initialBalances[0].sub(cost);

    // fund again
    await instance.sendTransaction({ from: funder, value: 1 * ETHER });

    // sweep all accounts and check balances
    await loopSerial(between, async (acc, i) => {
      // sweep account
      const tx = await instance.withdrawAll({ from: acc });
      const cost = await gasCostFor(tx);
      const initialBalance = initialBalances[i].sub(cost);

      // compare balances
      const finalBalance = await getBalance(acc);
      const balanceChange = finalBalance.sub(initialBalance);

      assert(balanceChange.eq(1 * ETHER));
    });
  });
});
