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
import defaultAvatar from '../../default_avatar.png'

const styles = theme => ({
  top: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    marginTop: 20,
  },
  bar: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 1.6,
    paddingBottom: theme.spacing.unit * 1.6,
    marginTop: 20,
  },
  contentCreatorAvatar: {
    margin: "0 auto",
    width: 120,
    height: 120
  },
  contentCreatorTitle: {
    'text-align': 'center',
    'text-decoration-color': theme.palette.secondary["main"],
    'text-decoration': 'underline'
  },
  stats: {
    display: 'flex',
    'align-items': "center",
    'justify-content': "center"
  },
  supportButton: {
    color: "white",
    [theme.breakpoints.down('xs')]: {
      padding: '15px 10px',
      width: '95%',
      margin: '0 auto'
    },
  },
});

class Top extends PureComponent {
  render() {
    const { classes, theme, drizzleState, drizzle, pointer, isAddress } = this.props;

    const loaded = isAddress ?
      isDataLoaded(drizzleState, pointer, 'getContentCreator', 'Mecenas') :
      isDataLoaded(drizzleState, pointer, 'getContentCreatorByNickname', 'Mecenas')

    const contentCreator = getContentCreator(drizzleState, pointer, isAddress);
    const profileUrl = !!contentCreator.ipfsAvatar.length ? `https://ipfs.io/ipfs/${contentCreator.ipfsAvatar}` : defaultAvatar;

    return (
      <Paper className={classes.top} elevation={1}>
        <ReactPlaceholder  showLoadingAnimation className={classNames(classes.avatar, classes.contentCreatorAvatar)} type='round' ready={loaded} color='#E0E0E0' style={{ width: 100, height: 100 }}>
          <Avatar
            className={classNames(classes.avatar, classes.contentCreatorAvatar)}
            alt="Content creator name"
            src={profileUrl}
          />
        </ReactPlaceholder>
        <div style={{'margin': '15px 0px'}}>
          <ReactPlaceholder showLoadingAnimation type='textRow' ready={loaded} color='#E0E0E0'>
            <Link to={`/${contentCreator.nickname}`}>
              <h1 className={classes.contentCreatorTitle} style={{color: "black"}}>
                {contentCreator.nickname}
              </h1>
            </Link>
          </ReactPlaceholder>
        </div>
      </Paper>
    )
  }
}

export default withDrizzleContext(
  withStyles(styles)(Top)
);