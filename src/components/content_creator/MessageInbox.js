import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Card, {CardActions, CardContent} from '@material-ui/core/Card';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import withDrizzleContext from "../../util/withDrizzleContextSimple";
import { Link } from "react-router-dom";
import ReactPlaceholder from 'react-placeholder';
import { isDataLoaded } from '../../util/drizzle-utils';
import { getContentCreator } from '../../mecenas-store/ContentCreator';
import Slider from "react-slick";

const styles = theme => ({
  paperWrapper: {
    padding: "12px",
    marginTop: 20,
    maxWidth: "600px"
  },
  paperItem: {
    padding: "12px",
    height: "120px",
    border: "1px solid #e1e1e1",
  },
});

class MessageInbox extends PureComponent {
  state = {
    messages: [],
  }


  async componentWillReceiveProps(nextProps) {
    if (this.state.messages.length == 0) {
      const { classes, theme, drizzleState, drizzle, pointer, isAddress, address} = nextProps
      const drizzleMecenas = drizzle.contracts.Mecenas;
      const web3 = drizzle.web3;
      const mecenasWeb3 = new web3.eth.Contract(drizzleMecenas.abi, drizzleMecenas.address);
      const events = await mecenasWeb3.getPastEvents(
        'newSubscriptionMessage',
        {
          fromBlock: 0,
          toBlock: 'latest',
          filter: {
            contentCreatorAddress: address
          }
        }
      );
      const filteredEvents = events.filter(m => {
        return m.returnValues.contentCreatorAddress == address
      });
      if (filteredEvents.length > 0) {
        this.setState({
          messages: filteredEvents.map(m => {
            const values = m.returnValues;
            return ({
              mecenasNickname: values.mecenasNickname && values.mecenasNickname.length ? web3.utils.hexToUtf8(values.mecenasNickname) : "Anonymous",
              mecenasMessage: values.mecenasMessage
            })
          })
        })
      }
    }
  }
  render() {
    const { classes, theme, drizzleState, drizzle, pointer, isAddress, address } = this.props;
    const { messages } = this.state;
    
    const settings = {
      dots: false,
      arrows: false,
      speed: 500,
      autoplay: true,
      autoplaySpeed: 2000,
      slidesToShow: 1,
      slidesToScroll: 1,
    };


    if (!messages.length) {
      return (
        <Paper className={classes.paperWrapper} elevation={1}>
          <Typography variant="subheading">Latest subscription messages</Typography>
          <Typography align="center" style={{marginTop: "20px"}}>Empty inbox</Typography>
        </Paper>
      )
    }

    const messagesDOM = messages.slice(-3).map((message, index) => (
      <Paper key={index} className={classes.paperItem} elevation={0}>
        <Typography variant="body1">
          {message.mecenasMessage}
        </Typography>
        <Typography variant="body2">
          From: {message.mecenasNickname}
        </Typography>
      </Paper>
    ));

    return (
      <Paper className={classes.paperWrapper} elevation={1}>
        <Typography variant="subheading">Latest subscription messages</Typography>
        <Slider {...settings}>
          {messagesDOM}
        </Slider>
      </Paper>
    )
  }
}

export default withDrizzleContext(
  withStyles(styles)(MessageInbox)
);