import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import ReactPlaceholder from 'react-placeholder';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import withDrizzleContext from "../../../util/withDrizzleContextSimple";
import { getContentCreator } from '../../../mecenas-store/ContentCreator';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import PureTier from './PureTier';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
  tier: {
    margin: "22px 0px",
    padding: "12px",
    cursor: "pointer"
  },
  formControl: {
    margin: theme.spacing.unit * 3,
  },
  group: {
    margin: `${theme.spacing.unit}px 0`,
  },
});

class Tier extends PureComponent {
  state = {
    loaded: false,
    tiers: [],
    errorText: "",
    minimumFee: 0,
  }
  constructor(props) {
    super(props);
  }
  async componentDidUpdate() {
    const loaded = this.state.loaded;
    if (!loaded) {
      const { drizzle, index, address } = this.props;

      const mecenas = drizzle.contracts.Mecenas;
      const rawMinimumFee = await mecenas.methods.getMinimumAmount().call();
      const rawTiers = await Promise.all([
        mecenas.methods.getTier(address, drizzle.web3.utils.toBN(0)).call(),
        mecenas.methods.getTier(address, drizzle.web3.utils.toBN(1)).call(),
        mecenas.methods.getTier(address, drizzle.web3.utils.toBN(2)).call(),
      ]);

      const tiers = rawTiers.map(tier => ({
        title: tier.title,
        description: tier.description,
        price: tier.price !== "0" ? drizzle.web3.utils.fromWei(tier.price, 'ether') : 0,
      }));
      
      this.setState({
        tiers,
        loaded: true,
        minimumFee: rawMinimumFee
      });
      this.props.setTier(this.props.defaultIndex, this.props.drizzle.web3.utils.toWei(tiers[this.props.defaultIndex].price, 'ether'));
    }
  }

  setDefaultTier = (e) => {
    e.preventDefault();
    if (this.props.currentTier !== 3) {
      this.props.setTier(3, this.props.drizzle.web3.utils.toWei('0.15', 'ether'));
    }
  }

  setCustomPledge = (e) => {
    e.preventDefault();
    const value = e.target.value;
    const etherMinimumFee = this.props.drizzle.web3.utils.fromWei(this.state.minimumFee, 'ether');
    this.props.setCustomPledge(value);
    if (!!value && value.length > 0 && value !== "0." && !isNaN(value)) {
      try {
        const weiAmount = this.props.drizzle.web3.utils.toWei(value, "ether");
        const bgMinimumFee = this.props.drizzle.web3.utils.toBN(this.state.minimumFee);
        const bgAmount = this.props.drizzle.web3.utils.toBN(weiAmount);
        // If is greater than zero and greater than the minimum owner contract fee.
        if (bgAmount.gt(0) && bgAmount.gt(bgMinimumFee)) {
          this.props.setCustomPledge(weiAmount);
          this.setState({
            errorText: ""
          })
          return;
        }
      } catch (err) {
        this.setState({
          errorText: `Must be a valid positive number and greater than the minimum fee (${etherMinimumFee} ETH).`
        })
      }
      
    }
    this.setState({
      errorText: `Must be a valid positive number and greater than the minimum fee (${etherMinimumFee} ETH).`
    })
  }

  render() {
    const { classes, currentTier, setTier, drizzle, customPledge } = this.props;
    const { tiers, loaded, errorText } = this.state; 
    let pledge = customPledge;
    const renderTiers = tiers.map((tier, index) => (
      <PureTier index={index.toString()} tier={tier} key={index} action={setTier} currentTier={currentTier} />
    ));
    const isCustomActive = currentTier == 3;
    try {
      pledge = !!customPledge && customPledge.length > 0 && customPledge !== "0." && !isNaN(customPledge) ? drizzle.web3.utils.fromWei(customPledge, 'ether') : customPledge;
    } catch(err) {
      console.log(err);
    }
    return (
      <div>
        {renderTiers}
        <Paper className={classes.tier} onClick={this.setDefaultTier} elevation={1} style={isCustomActive ? {border: "1px solid orange"} : {}}>
          <FormControlLabel checked={isCustomActive} control={<Radio />} label="Custom tier" />
          <Typography variant="body2">Pledge a custom amount per month to the content creator.</Typography>
          { isCustomActive && (
            <TextField value={pledge} error={!!errorText.length} helperText={errorText} placeholder="0.001" label="Ether amount per month" onChange={this.setCustomPledge} className={classes.textField} InputLabelProps={{ shrink: true }} margin="normal" />
          )}
        </Paper>
      </div>
    )
  }
}

export default withDrizzleContext(
  withStyles(styles)(Tier)
);