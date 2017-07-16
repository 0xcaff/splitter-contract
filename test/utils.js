const assertPromiseThrows = async (fn) => {
  var exception;

  try {
    await fn();
  } catch(e) {
    // swallow exception
    exception = e;
  }

  if (!exception) {
    throw new TypeError('There was no exception where there should have been one');
  }
};

const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
      resolve(res);
    })
  );

const getBalance = (account, at) =>
  promisify(cb => web3.eth.getBalance(account, at, cb));

const getTransaction = (hash) =>
  promisify(cb => web3.eth.getTransaction(hash, cb));

const getTransactionReceipt = (hash) =>
  promisify(cb => web3.eth.getTransactionReceipt(hash, cb));

const costOf = ({ gasPrice }, { gasUsed }) => gasPrice.mul(gasUsed);

const loopSerial = async (arr, asyncInnerFunction) => {
  for (var i = 0; i < arr.length; i++) {
    const elem = arr[i];
    await asyncInnerFunction(elem, i);
  }
};

const lastOf = (arr) => arr[arr.length - 1];

const ETHER = 10 ** 18;

const gasCostFor = async ({ tx: txHash }) => {
  const tx = await getTransaction(txHash);
  const receipt = await getTransactionReceipt(txHash);

  return costOf(tx, receipt);
};

module.exports = {
  getBalance, getTransaction, getTransactionReceipt, costOf, loopSerial, lastOf,
  ETHER, assertPromiseThrows, gasCostFor
};
