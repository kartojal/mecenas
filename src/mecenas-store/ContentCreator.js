import web3 from 'web3';
import _ from 'lodash';

const contentCreatorFactory = () => ({
  nickname: '',
  totalMecenas: '0',
  wage: '0',
  balance: '0',
  description: '',
  ipfsAvatar: '',
  payday: ''
});

const formatContentCreator = (contentCreator) => {
  const newContentCreator = _.cloneDeep(contentCreator);

  // Format for be readable by the browser
  newContentCreator.nickname = contentCreator.nickname.length ? web3.utils.hexToUtf8(contentCreator.nickname) : "";
  newContentCreator.balance = web3.utils.fromWei(contentCreator.balance, "ether");
  newContentCreator.wage = web3.utils.fromWei(contentCreator.wage, "ether");
  newContentCreator.totalMecenas = contentCreator.totalMecenas.toString();
  newContentCreator.payday = new Date(contentCreator.payday * 1000);
  
  return newContentCreator;
}

const getContentCreatorByNickname = (drizzleState, pointer) => {
  const mecenasState = drizzleState.contracts.Mecenas;
  const contentCreator = contentCreatorFactory();
  if (pointer in mecenasState.getContentCreatorByNickname) {
    const rawContentCreator = _.merge(contentCreator, _.pick(mecenasState.getContentCreatorByNickname[pointer].value, Object.keys(contentCreator)))
    return formatContentCreator(rawContentCreator);
  }
  return contentCreator;
}

const getContentCreatorByAddress = (drizzleState, pointer) => {
  const mecenasState = drizzleState.contracts.Mecenas;
  const contentCreator = contentCreatorFactory();
  if (pointer in mecenasState.getContentCreator) {
    const rawContentCreator = _.merge(contentCreator, _.pick(mecenasState.getContentCreator[pointer].value, Object.keys(contentCreator)))
    return formatContentCreator(rawContentCreator);
  }
  return contentCreator;
}
const getContentCreator = (drizzleState, pointer, isAddress) =>
  isAddress ?
    getContentCreatorByAddress(drizzleState, pointer) :
    getContentCreatorByNickname(drizzleState, pointer)


const isFoundByAddress = (drizzleState, pointer) => {
  return _.hasIn(drizzleState, ["contracts", "Mecenas", "getContentCreator", pointer, "error"]);
}

const isFoundByNickname = (drizzleState, pointer) => {
  const mecenasState = drizzleState.contracts.Mecenas;
  if (pointer in mecenasState.getContentCreatorByNickname) {
    const isFound =  !_.hasIn(mecenasState, ["getContentCreatorByNickname", pointer, "error"])
    return isFound == true ? "found" : "not_found";
  }
  return "loading";
}

const isFound = (drizzleState, pointer, isAddress) => 
  isAddress ?
    isFoundByAddress(drizzleState, pointer) :
    isFoundByNickname(drizzleState, pointer)

export {
  contentCreatorFactory,
  getContentCreator,
  isFound
}