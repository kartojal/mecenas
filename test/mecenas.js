import chai from 'chai';
import 'chai/register-should';
import ChaiAsPromised from 'chai-as-promised';

chai.use(ChaiAsPromised);

  
// Import JS utility library Lodash (https://lodash.com)
import _ from "lodash";
import { minimumPrice, defaultTiers, getTiers, calcAmountAfterFees, timeTravel } from "./mecenas_helpers.js";

// Monkey patch truffle old web3 0.2x bug that fixes web3.toAscii.
// This patch removes all the '\u0000' in the web3.toAscii function.
// toAscii returns \u0000 (null in ascii) with the remaining empty bytes
web3.toAsciiOriginal = web3.toAscii;
web3.toAscii = function (input) { return web3.toAsciiOriginal(input).replace(/\u0000/g, '') }

const Mecenas = artifacts.require("Mecenas");
const BadgesLedger = artifacts.require("BadgesLedger");

// Solidity error messages
const revertMessage = 'VM Exception while processing transaction: revert';
const invalidAddress = 'invalid address';

contract('Mecenas', function (accounts) {
  // Contract owner
  const owner = accounts[0];
  // Contract pointers
  let ledgerContract;
  let mecenasContract;

  // Content Creator mockup, for content creator factory and testing
  const nickname = "Majestic";
  const description = "Majestic Casual is a carefully selected collection of things we admire. Thanks for your support. \n - https://twitter.com/majesticcasual \n - https://www.youtube.com/user/majesticcasual/";
  const ipfsAvatar = "";

  // Content creator properties, for later easier conversion from Solidity struct array to Javascript object, with lodash _.zipObject method.
  const contentCreatorProperties = ["nickname", "description", "creationTimestamp", "payday", "balance", "ipfsAvatar", "totalMecenas"];

  // In each test the contracts are deployed again, recovering the initial state.
  beforeEach('Initialize a new contract per test', async function () {
    ledgerContract = await BadgesLedger.new();
    mecenasContract = await Mecenas.new();
    ledgerContract.setMinterAddress(mecenasContract.address);
    mecenasContract.setBadgesLedgerContract(ledgerContract.address);
  });

  it("should be instantiated and have an owner", async function() {
    assert.equal(await mecenasContract.owner(), owner);
  });

  it("should be instantiated and a minimum amount must be 0.000606 ETH", async function() {
    const contractMinimumAmount = await mecenasContract.getMinimumAmount();
    assert.equal(contractMinimumAmount, web3.toWei(minimumPrice, 'ether'));
  });

  it("should create a new content creator", async function() {
    // Create content creator, using account[1]
    const response =  await mecenasContract.contentCreatorFactory(nickname, description, ipfsAvatar, { from: accounts[1] });

    // Get the new account[1] content creator (returns array from struct)
    const arrayContentCreator = await mecenasContract.getContentCreator(accounts[1])

    // Build a content creator object from the contract method that returns an array.
    const contentCreator = _.zipObject(contentCreatorProperties, arrayContentCreator);
    
    const asciiName = web3.toAscii(contentCreator.nickname);
    // Check if correctly inserted
    assert.equal(asciiName, nickname);
    assert.equal(contentCreator.description, description);
    assert.equal(contentCreator.ipfsAvatar, ipfsAvatar);
    assert.equal(contentCreator.totalMecenas, 0);
  });

  it("should generate default tiers when new content creator", async function() {
    // Create content creator, using account[1]
    const response =  await mecenasContract.contentCreatorFactory(nickname, description, ipfsAvatar, { from: accounts[1] }); 

    // Retrieve number of tiers
    const tiersLength = await mecenasContract.getTiersLength(accounts[1]);

    // By default, there is 3 tiers.
    assert.equal(tiersLength.toNumber(), 3);
    
    const tiers = await getTiers(mecenasContract, accounts[1], tiersLength.toNumber());

    assert.deepEqual(tiers, defaultTiers);
  });

  it("should allow mecenas to subscribe for 3 months and receive a Platinum ERC721 token", async function() {
    const contentCreatorAddress = accounts[1];
    const mecenasAddress = accounts[2];
    const months = 3;
    const message = "Your content is great! Keep it up!";
    const mecenasNickname = web3.fromAscii("MariCarmen91");
    const amount = web3.toWei(0.3, "ether");
    // Calculate future content creator total balance, after fees
    const totalAfterFees = calcAmountAfterFees(web3.toBigNumber(amount));
    const amountPerMonth = totalAfterFees.dividedBy(months);

    // Create content creator, using account[1]
    await mecenasContract.contentCreatorFactory(nickname, description, ipfsAvatar, { from: contentCreatorAddress });
    
    // Support content creator via payable function. Sends 1 ether for 3 months of subscription.
    await mecenasContract.supportContentCreator(contentCreatorAddress, months, message, mecenasNickname, {value: amount, from: mecenasAddress});
    const mecenasTokenBalance = await ledgerContract.balanceOf(mecenasAddress);

    const mecenasTokenUri = await ledgerContract.tokenURI(1, { from: mecenasAddress });
    // Mecenas now should have one SUB token
    assert.ok(mecenasTokenBalance.equals(1));
    // Mecenas SUB token should have the Platinum level in the token URI
    mecenasTokenUri.should.equal("Platinum");

    // Retrieve content creator
    const contentCreatorRaw = await mecenasContract.getContentCreator(contentCreatorAddress);
    const contentCreator = _.zipObject(contentCreatorProperties, contentCreatorRaw);

    // Retrieve next Content Creator wage amount
    const nextContentCreatorWage = await mecenasContract.calculateNextWage(contentCreatorAddress);
    
    // Check content creator balance
    assert.ok(contentCreator.balance.toNumber() > 0);
    // New balance must be equal to totalAfterFees variable
    assert.ok(totalAfterFees.equals(contentCreator.balance));
    // Content creator wage must be equal to amountPerMonth variable
    assert.ok(nextContentCreatorWage.equals(amountPerMonth));
  });

  it("should allow content creator to withdraw the next wage", async function() {
    const contentCreatorAddress = accounts[1];
    const months = 1;
    const message = "Love your song lists! Keep it up!";
    const mecenasNickname = web3.fromAscii("Kartojal");
    const amount = web3.toWei(0.10, "ether");

    // Calculate future content creator total balance, after fees
    const totalAfterFees = calcAmountAfterFees(web3.toBigNumber(amount));
    const amountPerMonth = totalAfterFees.dividedBy(months);

    // Create content creator, using account[1]
    await mecenasContract.contentCreatorFactory(nickname, description, ipfsAvatar, { from: accounts[1] });
    
    // Support content creator via payable function. Sends 0.10 Ether for 1 subscription
    await mecenasContract.supportContentCreator(contentCreatorAddress, months, message, mecenasNickname, {value: amount, from: accounts[2]});

    const oldCreatorBalance = web3.fromWei(await web3.eth.getBalance(contentCreatorAddress), "ether"); 

    // Travel to one month later
    await timeTravel(2629747);
    // Manipulate time to one month
    await mecenasContract.monthlyWithdraw({ from: contentCreatorAddress});
    const newBalance = await web3.eth.getBalance(contentCreatorAddress);
    // Balance should be greater than old balance
    assert.ok(newBalance.gt(oldCreatorBalance));

    // Retrieve content creator
    const contentCreatorRaw = await mecenasContract.getContentCreator(contentCreatorAddress);
    const contentCreator = _.zipObject(contentCreatorProperties, contentCreatorRaw);
    // New balance in contract should be zero
    assert.ok(contentCreator.balance.equals(0));
  })

  it("should withdraw owner contract fees correctly", async function() {
    const oldOwnerBalance = web3.eth.getBalance(owner);
    const contentCreatorAddress = accounts[1];
    const months = 1;
    const message = "Love your song lists! Keep it up!";
    const mecenasNickname = web3.fromAscii("Feriante");
    const amount = web3.toWei(10, "ether");

    // Create content creator, using account[1]
    await mecenasContract.contentCreatorFactory(nickname, description, ipfsAvatar, { from: accounts[1] });

    // An user supports a content creator via payable function. Sends 0.1 Ether for 1 subscription
    await mecenasContract.supportContentCreator(contentCreatorAddress, months, message, mecenasNickname, {value: amount, from: accounts[2]});

    // Contract owner withdraws all fees
    await mecenasContract.withdrawFees({from: owner});

    // Now owner balance should have more Ether (fees are greater than gas cost)
    const newOwnerBalance = web3.eth.getBalance(owner);
    assert.ok(newOwnerBalance.gt(oldOwnerBalance));

    // Check internal contract balance is 0
    const contractOwnerBalanceAfterWithdraw = await mecenasContract.ownerBalance.call({from: owner});
    assert.ok(contractOwnerBalanceAfterWithdraw.equals(0));
  });

  it("should NOT allow content creator to withdraw the next wage before 1 month", async function() {
    const contentCreatorAddress = accounts[1];
    const months = 3;
    const message = "You should add this Juan Rios song! Juan RIOS - praia";
    const mecenasNickname = web3.fromAscii("Anonymous");
    const amount = web3.toWei(0.4, "ether");
    // Calculate future content creator total balance, after fees
    const totalAfterFees = calcAmountAfterFees(web3.toBigNumber(amount));

    // Create content creator, using account[1]
    await mecenasContract.contentCreatorFactory(nickname, description, ipfsAvatar, { from: accounts[1] });
    
    // Support content creator via payable function. Sends 1.2 Ether for 3 months.
    await mecenasContract.supportContentCreator(contentCreatorAddress, months, message, mecenasNickname, {value: amount, from: accounts[2]});

    // Get creator balance before calling the contract
    const oldCreatorBalance = await web3.eth.getBalance(contentCreatorAddress);

    // Retrieve content creator data before withdraw
    const contentCreatorBefore = _.zipObject(contentCreatorProperties, await mecenasContract.getContentCreator(contentCreatorAddress));

    // Travel to one day later
    await timeTravel(86400);

    // Withdrawal should fail because it didnt pass one month
    const response = await mecenasContract.monthlyWithdraw({ from: contentCreatorAddress}).should.be.rejectedWith(revertMessage);   

    // Content creator account balance should be less than before, because gas costs of the failed withdrawal
    const balanceAfterBadWithdraw = await web3.eth.getBalance(contentCreatorAddress);
    assert.ok(balanceAfterBadWithdraw.lessThan(oldCreatorBalance));
    
    // Retrieve content creator after error in withdrawal
    const contentCreatorAfter = _.zipObject(contentCreatorProperties, await mecenasContract.getContentCreator(contentCreatorAddress));
    // Balance in contract should be the same;
    assert.ok(contentCreatorAfter.balance.equals(contentCreatorBefore.balance));
    // Payday in contract should be the same;
    assert.ok(contentCreatorAfter.payday.equals(contentCreatorBefore.payday));
  });


  it("should NOT allow content creator to withdraw two times after 1 month", async function() {
    const contentCreatorAddress = accounts[1];
    const months = 3;
    const message = "You rocks!";
    const mecenasNickname = web3.fromAscii("Anonymous");
    const amount = web3.toWei(0.03, "ether");
    // Calculate future content creator total balance, after fees
    const totalAfterFees = calcAmountAfterFees(web3.toBigNumber(amount));

    // Create content creator, using account[1]
    await mecenasContract.contentCreatorFactory(nickname, description, ipfsAvatar, { from: accounts[1] });
    
    // Support content creator via payable function. Sends 1.2 Ether for 3 months.
    await mecenasContract.supportContentCreator(contentCreatorAddress, months, message, mecenasNickname, {value: amount, from: accounts[2]});

    // Travel to payday! (One month + 1 second)
    await timeTravel(2592001);

    // Withdrawal should work
    const response = await mecenasContract.monthlyWithdraw({ from: contentCreatorAddress}).should.not.be.rejectedWith(revertMessage);   
    
    // Try to withdraw one more time before payday, the same day as the first withdrawal
    const badWithdraw = await mecenasContract.monthlyWithdraw({ from: contentCreatorAddress}).should.be.rejectedWith(revertMessage);   
  });

  it("should NOT allow external user to withdraw the owner fees", async function() {
    await mecenasContract.withdrawFees({ from: accounts[1] }).should.be.rejectedWith(revertMessage);
  })
  
  it("should NOT allow external user to set new badger ledger contract", async function() {
    const piratedLedger = await BadgesLedger.new();
    await mecenasContract.setBadgesLedgerContract(piratedLedger.address, { from: accounts[5] }).should.be.rejectedWith(revertMessage);
  })

  it("should NOT allow external user to set a new contract fee", async function() {
    const oldFeePercent = await mecenasContract.feePercent.call();
    const oldFixedFee = await mecenasContract.fixedFee.call();
    await mecenasContract.setFixedFee(web3.toWei(10, "ether"), { from: accounts[5] }).should.be.rejectedWith(revertMessage);
    await mecenasContract.setPercentFee(10, { from: accounts[5] }).should.be.rejectedWith(revertMessage);
    const feePercent = await mecenasContract.feePercent.call();
    const fixedFee = await mecenasContract.fixedFee.call();

    assert.ok(oldFeePercent.equals(feePercent));
    assert.ok(oldFixedFee.equals(fixedFee));
  });


});