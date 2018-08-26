import React, { Component } from 'react'
import withDrizzleContext from "../../util/withDrizzleContext";
import { Link, Redirect } from 'react-router'
import Helpers from '../../util/helpers';
import parseDrizzleError from '../../util/parseDrizzleError';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import classNames from 'classnames';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import IpfsUpload from './IpfsUpload';

// Get byte length from utf8 string (thanks to https://stackoverflow.com/questions/5515869/string-length-in-bytes-in-javascript)
function byteLength(str) {
  // returns the byte length of an utf8 string
  var s = str.length;
  for (var i=str.length-1; i>=0; i--) {
    var code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) s++;
    else if (code > 0x7ff && code <= 0xffff) s+=2;
    if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
  }
  return s;
}

const styles = theme => ({
  registry: {
    padding: "90px 0px"
  },
  formContainer: {
    padding: '5px',
    'border-radius': '2px',
    border: '1px solid #black',
    margin: '0 auto',
    'max-width': '680px',
    'width': '100%',
  },
  textForms: {
    [theme.breakpoints.down('xs')]: {
      marginTop: 30,
    },
  },
  flexDiv: {
    display: 'flex',
    'justify-content': 'flex-end',
    'align-items': 'center',
    [theme.breakpoints.down('xs')]: {
      'justify-content': 'flex-start'
    }
  },
  textField: {
    marginTop: 0,
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '280px'
  },
  input: {
    "background-color": "#eee"
  },
  label: {
    'margin': '0 10px',
  },
  description: {
  },
  title: {
    "text-align": "center"
  },
  button: {
    "background-color": "#fda941",
    margin: "3px 45px",
    [theme.breakpoints.down('xs')]: {
      margin: "5px",
      width: "100%"
    }
  }
})

class Registry extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.sendArgs = {
      from: props.drizzleState.accounts[0]
    }

    this.state = {
      nickname: "",
      description: "",
      ipfsHash: "",
      nicknameError: "",
      transaction: -1,
    }
  }
  
  async handleSubmit() {
    const web3 = this.props.drizzle.web3;
    const contentCreatorFactory = this.props.drizzle.contracts.Mecenas.methods['contentCreatorFactory'];
    const { nickname, description, ipfsHash, nicknameError} = this.state;
    const nicknameHex = web3.utils.utf8ToHex(nickname);
    
    if (!nicknameError && nickname && description && this.sendArgs) {
      // Estimate gas limit
      const params = [nicknameHex, description, ipfsHash];
      const options = {
        from: this.props.drizzleState.accounts[0],
      }
      const gasEstimation = await contentCreatorFactory(...params).estimateGas(options)
      // Call to Smart Contract to create a new Content Creator
      options.gas = gasEstimation;
      params.push(options)
      const transactionId = contentCreatorFactory.cacheSend(...params);
      // Set transaction stack index
      this.setState({ transaction: transactionId })
    }
  }

  async handleInputChange(event) {
    if (event && event.target) {
      const field = event.target.name;
      const value = event.target.value;

      this.setState({ [field]: value});
      if (field == "nickname") {
        this.setState({nicknameError: ""})
        const {drizzle, drizzleState} = this.props;
        try {
          const isNewNickname = await drizzle.contracts.Mecenas.methods.contentCreatorAddresses(drizzle.web3.utils.utf8ToHex(value)).call()
          if (isNewNickname != "0x0000000000000000000000000000000000000000") {
            this.setState({nicknameError: "Nickname is being currently used. Try another nickname."})
          }
          if (drizzleState.accounts[0]) {
            const isAddressUnique = await drizzle.contracts.Mecenas.methods.contentCreators(drizzleState.accounts[0]).call()
            if (isAddressUnique && isAddressUnique.payday != 0) {
              this.setState({nicknameError: "Your Ethereum address is being currently used."})
            }
          }
        } catch(e) {
          this.setState({nicknameError: "Nickname or address is used. Please try again with a new one."})
        }
        // TODO: If already exists and set nicknameError 
      }
    }
  }
  onUpload = (ipfsHash) => {
    this.setState({
      ipfsHash: ipfsHash
    })
  }

  render() {
    const { classes, drizzleState} = this.props;
    const { nickname, description, ipfsHash, nicknameError} = this.state;
    let transactionStatus = "";
    let transactionError = "";
    if (this.state.transaction >= 0) {
      const txHash = drizzleState.transactionStack[this.state.transaction]
      if (drizzleState.transactions[txHash]) {
        transactionStatus = Helpers.capitalize(drizzleState.transactions[txHash].status);
      }
      if (transactionStatus == "Error") {
        transactionError = parseDrizzleError(drizzleState.transactions[txHash].error.message);
      }
      if (transactionStatus == "Success") {
        return <Redirect to={`/${this.state.nickname}`}/>
      }
    }
    const metamaskIsLocked = Object.keys(drizzleState.accounts).length === 0;
    const anyError = !nickname.length || !description.length || isNickTooLarge || metamaskIsLocked || nicknameError.length > 0;
    const isNickTooLarge = byteLength(this.state.nickname) > 32;
    return (
      <div className={classes.registry}>
        <h1 className={classes.title}>Create your profile</h1>
        <form className={classNames("MuiPaper-elevation2-18", classes.formContainer)} noValidate autoComplete="off">
          <Grid container>
            <Grid item xs={12} sm={6}>
              <IpfsUpload onUpload={this.onUpload}/>
            </Grid>
            <Grid item xs={12} sm={6} className={classes.textForms}>
              <Typography className={classes.label}>Name*</Typography>
              <TextField
                name="nickname"
                required
                className={classes.textField}
                InputLabelProps={{
                  className: classes.label
                }}
                InputProps={{
                  className: classes.input
                }}
                value={this.state.nickname}
                onChange={this.handleInputChange}
                margin="normal"
              />
              { isNickTooLarge && (
                <Typography variant="caption" color="error">
                  Please use less characters. Nickname too big to store in Ethereum. 
                </Typography>
              )}
              {
                nicknameError.length > 0 && (
                 <Typography variant="caption" color="error">
                  {nicknameError}
                </Typography>
                )
              }
              <Typography className={classes.label} style={{marginTop: 30}}>Description*</Typography>
              <TextField
                name="description"
                required
                multiline
                rows="6"
                InputLabelProps={{
                  className: classes.label
                }}
                InputProps={{
                  className: classes.input
                }}
                value={this.state.description}
                onChange={this.handleInputChange}
                className={classNames(classes.textField, classes.description)}
                margin="normal"
              />
            </Grid>
          </Grid>
          <div className={classes.flexDiv}>
            {metamaskIsLocked && (
              <Typography variant="caption">
                Metamask is locked. Please unlock it.
              </Typography>
            )}
            <Button disabled={anyError} variant="raised" className={classes.button} onClick={this.handleSubmit}>
              Register
            </Button>
          </div>
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
        </form>
      </div>
    )
  }
}

export default withDrizzleContext(
  withStyles(styles)(Registry)
);
