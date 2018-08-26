import chai from 'chai';
import 'chai/register-should';
import ChaiAsPromised from 'chai-as-promised';

chai.use(ChaiAsPromised);

  
// Import JS utility library Lodash (https://lodash.com)
import _ from "lodash";
import { minimumPrice, defaultTiers, getTiers, calcAmountAfterFees, timeTravel } from "./mecenas_helpers.js";

const BadgesLedger = artifacts.require("BadgesLedger");

// Solidity error messages
const revertMessage = 'VM Exception while processing transaction: revert';
const invalidAddress = 'invalid address';

contract('BadgesLedger', function (accounts) {
  // Contract owners
  const owner = accounts[0];
  const minter = accounts[1];

  // Contract pointers
  let ledgerContract;

  beforeEach('Initialize a new contract per test', async function () {
    ledgerContract = await BadgesLedger.new();
    // Set the minter address to the owner (can be another contract)
    ledgerContract.setMinterAddress(minter);
  });

  it('initial token supply should be zero', async function() {
    const totalSupply = await ledgerContract.totalSupply.call();
    assert.ok(totalSupply.equals(0));
  });

  it('minter can issue a new token to an account', async function() {
    const currentSupply = await ledgerContract.totalSupply.call();
    const tokenId = currentSupply.plus(1);
    const tokenUri = web3.fromAscii("Gold")
    const subscriber = accounts[2];

    await ledgerContract.mintSubscriptionBadge(subscriber, tokenId, tokenUri, { from: minter });

    // Check new total supply
    const totalSupply = await ledgerContract.totalSupply.call();
    assert.ok(totalSupply.equals(1));
    
    // Check account balance
    const accountBalance = await ledgerContract.balanceOf(subscriber);
    assert.ok(accountBalance.equals(1));
    
    // Check token uri is correct
    const mintedTokenUri = await ledgerContract.tokenURI(tokenId);
    mintedTokenUri.should.equal(tokenUri);
  });
  
  it('other accounts should NOT issue new tokens', async function() {
    const currentSupply = await ledgerContract.totalSupply.call();
    const tokenId = currentSupply.plus(1);
    const tokenUri = web3.fromAscii("Gold")
    const subscriber = accounts[5]

    await ledgerContract.mintSubscriptionBadge(subscriber, tokenId, tokenUri, { from: accounts[5] }).should.be.rejectedWith(revertMessage);

    // Check new total supply
    const totalSupply = await ledgerContract.totalSupply.call();
    assert.ok(totalSupply.equals(0));
    
    // Check account balance
    const accountBalance = await ledgerContract.balanceOf(subscriber);
    assert.ok(accountBalance.equals(0));
    
    // Check token uri is correct
    const mintedTokenUri = await ledgerContract.tokenURI(tokenId).should.be.rejectedWith(revertMessage);
  });
  
  it('owner account should NOT issue tokens', async function() {
    const currentSupply = await ledgerContract.totalSupply();
    const tokenId = currentSupply.plus(1);
    const tokenUri = "Gold"
    const subscriber = accounts[5];

    await ledgerContract.mintSubscriptionBadge(subscriber, tokenId, tokenUri, { from: owner }).should.be.rejectedWith(revertMessage);

    // Check empty total supply
    const totalSupply = await ledgerContract.totalSupply.call();
    assert.ok(totalSupply.equals(0));
    
    // Check empty account balance
    const accountBalance = await ledgerContract.balanceOf(subscriber);
    assert.ok(accountBalance.equals(0));
    
    // Check token uri should revert
    const mintedTokenUri = await ledgerContract.tokenURI(tokenId).should.be.rejectedWith(revertMessage);
  });
  
  it('owner account can set new minter', async function() {
    const newMinter = accounts[5];
    await ledgerContract.setMinterAddress(newMinter, { from: owner });
  });

  it('minter account can NOT set new minter', async function() {
    const newMinter = accounts[6];
    await ledgerContract.setMinterAddress(newMinter, { from: minter }).should.be.rejectedWith(revertMessage);
  })

  it('other accounts can NOT set new minter', async function() {
    const newMinter = accounts[7];
    await ledgerContract.setMinterAddress(newMinter, { from: newMinter }).should.be.rejectedWith(revertMessage);
  })
});