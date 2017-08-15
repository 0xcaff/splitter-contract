const SHA3 = require('sha3');
const RLP = require('rlp');

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

const getTransactionCount = (address) =>
  promisify(cb => web3.eth.getTransactionCount(address, cb));

const sendTransaction = (...args) =>
  promisify(cb => web3.eth.sendTransaction(...args, cb));

const costOf = ({ gasPrice }, { gasUsed }) => gasPrice.mul(gasUsed);

const loopSerial = async (arr, asyncInnerFunction) => {
  for (var i = 0; i < arr.length; i++) {
    const elem = arr[i];
    await asyncInnerFunction(elem, i);
  }
};

const lastOf = (arr) => arr[arr.length - 1];

const gasCostFor = async ({ tx: txHash }) => {
  const tx = await getTransaction(txHash);
  const receipt = await getTransactionReceipt(txHash);

  return costOf(tx, receipt);
};

const toWei = (...args) => {
  const result = web3.toWei(...args);
  return web3.toBigNumber(result);
}

const sha3 = (input) => {
  const d = new SHA3.SHA3Hash(256);
  d.update(input);
  return d.digest('hex');
};
 
const calculateContractAddress = (fromAddress, nonce) => {
  const encoded = RLP.encode([ fromAddress, nonce ]);
  const rawAddress = sha3(encoded);

  // Take the first 12 bytes. In hex, each byte is represented by two chars.
  const contractAddress = rawAddress.slice(12 * 2);

  return contractAddress;
}

module.exports = {
  getBalance, getTransaction, getTransactionReceipt, costOf, loopSerial, lastOf,
  assertPromiseThrows, gasCostFor, toWei, calculateContractAddress,
  getTransactionCount, sendTransaction
};
