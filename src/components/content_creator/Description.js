import React, {PureComponent} from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import withDrizzleContext from '../../util/withDrizzleContextSimple';
import ReactPlaceholder from 'react-placeholder';

import { isDataLoaded } from '../../util/drizzle-utils';
import { getContentCreator } from '../../mecenas-store/ContentCreator';

const styles = theme => ({
  description: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    marginTop: 20,
    minHeight: 160
  },
})
class Description extends PureComponent {

  render() {
    const {drizzleState, pointer, isAddress, classes} = this.props;

    const contentCreator = getContentCreator(drizzleState, pointer, isAddress);
    const loaded = isAddress ?
      isDataLoaded(drizzleState, pointer, 'getContentCreator', 'Mecenas') :
      isDataLoaded(drizzleState, pointer, 'getContentCreatorByNickname', 'Mecenas')

    return (
      <Paper className={classes.description} elevation={1}>
        <ReactPlaceholder showLoadingAnimation rows={16} ready={loaded}>
          <Typography>
            {contentCreator.description}
          </Typography>
        </ReactPlaceholder>
      </Paper>
    )
  }
}
 
export default withDrizzleContext(
  withStyles(styles)(Description)
);