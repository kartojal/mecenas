import Promise from "bluebird";

/* 
* Utilities and functions for test/mecenas.js and test/badgesLedger.js.
* 
*/

const jsonrpc = '2.0'
const id = 0

const send = (method, params = []) => web3.currentProvider.send({ id, jsonrpc, method, params })

/*
  A function to increase the current time in N seconds.
 Source: https://medium.com/coinmonks/testing-time-dependent-logic-in-ethereum-smart-contracts-1b24845c7f72
 **/

export const timeTravel = async seconds => {
  await send('evm_increaseTime', [seconds])
  await send('evm_mine')
}

export const minimumPrice = 0.000606;
export const fixedFee = web3.toBigNumber(web3.toWei(0.0006 , 'ether'));
export const percentFee = 1;
export const defaultTiers = [
  {
    title: "Silver",
    description: "You will receive a Silver badge token in compensation, ocassional extra content like making-off videos or photos. And a lot of love.",
    price: '0.010606'
  }, {
    title: "Gold",
    description: "You will receive a Gold badge token in compensation, extra video content and audio commentary of new and old videos. And a lot of love.",
    price: '0.020606'
  }, {
    title: "Platinum",
    description: "You will receive a Gold badge token in compensation, all of above and access to an exclusive forum, where i will reply to any question you want to ask to me. And a lot of love.",
    price: '0.050606'
  }
];

export function calcAmountAfterFees (bigNumberAmount) {
  const fee = fixedFee.plus(bigNumberAmount.mul(percentFee).dividedBy(100));
  return bigNumberAmount.minus(fee);
}

// Get all three tiers in parallel via Bluebird Promises library
export async function getTiers(contract, contentCreatorAddress, length) {
   // Content creator Tier properties, for later easier conversion from Solidity Struct array to Javascript object, with lodash _.zipObject method.
   const tierProperties = ["title", "description", "price"];

  if (!length || length == 0) {
    return [];
  }
  const parallelJobs = [];

  // For each tier, make an async call (promise) to the contract to grab each tier individually
  for (let index = 0; index < length; index++) {
    const promise = contract.getTier(contentCreatorAddress, index);
    parallelJobs.push(promise);
  }
  // Wait the array of promises to be finished
  const rawTiers = await Promise.all(parallelJobs);
  // Parse array of "raw arrays" of tiers into a more readable array of Javascript objects
  return rawTiers.map(rawTier => {
    const tier = _.zipObject(tierProperties, rawTier);
    tier.price = web3.fromWei(tier.price, 'ether').toString();
    return tier;
  });
}
