import React, {PureComponent} from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import withDrizzleContext from '../../util/withDrizzleContextSimple';
import ReactPlaceholder from 'react-placeholder';
import Grid from '@material-ui/core/Grid';

import { isDataLoaded } from '../../util/drizzle-utils';
import { getContentCreator } from '../../mecenas-store/ContentCreator';
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  TelegramIcon,
  WhatsappIcon,
  LinkedinIcon,
  EmailIcon
} from 'react-share';

const styles = theme => ({
  papers: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    marginTop: 20,
  },
})
class LeftSidebar extends PureComponent {

  render() {
    const {drizzleState, pointer, isAddress, classes} = this.props;
    const shareTitle = "Check out this content creator at Mecenas dapp, and show some support!"

    const contentCreator = getContentCreator(drizzleState, pointer, isAddress);
    const loaded = isAddress ?
      isDataLoaded(drizzleState, pointer, 'getContentCreator', 'Mecenas') :
      isDataLoaded(drizzleState, pointer, 'getContentCreatorByNickname', 'Mecenas')

    return (
      <div>
        <Paper className={classes.papers} elevation={1}>
          <ReactPlaceholder showLoadingAnimation rows={16} ready={loaded}>
            <Typography>
              Total balance:
            </Typography>
            <Typography variant="subheading" >
              {contentCreator.balance} ETH
            </Typography>
          </ReactPlaceholder>
        </Paper>
        <Paper className={classes.papers} elevation={1} justify="center">
          <Typography variant="body2">
            Share this profile
          </Typography>
          <Grid container>
            <FacebookShareButton quote={shareTitle} hashtag="#ethereum" url={window.location.href}>
              <FacebookIcon
                size={32}
                round />
            </FacebookShareButton>
            <LinkedinShareButton title={shareTitle} url={window.location.href}>
               <LinkedinIcon
                size={32}
                round />
            </LinkedinShareButton>
            <TwitterShareButton title={shareTitle} hashtag={["#ethereum"]} url={window.location.href}>
              <TwitterIcon
                size={32}
                round />
            </TwitterShareButton>
            <TelegramShareButton title={shareTitle} url={window.location.href}>
              <TelegramIcon
                size={32}
                round />
            </TelegramShareButton>
            <WhatsappShareButton title={shareTitle} separator=" --> " url={window.location.href}>
              <WhatsappIcon
                size={32}
                round />
            </WhatsappShareButton>
            <EmailShareButton url={window.location.href} subject={shareTitle} body="You can click in the below link to check this content creator profile.">
              <EmailIcon
                size={32}
                round />
            </EmailShareButton>
          </Grid>
        </Paper>
      </div>
    )
  }
}
 
export default withDrizzleContext(
  withStyles(styles)(LeftSidebar)
);