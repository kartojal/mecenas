import React, { PureComponent } from 'react'
import { withStyles } from '@material-ui/core/styles';
import ReactPlaceholder from 'react-placeholder';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import withDrizzleContext from "../../../util/withDrizzleContext";

const styles = theme => ({
  tier: {
    padding: "12px",
    margin: "22px 0px",
    cursor: "pointer"
  },
});

class PureTier extends PureComponent {

  clickHandler = (e) => {
    e.preventDefault();
    const { price } = this.props.tier;
    const weiPrice = this.props.drizzle.web3.utils.toWei(price, "ether");
    this.props.action(this.props.index, weiPrice);
  }
  render() {
    const { classes, tier, index, currentTier, action } = this.props;
    const { title, price, description} = tier;
    const isActive = currentTier == index;
    return (
      <Paper className={classes.tier} onClick={this.clickHandler} elevation={1} style={isActive ? {border: "1px solid orange"} : {}}>
        <FormControlLabel checked={isActive} control={<Radio />} label={title} />
        <Typography variant="subheading">{price} ETH per month</Typography>
        <Typography variant="body2">{description}</Typography>
      </Paper>
    )
  }
}

export default withDrizzleContext(
  withStyles(styles)(PureTier)
);