export default function parseDrizzleError(errorMsg) {
  switch(true) {
    case /out of gas/.test(errorMsg):
      return 'Transaction ran out of gas. Please provide more gas and try again';
    default: 
      return 'An error occurred. Please check your arguments or raise gas limit and try again';
  }
}