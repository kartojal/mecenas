import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import withDrizzleContext from "../../../util/withDrizzleContext";
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import MetamaskLogoPath from '../../../metamask_logo.svg';
import Helpers from '../../../util/helpers';
import parseDrizzleError from '../../../util/parseDrizzleError';
const styles = theme => ({
  paper: {
    marginTop: "22px",
    padding: "22px"
  },
  button: {
    margin: "10px 0"
  },
  logo: {
    width: "100px"
  }
});

class Subscribe extends Component {
  state = {
    errorText: '',
    transaction: null
  }
  constructor(props) {
    super(props);
    this.handlePayment = this.handlePayment.bind(this);
  }

  async handlePayment() {
    const {address, months, pledge, message, name, drizzle, drizzleState} = this.props;
    const web3 = drizzle.web3;
    const nameHex =  web3.utils.asciiToHex(name);
    const currentPledgeBN =  web3.utils.toBN(pledge);
    const monthsBN = web3.utils.toBN(months);
    const totalAmount = currentPledgeBN.mul(monthsBN);
    const supportContentCreator = drizzle.contracts.Mecenas.methods['supportContentCreator'];
    // TODO: Do all the needed checks
    if (true) {
      // Estimate gas limit
      const solidityParams = [address, months, message, nameHex];
      const options = {
        from: drizzleState.accounts[0],
        value: totalAmount,
      }
      const estimatedGas = await supportContentCreator(...solidityParams).estimateGas(options)
      options.gas = estimatedGas;
      solidityParams.push(options);
      // Call to Smart Contract to create a new Content Creator
      const transactionId = supportContentCreator.cacheSend(...solidityParams);
      // Set transaction stack index
      this.setState({ transaction: transactionId })
    }
  }

  render() {
    const { classes, drizzle, drizzleState, pledge, months, name, message, creator } = this.props;
    const { transaction } = this.state;
    const currentPledge = drizzle.web3.utils.fromWei(pledge, 'ether');
    const currentPledgeBN =  drizzle.web3.utils.toBN(pledge);
    const monthsBN = drizzle.web3.utils.toBN(months);
    const prepaid = drizzle.web3.utils.fromWei(
     currentPledgeBN.mul(monthsBN),
      'ether'
    );

    let transactionStatus = "";
    let transactionError = "";
    if (transaction >= 0) {
      const txHash = drizzleState.transactionStack[transaction]
      if (drizzleState.transactions[txHash]) {
        transactionStatus = Helpers.capitalize(drizzleState.transactions[txHash].status);
      }
      if (transactionStatus == "Error") {
        transactionError = parseDrizzleError(drizzleState.transactions[txHash].error.message);
      }
      if (transactionStatus == "Success") {
        // TODO:
      }
    }
    return (
      <Paper className={classes.paper} elevation={1}>
        <Typography variant="title">
          Subscription summary
        </Typography>
        <Typography variant="body2" style={{marginTop: '10px'}}>
          · Duration: {months} months
        </Typography>
        <Typography variant="body2" style={{marginTop: '10px'}}>
          · Per month: {currentPledge} ETH
        </Typography>
        <Typography variant="body2" style={{marginTop: '10px'}}>
          · Total amount: {prepaid} ETH
        </Typography>

        <Typography variant="body1" style={{marginTop: '20px'}}>
          Click the button below to make the Ether deposit and support the content creator:
        </Typography>
        <Grid container alignItems="center">
          <img src={MetamaskLogoPath} className={classes.logo}/>
          <Button className={classes.button} variant="contained" color="primary" onClick={this.handlePayment} >
            Make payment with Metamask
          </Button>

          { this.state.transaction >= 0 && transactionStatus && 
            <div>
              Transaction status: {transactionStatus}
              { transactionError.length > 0 &&
                <div className={classes.transError}>
                  {transactionError}
                </div>
              }
            </div>
          }
        </Grid>
      </Paper>
    )
  }
}

export default withDrizzleContext(
  withStyles(styles)(Subscribe)
);
