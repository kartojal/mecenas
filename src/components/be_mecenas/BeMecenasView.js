import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import classNames from 'classnames';
import Divider from '@material-ui/core/Divider';
import _ from "lodash";
import Grid from '@material-ui/core/Grid';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import MetamaskLogoPath from '../../metamask_logo.svg';
import StepLabel from '@material-ui/core/StepLabel';
import ReactPlaceholder from 'react-placeholder';

// Core components
import Top from './Top';
// Stepper components
import SelectTier from './stepper/0_SelectTier';
import SelectDuration from './stepper/1_SelectDuration';
import CreateMessage from './stepper/2_CreateMessage';
import Subscribe from './stepper/3_Subscribe';

import withDrizzleContext from "../../util/withDrizzleContext";
import { getContentCreator } from '../../mecenas-store/ContentCreator';

const styles = theme => ({
  gridContainer: {
    [theme.breakpoints.up('md')]: {
      margin: "0 240px",
    },
    [theme.breakpoints.down('md')]: {
      margin: "0 30px",
    },
    instructions: {
      marginTop: theme.spacing.unit,
      marginBottom: theme.spacing.unit,
    },
  },
  button: {
    marginTop: theme.spacing.unit,
  },
  buttonNext: {
    marginTop: theme.spacing.unit,
    marginLeft: theme.spacing.unit
  },
  meta: {
    width: '300px'
  }
});

class BeMecenas extends Component {
    state =  {
      activeStep: 0,
      isAddress: false,
      pointer: "",
      tier: 0,
      months: 3,
      customPledge: "0",
      name: "Anonymous",
      message: "Thanks for your content. Sent you some crypto-support!"
    }

  handleNext = () => {
    const { activeStep } = this.state;
    if (activeStep < 3) {
      this.setState({
        activeStep: activeStep + 1,
      });
    }
  };

  handleBack = () => {
    const { activeStep } = this.state;
    if (activeStep > 0) {
      this.setState({
        activeStep: activeStep - 1,
      });
    }
  };

  handleReset = () => {
    this.setState({
      activeStep: 0,
    });
  };

  selectTier = (tier, pledge) => {
    this.setState({
      tier: tier,
      customPledge: pledge
    });
  }

  selectCustomPledge = (wei) => {
    this.setState({
      customPledge: wei 
    })
  }
  selectMonths = (months) => {
    this.setState({months: months})
  }

  setMessage = (message) => {
    this.setState({message: message})
  }

  setName = (name) => {
    this.setState({name: name});
  }

  async componentDidMount() {
    const {drizzle, drizzleState} = this.props;
    const routerId = this.props.match.params.contentCreator;
    if (drizzle.web3.utils.isAddress(routerId)) {
        const contentCreatorPointer = drizzle.contracts.Mecenas.methods.getContentCreator.cacheCall(routerId)
        this.setState({
          pointer: contentCreatorPointer,
          address: routerId,
          isAddress: true,
        });
        return;
    }

    const mecenas = drizzle.contracts.Mecenas;
    const rawNickname = drizzle.web3.utils.asciiToHex(routerId);
    const contentCreatorPointer = drizzle.contracts.Mecenas.methods.getContentCreatorByNickname.cacheCall(rawNickname)
    const address = await mecenas.methods.getContentCreatorAddress(rawNickname).call()
    this.setState({
      pointer: contentCreatorPointer,
      address: address,
      isAddress: false
    });
  }
  
  render() {
    const {classes, drizzleState, location} = this.props;
    const { activeStep, address, months, tier, customPledge, pointer, isAddress, name, message } = this.state;
    const routerId = this.props.match.params.contentCreator;
    const contentCreator = getContentCreator(drizzleState, pointer, isAddress);
    const creator = contentCreator.nickname ? contentCreator.nickname : 'creator';
    const steps = ['Select tier level', 'Set duration of subscription', 'Your message', 'Subscribe'];
    const params = new URLSearchParams(location.search);
    const defaultIndex = params.has('tier') ? params.get('tier') : 0;
  
    if (Object.keys(drizzleState.accounts).length === 0) {
      return (
        <div style={{padding: "140px 0px", display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
          <img src={MetamaskLogoPath} className={classes.meta}/>
          <Typography variant="display1" align="center">Please unlock Metamask to show contract data and be able to support the content creators.</Typography>
        </div>
      )
    }

    return (
      <div className={classes.gridContainer} >
        <Grid container spacing={24}>
            <Grid item xs={12}>
              <Top pointer={pointer} isAddress={isAddress} />
              <Stepper activeStep={activeStep} elevation={1} style={{marginTop: "20px"}}>
                {steps.map((label, index) => {
                  return (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  )
                })}
              </Stepper>
              
              {
                activeStep == 0 && (
                  <SelectTier defaultIndex={defaultIndex} address={address} setTier={this.selectTier} setCustomPledge={this.selectCustomPledge} currentTier={tier} customPledge={customPledge}/>
                )
              }
              {
                activeStep == 1 && (
                  <SelectDuration action={this.selectMonths} pledge={customPledge} months={months}/>
                )
              }
              {
                activeStep == 2 && (
                  <CreateMessage setName={this.setName} setMessage={this.setMessage} creator={creator} name={name} message={message}/>
                )
              }
              {
                activeStep == 3 && (
                  <Subscribe tier={tier} months={months} pledge={customPledge} address={address} creator={creator} name={name} message={message}/>
                )
              }
              <div>
                <Button className={classes.button} disabled={activeStep == 0} variant="contained" color="primary" onClick={this.handleBack} >
                  Back
                </Button>
                <Button className={classes.buttonNext} disabled={activeStep == 3} variant="contained" color="primary" onClick={this.handleNext} >
                  Next
                </Button>
              </div>
            </Grid>
        </Grid>
      </div>
    )
  }
}
 
export default withDrizzleContext(
  withStyles(styles)(BeMecenas)
);