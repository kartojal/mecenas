const isDataLoaded = (drizzleState, pointer, methodName, contractName) =>
  pointer in drizzleState.contracts[contractName][methodName]

export {
  isDataLoaded
}