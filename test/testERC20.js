var ERC20 = artifacts.require('./ERC20.sol');
var tokenInstance;

contract('ERC20', async () => {
  accounts = await web3.eth.getAccounts();
});

it('initalozes the contract with correct values', async () => {
  instance = await ERC20.deployed();
  tokenInstance = instance;
  name = await tokenInstance.name();
  symbol = await tokenInstance.symbol();
  standard = await tokenInstance.standard();
  assert.equal(name, 'DappToken', 'has the correct name');
  assert.equal(symbol, 'DAPP', 'has the correct symbol');
  assert.equal(standard, 'DApp Token v1.0', 'has the correct standard');
});

it('allocates the inital upon deployment', async () => {
  totalSupply = await tokenInstance.totalSupply();
  adminBalance = await tokenInstance.balanceOf(accounts[0]);
  assert.equal(totalSupply.toNumber(), 1000000, 'set the total supply to 1,000,000');
  assert.equal(adminBalance.toNumber(), 1000000, 'it allocates the initial suppy to the admin');
});

it('transfer token owership', async () => {
  success = await tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
  receipt = await tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
  balance = await tokenInstance.balanceOf(accounts[0]);
  try {
    await tokenInstance.transfer.call(accounts[1], 999999999999999);
  } catch (err) {
    assert(err.message.indexOf('revert') >= 0, 'error message must contain revert');
  }
  assert.equal(success, true, 'it returns true');
  assert.equal(receipt.logs.length, 1, 'triggers one event');
  assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
  assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the tokens are transferred from');
  assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the tokens are transferred to');
  assert.equal(receipt.logs[0].args._value, 250000, 'logs the tranfer amount');
  assert.equal(balance.toNumber(), 750000, 'amount of account[0]');
});

it('approve token for delegated transfer', async () => {
  success = await tokenInstance.approve.call(accounts[1], 100, { from: accounts[0] });
  receipt = await tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
  allowance = await tokenInstance.allowance.call(accounts[0], accounts[1], { from: accounts[0] });

  assert.equal(success, true, 'is return true');
  assert.equal(receipt.logs.length, 1, 'triggers one event');
  assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
  assert.equal(
    receipt.logs[0].args._owner,
    accounts[0],
    'logs the account the tokens are authorized by'
  );
  assert.equal(
    receipt.logs[0].args._spender,
    accounts[1],
    'logs the account the tokens are authorized to'
  );
  assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
  assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
});

it('handles delegated token transfers', async () => {
  fromAccount = accounts[2];
  toAccount = accounts[3];
  spendingAccount = accounts[4];
  await tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
  await tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
  success = await tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {
    from: spendingAccount
  });
  receipt = await tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
  balancefrom = await tokenInstance.balanceOf(fromAccount);
  balanceto = await tokenInstance.balanceOf(toAccount);
  allowance = await tokenInstance.allowance(fromAccount, spendingAccount);

  assert.equal(receipt.logs.length, 1, 'triggers one event');
  assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
  assert.equal(
    receipt.logs[0].args._from,
    fromAccount,
    'logs the account the tokens are transferred by'
  );
  assert.equal(
    receipt.logs[0].args._to,
    toAccount,
    'logs the account the tokens are transferred to'
  );
  assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
  assert.equal(balancefrom.toNumber(), 90, 'deducts the amount from the sending account');
  assert.equal(balanceto.toNumber(), 10, 'adds the amount from the receiving account');
  assert.equal(allowance.toNumber(), 0, 'deducts the amount from the amount');
});
