import React, { PureComponent } from 'react'
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import withDrizzleContext from "../../../util/withDrizzleContext";
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';


const styles = theme => ({
  paper: {
    marginTop: "22px",
    padding: "22px"
  },
  inputNumber: {
    width: "60px",
    fontSize: "18px"
  }
});

class SelectDuration extends PureComponent {
  state = {
    errorText: ''
  }

  setMonth = (e) => {
    e.preventDefault();
    const value = Math.abs(Math.floor(Number(e.target.value)));
    this.props.action(value);
  }
  render() {
    const { classes, drizzle, pledge, months } = this.props;
    const { errorText } = this.state;
    const currentPledge = drizzle.web3.utils.fromWei(pledge, 'ether');
    const currentPledgeBN =  drizzle.web3.utils.toBN(pledge);
    const monthsBN = drizzle.web3.utils.toBN(months);
    const prepaid = drizzle.web3.utils.fromWei(
     currentPledgeBN.mul(monthsBN),
      'ether'
    );
    return (
      <Paper className={classes.paper} elevation={1}>
        <Typography variant="title">
          Select the duration of the prepaid subscription
        </Typography>
        <div>
          <Grid container alignItems="center">
            <TextField InputProps={{ className: classes.inputNumber}} type="number" value={months} error={!!errorText.length} helperText={errorText} placeholder="0.001" onChange={this.setMonth} className={classes.textField} margin="normal" />
            <Typography variant="body2" color="primary">Months</Typography>
          </Grid>
          <Typography variant="body1" style={{marginTop: '10px'}}>
            Per month: {currentPledge} ETH
          </Typography>
          <Typography variant="body2" >
            Total amount: {prepaid} ETH
          </Typography>

          <Typography variant="body1" style={{marginTop: '20px'}}>
            Press "Next" button to see the subscription details and support to the content creator.
          </Typography>
        </div>
      </Paper>
    )
  }
}

export default withDrizzleContext(
  withStyles(styles)(SelectDuration)
);
